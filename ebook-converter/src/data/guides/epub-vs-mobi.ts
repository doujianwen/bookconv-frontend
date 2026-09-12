import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'epub-vs-mobi'
export const title = 'EPUB vs MOBI: Which Ebook Format Is Right for Your Device?'
export const problem = 'EPUB and MOBI both hold ebooks, but they serve different purposes. One is the modern open standard; the other is the legacy Kindle format. Here is how they compare and which one your device actually needs.'
export const date = '2026-09-10'
export const updatedAt = '2026-09-10'
export const tags = ['epub', 'mobi', 'ebook format', 'kindle', 'comparison']
export const keyTakeaways = [
  'EPUB is the open standard — used by Kobo, Apple Books, Google Play, and most readers except Kindle.',
  'MOBI is Amazon\'s legacy format — still required by older Kindles, but being phased out for AZW3.',
  'If you have a Kindle, you must convert to MOBI or AZW3; EPUB will not open natively on older models.',
  'EPUB preserves more formatting and font embedding; MOBI is simpler and more forgiving of broken source files.',
]
export const content = {
  intro: `You have an ebook — maybe a downloaded EPUB from your library, or a MOBI file from an old Kindle purchase — and you need to know which one your device can actually read. The confusion is real: some devices prefer one format, some prefer the other, and a few do not support either without a conversion step.

This guide breaks down **EPUB vs MOBI** in plain terms so you can stop guessing and pick the right file for your reader.

**Quick answer:** If you have a Kindle from before roughly 2016, convert your EPUB to MOBI. If you have any newer Kindle, convert to AZW3 instead. For Kobo, Apple Books, Google Play, or any non-Amazon reader, EPUB is the correct format.`,
  sections: [
    {
      heading: 'EPUB at a glance',
      body: `**EPUB** (short for Electronic Publication) is the open, industry-standard ebook format maintained by the International Digital Publishing Forum (IDPF). It is supported natively by:\n\n- **Kobo** (all models)\n- **Apple Books** (iPhone, iPad, Mac)\n- **Google Play Books**\n- **Barnes & Noble Nook**\n- **Most other ebook readers** except Kindle\n\nEPUB supports reflowable text, embedded fonts, CSS styling, fixed-layout books, and images. It is the format used by virtually all public libraries (via OverDrive/Libby) and major bookstores outside Amazon.

The catch: **Kindle does not natively read EPUB** on most models released before 2024. Amazon introduced limited EPUB support via its latest Send-to-Kindle pipeline, but the conversion is unreliable and you lose control over formatting.`,
    },
    {
      heading: 'MOBI at a glance',
      body: `**MOBI** (originally Mobipocket format) is an older proprietary format that Amazon adopted and used as the default for Kindle for many years. It is supported natively by:\n\n- **Kindle devices from roughly 2007 to 2015** (pre-AZW3 era)\n- **Kindle apps on some older smartphones**\n\nMOBI is a simpler format — it supports basic text, images, and limited styling. It does **not** support embedded custom fonts, advanced CSS, or complex layout features. This means:\n\n- Font choices are limited to what Kindle provides.\n- Images may be downgraded or lost during conversion.\n- Chapter breaks can collapse if the converter does not read heading styles.\n\nAmazon effectively replaced MOBI with **AZW3 (Kindle Format 8)** starting in 2011, and newer Kindles no longer recommend MOBI.`,
    },
    {
      heading: 'Side-by-side comparison',
      body: `| Feature | EPUB | MOBI |\n|---|---|---|\n| Open standard | ✅ Yes (IDPF) | ❌ Proprietary (Amazon legacy) |\n| Native Kindle support | ❌ No (except latest Send-to-Kindle) | ✅ Yes (older Kindles) |\n| Kobo / Apple Books / Nook | ✅ Yes | ❌ No |\n| Embedded fonts | ✅ Yes | ❌ Limited / no |\n| Advanced CSS styling | ✅ Yes | ❌ No |\n| Image handling | ✅ Good (SVG + raster) | ⚠️ Fair (often downgraded) |\n| Library / bookstore compatible | ✅ Broad | ❌ Amazon-only |\n| File size | ⚠️ Larger (richer features) | ✅ Smaller (simpler structure) |\n\n**Bottom line:** EPUB is the better format for quality and compatibility across most devices. MOBI is only necessary if you have an older Kindle that cannot read AZW3.`,
    },
    {
      heading: 'Which format should you use?',
      body: `Use this decision tree to pick the right format:\n\n**1. What device are you reading on?**\n- **Kindle (any model)** → Convert to AZW3 (preferred) or MOBI (if your Kindle is very old, pre-2016)\n- **Kobo** → EPUB is native; no conversion needed\n- **Apple Books / iPhone / iPad** → EPUB is native; no conversion needed\n- **Nook / Google Play Books** → EPUB is native; no conversion needed\n- **Multiple devices** → Stick with EPUB and convert to device-specific formats only when needed\n\n**2. Do you need to convert?**\n- If your source is EPUB and your target device is Kindle → use a converter like [BookConv's EPUB to AZW3](/convert/epub-to-azw3) or [EPUB to MOBI](/convert/epub-to-mobi)\n- If your source is MOBI and you want to move to a non-Kindle device → convert to EPUB with [BookConv's MOBI to EPUB](/convert/mobi-to-epub)\n\n**3. What matters more: convenience or quality?**\n- Convenience first (one-off file, don't want to install anything) → online converter\n- Quality and privacy first (batch work, sensitive manuscript) → Calibre on your computer`,
    },
    {
      heading: 'Converting between EPUB and MOBI',
      body: `If you need to switch between EPUB and MOBI, [BookConv](https://www.bookconv.com) offers free online converters for both directions:\n\n- **EPUB → MOBI**: [/convert/epub-to-mobi](/convert/epub-to-mobi) — for older Kindles\n- **EPUB → AZW3**: [/convert/epub-to-azw3](/convert/epub-to-azw3) — for modern Kindles (recommended)\n- **MOBI → EPUB**: [/convert/mobi-to-epub](/convert/mobi-to-epub) — to escape the Kindle ecosystem\n\nAll conversions run in your browser. Files are deleted automatically within one hour. No software installation required.`,
    },
    {
      heading: 'Should you bother converting at all?',
      body: `Not always. If you already have an EPUB and your device reads EPUB natively (Kobo, Apple Books, etc.), leave it as EPUB. Converting only adds risk — each conversion can degrade images, lose fonts, or mishandle chapter structure.\n\nConvert only when your device requires a different format. For Kindle users, that means converting EPUB to AZW3 (or MOBI for very old devices). For everyone else, stick with EPUB and avoid the extra step.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Can Kindle read EPUB files?', answer: 'Most Kindle devices cannot read EPUB natively. Amazon\'s latest Send-to-Kindle pipeline accepts EPUB but the automatic conversion is unreliable — formatting often breaks. The recommended approach is to convert EPUB to AZW3 or MOBI yourself before sending to Kindle.' },
  { question: 'Is MOBI better than EPUB for Kindle?', answer: 'No. MOBI is a legacy format with limited styling support. For Kindles from 2016 onward, AZW3 is the better choice because it preserves more layout, fonts, and images. Use MOBI only if your Kindle is too old to support AZW3.' },
  { question: 'Which format is better overall, EPUB or MOBI?', answer: 'EPUB is the better format in almost every way — it is open, widely supported, and preserves rich formatting. MOBI is only useful if you have an older Kindle that cannot read AZW3 or EPUB.' },
  { question: 'Do I need to convert my EPUB if I have a Kobo?', answer: 'No. Kobo e-readers natively support EPUB. Converting would only risk degrading the file. Keep your EPUB and load it directly onto your Kobo.' },
  { question: 'How do I convert EPUB to MOBI for free?', answer: 'Use a free online converter like BookConv at [/convert/epub-to-mobi](/convert/epub-to-mobi). Upload your EPUB, select MOBI, and download the converted file. No install needed.' },
  { question: 'Can I convert MOBI back to EPUB?', answer: 'Yes. If you want to move your MOBI files to a non-Kindle device, use [BookConv\'s MOBI to EPUB converter](/convert/mobi-to-epub). Note that formatting may be simplified since MOBI holds less information than EPUB.' },
]

// E-E-A-T authorship block (2026-09-12 D3 Tier 3 differentiation)
export const authorship = {
  author: 'BookConv Team',
  lastVerified: '2026-09-12',
  credentials: 'Based on Calibre engine maintenance and 10,000+ monthly conversions',
  estimatedConversions: '10,000+ monthly',
}
