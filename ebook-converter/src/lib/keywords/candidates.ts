// src/lib/keywords/candidates.ts
// Evidence-based "why did this move" CANDIDATE generator.
//
// The ranking series only knows Δ (what changed), never the cause (why).
// This module turns MEASURABLE signals into HYPOTHESES that a human confirms.
// It never asserts a cause as fact. Two evidence sources are supported:
//
//   1. competitor pressure — from data/competitor-series.json
//      A monitored competitor gaining / newly entering the same query is a
//      data-derived signal that correlates with our own movement.
//
//   2. algorithm-update windows — from data/algorithm-updates.json (curated)
//      If our movement's date falls inside a known Google update window, that
//      is a correlation hint, NOT a confirmed cause.
//
// Output is deliberately kept SEPARATE from data/keyword-reasons.json (the
// confirmed, human-owned truth file). Nothing here is ever auto-written into
// that file — promotion is an explicit human action (confirm-keyword-reason.mjs).
//
// This module is imported by a CLIENT component (KeywordPanel), so it must
// stay free of node:fs — the disk read lives in ./loader.ts.

export type CandidateType = 'competitor' | 'algorithm' | 'no-competitor';
export type Confidence = 'high' | 'medium' | 'low';

export interface CandidateItem {
  type: CandidateType;
  confidence: Confidence;
  /** The hypothesis, phrased by a GEO operator. States correlation, not cause. */
  text: string;
  /** What measurable data supports this hypothesis. */
  evidence: string;
  /** Provenance, e.g. "competitor-series.json" or "algorithm-updates.json#core-2026-08". */
  source: string;
  /** Always true for now: a candidate is a correlation, never a proven cause. */
  relatedNotCausal: boolean;
}

export interface CandidateEntry {
  query: string;
  observed: {
    prevPos: number | null;
    latestPos: number | null;
    delta: number | null;
    prevDate: string | null;
    latestDate: string | null;
  };
  items: CandidateItem[];
}

export interface CandidateDoc {
  $schema: string;
  _readme: string[];
  generatedAt: string;
  d0: string;
  threshold: number;
  candidates: CandidateEntry[];
}

// ---- Loose input adapters (source-agnostic, easy to test) ----

export interface SeriesKeywordLike {
  query: string;
  delta: number | null;
  latest: { impressionPosition: number | null; date?: string } | null;
  previous: { impressionPosition: number | null; date?: string } | null;
}

export interface CompetitorRowLike {
  domain: string;
  name: string;
  query: string;
  latestRank: number | null;
  prevRank: number | null;
  delta: number | null;
  trend: string | null;
  latestDate: string | null;
}

export interface AlgoUpdateLike {
  id: string;
  name: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  note?: string;
}

