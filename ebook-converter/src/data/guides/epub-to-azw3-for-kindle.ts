import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'epub-to-azw3-for-kindle'
export const title = 'EPUB to AZW3: Send Your Ebook to Kindle Without Losing Formatting'
export const problem = 'You have an EPUB and a Kindle, and emailing it gives you a broken layout. AZW3 is the format that keeps your styling intact. Here is how to convert EPUB to AZW3 the right way.'
export const date = '2026-08-02'
export const tags = ['epub', 'azw3', 'kindle', 'formatting', 'ebook conversion']
export const formats = { source: 'epub', target: 'azw3' }
export const keyTakeaways = [
  'AZW3 (Kindle Format 8) keeps far more layout than legacy MOBI.',
  'Amazon auto-conversion of emailed EPUBs is inconsistent; converting yourself gives control.',
  'Images, cover, and chapter breaks survive when the converter reads heading styles.',
  'BookConv converts EPUB to AZW3 in the browser with no install.',
]
export const content = {
  intro: 'You wrote or downloaded an EPUB and you want it on your Kindle. Amazon will convert an EPUB if you email it, but the output is a lottery: covers vanish, spacing shifts, complex layouts flatten. AZW3 is Amazon format that respects your styling. This guide shows how to convert EPUB to AZW3 so your book looks the way you built it.',
  sections: [
    {
      heading: 'EPUB to AZW3 vs EPUB to MOBI',
      body: `If your Kindle is from about 2016 or later, it supports **AZW3** (Kindle Format 8). AZW3 keeps CSS, fonts, and layout far better than the legacy **MOBI** format. When you have the choice, AZW3 wins.

The trade-off: very old Kindles read MOBI but not AZW3. For modern devices, AZW3 is the better destination. Our companion guide covers the MOBI path: [/guide/epub-to-mobi-keep-formatting](/guide/epub-to-mobi-keep-formatting).`,
    },
    {
      heading: 'Why not just email the EPUB to Kindle?',
      body: `Amazon Send-to-Kindle service accepts EPUB and converts it for you, but the conversion runs on Amazon servers with settings you cannot control. Results vary by file: a simple novel may arrive fine, while a styled textbook can lose its structure.

Converting to AZW3 yourself means the file you send is already in the format your Kindle expects, with your layout intact.`,
    },
    {
      heading: 'Convert with BookConv (fastest)',
      body: `BookConv runs the Calibre engine in the browser, so you get a clean EPUB to AZW3 conversion with no software. Upload the EPUB, choose **AZW3**, and it embeds your cover and preserves chapter structure. Start here: [/convert/epub-to-azw3](/convert/epub-to-azw3).

A desktop walkthrough is in our [EPUB to AZW3 article](/blog/epub-to-azw3).

If you have a Kindle library of old MOBI files you want to modernize, [convert MOBI to EPUB](/convert/mobi-to-epub) so they work across all your devices — not just Kindle.`,
    },
    {
      heading: 'Convert with Calibre (more control)',
      body: `Calibre gives you an AZW3 output profile with options for headings, margins, and reading order. Open the book, pick **Convert books → AZW3**, then adjust **Structure detection** and **AZW3 output**. Compare the two Kindle formats in [/blog/azw3-vs-mobi](/blog/azw3-vs-mobi).

If you are choosing between a desktop tool and an online converter, see [/guide/calibre-vs-online-converter](/guide/calibre-vs-online-converter).`,
    },
    {
      heading: 'Send the AZW3 to your Kindle',
      body: `Once converted, send the AZW3 via the Send-to-Kindle email or the Kindle app upload. Because the file is already AZW3, Amazon passes it through with minimal changes. For converting the other way (Kindle books off the device), see [/guide/azw3-to-epub-keep-formatting](/guide/azw3-to-epub-keep-formatting).`,
    },
    {
      heading: 'What Is AZW3?',
      body: `AZW3 — also called Kindle Format 8 or KF8 — is Amazon's premium ebook format, released in 2011 as the successor to MOBI. It supports CSS3, font embedding, and complex layouts, and it's the default format on Paperwhite, Oasis, and Voyage devices. If you want an ebook that feels native on a Kindle rather than translated in the cloud, AZW3 is the target. For the full format landscape including KFX and when to pick AZW3 vs MOBI, see [Kindle Formats Explained](/guide/kindle-formats).`,
    },
    {
      heading: 'Will My Formatting Survive?',
      body: `Almost all of it. Fonts, spacing, images, and layout carry over because AZW3 speaks the same modern CSS the EPUB used. Complex or unusual layouts may need minor tweaks, but a standard novel converts cleanly. The full format picture is in [our ebook formats guide](/blog/ebook-formats-explained), and the Kindle-specific trade-offs are in [our AZW3 vs MOBI comparison](/blog/azw3-vs-mobi).`,
    },
    {
      heading: 'When to Use AZW3 (and When Not To)',
      body: `Reach for AZW3 when you're a Kindle owner who wants a native file, cares about typography, or prefers not to upload to Amazon. Skip it when you read on non-Kindle devices — Kobo, Apple Books, and most apps don't read AZW3, and for those you should keep the EPUB. AZW3 is an Amazon format; EPUB is the everywhere format. For the raw XHTML, CSS, and images behind any EPUB, [convert EPUB to ZIP](/convert/epub-to-zip) lets you inspect or rebuild them directly.`,
    },
    {
      heading: 'Key Takeaways',
      body: `- **AZW3 is Amazon's KF8** — 2011 successor to MOBI, CSS3 + font embedding.
- **Native on Kindle** — Paperwhite, Oasis, Voyage.
- **Beats Send to Kindle** on privacy, speed, typography control.
- **Formatting survives** — fonts, images, layout carry over.
- **DRM-free output** — you own the file.
- **Not for non-Kindle** — keep EPUB for Kobo and Apple Books.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Can I send an EPUB directly to my Kindle?', answer: 'Amazon Send-to-Kindle accepts EPUB and converts it for you, but the result is inconsistent. Converting to AZW3 first gives you a file your Kindle reads natively with your layout intact.' },
  { question: 'EPUB to AZW3 or MOBI — which is better?', answer: 'AZW3 is better for any Kindle from roughly 2016 onward. It preserves more CSS, fonts, and structure than the legacy MOBI format. Use MOBI only for very old devices.' },
  { question: 'Does EPUB to AZW3 keep my images and cover?', answer: 'Yes, when the converter embeds them. BookConv embeds the cover and inline images during conversion, so they survive in the AZW3.' },
  { question: 'Will my chapter breaks survive?', answer: 'They will if the converter reads your heading styles. Tools built on Calibre map EPUB heading levels to AZW3 chapters, so the result depends on your source using real Heading 1 / Heading 2 styles.' },
  { question: 'Can I convert EPUB to AZW3 online for free?', answer: 'Yes. BookConv converts EPUB to AZW3 in the browser with no install and no cost for standard files.' },
  { question: 'Is AZW3 the same as KFX?', answer: 'No. AZW3 (Kindle Format 8) is the format most converters produce. KFX is a newer Amazon format that converters generally do not generate; AZW3 is what you get from a standard EPUB to Kindle conversion.' },
]
