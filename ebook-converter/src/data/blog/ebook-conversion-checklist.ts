export const slug = `ebook-conversion-checklist`;
export const title = `Checklist: Preparing Your Ebook File Before Converting`;
export const date = `2026-08-09`;
export const author = "BookConv Team";
export const tags = ["Ebook Conversion", "Workflow", "EPUB", "PDF", "Kindle", "BookConv"];

export const content = {
  intro: `Most conversion problems are decided before you click convert. A few minutes of preparation — fixing the source file, picking the right target, and avoiding common mistakes — saves a failed job and a broken output. Use this checklist every time you convert an ebook.`,
  sections: [
    {
      heading: `Why Preparation Matters`,
      body: `A converter can only work with what the source gives it. If the source has no heading structure, the output has no table of contents. If the source is a 200 MB scanned PDF, the upload may fail. Preparing the file is what turns "it kind of worked" into "it worked."`
    },
    {
      heading: `The Pre-Conversion Checklist`,
      body: `Run through this before any conversion:

1. **Confirm the format** — know what you have (.epub, .pdf, .mobi, .fb2, .lit) and what the reader needs.
2. **Fix the headings** — use real H1/H2 styles so the TOC builds.
3. **Save text as UTF-8** — prevents gibberish in the output.
4. **Right-size images** — keep them under the upload limit without hurting readability.
5. **Pick the target by device** — EPUB for most readers, AZW3 for modern Kindles, PDF only when layout must stay fixed.
6. **Remove DRM you do not own** — converters only handle DRM-free files.
7. **Back up the original** — keep the source before overwriting anything.

If something still goes wrong, our [common ebook format problems](/blog/common-ebook-format-problems) guide maps each symptom to a fix.`
    },
    {
      heading: `Format-Specific Notes`,
      body: `- **EPUB** — usually clean; just confirm headings and embedded fonts.
- **PDF** — scanned PDFs need OCR-style handling and a formatting-aware path; see [PDF to EPUB keep-formatting](/guide/pdf-to-epub-keep-formatting).
- **MOBI** — legacy; convert to EPUB or AZW3 rather than keeping it.
- **FB2 / LIT** — convert to EPUB for universal reading; route to AZW3 for Kindle.`
    },
    {
      heading: `Common Mistakes to Avoid`,
      body: `- **Sending EPUB straight to a Kindle** — Kindles do not read EPUB; convert to AZW3 first (see [5 reasons your ebook won't open on Kindle](/blog/why-ebook-wont-open-kindle)).
- **Targeting MOBI for a new Kindle** — use AZW3.
- **One giant upload** — split large batches with [batch conversion](/guide/batch-converter).
- **Ignoring the encoding** — always UTF-8 for text sources.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Prepare the source** — headings, UTF-8, right-sized images.
- **Match the target to the device** — EPUB off-Kindle, AZW3 on-Kindle.
- **Keep the original** as a backup before converting.
- **Use batch mode** for many files instead of one oversized upload.
- **When in doubt**, the [common problems guide](/blog/common-ebook-format-problems) has the fix.`
    }
  ]
};

export const faqs = [
  {
    question: `What should I check before converting an ebook?`,
    answer: `Confirm the source format and the reader's required format, fix heading styles so the TOC builds, save text as UTF-8, right-size images to clear the upload limit, and back up the original. Then pick the target by device.`
  },
  {
    question: `Do I need to prepare a PDF before converting?`,
    answer: `Often yes. Scanned PDFs need a formatting-aware conversion path to keep images and layout, and very large PDFs may exceed upload limits until you shrink the images. The PDF to EPUB keep-formatting guide covers the settings.`
  },
  {
    question: `Why convert to AZW3 and not MOBI for a Kindle?`,
    answer: `Modern Kindles read AZW3 natively and Amazon removed MOBI from Send to Kindle in 2022. AZW3 keeps CSS and embedded fonts; MOBI flattens them. Use AZW3 for any Kindle from 2015 onward.`
  },
  {
    question: `Can I convert many files at once?`,
    answer: `Yes. For a library or a folder of books, use batch conversion instead of one oversized upload. It handles many files and returns them together, which is more reliable than a single huge job.`
  },
  {
    question: `Why does my text come out as gibberish?`,
    answer: `An encoding mismatch, usually from a non-UTF-8 source. Re-save the text as UTF-8 before converting. This single step prevents most mojibake in the output.`
  },
  {
    question: `Should I keep the original file?`,
    answer: `Always. Back up the source before converting so you can retry with different settings or a different target format. A converter transforms a copy; your original should stay untouched.`
  }
];
