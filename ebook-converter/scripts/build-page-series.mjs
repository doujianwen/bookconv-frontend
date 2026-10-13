#!/usr/bin/env node
// scripts/build-page-series.mjs
//
// Stitch the Bing PageTraffic snapshots in 数据分析/ into ONE comparable
// page × date series.
//
// Why this file has to exist (M18)
// ───────────────────────────────
// `fetch-bing-webmaster.mjs` already pulls `GetPageStats` on every run and the
// CSVs have been sitting in 数据分析/ since 2026-09-19 — 13 snapshots, 67 URLs,
// 9 weekly buckets. Nothing consumed them: `build-keyword-series.mjs` only reads
// `_BingAPI_Query_*.csv`.
//
// The trap that hid this data
// ──────────────────────────
// `GetPageStats` puts the PAGE URL in a column literally named `Query`, and the
// CSV header is hardcoded from the `jobs` whitelist in the fetcher. So the
// landed CSV looks like a keyword report (`Date,Query,Clicks,...`) with no page
// column at all. Reading only the header — as I did on 2026-10-13 — leads to
// the false conclusion "Bing never returns a landing page". It does; the
// fetcher's own column list hides it. Verified: 67/67 values in that column are
// http URLs.
//
// So this is PAGE-level data (one row per page per week), NOT a query→page map.
// Distinguishing the two matters: page-level says "this URL's average position
// moved"; a query→page map would say "this specific query now ranks this URL".
// Bing gives the former. Only GSC's dimensions:['query','page'] gives the
// latter (see build-page-attribution.mjs, M17).
//
// Comparability rules (deliberately conservative)
// ───────────────────────────────────────────────
//   • Δ = previous bucket position − latest bucket position (positive = up).
//   • A page with only ONE observation gets NO Δ. Calling a page's direction
//     off a single week is noise, and these are weekly averages over tiny
//     impression counts.
//   • totalImpressions is carried on every row so a reader can see the
//     denominator before trusting a Δ. Pages under ~30 impressions across the
//     whole series are flagged `lowVolume` — their Δ is reported but must not be
//     read as a trend.
//   • The 7-day cap on this endpoint (measured 2026-09-25) means each fetch
//     only sees the most recent weeks. History exists only because we keep
//     re-fetching. A missing bucket is a missing bucket, never a zero.
//
// Outputs
// ───────
//   数据分析/page-rank-series.csv   long:  one row per (page, date)
//   数据分析/page-rank-latest.csv   wide:  one row per page, latest vs previous + Δ
//   data/page-series.json          the same data, for the workbench / M17
//
// Usage:  node scripts/build-page-series.mjs
//
// NOTE: 数据分析/ is git-ignored; data/page-series.json IS tracked.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const DATA_DIR = join(ROOT, '数据分析');
const OUT_JSON = join(ROOT, 'data', 'page-series.json');

const D0 = '2026-09-27'; // project day-zero, used only for reporting

// Below this many impressions across the WHOLE series, a Δ is reported but the
// page is flagged lowVolume. Calibrated against the 2026-10-13 measurement:
// 42 comparable pages, of which 11 reached ≥30 impressions; the median
// comparable page sat near 25. 30 is roughly where the series stops being
// single-digit noise without being so high that almost nothing qualifies.
const LOW_VOLUME_IMPRESSIONS = 30;

// ────────────────────────────────────────────────────────────── CSV parsing
// Reuses the same careful parser as build-keyword-series.mjs: URLs and scraped
// page text can contain commas and stray markup.
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

