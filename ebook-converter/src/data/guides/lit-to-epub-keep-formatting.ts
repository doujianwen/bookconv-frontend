import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'lit-to-epub-keep-formatting'
export const title = 'LIT to EPUB: Convert Old Microsoft Reader Books and Keep Your Formatting'
export const problem = 'You found books in the LIT format from Microsoft Reader, but no modern app opens them. A careless LIT to EPUB conversion drops your cover and scrambles chapters. Here is how to convert cleanly and keep your layout.'
export const date = '2026-08-02'
export const tags = ['lit', 'epub', 'microsoft reader', 'legacy format', 'ebook conversion']
export const formats = { source: 'lit', target: 'epub' }
export const keyTakeaways = [
  'LIT is the discontinued Microsoft Reader format; EPUB is the open standard every app reads.',
  'Chapter breaks survive only when the converter reads the LIT internal structure, not manual spacing.',
  'Cover and images carry over when the tool extracts them during conversion.',
  'BookConv converts LIT to EPUB in the browser and keeps your chapters and cover intact.',
]
export const content = {
  intro: 'LIT was Microsoft Reader proprietary ebook format, retired nearly two decades ago. If you still have a shelf of .lit files, they are stranded: no phone app, no Kobo, no Apple Books will open them. EPUB is the universal reflowable standard, so converting LIT to EPUB is how you rescue those books. This guide shows how to convert LIT to EPUB without losing your cover, images, or chapter breaks.',
  sections: [
    {
      heading: 'What is the LIT format',
      body: `**LIT** is the Microsoft Reader format from the early 2000s. It packaged books in a proprietary container based on Microsoft Compiled HTML Help. Microsoft discontinued the Reader in 2012, and no mainstream reading app has supported LIT since. If you want the book off that dead format, EPUB is the destination. A full background is in [/blog/lit-ebook-format](/blog/lit-ebook-format).`,
    },
    {
      heading: 'What goes wrong in a bad LIT to EPUB conversion',
      body: `LIT stores structure in a way naive tools mishandle:

- **Chapter breaks collapse** into one long scroll when the converter ignores the LIT heading records.
- **The cover disappears** because the tool never extracts the embedded cover image.
- **Images go missing** when they are not re-packaged into the EPUB.

None of this damages your original file. The converter simply failed to carry the structure across.`,
    },
    {
      heading: 'Convert with BookConv (fastest)',
      body: `BookConv runs the Calibre engine in the browser, so you get a proper LIT to EPUB conversion with nothing to install. Upload the .lit file, choose **EPUB**, and it extracts the cover and rebuilds the chapter list. Start here: [/convert/lit-to-epub](/convert/lit-to-epub).

For help choosing between a desktop tool and an online converter, see [/guide/calibre-vs-online-converter](/guide/calibre-vs-online-converter).`,
    },
    {
      heading: 'Convert with Calibre (more control)',
      body: `If you want to inspect the output, Calibre opens the LIT file and converts to EPUB with a full set of options. Open the book, pick **Convert books → EPUB**, then review the **Structure detection** panel. A format overview is in [/blog/ebook-formats-explained](/blog/ebook-formats-explained).`,
    },
    {
      heading: 'Check the result before you trust it',
      body: `Open the new EPUB in a reader and confirm three things: the **cover** shows, the **table of contents** lists every chapter, and the text **reflows** on a phone. If the cover is blank, the converter skipped image extraction. If you also work with other legacy formats, the same pattern applies to FB2 and MOBI sources.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Can I convert LIT to EPUB?', answer: 'Yes. Online converters like BookConv and desktop tools like Calibre both handle LIT to EPUB. The result reads on any modern reading app.' },
  { question: 'Why will not my LIT file open on my phone?', answer: 'Because LIT is the discontinued Microsoft Reader format. No mainstream reading app supports it today, so you must convert to EPUB first.' },
  { question: 'Does LIT to EPUB keep my cover and images?', answer: 'It can, if the converter extracts and re-embeds them. BookConv carries the cover and inline images through the conversion so they survive in the EPUB.' },
  { question: 'Is BookConv free for LIT to EPUB?', answer: 'Yes. BookConv converts LIT to EPUB in the browser at no cost for standard files, with nothing to install.' },
  { question: 'What if my LIT file has DRM?', answer: 'Only DRM-free LIT files convert. Files locked with Microsoft DRM cannot be opened by Calibre or web converters, which is outside any converter scope.' },
  { question: 'LIT or EPUB — which should I keep long term?', answer: 'Keep EPUB. It is the open standard every reading app supports, while LIT is a dead Microsoft format that fewer tools handle each year.' },
]
