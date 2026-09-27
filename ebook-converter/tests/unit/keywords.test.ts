// tests/unit/keywords.test.ts
// Tests for the keyword-ranking series helpers + loader.
//
// Two kinds of coverage:
//   - pure helpers (isMoving / sortRows): no disk, lock the ordering contract
//     the table UI relies on.
//   - loader: the generated data/keyword-series.json is the ONLY thing the
//     /admin/keywords panel renders, so its shape must not drift silently.
import { isMoving, sortRows, latestReasonByQuery, type KeywordRow, type KeywordReason, type SortKey, type SortDir } from '@/lib/keywords/series';
import { loadKeywordSeries, loadKeywordReasons, loadKeywordReasonCandidates } from '@/lib/keywords/loader';
import { buildCandidates, latestCandidateByQuery, pickCandidate, type SeriesKeywordLike, type CompetitorRowLike, type AlgoUpdateLike } from '@/lib/keywords/candidates';

function row(query: string, over: Partial<KeywordRow> = {}): KeywordRow {
  return {
    query,
    points: [],
    latest: null,
    previous: null,
    delta: null,
    spanDays: null,
    observations: 1,
    ...over,
  };
}

describe('isMoving', () => {
  it('is false when there is no baseline (delta null)', () => {
    expect(isMoving(row('a'))).toBe(false);
  });
  it('is false when the position is unchanged (delta 0)', () => {
    expect(isMoving(row('a', { delta: 0 }))).toBe(false);
  });
  it('is true for any non-zero movement, up or down', () => {
    expect(isMoving(row('a', { delta: 3 }))).toBe(true);
    expect(isMoving(row('a', { delta: -2 }))).toBe(true);
  });
});

