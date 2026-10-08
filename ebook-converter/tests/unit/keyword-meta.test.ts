// tests/unit/keyword-meta.test.ts
// Tests for the derived sheet columns (Intent / Target URL / competitors) and
// the human decision ledger helpers. These are the pieces that let the panel
// and the exported CSVs agree without a second source of truth.
import { deriveIntent, deriveTargetUrl, competitorsForQuery } from '@/lib/keywords/meta';
import {
  latestDecisionByQuery,
  latestCompetitorDecisionByKey,
  competitorDecisionKey,
  type KeywordDecision,
  type CompetitorDecision,
} from '@/lib/keywords/decisions';
import { loadKeywordDecisions, loadCompetitorDecisions } from '@/lib/keywords/loader';

const SLUGS = ['epub-to-pdf', 'epub-to-word', 'epub-to-txt', 'mobi-to-epub', 'epub-to-zip', 'azw3-to-epub'];

describe('deriveTargetUrl', () => {
  it('maps a plain "X to Y" keyword to its convert page', () => {
    expect(deriveTargetUrl('epub to pdf', SLUGS)).toBe('/convert/epub-to-pdf');
    expect(deriveTargetUrl('mobi to epub', SLUGS)).toBe('/convert/mobi-to-epub');
  });

  it('ignores surrounding words', () => {
    expect(deriveTargetUrl('convert epub to pdf online free', SLUGS)).toBe('/convert/epub-to-pdf');
    expect(deriveTargetUrl('epub to zip', SLUGS)).toBe('/convert/epub-to-zip');
  });

  it('resolves format aliases to the slug the site actually ships', () => {
    expect(deriveTargetUrl('epub to docx', SLUGS)).toBe('/convert/epub-to-word');
    expect(deriveTargetUrl('epub to text', SLUGS)).toBe('/convert/epub-to-txt');
  });

  it('returns null when no real page exists — never invents a URL', () => {
    expect(deriveTargetUrl('epub to kindle', SLUGS)).toBeNull();
    expect(deriveTargetUrl('best ebook converter', SLUGS)).toBeNull();
    expect(deriveTargetUrl('harry potter epub', SLUGS)).toBeNull();
  });
});

describe('deriveIntent', () => {
  it('classifies the documented buckets', () => {
    expect(deriveIntent('epub vs mobi which is better')).toBe('格式对比');
    expect(deriveIntent('is azw3 compatible with kindle')).toBe('格式对比');
    expect(deriveIntent('best free calibre alternative')).toBe('对比工具');
    expect(deriveIntent('how to read epub on kindle')).toBe('操作指南');
    expect(deriveIntent('harry potter epub download')).toBe('IP内容');
    expect(deriveIntent('can kobo read epub files')).toBe('阅读器/使用');
    expect(deriveIntent('convert mobi to epub online free')).toBe('转换需求');
    expect(deriveIntent('epub to zip')).toBe('转换需求');
  });

  it('puts the instructional reading of an IP keyword in 操作指南, not IP内容', () => {
    expect(deriveIntent('how to read harry potter epub on kindle')).toBe('操作指南');
  });

  it('falls back to 其他 for a query with no signal', () => {
    expect(deriveIntent('notebookconvert.com')).toBe('其他');
  });
});

describe('competitorsForQuery', () => {
  const cfg = [
    { name: 'Calibre', overlapKeywords: ['calibre alternative', 'calibre online'] },
    { name: 'Convertio', overlapKeywords: ['ebook converter'] },
  ];

  it('returns the competitors whose overlap list contains the keyword (exact, case-insensitive)', () => {
    expect(competitorsForQuery('Calibre Alternative', cfg)).toEqual(['Calibre']);
    expect(competitorsForQuery('ebook converter', cfg)).toEqual(['Convertio']);
  });

  it('returns [] for an untracked keyword or missing config', () => {
    expect(competitorsForQuery('epub to pdf', cfg)).toEqual([]);
    expect(competitorsForQuery('anything', null)).toEqual([]);
  });
});

describe('decision ledger helpers', () => {
  const kd: KeywordDecision[] = [
    { query: 'a', action: 'old', updatedAt: '2026-09-01' },
    { query: 'a', action: 'new', updatedAt: '2026-10-07' },
    { query: 'b', action: 'only' },
  ];

  it('keeps the most recent keyword decision per query', () => {
    const m = latestDecisionByQuery(kd);
    expect(m.get('a')?.action).toBe('new');
    expect(m.get('b')?.action).toBe('only');
  });

  it('keys competitor decisions by domain|query', () => {
    const cd: CompetitorDecision[] = [
      { domain: 'x.com', query: 'q', action: 'v1', updatedAt: '2026-09-01' },
      { domain: 'x.com', query: 'q', action: 'v2', updatedAt: '2026-10-01' },
    ];
    const m = latestCompetitorDecisionByKey(cd);
    expect(competitorDecisionKey('x.com', 'q')).toBe('x.com|q');
    expect(m.get('x.com|q')?.action).toBe('v2');
  });
});

describe('decision loaders', () => {
  it('always return arrays (the ledgers are optional and hand-curated)', () => {
    expect(Array.isArray(loadKeywordDecisions())).toBe(true);
    expect(Array.isArray(loadCompetitorDecisions())).toBe(true);
  });
});
