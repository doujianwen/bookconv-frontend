import * as fixEpubToPdf from './fix-epub-to-pdf-formatting'
import * as pdfToEpub from './pdf-to-epub-keep-formatting'
import * as calibreVsOnline from './calibre-vs-online-converter'
import type { GuideMeta } from './types'

const all = [fixEpubToPdf, pdfToEpub, calibreVsOnline] as unknown as GuideMeta[]

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
