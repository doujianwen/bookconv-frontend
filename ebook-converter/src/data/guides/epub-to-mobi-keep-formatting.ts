import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'epub-to-mobi-keep-formatting'
export const title = 'EPUB to MOBI: Keep Formatting and Read on Any Kindle'
export const problem = 'Kindle will not open EPUB natively, and a careless EPUB to MOBI conversion scrambles your chapter breaks and drops your images. Here is how to convert cleanly and keep your layout.'
export const date = '2026-08-02'
export const tags = ['epub', 'mobi', 'kindle', 'formatting', 'ebook conversion']
export const formats = { source: 'epub', target: 'mobi' }
export const keyTakeaways = [
  'Older Kindles read MOBI or AZW3, not EPUB — converting is required, not optional.',
  'MOBI is a legacy format; if your Kindle supports it, AZW3 (via EPUB to AZW3) preserves more of your layout.',
  'Image-heavy EPUBs need a converter that embeds images properly, or they arrive blank.',
  'BookConv converts EPUB to MOBI in the browser and keeps images and chapter structure intact.',
]
export const content = {
  intro: 'You finished your EPUB, you send it to your Kindle, and nothing happens — or it opens as one unbroken wall of text with no cover. The problem is not your file. It is that Kindle and EPUB do not speak the same language. This guide shows how to convert EPUB to MOBI the right way so your chapters, images, and cover survive.',
  sections: [
    {
      heading: 'Why Kindle needs MOBI (and not EPUB)',
      body: `Amazon\'s Kindle ecosystem was built around Mobipocket formats long before EPUB became the open standard. Older Kindle models, and the original Send-to-Kindle pipeline, understand **MOBI** and **AZW3** — not EPUB.\n\nIf you email an EPUB to your Kindle address, Amazon may convert it for you, but the result is inconsistent: covers vanish, chapter breaks shift, and complex layouts degrade. Converting yourself gives you control over the output.`,
    },
    {
      heading: 'What breaks during EPUB to MOBI',
      body: `MOBI is an older format with a simpler layout engine than EPUB. Three things commonly go wrong:\n\n- **Chapter breaks collapse** into one long flow because the converter did not read your heading styles.\n- **Images arrive blank** when the tool fails to embed them (common with SVG covers).\n- **Fonts and fine spacing are ignored** because MOBI\'s styling model is limited.\n\nNone of this is file corruption. It is the older format simply not supporting what your EPUB used.`,
    },
    {
      heading: 'Convert with BookConv (fastest)',
      body: `BookConv runs the Calibre engine in the browser, so you get a proper EPUB to MOBI conversion with no software to install. Upload the EPUB, choose **MOBI**, and it embeds your images and preserves chapter structure. Start here: [/convert/epub-to-mobi](/convert/epub-to-mobi).\n\nFor a broader walkthrough of the same engine in a desktop app, see [/blog/epub-to-mobi-guide](/blog/epub-to-mobi-guide).`,
    },
    {
      heading: 'Convert with Calibre (more control)',
      body: `If you want to tweak the output, Calibre gives you a MOBI output profile with options for headings, margins, and reading order. Open the book, pick **Convert books → MOBI**, and adjust the **Structure detection** and **MOBI output** sections. A focused step-by-step lives in [/blog/how-to-convert-epub-to-mobi](/blog/how-to-convert-epub-to-mobi).`,
    },
    {
      heading: 'EPUB to MOBI vs EPUB to AZW3',
      body: `If your Kindle is from roughly 2016 or later, it supports **AZW3** (Kindle Format 8), which keeps far more of your layout than legacy MOBI. When you have the choice, prefer AZW3: [/convert/epub-to-azw3](/convert/epub-to-azw3). Our comparison [/blog/azw3-vs-mobi](/blog/azw3-vs-mobi) breaks down when each format wins.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Why will my Kindle not open an EPUB file?', answer: 'Older Kindle models and the original Send-to-Kindle pipeline read MOBI and AZW3, not EPUB. You need to convert the EPUB to MOBI or AZW3 before it will open correctly.' },
  { question: 'Does EPUB to MOBI keep my images and cover?', answer: 'It can, but only if the converter embeds them. BookConv embeds raster images and SVG covers during conversion, so your cover and illustrations survive. Tools that skip image embedding may deliver a blank cover.' },
  { question: 'EPUB to MOBI or AZW3 — which is better for Kindle?', answer: 'AZW3 is better when your Kindle supports it (most models from 2016 onward). AZW3 preserves more layout, fonts, and structure than the legacy MOBI format. Use MOBI only for very old Kindles.' },
  { question: 'Will my chapter breaks survive EPUB to MOBI?', answer: 'They will if the converter reads your heading styles. BookConv and Calibre both map EPUB heading levels to MOBI chapters; the result depends on your source using real Heading 1/Heading 2 styles rather than manual bold text.' },
  { question: 'Can I convert EPUB to MOBI online for free?', answer: 'Yes. BookConv converts EPUB to MOBI in the browser with no install and no cost for standard files. It is the fastest path for a one-off conversion.' },
  { question: 'Do I need Calibre to send an EPUB to my Kindle?', answer: 'No. You can convert EPUB to MOBI or AZW3 with an online converter like BookConv, then email or send the result to your Kindle. Calibre only helps if you want fine control over the output profile.' },
]
