#!/usr/bin/env node
// scripts/build-keyword-series.mjs
//
// Stitch the per-fetch snapshots in 数据分析/ into ONE comparable keyword × date
// series, so that "排名变化" can actually be measured instead of guessed.
//
// Why this file has to exist
// ──────────────────────────
// Each fetch writes its own timestamped snapshot, and those snapshots are NOT
// comparable as they stand:
//
//   • Bing GetQueryStats returns a rolling ~7-day window capped at the top 100
//     queries, and accepts no date filter (verified in fetch-bing-webmaster.mjs,
//     measured 2026-09-25). One call therefore cannot give you history — you
//     only get history by calling it every day and stitching the results.
//
//   • The GSC exports were taken with INCONSISTENT windows (186/136 rows over
//     30 days, then ~25 rows over 9-10 days). Their `position` values are
//     averages over different spans, so comparing two of them is meaningless.
//     We keep GSC in the output but tag every point with its window length and
//     mark the series non-comparable, rather than silently averaging apples
//     with oranges.
//
// Outputs
// ───────
//   数据分析/keyword-rank-series.csv   long:  one row per (query, date)
//   数据分析/keyword-rank-latest.csv   wide:  one row per query, latest vs previous + Δ
//   data/keyword-series.json           the same data for the workbench to render
//
// Usage:  node scripts/build-keyword-series.mjs
//
// NOTE: 数据分析/ is git-ignored, so the raw snapshots have no version control.
// The JSON written to data/ IS tracked — it is the durable copy of this series.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const DATA_DIR = join(ROOT, '数据分析');
const OUT_JSON = join(ROOT, 'data', 'keyword-series.json');

const D0 = '2026-09-27'; // project day-zero, used only for reporting

// ────────────────────────────────────────────────────────────── CSV parsing
// Bing's Query column can contain commas (and we have seen a malformed quoted
// value), so parse properly instead of splitting on ','.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function readCsvObjects(path) {
  const rows = parseCsv(readFileSync(path, 'utf8'));
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.replace(/^\uFEFF/, '').trim());
  return rows
    .slice(1)
    .filter((r) => r.length === header.length && r.some((v) => v !== ''))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

const num = (v) => {
  const n = Number(String(v ?? '').trim());
  return Number.isFinite(n) ? n : null;
};
// Bing reports -1 for "no data" on the position columns.
const pos = (v) => {
  const n = num(v);
  return n === null || n < 0 ? null : n;
};

// A tiny minority of rows are not search queries at all but scraped page text
// that leaked into the Query column, carrying Bing's line-break encoding
// (`#R##N#`) or stray markup. Measured 2026-09-27: 3 of 483 rows (0.6%).
// Everything else — including very long strings — is a genuine long-tail query,
// so we filter narrowly rather than by length.
function isJunkQuery(q) {
  return /#R#|#R##N#|<[a-z][^>]*>|&nbsp;/i.test(q);
}

// ────────────────────────────────────────────────────────────── Bing
// Snapshot filename carries the FETCH date; the Date column carries the DATA
// date (a weekly bucket). Both matter: when two fetches disagree about the same
// (query, dataDate), the later fetch is the more authoritative observation.
function loadBingSnapshots() {
  if (!existsSync(DATA_DIR)) return [];
  const files = readdirSync(DATA_DIR)
    .filter((f) => /_BingAPI_Query_\d{4}_\d{2}_\d{2}\.csv$/.test(f))
    .sort();
  const out = [];
  for (const f of files) {
    const m = f.match(/(\d{4})_(\d{2})_(\d{2})\.csv$/);
    const fetchedAt = `${m[1]}-${m[2]}-${m[3]}`;
    let rows;
    try {
      rows = readCsvObjects(join(DATA_DIR, f));
    } catch {
      continue;
    }
    out.push({ file: f, fetchedAt, rows });
  }
  return out;
}

