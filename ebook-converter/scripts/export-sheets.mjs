// scripts/export-sheets.mjs
// Export the two spec sheets as CSV, DERIVED from the single source of truth:
//
//   数据分析/keyword-optimization-sheet.csv   (15 cols — M1-1)
//   数据分析/competitor-tracking.csv          (11 cols — M7-1)
//
// The generated series + the human ledgers are the source; these CSVs are a
// VIEW. Regenerate any time — never hand-edit them, or they drift from the
// /admin panels that render the same data.
//
//   node scripts/export-sheets.mjs
//
// ⚠ deriveIntent / deriveTargetUrl below mirror src/lib/keywords/meta.ts. Keep
// the two in sync (the panel uses the TS copy; this script is plain node so it
// cannot import TS).
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DATA_DIR = join(ROOT, '数据分析');
const OUT_KEYWORD = join(DATA_DIR, 'keyword-optimization-sheet.csv');
const OUT_COMPETITOR = join(DATA_DIR, 'competitor-tracking.csv');

function readJson(rel, fallback) {
  const fp = join(ROOT, rel);
  if (!existsSync(fp)) return fallback;
  try {
    return JSON.parse(readFileSync(fp, 'utf8'));
  } catch {
    return fallback;
  }
}

function readEntries(rel) {
  const doc = readJson(rel, { entries: [] });
  return Array.isArray(doc.entries) ? doc.entries : [];
}

/** The 31 real convert slugs, read straight off the shipped content files. */
function convertSlugs() {
  const dir = join(ROOT, 'src', 'data', 'content');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
    .map((f) => f.replace(/\.ts$/, ''));
}

// --- mirrors src/lib/keywords/meta.ts --------------------------------------
const SLUG_ALIAS = { docx: 'word', text: 'txt', mobi: 'mobi' };

function deriveTargetUrl(query, slugs) {
  const q = ` ${String(query).toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()} `;
  const m = q.match(/\s([a-z0-9]{2,8}) to ([a-z0-9]{2,8})\s/);
  if (!m) return '';
  const set = new Set(slugs);
  for (const slug of [
    `${m[1]}-to-${m[2]}`,
    `${SLUG_ALIAS[m[1]] ?? m[1]}-to-${SLUG_ALIAS[m[2]] ?? m[2]}`,
  ]) {
    if (set.has(slug)) return `/convert/${slug}`;
  }
  return '';
}

function deriveIntent(query) {
  const q = String(query).toLowerCase();
  if (/\bvs\b|\bversus\b|difference|compatib|which (is|format|should)/.test(q)) return '格式对比';
  if (/best |alternative|top \d|which (converter|tool|app)|recommend/.test(q)) return '对比工具';
  if (/^how |how to|tutorial|\bguide\b|\bsteps?\b|^can (i|you) |send .* to|read .* on/.test(q)) return '操作指南';
  if (/harry potter|lord of the rings|twilight|narnia|marvel|hunger games|novel|fiction|series\b/.test(q)) return 'IP内容';
  if (/kindle|kobo|nook|reader|reading|device|tablet|ipad|iphone|android/.test(q)) return '阅读器/使用';
  if (/\b[a-z0-9]{2,8} to [a-z0-9]{2,8}\b/.test(q)) return '转换需求';
  if (/\bconvert|converter|to (epub|mobi|pdf|azw3|txt|docx|word|html|rtf|lit|fb2|chm|djvu|cbr)\b/.test(q)) return '转换需求';
  return '其他';
}

function competitorsForQuery(query, competitors) {
  const needle = String(query).trim().toLowerCase();
  return (competitors || [])
    .filter((c) => (c.overlapKeywords || []).some((k) => String(k).trim().toLowerCase() === needle))
    .map((c) => c.name);
}
// ---------------------------------------------------------------------------

