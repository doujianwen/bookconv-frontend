export const slug = `common-ebook-format-problems`;
export const title = `10 Common Ebook Format Problems and How to Fix Them`;
export const date = `2026-08-09`;
export const author = "BookConv Team";
export const tags = ["Ebook Formats", "Troubleshooting", "EPUB", "MOBI", "PDF", "Kindle", "BookConv"];

export const content = {
  intro: `Ebook conversions go wrong in predictable ways. Whether a file will not open, a layout collapses, or the output is full of gibberish, the cause is almost always the same handful of issues. This is the field guide to the ten most common ebook format problems and the fix for each — plus how to avoid them in the first place.`,
  sections: [
    {
      heading: `1. EPUB Won't Open on a Kindle`,
      body: `Kindles do not read EPUB. Send an .epub and the device rejects it. **Fix:** convert to AZW3 first with [EPUB to AZW3](/convert/epub-to-azw3), or email it through Send to Kindle so Amazon converts it. If the book will not open on any reader, see [5 reasons your ebook won't open on Kindle](/blog/why-ebook-wont-open-kindle).`
    },
    {
      heading: `2. MOBI Looks Broken After Conversion`,
      body: `MOBI is a legacy format with weak CSS support, so a conversion into MOBI flattens fonts and tables. **Fix:** target AZW3 instead of MOBI for modern Kindles. If your source is already MOBI and you want it portable, [convert MOBI to EPUB](/convert/mobi-to-epub) to restore reflow.`
    },
    {
      heading: `3. PDF Converts but Loses All Formatting`,
      body: `PDF is a fixed-page format; turning it into a reflowable ebook means the converter has to reconstruct the structure. **Fix:** use a formatting-aware path. [Convert PDF to EPUB without losing layout](/guide/pdf-to-epub-keep-formatting) explains the settings; the tool itself is [PDF to EPUB](/convert/pdf-to-epub).`
    },
    {
      heading: `4. Tables and Images Disappear`,
      body: `Some formats (notably MOBI and a bad PDF extraction) drop tables and images. **Fix:** keep the source in EPUB or AZW3, which preserve both, and avoid converting through MOBI. For EPUB output, [EPUB to PDF](/convert/epub-to-pdf) keeps images if the source has them.`
    },
    {
      heading: `5. Chapter Headings Don't Show Up`,
      body: `A missing table of contents usually means the source had no proper heading structure. **Fix:** ensure the source uses real headings (H1/H2), not big bold text. Converters build the TOC from headings, so fixing the source fixes the navigation.`
    },
    {
      heading: `6. Embedded Fonts Get Dropped`,
      body: `MOBI and some PDF paths strip embedded fonts. **Fix:** convert to EPUB or AZW3, which carry embedded fonts. If a specific font matters, keep it in the source and target a format that supports it.`
    },
    {
      heading: `7. The File Is Too Large to Upload`,
      body: `Image-heavy EPUBs or scanned PDFs can exceed upload limits. **Fix:** shrink images first, or split a massive PDF. Most browser converters cap a single file; reducing image resolution usually gets you under the limit without hurting readability.`
    },
    {
      heading: `8. Conversion Fails or Times Out`,
      body: `A failed conversion often means a corrupt source or an unsupported feature. **Fix:** open the file on your computer to confirm it is intact, then retry. For many files at once, use [batch conversion](/guide/batch-converter) instead of one giant upload.`
    },
    {
      heading: `9. The Download Link Expires`,
      body: `Some services expire the download after a few minutes. **Fix:** download as soon as the job finishes. BookConv lets you download directly from the result page; save the file before moving on.`
    },
    {
      heading: `10. Strange Characters or Gibberish in the Output`,
      body: `Gibberish (mojibake) means an encoding mismatch, common with older TXT or non-UTF-8 sources. **Fix:** re-save the source as UTF-8, then convert. For plain text, [TXT to EPUB](/convert/txt-to-epub) builds a clean ebook with a proper TOC.`
    },
    {
      heading: `Build a Clean Source File First`,
      body: `Most of these problems trace back to the source, not the converter. Before converting:

- Use **real headings** so the TOC builds correctly.
- Keep images at a reasonable resolution to stay under upload limits.
- Save text sources as **UTF-8** to avoid gibberish.
- Prefer **EPUB or AZW3** as the target so fonts and tables survive.

Our [pre-conversion checklist](/blog/ebook-conversion-checklist) walks through each step.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Most failures start in the source** — fix headings, encoding, and image size first.
- **Target EPUB or AZW3**, not MOBI, to keep fonts, tables, and TOC.
- **PDF needs a formatting-aware path** to avoid layout loss.
- **Kindle needs AZW3**, never raw EPUB.
- **Prepare the file** with the [pre-conversion checklist](/blog/ebook-conversion-checklist) and most problems never appear.`
    }
  ]
};

export const faqs = [
  {
    question: `Why does my EPUB look wrong after converting to MOBI?`,
    answer: `MOBI is a legacy format with limited CSS support, so it flattens fonts, tables, and complex layouts. Convert to AZW3 instead for modern Kindles, or to EPUB if you want a portable file.`
  },
  {
    question: `How do I stop a PDF conversion from losing formatting?`,
    answer: `Use a formatting-aware conversion path rather than a plain export. The PDF to EPUB keep-formatting guide explains the settings, and the converter preserves images and layout when the source is clean.`
  },
  {
    question: `Why are my chapter headings missing?`,
    answer: `The converter builds the table of contents from real heading styles (H1/H2). If the source used large bold text instead of headings, the TOC will be empty. Fix the source to use proper headings, then reconvert.`
  },
  {
    question: `What causes gibberish characters in the output?`,
    answer: `An encoding mismatch, usually from an older TXT or non-UTF-8 source. Re-save the source as UTF-8 and convert again; for plain text, TXT to EPUB produces a clean, correctly encoded ebook.`
  },
  {
    question: `My file is too large to upload. What do I do?`,
    answer: `Shrink the images or split a very large PDF, then retry. Browser converters cap single-file size, and reducing image resolution usually gets you under the limit without hurting readability.`
  },
  {
    question: `Which format should I convert to so nothing breaks?`,
    answer: `EPUB for anything non-Kindle, AZW3 for modern Kindles. Both preserve embedded fonts, tables, and chapter navigation far better than MOBI or a naive PDF export.`
  }
];
