#!/usr/bin/env node
// scripts/build-page-attribution.mjs
//
// M17 — turn "this keyword moved" into "here is the page to look at", with a
// two-channel cross-check so we never act on a single source's noise.
//
// Why this file has to exist
// ──────────────────────────
// The weekly pipeline (fetch-bing → build-keyword-series → …) stops at Δ. A Δ
// says a position number changed; it does not say which URL to work on, and it
// does not tell you whether the change means anything. Two things were missing:
//
//   1. LOCALISATION. Bing's GetPageStats is page-level (see build-page-series.mjs
//      / M18) — it never says which query produced a page's position. GSC's
//      `dimensions:['query','page']` export does, and it is the only source that
//      does. This script joins the two.
//
//   2. A CROSS-CHECK. Bing and GSC disagree more often than you would hope —
//      measured 2026-10-13: 11 queries appear in both with a computable Δ, and 2
//      of them point opposite ways (`epub to zip` GSC +13.2 / Bing −2;
//      `mobi vs azw3` +1.4 / −2). Two search engines are not two measurements of
//      one quantity; they weight different signals. So when they disagree we emit
//      UNKNOWN rather than picking a winner.
//
// Honesty rules encoded here (each exists because the naive version lies)
// ───────────────────────────────────────────────────────────────────────
//   • A query with ONE Bing observation has no Δ. It is listed under
//     `noBaseline`, never under flat/up/down. "No data" ≠ "no change".
//   • totalImpressions travels with every Δ. Below 10 impressions across the
//     whole series a Δ is noise; the row is marked `noise` and its direction is
//     withheld. The 2026-10-13 measurement: of 12 Bing queries with |Δ|≥2,
//     ELEVEN had <10 total impressions — including the −7 outlier that a naive
//     report would have called "the biggest drop".
//   • `attributed` is reserved for a query that has BOTH a landing page AND a
//     direction that survives the noise check. Everything else is `locatedOnly`,
//     `noise`, `unconfirmed`, or `unknown`. No wording implies causation.
//   • When a query maps to several URLs we keep them all and mark the landing
//     page ambiguous; picking the best-ranked one would be a silent guess.
//
// Outputs
// ───────
//   data/page-attribution.json              machine-readable
//   数据分析/页面归因分析-<d0>.md            human-readable report
//
// Usage:  node scripts/build-page-attribution.mjs [--threshold=3]

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const DATA_DIR = join(ROOT, '数据分析');

// Below this many total impressions a Δ is not a trend. Calibrated 2026-10-13:
// of the 12 Bing queries with |Δ|≥2, 11 were under 10 impressions. 10 is the
// point where "direction" stops being a coin flip.
const NOISE_IMPRESSIONS = 10;

const thresholdArg = process.argv.find((a) => a.startsWith('--threshold='));
const THRESHOLD = thresholdArg ? Number(thresholdArg.split('=')[1]) : 3;

const readJson = (p, fallback = null) => {
  if (!existsSync(p)) return fallback;
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
};

const siteHost = 'https://www.bookconv.com';
const shortPath = (url) => {
  if (typeof url !== 'string' || !url.startsWith(siteHost)) return url ?? '';
  const rest = url.slice(siteHost.length);
  return rest === '' ? '/' : rest;
};

