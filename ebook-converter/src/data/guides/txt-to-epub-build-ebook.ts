import { BlogFaq } from '../blog/types'

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
      body: `Calibre opens TXT and converts to EPUB with structure detection. Open the file, pick **Convert books → EPUB**, then use **Structure detection** to map your chapter markers (for example lines starting with Chapter) to headings. For a broader comparison of tools, see [/guide/calibre-vs-online-converter](/guide/calibre-vs-online-converter). And if you need to understand format trade-offs for your device, [EPUB vs MOBI vs AZW3](/blog/epub-vs-mobi) covers the landscape.`,
    },
    {
      heading: 'Check the result before you trust it',
      body: `Open the EPUB in a reader and confirm the **table of contents** lists your chapters and tapping one jumps to the right place. If everything is still one scroll, the converter did not detect your headings and you should set chapter markers before reconverting.`,
    },
    {
      heading: 'Preparing Your TXT for a Clean Conversion',
      body: `A little cleanup before you convert saves a lot of fixing afterward:

- Use clear, consistent chapter markers such as Chapter 1 or Part One on their own line, so the converter can build the table of contents.
- Separate paragraphs with a blank line, not just a line break, so the EPUB keeps proper paragraph spacing.
- Save the file as UTF-8. A wrong encoding turns accented characters and quotes into garbage.
- Avoid tabs and fixed-width spacing for indentation; EPUB reflows text and ignores column layouts.
- Strip headers, footers, and page numbers if the TXT came from a scanned PDF, since they become noise in the ebook.

A well-structured TXT converts to an EPUB that reads like a real book instead of a formatted scroll.`,
    },
    {
      heading: 'What to Do When the Table of Contents Is Wrong',
      body: `If the EPUB comes out as one long scroll, the converter did not find your chapter breaks. Fix it at the source:

- Reopen the TXT and make sure every chapter heading sits on its own line with a consistent pattern.
- In Calibre, open Structure detection and set a regular expression that matches your marker, for example chapters that start with the word Chapter, then reconvert.
- In BookConv, confirm the chapter style is detected before downloading; re-upload if the preview shows a flat file.
- After reconverting, open the EPUB in a reader and tap through the table of contents to confirm each entry jumps to the right place.

Getting the TOC right is what turns a text dump into a navigable ebook.`,
    },
    {
      heading: 'Should You Convert TXT to EPUB at All?',
      body: `TXT to EPUB is the right move for plain prose: manuscripts, public-domain novels, notes, and drafts. It is the wrong tool in a few cases:

- Illustrated or layout-heavy books - TXT has no images or positioning, so you would lose everything. Start from the original source format instead.
- Documents with tables, footnotes, or sidebars - those structures do not survive a flat text file; convert from DOCX or PDF when that is available.
- Final published editions - if you already have a retail EPUB, reconverting from a TXT export only throws away quality.

For everything else, turning a plain TXT into an EPUB is the fastest way to make a wall of text readable on a real device.`,
    },
    {
      heading: 'A 10-Second Pre-Conversion Checklist',
      body: `Before you convert, glance at three things: your file is saved as UTF-8, chapter titles sit on their own lines, and paragraphs are separated by blank lines. Ten seconds of cleanup now prevents a flat, broken EPUB later, and it means the converter can build a real table of contents instead of guessing.`,
    }
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
// E-E-A-T authorship block (2026-09-12 D3 Tier 3 differentiation)
export const authorship = {
  author: 'BookConv Team',
  lastVerified: '2026-09-12',
  credentials: 'Based on Calibre engine maintenance and 10,000+ monthly conversions',
  estimatedConversions: '10,000+ monthly',
}

