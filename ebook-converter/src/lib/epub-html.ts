import JSZip from 'jszip'
import path from 'node:path'
import { XMLParser } from 'fast-xml-parser'

type Rootfile = { '@_full-path'?: string }
type Item = { '@_id'?: string; '@_href'?: string }
type Ref = { '@_idref'?: string }
const array = <T,>(value: T | T[] | undefined): T[] => value === undefined ? [] : Array.isArray(value) ? value : [value]
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
function safePath(value: string): string {
  if (!value || value.includes('\\') || value.includes('\0') || value.startsWith('/') || /^[a-z]+:/i.test(value) || value.split('/').includes('..')) {
    throw new Error('Invalid EPUB: unsafe archive path')
  }
  return value
}

/** Keep original chapter/resource paths and add a reading-order index; no external converter. */
export async function epubToHtmlArchive(input: Buffer): Promise<Buffer> {
  const zip = await JSZip.loadAsync(input)
  for (const entry of Object.values(zip.files)) {
    const original = (entry as unknown as { unsafeOriginalName?: string }).unsafeOriginalName || entry.name
    safePath(original)
  }
  const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true, processEntities: false })
  const container = zip.file('META-INF/container.xml')
  if (!container) throw new Error('Invalid EPUB: missing container.xml')
  const parsed = parser.parse(await container.async('string')) as { container?: { rootfiles?: { rootfile?: Rootfile | Rootfile[] } } }
  const opfPath = safePath(array(parsed.container?.rootfiles?.rootfile)[0]?.['@_full-path'] || '')
  const opf = zip.file(opfPath)
  if (!opf) throw new Error('Invalid EPUB: missing package document')
  const pkg = (parser.parse(await opf.async('string')) as { package?: { manifest?: { item?: Item | Item[] }; spine?: { itemref?: Ref | Ref[] } } }).package
  const manifest = new Map(array(pkg?.manifest?.item).map(item => [item['@_id'], item['@_href']]))
  const chapters = array(pkg?.spine?.itemref).map(ref => {
    const href = manifest.get(ref['@_idref'])
    if (!href || /^[a-z]+:/i.test(href)) throw new Error('Invalid EPUB: missing or remote spine chapter')
    let decoded: string
    try { decoded = decodeURIComponent(href.split('#')[0]) } catch { throw new Error('Invalid EPUB: malformed chapter path') }
    const filename = safePath(path.posix.normalize(path.posix.join(path.posix.dirname(opfPath), decoded)))
    if (!zip.file(filename)) throw new Error('Invalid EPUB: spine chapter not found')
    return filename
  })
  if (!chapters.length) throw new Error('Invalid EPUB: no spine chapters')
  let index = 'index.html'
  for (let suffix = 0; zip.file(index); suffix++) index = `bookconv-index-${suffix}.html`
  const links = chapters.map((filename, i) => `<li><a href="${escape(filename.split('/').map(encodeURIComponent).join('/'))}">Chapter ${i + 1}</a></li>`).join('\n')
  zip.file(index, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Exported ebook chapters</title></head><body><h1>Exported ebook chapters</h1><p>Original chapters, styles and images are retained at their source paths. Rendering and embedded-font support depend on your browser.</p><ol>${links}</ol></body></html>`)
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
}
