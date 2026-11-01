import { renderToStaticMarkup } from 'react-dom/server'
import * as React from 'react'
import { getAllPosts } from '@/data/blog'
import sitemap from '@/app/sitemap'
import { generateConversionPageSchema } from '@/lib/seo/schema'
import { generateDefaultFAQs } from '@/lib/seo/conversion-faq'
import { PageLanguageLinks } from '@/components/PageLanguageLinks'
import CompatPage, { generateMetadata } from '@/app/[locale]/compat/[slug]/page'

// The repository's Jest transform uses classic JSX; Next uses the automatic runtime.
Object.assign(globalThis, { React })

describe('indexing remediation', () => {
  const aliases = ['epub-to-various-other', 'lord-of-the-rings-ebooks-multiple-devices', 'twilight-ebooks-multiple-devices', 'marvel-comics-ebooks-multiple-devices']

  it('does not recommend canonical aliases or demonstration reports in the sitemap', async () => {
    const urls = (await sitemap()).map(x => x.url)
    for (const slug of aliases) {
      expect(getAllPosts().some(x => x.slug === slug)).toBe(false)
      expect(urls).not.toContain(`https://www.bookconv.com/blog/${slug}`)
    }
    expect(urls).not.toContain('https://www.bookconv.com/compat/epub-to-mobi-on-kindle-paperwhite')
    expect(urls).toContain('https://www.bookconv.com/blog/read-epub-on-any-device')
  })

  it('withdraws unverified device results instead of presenting placeholder numbers as a test', async () => {
    const props = { params: Promise.resolve({ locale: 'en', slug: 'epub-to-mobi-on-kindle-paperwhite' }) }
    const html = renderToStaticMarkup(await CompatPage(props))
    expect(html).toContain('awaiting verification')
    expect(html).not.toContain('All checks passed')
    expect(html).not.toContain('500.0 KB')
    expect((await generateMetadata(props)).robots).toEqual({ index: false, follow: true })
    expect(JSON.stringify((await generateMetadata(props)).openGraph)).not.toContain('Real-world conversion test')
  })

  it('keeps English takeaway sections in English', () => {
    for (const post of getAllPosts()) {
      for (const section of post.content.sections.filter(x => x.heading === 'Key Takeaways')) {
        expect({ slug: post.slug, chinese: /[\u4e00-\u9fff]/.test(section.body) }).toEqual({ slug: post.slug, chinese: false })
      }
    }
  })

  it('keeps default structured FAQs identical to the visible default FAQ data', () => {
    const graph = JSON.parse(generateConversionPageSchema('mobi', 'txt'))['@graph']
    const faq = graph.find((x: { '@type': string }) => x['@type'] === 'FAQPage')
    for (const item of generateDefaultFAQs('mobi', 'txt')) {
      expect(faq.mainEntity).toContainEqual(expect.objectContaining({ name: item.question, acceptedAnswer: expect.objectContaining({ text: item.answer }) }))
    }
    expect(JSON.stringify(graph)).not.toMatch(/Calibre-powered|High-quality Calibre|Pro adds batch|preserves most formatting/)
    expect(JSON.stringify(graph)).toContain('100 MB')
  })

  it('links real translations without generating unsupported Spanish routes', () => {
    expect(renderToStaticMarkup(PageLanguageLinks({ path: '/convert/epub-to-doc' }))).toContain('href="/es/convert/epub-to-doc"')
    expect(renderToStaticMarkup(PageLanguageLinks({ path: '/guide/epub-vs-mobi', isEs: true }))).toContain('href="/guide/epub-vs-mobi"')
    expect(PageLanguageLinks({ path: '/guide/azw3-vs-mobi' })).toBeNull()
  })
})
