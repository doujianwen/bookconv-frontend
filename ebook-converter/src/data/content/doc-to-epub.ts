export const slug = 'doc-to-epub';
export const title = 'DOC to EPUB Converter';
export const level = 'B' as const;
export const wordCount = 2400;

export const content = {
  hero: {
    title: 'DOC to EPUB - Bring Old Word Files Back to Life',
    subtitle: 'Convert legacy .doc documents into modern EPUB ebooks you can read on any phone, tablet, or e-reader.'
  },

  sections: [
    {
      heading: 'What is DOC Format?',
      body: `DOC is the original Microsoft Word format — the one that ruled from Word 97 all the way to Word 2003, before DOCX replaced it in 2007.

Technically it is a binary compound file: a small filesystem-inside-a-file holding text, formatting tables, embedded objects, and revision history all tangled together. That design is why DOC files are so fragile. One corrupted byte in the wrong place and the whole document can refuse to open.

**Why DOC files are a problem today:**

- **They corrupt easily.** Twenty-year-old files copied across half a dozen drives often arrive damaged.
- **Modern Word treats them as second-class.** Compatibility Mode disables features and sometimes reflows the layout.
- **They are fixed to a page.** A .doc assumes 8.5 by 11 inches. On a phone, that means pinching and horizontal scrolling.
- **The format is undocumented in practice.** The binary spec was reverse-engineered for years, which is why non-Microsoft software renders DOC inconsistently.

If you have theses, manuscripts, reports, or family history documents sitting in .doc, converting them is less about convenience and more about not losing them.`
    },
    {
      heading: 'What is EPUB Format?',
      body: `EPUB is the open ebook standard — XHTML and CSS in a ZIP container, with a manifest defining reading order.

The critical difference from DOC is **reflow**. There is no fixed page. The reading device lays out the text to fit whatever screen it has, at whatever font size you prefer.

**What that means in practice:**

- **Reads well everywhere** — phone, tablet, 6-inch e-ink, desktop
- **Adjustable typography** — change font, size, line spacing, and margins without breaking anything
- **Night mode and sepia** that work properly
- **Automatic navigation** built from your document headings
- **Smaller files.** ZIP compression plus optimized images usually shrinks a document substantially
- **An open, documented standard** maintained by the W3C, so it will still be readable decades from now

DOC was designed for printing. EPUB is designed for reading on screens. If nobody is going to print your document, EPUB is simply the better container.`
    },
    {
      heading: 'How to Convert DOC to EPUB',
      body: `We run a two-stage pipeline rather than a direct conversion, because it produces far better results with old files.

**DOC to DOCX (LibreOffice), then DOCX to EPUB (Calibre).**

The reason is practical: LibreOffice has the most forgiving DOC parser available. It recovers documents that Word itself gives up on. Once the content is safely in DOCX, Calibre handles the ebook structuring properly.

**Your steps are simpler than that sounds:**

1. Upload your .doc file — free accounts handle up to about 50MB, which is far more than any text document needs
2. Wait while the pipeline runs
3. Download the EPUB

Most documents under 100 pages finish in ten to thirty seconds. Files with a lot of embedded images can take a minute or two. Pro accounts add batch conversion, which is the sensible route if you are digitizing an entire archive folder.`
    },
    {
      heading: 'When Do You Need This Conversion?',
      body: `**Digitizing an old archive.** Theses, dissertations, company reports, newsletters, family histories — anything written between 1997 and 2007 is probably sitting in .doc right now.

**Reading long documents on a tablet.** A 300-page report in DOC is genuinely unpleasant on anything smaller than a laptop. As an EPUB it is just a book.

**Self-publishing from a Word draft.** Retail platforms want EPUB. If your manuscript never made the jump to DOCX, this gets you there in one step.

**Distributing manuals and handbooks.** Employees and clients can read an EPUB on their phones without needing Word installed.

**Rescuing a file Word refuses to open.** This is the underrated one. LibreOffice frequently recovers damaged DOC files that Word rejects outright, so conversion doubles as a repair attempt.

**Accessibility.** EPUB works properly with screen readers and lets low-vision readers scale text without wrecking the layout.`
    },
    {
      heading: 'Getting the Best Result',
      body: `A few minutes of prep makes an enormous difference to the finished ebook.

**Use real heading styles.** This is the big one. If your chapter titles are just text set to 18pt bold, the converter has nothing to build a table of contents from and you will end up with one giant undifferentiated chapter. Apply proper Heading 1 and Heading 2 styles and you get clean navigation for free.

**Remove page-specific furniture.** Headers, footers, page numbers, and manual page breaks have no meaning in a reflowable format. They either vanish or turn into stray text mid-chapter.

**Simplify multi-column layouts.** Newsletter-style columns collapse into a single column. Better to flatten them deliberately than be surprised by the result.

**Strip the password if there is one.** Encrypted DOC files cannot be read by the converter. Remove protection in Word or LibreOffice first.

**What comes through reliably:** paragraph structure, bold and italic, headings, lists, tables, embedded images, footnotes, and document metadata like title and author.

**What gets simplified:** exotic fonts (mapped to available equivalents), text boxes and floating shapes (moved into the flow), precise image positioning, and anything that depended on a fixed page size.`
    }
  ],

  faq: [
    { q: 'Can corrupted DOC files be recovered?', a: 'Often, yes. LibreOffice handles damaged DOC files considerably better than Word does, and severely corrupted documents frequently still yield readable content. It is not guaranteed, but it is worth trying before you give up on a file.' },
    { q: 'Will my formatting be preserved?', a: 'Headings, bold, italic, lists, tables, footnotes, and images all come through. Page-bound elements like headers, footers, and manual page breaks are dropped, because a reflowable ebook has no fixed pages to attach them to.' },
    { q: 'Does it work with password-protected documents?', a: 'No. You need to remove the password in Word or LibreOffice first — the converter cannot read encrypted content.' },
    { q: 'How does the table of contents get built?', a: 'From your Word heading styles. Documents that use real Heading 1 and Heading 2 styles produce clean chapter navigation; documents that fake headings with big bold text produce a flat TOC with a single entry.' },
    { q: 'Should I convert DOC or DOCX?', a: 'Either works, and both use the same pipeline. If you already have a DOCX version, use it — one fewer conversion step means fewer chances for formatting to drift.' }
  ]
};
