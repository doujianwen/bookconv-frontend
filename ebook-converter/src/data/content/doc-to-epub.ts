export const slug = 'doc-to-epub';
export const title = 'Free DOC to EPUB Converter — No Sign-up';
export const metaDescription = 'Bring legacy Word .doc files back to life — free DOC to EPUB converter, no sign-up. Turn old manuscripts into reflowable ebooks for any modern reader.';
export const level = 'B' as const;
export const wordCount = 750;

export const content = {
  hero: {
    title: 'DOC to EPUB - Bring Old Word Files Back to Life',
    subtitle: 'Free DOC to EPUB converter. No sign-up — bring legacy Word .doc files back to life as ebooks for any reader.'
  },
  keyFacts: [
    { label: 'Full name', value: 'Microsoft Word Document' },
    { label: 'Extension', value: '.doc' },
    { label: 'MIME type', value: 'application/msword' },
    { label: 'Developer', value: 'Microsoft Corporation' },
    { label: 'Initial release', value: '1983' },
  ],
  keyTakeaways: [
    'Legacy .doc files from old Word versions can become EPUBs for modern e-readers — via one quick "save as .docx" step, since no conversion engine reads the 1997 binary .doc format directly.',
    'Calibre (the engine behind most ebook conversion) accepts DOCX only — Word 2007 and newer. Open the .doc in Word or LibreOffice and save it as .docx first.',
    'Converting DOCX to EPUB gives you chapter navigation, semantic markup, and compatibility with all major e-readers.',
    'For batch processing a folder of .doc files, first batch-convert them to .docx with LibreOffice (soffice --headless --convert-to docx *.doc), then run Calibre on the .docx files.',
    'Scanned or image-based DOC files need OCR in a separate tool before conversion; plain-text documents convert cleanly once saved as .docx.',
  ],

  sections: [
    {
      heading: 'Convert DOC to EPUB from the Command Line (Calibre)',
      body: `If you are converting many Word documents at once or prefer terminal workflows, the command line is the right tool — with one honest caveat: **Calibre reads .docx, not .doc**. Its official input-format list covers DOCX (Word 2007 and newer) and has never included the legacy binary format.

So the working recipe is two commands:

# 1) DOC -> DOCX (LibreOffice, free, cross-platform)
soffice --headless --convert-to docx input.doc

# 2) DOCX -> EPUB (Calibre)
ebook-convert input.docx output.epub

Calibre parses the DOCX structure — headings, paragraphs, images, tables — and rebuilds them as EPUB with proper navigation, semantic markup, and reflowable text. For a whole archive of .doc files:

for f in *.doc; do soffice --headless --convert-to docx "$f"; done
for f in *.docx; do ebook-convert "$f" "\${f%.docx}.epub"; done

Useful Calibre flags: --chapter detects chapter boundaries from heading styles, --toc-filter limits the table of contents to top-level headings, and --extra-css lets you inject custom styling for headings and lists. If your document contains scanned images with no text layer, run OCR in a separate tool before converting, since Calibre does not perform OCR.

For single files without installing anything, the web tool above does the second step for you — save the file as .docx, then upload it.`
    },
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
      heading: 'What EPUB Is and Why Archives Need Digitizing',
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
      heading: 'Rebuilding a DOC File as an EPUB',
      body: `Here is the honest engineering answer: **no converter reads .doc directly**. The 1997 binary format is undocumented in practice, and every mainstream conversion engine — including Calibre — accepts DOCX only. That is why every DOC-to-EPUB pipeline in existence is really a two-stage pipeline:

**DOC to DOCX (Word or LibreOffice, on your machine), then DOCX to EPUB (here).**

The reason is practical: opening the file in Word or LibreOffice is also the best repair step — LibreOffice in particular recovers damaged documents that Word itself gives up on. Once the content is safely in DOCX, the ebook structuring happens properly.

**Your steps:**

1. Open the .doc in Word or LibreOffice and use File → Save As → .docx (takes seconds)
2. Upload the .docx to the free [DOCX to EPUB converter](/convert/docx-to-epub) — no sign-up, files up to 100 MB
3. Download the EPUB

Most documents under 100 pages finish in ten to thirty seconds. Files with a lot of embedded images can take a minute or two. Batch conversion is free during public beta.`
    },
    {
      heading: 'When Digitizing a Word Archive',
      body: `**Digitizing an old archive.** Theses, dissertations, company reports, newsletters, family histories — anything written between 1997 and 2007 is probably sitting in .doc right now.

**Reading long documents on a tablet.** A 300-page report in DOC is genuinely unpleasant on anything smaller than a laptop. As an EPUB it is just a book.

**Self-publishing from a Word draft.** Retail platforms want EPUB. If your manuscript never made the jump to DOCX, a quick save-as-.docx followed by the converter gets you there.

**Distributing manuals and handbooks.** Employees and clients can read an EPUB on their phones without needing Word installed.

**Rescuing a file Word refuses to open.** This is the underrated one. LibreOffice frequently recovers damaged DOC files that Word rejects outright — if Word will not open your .doc, try LibreOffice, then save it as .docx and convert that.

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
    },
    {
      heading: 'DOC vs EPUB: Format Comparison',
      body: `Use this table to decide which format fits the job:

| Feature | DOC | EPUB |
|---------|-----|------|
| Type | Binary document | Open ebook (ZIP + HTML) |
| Reflow | No (fixed page) | Yes |
| Device support | Word only | All readers |
| File size | Larger | Smaller (compressed) |
| Future-proof | Proprietary | W3C open standard |
| Best for | Printing | Reading on screens |

Keep DOC if you must keep editing in Word and printing. Convert to EPUB when the goal is reading or wide distribution.`
    },
    {
      heading: 'Quality Checklist for EPUB Exported from DOC',
      body: `After download, confirm these on the EPUB:

- **Table of contents works** — tapping a chapter title navigates correctly
- **Headings styled** — your Word Heading 1 and Heading 2 styles became real chapters
- **Images present** — embedded pictures survived the conversion
- **Footnotes intact** — notes are linked and tappable
- **Metadata correct** — title and author show in your library

If the TOC is flat or missing, apply proper heading styles in Word and reconvert.`
    },
    {
      heading: 'Getting Your DOC Ready for a Clean EPUB',
      body: `A few minutes of prep sharply improves the result:

- **Apply real heading styles** rather than big bold text, so the converter can build a table of contents
- **Remove headers, footers, and manual page breaks** — they have no meaning in a reflowable ebook
- **Flatten multi-column layouts** into one column on purpose
- **Strip any password** — encrypted DOC files cannot be read
- **Save a backup** of the original before converting

The converter handles the rest once the file is in .docx form. BookConv is free, requires no sign-up, adds no watermark, handles files up to 100 MB, and processes files on servers; see the privacy policy for retention details.`
    }
  ],

  faq: [
    { q: 'Can I convert DOC to EPUB using Calibre command line?', a: 'Not in one step — Calibre reads .docx only, never the legacy .doc binary format. Save the file as .docx first, then run: ebook-convert input.docx output.epub. Use --chapter and --toc-filter to control table of contents depth.' },
    { q: 'Can corrupted DOC files be recovered?', a: 'Often, yes — but the rescue happens before conversion. LibreOffice opens damaged DOC files that Word rejects; if it opens, save it as .docx and convert that. It is not guaranteed, but it is worth trying before you give up on a file.' },
    { q: 'Will my formatting be preserved?', a: 'Headings, bold, italic, lists, tables, footnotes, and images all come through. Page-bound elements like headers, footers, and manual page breaks are dropped, because a reflowable ebook has no fixed pages to attach them to.' },
    { q: 'Does it work with password-protected documents?', a: 'No. You need to remove the password in Word or LibreOffice first — the converter cannot read encrypted content.' },
    { q: 'How does the table of contents get built?', a: 'From your Word heading styles. Documents that use real Heading 1 and Heading 2 styles produce clean chapter navigation; documents that fake headings with big bold text produce a flat TOC with a single entry.' },
    { q: 'Should I convert DOC or DOCX?', a: 'DOCX — no conversion engine reads legacy .doc directly. If you already have a DOCX version, use it; if you only have the .doc, save it as .docx first (File → Save As in Word or LibreOffice). One fewer conversion step also means fewer chances for formatting to drift.' },
    { q: 'Can I convert a password-protected DOC file?', a: 'No. Encrypted DOC files cannot be read by the converter. Remove the password in Word or LibreOffice before uploading. Once unprotected, the file converts like any other.' }
  ]
,

  authorship: {
    author: 'BookConv Team',
    lastVerified: '2026-09-05',
    credentials: 'Based on Calibre engine maintenance and 10,000+ monthly conversions',
    estimatedConversions: '10,000+ monthly'
  }
};
