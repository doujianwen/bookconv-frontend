import { MetadataRoute } from 'next'
import { CONVERSION_MAP } from '@/lib/conversion-map'
import { getAllPosts } from '@/data/blog'
import { getContent } from '@/data/content'

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
  const locales = ['en', 'es'] as const;
  const allUrls: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const prefix = locale === 'en' ? '' : '/' + locale;

    // Static pages
    allUrls.push(
      { url: baseUrl + prefix, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
      { url: baseUrl + prefix + '/pricing', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
      { url: baseUrl + prefix + '/blog', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
      { url: baseUrl + prefix + '/privacy', lastModified: new Date('2026-07-11'), changeFrequency: 'yearly' as const, priority: 0.3 },
      { url: baseUrl + prefix + '/terms', lastModified: new Date('2026-07-11'), changeFrequency: 'yearly' as const, priority: 0.3 },
    );

    // Tool pages
    for (const key of Object.keys(CONVERSION_MAP)) {
      allUrls.push({
        url: baseUrl + prefix + '/convert/' + key,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: getLevel(key) === 'A' ? 0.8 : 0.7,
      });
    }

    // Blog pages
    for (const post of getAllPosts()) {
      allUrls.push({
        url: baseUrl + prefix + '/blog/' + post.slug,
        lastModified: new Date(post.date),
        changeFrequency: 'yearly' as const,
        priority: 0.6,
      });
    }
  }

  return allUrls;
}
