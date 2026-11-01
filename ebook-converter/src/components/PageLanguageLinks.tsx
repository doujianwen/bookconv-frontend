import Link from 'next/link'
import { ESP_BLOG_SLUGS, ESP_GUIDE_SLUGS, ESP_CONVERT_SLUGS } from '@/lib/es-routes'

/** Link only to translations that have a real, supported route. */
export function PageLanguageLinks({ path, isEs = false }: { path: string; isEs?: boolean }) {
  const [, group, slug] = path.split('/')
  const supported = group === 'blog' ? ESP_BLOG_SLUGS.includes(slug)
    : group === 'guide' ? ESP_GUIDE_SLUGS.includes(slug)
    : group === 'convert' ? ESP_CONVERT_SLUGS.includes(slug) : false
  if (!supported) return null
  return (
    <nav aria-label={isEs ? 'Idioma de la página' : 'Page language'} className="mb-6 text-sm">
      <Link href={isEs ? path : `/es${path}`} hrefLang={isEs ? 'en' : 'es'} className="underline">
        {isEs ? 'Read in English' : 'Leer en español'}
      </Link>
    </nav>
  )
}
