// tests/unit/competitor.test.ts
// Tests for the competitor rank series helpers + loader.
import { sortCompetitorRows, TREND_LABEL, type CompetitorRow, type CompSortKey, type CompSortDir } from '@/lib/keywords/competitor';
import { loadCompetitorSeries, loadCompetitorConfig } from '@/lib/keywords/loader';

function row(domain: string, query: string, over: Partial<CompetitorRow> = {}): CompetitorRow {
  return {
    domain,
    name: domain,
    query,
    latestRank: null,
    prevRank: null,
    delta: null,
    trend: 'no-data',
    latestDate: null,
    prevDate: null,
    ...over,
  };
}

describe('sortCompetitorRows', () => {
  const rows: CompetitorRow[] = [
    row('convertio.co', 'ebook converter', { delta: null, latestRank: 1 }),
    row('zamzar.com', 'ebook converter', { delta: 2, latestRank: 3 }),
    row('anyconv.com', 'ebook converter', { delta: -1, latestRank: 9 }),
  ];

  it('sorts by delta desc, pushing nulls to the bottom', () => {
    const out = sortCompetitorRows(rows, 'delta', 'desc').map((r) => r.domain);
    expect(out).toEqual(['zamzar.com', 'anyconv.com', 'convertio.co']);
  });

  it('sorts by latestRank asc', () => {
    const out = sortCompetitorRows(rows, 'latestRank', 'asc').map((r) => r.domain);
    expect(out).toEqual(['convertio.co', 'zamzar.com', 'anyconv.com']);
  });
});

describe('TREND_LABEL', () => {
  it('covers all six trends', () => {
    expect(Object.keys(TREND_LABEL).sort()).toEqual(
      ['down', 'flat', 'gone', 'new', 'no-data', 'up'].sort(),
    );
  });
});

describe('loaders', () => {
  it('loadCompetitorConfig returns the tracked config', () => {
    const c = loadCompetitorConfig();
    expect(c).not.toBeNull();
    expect(Array.isArray(c!.competitors)).toBe(true);
    expect(Array.isArray(c!.keywords)).toBe(true);
  });

  it('loadCompetitorSeries returns an object (matrix may be empty until fetched)', () => {
    const d = loadCompetitorSeries();
    // In a built workspace data/competitor-series.json exists (possibly empty).
    if (!d) return;
    expect(Array.isArray(d.matrix)).toBe(true);
  });
});