// This is the load-bearing guard for M18. Anything that is not an http(s) URL in
// the Query column is NOT a page row — measured 67/67 were URLs, but a single
// leaked value would otherwise become a bogus "page" with its own Δ.
function normalizePageUrl(raw) {
  const v = (raw ?? '').trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) return null;
  if (/#R#|<[a-z][^>]*>|&nbsp;/i.test(v)) return null; // scraped-text leakage
  try {
    const u = new URL(v);
    // Drop the fragment; keep the query string (a page filtered by ?q= is still
    // that page for our purposes) and normalise the trailing slash away so
    // /es and /es/ do not become two pages.
    u.hash = '';
    let s = u.toString();
    if (s.endsWith('/') && u.pathname !== '/') s = s.slice(0, -1);
    return s;
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────── Bing PageTraffic
// Snapshot filename carries the FETCH date; the Date column carries the DATA
// date (a weekly bucket). Later fetch wins for the same (page, dataDate).
function loadSnapshots() {
  if (!existsSync(DATA_DIR)) return [];
  const files = readdirSync(DATA_DIR)
    .filter((f) => /_BingAPI_PageTraffic_\d{4}_\d{2}_\d{2}\.csv$/.test(f))
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

function build() {
  const snaps = loadSnapshots();
  if (snaps.length === 0) return null;

  // page -> dataDate -> { clicks, impressions, clickPos, impPos, fetchedAt }
  const byPage = new Map();
  let observations = 0;
  let droppedNonUrl = 0;
  let droppedNoDate = 0;

  for (const snap of snaps) {
    for (const r of snap.rows) {
      const page = normalizePageUrl(r.Query);
      if (!page) { droppedNonUrl++; continue; }
      const d = (r.Date ?? '').trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) { droppedNoDate++; continue; }
      observations++;
      if (!byPage.has(page)) byPage.set(page, new Map());
      const bucket = byPage.get(page);
      const prev = bucket.get(d);
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

  const pages = [];
  for (const [page, bucket] of byPage) {
    const points = [...bucket.values()].sort((a, b) => a.date.localeCompare(b.date));
    const latest = points[points.length - 1] ?? null;
    const previous = points.length > 1 ? points[points.length - 2] : null;
    const delta =
      latest && previous && latest.impressionPosition !== null && previous.impressionPosition !== null
        ? previous.impressionPosition - latest.impressionPosition
        : null;
    const spanDays =
      latest && previous
        ? Math.round(
            (Date.parse(latest.date + 'T00:00:00Z') - Date.parse(previous.date + 'T00:00:00Z')) / 86400000
          )
        : null;
    // Denominator the reader needs before trusting Δ.
    const totalImpressions = points.reduce((s, p) => s + p.impressions, 0);
    const lowVolume = totalImpressions < LOW_VOLUME_IMPRESSIONS;
    pages.push({
      page,
      points,
      latest,
      previous,
      delta,
      spanDays,
      observations: points.length,
      totalImpressions,
      totalClicks: points.reduce((s, p) => s + p.clicks, 0),
      lowVolume,
    });
  }

  // Most-observed first, then heaviest, so the pages that matter surface.
  pages.sort(
    (a, b) =>
      b.observations - a.observations ||
      b.totalImpressions - a.totalImpressions ||
      (a.latest?.impressionPosition ?? 999) - (b.latest?.impressionPosition ?? 999) ||
      a.page.localeCompare(b.page)
  );

  const comparable = pages.filter((p) => p.delta !== null);
  const weeks = [...new Set(pages.flatMap((p) => p.points.map((x) => x.date)))].sort();

  return {
    label: 'Bing Webmaster API · GetPageStats（页面级，非 query→page 映射）',
    granularity: 'weekly bucket (AvgImpressionPosition over the bucket)',
    snapshots: snaps.length,
    firstFetch: snaps[0].fetchedAt,
    lastFetch: snaps[snaps.length - 1].fetchedAt,
    observations,
    droppedNonUrl,
    droppedNoDate,
    weeks,
    pages,
    totals: {
      pages: pages.length,
      comparable: comparable.length,
      up: comparable.filter((p) => p.delta > 0).length,
      down: comparable.filter((p) => p.delta < 0).length,
      flat: comparable.filter((p) => p.delta === 0).length,
      singlePoint: pages.filter((p) => p.observations < 2).length,
      lowVolume: comparable.filter((p) => p.lowVolume).length,
    },
    caveats: [
      'GetPageStats 的数据放在名为 `Query` 的列里，实际内容是页面 URL（实测 67/67 均为 http URL）。落盘 CSV 的表头由 fetch-bing-webmaster.mjs 的 jobs 白名单写死，不含独立 page 列 —— 别据表头断言「Bing 无落地页」。',
      '这是【页面级】数据：每行 = 某 URL 在某周桶的平均位置。它不能回答「某个 query 落在哪个 URL」——单词→页面的唯一来源是 GSC 的 dimensions:[\'query\',\'page\']。',
      `GetPageStats 与 GetQueryStats 同样受约 7 天窗口限制（实测 2026-09-25），历史只能靠每次重跑累积。当前 ${snaps.length} 个快照、${weeks.length} 个周桶（${weeks[0] ?? '—'} → ${weeks[weeks.length - 1] ?? '—'}）。`,
      'Δ = 上一周桶位置 − 本周桶位置；两桶间隔见 spanDays。缺桶就是缺桶，绝不按 0 处理。',
      `只有 ≥2 个观测点的页面才有 Δ；单点页面（${pages.filter((p) => p.observations < 2).length} 个）无法判断趋势。`,
      `累计展示 < ${LOW_VOLUME_IMPRESSIONS} 的页面标记 lowVolume=true：其 Δ 照常输出，但不足以支撑趋势结论，只可读作方向。`,
      '位置是周桶内均值，样本量极小时波动剧烈；请连同 totalImpressions 一起读，不要单看 Δ 数字。',
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
  const series = build();

  if (!series) {
    console.error('No _BingAPI_PageTraffic_*.csv snapshots found in 数据分析/ — run npm run fetch:bing first.');
    process.exit(1);
  }

  // ── long series CSV ──
  {
    const rows = [];
    for (const p of series.pages) {
      for (const pt of p.points) {
        rows.push({
          Page: p.page,
          Date: pt.date,
          Clicks: pt.clicks,
          Impressions: pt.impressions,
          AvgClickPosition: pt.clickPosition ?? '',
          AvgImpressionPosition: pt.impressionPosition ?? '',
          FetchedAt: pt.fetchedAt,
        });
      }
    }
    rows.sort((a, b) => a.Page.localeCompare(b.Page) || a.Date.localeCompare(b.Date));
    const fp = join(DATA_DIR, 'page-rank-series.csv');
    writeFileSync(
      fp,
      toCsv(rows, ['Page', 'Date', 'Clicks', 'Impressions', 'AvgClickPosition', 'AvgImpressionPosition', 'FetchedAt']),
      'utf8'
    );
    console.log(`  wrote ${fp}  (${rows.length} rows)`);
  }

  // ── latest/previous + Δ CSV ──
  {
    const rows = series.pages.map((p) => ({
      Page: p.page,
      LatestDate: p.latest?.date ?? '',
      LatestPos: p.latest?.impressionPosition ?? '',
      PrevDate: p.previous?.date ?? '',
      PrevPos: p.previous?.impressionPosition ?? '',
      SpanDays: p.spanDays ?? '',
      Delta: p.delta === null ? '' : p.delta,
      Trend:
        p.delta === null ? 'no-baseline' : p.delta > 0 ? 'up' : p.delta < 0 ? 'down' : 'flat',
      TotalImpressions: p.totalImpressions,
      TotalClicks: p.totalClicks,
      Observations: p.observations,
      LowVolume: p.lowVolume ? 'yes' : 'no',
    }));
    const fp = join(DATA_DIR, 'page-rank-latest.csv');
    writeFileSync(
      fp,
      toCsv(rows, [
        'Page', 'LatestDate', 'LatestPos', 'PrevDate', 'PrevPos', 'SpanDays',
        'Delta', 'Trend', 'TotalImpressions', 'TotalClicks', 'Observations', 'LowVolume',
      ]),
      'utf8'
    );
    console.log(`  wrote ${fp}  (${rows.length} rows)`);
  }

  // ── JSON ──
  const out = {
    $schema: 'page-series/v1',
    _readme: [
      '本文件由 scripts/build-page-series.mjs 从 数据分析/*_BingAPI_PageTraffic_*.csv 生成，不要手改。',
      '重跑：node scripts/build-page-series.mjs',
      'Δ = 上一周桶位置 − 本周桶位置。正数 = 名次上升（数字变小）。',
      '页面级数据：每行 = 某 URL 的周桶平均位置，不含 query→page 映射。',
      '只有 ≥2 个观测点的页面才有 Δ；lowVolume 页面的 Δ 不足以支撑趋势结论。',
    ],
    generatedAt: new Date().toISOString(),
    d0: D0,
    ...series,
  };
  if (!existsSync(join(ROOT, 'data'))) mkdirSync(join(ROOT, 'data'), { recursive: true });
  writeFileSync(OUT_JSON, JSON.stringify(out, null, 2), 'utf8');
  console.log(`  wrote ${OUT_JSON}`);

  // ── summary ──
  const t = series.totals;
  console.log('\npage series (M18)');
  console.log('─'.repeat(64));
  console.log(`  Bing PageTraffic 快照 ${series.snapshots} 个（${series.firstFetch} → ${series.lastFetch}）`);
  console.log(`        观测 ${series.observations} 条 · 周桶 ${series.weeks.length} 个 · 页面 ${t.pages}（丢弃非 URL ${series.droppedNonUrl} / 丢弃无日期 ${series.droppedNoDate}）`);
  console.log(`        可比(≥2点) ${t.comparable} → 上升 ${t.up} / 下降 ${t.down} / 持平 ${t.flat}`);
  console.log(`        单点页面 ${t.singlePoint}（无法判断趋势）`);
  console.log(`        其中 lowVolume（累计展示 < ${LOW_VOLUME_IMPRESSIONS}）${t.lowVolume} 个 —— Δ 只可读方向`);
  console.log('─'.repeat(64));
}

main();