function buildBing() {
  const snaps = loadBingSnapshots();
  if (snaps.length === 0) return null;

  // query -> dataDate -> { clicks, impressions, clickPos, impPos, fetchedAt }
  const byQuery = new Map();
  let observations = 0;
  let droppedJunk = 0;

  for (const snap of snaps) {
    for (const r of snap.rows) {
      const q = (r.Query ?? '').trim();
      const d = (r.Date ?? '').trim();
      if (!q || !/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
      if (isJunkQuery(q)) { droppedJunk++; continue; }
      observations++;
      if (!byQuery.has(q)) byQuery.set(q, new Map());
      const bucket = byQuery.get(q);
      const prev = bucket.get(d);
      // Later fetch wins; within one fetch, keep the first (Bing can repeat a row).
      if (prev && prev.fetchedAt >= snap.fetchedAt) continue;
      bucket.set(d, {
        date: d,
        clicks: num(r.Clicks) ?? 0,
        impressions: num(r.Impressions) ?? 0,
        clickPosition: pos(r.AvgClickPosition),
        impressionPosition: pos(r.AvgImpressionPosition),
        fetchedAt: snap.fetchedAt,
      });
    }
  }

  const keywords = [];
  for (const [query, bucket] of byQuery) {
    const points = [...bucket.values()].sort((a, b) => a.date.localeCompare(b.date));
    const latest = points[points.length - 1] ?? null;
    const previous = points.length > 1 ? points[points.length - 2] : null;
    // Δ is signed so that POSITIVE = moved UP (rank number got smaller).
    const delta =
      latest && previous && latest.impressionPosition !== null && previous.impressionPosition !== null
        ? previous.impressionPosition - latest.impressionPosition
        : null;
    // How far apart the two compared observations are. A 14-day gap is a very
    // different claim from a 7-day one, so the table must be able to show it.
    const spanDays =
      latest && previous
        ? Math.round(
            (Date.parse(latest.date + 'T00:00:00Z') - Date.parse(previous.date + 'T00:00:00Z')) / 86400000
          )
        : null;
    keywords.push({ query, points, latest, previous, delta, spanDays, observations: points.length });
  }

  // Most-observed first, then best position, so the interesting rows surface.
  keywords.sort(
    (a, b) =>
      b.observations - a.observations ||
      (a.latest?.impressionPosition ?? 999) - (b.latest?.impressionPosition ?? 999) ||
      a.query.localeCompare(b.query)
  );

  const comparable = keywords.filter((k) => k.delta !== null);
  const weeks = [...new Set(keywords.flatMap((k) => k.points.map((p) => p.date)))].sort();

  return {
    label: 'Bing Webmaster API · GetQueryStats',
    snapshots: snaps.length,
    firstFetch: snaps[0].fetchedAt,
    lastFetch: snaps[snaps.length - 1].fetchedAt,
    observations,
    droppedJunk,
    weeks,
    keywords,
    totals: {
      keywords: keywords.length,
      comparable: comparable.length,
      up: comparable.filter((k) => k.delta > 0).length,
      down: comparable.filter((k) => k.delta < 0).length,
      flat: comparable.filter((k) => k.delta === 0).length,
      singlePoint: keywords.filter((k) => k.observations < 2).length,
      droppedJunk,
    },
    caveats: [
      'Bing 的 GetQueryStats 只返回 Top 100 查询、且不接受日期参数（实测窗口约 7 天）。',
      '因此「历史」不是一次调用能拿到的 —— 必须每天跑一次并在此拼接。当前只有 7 次抓取（09-19→09-26），历史很短。',
      '排名变化 Δ = 该词「最近两次观测」之差，不是「最近两周」之差；两点的间隔见 spanDays（可能是 7 天，也可能是 14 天以上）。',
      '只有 ≥2 个观测点的词才有 Δ；单点词无法判断趋势，已标 observations=1。',
      `已丢弃 ${droppedJunk} 条抓取残留（含 #R##N# 等页面标记，不是搜索词）。`,
    ],
  };
}

// ────────────────────────────────────────────────────────────── GSC
// Kept deliberately separate: the windows are inconsistent, so a naive merge
// would compare a 30-day average against a 9-day average.
function buildGsc() {
  if (!existsSync(DATA_DIR)) return null;
  const files = readdirSync(DATA_DIR)
    .filter((f) => /^GSC_API_query_\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  if (files.length === 0) return null;

  const windows = [];
  const byQuery = new Map();

  for (const f of files) {
    const fetchedAt = f.match(/(\d{4}-\d{2}-\d{2})/)[1];
    let j;
    try {
      j = JSON.parse(readFileSync(join(DATA_DIR, f), 'utf8'));
    } catch {
      continue;
    }
    const rows = Array.isArray(j.rows) ? j.rows : [];
    const start = j.startDate ?? null;
    const end = j.endDate ?? null;
    const windowDays =
      start && end
        ? Math.round((Date.parse(end + 'T00:00:00Z') - Date.parse(start + 'T00:00:00Z')) / 86400000) + 1
        : null;
    windows.push({ fetchedAt, start, end, windowDays, rows: rows.length });

    for (const r of rows) {
      const q = Array.isArray(r.keys) ? r.keys[0] : r.keys;
      if (!q) continue;
      if (!byQuery.has(q)) byQuery.set(q, []);
      byQuery.get(q).push({
        date: fetchedAt,
        position: typeof r.position === 'number' ? r.position : null,
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        ctr: r.ctr ?? null,
        windowDays,
      });
    }
  }

  const keywords = [...byQuery.entries()].map(([query, points]) => {
    const sorted = points.slice().sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1] ?? null;
    return { query, points: sorted, latest, observations: sorted.length };
  });
  keywords.sort((a, b) => b.observations - a.observations || a.query.localeCompare(b.query));

  const distinctWindows = [...new Set(windows.map((w) => w.windowDays).filter((n) => n !== null))].sort((a, b) => a - b);
  const comparable = distinctWindows.length === 1;

  return {
    label: 'Google Search Console · query',
    snapshots: windows.length,
    windows,
    distinctWindowDays: distinctWindows,
    comparable,
    keywords,
    totals: {
      keywords: keywords.length,
      multiPoint: keywords.filter((k) => k.observations > 1).length,
    },
    caveats: comparable
      ? ['窗口一致，跨日可比。']
      : [
          `各次导出的窗口长度不一致（${distinctWindows.join(' / ')} 天），position 是不同跨度的平均值。`,
          '在窗口统一之前，GSC 的跨日对比不可用 —— 需要固定参数重新采集。',
        ],
  };
}

// ────────────────────────────────────────────────────────────── outputs
function toCsv(rows, fields) {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [fields.join(','), ...rows.map((r) => fields.map((f) => esc(r[f])).join(','))].join('\n');
}

function main() {
  const bing = buildBing();
  const gsc = buildGsc();

  if (!bing && !gsc) {
    console.error('No snapshots found in 数据分析/ — nothing to build.');
    process.exit(1);
  }

  // ── long series CSV ──
  if (bing) {
    const rows = [];
    for (const k of bing.keywords) {
      for (const p of k.points) {
        rows.push({
          Query: k.query,
          Date: p.date,
          Clicks: p.clicks,
          Impressions: p.impressions,
          AvgClickPosition: p.clickPosition ?? '',
          AvgImpressionPosition: p.impressionPosition ?? '',
          Source: 'bing',
          FetchedAt: p.fetchedAt,
        });
      }
    }
    rows.sort((a, b) => a.Query.localeCompare(b.Query) || a.Date.localeCompare(b.Date));
    const fp = join(DATA_DIR, 'keyword-rank-series.csv');
    writeFileSync(
      fp,
      toCsv(rows, ['Query', 'Date', 'Clicks', 'Impressions', 'AvgClickPosition', 'AvgImpressionPosition', 'Source', 'FetchedAt']),
      'utf8'
    );
    console.log(`  wrote ${fp}  (${rows.length} rows)`);
  }

  // ── latest/previous + Δ CSV (with human reasons merged in) ──
  // query -> most recent reason text (from data/keyword-reasons.json)
  const reasonMap = (() => {
    const fp = join(ROOT, 'data', 'keyword-reasons.json');
    if (!existsSync(fp)) return new Map();
    try {
      const parsed = JSON.parse(readFileSync(fp, 'utf8'));
      const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
      const byQuery = new Map();
      for (const e of entries.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))) {
        if (!byQuery.has(e.query)) byQuery.set(e.query, e.reason);
      }
      return byQuery;
    } catch {
      return new Map();
    }
  })();
  if (bing) {
    const rows = bing.keywords.map((k) => ({
      Query: k.query,
      LatestDate: k.latest?.date ?? '',
      LatestPos: k.latest?.impressionPosition ?? '',
      PrevDate: k.previous?.date ?? '',
      PrevPos: k.previous?.impressionPosition ?? '',
      SpanDays: k.spanDays ?? '',
      Delta: k.delta === null ? '' : k.delta,
      Trend: k.delta === null ? 'no-baseline' : k.delta > 0 ? 'up' : k.delta < 0 ? 'down' : 'flat',
      Impressions: k.latest?.impressions ?? '',
      Clicks: k.latest?.clicks ?? '',
      Observations: k.observations,
      Reasons: reasonMap.get(k.query) ?? '',
    }));
    const fp = join(DATA_DIR, 'keyword-rank-latest.csv');
    writeFileSync(
      fp,
      toCsv(rows, ['Query', 'LatestDate', 'LatestPos', 'PrevDate', 'PrevPos', 'SpanDays', 'Delta', 'Trend', 'Impressions', 'Clicks', 'Observations', 'Reasons']),
      'utf8'
    );
    console.log(`  wrote ${fp}  (${rows.length} rows)`);
  }

  // ── JSON for the workbench ──
  const out = {
    $schema: 'SEO/GEO 作战台 · 关键词排名序列（由 scripts/build-keyword-series.mjs 生成）',
    _readme: [
      '本文件由 scripts/build-keyword-series.mjs 从 数据分析/ 下的原始快照合并生成，不要手改。',
      '重跑：node scripts/build-keyword-series.mjs',
      'Δ 的定义：上一期排名 − 本期排名。正数 = 名次上升（数字变小），负数 = 下降。',
      '只有 ≥2 个观测点的词才有 Δ；单点词无法判断趋势，已标 observations=1。',
    ],
    generatedAt: new Date().toISOString(),
    d0: D0,
    bing,
    gsc,
  };
  if (!existsSync(join(ROOT, 'data'))) mkdirSync(join(ROOT, 'data'));
  writeFileSync(OUT_JSON, JSON.stringify(out, null, 2), 'utf8');
  console.log(`  wrote ${OUT_JSON}`);

  // ── summary ──
  console.log('\nkeyword series');
  console.log('─'.repeat(64));
  if (bing) {
    const t = bing.totals;
    console.log(`  Bing  快照 ${bing.snapshots} 个（${bing.firstFetch} → ${bing.lastFetch}）`);
    console.log(`        观测 ${bing.observations} 条 · 周桶 ${bing.weeks.length} 个 · 唯一词 ${t.keywords}（丢弃残留 ${t.droppedJunk}）`);
    console.log(`        可比(≥2点) ${t.comparable} → 上升 ${t.up} / 下降 ${t.down} / 持平 ${t.flat}`);
    console.log(`        单点词 ${t.singlePoint}（无法判断趋势）`);
  }
  if (gsc) {
    console.log(`  GSC   快照 ${gsc.snapshots} 个 · 唯一词 ${gsc.totals.keywords} · 多点词 ${gsc.totals.multiPoint}`);
    console.log(`        窗口长度：${gsc.distinctWindowDays.join(' / ')} 天 → 可比性 = ${gsc.comparable ? '是' : '否'}`);
  }
  console.log('─'.repeat(64));
}

main();
