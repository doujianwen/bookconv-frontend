import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'fix-epub-to-pdf-formatting'
export const title = 'Fix EPUB to PDF: Broken Layout, Missing Images, and How to Solve It'
export const problem = 'Your EPUB looks perfect in a reader but turns into a messy PDF — odd page breaks, shifted images, missing fonts. Here is why, and how to fix it.'
export const date = '2026-08-02'
export const tags = ['epub', 'pdf', 'formatting', 'calibre', 'ebook conversion']
export const formats = { source: 'epub', target: 'pdf' }
export const keyTakeaways = [
  'EPUB is reflowable; PDF is fixed-layout. Pushing reflow onto fixed pages is where layout breaks.',
  'Most "missing images" are SVG covers or un-embedded assets the converter skipped.',
  'Pick an explicit page size and embed fonts before converting to avoid broken output.',
  'BookConv keeps images and reflows text automatically — no Calibre install required.',
]
export const content = {
  intro: 'You open your EPUB in a reader and it is flawless. You convert it to PDF and suddenly paragraphs split across pages, images float in the wrong spot, and the cover is gone. This guide explains what actually happens during an EPUB to PDF conversion and the fixes that hold up in practice.',
  sections: [
    {
      heading: 'Why EPUB to PDF breaks the layout',
      body: `EPUB is a **reflowable** format. Its content is XHTML styled with CSS, and the reading app decides the line length, font size, and where pages break — based on your screen. PDF is the opposite: a **fixed-layout** canvas where every word sits at an exact coordinate.\n\nWhen a converter turns reflowable EPUB into a fixed PDF, it must pick where each page ends. That single decision is where awkward breaks appear: a heading stranded at the bottom of a page, a sentence orphaned onto the next page, or a table split in half. None of this is corruption — it is the reflow-to-fixed translation being imperfect.`,
    },
    {
      heading: 'Missing images: the usual causes',
      body: `EPUB packages images as separate files (usually under OEBPS/images/). Two things make them vanish in the PDF:\n\n- **SVG graphics** are common in EPUB covers and diagrams. Many converters rasterize only raster formats (JPG/PNG) and drop SVG.\n- **Un-embedded or linked assets** the converter fails to resolve get skipped silently.\n\nIf your EPUB relies on SVG covers or inline SVG illustrations, expect holes unless the tool explicitly handles SVG.`,
    },
    {
      heading: 'Fix it with BookConv (fastest)',
      body: `BookConv runs on the Calibre engine but handles the rasterization and embedding steps for you. Upload the EPUB, choose **PDF**, and it preserves embedded images (including SVG covers), reflows the text, and lets you pick A4 or Letter page size. No software to install. Start here: [/convert/epub-to-pdf](/convert/epub-to-pdf).`,
    },
    {
      heading: 'Fix it with Calibre (more control)',
      body: `If you want fine control, Calibre can do it — with caveats. Open **Preferences → Output → PDF**, set a sensible page size, then enable font embedding. Calibre's PDF output is functional but basic; complex CSS and SVG still render imperfectly. For a Linux walkthrough of the same engine, see [/blog/epub-to-pdf-linux](/blog/epub-to-pdf-linux).`,
    },
    {
      heading: 'When you should NOT convert to PDF',
      body: `If the file is meant for reading on a phone or e-reader, **keep it as EPUB**. PDF locks the layout and makes reading on small screens worse. PDF is the right target only when you need to print, annotate, or share a fixed document. Not sure which format fits your device? [/blog/ebook-formats-explained](/blog/ebook-formats-explained) breaks down EPUB, AZW3, MOBI, and PDF.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Why does my EPUB look fine but the PDF has bad page breaks?', answer: 'EPUB is reflowable, so the reader chooses where pages break. PDF is fixed-layout, so the converter must decide break points — and those decisions are rarely perfect. This is expected, not file corruption.' },
  { question: 'Why are images missing after EPUB to PDF?', answer: 'Usually the missing images are SVG covers or diagrams. Many converters only rasterize JPG/PNG and skip SVG, or fail to resolve linked assets. Use a tool that explicitly embeds SVG, such as BookConv.' },
  { question: 'Does BookConv keep the cover when converting EPUB to PDF?', answer: 'Yes. BookConv embeds raster images and SVG covers during conversion, so the cover appears on the first PDF page instead of being dropped.' },
  { question: 'Should I convert EPUB to PDF for my Kindle?', answer: 'No. Send-to-Kindle works best with reflowable formats (EPUB, AZW3, MOBI). PDF is harder to read on a small e-ink screen. See [/convert/epub-to-azw3](/convert/epub-to-azw3) for a Kindle-native option.' },
  { question: 'Can I choose A4 or Letter page size?', answer: 'Yes. BookConv lets you pick A4 or Letter before converting, which avoids awkward scaling on standard printers.' },
  { question: 'Is Calibre or an online converter better for EPUB to PDF?', answer: 'For a one-off file, an online converter like BookConv is faster and needs no install. Calibre gives more low-level control but plainer PDF output. The trade-off is covered in our [/guide/calibre-vs-online-converter](/guide/calibre-vs-online-converter) guide.' },
]
