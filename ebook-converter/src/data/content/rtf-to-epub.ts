export const slug = 'rtf-to-epub';
export const title = 'Free RTF to EPUB Converter — No Sign-up';
export const level = 'B' as const;
export const wordCount = 2300;

export const content = {
  hero: {
    title: 'RTF to EPUB - Turn Rich Text Documents into Real Ebooks',
    subtitle: 'Free RTF to EPUB converter. No sign-up — turn rich text manuscripts and reports into ebooks for any device.'
  },

  sections: [
    {
      heading: 'What is RTF Format?',
      body: `RTF — Rich Text Format — is Microsoft's 1987 answer to a problem that felt urgent at the time: how do you move a formatted document between programs that do not understand each other's files?

The solution was elegantly boring. RTF stores everything as plain ASCII with control words, so a Mac word processor and a Windows one could both read it without licensing anything. Open an .rtf in Notepad and you will see the actual markup sitting there in the open.

**What RTF handles:**

- Bold, italic, underline, strikethrough
- Font families, sizes, and colours
- Paragraph alignment, indentation, and spacing
- Simple tables and bulleted lists
- Embedded images, stored as hex-encoded blobs

**What it never learned to do:** reflow. RTF assumes a page. It has no idea what a phone screen is, no adjustable typography, no night mode, no navigation. Microsoft froze development in 2008 and stopped publishing the specification entirely.

The format is not dead — it is just finished. It still shows up in legal templates, government forms, older Scrivener exports, and any archive built before DOCX took over.`
    },
    {
      heading: 'What is EPUB Format?',
      body: `EPUB is the open standard for reflowable ebooks, and it solves exactly the thing RTF cannot do.

Instead of a fixed page, EPUB stores XHTML and CSS in a ZIP container and lets the reading device decide how to lay it out. Change the font size and the text simply reshapes around it.

**What that gets you:**

- **Reflowable text** that fits a phone, a tablet, or a 6-inch e-ink screen equally well
- **Reader-controlled typography** — font, size, line height, margins
- **Night mode and sepia themes** that actually work, because the text is not baked into a page image
- **A clickable table of contents** built from your document headings
- **Position sync, bookmarks, and highlights** across devices
- **Full-text search** inside the book

EPUB is supported by Apple Books, Kobo, Nook, Google Play Books, PocketBook, and Kindle through Send to Kindle. It is the closest thing publishing has to a universal format.`
    },
    {
      heading: 'How to Convert RTF to EPUB',
      body: `**1. Upload the RTF.** Drag it in or click to browse. Free accounts cover files up to 10MB, and since RTF stores images inefficiently as hex, that limit matters more here than with most formats — an illustrated RTF can balloon fast.

**2. We parse the structure.** The converter reads RTF control words to identify headings, paragraphs, lists, and tables, extracts embedded images into proper EPUB resources, maps fonts to widely-supported alternatives, and generates a navigation document from the heading hierarchy.

**3. Download and read.** The output is a standards-compliant EPUB 3 file that works in any reader.

Most documents finish in ten to thirty seconds. Long manuscripts with many images take longer while the hex-encoded pictures are decoded and re-compressed. Pro accounts add batch conversion for archives of documents.`
    },
    {
      heading: 'When Do You Need This Conversion?',
      body: `**Rescuing an old archive.** If you have folders of RTF from the 90s or 2000s, converting to EPUB makes them readable on modern devices instead of stuck in whichever word processor still opens them.

**Sharing a manuscript for review.** Beta readers on phones and tablets have a far easier time with an EPUB than with a document that forces them to pinch and scroll horizontally.

**Reading long documents comfortably.** A 200-page RTF report is punishing on a screen. The same content as an EPUB, with adjustable text and a working TOC, is genuinely pleasant.

**Preparing for self-publishing.** Most distribution platforms want EPUB. If your source is RTF, this is the step that gets you there.

**Making documents accessible.** EPUB works properly with screen readers and text-to-speech, and lets low-vision readers scale text without breaking the layout.`
    },
    {
      heading: 'What Carries Over - and What Gets Simplified',
      body: `**Preserved:**

- Paragraph structure, bold, italic, underline
- Headings, which become chapter entries in the navigation
- Bulleted and numbered lists, including nested levels
- Embedded images, unpacked and stored as EPUB resources
- Tables, rebuilt as HTML tables that reflow on narrow screens
- Document title and author, written into EPUB metadata where RTF recorded them

**Simplified:**

- **Exact fonts.** RTF may name a font that does not exist on the reader's device, so we map to a widely-available equivalent. Readers usually override fonts anyway.
- **Page-based layout.** Headers, footers, page numbers, and manual page breaks lose their meaning in a reflowable format — there are no fixed pages left to number.
- **Precise image positioning.** Text-wrapped and absolutely placed images get repositioned into the text flow.
- **Complex multi-column layouts** collapse to a single column.

One thing worth checking before you upload: if your RTF fakes headings by making text big and bold instead of applying a real heading style, the converter has nothing to build a table of contents from. Five minutes fixing styles produces a noticeably better ebook.`
    }
  ],

  faq: [
    { q: 'What exactly is RTF, and is it still supported?', a: 'RTF is a plain-text document format Microsoft created in 1987 for exchanging formatted documents between programs. Development stopped in 2008, but Word, LibreOffice, Pages, and Google Docs all still open it.' },
    { q: 'Will my formatting survive the conversion?', a: 'Basic formatting — bold, italic, underline, headings, lists, tables — comes through intact. Page-specific things like headers, footers, and manual page breaks are dropped, because reflowable ebooks have no fixed pages.' },
    { q: 'Do embedded images make it into the EPUB?', a: 'Yes. Images stored inside the RTF are decoded and repackaged as EPUB resources. They move into the text flow rather than keeping exact page positions.' },
    { q: 'Why is my RTF file so large compared to the finished EPUB?', a: 'RTF stores images as hex-encoded text, which roughly doubles their size. EPUB uses ZIP compression and native image formats, so the ebook is often significantly smaller than the source.' },
    { q: 'Is there a file size limit?', a: 'Free accounts handle files up to 10MB, which is plenty for text-heavy documents. Image-heavy RTFs can exceed that because of the hex encoding — Pro accounts raise the limit and add batch conversion.' }
  ]
};
