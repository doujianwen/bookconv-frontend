import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import JSZip from 'jszip'
import { buildAlternates } from '@/lib/seo/alternates'
import { hasSpanishRoute, spanishRoute, ESP_STATIC_PATHS, ESP_BLOG_SLUGS } from '@/lib/es-routes'
import { getAllPosts } from '@/data/blog'
import sitemap from '@/app/sitemap'
import ConvertIndex, { generateMetadata as convertMeta } from '@/app/[locale]/convert/page'
import Privacy, { generateMetadata as privacyMeta } from '@/app/[locale]/privacy/page'
import { executeConversion } from '@/lib/conversion'
Object.assign(globalThis, { React })

describe('Spanish historical route restoration', () => {
  it('emits reciprocal language pairs only for real translated destinations', () => {
    for (const path of ESP_STATIC_PATHS) {
      const en = buildAlternates({ locale: 'en', slugPath: path, pageType: 'list' })
      const es = buildAlternates({ locale: 'es', slugPath: path, pageType: 'list' })
      expect(en.languages).toEqual(es.languages)
      expect(es.canonical).toBe(`https://www.bookconv.com/es${path === '/' ? '' : path}`)
    }
    expect(buildAlternates({ locale: 'en', slugPath: '/guide', pageType: 'list' }).languages.es).toBeUndefined()
    expect(spanishRoute('/convert/pdf-to-epub')).toBe('/es')
    expect(spanishRoute('/blog/txt-to-epub')).toBe('/es/blog/txt-to-epub')
    for (const p of ['/es/blog/tag/fb2', '/es/blog/tag/workflow', '/es/pricing']) expect(hasSpanishRoute(p)).toBe(false)
  })
  it('lists indexable restorations but excludes navigation-only tags and unavailable translations', async () => {
    const urls = (await sitemap()).map(x => x.url)
    for (const p of ['/es','/es/convert','/es/privacy','/es/blog','/es/blog/txt-to-epub','/es/convert/html-to-epub']) expect(urls).toContain('https://www.bookconv.com'+p)
    for (const p of ['/es/blog/tag/epub','/es/blog/tag/fb2','/es/blog/tag/workflow']) expect(urls).not.toContain('https://www.bookconv.com'+p)
    expect(ESP_BLOG_SLUGS.every(slug => getAllPosts().find(p => p.slug === slug)?.es)).toBe(true)
  })
  it('renders Spanish conversion data and actual destinations, keeping legacy DOC separate', async () => {
    const props = { params: Promise.resolve({ locale: 'es' }) }
    const html = renderToStaticMarkup(await ConvertIndex(props))
    expect(html).toContain('/es/convert/html-to-epub')
    expect(html).toContain('explicación de EPUB a DOC')
    const ld = JSON.parse(html.match(/<script[^>]*>(.*?)<\/script>/)![1])
    expect(ld.inLanguage).toBe('es')
    expect(ld.itemListElement.every((x: { url: string }) => hasSpanishRoute(new URL(x.url).pathname))).toBe(true)
    expect(ld.itemListElement.some((x: { url: string }) => x.url.endsWith('epub-to-doc'))).toBe(false)
    expect(JSON.stringify(await convertMeta(props))).toContain('Herramientas')
  })
  it('translates policy without inventing a deletion deadline', async () => {
    const props = { params: Promise.resolve({ locale: 'es' }) }
    const html = renderToStaticMarkup(await Privacy(props))
    expect(html).toContain('CloudConvert')
    expect(html).toContain('almacenamiento temporal')
    expect(html).not.toMatch(/24 horas|automáticamente después/)
    expect((await privacyMeta(props)).alternates?.canonical).toBe('https://www.bookconv.com/es/privacy')
  })
  it.each([
    ['txt', 'Capítulo uno\n\nAcción, niño y café.\n\nCapítulo dos'],
    ['html', '<html><head><style>p{color:red}</style><script>SECRET_SCRIPT</script></head><body><h1>Capítulo uno</h1><p>Acción, niño y café.</p><img src="missing.png"><a href="other.html">Capítulo dos</a></body></html>'],
  ])('validates real %s text fallback instead of promising original layout or chapter detection', async (source, input) => {
    const result = await executeConversion(Buffer.from(input).toString('base64'), null, source, 'epub', `es-restore-${source}`)
    const zip = await JSZip.loadAsync(Buffer.from(result.base64Data, 'base64'))
    const body = await zip.file('OEBPS/content.xhtml')!.async('string')
    expect(body).toContain('Acción, niño y café.')
    expect(body).toContain('Capítulo dos')
    expect(body).not.toMatch(/SECRET_SCRIPT|missing.png|color:red|href="other.html"/)
    expect((await zip.file('OEBPS/nav.xhtml')!.async('string')).match(/<li>/g)).toHaveLength(1)
  })
})
