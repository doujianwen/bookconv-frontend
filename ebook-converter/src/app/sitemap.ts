import { MetadataRoute } from 'next'
import { CONVERSION_MAP } from '@/lib/conversion-map'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: baseUrl + '/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: baseUrl + '/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: baseUrl + '/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ]

  const toolPages: MetadataRoute.Sitemap = Object.keys(CONVERSION_MAP).map((key) => ({
    url: baseUrl + '/convert/' + key,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...toolPages]
}