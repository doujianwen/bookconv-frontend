import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'docx-to-epub-self-publish'
export const title = 'DOCX to EPUB: Turn Your Word Manuscript into a Real Ebook'
export const problem = 'You wrote your book in Word, but stores and e-readers want EPUB. A bad conversion gives you one giant paragraph and broken chapters. Here is how to convert cleanly and self-publish.'
export const date = '2026-08-02'
export const tags = ['docx', 'epub', 'word', 'self-publishing', 'ebook conversion']
export const formats = { source: 'docx', target: 'epub' }
export const keyTakeaways = [
  'DOCX is for editing; EPUB is for distribution — you need both steps before publishing.',
  'Clean chapter headings (real Heading 1 / Heading 2 styles) before converting, or chapters collapse.',
  'Images and the table of contents carry over only if the source document is structured, not hand-formatted.',
  'BookConv converts DOCX to EPUB in the browser; for publishing polish, Calibre produces an editable EPUB you can tweak.',
]
export const content = {
  intro: 'Word is where books are written. EPUB is where books are sold and read. The gap between them is a conversion, and it is where most self-published books quietly fall apart — a missing table of contents, a cover that will not show, chapters that merge into one scroll. This guide walks through preparing your manuscript and converting DOCX to EPUB the way stores expect.',
  sections: [
    {
      heading: 'Why Word is not an ebook format',
      body: `A **DOCX** file is an office document: it assumes a printer, a cursor, and a person editing. An **EPUB** is a reflowable package of XHTML, CSS, and images designed for a reader app to re-flow on any screen.\n\nStores like Amazon, Kobo, and Apple all accept EPUB (or convert from it). They do not accept a Word document as a final book. So the conversion is mandatory the moment you want to publish.`,
    },
    {
      heading: 'Prepare your manuscript before converting',
      body: `Most conversion disasters are actually preparation disasters. Before you convert:\n\n- Use **Heading 1** for chapter titles and **Heading 2** for sub-sections — not manual bold text. Converters read styles to build the chapter list.\n- Insert a **page break** before each chapter so they start cleanly.\n- Remove manual spacing, tabs, and empty paragraphs you used for layout.\n- Add a proper **cover image** as the first page, not a floating shape.\n\nA clean, style-driven document converts into a clean EPUB. A hand-formatted one becomes a wall of text.`,
    },
    {
      heading: 'Convert with BookConv (fastest)',
      body: `BookConv converts DOCX to EPUB in the browser with no install. Upload the manuscript, choose **EPUB**, and it embeds your images and builds the chapter structure from your heading styles. Start here: [/convert/docx-to-epub](/convert/docx-to-epub).`,
    },
    {
      heading: 'Convert with Calibre for publishing polish',
      body: `If you want to hand-tune the output before upload, Calibre gives you an editable EPUB: fix the metadata, reorder the table of contents, and adjust the cover. Add the DOCX, pick **Convert books → EPUB**, then use the **Table of contents** and **Metadata** panels. For the reverse direction (ebook back into Word), see [/blog/epub-to-word](/blog/epub-to-word).`,
    },
    {
      heading: 'Validate before you publish',
      body: `Before uploading to a store, open the EPUB in a reader and check three things: the **table of contents** lists every chapter, the **cover** displays, and the text **reflows** cleanly on a phone. If any of those fail, the issue is almost always in the source DOCX, not the converter. A format overview is in [/blog/ebook-formats-explained](/blog/ebook-formats-explained).`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Can I convert a Word document to EPUB?', answer: 'Yes. Online converters like BookConv convert DOCX to EPUB in the browser, and Calibre does it on the desktop. The quality depends mostly on how cleanly your Word file uses heading styles.' },
  { question: 'Why does my Word to EPUB conversion lose chapter breaks?', answer: 'Because the converter reads your heading styles to build chapters. If your chapters are just bold text with manual spacing, there is no structure to detect. Apply Heading 1 to each chapter title before converting and the breaks will appear.' },
  { question: 'Do images survive DOCX to EPUB?', answer: 'Yes, when they are inserted as real pictures in the document. Floating shapes, text boxes, and background watermarks may not carry over, because EPUB has no concept of free-floating layout. Use inline images for best results.' },
  { question: 'DOCX vs EPUB — what is the difference?', answer: 'DOCX is an editable office document meant for writing and printing. EPUB is a reflowable ebook format meant for reading on any device. You write in DOCX and publish in EPUB.' },
  { question: 'Can I publish the EPUB to Kindle, Kobo, or Apple Books?', answer: 'Yes. Amazon accepts EPUB for Kindle Direct Publishing (or converts it for you), and Kobo and Apple Books both accept EPUB directly. Validate the file first: working table of contents, cover, and clean reflow.' },
  { question: 'Is BookConv free for DOCX to EPUB?', answer: 'Yes. BookConv converts DOCX to EPUB in the browser at no cost for standard manuscripts, with no software to install.' },
]
