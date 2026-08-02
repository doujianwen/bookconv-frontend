import * as fixEpubToPdf from './fix-epub-to-pdf-formatting'
import * as pdfToEpub from './pdf-to-epub-keep-formatting'
import * as calibreVsOnline from './calibre-vs-online-converter'
import * as epubToMobi from './epub-to-mobi-keep-formatting'
import * as azw3ToEpub from './azw3-to-epub-keep-formatting'
import * as docxToEpub from './docx-to-epub-self-publish'
import * as mobiVsAzw3 from './mobi-vs-azw3'
import type { GuideMeta } from './types'

const all = [fixEpubToPdf, pdfToEpub, calibreVsOnline, epubToMobi, azw3ToEpub, docxToEpub, mobiVsAzw3] as unknown as GuideMeta[]

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
