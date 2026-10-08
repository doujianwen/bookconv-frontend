// scripts/build-competitor-series.mjs
// Stitch 数据分析/competitor-serp-*.json daily snapshots into one comparable
// per-competitor × per-keyword rank series → data/competitor-series.json.
//
// rank 0 from the fetch script means "not in top 100" — we treat it as null
// (no datum), not as a real position, so a rival dropping out of the top 100
// shows as 'gone', not as "rank 0 beating everyone".
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DATA_DIR = join(ROOT, '数据分析');
const CONFIG = join(ROOT, 'data', 'competitor-config.json');
const OUT = join(ROOT, 'data', 'competitor-series.json');
const D0 = '2026-09-27';

function loadConfig() {
  if (!existsSync(CONFIG)) return { competitors: [], keywords: [] };
  const c = JSON.parse(readFileSync(CONFIG, 'utf8'));
  return { competitors: c.competitors || [], keywords: c.keywords || [] };
}

function loadSnapshots() {
  if (!existsSync(DATA_DIR)) return [];
  return readdirSync(DATA_DIR)
    .filter((f) => /^competitor-serp-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(DATA_DIR, f), 'utf8'));
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function pointFrom(rank, url, date) {
  return { date, rank: rank > 0 ? rank : null, url: url ?? null };
}

function trendOf(latest, prev) {
  if (latest == null && prev == null) return 'no-data';
  if (latest != null && prev == null) return 'new';
  if (latest == null && prev != null) return 'gone';
  if (latest === prev) return 'flat';
  return latest < prev ? 'up' : 'down';
}

function main() {
  const cfg = loadConfig();
  const snapshots = loadSnapshots();

  if (snapshots.length === 0) {
    // Still emit a valid (empty) series so the panel can render its instructions.
    const out = {
      $schema: 'competitor-series/v1',
      _readme: [
        '本文件由 scripts/build-competitor-series.mjs 生成，不要手改。',
        '为空说明还没抓过：先设 SERPAPI_KEY 或 BING_WEB_SEARCH_KEY，再',
        '  node scripts/fetch-competitor-serp.mjs && node scripts/build-competitor-series.mjs',
      ],
      generatedAt: new Date().toISOString(),
      d0: D0,
      config: cfg,
      snapshots: 0,
      matrix: [],
      totals: { snapshots: 0, pairs: 0, up: 0, down: 0, new: 0, gone: 0, noData: 0 },
    };
    if (!existsSync(join(ROOT, 'data'))) mkdirSync(join(ROOT, 'data'));
    writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
    console.log('⚠ 没有 competitor-serp-* 快照，写出空序列（面板会提示如何抓取）。');
    return;
  }

  // index: query -> domain -> points[]
  const seriesMap = new Map();
  for (const snap of snapshots) {
    for (const res of snap.results || []) {
      const byDomain = seriesMap.get(res.query) || new Map();
      for (const c of res.rankings || []) {
        const pts = byDomain.get(c.domain) || [];
        pts.push(pointFrom(c.rank, c.url, snap.date));
        byDomain.set(c.domain, pts);
      }
      seriesMap.set(res.query, byDomain);
    }
  }

  const matrix = [];
  const totals = { snapshots: snapshots.length, pairs: 0, up: 0, down: 0, new: 0, gone: 0, noData: 0 };
  for (const [query, byDomain] of seriesMap) {
    for (const [domain, pts] of byDomain) {
      pts.sort((a, b) => a.date.localeCompare(b.date));
      const latest = pts[pts.length - 1];
      const prev = pts.length > 1 ? pts[pts.length - 2] : null;
      const latestRank = latest.rank;
      const prevRank = prev ? prev.rank : null;
      const delta = latestRank != null && prevRank != null ? prevRank - latestRank : null;
      const trend = trendOf(latestRank, prevRank);
      const name = (cfg.competitors.find((c) => c.domain === domain) || {}).name || domain;
      matrix.push({
        domain,
        name,
        query,
        latestRank,
        prevRank,
        delta,
        trend,
        latestDate: latest.date,
        prevDate: prev ? prev.date : null,
        // Landing URL from the latest snapshot. null when the rival was not in
        // the Top-100 that day — an honest blank, not a stale URL.
        url: latest.url ?? null,
      });
      totals.pairs++;
      if (trend === 'up') totals.up++;
      else if (trend === 'down') totals.down++;
      else if (trend === 'new') totals.new++;
      else if (trend === 'gone') totals.gone++;
      else if (trend === 'no-data') totals.noData++;
    }
  }

  const out = {
    $schema: 'competitor-series/v1',
    _readme: [
      '本文件由 scripts/build-competitor-series.mjs 生成，不要手改。',
      'matrix 每行 = 一个竞品域名在某目标词上的最新排名 + 上期 + Δ + 落地 URL。',
      'Δ = 上期排名 − 本期排名；正数 = 竞品名次上升（对它有利）。',
      'rank 为 null 表示该日未进 Top-100（trend=gone/new/no-data）；url 同步为 null。',
    ],
    generatedAt: new Date().toISOString(),
    d0: D0,
    config: cfg,
    snapshots: snapshots.length,
    matrix,
    totals,
  };
  if (!existsSync(join(ROOT, 'data'))) mkdirSync(join(ROOT, 'data'));
  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`✓ 写出 ${OUT}`);
  console.log(`  快照 ${snapshots.length} 个 · 竞品×词 ${totals.pairs} 对 · 升 ${totals.up}/降 ${totals.down}/新进 ${totals.new}/掉出 ${totals.gone}/无数据 ${totals.noData}`);
}

main();
