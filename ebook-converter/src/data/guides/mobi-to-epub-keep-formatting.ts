import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'mobi-to-epub-keep-formatting'
export const title = 'MOBI to EPUB: Keep Formatting and Read Your Kindle Books Anywhere'
export const problem = 'You bought books in MOBI and now your non-Kindle app will not open them. A sloppy MOBI to EPUB conversion drops your cover and merges chapters. Here is how to convert cleanly and keep your layout.'
export const date = '2026-08-02'
export const tags = ['mobi', 'epub', 'kindle', 'formatting', 'ebook conversion']
export const formats = { source: 'mobi', target: 'epub' }
export const keyTakeaways = [
  'MOBI is Amazon legacy format; EPUB is the open standard most non-Kindle apps read.',
  'Chapter breaks survive only when the converter reads your heading structure, not manual spacing.',
  'Images and cover carry over when the tool embeds them properly during conversion.',
  'BookConv converts MOBI to EPUB in the browser and keeps images and chapters intact.',
]
export const content = {
  intro: 'You have a shelf of MOBI books from an old Kindle, but your phone, Kobo, or Apple Books app will not touch them. MOBI is Amazon older container, and outside the Kindle world it is a dead end. Converting to EPUB frees those books to read on any device. This guide shows how to convert MOBI to EPUB without losing your cover, images, or chapter breaks.',
  sections: [
    {
      heading: 'Why convert MOBI to EPUB',
      body: `**MOBI** is the Mobipocket format Amazon used for early Kindles. **EPUB** is the open reflowable standard supported by Kobo, Apple Books, Google Play Books, and most reading apps. If you want your books off a Kindle and onto anything else, EPUB is the destination.

There is also a practical reason: many older purchases were delivered as MOBI and were never re-issued. Converting them preserves a library you already paid for.`,
    },
    {
      heading: 'What goes wrong in a bad MOBI to EPUB conversion',
      body: `MOBI stores structure differently from EPUB, so naive converters stumble:

- **Chapter breaks collapse** into one long scroll when the tool ignores the MOBI heading records.
- **The cover disappears** because the converter does not extract the embedded cover image.
- **Images go missing** when they are not properly re-packaged into the EPUB.

None of this is damage to your original file. The converter simply failed to carry the structure across.`,
    },
    {
      heading: 'Convert with BookConv (fastest)',
      body: `BookConv runs the Calibre engine in the browser, so you get a proper MOBI to EPUB conversion with nothing to install. Upload the MOBI, choose **EPUB**, and it extracts the cover and rebuilds the chapter list. Start here: [/convert/mobi-to-epub](/convert/mobi-to-epub).

For the reverse direction (EPUB onto a Kindle), see [/guide/epub-to-mobi-keep-formatting](/guide/epub-to-mobi-keep-formatting).`,
    },
    {
      heading: 'Convert with Calibre (more control)',
      body: `If you want to inspect the output, Calibre opens the MOBI and converts to EPUB with a full set of options. Open the book, pick **Convert books → EPUB**, then review the **Structure detection** and **EPUB output** panels. A detailed walkthrough is in [/blog/mobi-to-epub](/blog/mobi-to-epub).

If you are choosing between a desktop tool and an online converter, see [/guide/calibre-vs-online-converter](/guide/calibre-vs-online-converter).`,
    },
    {
      heading: 'Check the result before you trust it',
      body: `Open the new EPUB in a reader and confirm three things: the **cover** shows, the **table of contents** lists every chapter, and the text **reflows** on a phone. If the cover is blank, the converter skipped image extraction. A format overview is in [/blog/ebook-formats-explained](/blog/ebook-formats-explained).`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Can I convert MOBI to EPUB?', answer: 'Yes. Online converters like BookConv convert MOBI to EPUB in the browser, and Calibre does it on the desktop. The result reads on Kobo, Apple Books, and most apps.' },
  { question: 'Will my Kindle books convert if they have DRM?', answer: 'Only DRM-free MOBI files convert. Books locked with Amazon DRM cannot be opened by Calibre or web converters. You would need to obtain a DRM-free copy through Amazon own download options first, which is outside any converter scope.' },
  { question: 'Does MOBI to EPUB keep my cover and images?', answer: 'It can, but only if the converter extracts and re-embeds them. BookConv carries the cover and inline images through the conversion, so they survive in the EPUB.' },
  { question: 'Why did my chapters merge into one scroll?', answer: 'Because the converter did not read the MOBI heading records. Converters built on Calibre map those records to EPUB chapters; the result depends on the source file actually containing chapter markers.' },
  { question: 'Is BookConv free for MOBI to EPUB?', answer: 'Yes. BookConv converts MOBI to EPUB in the browser at no cost for standard files, with no software to install.' },
  { question: 'MOBI or EPUB — which should I keep long term?', answer: 'Keep EPUB. It is the open standard every modern reading app supports, while MOBI is a legacy Amazon format that fewer tools handle well.' },
]
