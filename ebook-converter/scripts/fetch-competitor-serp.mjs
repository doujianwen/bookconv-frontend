// scripts/fetch-competitor-serp.mjs
// Track where our rival domains rank for a fixed set of target keywords.
//
// This is the data the "竞品关键词变化" table needs — something the project did
// NOT have before (geo/competitors.csv only has occurrence counts; the SERP
// snapshot is a single day). We record, per keyword, the rank of each rival
// domain in the organic SERP, then build-competitor-series.mjs stitches the
// daily snapshots into a comparable time series.
//
// SERP source (set ONE env var; we never scrape raw HTML):
//   SERPAPI_KEY        → SerpApi Google results (https://serpapi.com)
//   BING_WEB_SEARCH_KEY→ Bing Web Search API v7 (Ocp-Apim-Subscription-Key)
//
// Without a key the script explains what to do and exits 0 — it never fakes data.
//
// Output: 数据分析/competitor-serp-<YYYY-MM-DD>.json  (one file per day, overwrites)
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DATA_DIR = join(ROOT, '数据分析');
const CONFIG = join(ROOT, 'data', 'competitor-config.json');
const OUT = join(DATA_DIR, `competitor-serp-${new Date().toISOString().slice(0, 10)}.json`);

function hostOf(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Google sometimes serves a result as a redirect wrapper
// (`https://www.google.com/goto?url=<opaque>` / `.../url?sa=t&...&url=<opaque>`).
// The opaque payload is NOT a readable URL, but SerpApi also returns
// `displayed_link` — the human-facing breadcrumb ("https://www.freeconvert.com ›
// ebook-converter") — from which the real origin and path can be recovered.
//
// MEASURED 2026-11-02 (this file): matching on `link` alone missed 11 of 23
// real competitor hits (blind 12 vs goto-aware 23 over 19 monitored queries) and
// produced 7 FALSE "gone" rows — rivals that were actually still ranking.
// Blind matching reads the wrapper's host ("google.com") and scores every such
// rival as rank=0, i.e. "outside the observed window" — a false negative that
// then shows up next week as a fabricated ranking collapse.
//
// So: resolve the true host through `displayed_link` whenever `link` is a
// wrapper. Never let a wrapper degrade into "not found" — if we cannot resolve
// it, we must say UNKNOWN rather than invent a rank.
function isRedirectWrapper(link) {
  return /(^|\.)google\.[a-z.]+\/(goto|url)\?/i.test(link || '');
}

/** The real landing URL for an organic result, unwrapping Google redirects. */
function resolveUrl(o) {
  const link = o?.link || '';
  if (!isRedirectWrapper(link)) return link || null;
  const dl = o?.displayed_link || '';
  if (!dl) return null;
  const parts = dl.split('›').map((s) => s.trim()).filter(Boolean);
  if (!parts.length) return null;
  const origin = parts[0];
  // Breadcrumb crumbs are path segments; drop query-ish ones ("id=...", "detail").
  const crumbs = parts
    .slice(1)
    .filter((p) => !p.includes('=') && !p.includes('?') && !/^detail$/i.test(p));
  return origin.replace(/\/+$/, '') + (crumbs.length ? '/' + crumbs.join('/') : '/');
}

/** The real hostname for an organic result, unwrapping Google redirects. */
function hostOfResult(o) {
  const link = o?.link || '';
  if (!isRedirectWrapper(link)) return hostOf(link);
  const real = resolveUrl(o);
  return real ? hostOf(real) : '';
}

// FIXED 2026-11-04 (red-team finding, see docs/竞品①-谁在抢同一个答案-2026-11-04.md §六):
// until today we only recorded the rank of the five FRESHLY-CONFIGURED rival
// domains. Every other organic result was thrown away, so a keyword where all
// five rivals happened to be absent wrote `all null` — which reads as
// "no competitor" but actually means "we never looked". On 2026-11-04 that was
// 12 of 23 keywords, each with 5–9 organic rows we could not name.
//
// `topDomains` keeps the first N organic rows as they came: host + rank + url.
// It does not change any rank we already publish (purely additive field), but it
// makes the "who owns this answer" question answerable at all.
//
// A row whose wrapper cannot be resolved is kept with `domain: ''` on purpose:
// dropping it would silently shorten the list and hide a real SERP slot.
export function topDomainsOf(organic, limit = 10) {
  const rows = Array.isArray(organic) ? organic : [];
  return rows.slice(0, limit).map((o, i) => ({
    rank: i + 1,
    domain: hostOfResult(o) || '',
    url: resolveUrl(o),
  }));
}

// Self-test: the wrapper-unwrapping must keep working. A silent regression here
// does not crash — it just starts under-reporting rivals again, which is
// indistinguishable from "rivals dropped out" downstream. So we assert it here
// and fail loudly instead of publishing a quiet lie.
//
// Fixture shape taken from a real SerpApi response captured 2026-11-02:
//   link          = https://www.google.com/goto?url=<opaque>
//   displayed_link= https://www.freeconvert.com › ebook-converter
function selfTest() {
  const cases = [
    {
      name: 'goto wrapper is unwrapped',
      o: {
        link: 'https://www.google.com/goto?url=CAESZgHrOzAV5cMxc4Oy3wnq9nrlOLvg4OGgL8',
        displayed_link: 'https://www.freeconvert.com › ebook-converter',
      },
      wantHost: 'freeconvert.com',
      wantUrl: 'https://www.freeconvert.com/ebook-converter',
    },
    {
      name: 'bare-origin wrapper is unwrapped',
      o: {
        link: 'https://www.google.com/goto?url=CAESVQHrOzAVhXHcJdOo9lqnrC6AeozjLi1UsI',
        displayed_link: 'https://calibre-ebook.com',
      },
      wantHost: 'calibre-ebook.com',
      wantUrl: 'https://calibre-ebook.com/',
    },
    {
      name: 'plain link passes through',
      o: { link: 'https://cloudconvert.com/ebook-converter' },
      wantHost: 'cloudconvert.com',
      wantUrl: 'https://cloudconvert.com/ebook-converter',
    },
  ];
  const failures = [];
  for (const c of cases) {
    const gotHost = hostOfResult(c.o);
    const gotUrl = resolveUrl(c.o);
    if (gotHost !== c.wantHost) failures.push(`${c.name}: host got "${gotHost}" want "${c.wantHost}"`);
    if (gotUrl !== c.wantUrl) failures.push(`${c.name}: url got "${gotUrl}" want "${c.wantUrl}"`);
    // The naive matcher must be the one that fails, otherwise the fixture no
    // longer proves the bug is fixed.
    if (c.o.link.includes('/goto?') && hostOf(c.o.link) === c.wantHost) {
      failures.push(`${c.name}: fixture no longer reproduces the blind-matcher bug`);
    }
  }
  // topDomains must survive refactors: the 2026-11-04 fix depends on it keeping
  // non-configured domains AND unresolved rows (as '') instead of trimming them.
  const organicFixture = [
    { link: 'https://www.google.com/goto?url=CAESZgHrOzAV5cMx', displayed_link: 'https://www.freeconvert.com › ebook-converter' },
    { link: 'https://www.google.com/goto?url=CAESVQHrOzAV5cMx' }, // wrapper, no breadcrumb → host unknown
    { link: 'https://epubor.com/best-ebook-converter.html' },
    { link: 'https://bookconv.com/convert/epub-to-pdf' },
  ];
  const td = topDomainsOf(organicFixture, 10);
  const wantTd = ['freeconvert.com', '', 'epubor.com', 'bookconv.com'];
  if (td.length !== wantTd.length) {
    failures.push(`topDomains: length got ${td.length} want ${wantTd.length}`);
  } else {
    td.forEach((row, i) => {
      if (row.domain !== wantTd[i]) failures.push(`topDomains[${i}].domain got "${row.domain}" want "${wantTd[i]}"`);
      if (row.rank !== i + 1) failures.push(`topDomains[${i}].rank got ${row.rank} want ${i + 1}`);
    });
  }
  // A refactor that filters out empty hosts would still pass the case above only
  // if it also kept positions 1:1; assert the count explicitly so a "drop
  // unknown" regression cannot slip through as a shorter, cleaner-looking list.
  if (topDomainsOf(organicFixture, 2).length !== 2) {
    failures.push('topDomains: limit 2 did not return 2 rows');
  }

  // The request string itself is a comparability contract: if it silently
  // changes, every Δ across the change is suspect. Only assertable when no
  // locale env is set (with them set, the string legitimately grows).
  if (!process.env.SERPAPI_GL && !process.env.SERPAPI_HL && !process.env.SERPAPI_LOCATION) {
    const wantParams = 'engine=google&q=ebook%20reader%20app&num=100';
    const gotParams = serpParams('ebook reader app');
    if (gotParams !== wantParams) {
      failures.push(`serpParams: request string changed\n      got  "${gotParams}"\n      want "${wantParams}"`);
    }
  }

  if (failures.length) {
    console.error('✗ SerpApi 匹配器自检失败（拒绝抓取，避免发布被污染的排名）：');
    for (const f of failures) console.error(`    - ${f}`);
    process.exit(1);
  }
}

function loadConfig() {
  if (!existsSync(CONFIG)) {
    console.error(`✗ 缺少配置 ${CONFIG}（应从 git 拉到）。`);
    process.exit(1);
  }
  const c = JSON.parse(readFileSync(CONFIG, 'utf8'));
  if (!Array.isArray(c.competitors) || !Array.isArray(c.keywords)) {
    console.error('✗ competitor-config.json 必须有 competitors[] 和 keywords[]');
    process.exit(1);
  }
  return c;
}

// Load .env (gitignored, holds SERP keys) so the script runs without
// `--env-file`. Never overrides an already-set process.env value.
function loadDotEnv() {
  const p = join(ROOT, '.env');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

// RECORDED 2026-11-04: the request used to send only `engine/q/num`, so SerpApi
// picked its own default locale per call. Snapshots recorded neither the locale
// nor which key produced them, which makes a two-day Δ unattributable: on
// 2026-11-02→04 six keywords moved hard (epub to pdf 0→4 rivals) while four
// others stayed pixel-identical. Both "Google really moved" and "we asked from a
// different locale" fit that evidence.
//
// Fix is opt-in and additive: if SERPAPI_GL / SERPAPI_HL / SERPAPI_LOCATION are
// set they are now actually sent (and recorded in the snapshot). Left unset the
// request string is byte-identical to before, so this does NOT silently
// re-baseline the history. Setting them later IS a regime change — bump
// methodVersion when you do.
//
// NOTE (red-team 2026-11-04): a first draft built this with URLSearchParams,
// which encodes spaces as `+` (`q=ebook+reader+app`) instead of `%20`. That is
// legal form-encoding and probably fine — but "probably fine" is not "identical",
// and a changed request string is exactly the kind of silent regime change this
// snapshot series cannot survive. So we assemble it by hand and assert the exact
// string in selfTest().
function serpParams(q) {
  const parts = ['engine=google', `q=${encodeURIComponent(q)}`, 'num=100'];
  if (process.env.SERPAPI_GL) parts.push(`gl=${encodeURIComponent(process.env.SERPAPI_GL)}`);
  if (process.env.SERPAPI_HL) parts.push(`hl=${encodeURIComponent(process.env.SERPAPI_HL)}`);
  if (process.env.SERPAPI_LOCATION) parts.push(`location=${encodeURIComponent(process.env.SERPAPI_LOCATION)}`);
  return parts.join('&');
}

async function serpapiRanks(q, competitors, key, ownDomain) {
  const url = `https://serpapi.com/search.json?${serpParams(q)}&api_key=${key}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`SerpApi ${r.status}`);
  const j = await r.json();
  const organic = Array.isArray(j.organic_results) ? j.organic_results : [];
  const rankings = competitors.map((c) => {
    const idx = organic.findIndex((o) => hostOfResult(o) === c.domain);
    return { domain: c.domain, name: c.name, rank: idx >= 0 ? idx + 1 : 0, url: idx >= 0 ? resolveUrl(organic[idx]) : null };
  });
  // Own-domain rank: tracks where BOOKCONV itself ranks for each target
  // keyword, so "BookConv 出局头部" stops being an inference and becomes a
  // measured rank. Added 2026-10-26 (red-team M-7). rank=0 = outside observed
  // window, same caveat as rivals — NOT "not in top 100".
  const ownIdx = ownDomain ? organic.findIndex((o) => hostOfResult(o) === ownDomain) : -1;
  const ownRank = ownIdx >= 0 ? ownIdx + 1 : 0;
  const ownUrl = ownIdx >= 0 ? resolveUrl(organic[ownIdx]) : null;
  // MEASURED 2026-10-19: we ask for num=100 but SerpApi returns only 8-10
  // organic rows for these head queries. So rank=0 does NOT mean "not in the
  // top 100" — it means "outside the observed window", whose depth we did not
  // record before. Depth is recorded now so a shallow day is visible instead of
  // being silently read as a real ranking change.
  return { rankings, observedDepth: organic.length, requestedDepth: 100, ownRank, ownUrl, topDomains: topDomainsOf(organic) };
}

async function bingRanks(q, competitors, key, ownDomain) {
  const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(q)}&count=100`;
  const r = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': key } });
  if (!r.ok) throw new Error(`Bing ${r.status}`);
  const j = await r.json();
  const vals = j.webPages?.value || [];
  const rankings = competitors.map((c) => {
    const idx = vals.findIndex((v) => hostOf(v.url) === c.domain);
    return { domain: c.domain, name: c.name, rank: idx >= 0 ? idx + 1 : 0, url: idx >= 0 ? vals[idx].url : null };
  });
  const ownIdx = ownDomain ? vals.findIndex((v) => hostOf(v.url) === ownDomain) : -1;
  const ownRank = ownIdx >= 0 ? ownIdx + 1 : 0;
  const ownUrl = ownIdx >= 0 ? vals[ownIdx].url : null;
  return { rankings, observedDepth: vals.length, requestedDepth: 100, ownRank, ownUrl, topDomains: topDomainsOf(vals) };
}

// Historical hit counts from earlier snapshots, so "today found fewer rivals
// than usual" can be told apart from "today's rivals genuinely moved".
function priorHitCounts() {
  if (!existsSync(DATA_DIR)) return [];
  return readdirSync(DATA_DIR)
    .filter((f) => /^competitor-serp-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .filter((f) => f !==`competitor-serp-${new Date().toISOString().slice(0, 10)}.json`)
    .map((f) => {
      try {
        const s = JSON.parse(readFileSync(join(DATA_DIR, f), 'utf8'));
        return (s.results || []).reduce((a, x) => a + (x.rankings || []).filter((r) => r.rank > 0).length, 0);
      } catch {
        return null;
      }
    })
    .filter((n) => typeof n === 'number')
    .sort((a, b) => a - b);
}

function median(xs) {
  if (!xs.length) return null;
  const m = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[m] : (xs[m - 1] + xs[m]) / 2;
}

async function main() {
  loadDotEnv();
  selfTest();
  // `--self-test` runs the matcher assertions only and exits BEFORE any network
  // call, so the checks can be run in CI / before a red-team review without
  // burning SerpApi credits. Without it the old behaviour is unchanged.
  if (process.argv.includes('--self-test')) {
    console.log('✓ selfTest 通过：goto 包装解包 + topDomains 提取（未发起任何网络请求）');
    return;
  }
  const cfg = loadConfig();
  const keys = [process.env.SERPAPI_KEY, process.env.SERPAPI_KEY_2].filter(Boolean);
  const bingKey = process.env.BING_WEB_SEARCH_KEY;

  if (keys.length === 0 && !bingKey) {
    console.error('✗ 未配置 SERP 数据源，无法抓取竞品排名。');
    console.error('');
    console.error('  设置以下其一（或写入 .env）后重跑：');
    console.error('    SERPAPI_KEY=xxx        # SerpApi Google 结果（支持 SERPAPI_KEY_2 轮换）');
    console.error('    BING_WEB_SEARCH_KEY=xxx# Bing Web Search API v7');
    console.error('');
    console.error('  这是真实数据，没有 key 我不会编造。配置好后：');
    console.error('    node scripts/fetch-competitor-serp.mjs');
    console.error('    node scripts/build-competitor-series.mjs');
    process.exit(0);
  }

  const source = keys.length ? 'serpapi' : 'bing';
  const fetchRanks = keys.length ? serpapiRanks : bingRanks;
  let ki = 0;
  const nextKey = () => { const k = keys[ki % keys.length]; ki++; return k; };
  const srcNote = keys.length > 1 ? `serpapi (${keys.length} keys 轮换)` : source;
  const ownDomain = cfg.ownDomain || null;

  console.log(`SERP 源：${srcNote} · 词 ${cfg.keywords.length} 个 · 竞品 ${cfg.competitors.length} 个${ownDomain ? ` · 本站 ${ownDomain}` : ''}`);
  const results = [];
  const keyLog = [];
  let fetchErrors = 0;
  for (const q of cfg.keywords) {
    try {
      const keyIdx = ki % keys.length;
      const { rankings, observedDepth, requestedDepth, ownRank, ownUrl, topDomains } = await fetchRanks(q, cfg.competitors, nextKey(), ownDomain);
      const found = rankings.filter((r) => r.rank > 0).map((r) => `${r.name}#${r.rank}`).join(', ') || '无';
      const top = (topDomains || []).slice(0, 3).map((d) => d.domain || 'UNRESOLVED').join(' > ') || '—';
      const ownStr = ownRank > 0 ? ` · 本站 #${ownRank}` : ' · 本站 —';
      console.log(`  · ${q} → ${found}${observedDepth < requestedDepth ? `（观测深度 ${observedDepth}/${requestedDepth}）` : ''}${ownStr} · 头部 ${top}`);
      keyLog.push({ query: q, keyIndex: keyIdx });
      results.push({ query: q, rankings, observedDepth, requestedDepth, ownRank, ownUrl, topDomains });
    } catch (e) {
      fetchErrors++;
      console.error(`  ✗ ${q} 抓取失败：${e.message}`);
      results.push({
        query: q,
        rankings: cfg.competitors.map((c) => ({ ...c, rank: 0, url: null })),
        observedDepth: 0,
        requestedDepth: 100,
        ownRank: 0,
        ownUrl: null,
        topDomains: [],
        error: e.message,
      });
    }
  }

  // ---- quality gate -------------------------------------------------------
  // A day where the rivals are absent can mean two very different things:
  //   (a) they really dropped out of the observed window, or
  //   (b) the window itself came back shallow / the provider throttled us.
  // Case (b) silently poisons next week's Δ, because "prevRank = null" then
  // reads as "new entrant". We cannot always tell them apart, so we refuse to
  // write a snapshot that is indistinguishable from a provider failure.
  const totalHits = results.reduce((a, x) => a + x.rankings.filter((r) => r.rank > 0).length, 0);
  const depths = results.map((r) => r.observedDepth ?? 0);
  const minDepth = depths.length ? Math.min(...depths) : 0;
  const prior = priorHitCounts();
  const priorMedian = median(prior);
  const reasons = [];
  if (fetchErrors > 0) reasons.push(`${fetchErrors} 个词抓取报错`);
  if (results.length > 0 && minDepth === 0) reasons.push('存在观测深度为 0 的词（结果集为空，非「未进 Top-100」）');
  // Only compare against history once we actually have some; with no prior
  // snapshots the median is null and this must stay UNKNOWN, never FAIL.
  if (priorMedian !== null && priorMedian > 0 && totalHits < priorMedian * 0.4) {
    reasons.push(`命中 ${totalHits} 明显低于历史中位数 ${priorMedian}（前 ${prior.length} 份快照）`);
  }
  if (reasons.length) {
    console.error('');
    console.error(`✗ 快照质量异常，拒绝写入 ${OUT}：`);
    for (const r of reasons) console.error(`    - ${r}`);
    console.error('');
    console.error('  这很可能是数据源限流/降级，而不是竞品真的集体掉出排名。');
    console.error('  写入它会让下周的Δ 把「无前期基准」误读成「新进入Top-100」。');
    console.error('  处理：确认额度与网络后重跑；历史快照不受影响。');
    process.exit(1);
  }

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const snapshot = {
    date: new Date().toISOString().slice(0, 10),
    fetchedAt: new Date().toISOString(),
    source,
    ownDomain: ownDomain || null,
    // Which matching method produced these ranks. Snapshots before
    // 2026-11-02 used the naive `hostOf(link)` matcher, which silently MISSED
    // every rival whose SerpApi link is a `google.com/goto?url=…` redirect
    // wrapper — a false negative, not a real absence. Mixing those snapshots
    // with goto-aware ones would make "rival appeared" look like a genuine
    // entrance. build-competitor-series.mjs refuses to publish such a Δ.
    methodVersion: 'goto-aware-v2',
    // Everything needed to decide whether two snapshots are comparable.
    // gl/hl/location = null means "we did not pin the locale", i.e. the provider
    // chose it per call — a cross-day Δ then cannot be attributed to Google.
    collection: {
      engine: keys.length ? 'google' : 'bing-web-v7',
      num: 100,
      gl: process.env.SERPAPI_GL || null,
      hl: process.env.SERPAPI_HL || null,
      location: process.env.SERPAPI_LOCATION || null,
      keys: keys.length,
      keyIndexByQuery: keyLog,
      topDomainsPerQuery: 10,
      note: 'gl/hl/location 为 null = 未固定（脚本默认行为，SerpApi 用其默认地区）；未固定时跨日 Δ 不可归因到真实排名变化。keyIndexByQuery 用于排查「不同 key 返回不同 SERP」。',
    },
    quality: {
      hits: totalHits,
      minObservedDepth: minDepth,
      maxObservedDepth: depths.length ? Math.max(...depths) : 0,
      requestedDepth: 100,
      priorHitMedian: priorMedian,
      note: '观测深度来自 SerpApi 实际返回的 organic_results 条数，通常远小于 requestedDepth；rank=0 表示「未进入观测窗口」，不等于「未进 Top-100」。',
    },
    results,
  };
  writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  console.log(`\n✓ 快照已写：${OUT}`);
  console.log(`  命中 ${totalHits} · 观测深度 ${minDepth}–${Math.max(...depths, 0)} / 100`);
  console.log('  下一步：node scripts/build-competitor-series.mjs');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
