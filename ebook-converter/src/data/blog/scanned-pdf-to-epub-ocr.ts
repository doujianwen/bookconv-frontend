export const slug = `scanned-pdf-to-epub-ocr`;
export const title = `How to Convert Scanned PDF to EPUB with OCR`;
export const date = `2026-08-09`;
export const author = "BookConv Team";
export const tags = ["PDF", "EPUB", "OCR", "Scanned PDF", "BookConv"];

export const content = {
  intro: `A scanned PDF is just a pile of page images — there is no real text inside, so it cannot reflow or be searched. To turn it into a proper EPUB, you need OCR (optical character recognition) to read the words out of the images first. Here is how the process works and what to expect.`,
  sections: [
    {
      heading: `Why Scanned PDFs Are Hard`,
      body: `A normal PDF stores text as characters; a scanned PDF stores each page as a photo of the page. Without OCR, a converter sees pictures, not words, so the EPUB you get is just images — no selectable text, no reflow, no working table of contents. OCR is the step that makes the text real.`
    },
    {
      heading: `What OCR Does`,
      body: `OCR scans each page image and guesses the characters, producing a text layer behind the picture (or replacing the picture with text). Once the words exist as text, the converter can build paragraphs, detect headings, and create a navigable EPUB. Accuracy depends on scan quality — crisp, straight scans OCR far better than skewed, low-resolution ones.`
    },
    {
      heading: `Step-by-Step: Scanned PDF to EPUB`,
      body: `1. **Check the source** — if the PDF already has selectable text (try copying a word), skip OCR and convert directly with [PDF to EPUB](/convert/pdf-to-epub).
2. **Run OCR** — use an OCR tool or service to add a text layer to the PDF.
3. **Convert to EPUB** — feed the OCR'd PDF to [PDF to EPUB](/convert/pdf-to-epub); a formatting-aware path keeps images and layout where possible.
4. **Proofread** — scan the output for OCR errors (common with unusual fonts or footnotes) and fix in the source if needed.

The [PDF to EPUB keep-formatting guide](/guide/pdf-to-epub-keep-formatting) explains the settings that preserve layout.`
    },
    {
      heading: `When OCR Isn't Enough`,
      body: `OCR is not magic. Heavily illustrated pages, two-column layouts, and footnotes often come through messy, and the converter cannot always tell where a chapter starts. For a clean result:

- **Pre-process the scan** — deskew and raise the resolution before OCR.
- **Fix headings in the source** so the EPUB TOC builds correctly.
- **Accept some cleanup** — complex books may need a manual pass.

If the conversion still misbehaves, the [common ebook format problems guide](/blog/common-ebook-format-problems) maps each symptom to a fix.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **A scanned PDF is images, not text** — it needs OCR before it becomes a real EPUB.
- **OCR adds a text layer** the converter can turn into paragraphs and a TOC.
- **Scan quality decides accuracy** — crisp, straight, high-res scans OCR best.
- **Use a formatting-aware path** — see [PDF to EPUB keep-formatting](/guide/pdf-to-epub-keep-formatting).
- **Proofread the output** — OCR errs on odd fonts and footnotes.`
    }
  ]
};

export const faqs = [
  {
    question: `Can I convert a scanned PDF to EPUB without OCR?`,
    answer: `You can, but the result is just page images — no selectable text, no reflow, no working table of contents. Run OCR first to recognize the words, then convert, so the EPUB is a real ebook.`
  },
  {
    question: `How do I know if my PDF is scanned?`,
    answer: `Try selecting and copying a word. If nothing highlights or the copied text is garbage, the PDF is image-based (scanned). If you can copy real text, it already has a text layer and you can convert directly.`
  },
  {
    question: `Will OCR make my EPUB perfect?`,
    answer: `OCR is accurate on clean, high-resolution scans but errs on skewed pages, odd fonts, and footnotes. Expect to proofread the output, especially for technical or illustrated books.`
  },
  {
    question: `What settings keep the layout when converting?`,
    answer: `Use a formatting-aware conversion path rather than a plain export. The PDF to EPUB keep-formatting guide explains the options that preserve images and structure after OCR.`
  },
  {
    question: `Why is my scanned PDF conversion losing formatting?`,
    answer: `Because the converter is working from images, not text. OCR must run first; then a formatting-aware path can rebuild paragraphs and keep images. Without OCR, there is no text to format.`
  },
  {
    question: `Can BookConv do the OCR for me?`,
    answer: `BookConv converts PDF to EPUB but relies on the source having a text layer for clean results. For a scanned PDF, run OCR with a dedicated tool first, then convert the OCR'd PDF.`
  }
];
