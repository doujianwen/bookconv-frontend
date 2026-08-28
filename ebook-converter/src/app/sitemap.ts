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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.bookconv.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['en', 'es'] as const;
  const allUrls: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    const prefix = locale === 'en' ? '' : '/' + locale

    allUrls.push({
      url: baseUrl + prefix,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    })

    const staticPages: {
      path: string
      frequency: 'monthly' | 'weekly' | 'yearly'
      priority: number
      date?: string
    }[] = [
      { path: '/pricing', frequency: 'monthly', priority: 0.8 },
      { path: '/batch', frequency: 'monthly', priority: 0.7 },
      { path: '/blog', frequency: 'weekly', priority: 0.7 },
      { path: '/tutorial', frequency: 'monthly', priority: 0.5 },
      { path: '/help', frequency: 'monthly', priority: 0.6 },
      { path: '/privacy', frequency: 'yearly', priority: 0.3, date: '2026-07-11' },
      { path: '/terms', frequency: 'yearly', priority: 0.3, date: '2026-07-11' },
    ]

    for (const page of staticPages) {
      const url = baseUrl + prefix + page.path
      allUrls.push({
        url,
        lastModified: page.date ? new Date(page.date) : new Date(),
        changeFrequency: page.frequency,
        priority: page.priority,
      })
    }

    for (const key of CONVERSION_PAGES) {
      allUrls.push({
        url: baseUrl + prefix + '/convert/' + key,
        lastModified: new Date(),
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
          lastModified: new Date(),
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
