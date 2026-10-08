// src/lib/keywords/decisions.ts
// Types + pure helpers for the HUMAN decision ledger.
//
// The generated series (keyword-series.json / competitor-series.json) only
// carries what the APIs return — ranks, impressions, Δ. The spec sheets also
// demand columns that are judgement calls: Intent, Main Gap, Action, Priority,
// Recheck, Result (keyword) and New-Updated Page, Content Difference,
// AI Mention-Citation, Our Gap, Action (competitor).
//
// Those live here, hand-maintained in git, keyed by query / domain+query. The
// panels render them and scripts/export-sheets.mjs writes them into the CSVs.
// Keeping them in ONE ledger (rather than inside a CSV) is what stops the sheet
// and the panel from drifting apart.
//
// Client-safe: no node:fs (the disk read lives in ./loader.ts).

export type DecisionPriority = 'P0' | 'P1' | 'P2' | 'P3';

/** One keyword's judgement columns. Only `query` is required. */
export interface KeywordDecision {
  query: string;
  intent?: string;
  targetUrl?: string;
  mainGap?: string;
  action?: string;
  priority?: DecisionPriority;
  /** YYYY-MM-DD — when to look again (§5-5 recheck queue). */
  recheck?: string;
  result?: string;
  updatedAt?: string;
}

/** One competitor×keyword judgement row. Keyed by `domain` + `query`. */
export interface CompetitorDecision {
  domain: string;
  query: string;
  /** A competitor page that was newly published or visibly updated. */
  newPage?: string;
  contentDiff?: string;
  /** Free text: where this competitor appears in AI answers (GEO probes). */
  aiMention?: string;
  ourGap?: string;
  action?: string;
  updatedAt?: string;
}

export const KEYWORD_DECISIONS_PATH = 'data/keyword-decisions.json';
export const COMPETITOR_DECISIONS_PATH = 'data/competitor-decisions.json';

/** query -> most recent decision (later updatedAt wins; entries without one
 *  keep their original position, so an untouched seed file still resolves). */
export function latestDecisionByQuery(decisions: KeywordDecision[]): Map<string, KeywordDecision> {
  const m = new Map<string, KeywordDecision>();
  const sorted = decisions
    .slice()
    .sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')));
  for (const d of sorted) {
    if (!m.has(d.query)) m.set(d.query, d);
  }
  return m;
}

/** `domain|query` -> decision. */
export function competitorDecisionKey(domain: string, query: string): string {
  return `${domain}|${query}`;
}

export function latestCompetitorDecisionByKey(
  decisions: CompetitorDecision[],
): Map<string, CompetitorDecision> {
  const m = new Map<string, CompetitorDecision>();
  const sorted = decisions
    .slice()
    .sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')));
  for (const d of sorted) {
    const k = competitorDecisionKey(d.domain, d.query);
    if (!m.has(k)) m.set(k, d);
  }
  return m;
}
