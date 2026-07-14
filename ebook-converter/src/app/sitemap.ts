import { MetadataRoute } from 'next'
import { CONVERSION_MAP } from '@/lib/conversion-map'
import fs from 'fs'
import path from 'path'
import { getLocale } from '@/i18n/utils'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bookconv.com'

const blogDir = path.join(process.cwd(), 'src', 'data', 'blog')
const BLOG_POSTS = fs.readdirSync(blogDir)
  .filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))
  .map((f) => {
    const mod = require(path.join(blogDir, f))
    return { slug: mod.slug || f.replace(/\.ts$/, ''), date: mod.date || '2026-01-01' }
  })

const contentDir = path.join(process.cwd(), 'src', 'data', 'content')

function getLevel(slug: string): 'A' | 'B' {
  try {
    const mod = require(path.join(contentDir, slug + '.ts'))
    return mod.level === 'A' ? 'A' : 'B'
  } catch {
    return 'B'
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locale = await getLocale()
  const prefix = locale === 'es' ? `/${locale}` : ''

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

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: baseUrl + prefix + '/blog/' + post.slug,
    lastModified: new Date(post.date),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  return [...staticPages, ...toolPages, ...blogPages]
}
