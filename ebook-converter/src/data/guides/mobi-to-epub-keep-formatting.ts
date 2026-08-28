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
    {
      heading: 'Formatting preservation checklist before you convert',
      body: `A faithful conversion starts before you click convert. Spend two minutes checking the source MOBI so the EPUB comes out clean:

- **Headings use real styles, not just bold text.** Converters rebuild chapters from heading records. If your source only used bold paragraphs, mark them as H1/H2 first (Calibre's Edit book view makes this quick).
- **The cover is set in metadata, not just pasted on page one.** A cover embedded in the file properties carries over; a picture placed at the start of chapter 1 does not.
- **Fonts you want kept are embedded.** MOBI often stripped custom fonts; if a specific typeface matters, re-embed it in the EPUB afterward.
- **The table of contents exists as a navigation record.** Calibre-based converters build the EPUB TOC from it; without it, readers show a flat list.

These checks matter most for typeset books. Novels with clean headings usually convert without fuss, while magazines, textbooks, and heavily styled layouts benefit from the review.`,
    },
    {
      heading: 'Fix: cover missing after conversion',
      body: `If the EPUB opens with a blank cover, the converter skipped image extraction. This is common with lightweight tools, and recovery is fast:

1. Open the book in **Calibre**, right-click **Edit metadata → Download cover** or **Add cover** from a local image.
2. Re-run the MOBI to EPUB conversion with cover extraction enabled.
3. Confirm the cover shows in the EPUB metadata, not just as the first image page.

BookConv extracts and embeds the cover automatically during conversion, so most users never hit this step. If you still see a blank cover, the source MOBI likely had no real cover record and you would add one in Calibre.`,
    },
    {
      heading: 'Fix: chapters merged into one long scroll',
      body: `When the whole book becomes one unbroken page, the converter did not read the chapter structure. Two fixes:

- **Source has real headings:** In Calibre, open **Convert books → Structure detection** and set chapter detection to match your headings (for example detect at //h:h1 or //h:h2). Re-convert and each heading becomes a chapter break.
- **Source has no headings, only bold lines:** Switch on **Heuristic processing** so Calibre infers breaks, or insert page breaks manually in Edit book.

The root cause is almost always the source file, not the converter. A MOBI that never stored chapter markers cannot gain them magically. For a step-by-step desktop walkthrough, see [/blog/mobi-to-epub](/blog/mobi-to-epub); to start in the browser, open [/convert/mobi-to-epub](/convert/mobi-to-epub).`,
    },
    {
      heading: 'What survives vs what needs a manual touch',
      body: `| Element | Survives conversion | Needs manual repair |
|---------|--------------------|--------------------|
| Body text and paragraphs | Yes | — |
| Chapter breaks (real headings) | Yes | Re-detect in Calibre if missed |
| Embedded cover | Usually | Re-embed if blank |
| Inline images | Yes | Re-optimize if oversized |
| Bold, italic, lists | Yes | — |
| Custom fonts | Rarely | Re-embed in the EPUB |
| Series metadata | Folded into title | Clean up manually |
| Reading position and highlights | No | Not portable across formats |

Most personal MOBI libraries convert faithfully with no repair. The steps above exist for the styled, typeset, or metadata-heavy books where fidelity actually matters.`,
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
  { question: 'How do I keep formatting when converting MOBI to EPUB?', answer: 'Use real heading styles in the source, keep the cover set in metadata, and let a Calibre-based converter read the chapter records. If the cover comes out blank or chapters merge, re-extract the cover or adjust structure detection in Calibre. BookConv applies these steps automatically during conversion.' },
]
