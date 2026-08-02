import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'mobi-vs-azw3'
export const title = 'MOBI vs AZW3: Which Kindle Format Should You Actually Use?'
export const problem = 'Both are Kindle formats, both end in weird letters — but they are not the same. Here is the real difference, and which one to pick when you convert.'
export const date = '2026-08-02'
export const tags = ['mobi', 'azw3', 'kindle', 'ebook formats', 'format comparison']
export const keyTakeaways = [
  'AZW3 (KF8) is the modern Kindle format; MOBI is the legacy one.',
  'AZW3 supports better CSS, embedded fonts, and layout than MOBI.',
  'Newer Kindles read both; very old models read MOBI only.',
  'When converting from EPUB, prefer AZW3 for quality — see /convert/epub-to-azw3.',
]
export const content = {
  intro: 'You are about to convert an EPUB and the tool offers you MOBI or AZW3. They sound equally obscure, so which do you pick? The short answer: AZW3 almost always. This guide explains why, what each format actually is, and exactly when the older MOBI still earns its place.',
  sections: [
    {
      heading: 'Origins: both come from Mobipocket',
      body: `Both formats trace back to **Mobipocket**, a company Amazon acquired in 2005. The original **MOBI** format was Mobipocket\'s reader format. Amazon later built **AZW3** (also called **KF8**) on top of it, adding a modern layout engine.\n\nSo they are cousins, not rivals from different worlds — but AZW3 is the younger, more capable cousin.`,
    },
    {
      heading: 'What AZW3 adds over MOBI',
      body: `AZW3 brought Kindle Format 8, which supports:\n\n- A much richer **CSS subset**, closer to what EPUB uses.\n- **Embedded fonts**, so your book keeps its intended typography.\n- Better **tables, drop caps, and complex layouts**.\n\nMOBI predates all of that. A book converted to MOBI loses most of those refinements; the same book in AZW3 keeps them.`,
    },
    {
      heading: 'Device support',
      body: `**Modern Kindles** (roughly 2016 onward, including Paperwhite, Oasis, and current basics) read both MOBI and AZW3.\n\n**Very old Kindles** and some early Kindle apps read **MOBI only**. If you are supporting a decade-old device, MOBI is the safe target. For everything else, AZW3 is the better choice.`,
    },
    {
      heading: 'Which to choose when converting',
      body: `Rule of thumb:\n\n- Converting **from EPUB for a current Kindle** → pick **AZW3** for the best layout: [/convert/epub-to-azw3](/convert/epub-to-azw3).\n- Converting for a **legacy device** → pick **MOBI**: [/convert/epub-to-mobi](/convert/epub-to-mobi).\n- Unsure which your device needs → AZW3 first; it is the modern default.\n\nOur deeper comparison lives at [/blog/azw3-vs-mobi](/blog/azw3-vs-mobi).`,
    },
    {
      heading: 'How to convert into each format',
      body: `Both conversions run on the same Calibre engine. BookConv handles either in the browser with no install — choose MOBI or AZW3 as the target. For a desktop workflow with full output-profile control, Calibre\'s **Convert books** dialog lets you pick the exact format and tweak margins, headings, and reading order.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'What is the difference between MOBI and AZW3?', answer: 'AZW3 (KF8) is Amazon\'s modern Kindle format built on top of the older MOBI format. AZW3 supports richer CSS, embedded fonts, and better layouts; MOBI is the legacy format with limited styling.' },
  { question: 'Is AZW3 better than MOBI?', answer: 'For modern Kindles, yes. AZW3 preserves more of your book\'s layout, fonts, and structure. MOBI only wins for very old Kindle devices that cannot read AZW3.' },
  { question: 'Which Kindles support AZW3?', answer: 'Most Kindles from around 2016 onward — including Paperwhite, Oasis, and current basic models — read AZW3. Only the oldest Kindles are limited to MOBI.' },
  { question: 'Should I convert EPUB to MOBI or AZW3?', answer: 'Prefer AZW3 for any current Kindle, because it keeps more of your layout. Choose MOBI only if you are targeting a legacy device that cannot read AZW3.' },
  { question: 'Can I convert MOBI to AZW3?', answer: 'Yes. Since AZW3 is a superset built on the same foundation, a converter like Calibre or BookConv can turn a MOBI into AZW3. The result can only be as rich as the source MOBI, though — it will not regain styling the original MOBI never had.' },
  { question: 'Are MOBI and AZW3 both from Amazon?', answer: 'Both descend from the Mobipocket format Amazon acquired in 2005. AZW3 (KF8) is Amazon\'s later, more capable revision of that format for Kindle devices.' },
]
