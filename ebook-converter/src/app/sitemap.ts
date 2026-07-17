import { MetadataRoute } from 'next'
import { CONVERSION_MAP } from '@/lib/conversion-map'
import { getAllPosts } from '@/data/blog'
import { getContent } from '@/data/content'
import { getLocale } from '@/i18n/utils'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bookconv.com'

function getLevel(slug: string): 'A' | 'B' {
  try {
    const mod = getContent(slug)
    return mod?.level === 'A' ? 'A' : 'B'
  } catch {
    return 'B'
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locale = await getLocale()
  const prefix = locale === 'es' ? '/' + locale : ''

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl + prefix, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: baseUrl + prefix + '/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: baseUrl + prefix + '/blog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: baseUrl + prefix + '/privacy', lastModified: new Date('2026-07-11'), changeFrequency: 'yearly', priority: 0.3 },
    { url: baseUrl + prefix + '/terms', lastModified: new Date('2026-07-11'), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const toolPages: MetadataRoute.Sitemap = Object.keys(CONVERSION_MAP).map((key) => ({
    url: baseUrl + prefix + '/convert/' + key,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: getLevel(key) === 'A' ? 0.8 : 0.7,
  }))

  const blogPages: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: baseUrl + prefix + '/blog/' + post.slug,
    lastModified: new Date(post.date),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  return [...staticPages, ...toolPages, ...blogPages]
}
