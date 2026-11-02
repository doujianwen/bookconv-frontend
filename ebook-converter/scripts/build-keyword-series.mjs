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

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, renameSync, unlinkSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const DATA_DIR = join(ROOT, '数据分析');
const OUT_JSON = join(ROOT, 'data', 'keyword-series.json');

const D0 = '2026-09-27'; // project day-zero, used only for reporting

// Windows can hand back EBUSY when another process (Excel, a parallel agent
// session, an indexer) holds the target open for writing. MEASURED
// 2026-11-02: 数据分析/keyword-rank-latest.csv was held open by a parallel
// process for the whole run — the plain writeFileSync threw and the script
// died BEFORE reaching its canonical output (data/keyword-series.json), losing
// the primary artifact because of a locked convenience CSV.
//
// So: write to a temp file and rename it into place (atomic replace), and
// retry briefly on EBUSY/EPERM. Rename-over-target also needs the lock
// released, so the retry is what actually buys us the recovery.
function writeFileAtomic(filePath, content, { retries = 5, delayMs = 400 } = {}) {
  const tmp = `${filePath}.tmp-${process.pid}`;
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      writeFileSync(tmp, content, 'utf8');
      renameSync(tmp, filePath);
      return true;
    } catch (e) {
      lastErr = e;
      try { if (existsSync(tmp)) unlinkSync(tmp); } catch { /* best effort */ }
      // EBUSY/EPERM = someone else holds the file; worth waiting.
      // ENOENT/EACCES = a real path problem; retrying will not help.
      if (!['EBUSY', 'EPERM', 'EACCES'].includes(e.code)) break;
      const wait = delayMs * (attempt + 1);
      const end = Date.now() + wait;
      while (Date.now() < end) { /* spin-wait: keeps this script synchronous */ }
    }
  }
  throw lastErr;
}

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
// GSC exports are now taken with a FIXED 90-day window (see fetch-gsc-webmaster.mjs
// --days 90), so two consecutive exports ARE comparable and we compute a real Δ.
// When an older mismatched-window export is still in 数据分析/, `comparable` flips
// to false and we deliberately stop emitting Δ rather than averaging apples/oranges.

// Minimum number of days between the two windows being compared.
//
// 🔴 MEASURED 2026-11-02: GSC `position` is the AVERAGE position across the
// rolling window. Two 91-day windows ending 1 day apart share 90 of 91 days,
// so their averages differ almost by construction. Measured on this site's own
// data: pairing 10-30→10-31 (1-day gap) produced 402/405 "flat" and ZERO
// |Δ|≥3 — a structural false "nothing changed", with real movement averaged
// away. The week-apart pairing 10-24→10-31 (7-day gap) produced 11 up /
// 19 down / 375 flat and 3 keywords with |Δ|≥3.
//
// 7 days = one reporting week, and it leaves ~7 of 91 days non-overlapping.
// This constant applies ONLY to GSC (rolling-window averages). Bing uses
// consecutive-observation semantics (daily snapshots, no window averaging)
// and is deliberately left alone.
const MIN_GSC_PAIR_GAP_DAYS = 7;

