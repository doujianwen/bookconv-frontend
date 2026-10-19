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

function pointFrom(rank, url, date, depth) {
  return { date, rank: rank > 0 ? rank : null, url: url ?? null, observedDepth: depth ?? null };
}

// A snapshot is only trustworthy as a COMPARISON BASELINE when the provider
// actually returned a deep result set. fetch-competitor-serp.mjs records
// `observedDepth` per query from now on; older snapshots have none, which is
// UNKNOWN (never treated as bad — see baselineUsable).
const MIN_BASELINE_DEPTH = 5;

function baselineUsable(point, snapshotByDate) {
  // No depth recorded (legacy snapshot) → UNKNOWN. We must not silently drop
  // real history, and we must not fail the build either. Keep it usable but
  // flag the row so the report can say the baseline depth is unknown.
  if (point.observedDepth === null || point.observedDepth === undefined) return true;
  const snap = snapshotByDate.get(point.date);
  // Today's own query-level depth is authoritative; fall back to the
  // snapshot-level minimum if this snapshot predates the per-query field.
  const depth = point.observedDepth ?? snap?.quality?.minObservedDepth ?? null;
  if (depth === null) return true;
  return depth >= MIN_BASELINE_DEPTH;
}

function trendOf(latest, prev, shallowSkipped) {
  // A skipped shallow baseline is NOT "the rival is new" — it is "we cannot
  // compare". Reporting it as `new` is the exact false signal this gate exists
  // to prevent, so it gets its own trend value.
  if (shallowSkipped) return 'no-baseline';
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
        pts.push(pointFrom(c.rank, c.url, snap.date, res.observedDepth));
        byDomain.set(c.domain, pts);
      }
      seriesMap.set(res.query, byDomain);
    }
  }

  const matrix = [];
  const totals = { snapshots: snapshots.length, pairs: 0, up: 0, down: 0, new: 0, gone: 0, noData: 0, shallowBaselineSkipped: 0 };
  const snapshotByDate = new Map(snapshots.map((s) => [s.date, s]));
  for (const [query, byDomain] of seriesMap) {
    for (const [domain, pts] of byDomain) {
      pts.sort((a, b) => a.date.localeCompare(b.date));
      const latest = pts[pts.length - 1];
      const rawPrev = pts.length > 1 ? pts[pts.length - 2] : null;
      // If the previous observation came from a too-shallow snapshot we cannot
      // compare against it — reporting a Δ against it is how a throttled day
      // gets published as "30 new entrants". Fall back to "no baseline".
      const prev = rawPrev && !baselineUsable(rawPrev, snapshotByDate) ? null : rawPrev;
      const latestRank = latest.rank;
      const prevRank = prev ? prev.rank : null;
      const delta = latestRank != null && prevRank != null ? prevRank - latestRank : null;
      const shallowSkipped = Boolean(rawPrev && !prev);
      const trend = trendOf(latestRank, prevRank, shallowSkipped);
      const name = (cfg.competitors.find((c) => c.domain === domain) || {}).name || domain;
      if (shallowSkipped) totals.shallowBaselineSkipped = (totals.shallowBaselineSkipped || 0) + 1;
      // Legacy snapshots (pre-2026-10-19) carry no observedDepth. We refuse to
      // discard real history over a missing field, but the row must SAY that its
      // baseline is unverifiable — otherwise `new` reads as a confirmed entrant.
      const baselineDepthKnown = !rawPrev || rawPrev.observedDepth !== null && rawPrev.observedDepth !== undefined;
      if (rawPrev && !baselineDepthKnown) totals.baselineDepthUnknown = (totals.baselineDepthUnknown || 0) + 1;
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
        // Honest blank when the rival was outside the observed window that day.
        // Note the observed window is far shallower than 100 — see the quality
        // note written by fetch-competitor-serp.mjs.
        url: latest.url ?? null,
        observedDepth: latest.observedDepth ?? null,
        shallowBaselineSkipped: shallowSkipped,
        // false = 上期快照没有记录观测深度（2026-10-19 之前的老快照），
        // 此时 trend=new 只意味着「无有效前期基准」，不可表述为「新进入 Top-100」。
        baselineDepthKnown,
      });
      totals.pairs++;
      if (trend === 'up') totals.up++;
      else if (trend === 'down') totals.down++;
      else if (trend === 'new') totals.new++;
      else if (trend === 'gone') totals.gone++;
      else if (trend === 'no-data') totals.noData++;
      else if (trend === 'no-baseline') totals.noBaseline = (totals.noBaseline || 0) + 1;
    }
  }

  const out = {
    $schema: 'competitor-series/v1',
    _readme: [
      '本文件由 scripts/build-competitor-series.mjs 生成，不要手改。',
      'matrix 每行 = 一个竞品域名在某目标词上的最新排名 + 上期 + Δ + 落地 URL。',
      'Δ = 上期排名 − 本期排名；正数 = 竞品名次上升（对它有利）。',
      '🔴 rank 为 null 只表示「该日未进入观测窗口」，**不等于**「未进 Top-100」：实测（2026-10-19）我们请求 num=100，SerpApi 实际只返回 8–10 条 organic_results。观测深度见 observedDepth。',
      '🔴 trend=new / prevRank=null 只能读作「无有效前期基准」，不得表述为「新进入 Top-100」。',
      '若上期快照观测深度不足（observedDepth < 5），本行会跳过该基准并置 shallowBaselineSkipped=true，Δ 留空——宁可说「无法比较」，不发布一个由限流伪造出来的涨跌。',
      '2026-10-19 之前的快照没有记录 observedDepth（UNKNOWN），按可用处理，不因此判FAIL。',
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
  console.log(`  快照 ${snapshots.length} 个 ·竞品×词 ${totals.pairs} 对 · 升 ${totals.up}/降 ${totals.down}/新进 ${totals.new}/掉出 ${totals.gone}/无数据 ${totals.noData}`);
  if (totals.shallowBaselineSkipped > 0) {
    console.log(`  ⚠ 跳过浅基准 ${totals.shallowBaselineSkipped} 对（上期观测深度 < ${MIN_BASELINE_DEPTH}，Δ 留空而非伪造）`);
  }
}

main();
