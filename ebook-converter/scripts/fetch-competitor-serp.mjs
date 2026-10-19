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

async function serpapiRanks(q, competitors, key) {
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&num=100&api_key=${key}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`SerpApi ${r.status}`);
  const j = await r.json();
  const organic = Array.isArray(j.organic_results) ? j.organic_results : [];
  const rankings = competitors.map((c) => {
    const idx = organic.findIndex((o) => hostOf(o.link) === c.domain);
    return { domain: c.domain, name: c.name, rank: idx >= 0 ? idx + 1 : 0, url: idx >= 0 ? organic[idx].link : null };
  });
  // MEASURED 2026-10-19: we ask for num=100 but SerpApi returns only 8-10
  // organic rows for these head queries. So rank=0 does NOT mean "not in the
  // top 100" — it means "outside the observed window", whose depth we did not
  // record before. Depth is recorded now so a shallow day is visible instead of
  // being silently read as a real ranking change.
  return { rankings, observedDepth: organic.length, requestedDepth: 100 };
}

async function bingRanks(q, competitors, key) {
  const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(q)}&count=100`;
  const r = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': key } });
  if (!r.ok) throw new Error(`Bing ${r.status}`);
  const j = await r.json();
  const vals = j.webPages?.value || [];
  const rankings = competitors.map((c) => {
    const idx = vals.findIndex((v) => hostOf(v.url) === c.domain);
    return { domain: c.domain, name: c.name, rank: idx >= 0 ? idx + 1 : 0, url: idx >= 0 ? vals[idx].url : null };
  });
  return { rankings, observedDepth: vals.length, requestedDepth: 100 };
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

  console.log(`SERP 源：${srcNote} · 词 ${cfg.keywords.length} 个 · 竞品 ${cfg.competitors.length} 个`);
  const results = [];
  let fetchErrors = 0;
  for (const q of cfg.keywords) {
    try {
      const { rankings, observedDepth, requestedDepth } = await fetchRanks(q, cfg.competitors, nextKey());
      const found = rankings.filter((r) => r.rank > 0).map((r) => `${r.name}#${r.rank}`).join(', ') || '无';
      console.log(`  · ${q} → ${found}${observedDepth < requestedDepth ? `（观测深度 ${observedDepth}/${requestedDepth}）` : ''}`);
      results.push({ query: q, rankings, observedDepth, requestedDepth });
    } catch (e) {
      fetchErrors++;
      console.error(`  ✗ ${q} 抓取失败：${e.message}`);
      results.push({
        query: q,
        rankings: cfg.competitors.map((c) => ({ ...c, rank: 0, url: null })),
        observedDepth: 0,
        requestedDepth: 100,
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
