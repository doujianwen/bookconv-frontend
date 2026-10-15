/**
 * Public data pages registry (M4-2 可引用资产建设).
 *
 * Single source of truth for the /data/* citable dataset pages. Each entry
 * carries the facts every page must state: data source, collection window,
 * sample size, downloadable file, methodology and limitations.
 *
 * Row counts and date ranges were verified against bookconv_data_asset/
 * README.md and by counting the generated CSVs in public/data/ on 2026-10-15.
 * The public CSVs have the internal `source_file` column stripped (it carried
 * local absolute paths) — counts below refer to the published files.
 */

export interface DataPageSpec {
  slug: string
  title: string
  metaDescription: string
  summary: string
  source: string
  collectionWindow: string
  rowCount: number
  columnCount: number
  fileUrl: string
  columns: string[]
  methodology: string[]
  limitations: string[]
}

export const DATA_PAGES: DataPageSpec[] = [
  {
    slug: 'bing-ai-citations',
    title: 'Bing AI Citations Dataset — Ebook Converter Site (829 Records)',
    metaDescription:
      'Download 829 normalized records of Bing Copilot AI citations for an ebook converter site, collected July 27 to September 5, 2026, with methodology.',
    summary:
      'A normalized record of how Bing Copilot (Bing Webmaster Tools AI citation reports) cited an ebook converter website across AI answers, exported day-by-day from July 27 to September 5, 2026.',
    source:
      'Bing Webmaster Tools — AI citations reports (Overview daily series, AIPageStats, AISearchQueries), exported via the BWT UI.',
    collectionWindow: '2026-07-27 to 2026-09-05 (daily reports) plus 7 page-stats snapshots from 2026-08-28 to 2026-09-07.',
    rowCount: 829,
    columnCount: 15,
    fileUrl: '/data/bing-ai-citations.csv',
    columns: [
      'source_engine', 'report_type', 'date', 'snapshot_date', 'query_key', 'query_raw',
      'page_key', 'page_raw', 'domain', 'cited_pages', 'citations', 'citation_share',
      'intent', 'topic', 'note',
    ],
    methodology: [
      'All rows were extracted from Bing Webmaster Tools AI citation exports without any imputation, smoothing, or outlier removal; unknown values are left empty.',
      'Queries are normalized to a query_key (lowercased, whitespace-collapsed); the original string is kept in query_raw.',
      'URLs are normalized to page_key (https, lowercase host, trailing slash and fragment removed, only utm_* parameters dropped); the original URL is kept in page_raw.',
      'AI citation data is kept strictly separate from traditional Bing search data; no cross-engine conversion or join was applied.',
    ],
    limitations: [
      'An AI citation is not a visit; citation counts say nothing about traffic.',
      'AIPageStats rows have no date dimension (snapshot-based reports); AISearchQueries intent/topic fields are frequently empty in the source.',
      'This is one small website over a 6-week window. The numbers are a single case record, not a benchmark for any other site or niche.',
    ],
  },
  {
    slug: 'google-search-performance',
    title: 'Google Search Performance Dataset — Ebook Converter Site (6,876 Records)',
    metaDescription:
      'Download 6,876 normalized Google Search Console performance records (query, page, country, device) for an ebook converter site, July to September 2026.',
    summary:
      'A normalized export of Google Search Console web search performance for an ebook converter website, covering query, page, country, and device dimensions from July 23 to September 4, 2026, plus a Generative-AI-features (AI impressions) export.',
    source:
      'Google Search Console — UI performance exports (query/page/country/device/date/appearance groups) and API snapshots; the Generative AI Features export is included with search_type=generative_ai.',
    collectionWindow: 'Data dates 2026-07-23 to 2026-09-04; source exports were taken between 2026-08-10 and 2026-09-05 (recorded per row in snapshot_date).',
    rowCount: 6876,
    columnCount: 17,
    fileUrl: '/data/google-search-performance.csv',
    columns: [
      'source_engine', 'dimension', 'date', 'snapshot_date', 'query_key', 'query_raw',
      'page_key', 'page_raw', 'domain', 'country', 'device', 'search_type',
      'clicks', 'impressions', 'ctr', 'position', 'note',
    ],
    methodology: [
      'Every row was extracted from GSC exports as-is; no imputation, smoothing, or outlier removal. Unparseable numeric values (such as em dashes) are left empty rather than zero-filled.',
      'CTR percentages are converted to decimals. Dates are normalized to ISO YYYY-MM-DD.',
      'Each row keeps a snapshot_date showing when its source export was taken, so time-point exports are distinguishable from daily series.',
      'The Generative AI Features export only contains impressions in the source; clicks, CTR, and position are absent by design and left empty.',
    ],
    limitations: [
      'This site had very low absolute traffic during the window; absolute click counts are not meaningful as a benchmark.',
      'Query-by-date granularity only exists for two API snapshot days; earlier dates have no per-day query data.',
      'Position values from UI exports are approximate. This dataset documents one niche site in one window; do not extrapolate it to other sites.',
    ],
  },
  {
    slug: 'site-event-timeline',
    title: 'Site Event Timeline Dataset — Ebook Converter Site (996 Events)',
    metaDescription:
      'Download a machine-generated timeline of 996 site events (pages published and updated) for an ebook converter site, July 12 to September 7, 2026.',
    summary:
      'A machine-generated timeline of provable site events — mainly page publications and content updates — for an ebook converter website, derived from its content repository between July 12 and September 7, 2026.',
    source:
      'Derived dataset: every event is backed by an artifact in the site content repository (content data files), so each row is reproducible rather than recalled from memory.',
    collectionWindow: '2026-07-12 to 2026-09-07.',
    rowCount: 996,
    columnCount: 5,
    fileUrl: '/data/site-event-timeline.csv',
    columns: ['event_type', 'event_date', 'entity', 'value', 'evidence'],
    methodology: [
      'Events are derived from repository artifacts: a page counts as published or updated only when its content file records the change.',
      'Each row carries an evidence field pointing to the artifact class that proves the event, keeping the timeline auditable.',
      'No backfilling: events without a provable date are not guessed or interpolated.',
    ],
    limitations: [
      'Publish dates are only available for a portion of content rows (56 of 109 pages had explicit dates in the source content library); the rest are repository-derived estimates and are not marked as official launch dates.',
      'The timeline covers content events only — it does not include traffic, ranking, or infrastructure events.',
      'This is one site\u2019s publishing history; publishing cadence here does not generalize to other sites.',
    ],
  },
]

export function getDataPage(slug: string): DataPageSpec | undefined {
  return DATA_PAGES.find((d) => d.slug === slug)
}