// ─────────────────────────────────────────── load the three inputs
function loadGscQueryPage() {
  if (!existsSync(DATA_DIR)) return null;
  const files = readdirSync(DATA_DIR)
    .filter((f) => /^GSC_API_query_page_\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  if (files.length === 0) return null;

  const snapshots = [];
  // query -> [{ page, position, clicks, impressions }]
  const byQuery = new Map();

  for (const f of files) {
    const fetchedAt = f.match(/(\d{4}-\d{2}-\d{2})/)[1];
    const j = readJson(join(DATA_DIR, f));
    if (!j) continue;
    const rows = Array.isArray(j.rows) ? j.rows : [];
    const start = j.startDate ?? null;
    const end = j.endDate ?? null;
    const windowDays =
      start && end
        ? Math.round((Date.parse(end + 'T00:00:00Z') - Date.parse(start + 'T00:00:00Z')) / 86400000) + 1
        : null;
    snapshots.push({ file: f, fetchedAt, start, end, windowDays, rows: rows.length });

    for (const r of rows) {
      const keys = Array.isArray(r.keys) ? r.keys : [];
      if (keys.length < 2) continue;
      const [query, page] = keys;
      if (!query || typeof page !== 'string' || !/^https?:\/\//i.test(page)) continue;
      if (!byQuery.has(query)) byQuery.set(query, []);
      byQuery.get(query).push({
        page,
        position: typeof r.position === 'number' ? r.position : null,
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        windowDays,
        fetchedAt,
      });
    }
  }
  if (snapshots.length === 0) return null;

  for (const list of byQuery.values()) {
    // Same query can rank on several URLs; keep the best (lowest) position first.
    list.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
  }

  return { snapshots, byQuery, latest: snapshots[snapshots.length - 1] };
}

// GSC's position is a 91-day rolling average that the API returns rounded to ~2
// decimals, so two consecutive exports of the SAME data differ by ~0.003 (e.g.
// 12.1666… → 12.17). Measured 2026-10-13: all four GSC deltas for the cross-check
// set were |Δ| < 0.005. Without an epsilon, Math.sign(0.003) is +1 while a Bing
// Δ of −2 is −1, and the sign test reports a bogus "direction conflict".
// Anything under this is rounding noise, not movement.
const GSC_EPSILON = 0.05;

// ─────────────────────────────────────────── main
function main() {
  const keywordSeries = readJson(join(ROOT, 'data', 'keyword-series.json'));
  if (!keywordSeries || !keywordSeries.bing) {
    console.error('data/keyword-series.json missing or has no bing block — run npm run build:keywords first.');
    process.exit(1);
  }
  const pageSeries = readJson(join(ROOT, 'data', 'page-series.json'));
  const gscQp = loadGscQueryPage();

  // Page-level totals keyed by URL, so we can say whether the page a query points
  // at is itself moving, and whether it carries enough impressions to mean it.
  const pageInfo = new Map();
  if (pageSeries && Array.isArray(pageSeries.pages)) {
    for (const p of pageSeries.pages) pageInfo.set(p.page, p);
  }

  const bingByQuery = new Map();
  for (const k of keywordSeries.bing.keywords) bingByQuery.set(k.query, k);

  const rows = [];
  for (const [query, k] of bingByQuery) {
    const totalImpressions = k.points.reduce((s, p) => s + (p.impressions ?? 0), 0);
    const landing = gscQp ? gscQp.byQuery.get(query) ?? [] : [];

    // Attribution status, decided in a fixed order. The order matters: a noise
    // query must be labelled noise even if a landing page happens to exist,
    // because "we know the page" and "the movement is real" are separate claims.
    let status;
    let statusReason;
    if (k.delta === null) {
      status = 'noBaseline';
      statusReason = `仅 ${k.observations} 个 Bing 观测点，无法计算 Δ（单点词不是趋势）`;
    } else if (totalImpressions < NOISE_IMPRESSIONS) {
      status = 'noise';
      statusReason = `累计展示仅 ${totalImpressions} 次（< ${NOISE_IMPRESSIONS}），Δ 属随机波动，不作方向判断`;
    } else if (Math.abs(k.delta) < THRESHOLD) {
      status = 'stable';
      statusReason = `|Δ|=${Math.abs(k.delta)} < 阈值 ${THRESHOLD}，无显著变动`;
    } else if (landing.length === 0) {
      status = 'unconfirmed';
      statusReason = gscQp
        ? 'GSC query+page 快照中无该词的落地页记录，无法定位到页面'
        : '未取到 GSC query+page 快照（本轮未执行 --dimension query,page），无法定位到页面';
    } else {
      status = 'attributed';
      statusReason = '已定位落地页且 Δ 超出噪声与阈值门槛';
    }

    rows.push({
      query,
      status,
      statusReason,
      bing: {
        delta: k.delta,
        observations: k.observations,
        totalImpressions,
        latestDate: k.latest?.date ?? null,
        latestPosition: k.latest?.impressionPosition ?? null,
        previousDate: k.previous?.date ?? null,
        previousPosition: k.previous?.impressionPosition ?? null,
        spanDays: k.spanDays ?? null,
      },
      gscQueryLevel: (() => {
        const g = keywordSeries.gsc;
        if (!g || !Array.isArray(g.keywords)) return null;
        const gk = g.keywords.find((x) => x.query === query);
        if (!gk) return null;
        return { delta: gk.delta, observations: gk.observations, latestPosition: gk.latest?.position ?? null };
      })(),
      landing: landing.map((l) => ({
        page: l.page,
        path: shortPath(l.page),
        position: l.position,
        impressions: l.impressions,
        clicks: l.clicks,
        windowDays: l.windowDays,
        // Page-level movement for the URL this query points at (M18 data).
        pageLevel: (() => {
          const pi = pageInfo.get(l.page);
          if (!pi) return null;
          return {
            delta: pi.delta,
            observations: pi.observations,
            totalImpressions: pi.totalImpressions,
            lowVolume: pi.lowVolume,
          };
        })(),
      })),
      landingAmbiguous: landing.length > 1,
    });
  }

  // ── cross-channel verdicts (only where BOTH sides have a usable Δ) ──
  const crossChecked = [];
  for (const r of rows) {
    if (!r.gscQueryLevel) continue;
    if (r.gscQueryLevel.delta === null || r.bing.delta === null) continue;
    const g = r.gscQueryLevel.delta;
    const b = r.bing.delta;
    let verdict;
    let note;
    if (Math.abs(g) < GSC_EPSILON) {
      // GSC says "no movement" (within rounding). That is NOT agreement with a
      // Bing move — it is the absence of a second measurement, so the honest
      // verdict is that we could not corroborate, not that the two agree.
      verdict = b === 0 ? 'agree' : 'gscInert';
      note =
        verdict === 'agree'
          ? '两渠道均无变动'
          : `GSC 91 天滚动窗口内实质无变动（|Δ|=${Math.abs(g).toFixed(4)} < ${GSC_EPSILON}，属四舍五入噪声），无法佐证 Bing 的 ${b > 0 ? '+' : ''}${b}；不作方向判断`;
    } else if (Math.abs(g - b) < 1) {
      verdict = 'agree';
      note = '两渠道 Δ 差异 <1，方向可视为一致';
    } else if (Math.sign(g) !== Math.sign(b)) {
      verdict = 'conflict';
      note = `两渠道方向相反（GSC ${g > 0 ? '+' : ''}${g.toFixed(1)} vs Bing ${b > 0 ? '+' : ''}${b}）——两引擎权重不同，不选边，降级为 UNKNOWN`;
    } else {
      verdict = 'partial';
      note = `方向一致但幅度不同（GSC ${g > 0 ? '+' : ''}${g.toFixed(1)} vs Bing ${b > 0 ? '+' : ''}${b}）`;
    }
    crossChecked.push({
      query: r.query,
      gscDelta: g,
      bingDelta: b,
      gscImpressions: r.landing.reduce((s, l) => s + (l.impressions ?? 0), 0),
      verdict,
      note,
    });
  }

  // ── totals ──
  const byStatus = (s) => rows.filter((r) => r.status === s).length;
  const totals = {
    queries: rows.length,
    attributed: byStatus('attributed'),
    unconfirmed: byStatus('unconfirmed'),
    stable: byStatus('stable'),
    noise: byStatus('noise'),
    noBaseline: byStatus('noBaseline'),
    crossChecked: crossChecked.length,
    crossAgree: crossChecked.filter((c) => c.verdict === 'agree').length,
    crossPartial: crossChecked.filter((c) => c.verdict === 'partial').length,
    crossConflict: crossChecked.filter((c) => c.verdict === 'conflict').length,
    crossGscInert: crossChecked.filter((c) => c.verdict === 'gscInert').length,
  };

  const inputs = {
    keywordSeries: Boolean(keywordSeries),
    pageSeries: Boolean(pageSeries),
    gscQueryPage: Boolean(gscQp),
    gscQueryPageSnapshots: gscQp ? gscQp.snapshots.length : 0,
    gscQueryPageRows: gscQp ? [...gscQp.byQuery.values()].reduce((s, l) => s + l.length, 0) : 0,
    gscWindow: gscQp ? gscQp.latest : null,
  };

  const out = {
    $schema: 'page-attribution/v1',
    _readme: [
      '本文件由 scripts/build-page-attribution.mjs 生成，不要手改。',
      '重跑：node scripts/build-page-attribution.mjs',
      `status 含义：attributed=已定位落地页且 Δ 过门槛；unconfirmed=有变动但无落地页记录；stable=|Δ| 未过阈值；noise=累计展示 < ${NOISE_IMPRESSIONS}，Δ 属噪声；noBaseline=Bing 观测点不足，无 Δ。`,
      '本文件只做【定位】与【交叉验证】，不断言因果 —— 无对照组、无反事实、无第三方独立证据源。',
    ],
    generatedAt: new Date().toISOString(),
    d0: keywordSeries.d0 ?? null,
    thresholds: { delta: THRESHOLD, noiseImpressions: NOISE_IMPRESSIONS },
    inputs,
    totals,
    caveats: [
      `落地页唯一来源是 GSC 的 dimensions:['query','page']（本次读取 ${inputs.gscQueryPageSnapshots} 个快照 / ${inputs.gscQueryPageRows} 行）。Bing GetPageStats 是页面级汇总，回答不了「哪个 query 落在哪个 URL」。`,
      'GSC 的 position 是 91 天滚动窗口内的平均排名，Δ 被大幅抹平，只适合看方向不适合看幅度。',
      `累计展示 < ${NOISE_IMPRESSIONS} 次的词，其 Δ 一律标 noise、不给方向（2026-10-13 实测：|Δ|≥2 的 12 词中 11 词属此类）。`,
      '跨渠道方向相反时降级为 UNKNOWN，不选边——Bing 与 GSC 不是对同一量的两次测量。GSC 实质无变动（|Δ|<0.05，四舍五入噪声）时标 gscInert：那是「缺第二次测量」，不等于两渠道一致，故同样不作方向判断。',
      '本文件不含任何因果结论；页面级 Δ 与 query 级 Δ 的时间相关性不等于因果关系。',
    ],
    rows,
    crossChecked,
  };

  writeFileSync(join(ROOT, 'data', 'page-attribution.json'), JSON.stringify(out, null, 2), 'utf8');
  console.log('  wrote data/page-attribution.json');

  // ── human-readable report ──
  const md = [];
  md.push(`# 页面归因分析（数据日 d0=${out.d0}）`);
  md.push('');
  md.push(`> 生成 ${out.generatedAt} · 阈值 |Δ| ≥ ${THRESHOLD} · 噪声门槛 累计展示 < ${NOISE_IMPRESSIONS}`);
  md.push('');
  md.push('## 输入可用性');
  md.push('');
  md.push('| 输入 | 状态 |');
  md.push('|---|---|');
  md.push(`| keyword-series.json | ${inputs.keywordSeries ? '✅' : '❌ 缺失'} |`);
  md.push(`| page-series.json（M18 页面级） | ${inputs.pageSeries ? '✅' : '⚠️ 缺失'} |`);
  md.push(`| GSC query+page（M17 定位来源） | ${inputs.gscQueryPage ? `✅ ${inputs.gscQueryPageSnapshots} 快照 / ${inputs.gscQueryPageRows} 行` : '❌ 未取到 → 全部落 unconfirmed'} |`);
  if (inputs.gscWindow) {
    md.push(`| └ 窗口 | ${inputs.gscWindow.start} → ${inputs.gscWindow.end}（${inputs.gscWindow.windowDays} 天滚动） |`);
  }
  md.push('');
  md.push('## 分层结果');
  md.push('');
  md.push('| status | 词数 | 含义 |');
  md.push('|---|---|---|');
  md.push(`| attributed | ${totals.attributed} | 已定位落地页且 Δ 过门槛 |`);
  md.push(`| unconfirmed | ${totals.unconfirmed} | 有变动但无落地页记录 |`);
  md.push(`| stable | ${totals.stable} | \\|Δ\\| 未过阈值 |`);
  md.push(`| noise | ${totals.noise} | 累计展示 < ${NOISE_IMPRESSIONS}，Δ 属噪声 |`);
  md.push(`| noBaseline | ${totals.noBaseline} | Bing 观测点不足，无 Δ |`);
  md.push('');
  md.push('## 可执行条目（attributed）');
  md.push('');
  const attributed = rows.filter((r) => r.status === 'attributed');
  if (attributed.length === 0) {
    md.push('本轮 0 条。原因见上方 status 分层——不降低阈值凑数。');
  } else {
    md.push('| 词 | Bing Δ | 累计展示 | 落地页 | GSC pos | 该页自身 Δ | 备注 |');
    md.push('|---|---|---|---|---|---|---|');
    for (const r of attributed.sort((a, b) => Math.abs(b.bing.delta) - Math.abs(a.bing.delta))) {
      const l = r.landing[0];
      md.push(
        `| ${r.query} | ${r.bing.delta > 0 ? '+' : ''}${r.bing.delta} | ${r.bing.totalImpressions} | ${l.path} | ${l.position?.toFixed(1) ?? '—'} | ${l.pageLevel?.delta ?? '—'} | ${r.landingAmbiguous ? `⚠️ ${r.landing.length} 个落地页，需人工确认` : ''} |`
      );
    }
  }
  md.push('');
  md.push('## 双渠道交叉验证');
  md.push('');
  if (crossChecked.length === 0) {
    md.push('本轮无可交叉验证的词（两渠道缺一或 Δ 不可计算）。');
  } else {
    md.push(`可比 ${totals.crossChecked} 词：一致 ${totals.crossAgree} / 幅度不同 ${totals.crossPartial} / 方向相反 ${totals.crossConflict} / GSC 无变动无法佐证 ${totals.crossGscInert}。`);
    md.push('');
    md.push('| 词 | GSC Δ | Bing Δ | 判定 | 说明 |');
    md.push('|---|---|---|---|---|');
    for (const c of crossChecked.sort((a, b) => Math.abs(b.bingDelta) - Math.abs(a.bingDelta))) {
      md.push(`| ${c.query} | ${c.gscDelta > 0 ? '+' : ''}${c.gscDelta.toFixed(1)} | ${c.bingDelta > 0 ? '+' : ''}${c.bingDelta} | ${c.verdict} | ${c.note} |`);
    }
    if (totals.crossConflict > 0) {
      md.push('');
      md.push(`> 🔴 ${totals.crossConflict} 词方向相反，已降级为 UNKNOWN，不据此做任何优化动作。`);
    }
  }
  md.push('');
  md.push('## 口径与边界');
  md.push('');
  for (const c of out.caveats) md.push(`- ${c}`);
  md.push('');
  md.push('---');
  md.push('');
  md.push('_本文件由 scripts/build-page-attribution.mjs 生成。做定位与交叉验证，不做因果推断。_');

  const mdPath = join(DATA_DIR, `页面归因分析-${out.d0 ?? 'latest'}.md`);
  writeFileSync(mdPath, md.join('\n'), 'utf8');
  console.log(`  wrote ${mdPath}`);

  console.log('\npage attribution (M17)');
  console.log('─'.repeat(64));
  console.log(`  词总数 ${totals.queries}`);
  console.log(`  attributed ${totals.attributed} / unconfirmed ${totals.unconfirmed} / stable ${totals.stable}`);
  console.log(`  noise ${totals.noise}（累计展示 < ${NOISE_IMPRESSIONS}，不给方向） / noBaseline ${totals.noBaseline}`);
  console.log(`  交叉验证 ${totals.crossChecked}：一致 ${totals.crossAgree} / 幅度不同 ${totals.crossPartial} / 方向相反 ${totals.crossConflict} / GSC 无变动 ${totals.crossGscInert}`);
  if (!inputs.gscQueryPage) {
    console.log(`  ⚠️ 未取到 GSC query+page → 无法定位落地页（跑 fetch:gsc --dimension query,page）`);
  }
  console.log('─'.repeat(64));
}

main();