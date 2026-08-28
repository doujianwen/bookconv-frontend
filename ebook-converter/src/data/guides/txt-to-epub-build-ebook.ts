import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'txt-to-epub-build-ebook'
export const title = 'TXT to EPUB: Turn a Plain Text File into a Real Ebook with a TOC'
export const problem = 'You have a manuscript or public-domain book as a plain TXT file, but reading apps treat it as one endless scroll. A TXT to EPUB conversion adds a table of contents and real structure. Here is how to build a proper EPUB from plain text.'
export const date = '2026-08-03'
export const tags = ['txt', 'epub', 'ebook conversion', 'table of contents', 'manuscript']
export const formats = { source: 'txt', target: 'epub' }
export const keyTakeaways = [
  'TXT files have no structure, so reading apps show them as one long scroll.',
  'EPUB adds a table of contents, chapters, and reflowable text that any reader understands.',
  'Headings survive only when the converter detects your chapter markers or you set them.',
  'BookConv converts TXT to EPUB in the browser and builds a navigable table of contents.',
]
export const content = {
  intro: 'A plain TXT file is the most portable document format there is, but it has no structure. Reading apps display it as a single unbroken scroll with no chapters and no table of contents. Converting TXT to EPUB turns that flat file into a proper ebook with navigation, chapters, and reflowable text. This guide shows how to do it and how to keep your chapter breaks.',
  sections: [
    {
      heading: 'Why convert TXT to EPUB',
      body: `**TXT** is just characters with line breaks. It works everywhere but gives readers nothing to navigate. **EPUB** is the open reflowable standard that supports a table of contents, chapter breaks, and adjustable fonts. If you want a manuscript, a public-domain novel, or your own notes to read like a real book, EPUB is the destination. A format overview is in [/blog/ebook-formats-explained](/blog/ebook-formats-explained).`,
    },
    {
      heading: 'What a good TXT to EPUB conversion adds',
      body: `A proper conversion should produce more than a wrapped text file:

- A **table of contents** built from your chapter headings.
- **Chapter breaks** so readers jump between sections.
- **Reflowable text** that adapts to phone, tablet, or e-reader screens.

Without these, you simply get a scrollable TXT with a different extension.`,
    },
    {
      heading: 'Convert with BookConv (fastest)',
      body: `BookConv runs the Calibre engine in the browser, so you get a TXT to EPUB conversion with nothing to install. Upload the TXT, choose **EPUB**, and it builds a navigable table of contents from your headings. Start here: [/convert/txt-to-epub](/convert/txt-to-epub). A step-by-step is in [/blog/txt-to-epub](/blog/txt-to-epub).`,
    },
    {
      heading: 'Convert with Calibre (more control)',
      body: `Calibre opens TXT and converts to EPUB with structure detection. Open the file, pick **Convert books → EPUB**, then use **Structure detection** to map your chapter markers (for example lines starting with Chapter) to headings. For a broader comparison of tools, see [/guide/calibre-vs-online-converter](/guide/calibre-vs-online-converter).`,
    },
    {
      heading: 'Check the result before you trust it',
      body: `Open the EPUB in a reader and confirm the **table of contents** lists your chapters and tapping one jumps to the right place. If everything is still one scroll, the converter did not detect your headings and you should set chapter markers before reconverting.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Can I convert TXT to EPUB?', answer: 'Yes. Online converters like BookConv convert TXT to EPUB in the browser, and Calibre does it on the desktop. The result reads on any EPUB app.' },
  { question: 'Will my chapters become a table of contents?', answer: 'They can, but only if the converter detects your chapter headings. BookConv builds the TOC from your headings; Calibre lets you map them in Structure detection.' },
  { question: 'Why is my TXT ebook just one long scroll after conversion?', answer: 'Because the converter did not find chapter markers. Mark chapters clearly (for example Chapter 1) or set detection rules before converting.' },
  { question: 'Is BookConv free for TXT to EPUB?', answer: 'Yes. BookConv converts TXT to EPUB in the browser at no cost for standard files, with no software to install.' },
  { question: 'Can I convert a manuscript draft to EPUB?', answer: 'Yes. Many authors turn a plain TXT draft into an EPUB preview to check flow on a real reading device before formatting for publication.' },
  { question: 'Does TXT to EPUB keep my line breaks?', answer: 'Paragraph breaks are preserved, but TXT has no styling, so fonts and spacing become the reader default. That is expected and usually what you want for reading.' },
]
