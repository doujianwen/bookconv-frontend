import * as fixEpubToPdf from './fix-epub-to-pdf-formatting'
import * as pdfToEpub from './pdf-to-epub-keep-formatting'
import * as calibreVsOnline from './calibre-vs-online-converter'
import * as epubToMobi from './epub-to-mobi-keep-formatting'
import * as azw3ToEpub from './azw3-to-epub-keep-formatting'
import * as docxToEpub from './docx-to-epub-self-publish'
import * as mobiVsAzw3 from './mobi-vs-azw3'
import * as mobiToEpub from './mobi-to-epub-keep-formatting'
import * as epubToAzw3 from './epub-to-azw3-for-kindle'
import * as djvuToPdf from './djvu-to-pdf'
import * as cbrToPdf from './cbr-to-pdf'
import * as litToEpub from './lit-to-epub-keep-formatting'
import * as epubToTxt from './epub-to-txt-extract'
import * as fb2ToEpub from './fb2-to-epub-keep-formatting'
import * as azw3ToMobi from './azw3-to-mobi-keep-formatting'
import * as txtToEpub from './txt-to-epub-build-ebook'
import * as calibreAlternative from './calibre-alternative'
import * as aiEbookConverter from './ai-ebook-converter'
import * as batchConverter from './batch-converter'
import * as kindleFormats from './kindle-formats'
import * as bestEbookConverter from './best-ebook-converter'
import type { GuideMeta } from './types'

const all = [fixEpubToPdf, pdfToEpub, calibreVsOnline, epubToMobi, azw3ToEpub, docxToEpub, mobiVsAzw3, mobiToEpub, epubToAzw3, djvuToPdf, cbrToPdf, litToEpub, epubToTxt, fb2ToEpub, azw3ToMobi, txtToEpub, calibreAlternative, aiEbookConverter, batchConverter, kindleFormats, bestEbookConverter] as unknown as GuideMeta[]

const GUIDE_MAP: Record<string, GuideMeta> = {}
for (const g of all) GUIDE_MAP[g.slug] = g

export function getAllGuides(): GuideMeta[] {
  return all
}

export function getGuideBySlug(slug: string): GuideMeta | undefined {
  return GUIDE_MAP[slug]
}

export function buildGuideSlugs(): string[] {
  return all.map((g) => g.slug)
}
