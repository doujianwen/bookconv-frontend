import { MetadataRoute } from 'next'
import { getAllPosts } from '@/data/blog'
import { getAllGuides } from '@/data/guides'
import { CONTENT_MAP } from '@/data/content'
import { COMPAT_MAP } from '@/data/compat'

// Derive every supported conversion URL directly from CONTENT_MAP — the
// canonical source of truth for /convert/[slug] pages (generateStaticParams
// in the convert route uses the same map). Using CONTENT_MAP keys directly
// avoids the single-hyphen CONVERSION_MAP bug where "epub-docx" was turned
// into the wrong slug "epub-to-docx" instead of the real "epub-to-word".
const CONVERSION_PAGES = Object.keys(CONTENT_MAP)

const BLOG_POSTS = getAllPosts()
// Exclude noindex posts (e.g. dev/internal docs) from the sitemap so they
// don't waste crawl budget; they stay reachable via internal links.
const BLOG_SLUGS = BLOG_POSTS.filter((p) => !p.noindex).map((p) => p.slug)
const BLOG_DATES: Record<string, string> = {};
BLOG_POSTS.forEach((p) => { BLOG_DATES[p.slug] = p.date; })

// Real last-modified dates for sitemap <lastmod>, derived from each content
// file's filesystem mtime (NOT git — this repo's history is only 3 days old,
// so git dates are an artifact of a one-time bulk import and carry zero
// signal about when content actually changed). Hardcoding them as constants
// is deliberate: reading mtime at build time would reset every URL to the
// deploy timestamp on Vercel, recreating the exact "73 URLs share one
// millisecond" problem this map fixes. When a page's content is edited, its
// entry here should be bumped to match.
const CONTENT_DATES: Record<string, string> = {
  'azw-to-mobi': '2026-08-09',
  'azw3-to-epub': '2026-08-25',
  'azw3-to-mobi': '2026-08-25',
  'azw3-to-pdf': '2026-08-03',
  'cbr-to-pdf': '2026-08-08',
  'chm-to-mobi': '2026-08-09',
  'djvu-to-pdf': '2026-08-08',
  'doc-to-epub': '2026-08-08',
  'docx-to-epub': '2026-08-03',
  'epub-to-azw3': '2026-08-03',
  'epub-to-doc': '2026-08-24',
  'epub-to-html': '2026-08-08',
  'epub-to-jpg': '2026-08-08',
  'epub-to-mobi': '2026-08-11',
  'epub-to-pdf': '2026-08-03',
  'epub-to-png': '2026-08-08',
  'epub-to-rtf': '2026-08-08',
  'epub-to-txt': '2026-08-24',
  'epub-to-word': '2026-08-08',
  'epub-to-zip': '2026-08-23',
  'fb2-to-epub': '2026-08-08',
  'html-to-epub': '2026-08-09',
  'lit-to-epub': '2026-08-24',
  'lit-to-mobi': '2026-08-13',
  'mobi-to-epub': '2026-08-25',
  'mobi-to-pdf': '2026-08-08',
  'mobi-to-txt': '2026-08-08',
  'pdf-to-epub': '2026-08-03',
  'rtf-to-epub': '2026-08-08',
  'txt-to-epub': '2026-08-10',
}

// Compat report pages are English-only; single entry today, grows with
// COMPAT_MAP. Keyed by slug to match the loop below.
const COMPAT_DATES: Record<string, string> = {
  'epub-to-mobi-on-kindle-paperwhite': '2026-08-11',
}

// Homepage + static (non-data-backed) route pages. Values are the mtime of
// each route file under src/app/[locale]/<path>/page.tsx (or src/app for the
// root). These pages have no content data file, so the route file mtime is
// the best available proxy for "when this page last changed".
const STATIC_DATES: Record<string, string> = {
  '/': '2026-08-25',
  '/pricing': '2026-08-15',
  '/batch': '2026-08-29',
  '/blog': '2026-08-07',
  '/tutorial': '2026-08-08',
  '/help': '2026-08-15',
  '/privacy': '2026-08-07',
  '/terms': '2026-08-07',
  '/api-docs': '2026-07-28',
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.bookconv.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['en', 'es'] as const;
  const allUrls: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    const prefix = locale === 'en' ? '' : '/' + locale

    allUrls.push({
      url: baseUrl + prefix,
      lastModified: new Date(STATIC_DATES['/'] || '2026-07-26'),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    })

    const staticPages: {
      path: string
      frequency: 'monthly' | 'weekly' | 'yearly'
      priority: number
      date?: string
    }[] = [
      { path: '/pricing', frequency: 'monthly', priority: 0.8, date: STATIC_DATES['/pricing'] },
      { path: '/batch', frequency: 'monthly', priority: 0.7, date: STATIC_DATES['/batch'] },
      { path: '/blog', frequency: 'weekly', priority: 0.7, date: STATIC_DATES['/blog'] },
      { path: '/tutorial', frequency: 'monthly', priority: 0.5, date: STATIC_DATES['/tutorial'] },
      { path: '/help', frequency: 'monthly', priority: 0.6, date: STATIC_DATES['/help'] },
      { path: '/privacy', frequency: 'yearly', priority: 0.3, date: STATIC_DATES['/privacy'] },
      { path: '/terms', frequency: 'yearly', priority: 0.3, date: STATIC_DATES['/terms'] },
    ]

    for (const page of staticPages) {
      const url = baseUrl + prefix + page.path
      allUrls.push({
        url,
        lastModified: new Date(page.date || STATIC_DATES[page.path] || '2026-07-26'),
        changeFrequency: page.frequency,
        priority: page.priority,
      })
    }

    for (const key of CONVERSION_PAGES) {
      allUrls.push({
        url: baseUrl + prefix + '/convert/' + key,
        lastModified: new Date(CONTENT_DATES[key] || '2026-07-26'),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })
    }

    // Compat report pages are English-only (V1 scope, decision #1). Derive
    // directly from COMPAT_MAP — the single source of truth, same pattern as
    // CONTENT_MAP. Adding a new report = one new entry in COMPAT_MAP, no
    // hand-written URL, no slug-derivation bug.
    if (locale === 'en') {
      const COMPAT_SLUGS = Object.keys(COMPAT_MAP)
      for (const slug of COMPAT_SLUGS) {
        allUrls.push({
          url: baseUrl + '/compat/' + slug,
          lastModified: new Date(COMPAT_DATES[slug] || '2026-07-26'),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        })
      }
    }

    for (const slug of BLOG_SLUGS) {
      allUrls.push({
        url: baseUrl + prefix + '/blog/' + slug,
        lastModified: new Date(BLOG_DATES[slug] || '2026-07-12'),
        changeFrequency: 'yearly' as const,
        priority: 0.6,
      })
    }

    for (const g of getAllGuides()) {
      allUrls.push({
        url: baseUrl + prefix + '/guide/' + g.slug,
        lastModified: new Date(g.date || '2026-08-02'),
        changeFrequency: 'yearly' as const,
        priority: 0.6,
      })
    }
  }

  return allUrls
}
