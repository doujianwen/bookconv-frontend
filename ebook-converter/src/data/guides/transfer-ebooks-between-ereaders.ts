import { BlogFaq } from '../blog/types'

export const slug = 'transfer-ebooks-between-ereaders'
export const title = 'How to Transfer Ebooks Between Different E-Readers'
export const metaTitle = 'How to Transfer Ebooks Between E-Readers (2026 Guide)'
export const metaDescription = 'Kindle, Kobo, Nook and Apple Books all take different formats. Here is what actually transfers, what must be converted first, and the three routes that work.'
export const problem = 'You bought or converted books for one e-reader and now use another. What actually moves between devices, what must be converted first, and what cannot move at all — answered in one page.'
export const date = '2026-11-17'
export const updatedAt = '2026-11-17'
export const tags = ['ebook transfer', 'kindle', 'kobo', 'ebook conversion', 'how to']
export const keyTakeaways = [
  'Each e-reader is built around its own formats: Kindle wants AZW3, almost everything else wants EPUB. The format table decides the route.',
  'Three routes move a book: re-download from the store, convert the file to the target format, or side-load through USB.',
  'DRM-locked store books cannot be moved between ecosystems — that is store policy and protection, not a conversion problem.',
  'Reading position, highlights, and narration features live in the store cloud, not in the file, and do not follow the book.',
]
export const content = {
  intro: `You can move your own ebook files between e-readers, but not by copying the file blindly: each device reads a different format. In practice there are only three routes — re-download from the store you bought from, convert the file to the format the new device reads, or side-load through a desktop tool. Books locked by a store's DRM cannot be moved at all.`,
  sections: [
    {
      heading: 'Format cheat sheet: what each e-reader reads natively',
      body: `Every transfer problem starts with the same root cause: ecosystems are built around different formats. This table is the whole decision tree — find the row for the device you are moving to, and the rest of this guide tells you how to get your book into that format.

| Device | Reads natively | Needs conversion from |
|---|---|---|
| Kindle (all models) | AZW3, MOBI (older), PDF | EPUB (unless sent through Send to Kindle) |
| Kobo | EPUB, KEPUB, PDF | AZW3, MOBI |
| Nook | EPUB, PDF | AZW3, MOBI |
| Apple Books (iPhone/iPad/Mac) | EPUB, PDF | AZW3, MOBI |
| Android readers (Moon+, Librera) | EPUB, MOBI, PDF, TXT | AZW3 (mostly) |`,
    },
    {
      heading: 'Route 1: Re-download from the store (only if the store allows it)',
      body: `If you bought the book from Kobo, Google Play Books, or an independent store, the new device usually has its own app or website where you can sign in and download again in the right format. This is the only route that keeps the file exactly as published.

Amazon is the exception: Kindle books are tied to Kindle hardware and apps. Amazon does not provide a download that opens on a Kobo or a Nook. Any tool that claims to convert store-bought Kindle books is circumventing DRM, which is a separate legal question from format conversion.`,
    },
    {
      heading: 'Route 2: Convert the file to the target format',
      body: `This is the route that works for DRM-free files: public-domain books from Project Gutenberg, publisher-free downloads, your own exports, and books from stores that sell without DRM.

1. Identify the format you have. The file extension is the fastest signal — .epub, .mobi, .azw3, .pdf, .lit, .fb2, .txt.
2. Identify the format the new device wants. From the table above, most non-Kindle devices want EPUB; Kindle wants AZW3.
3. Convert. [BookConv EPUB to AZW3](/convert/epub-to-azw3) if you are moving to Kindle, [BookConv MOBI to EPUB](/convert/mobi-to-epub) if you are moving away from it.
4. Verify before you delete the original. Open the converted file on the new device first. A conversion can drop images, footnotes, or the table of contents — checking takes a minute, re-downloading a lost book can take much longer.

Two conversions worth knowing about:

- **AZW3 → EPUB** is usually clean for text-heavy novels, but fixed-layout books (comics, cookbooks, textbooks) often lose their layout.
- **EPUB → TXT** is the safest worst case: it always works, and it strips everything except words. [BookConv EPUB to TXT](/convert/epub-to-txt) handles it in the browser. Good for reading in a plain text app, useless for anything with images.`,
    },
    {
      heading: 'Route 3: Side-load through a desktop tool',
      body: `Side-loading means copying the file onto the device through a computer instead of through the store.

- **Kindle:** connect over USB, copy the AZW3 file into the documents folder, eject, and wait for the library to refresh. Kindle ignores raw EPUB files copied this way — they must be converted first.
- **Kobo:** connect over USB, copy the EPUB into the root folder (not a subfolder), eject. Kobo indexes on disconnect; a book that does not appear is usually in a nested folder.
- **Nook and Android readers:** the same pattern — internal storage, then the reader's own library folder.

If you prefer not to use a cable, Send to Kindle accepts EPUB by email and converts it server-side, but the formatting is out of your control. [How to read EPUB on Kindle](/guide/how-to-read-epub-on-kindle) covers that route in detail.`,
    },
    {
      heading: 'What does not transfer, and why',
      body: `- **DRM-locked store books.** Kindle, Kobo and Nook all sell books with device-bound protection. Removing it is a legal question in most jurisdictions, not a technical one, and this guide does not cover it.
- **Reading position and highlights.** These live in the store's cloud, not in the file. Moving the file moves the words only.
- **Audiobook and narration.** Whisper Sync and Kobo's narration are store features attached to the purchase, not properties of the file.
- **Library loans.** OverDrive and Libby loans expire on a date and are tied to the lending account. You can move an active loan to a device that accepts Adobe DRM, but you cannot keep it.`,
    },
    {
      heading: 'Checklist before you migrate',
      body: `1. Confirm the file is DRM-free. If it opens in Calibre without a plugin, it is.
2. Confirm the file is not corrupted — a truncated download is the most common cause of a failed conversion.
3. Convert one book, open it on the new device, then batch the rest.
4. Keep the originals until you have read at least one chapter on the new device.
5. Watch the file size. BookConv's single-file converter accepts files up to 100 MB with no sign-up — large scanned or image-heavy books work there. (Batch mode stays at 4 MB per file.)`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Can I transfer Kindle books to a Kobo?', answer: 'Not the store-bought files. Kindle books are DRM-protected and tied to Amazon\'s ecosystem. DRM-free files you converted yourself move freely.' },
  { question: 'Do I need to convert before copying to a Kindle?', answer: 'Yes, unless you use Send to Kindle. A plain EPUB copied over USB is ignored by the device.' },
  { question: 'Will my highlights and bookmarks come along?', answer: 'No. They are stored by the store, not written into the file.' },
  { question: 'What is the safest format to standardise on?', answer: 'EPUB for everything except Kindle; AZW3 for Kindle. TXT only as a last resort when nothing else opens.' },
]
