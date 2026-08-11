import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'kindle-formats'
export const title = 'Kindle Formats Explained: AZW3, KFX, MOBI & What to Convert To'
export const problem = 'AZW3, KFX, MOBI, EPUB — Kindle’s format soup confuses everyone. Here is what each means and the safest format to convert to today.'
export const date = '2026-08-07'
export const tags = ['kindle formats', 'azw3', 'kfx', 'mobi', 'send to kindle']
export const keyTakeaways = [
  'Amazon’s Send to Kindle accepts EPUB and AZW3 and converts them for your device.',
  'MOBI side-loading is retired; don’t convert new books to MOBI for Kindle.',
  'KFX is Amazon’s proprietary format — you can’t easily create it yourself.',
  'For sideloading, AZW3 is the most compatible format BookConv can produce.',
]
export const formats = { source: 'epub', target: 'azw3' }
export const content = {
  intro: 'Kindle readers don’t take “any ebook.” Over the years Amazon moved from MOBI to AZW3 and now to KFX, while Send to Kindle added EPUB support. This page untangles the formats so you convert to the right one instead of a file your Kindle rejects.',
  sections: [
    {
      heading: 'The Kindle format landscape',
      body: `**MOBI:** the old standard. Amazon retired MOBI side-loading, so new uploads in MOBI are no longer the recommended path.\n\n**AZW3:** Amazon’s modern ebook format with better typography and features; widely supported by Kindle devices.\n\n**KFX:** Amazon’s current proprietary format with advanced layout; created by Amazon’s own pipeline, not easily produced by third-party converters.\n\n**EPUB:** the open standard. Send to Kindle now accepts EPUB and converts it for your device.`,
    },
    {
      heading: 'What Is AZW3?',
      body: `AZW3 is Amazon's **KF8** format, introduced in 2011 to replace the original AZW — a thin wrapper around the old Mobipocket engine. Under the hood it's HTML and CSS packaged much like EPUB, but sealed inside Amazon's own container, which is why only Kindle hardware and apps read it.

What that buys you over the older MOBI/AZW1 lineage:
- Embedded fonts and real CSS, so typography survives the trip
- Tables, drop caps, and fixed-layout pages for illustrated titles
- Better spacing and margin control than Mobipocket ever allowed

It is **not** an open format, so Kobo, Nook, and most third-party readers ignore it. Think of AZW3 as the best format *inside Amazon's walled garden*, and EPUB as the one that travels everywhere else.

Moving in or out is simple: [EPUB to AZW3](/convert/epub-to-azw3) for a modern Kindle, or [AZW to MOBI](/convert/azw-to-mobi) if a legacy device can't read AZW3.`,
    },
    {
      heading: 'What to convert to (practical rule)',
      body: `**For sideloading a file yourself:** convert to **AZW3** — BookConv can produce it and Kindles read it well.\n\n**For Send to Kindle:** upload **EPUB or AZW3** and let Amazon convert.\n\n**Avoid:** converting new books to MOBI, and trying to generate KFX yourself.`,
    },
    {
      heading: 'Common Kindle conversion paths',
      body: `**EPUB → AZW3** for sideloading: [EPUB to AZW3](/convert/epub-to-azw3).\n\n**AZW3 → PDF** if you need a fixed-layout printout: [AZW3 to PDF](/convert/azw3-to-pdf).\n\n**MOBI → EPUB/AZW3** to modernize an old library: [Mobi to EPUB](/convert/mobi-to-epub).

**AZW → MOBI** only if a legacy Kindle can't read AZW3: [AZW to MOBI](/convert/azw-to-mobi).`,
    },
    {
      heading: 'Why not just use MOBI?',
      body: `MOBI is legacy. Amazon’s Send to Kindle no longer prioritizes it, and newer features only exist in AZW3/KFX. Converting new content to MOBI risks a file your device handles poorly.\n\nIf you already own MOBI files, convert them forward to AZW3 rather than keeping the old format.`,
    },
    {
      heading: 'Related guides for your specific situation',
      body: `If you're not sure which format fits your device or use case, these deeper guides help:
- **Can my Kindle read AZW3?** — model-by-model compatibility table. [/blog/can-kindle-read-azw3](/blog/can-kindle-read-azw3)
- **Your ebook won't open on Kindle?** — five common causes and fixes. [/blog/why-ebook-wont-open-kindle](/blog/why-ebook-wont-open-kindle)
- **EPUB to AZW3 step-by-step** — convert without losing formatting. [/guide/epub-to-azw3-for-kindle](/guide/epub-to-azw3-for-kindle)
- **Moving from Kindle to Kobo?** — why EPUB is the right target. [/blog/mobi-to-kobo](/blog/mobi-to-kobo)`,
    },
    {
      heading: 'Start converting now',
      body: `Ready to convert? Head to the [EPUB to AZW3 converter](/convert/epub-to-azw3) for a modern Kindle, or [MOBI to EPUB](/convert/mobi-to-epub) if you want to escape the Amazon ecosystem entirely. Both run in your browser with no install.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'What format should I convert to for Kindle?', answer: 'For sideloading, AZW3 is the most compatible format BookConv can produce. For Send to Kindle, upload EPUB or AZW3 and Amazon converts it.' },
  { question: 'Is MOBI still supported on Kindle?', answer: 'Amazon retired MOBI side-loading; Send to Kindle now favors EPUB and AZW3. Converting new books to MOBI is no longer recommended.' },
  { question: 'What is KFX and can I create it?', answer: 'KFX is Amazon’s proprietary format with advanced layout. It is generated by Amazon’s own pipeline, so third-party converters generally can’t create true KFX. Convert to AZW3 instead.' },
  { question: 'Can BookConv convert EPUB to a Kindle format?', answer: 'Yes. BookConv converts EPUB to AZW3, which Kindles read well, and you can also send EPUB to Kindle via Amazon’s Send to Kindle.' },
  { question: 'How do I modernize an old MOBI library?', answer: 'Convert MOBI forward to AZW3 (or EPUB) with BookConv so your files use a current, well-supported format.' },
]