function csvEscape(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(header, rows) {
  // BOM so Excel/WPS opens the Chinese headers as UTF-8.
  return '\ufeff' + [header, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n') + '\n';
}

function latestByKey(entries, keyFn) {
  const m = new Map();
  for (const e of entries.slice().sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')))) {
    const k = keyFn(e);
    if (!m.has(k)) m.set(k, e);
  }
  return m;
}

function exportKeywordSheet() {
  const series = readJson('data/keyword-series.json', null);
  if (!series?.bing?.keywords?.length && !series?.gsc?.keywords?.length) {
    console.warn('⚠ 跳过关键词表：data/keyword-series.json 缺失或为空（先跑 npm run build:keywords）。');
    return 0;
  }
  const reasons = latestByKey(readEntries('data/keyword-reasons.json'), (e) => e.query);
  const decisions = latestByKey(readEntries('data/keyword-decisions.json'), (e) => e.query);
  const cfg = readJson('data/competitor-config.json', { competitors: [] });
  const slugs = convertSlugs();

  // Columns 1–15 are exactly the spec sheet. Source is appended as col 16 so a
  // reader can tell Bing from Google — the two channels are never merged inside
  // a row (project rule: 双渠道各自独立记分).
  const header = [
    'Keyword', 'Intent', 'Target URL', 'Current Rank', 'Previous Rank', 'Δ',
    'Impressions', 'Clicks', 'Competitors', 'Main Gap', 'Action', 'Priority',
    'Date', 'Recheck', 'Result',
    'Source',
  ];

  // One row per (keyword, channel) — the fixed business words live in GSC, the
  // long tail in Bing, so dropping either would leave the sheet incomplete.
  const flat = [];
  for (const k of series.bing?.keywords ?? []) {
    flat.push({
      query: k.query, source: 'Bing',
      cur: k.latest?.impressionPosition ?? '',
      prev: k.previous?.impressionPosition ?? '',
      delta: k.delta ?? '',
      imp: k.latest?.impressions ?? '',
      clicks: k.latest?.clicks ?? '',
      date: k.latest?.date ?? '',
    });
  }
  for (const k of series.gsc?.keywords ?? []) {
    const pts = k.points ?? [];
    const latest = pts[pts.length - 1] ?? null;
    const prev = pts.length > 1 ? pts[pts.length - 2] : null;
    // GSC windows differ in length → Δ is only meaningful when they agree.
    let delta = '';
    if (
      latest && prev && latest.windowDays && latest.windowDays === prev.windowDays &&
      latest.position != null && prev.position != null
    ) {
      delta = Math.round(prev.position) - Math.round(latest.position);
    }
    flat.push({
      query: k.query, source: 'GSC',
      cur: latest?.position != null ? Math.round(latest.position) : '',
      prev: prev?.position != null ? Math.round(prev.position) : '',
      delta,
      imp: latest?.impressions ?? '',
      clicks: latest?.clicks ?? '',
      date: latest?.date ?? '',
    });
  }

  const prioRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
  const rows = flat
    .sort((a, b) => {
      const pa = prioRank[decisions.get(a.query)?.priority] ?? 9;
      const pb = prioRank[decisions.get(b.query)?.priority] ?? 9;
      if (pa !== pb) return pa - pb;
      const da = Math.abs(Number(a.delta) || 0);
      const db = Math.abs(Number(b.delta) || 0);
      if (da !== db) return db - da;
      return (Number(b.imp) || 0) - (Number(a.imp) || 0);
    })
    .map((r) => {
      const d = decisions.get(r.query) || {};
      const reason = reasons.get(r.query) || {};
      const overlap = competitorsForQuery(r.query, cfg.competitors);
      return [
        r.query,
        d.intent || deriveIntent(r.query),
        d.targetUrl || deriveTargetUrl(r.query, slugs),
        r.cur,
        r.prev,
        r.delta,
        r.imp,
        r.clicks,
        overlap.join('、'),
        d.mainGap || '',
        d.action || '',
        d.priority || '',
        r.date,
        d.recheck || '',
        d.result || reason.reason || '',
        r.source,
      ];
    });

  writeFileSync(OUT_KEYWORD, toCsv(header, rows), 'utf8');
  const bingN = flat.filter((r) => r.source === 'Bing').length;
  const gscN = flat.filter((r) => r.source === 'GSC').length;
  console.log(`✓ 关键词表 → ${OUT_KEYWORD}（${rows.length} 行 × ${header.length} 列；Bing ${bingN} + GSC ${gscN}）`);
  return rows.length;
}

function exportCompetitorSheet() {
  const series = readJson('data/competitor-series.json', null);
  if (!series?.matrix?.length) {
    console.warn('⚠ 跳过竞品表：data/competitor-series.json 缺失或 matrix 为空（先跑 npm run build:competitor）。');
    return 0;
  }
  const decisions = latestByKey(readEntries('data/competitor-decisions.json'), (e) => `${e.domain}|${e.query}`);

  const header = [
    'Date', 'Competitor', 'Keyword', 'Competitor URL', 'Rank',
    'New-Updated Page', 'Content Difference', 'SERP Change',
    'AI Mention-Citation', 'Our Gap', 'Action',
  ];

  const rows = series.matrix.map((r) => {
    const d = decisions.get(`${r.domain}|${r.query}`) || {};
    const serpChange = r.delta === null ? r.trend : `${r.trend} (Δ${r.delta > 0 ? '+' : ''}${r.delta})`;
    return [
      r.latestDate ?? '',
      r.name,
      r.query,
      r.url ?? '',
      r.latestRank ?? '',
      d.newPage || '',
      d.contentDiff || '',
      serpChange,
      d.aiMention || '',
      d.ourGap || '',
      d.action || '',
    ];
  });

  writeFileSync(OUT_COMPETITOR, toCsv(header, rows), 'utf8');
  console.log(`✓ 竞品表 → ${OUT_COMPETITOR}（${rows.length} 行 × ${header.length} 列）`);
  return rows.length;
}

console.log('导出规范表（单一真相源 → CSV 视图）…');
const a = exportKeywordSheet();
const b = exportCompetitorSheet();
if (a === 0 && b === 0) {
  console.error('✗ 两份数据源都不可用，未产出任何文件。');
  process.exit(1);
}
console.log('约定：关键词表 Δ = 前一期 − 最新（正 = 名次上升）；竞品表 Δ 正 = 竞品上升。');
