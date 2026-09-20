import { BlogFaq } from '../blog/types'

export const slug = 'kindle-formats'
export const title = 'What Format Does Kindle Use? AZW3, KFX, MOBI & EPUB Explained'
export const problem = 'AZW3, KFX, MOBI, EPUB - Kindle formats confuse everyone. This guide explains what each means, the safest format to convert to today, and how BookConv converts free in your browser with no software to install.'
export const date = '2026-08-07'
export const updatedAt = '2026-09-18'
export const tags = ['kindle formats', 'what format does kindle use', 'azw3', 'kfx', 'mobi', 'send to kindle', 'epub vs kindle']
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
      body: `AZW3 is Amazon is **KF8** format, introduced in 2011 to replace the original AZW — a thin wrapper around the old Mobipocket engine. Under the hood it is HTML and CSS packaged much like EPUB, but sealed inside the company-owned own container, which is why only Kindle hardware and apps read it.

What that buys you over the older MOBI/AZW1 lineage:
- Embedded fonts and real CSS, so typography survives the trip
- Tables, drop caps, and fixed-layout pages for illustrated titles
- Better spacing and margin control than Mobipocket ever allowed

It is **not** an open format, so Kobo, Nook, and most third-party readers ignore it. Think of AZW3 as the best format *inside Amazon is walled garden*, and EPUB as the one that travels everywhere else.

Moving in or out is simple: [EPUB to AZW3](/convert/epub-to-azw3) for a modern Kindle, or [AZW to MOBI](/convert/azw-to-mobi) if a legacy device cannot read AZW3.`,
    },
    {
      heading: 'What to convert to (practical rule)',
      body: `**For sideloading a file yourself:** convert to **AZW3** — BookConv can produce it and Kindles read it well.\n\n**For Send to Kindle:** upload **EPUB or AZW3** and let Amazon convert.\n\n**Avoid:** converting new books to MOBI, and trying to generate KFX yourself.`,
    },
    {
      heading: 'Common Kindle conversion paths',
      body: `**EPUB → AZW3** for sideloading: [EPUB to AZW3](/convert/epub-to-azw3).\n\n**AZW3 → PDF** if you need a fixed-layout printout: [AZW3 to PDF](/convert/azw3-to-pdf).\n\n**MOBI → EPUB/AZW3** to modernize an old library: [Mobi to EPUB](/convert/mobi-to-epub).

**AZW → MOBI** only if a legacy Kindle cannot read AZW3: [AZW to MOBI](/convert/azw-to-mobi).`,
    },
    {
      heading: 'Why not just use MOBI?',
      body: `MOBI is legacy. Amazon’s Send to Kindle no longer prioritizes it, and newer features only exist in AZW3/KFX. Converting new content to MOBI risks a file your device handles poorly.\n\nIf you already own MOBI files, convert them forward to AZW3 rather than keeping the old format.`,
    },
    {
      heading: 'Can Kindle Fire Read MOBI?',
      body: `Kindle Fire tablets run the Kindle app on Fire OS and read the same formats as other Kindles: MOBI, AZW3, KFX, and EPUB through Send to Kindle. So yes, a Fire can open MOBI files.

One caveat: older MOBI files built with non-standard tools sometimes fail to open on a Fire and show the familiar error that the file does not open. If a MOBI will not open, convert it to AZW3 — BookConv handles that — or resend it through Send to Kindle, which re-encodes the file. For a model-by-model look at which formats each Kindle reads, see our can-Kindle-read-AZW3 guide.`
    },
    {
      heading: 'Related guides for your specific situation',
      body: `If you are not sure which format fits your device or use case, these deeper guides help:
- **Can my Kindle read AZW3?** — model-by-model compatibility table. [/blog/can-kindle-read-azw3](/blog/can-kindle-read-azw3)
- **Your ebook will not open on Kindle?** — five common causes and fixes. [/blog/why-ebook-wont-open-kindle](/blog/why-ebook-wont-open-kindle)
- **EPUB to AZW3 step-by-step** — convert without losing formatting. [/guide/epub-to-azw3-for-kindle](/guide/epub-to-azw3-for-kindle)
- **Moving from Kindle to Kobo?** — why EPUB is the right target. [/blog/mobi-to-kobo](/blog/mobi-to-kobo)
- **Upgrading AZW3 to MOBI for old devices** — compatibility guide. [/blog/azw3-to-mobi](/blog/azw3-to-mobi)
- **FB2 and Lit format reference** — non-Amazon library formats explained. [/blog/fb2-vs-epub](/blog/fb2-vs-epub) and [/blog/lit-format-conversion-and](/blog/lit-format-conversion-and)
- **Troubleshooting non-Kindle readers** — Kobo, Apple Books, and Android tips. [/blog/kobo-to-epub](/blog/kobo-to-epub) and [/blog/read-epub-on-any-device](/blog/read-epub-on-any-device)`,
    },
    {
      heading: 'Start converting now',
      body: `Ready to convert? Head to the [EPUB to AZW3 converter](/convert/epub-to-azw3) for a modern Kindle, or [MOBI to EPUB](/convert/mobi-to-epub) if you want to escape the Amazon ecosystem entirely. Both run in your browser with no install.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'What format does Kindle use?', answer: 'Kindle primarily uses AZW3 and KFX. For sideloading, AZW3 is the most compatible format BookConv can produce. Send to Kindle also accepts EPUB and converts it automatically.' },
  { question: 'What format should I convert to for Kindle?', answer: 'For sideloading, AZW3 is the most compatible format BookConv can produce. For Send to Kindle, upload EPUB or AZW3 and Amazon converts it.' },
  { question: 'Is MOBI still supported on Kindle?', answer: 'Amazon retired MOBI side-loading; Send to Kindle now favors EPUB and AZW3. Converting new books to MOBI is no longer recommended.' },
  { question: 'What is KFX and can I create it?', answer: 'KFX is a proprietary Amazon format with advanced layout. It is generated by the company-owned own pipeline, so third-party converters generally cannot create true KFX. Convert to AZW3 instead.' },
  { question: 'Can BookConv convert EPUB to a Kindle format?', answer: 'Yes. BookConv converts EPUB to AZW3, which Kindles read well, and you can also send EPUB to Kindle via Amazon is Send to Kindle.' },
  { question: 'How do I modernize an old MOBI library?', answer: 'Convert MOBI forward to AZW3 (or EPUB) with BookConv so your files use a current, well-supported format.' },
  { question: 'Can Kindle Fire open MOBI files?', answer: 'Yes. The Kindle app on Fire OS reads MOBI, AZW3, KFX, and EPUB via Send to Kindle. If an older MOBI file does not open, convert it to AZW3 or resend it through Send to Kindle.' },
  { question: 'Can I read Kindle books on Kobo?', answer: 'Only if they are DRM-free. Convert protected Kindle books to EPUB using BookConv, then transfer to your Kobo.' },
  { question: 'How to transfer ebooks between Kindle and other devices?', answer: 'Convert Kindle books to EPUB (DRM-free only) using BookConv, then sync via USB, email, or cloud storage. See our multi-device sync guide for details.' },
]
// E-E-A-T authorship block (2026-09-12 D3 Tier 3 differentiation)
export const authorship = {
  author: 'BookConv Team',
  lastVerified: '2026-09-12',
  credentials: 'Based on Calibre engine maintenance and 10,000+ monthly conversions',
  estimatedConversions: '10,000+ monthly',
}

