export const slug = `epub-to-word`;
export const title = `How to Convert EPUB to an Editable Word Document (DOCX)`;
export const date = `2026-08-02`;
export const author = "BookConv Team";
export const tags = ["EPUB", "Word", "DOCX", "editing", "BookConv", "conversion", "guide"];

export const content = {
  intro: `Need to actually edit an EPUB instead of just reading it? EPUB files are zipped HTML — great for e-readers, awkward for word processors. Converting EPUB to DOCX gives you a real .docx you can open in Microsoft Word, Google Docs, or LibreOffice, re-style, cite, or send to a printer. This guide walks through the shortest path and what to expect afterward. If you only need the raw container without conversion, [EPUB to ZIP](/convert/epub-to-zip) unpacks it directly.`,
  sections: [
    {
      heading: `Why Convert EPUB to Word?`,
      body: `Most EPUB-to-Word requests boil down to one of four jobs:

- **Editing** — fix a typo, rewrite a passage, or localize the text before re-publishing.
- **Citing or annotating** — pull quotes into a paper with proper formatting and track changes.
- **Re-flowing for print** — a reflowable EPUB has no fixed pages; a DOCX lets you set real margins, page size, and headers.
- **Handing off to a publisher or printer** — many submission portals want .docx, not .epub.

If all you need is the raw text, the lighter [EPUB to TXT](/convert/epub-to-txt) path is enough. If you need a print-ready fixed layout, [EPUB to PDF](/convert/epub-to-pdf) is the closer fit. This guide is for when you need a live, editable document.`
    },
    {
      heading: `Convert EPUB to Word on BookConv in Three Steps`,
      body: `1. Open the [EPUB to Word converter](/convert/epub-to-docx) and drop your .epub onto the upload area.
2. BookConv unzips the EPUB, extracts the XHTML chapters, and maps them into a WordprocessingML document — no Calibre install, no account.
3. Download the .docx. It opens in Word, Google Docs, or LibreOffice with the text, paragraphs, headings, and embedded images intact.

The free tier handles files up to 10 MB, which covers the vast majority of text-driven novels and reports. Image-heavy art books may need a larger limit.

### Two things to know before you upload

- **Download links are temporary.** Converted files are deleted after a period, so save the .docx to your device right after the progress bar finishes rather than bookmarking the link.
- **DRM-protected EPUBs are rejected at upload.** DRM encrypts the content and no converter can read it. Retail purchases and library loans fall into this bucket; books you own DRM-free convert fine.`
    },
    {
      heading: `What Transfers — and What Doesn't`,
      body: `A DOCX is a different animal from a reflowable EPUB, so expect a clean but simplified result:

**What carries over well**
- Body text, paragraphs, and line breaks
- Heading levels (h1/h2/h3) mapped to Word heading styles
- Embedded images, placed near their original position
- Basic character styles like bold and italic

**What needs a touch-up**
- Complex CSS layouts — multi-column or absolutely positioned blocks collapse into normal flow
- Tables usually survive but may lose fine styling
- Live pagination doesn't exist; Word paginates on open based on your page settings
- Footnotes and endnotes may flatten into body text depending on the source markup

The structure comes from the source file. A clean, well-structured EPUB produces a clean DOCX; a messy one needs cleanup on the Word side.`
    },
    {
      heading: `Cleaning Up the DOCX After Conversion`,
      body: `Five minutes in Word turns a raw conversion into something submission-ready:

1. **Apply a template.** Select everything, then apply your house Heading 1 / Heading 2 styles so the outline and navigation pane populate.
2. **Check the images.** Right-click each picture and use Wrap Text to position it; e-reader exports often leave images inline.
3. **Rebuild the table of contents.** With heading styles applied, insert a Word automatic TOC field instead of the static one from the EPUB.
4. **Fix tables.** Switch to Borders > Grid where lines disappeared.
5. **Run the accessibility checker.** Word flags missing alt text on images — handy if the document goes public.

Need the text without any formatting at all? The [EPUB to TXT](/convert/epub-to-txt) converter strips everything down to plain characters.`
    },
    {
      heading: `EPUB to Word vs PDF vs TXT`,
      body: `Pick the target by what you'll do next:

- **EPUB to Word (DOCX)** — you need to edit, re-style, or submit to a system that wants .docx.
- **EPUB to PDF** — you need a fixed, print-ready file nobody will edit.
- **EPUB to TXT** — you only need the words, with zero layout.

For the broader format picture — when EPUB is the right source and when it isn't — see [Ebook formats explained](/blog/ebook-formats-explained).`
    },
    {
      heading: `Key Takeaways`,
      body: `- **DOCX is the editable target.** Convert EPUB to Word when you need to change the text, not just read it.
- **Three steps on BookConv.** Upload, convert, download — no install, no account, 10 MB free tier.
- **Structure survives; fancy layout simplifies.** Text, headings, and images come through; complex CSS needs a Word touch-up.
- **Save immediately.** Download links are temporary and files are deleted after a period.
- **DRM is rejected.** Owned, DRM-free EPUBs convert; locked retail or library files don't.`
    }
  ]
};

export const faqs = [
  {
    question: `Do I need Microsoft Word installed to convert EPUB to DOCX?`,
    answer: `No. BookConv does the conversion on its servers. You only need Word, Google Docs, or LibreOffice to open the resulting .docx afterward.`,
  },
  {
    question: `Will images from the EPUB be preserved in the Word file?`,
    answer: `Yes. Embedded images are carried into the DOCX and placed near their original position. You may want to adjust text wrapping in Word, since e-reader exports often leave pictures inline.`,
  },
  {
    question: `Will the formatting be exactly the same as the EPUB?`,
    answer: `Mostly. Text, paragraphs, headings, and bold/italic survive. Complex CSS layouts, multi-column sections, and some table styling simplify into normal Word flow and need light cleanup.`,
  },
  {
    question: `Why was my EPUB rejected on upload?`,
    answer: `Two usual causes: it's DRM-protected (encrypted content no converter can read), or it exceeds your tier's size limit — 10 MB on the free tier.`,
  },
  {
    question: `Is there a file size limit?`,
    answer: `The free tier accepts files up to 10 MB, which covers most text-heavy books. Larger illustrated or art titles may need a higher tier.`,
  }
];