function buildGsc() {
  if (!existsSync(DATA_DIR)) return null;
  const files = readdirSync(DATA_DIR)
    // Accept both naming schemes:
    //   GSC_API_query_<endDate>.json        (legacy — window length unknown)
    //   GSC_API_query_<endDate>_d<days>.json (since 2026-11-02 — carries the
    //   window length, so a 10-day and a 90-day export of the same end date
    //   stop overwriting each other).
    .filter((f) => /^GSC_API_query_\d{4}-\d{2}-\d{2}(_d\d+)?\.json$/.test(f))
    .sort();
  if (files.length === 0) return null;

  const windows = [];
  const byQuery = new Map();
  const superseded = [];

  // Load every candidate snapshot first, then pick ONE per export date.
  //
  // 🔴 MEASURED 2026-11-02: two exports of the same end date can coexist —
  // e.g. `GSC_API_query_2026-10-30.json` (a 10-day window, 20 rows) and
  // `GSC_API_query_2026-10-30_d90.json` (the 90-day window, 397 rows).
  // Reading both would give every query TWO points on the same date, which
  // double-counts observations and makes "latest" ambiguous.
  //
  // Tie-break: prefer the snapshot with MORE rows (it covers more of the
  // query set — the weekly pipeline's --days 90 export beats a short one).
  const candidates = [];
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
    candidates.push({ fetchedAt, start, end, windowDays, rows, file: f });
  }

  const byDate = new Map();
  for (const c of candidates) {
    const prev = byDate.get(c.fetchedAt);
    if (!prev || c.rows.length > prev.rows.length) {
      if (prev) superseded.push(`${c.fetchedAt}: kept ${c.file} (${c.rows.length} rows) over ${prev.file} (${prev.rows.length} rows)`);
      byDate.set(c.fetchedAt, c);
    } else {
      superseded.push(`${c.fetchedAt}: kept ${prev.file} (${prev.rows.length} rows) over ${c.file} (${c.rows.length} rows)`);
    }
  }

  for (const c of [...byDate.values()].sort((a, b) => a.fetchedAt.localeCompare(b.fetchedAt))) {
    windows.push({ fetchedAt: c.fetchedAt, start: c.start, end: c.end, windowDays: c.windowDays, rows: c.rows.length });
    for (const r of c.rows) {
      const q = Array.isArray(r.keys) ? r.keys[0] : r.keys;
      if (!q) continue;
      if (!byQuery.has(q)) byQuery.set(q, []);
      byQuery.get(q).push({
        date: c.fetchedAt,
        position: typeof r.position === 'number' ? r.position : null,
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        ctr: r.ctr ?? null,
        windowDays: c.windowDays,
      });
    }
  }

  const distinctWindows = [...new Set(windows.map((w) => w.windowDays).filter((n) => n !== null))].sort((a, b) => a - b);
  // Comparability is judged on the LATEST export, not the whole history: if any
  // earlier snapshot shares the latest export's window length, the latest-vs-that
  // comparison is sound. Stale 10/31-day early exports must not poison it, so
  // per-row `previous` is chosen by matching window length (see below).
  const sortedWindows = windows.slice().sort((a, b) => a.fetchedAt.localeCompare(b.fetchedAt));
  const latestWindow = sortedWindows.length ? sortedWindows[sortedWindows.length - 1].windowDays : null;
  const comparable =
    latestWindow !== null &&
    sortedWindows.some(
      (w) => w !== sortedWindows[sortedWindows.length - 1] && w.windowDays === latestWindow
    );

  const keywords = [...byQuery.entries()].map(([query, points]) => {
    const sorted = points.slice().sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1] ?? null;
    // previous = most recent earlier point sharing latest's window length. This
    // skips interleaved stale short-window exports so a real Δ survives, and
    // yields null (no false Δ) when no same-window history exists.
    //
    // 🔴 MEASURED 2026-11-02: matching on window length ALONE is not enough.
    // GSC's `position` is the AVERAGE position over the rolling window, so two
    // 91-day windows that end one day apart overlap for 90 of 91 days — the
    // average barely moves and Δ collapses toward 0. Measured: pairing
    // 10-30→10-31 (1-day gap) yielded 402/405 "flat" and zero |Δ|≥3, while the
    // honest week-apart pairing 10-24→10-31 (7-day gap) yielded 11 up / 19
    // down / 375 flat. The 1-day version was a structural false "everything is
    // stable" — real movement was averaged out of existence.
    //
    // ⇒ A same-window previous point must ALSO be at least MIN_GSC_PAIR_GAP_DAYS
    // away, so the comparison spans a meaningful slice of non-overlapping time.
    // Below the threshold we keep walking back; if nothing qualifies, previous
    // stays null and Δ is withheld (never a false 0).
    let previous = null;
    if (latest) {
      for (let i = sorted.length - 2; i >= 0; i--) {
        if (sorted[i].windowDays !== null && sorted[i].windowDays === latest.windowDays) {
          const gap = Math.round(
            (Date.parse(latest.date + 'T00:00:00Z') - Date.parse(sorted[i].date + 'T00:00:00Z')) / 86400000
          );
          if (gap >= MIN_GSC_PAIR_GAP_DAYS) {
            previous = sorted[i];
            break;
          }
          // Same window but too close in time → keep walking further back.
        }
      }
    }
    const delta =
      latest && previous && latest.position !== null && previous.position !== null
        ? previous.position - latest.position
        : null;
    const spanDays =
      latest && previous
        ? Math.round((Date.parse(latest.date + 'T00:00:00Z') - Date.parse(previous.date + 'T00:00:00Z')) / 86400000)
        : null;
    return { query, points: sorted, latest, previous, delta, spanDays, observations: sorted.length };
  });
  keywords.sort((a, b) => b.observations - a.observations || a.query.localeCompare(b.query));

  const comparableRows = keywords.filter((k) => k.delta !== null);
  return {
    label: 'Google Search Console · query',
    snapshots: windows.length,
    windows,
    distinctWindowDays: distinctWindows,
    comparable,
    keywords,
    supersededSnapshots: superseded,
    totals: {
      keywords: keywords.length,
      multiPoint: keywords.filter((k) => k.observations > 1).length,
      comparable: comparableRows.length,
      up: comparableRows.filter((k) => k.delta > 0).length,
      down: comparableRows.filter((k) => k.delta < 0).length,
      flat: comparableRows.filter((k) => k.delta === 0).length,
      singlePoint: keywords.filter((k) => k.observations < 2).length,
    },
    caveats: comparable
      ? [
          `最新两次同窗口导出（${latestWindow} 天滚动窗口）可比，Δ 已计算。`,
          'GSC 的 position 是该窗口内的平均排名；两次窗口的间隔见各词 spanDays（至少 7 天，避免 91 天窗只挪 1 天导致的自比假稳定）。',
          '早期 10/31 天的零散导出已自动绕开，不参与 Δ 计算（避免把不同跨度平均值相减）。',
        ]
      : [
          `最新导出（${latestWindow} 天窗口）没有同窗口的历史快照可对比，Δ 暂不可用。`,
          '修法：用相同 --days 参数重跑 npm run fetch:gsc，积累第二个同窗口快照后即可算 Δ。',
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

// A CSV under 数据分析/ is a convenience export, not the deliverable. If
// another process holds it open on Windows (EBUSY), we must NOT fail the whole
// run — the canonical JSON has already been written by then. We warn loudly
// and continue, so the report can state which export is stale.
function writeCsvBestEffort(filePath, content, rowCount, extra = '') {
  try {
    writeFileAtomic(filePath, content);
    console.log(`  wrote ${filePath}  (${rowCount} rows${extra ? ' · ' + extra : ''})`);
    return true;
  } catch (e) {
    console.error(`  ⚠ 未能写入 ${filePath}：${e.code || e.message}`);
    console.error(`    （该文件被其他进程占用，可能是 Excel / 并行会话打开着；主产物 data/keyword-series.json 已正常写出）`);
    return false;
  }
}

function main() {
  const bing = buildBing();
  const gsc = buildGsc();

  if (!bing && !gsc) {
    console.error('No snapshots found in 数据分析/ — nothing to build.');
    process.exit(1);
  }

  // ── JSON for the workbench (CANONICAL — written FIRST) ──
  // Order matters: data/keyword-series.json is the tracked, durable copy of
  // this series. The CSVs under 数据分析/ are git-ignored convenience exports
  // that a parallel process can hold open on Windows (EBUSY, measured
  // 2026-11-02). Writing the canonical JSON first means a locked CSV can
  // never destroy the primary artifact — the run still produces its real
  // output, and only the convenience export is skipped.
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
  writeFileAtomic(OUT_JSON, JSON.stringify(out, null, 2));
  console.log(`  wrote ${OUT_JSON}`);

  // ── long series CSV (best-effort convenience export) ──
  {
    const rows = [];
    if (bing) {
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
    }
    if (gsc) {
      for (const k of gsc.keywords) {
        for (const p of k.points) {
          rows.push({
            Query: k.query,
            Date: p.date,
            Clicks: p.clicks,
            Impressions: p.impressions,
            AvgClickPosition: '',
            AvgImpressionPosition: p.position ?? '',
            Source: 'gsc',
            FetchedAt: p.date,
          });
        }
      }
    }
    rows.sort((a, b) => a.Query.localeCompare(b.Query) || a.Date.localeCompare(b.Date));
    const fp = join(DATA_DIR, 'keyword-rank-series.csv');
    writeCsvBestEffort(fp, toCsv(rows, ['Query', 'Date', 'Clicks', 'Impressions', 'AvgClickPosition', 'AvgImpressionPosition', 'Source', 'FetchedAt']), rows.length);
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
  {
    const rows = [];
    if (bing) {
      for (const k of bing.keywords) {
        rows.push({
          Source: 'bing',
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
        });
      }
    }
    if (gsc) {
      for (const k of gsc.keywords) {
        const hasDelta = gsc.comparable && k.delta !== null;
        rows.push({
          Source: 'gsc',
          Query: k.query,
          LatestDate: k.latest?.date ?? '',
          LatestPos: k.latest?.position ?? '',
          PrevDate: k.previous?.date ?? '',
          PrevPos: k.previous?.position ?? '',
          SpanDays: k.spanDays ?? '',
          Delta: hasDelta ? k.delta : '',
          Trend: !gsc.comparable ? 'n-a' : k.delta === null ? 'no-baseline' : k.delta > 0 ? 'up' : k.delta < 0 ? 'down' : 'flat',
          Impressions: k.latest?.impressions ?? '',
          Clicks: k.latest?.clicks ?? '',
          Observations: k.observations,
          Reasons: reasonMap.get(k.query) ?? '',
        });
      }
    }
    rows.sort((a, b) => a.Source.localeCompare(b.Source) || a.Query.localeCompare(b.Query));
    const fp = join(DATA_DIR, 'keyword-rank-latest.csv');
    writeCsvBestEffort(
      fp,
      toCsv(rows, ['Source', 'Query', 'LatestDate', 'LatestPos', 'PrevDate', 'PrevPos', 'SpanDays', 'Delta', 'Trend', 'Impressions', 'Clicks', 'Observations', 'Reasons']),
      rows.length,
      `bing ${bing ? bing.keywords.length : 0} · gsc ${gsc ? gsc.keywords.length : 0}`,
    );
  }

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
    const gt = gsc.totals;
    console.log(`  GSC   快照 ${gsc.snapshots} 个 · 唯一词 ${gt.keywords} · 多点词 ${gt.multiPoint}`);
    console.log(`        窗口长度：${gsc.distinctWindowDays.join(' / ')} 天 → 可比性 = ${gsc.comparable ? '是' : '否'}`);
    if (gsc.comparable) {
      console.log(`        可比 ${gt.comparable} → 上升 ${gt.up} / 下降 ${gt.down} / 持平 ${gt.flat} · 单点词 ${gt.singlePoint}`);
    }
    // Never let a discarded snapshot disappear silently — it means two exports
    // of the same date competed and one lost.
    if (gsc.supersededSnapshots?.length) {
      console.log(`  ⚠ 同日多份导出，取行数多者（丢弃 ${gsc.supersededSnapshots.length} 份）：`);
      for (const s of gsc.supersededSnapshots) console.log(`      - ${s}`);
    }
  }
  console.log('─'.repeat(64));
}

main();