export function dateInWindow(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

/**
 * Build candidate causes for every keyword whose rank moved by >= threshold
 * positions. Pure + deterministic — the single source of truth shared by the
 * CLI generator and the unit tests.
 */
export function buildCandidates(opts: {
  keywords: SeriesKeywordLike[];
  competitorMatrix: CompetitorRowLike[];
  algoUpdates: AlgoUpdateLike[];
  threshold?: number;
  d0?: string;
}): CandidateDoc {
  const threshold = opts.threshold ?? 3;
  const competitorsByQuery = new Map<string, CompetitorRowLike[]>();
  for (const c of opts.competitorMatrix) {
    const arr = competitorsByQuery.get(c.query);
    if (arr) arr.push(c);
    else competitorsByQuery.set(c.query, [c]);
  }

  const candidates: CandidateEntry[] = [];

  for (const k of opts.keywords) {
    if (k.delta === null) continue;
    if (Math.abs(k.delta) < threshold) continue;

    const items: CandidateItem[] = [];
    const prevPos = k.previous?.impressionPosition ?? null;
    const latestPos = k.latest?.impressionPosition ?? null;
    const prevDate = k.previous?.date ?? null;
    const latestDate = k.latest?.date ?? null;
    const dropped = k.delta < 0; // delta = prevPos − latestPos; <0 ⇒ latest is worse

    // 1) Competitor evidence — only claim anything when this query is actually
    //    monitored. "Not tracked" must never be reported as "no pressure";
    //    those are completely different statements.
    const comps = competitorsByQuery.get(k.query) ?? [];
    const direction = dropped ? '本词你方排名下降' : '本词你方排名上升';
    // A rival only evidences "pressure" when we MEASURED it improve.
    // With a single snapshot every ranked rival carries trend='new' and prevRank=null;
    // calling that "newly entered Top-100" would be a false statement — it just means
    // this is our first observation. Absence of a baseline cannot support a claim
    // about movement, so such rivals produce NO cause candidate (honest silence).
    const improving = comps.filter(
      (c) => c.latestRank !== null && c.prevRank !== null && c.latestRank < c.prevRank,
    );

    if (improving.length > 0) {
      const list = improving
        .map((c) => `${c.name}（${c.domain}）#${c.prevRank}→#${c.latestRank} 上升`)
        .join('；');
      items.push({
        type: 'competitor',
        confidence: 'high',
        text:
          `「${k.query}」${direction}（${prevPos ?? '?'}→${latestPos ?? '?'}），同期竞品 ${list}。` +
          `实测到竞品在此词排名上升，可能与你方排名变动相关（相关≠因果）。` +
          `建议核对：竞品该页的 schema/FAQ 覆盖、内容新鲜度、外链增长，以及你方对应页面近期是否改动。`,
        evidence: `competitor-series.json 中该 query 的竞品 latestRank 优于 prevRank（确有上升，非首次观测）；你方 Δ=${k.delta}。`,
        source: 'competitor-series.json',
        relatedNotCausal: true,
      });
    } else if (comps.length > 0 && comps.every((c) => c.latestRank === null)) {
      // We looked and none of the monitored rivals is in the Top-100. That is
      // itself evidence: it narrows the cause AWAY from these rivals — but it
      // does not rule out rivals we are not tracking, nor non-competitor causes.
      items.push({
        type: 'no-competitor',
        confidence: 'medium',
        text:
          `「${k.query}」${direction}（${prevPos ?? '?'}→${latestPos ?? '?'}），但已监测的 ${comps.length} 个竞品在本词**均未进入 Top-100**。` +
          `未见已监测竞品的挤压；不排除未监测竞品、算法更新、季节性或自身页面改动所致。` +
          `建议人工核对 SERP 实际结果，以及该词对应页面近期是否改动。`,
        evidence: `competitor-series.json 中该 query 的 ${comps.length} 个竞品 latestRank 全为 null（Top-100 外）；你方 Δ=${k.delta}。`,
        source: 'competitor-series.json',
        relatedNotCausal: true,
      });
    }

    // 2) Algorithm-update window
    const d = latestDate ?? opts.d0 ?? '';
    for (const u of opts.algoUpdates) {
      if (d && dateInWindow(d, u.start, u.end)) {
        items.push({
          type: 'algorithm',
          confidence: 'medium',
          text:
            `排名变动发生在 Google 已知更新窗口（${u.name}，${u.start}–${u.end}）内。` +
            `算法更新可能整体重排该词结果，属相关性提示，非确定因果。建议观察 2–4 周是否稳定再下结论。`,
          evidence: `latestDate ${d} 落在 ${u.name} 窗口内。`,
          source: `algorithm-updates.json#${u.id}`,
          relatedNotCausal: true,
        });
      }
    }

    if (items.length > 0) {
      candidates.push({
        query: k.query,
        observed: { prevPos, latestPos, delta: k.delta, prevDate, latestDate },
        items,
      });
    }
  }

  return {
    $schema: 'keyword-reason-candidates/v1',
    _readme: [
      '证据驱动的「为什么排名变动」候选原因。由 scripts/suggest-keyword-reasons.mjs 生成，不要手改。',
      '每条候选是 HYPOTHESIS（相关≠因果），需人确认后才写入 data/keyword-reasons.json（真相文件）。',
      '晋升：node scripts/confirm-keyword-reason.mjs "<query>" <itemIndex>',
    ],
    generatedAt: new Date().toISOString(),
    d0: opts.d0 ?? '',
    threshold,
    candidates,
  };
}

/** query -> the candidate entry (all its items). Client-side join helper. */
export function latestCandidateByQuery(
  candidates: CandidateEntry[],
): Map<string, CandidateEntry> {
  const m = new Map<string, CandidateEntry>();
  for (const c of candidates) {
    if (!m.has(c.query)) m.set(c.query, c);
  }
  return m;
}

/** Pick a single candidate item by query + index, for the promotion CLI. */
export function pickCandidate(
  doc: CandidateDoc,
  query: string,
  index: number,
): CandidateItem | null {
  const entry = doc.candidates.find((c) => c.query === query);
  if (!entry) return null;
  return entry.items[index] ?? null;
}
