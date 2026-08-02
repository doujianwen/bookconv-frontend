import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'azw3-to-epub-keep-formatting'
export const title = 'AZW3 to EPUB: Remove Kindle Lock-in and Read Anywhere'
export const problem = 'Bought a book on Kindle and want it on your phone, Kobo, or computer? AZW3 is Amazon\'s cage. Converting to EPUB frees it — here is how to keep the layout intact.'
export const date = '2026-08-02'
export const tags = ['azw3', 'epub', 'kindle', 'formatting', 'ebook conversion']
export const formats = { source: 'azw3', target: 'epub' }
export const keyTakeaways = [
  'AZW3 is Amazon\'s proprietary variant of MOBI; only Kindle apps read it well.',
  'EPUB is the open standard every non-Kindle reader uses, so AZW3 to EPUB means true portability.',
  'DRM-protected AZW3 cannot be converted — you need the DRM-free file you actually own.',
  'BookConv converts DRM-free AZW3 to EPUB in the browser with images and structure intact.',
]
export const content = {
  intro: 'You paid for a book, it sits in your Kindle library, and you cannot open it on the Kobo you got for your birthday or the phone in your pocket. That friction is by design. AZW3 is Amazon\'s format; EPUB is everyone else\'s. This guide explains what AZW3 is, when you can legitimately convert it, and how to do it without mangling your book.',
  sections: [
    {
      heading: 'What AZW3 actually is',
      body: `AZW3 (also called **KF8**) is Amazon\'s update to the old Mobipocket MOBI format. It adds better CSS support and embedded fonts, which is why modern Kindle books look sharper than their MOBI predecessors.\n\nThe catch: AZW3 is tied to Amazon\'s ecosystem. Non-Kindle readers — Kobo, Apple Books, most phone apps, and your computer — do not read it natively. To use the book anywhere else, you convert it to EPUB.`,
    },
    {
      heading: 'Why convert AZW3 to EPUB',
      body: `EPUB is the open, reflowable standard supported by virtually every reading app outside Amazon. Converting AZW3 to EPUB lets you:\n\n- Read the book on a **Kobo, phone, tablet, or computer** without a Kindle app.\n- **Edit or archive** your own books in a portable format.\n- **Share a single copy** across all your non-Amazon devices.\n\nIt is the difference between a book locked to one store and a book you actually own across your library.`,
    },
    {
      heading: 'The DRM catch (read this first)',
      body: `If the AZW3 file is **DRM-protected** — most books bought from the Kindle store are — no converter can touch it. DRM is literal encryption, and removing it is both a technical and a legal wall in most regions.\n\nYou can only convert **DRM-free** AZW3 files: books you downloaded without protection, public-domain titles, or files you explicitly exported from your own content. If your goal is a store-bought novel, the legitimate path is to download it in EPUB from a retailer that sells it that way, or read it in the Kindle app.`,
    },
    {
      heading: 'Convert with BookConv (fastest)',
      body: `For a DRM-free AZW3, BookConv converts to EPUB in the browser with no install. Upload the file, choose **EPUB**, and it preserves images and chapter structure. Start here: [/convert/azw3-to-epub](/convert/azw3-to-epub).`,
    },
    {
      heading: 'Convert with Calibre',
      body: `Calibre handles AZW3 to EPUB on your desktop and keeps everything local. Add the book, pick **Convert books → EPUB**, and review the **Structure detection** settings so chapter breaks map correctly. For help choosing formats and understanding the landscape, see [/blog/ebook-formats-explained](/blog/ebook-formats-explained).`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Can I convert AZW3 to EPUB?', answer: 'Yes, but only for DRM-free AZW3 files. If the file is DRM-protected (most Kindle store purchases), it cannot be converted. For DRM-free files, an online converter like BookConv or the Calibre desktop app both handle AZW3 to EPUB.' },
  { question: 'Why can I not convert a Kindle book I bought?', answer: 'Most Kindle store books are encrypted with DRM, which no converter can remove. You legally own the right to read them in Amazon apps, but the file itself is locked. To read elsewhere, buy the EPUB version from a retailer that sells it, or use the Kindle app.' },
  { question: 'Does AZW3 to EPUB keep images and formatting?', answer: 'For DRM-free files, yes. BookConv and Calibre both embed images and map your chapter headings to EPUB structure, so covers, illustrations, and chapter breaks carry over.' },
  { question: 'AZW3 vs EPUB — which is better?', answer: 'It depends on the device. AZW3 is best inside the Kindle ecosystem. EPUB is the open standard everywhere else, so for portability EPUB wins. See our comparison at [/blog/azw3-vs-mobi](/blog/azw3-vs-mobi) for the broader picture.' },
  { question: 'Is converting AZW3 to EPUB legal?', answer: 'Converting a DRM-free file you own is generally fine. Removing DRM from a protected store purchase is restricted under copyright law in many regions. This guide only covers DRM-free files you legitimately own.' },
  { question: 'Can BookConv convert AZW3 to EPUB for free?', answer: 'Yes. BookConv converts DRM-free AZW3 to EPUB in the browser at no cost for standard files, with no software to install.' },
]
