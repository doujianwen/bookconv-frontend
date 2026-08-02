import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'pdf-to-epub-keep-formatting'
export const title = 'Convert PDF to EPUB Without Losing Images or Layout'
export const problem = 'PDF to EPUB usually means lost images and a wall of text. Here is how to keep the pictures in and make the result actually readable.'
export const date = '2026-08-02'
export const tags = ['pdf', 'epub', 'ocr', 'scan', 'calibre']
export const formats = { source: 'pdf', target: 'epub' }
export const keyTakeaways = [
  'A native PDF (real text) converts far better than a scanned PDF (just pictures of pages).',
  'Images disappear when the tool extracts text only and throws the page images away.',
  'Scanned PDFs need OCR first, or you will get an EPUB full of page-image snapshots.',
  'BookConv keeps embedded images for native PDFs; for scans, run OCR before converting.',
]
export const content = {
  intro: 'PDF to EPUB is the conversion most likely to disappoint: the images vanish and the text arrives as one long, unbroken block. The result depends almost entirely on what kind of PDF you started with. This guide shows how to keep images and get a readable EPUB.',
  sections: [
    {
      heading: 'Scanned PDF vs native PDF (this changes everything)',
      body: `There are two very different PDFs:\n\n- A **native PDF** was exported from a word processor or layout tool. Under the hood it contains real, selectable text.\n- A **scanned PDF** is just a sequence of page images — a photo of every page. There is no text to extract, only pictures.\n\nIf your "PDF" is a scan, no converter can magically recover a clean EPUB. You first need **OCR** (optical character recognition) to turn those pictures into text.`,
    },
    {
      heading: 'Why images disappear',
      body: `When a tool converts a native PDF, it typically pulls the text layer out and rebuilds an EPUB around it. If the converter is set to "text only," it discards the original page images, diagrams, and photos. That is why your illustrated PDF comes out as bare paragraphs.\n\nThe fix is to use a converter that carries the embedded images through. BookConv does this for native PDFs: [/convert/pdf-to-epub](/convert/pdf-to-epub).`,
    },
    {
      heading: 'Scanned PDFs need OCR first',
      body: `For a scan, run OCR (for example in Acrobat, or a free OCR tool) so the file gains a real text layer. After that, convert to EPUB and the text will reflow properly instead of being trapped inside page-image snapshots.\n\nIf the source is a comic or highly visual document, an EPUB will never match the fixed layout — keep it as PDF, or convert the pages to images with [/convert/cbr-to-pdf](/convert/cbr-to-pdf) style tooling.`,
    },
    {
      heading: 'Convert with BookConv or Calibre',
      body: `**BookConv** (online, no install): upload a native PDF, choose EPUB, and embedded images are preserved while text becomes reflowable. Best for most users.\n\n**Calibre** (desktop): open the PDF, pick EPUB as output. Calibre is decent at native PDFs but, like every tool, it cannot invent text from a scan. For a deeper look at the trade-offs, see [/blog/pdf-to-epub-guide](/blog/pdf-to-epub-guide) — including when you should *not* convert.`,
    },
    {
      heading: 'Set expectations: layout will change',
      body: `EPUB is reflowable, so a precisely laid-out PDF (multiple columns, side notes, fixed caption positions) will not survive conversion unchanged. Accept that the EPUB will be a clean reading version, not a pixel copy. If you need the exact layout, keep the PDF.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Why did my PDF to EPUB lose all the images?', answer: 'The converter likely extracted only the text layer and discarded the page images. Use a tool that carries embedded images through, such as BookConv, which preserves them for native PDFs.' },
  { question: 'My PDF is a scan — can I make a good EPUB?', answer: 'Not directly. A scanned PDF is just page pictures, so you must run OCR first to create a real text layer. After OCR, convert to EPUB and the text will reflow.' },
  { question: 'Will the EPUB keep the exact PDF layout?', answer: 'No. EPUB is reflowable, so columns, side notes, and fixed caption positions will not survive. The EPUB becomes a clean reading version. Keep the PDF if you need the precise layout.' },
  { question: 'Is BookConv or Calibre better for PDF to EPUB?', answer: 'For most people BookConv is faster — no install, and it preserves embedded images from native PDFs. Calibre offers more control but cannot recover text from a scan either. See our [/guide/calibre-vs-online-converter](/guide/calibre-vs-online-converter) guide for the full comparison.' },
  { question: 'My PDF has photos — will they stay in the EPUB?', answer: 'For a native (text-based) PDF, yes — BookConv carries the embedded photos through. For a scanned PDF, the photos are the pages themselves and need OCR before they become usable EPUB images.' },
  { question: 'What is the best PDF to EPUB converter for free?', answer: 'BookConv is free, browser-based, and keeps images from native PDFs without installing software. It is the simplest starting point before reaching for desktop tools like Calibre.' },
]
