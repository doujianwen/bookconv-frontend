import { MetadataRoute } from 'next'
import { CONVERSION_MAP } from '@/lib/conversion-map'

// Blog post metadata — keep in sync with src/data/blog/
const BLOG_POSTS = [
  { slug: 'how-to-convert-epub-to-mobi', date: '2026-07-11' },
  { slug: 'ebook-formats-explained', date: '2026-07-10' },
  { slug: 'why-convert-lit-to-epub', date: '2026-07-09' },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bookconv.com'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: baseUrl + '/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: baseUrl + '/blog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: baseUrl + '/privacy', lastModified: new Date('2026-07-11'), changeFrequency: 'yearly', priority: 0.3 },
    { url: baseUrl + '/terms', lastModified: new Date('2026-07-11'), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const toolPages: MetadataRoute.Sitemap = Object.keys(CONVERSION_MAP).map((key) => ({
    url: baseUrl + '/convert/' + key,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: baseUrl + '/blog/' + post.slug,
    lastModified: new Date(post.date),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  return [...staticPages, ...toolPages, ...blogPages]
}
