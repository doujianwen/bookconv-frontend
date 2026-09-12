import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'azw3-vs-mobi'
export const title = 'AZW3 vs MOBI: Which Kindle Format Should You Use?'
export const problem = 'Kindle supports two legacy formats — AZW3 and MOBI — and they are not the same. AZW3 preserves fonts and layout; MOBI is simpler and older. Here is how to pick.'
export const date = '2026-09-10'
export const updatedAt = '2026-09-10'
export const tags = ['azw3', 'mobi', 'kindle', 'ebook format', 'comparison']
export const keyTakeaways = [
  'AZW3 (Kindle Format 8) preserves fonts, CSS, and images far better than MOBI.',
  'MOBI is a legacy format only needed for very old Kindles (pre-2016).',
  'Both formats are being phased out by Amazon in favor of EPUB via Send-to-Kindle.',
  'If you control the conversion, always prefer AZW3 over MOBI when possible.',
]
export const content = {
  intro: `Amazon's Kindle ecosystem has two legacy formats — **AZW3** (Kindle Format 8) and **MOBI** — and choosing between them matters if you want your book to look right. AZW3 keeps fonts, layout, and images. MOBI strips most of that away.\n\nThis guide explains the difference so you can convert to the right format and avoid a broken file.`,
  sections: [
    {
      heading: 'Quick comparison',
      body: `| Feature | AZW3 | MOBI |\n|---|---|---|\n| Also known as | Kindle Format 8 (KF8) | Mobipocket |\n| Introduced | 2011 | ~2000 |\n| Embedded fonts | ✅ Yes | ❌ No |\n| CSS styling | ✅ Full | ❌ Minimal |\n| Images | ✅ Preserved | ⚠️ Often downgraded |\n| Chapter structure | ✅ Good | ⚠️ Depends on source |\n| Device support | Kindles 2011+ | Kindles ~2007–2015 |\n| Amazon preference | ✅ Recommended | ⚠️ Legacy only |\n\n**Bottom line:** AZW3 is the better format whenever your device supports it.`,
    },
    {
      heading: 'What is AZW3?',
      body: `**AZW3** (Kindle Format 8) was introduced by Amazon in 2011 as the successor to MOBI. It is based on the EPUB standard but wrapped in an Amazon-specific container.\n\nWhat AZW3 gives you:\n- **Embedded custom fonts** — your chosen typeface survives.\n- **CSS3 styling** — margins, spacing, and text decoration are preserved.\n- **Better image handling** — covers and illustrations stay sharp.\n- **Chapter navigation** — proper TOC and section breaks.\n\nAZW3 is the recommended format for all Kindles released from roughly 2012 onward, including Paperwhite, Oasis, and basic Kindle models.`,
    },
    {
      heading: 'What is MOBI?',
      body: `**MOBI** (Mobipocket format) is the original Kindle format, dating back to Amazon's acquisition of Mobipocket in 2005. It is still supported on older Kindles but is considered legacy.\n\nWhat MOBI gives you:\n- **Simple, forgiving structure** — works even with poorly formatted source files.\n- **Small file size** — less overhead from missing advanced features.\n- **Universal Kindle compatibility** — reads on every Kindle ever made.\n\nWhat MOBI does **not** give you:\n- Custom font embedding (limited to Kindle's built-in fonts).\n- Advanced CSS or complex layout.\n- Reliable image preservation for SVG or high-resolution graphics.\n\nMOBI is only worth using if your Kindle is too old to support AZW3.`,
    },
    {
      heading: 'Which should you convert to?',
      body: `Use this decision tree:\n\n**1. What Kindle do you have?**\n- **Kindle Paperwhite (any generation), Oasis, Voyage, Kindle (2016+)** → **AZW3**\n- **Kindle (2007–2015), Kindle Keyboard, Kindle 3** → **MOBI** (AZW3 may not work)\n- **Kindle Scribe, Kindle Colorsoft** → **AZW3**\n\n**2. Where did the file come from?**\n- **EPUB source** → Convert to AZW3 for modern Kindles, MOBI for old ones.\n- **MOBI source already** → Leave it; it will open on any Kindle.\n- **AZW3 source already** → Leave it; it will open on most Kindles from 2011+.\n\n**3. Do you care about formatting quality?**\n- Yes → Always use AZW3. The difference in font and image preservation is significant.\n- No → MOBI is fine for text-only novels.\n\n**Recommendation:** Unless your Kindle is from before 2016, convert to AZW3. The better formatting is worth the extra step.`,
    },
    {
      heading: 'How to convert EPUB to AZW3 or MOBI',
      body: `Both conversions are free and run in your browser with [BookConv](https://www.bookconv.com):\n\n- **EPUB → AZW3**: [/convert/epub-to-azw3](/convert/epub-to-azw3) — recommended for all Kindles from 2016+\n- **EPUB → MOBI**: [/convert/epub-to-mobi](/convert/epub-to-mobi) — only for very old Kindles\n- **MOBI → AZW3**: [/convert/mobi-to-azw3](/convert/mobi-to-azw3) — upgrade your legacy files\n- **AZW3 → MOBI**: [/convert/azw3-to-mobi](/convert/azw3-to-mobi) — downgrade for older devices\n\nFiles are deleted within one hour. No software installation required.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Is AZW3 better than MOBI for Kindle?', answer: 'Yes. AZW3 preserves embedded fonts, CSS styling, and images far better than MOBI. Only use MOBI if your Kindle is from before roughly 2016 and does not support AZW3.' },
  { question: 'Can my Kindle read both AZW3 and MOBI?', answer: 'Most Kindles from 2011 onward can read both. Older Kindles (pre-2011) may only support MOBI. If you are unsure, try AZW3 first — if it fails, fall back to MOBI.' },
  { question: 'Will my books look better in AZW3 vs MOBI?', answer: 'Yes, especially if your book has custom fonts, images, or complex layout. AZW3 preserves these elements; MOBI often strips them. For plain text novels the difference is less noticeable.' },
  { question: 'Do I need to convert if my book is already in MOBI?', answer: 'Only if your Kindle supports AZW3 and you want better formatting. Converting MOBI to AZW3 will not add lost information (MOBI cannot store custom fonts), but AZW3 may render the file more efficiently on your device.' },
  { question: 'Can I convert MOBI to AZW3 for free?', answer: 'Yes. BookConv offers a free MOBI to AZW3 converter at [/convert/mobi-to-azw3](/convert/mobi-to-azw3). Upload your file, select AZW3, and download the result.' },
  { question: 'Is Amazon phasing out MOBI?', answer: 'Yes. Amazon has been pushing AZW3 since 2011 and now recommends EPUB via Send-to-Kindle for new uploads. MOBI remains supported on existing devices but is not the recommended format for new conversions.' },
]
