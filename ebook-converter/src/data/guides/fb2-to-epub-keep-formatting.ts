import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'fb2-to-epub-keep-formatting'
export const title = 'FB2 to EPUB: Convert FictionBook for Any Reader (Including Kindle)'
export const problem = 'You downloaded a book as FB2 from a Russian library or fan site, but your Kobo, Apple Books, or Kindle will not open it. An FB2 to EPUB conversion fixes that, but a careless one drops your cover and mangles Cyrillic text. Here is how to convert cleanly.'
export const date = '2026-08-03'
export const tags = ['fb2', 'epub', 'fictionbook', 'ebook conversion', 'cyrillic']
export const formats = { source: 'fb2', target: 'epub' }
export const keyTakeaways = [
  'FB2 (FictionBook) is an XML-based ebook format popular in Russian and Eastern European libraries.',
  'EPUB is the open standard every modern reader supports, so it is the right destination.',
  'Cyrillic and other non-Latin scripts survive only when the converter keeps UTF-8 encoding.',
  'BookConv converts FB2 to EPUB in the browser and preserves cover, structure, and text encoding.',
]
export const content = {
  intro: 'FB2, short for FictionBook, is a free XML-based ebook format common in Russian and Eastern European collections. If you grabbed a public-domain novel or a fan translation as FB2, you may find that your usual reading app refuses it. Converting FB2 to EPUB moves the book into the format every device understands. This guide shows how to do it without losing your cover, chapter structure, or special characters.',
  sections: [
    {
      heading: 'Why convert FB2 to EPUB',
      body: `**FB2** stores a book as a single XML file with embedded metadata, cover, and body text. It is elegant but narrow in support: Calibre and a few regional apps read it, while Kobo, Apple Books, Google Play Books, and most Kindle tools do not. **EPUB** is the open reflowable standard backed by practically every reading app and device. Moving from FB2 to EPUB frees the book to travel. A format overview is in [/blog/ebook-formats-explained](/blog/ebook-formats-explained).`,
    },
    {
      heading: 'What breaks in a bad FB2 to EPUB conversion',
      body: `FB2 files often carry content that naive converters mishandle:

- **Cyrillic and accented text turns into garbage** when the tool drops UTF-8 encoding.
- **The cover vanishes** because the converter ignores the embedded binary image.
- **Notes and epigraphs scatter** when the converter cannot map FB2 semantic tags to EPUB structure.

None of this harms your original file. The converter simply failed to carry the pieces across.`,
    },
    {
      heading: 'Convert with BookConv (fastest)',
      body: `BookConv runs the Calibre engine in the browser, so you get a proper FB2 to EPUB conversion with nothing to install. Upload the FB2, choose **EPUB**, and it carries the cover and preserves UTF-8 text. Start here: [/convert/fb2-to-epub](/convert/fb2-to-epub). A detailed walkthrough is in [/blog/fb2-to-epub](/blog/fb2-to-epub).`,
    },
    {
      heading: 'Convert with Calibre (more control)',
      body: `If you want to inspect the result, Calibre opens FB2 and converts to EPUB with full options. Open the book, pick **Convert books → EPUB**, then check **Look & Feel** for encoding and **EPUB output** for structure. For a broader comparison of desktop and online tools, see [/guide/calibre-vs-online-converter](/guide/calibre-vs-online-converter).`,
    },
    {
      heading: 'Check the result before you trust it',
      body: `Open the new EPUB in a reader and confirm three things: the **cover** shows, the **table of contents** lists every chapter, and **Cyrillic or accented text** renders correctly instead of question marks. If characters look broken, the converter dropped UTF-8 and you should reconvert with encoding forced to UTF-8. If you plan to read on a Kindle, send the EPUB onward as shown in [/guide/epub-to-azw3-for-kindle](/guide/epub-to-azw3-for-kindle).`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Can I convert FB2 to EPUB?', answer: 'Yes. Online converters like BookConv convert FB2 to EPUB in the browser, and Calibre does it on the desktop. The result opens in Kobo, Apple Books, and most apps.' },
  { question: 'Why is my Cyrillic text showing as question marks?', answer: 'Because the converter dropped UTF-8 encoding. Reconvert with UTF-8 forced, or use a tool like Calibre that preserves it by default.' },
  { question: 'Does FB2 to EPUB keep my cover image?', answer: 'It can, but only if the converter extracts the embedded cover. BookConv carries the cover through the conversion so it survives in the EPUB.' },
  { question: 'Is BookConv free for FB2 to EPUB?', answer: 'Yes. BookConv converts FB2 to EPUB in the browser at no cost for standard files, with no software to install.' },
  { question: 'Can I read the EPUB on a Kindle?', answer: 'You can, but Kindle prefers its own formats. Send the EPUB through Amazon Send-to-Kindle, or convert it onward to AZW3 as shown in the EPUB to AZW3 guide.' },
  { question: 'Where do FB2 files come from?', answer: 'Mostly Russian and Eastern European digital libraries and fan translation groups that adopted FictionBook as their standard. They are common for public-domain classics and community translations.' },
]
