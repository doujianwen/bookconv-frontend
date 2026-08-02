import { MetadataRoute } from 'next'
import { getAllPosts } from '@/data/blog'
import { getHubTags } from '@/lib/internal-links'
import { getAllGuides } from '@/data/guides'

const CONVERSION_PAGES = [
  'epub-to-mobi', 'epub-to-azw3', 'epub-to-pdf', 'epub-to-txt',
  'mobi-to-epub', 'azw3-to-epub', 'lit-to-epub', 'pdf-to-epub',
  'fb2-to-epub', 'docx-to-epub', 'txt-to-epub', 'epub-to-docx',
  'epub-to-jpg', 'epub-to-png', 'epub-to-html', 'djvu-to-pdf',
  'cbr-to-pdf', 'epub-to-doc', 'epub-to-rtf', 'mobi-to-txt',
]

const BLOG_POSTS = getAllPosts()
const BLOG_SLUGS = BLOG_POSTS.map((p) => p.slug)
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
      { path: '/blog', frequency: 'weekly', priority: 0.7 },
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

    for (const hub of getHubTags()) {
      allUrls.push({
        url: baseUrl + prefix + '/blog/tag/' + hub.slug,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })
    }
  }

  return allUrls
}