describe('sortRows', () => {
  const rows: KeywordRow[] = [
    row('gamma', { delta: null, latest: { date: '', clicks: 0, impressions: 0, clickPosition: null, impressionPosition: 5, fetchedAt: '' } }),
    row('alpha', { delta: 2, latest: { date: '', clicks: 0, impressions: 0, clickPosition: null, impressionPosition: 1, fetchedAt: '' } }),
    row('beta', { delta: -1, latest: { date: '', clicks: 0, impressions: 0, clickPosition: null, impressionPosition: 9, fetchedAt: '' } }),
  ];

  it('sorts by delta desc, pushing nulls to the bottom', () => {
    const out = sortRows(rows, 'delta', 'desc').map((r) => r.query);
    expect(out).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('sorts by delta asc, still pushing nulls to the bottom', () => {
    const out = sortRows(rows, 'delta', 'asc').map((r) => r.query);
    expect(out).toEqual(['beta', 'alpha', 'gamma']);
  });

  it('sorts by position asc using latest.impressionPosition', () => {
    const out = sortRows(rows, 'position', 'asc').map((r) => r.query);
    // gamma=5 before beta=9; nulls (none here) would sink last
    expect(out).toEqual(['alpha', 'gamma', 'beta']);
  });

  it('sorts by query alphabetically', () => {
    const out = sortRows(rows, 'query' as SortKey, 'asc' as SortDir).map((r) => r.query);
    expect(out).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('never mutates the input array', () => {
    const before = rows.map((r) => r.query);
    sortRows(rows, 'delta', 'desc');
    expect(rows.map((r) => r.query)).toEqual(before);
  });
});

describe('loadKeywordSeries', () => {
  const data = loadKeywordSeries();

  it('loads the generated series when present', () => {
    // On a fresh clone data/keyword-series.json does not exist and this is null
    // by design — but in a built workspace it must parse.
    if (!data) return;
    expect(data.bing).not.toBeNull();
    expect(Array.isArray(data.bing!.keywords)).toBe(true);
  });

  it('bing totals reconcile: comparable = up + down + flat', () => {
    if (!data?.bing) return;
    const t = data.bing.totals;
    expect(t.comparable).toBe(t.up + t.down + t.flat);
  });

  it('gsc is flagged non-comparable when windows differ (the honesty guard)', () => {
    if (!data?.gsc) return;
    // Either the script already decided it is not comparable, or the windows
    // genuinely agree (then it should be comparable). We lock the invariant:
    if (data.gsc.distinctWindowDays.length > 1) {
      expect(data.gsc.comparable).toBe(false);
    }
  });
});

describe('latestReasonByQuery', () => {
  const reasons: KeywordReason[] = [
    { query: 'a', date: '2026-09-10', reason: 'old' },
    { query: 'a', date: '2026-09-25', reason: 'new' },
    { query: 'b', date: '2026-09-20', reason: 'only' },
  ];

  it('keeps the most recent reason per query', () => {
    const m = latestReasonByQuery(reasons);
    expect(m.get('a')?.reason).toBe('new');
    expect(m.get('b')?.reason).toBe('only');
  });

  it('returns an empty map for no input', () => {
    expect(latestReasonByQuery([]).size).toBe(0);
  });
});

describe('loadKeywordReasons', () => {
  it('returns an array (never null) even when curated by hand', () => {
    const r = loadKeywordReasons();
    expect(Array.isArray(r)).toBe(true);
  });
});

describe('loadKeywordReasonCandidates', () => {
  it('returns an array (never null) when not generated yet', () => {
    const c = loadKeywordReasonCandidates();
    expect(Array.isArray(c)).toBe(true);
  });
});

describe('buildCandidates', () => {
  const kw = (query: string, delta: number | null, latestPos: number, prevPos: number): SeriesKeywordLike => ({
    query,
    delta,
    latest: { impressionPosition: latestPos, date: '2026-09-27' },
    previous: { impressionPosition: prevPos, date: '2026-09-20' },
  });
  const comp = (query: string, name: string, domain: string, latestRank: number | null, prevRank: number | null, trend: string | null): CompetitorRowLike => ({
    domain, name, query, latestRank, prevRank, delta: null, trend, latestDate: '2026-09-27',
  });

  it('flags competitor pressure as a high-confidence hypothesis (related != causal)', () => {
    const doc = buildCandidates({
      keywords: [kw('epub to azw3', -3, 10, 7)],
      competitorMatrix: [
        comp('epub to azw3', 'Convertio', 'convertio.co', 2, 5, 'up'),
        comp('epub to azw3', 'FreeConvert', 'freeconvert.com', 3, null, 'new'),
      ],
      algoUpdates: [],
    });
    expect(doc.candidates).toHaveLength(1);
    const items = doc.candidates[0].items;
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe('competitor');
    expect(items[0].confidence).toBe('high');
    expect(items[0].relatedNotCausal).toBe(true);
    expect(items[0].text).toContain('Convertio');
  });

  it('flags an algorithm-update window as a medium-confidence hypothesis', () => {
    const updates: AlgoUpdateLike[] = [
      { id: 'u1', name: 'Core Update', start: '2026-09-20', end: '2026-09-30' },
    ];
    const doc = buildCandidates({
      keywords: [kw('some query', 4, 3, 7)],
      competitorMatrix: [],
      algoUpdates: updates,
    });
    expect(doc.candidates).toHaveLength(1);
    const it = doc.candidates[0].items[0];
    expect(it.type).toBe('algorithm');
    expect(it.confidence).toBe('medium');
    expect(it.relatedNotCausal).toBe(true);
  });

  it('ignores movements below the threshold', () => {
    const doc = buildCandidates({
      keywords: [kw('small move', 2, 8, 10)],
      competitorMatrix: [comp('small move', 'X', 'x.com', 1, 9, 'up')],
      algoUpdates: [],
    });
    expect(doc.candidates).toHaveLength(0);
  });

  it('skips keywords with no baseline (delta null)', () => {
    const doc = buildCandidates({
      keywords: [kw('single point', null, 5, 5)],
      competitorMatrix: [],
      algoUpdates: [],
    });
    expect(doc.candidates).toHaveLength(0);
  });

  it('respects a custom threshold', () => {
    const doc = buildCandidates({
      keywords: [kw('move', 2, 8, 10)],
      competitorMatrix: [comp('move', 'X', 'x.com', 1, 9, 'up')],
      algoUpdates: [],
      threshold: 1,
    });
    expect(doc.candidates).toHaveLength(1);
  });
});

describe('latestCandidateByQuery / pickCandidate', () => {
  const doc = buildCandidates({
    keywords: [{ query: 'a', delta: -5, latest: { impressionPosition: 9, date: '2026-09-27' }, previous: { impressionPosition: 4, date: '2026-09-20' } }],
    competitorMatrix: [{ domain: 'c.co', name: 'Comp', query: 'a', latestRank: 1, prevRank: 8, delta: null, trend: 'up', latestDate: '2026-09-27' }],
    algoUpdates: [{ id: 'u', name: 'U', start: '2026-09-01', end: '2026-09-30' }],
  });

  it('maps each query to its candidate entry', () => {
    const m = latestCandidateByQuery(doc.candidates);
    expect(m.get('a')?.items.length).toBe(2);
  });

  it('picks a candidate item by query + index', () => {
    expect(pickCandidate(doc, 'a', 0)?.type).toBe('competitor');
    expect(pickCandidate(doc, 'a', 1)?.type).toBe('algorithm');
    expect(pickCandidate(doc, 'a', 9)).toBeNull();
    expect(pickCandidate(doc, 'missing', 0)).toBeNull();
  });
});
