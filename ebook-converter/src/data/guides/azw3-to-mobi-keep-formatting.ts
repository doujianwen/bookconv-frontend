import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'azw3-to-mobi-keep-formatting'
export const title = 'AZW3 to MOBI: Convert for Older Kindles Without Losing Your Book'
export const problem = 'You have an AZW3 book and an old Kindle that only reads MOBI. A direct AZW3 to MOBI conversion can strip advanced formatting, but a careful one keeps your book readable. Here is how to convert and what to expect.'
export const date = '2026-08-03'
export const tags = ['azw3', 'mobi', 'kindle', 'formatting', 'ebook conversion']
export const formats = { source: 'azw3', target: 'mobi' }
export const keyTakeaways = [
  'AZW3 (Kindle Format 8) is Amazon newer format; MOBI is the legacy format older Kindles require.',
  'Converting AZW3 to MOBI is mostly safe, but some advanced typography is simplified.',
  'Older Kindle models and basic e-ink readers only accept MOBI, so the conversion is often necessary.',
  'BookConv converts AZW3 to MOBI in the browser and keeps text, images, and chapters intact.',
]
export const content = {
  intro: 'Amazon shipped AZW3 (Kindle Format 8) on newer devices, but plenty of older Kindles and basic e-readers still only accept MOBI. If you sideload a book and your device rejects AZW3, converting to MOBI is the fix. This guide shows how to convert AZW3 to MOBI and what formatting you should expect to survive.',
  sections: [
    {
      heading: 'Why convert AZW3 to MOBI',
      body: `**AZW3** is Amazon newer Kindle container with richer typography support. **MOBI** is the older Mobipocket format that first- and second-generation Kindles and many budget e-readers still require. If your device is older or you share books with someone who has one, MOBI is the format that actually loads. A format comparison is in [/blog/azw3-vs-mobi](/blog/azw3-vs-mobi).`,
    },
    {
      heading: 'What changes in an AZW3 to MOBI conversion',
      body: `MOBI is an older spec, so a few things are simplified during conversion:

- **Advanced typography** (drop caps, precise font layouts) is flattened to basic styling.
- **Page-specific features** like fixed layouts are lost.
- **Text, chapters, images, and basic styling** carry over cleanly.

For most novels this is invisible. For heavily designed books it means a plainer result.`,
    },
    {
      heading: 'Convert with BookConv (fastest)',
      body: `BookConv runs the Calibre engine in the browser, so you get an AZW3 to MOBI conversion with nothing to install. Upload the AZW3, choose **MOBI**, and it keeps your text, images, and chapter order. Start here: [/convert/azw3-to-mobi](/convert/azw3-to-mobi). For the format choice itself, see [/guide/mobi-vs-azw3](/guide/mobi-vs-azw3).`,
    },
    {
      heading: 'Convert with Calibre (more control)',
      body: `Calibre opens AZW3 and converts to MOBI with a full set of options. Open the book, pick **Convert books → MOBI**, then review **MOBI output** settings. If you are choosing between a desktop tool and an online converter, see [/guide/calibre-vs-online-converter](/guide/calibre-vs-online-converter).`,
    },
    {
      heading: 'Check the result before you trust it',
      body: `Load the MOBI on your target device and confirm the **chapters** are in order, the **images** appear, and the **text reflows** instead of overflowing. If your device still rejects the file, it may only accept the oldest MOBI variant, which Calibre can target under **MOBI output → mobi7**.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Can I convert AZW3 to MOBI?', answer: 'Yes. Online converters like BookConv convert AZW3 to MOBI in the browser, and Calibre does it on the desktop. The result loads on older Kindles.' },
  { question: 'Will I lose formatting converting AZW3 to MOBI?', answer: 'Some advanced typography is simplified because MOBI is an older format. Text, chapters, and images carry over for most books.' },
  { question: 'Why does my old Kindle need MOBI?', answer: 'Early Kindle models and many budget e-readers only support the MOBI container. AZW3 simply will not load on them.' },
  { question: 'Does AZW3 to MOBI work on DRM-protected books?', answer: 'Only DRM-free files convert. Books locked with Amazon DRM cannot be opened by Calibre or web converters.' },
  { question: 'Is BookConv free for AZW3 to MOBI?', answer: 'Yes. BookConv converts AZW3 to MOBI in the browser at no cost for standard files, with nothing to install.' },
  { question: 'Should I keep AZW3 or MOBI long term?', answer: 'Keep AZW3 if your devices support it, since it preserves more typography. Keep MOBI only for compatibility with older hardware.' },
]
