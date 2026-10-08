// src/lib/keywords/meta.ts
// Pure, client-safe helpers that DERIVE the sheet columns the raw series does
// not carry: Intent / Target URL / overlapping competitors.
//
// These are best-effort derivations from the keyword text itself. When a
// keyword matches no known pattern we return null and let the human decision
// ledger (data/keyword-decisions.json) fill the cell instead — we never invent
// a target page that does not exist.
//
// Imported by CLIENT components → must stay free of node:fs.

/** Intent taxonomy — reuses the buckets already used by the GEO reports. */
export type KeywordIntent =
  | '格式对比'
  | '对比工具'
  | '操作指南'
  | 'IP内容'
  | '阅读器/使用'
  | '转换需求'
  | '其他';

export const KEYWORD_INTENTS: KeywordIntent[] = [
  '格式对比',
  '对比工具',
  '操作指南',
  'IP内容',
  '阅读器/使用',
  '转换需求',
  '其他',
];

/**
 * Classify a keyword by its dominant user intent.
 *
 * Order matters: the first bucket that matches wins, and the buckets are
 * arranged from most specific to most generic so e.g. "how to read harry
 * potter epub on kindle" lands in 操作指南 (instructional) rather than IP内容.
 */
export function deriveIntent(query: string): KeywordIntent {
  const q = query.toLowerCase();
  if (/\bvs\b|\bversus\b|difference|compatib|which (is|format|should)/.test(q)) return '格式对比';
  if (/best |alternative|top \d|which (converter|tool|app)|recommend/.test(q)) return '对比工具';
  if (/^how |how to|tutorial|\bguide\b|\bsteps?\b|^can (i|you) |send .* to|read .* on/.test(q)) {
    return '操作指南';
  }
  if (/harry potter|lord of the rings|twilight|narnia|marvel|hunger games|novel|fiction|series\b/.test(q)) {
    return 'IP内容';
  }
  if (/kindle|kobo|nook|reader|reading|device|tablet|ipad|iphone|android/.test(q)) return '阅读器/使用';
  // "X to Y" format-pair shape is the strongest conversion signal — catches
  // pairs whose formats are not in the explicit list below (e.g. "epub to zip").
  if (/\b[a-z0-9]{2,8} to [a-z0-9]{2,8}\b/.test(q)) return '转换需求';
  if (/\bconvert|converter|to (epub|mobi|pdf|azw3|txt|docx|word|html|rtf|lit|fb2|chm|djvu|cbr)\b/.test(q)) {
    return '转换需求';
  }
  return '其他';
}

/** Format-name aliases: the search term vs. the slug the site actually ships. */
const SLUG_ALIAS: Record<string, string> = {
  docx: 'word',
  text: 'txt',
  mobi: 'mobi',
};

/**
 * Derive the on-site landing page for a "convert X to Y" keyword.
 *
 * Returns `/convert/<src>-to-<dst>` ONLY when that slug really exists in
 * `convertSlugs` (callers pass Object.keys(CONTENT_MAP) so the panel and the
 * site can never disagree). Everything else returns null on purpose.
 */
export function deriveTargetUrl(query: string, convertSlugs: string[]): string | null {
  const q = ` ${query.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()} `;
  const m = q.match(/\s([a-z0-9]{2,8}) to ([a-z0-9]{2,8})\s/);
  if (!m) return null;
  const set = new Set(convertSlugs);
  const candidates = [
    `${m[1]}-to-${m[2]}`,
    `${SLUG_ALIAS[m[1]] ?? m[1]}-to-${SLUG_ALIAS[m[2]] ?? m[2]}`,
  ];
  for (const slug of candidates) {
    if (set.has(slug)) return `/convert/${slug}`;
  }
  return null;
}

/** Minimal shape of the competitor config we need here (kept structural so the
 *  client does not have to import the whole config type). */
export interface CompetitorOverlapSource {
  name: string;
  overlapKeywords?: string[];
}

/**
 * Names of the monitored competitors whose overlap-keyword list contains this
 * keyword. Case-insensitive exact match — no fuzzy guessing.
 */
export function competitorsForQuery(
  query: string,
  competitors: CompetitorOverlapSource[] | null | undefined,
): string[] {
  if (!competitors?.length) return [];
  const needle = query.trim().toLowerCase();
  const out: string[] = [];
  for (const c of competitors) {
    if ((c.overlapKeywords || []).some((k) => k.trim().toLowerCase() === needle)) {
      out.push(c.name);
    }
  }
  return out;
}
