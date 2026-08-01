export const slug = 'mobi-to-pdf';
export const title = 'MOBI to PDF Converter';
export const level = 'B' as const;
export const wordCount = 2500;

export const content = {
  hero: {
    title: 'MOBI to PDF - Turn Kindle Books into Printable Documents',
    subtitle: 'Convert MOBI ebooks into fixed-layout PDFs for printing, annotating, citing, and sharing with anyone.'
  },

  sections: [
    {
      heading: 'What is MOBI Format?',
      body: `MOBI began as Mobipocket, a French ebook format from the early 2000s. Amazon acquired the company in 2005 and built the entire early Kindle ecosystem on top of it.

Underneath, MOBI is compressed HTML with proprietary extensions. It handles reflowable text well on e-ink, supports basic formatting and simple navigation, and stores metadata like title, author, and publisher. What it never handled well is complex layout — tables are unreliable, and modern CSS is simply not part of the picture.

**Where MOBI files still come from:**

- Kindle purchases downloaded before Amazon shifted to AZW3 and KFX
- Author-direct and self-published distributions
- Public-domain libraries such as Project Gutenberg
- Personal backups made years ago

Amazon stopped accepting MOBI for new Kindle uploads in 2022. Existing files still open, but the format is clearly winding down — and it has one stubborn limitation that no amount of Kindle support fixes: **you cannot reliably print it, and you cannot cite a page number in it.**`
    },
    {
      heading: 'What is PDF Format?',
      body: `PDF is Adobe's fixed-layout document format, released in 1993 and made an open ISO standard in 2008. It is the closest thing the world has to universal paper.

The defining trait is that **a PDF looks the same everywhere.** Same fonts, same margins, same line breaks, same page 47 on your laptop as on your colleague's phone as on the printer. Nothing reflows, nothing shifts.

**What that gives you:**

- **Printing that works.** What you see is exactly what comes out of the printer.
- **Stable page numbers,** which matters enormously for citation and for saying "look at page 112" in a meeting.
- **Annotation support** — highlights, comments, and sticky notes that travel with the file.
- **Digital signatures and form fields**, none of which MOBI has any concept of.
- **Universal openability.** Every OS ships a PDF reader. No app to install, no account to create.

The trade-off is the mirror image of MOBI's: PDF gives up flexibility to gain permanence.`
    },
    {
      heading: 'How to Convert MOBI to PDF',
      body: `**1. Upload your MOBI.** Drag it in or click to browse. Free accounts handle files up to about 50MB — well beyond what a typical MOBI needs, since even a long illustrated title usually sits under 10MB.

**2. We render it to pages.** The converter unpacks the MOBI, rebuilds the HTML content, and lays it out onto real pages with sensible margins and readable type. Navigation points become PDF bookmarks so you can still jump between chapters.

**3. Download and use it.** Print it, mark it up, email it, or drop it into a reference manager.

A 300-page novel typically finishes in thirty seconds to two minutes. Books with lots of illustrations take longer, because every image gets re-rendered at print resolution. Pro accounts add batch conversion and larger uploads for bigger jobs.`
    },
    {
      heading: 'When Do You Need This Conversion?',
      body: `**Printing.** The obvious one. You cannot print a MOBI in any sane way — PDF is the format printers actually understand.

**Academic citation.** Citation styles want page numbers. Reflowable formats do not have them, because the text moves when you change the font size. A PDF pins every sentence to a fixed page.

**Annotating a technical book.** PDF annotation tools are far more capable than what any Kindle app offers, and the notes stay embedded in the file when you send it to someone else.

**Sharing with people who do not use e-readers.** Send a PDF and it opens. Send a MOBI and you are troubleshooting over email for twenty minutes.

**Archiving.** PDF/A exists precisely because institutions needed a format guaranteed to render identically decades from now. MOBI has no equivalent guarantee — it is a proprietary format from a company that already retired it.

**Reading on a large screen.** On a desktop monitor or a big tablet, fixed pages with proper typography often read better than reflowed text stretched across a wide window.`
    },
    {
      heading: 'Reflowable to Fixed: What Actually Changes',
      body: `This conversion crosses a real conceptual boundary, so it is worth knowing what you are trading.

**You gain:**

- Fixed, stable pages with consistent numbering
- Print-ready output at your chosen page size
- Chapter bookmarks carried over from MOBI navigation
- Full-text search, since the PDF keeps real selectable text rather than page images
- Images and cover art rendered at full resolution
- A file anyone can open, on anything

**You give up:**

- **Reader-adjustable text.** Font size is baked in at conversion time. If you pick a size that is too small, your only option on a phone is zooming and panning.
- **Comfortable small-screen reading.** A 6-inch e-ink display and an A4 page are a bad match. If phone reading is the goal, convert to EPUB instead.
- **Reading position sync** across devices, and the reader-app highlights you already made in the Kindle app — those live in Amazon's system, not in the file.
- **Small file size.** PDFs are usually larger than the MOBI they came from. A typical 300-page novel lands somewhere around 3 to 8MB; heavily illustrated books go higher.

**One thing that stops the conversion entirely:** DRM. Books purchased from the Kindle Store are encrypted, and encrypted files cannot be read or converted. DRM-free MOBI files work without any trouble.`
    }
  ],

  faq: [
    { q: 'Will the PDF keep the original formatting?', a: 'Yes. Paragraph styling, headings, images, and cover art are all rendered into the PDF. It will not look pixel-identical to your Kindle, though, because your Kindle applies its own font and margin settings on top of the book.' },
    { q: 'Can I edit the PDF afterwards?', a: 'Not easily — PDF is an output format, not an editing format. If you need editable text, convert MOBI to DOCX instead. Editing a PDF properly requires software like Adobe Acrobat.' },
    { q: 'How big will the PDF be?', a: 'A typical 300-page novel produces roughly 3 to 8MB. Books with many illustrations or photographs can be considerably larger, since images are rendered at print resolution rather than screen resolution.' },
    { q: 'Is the text searchable in the finished PDF?', a: 'Yes. MOBI contains real text, so the PDF gets real selectable text too. Ctrl+F works normally, and you can copy passages out. There is no OCR involved and no quality loss in the text layer.' },
    { q: 'My Kindle Store book will not convert. Why?', a: 'Store purchases carry DRM, which encrypts the content and blocks conversion entirely. Gutenberg downloads, author-direct copies, and your own files convert without any issue.' }
  ]
};
