export const slug = `pdf-to-epub-guide`;
export const title = `How to Convert PDF to EPUB Online (and When You Shouldn't)`;
export const date = `2026-07-30`;
export const author = "BookConv Team";
export const tags = ["PDF", "EPUB", "OCR", "BookConv", "conversion", "guide"];

export const content = {
  intro: `Upload your PDF and convert it to EPUB on BookConv in seconds — no software to install, no account needed. This guide shows you how to run it, how to tell in ten seconds whether your PDF will convert well or turn into a mess, and when you're better off keeping the PDF exactly as it is.`,
  sections: [
    {
      heading: `Convert PDF to EPUB on BookConv in Three Steps`,
      body: `The fast path first.

1. Open the [PDF to EPUB converter](/convert/pdf-to-epub) and drop your file onto the upload area.
2. Look at the metadata preview. It shows what BookConv could read out of the file, which is your first hint about whether the PDF has a real text layer or not.
3. Convert, watch the progress bar, and download the EPUB.

It runs on a server-side Calibre engine, so you get the same conversion logic desktop users get without installing or configuring anything. Free tier is 10 MB per file and 5 conversions per hour with no account. Pro takes files up to 50 MB, and the API up to 100 MB.

### A few practical notes

PDFs run larger than most ebook formats — a scanned 300-page book can easily clear 100 MB while a plain text-layer PDF of the same book might be 2 MB. If you hit the size limit, that size difference is usually telling you something about what's inside the file.

Big or slow conversions get handed to a background worker queue instead of tying up your browser, and the progress bar keeps ticking so you can see it's still working. Download links are **temporary** and converted files are deleted after a period, so grab the EPUB when it's ready rather than saving the link.

**DRM-protected files are rejected on upload.** Password-protected PDFs are the same story — remove the password yourself first if it's your file and you know it, then upload.

One honest caveat that shapes everything below: BookConv works best on text-based PDFs. Scanned PDFs need OCR first, and that's a separate step BookConv doesn't do.`
    },
    {
      heading: `Check Your PDF First: Real Text or Scanned Images?`,
      body: `Do this before you upload anything. It takes ten seconds and it decides your whole workflow.

Open the PDF in any reader and try to select a sentence with your cursor. If the text highlights and you can copy it, you've got a text-layer PDF and BookConv will handle it. If your cursor just draws a rectangle over an image, it's a scan — a photograph of a page — and there are no words in the file to extract.

Zooming in is the second tell. Real text stays sharp at 400 percent. Scanned text goes soft and pixelated.

### Scanned PDFs need OCR before conversion

Optical character recognition reads the image and produces actual text. It happens *before* conversion, and BookConv doesn't do it — upload a scan and you'll get an EPUB full of full-page images that can't be resized, searched, selected, or read aloud. Technically a valid EPUB. Practically useless.

Your OCR options:

- **Tesseract** — free, open source, and the engine behind most other tools. Command-line, so there's a learning curve. The [Tesseract project documentation](https://github.com/tesseract-ocr/tesseract) covers language packs and output modes.
- **Adobe Acrobat Pro** — its Recognize Text feature is accurate and writes the text layer back into the PDF in place. Paid.
- **Built-in OS tools** — recent macOS and Windows versions do basic OCR on images. Fine for a handful of pages, painful for a whole book.

Accuracy tracks scan quality almost perfectly. A clean 300 DPI scan of printed text gets you into the high nineties. A phone photo of a curled paperback, or anything with handwriting, marginalia, or show-through from the reverse side, needs proofreading afterwards.

Once OCR has written a text layer into the PDF, come back and upload it like any other text PDF.`
    },
    {
      heading: `Why PDF to EPUB Is the Hardest Conversion`,
      body: `Worth understanding, because it explains why two PDFs of similar length can produce wildly different results.

A PDF is a page description. It says *put this glyph at these coordinates, in this font, at this size*, and that's genuinely all it says. There's no reliable notion of a paragraph, a heading, or a chapter — just characters positioned on a canvas. Any converter has to reconstruct that structure from spacing, font sizes, and line positions.

EPUB works the opposite way. It's XHTML and CSS in a zip container, and the entire point is that text reflows to fit whatever screen you're holding. Change the font size and pages re-break. The [W3C EPUB 3 specification](https://www.w3.org/TR/epub-33/) defines the structure that makes that work.

So the conversion has to invent semantics the source never stored. Results vary by layout:

- **Single-column novel PDFs** convert well, because the guesses are easy
- **Two-column academic papers** often interleave the columns into nonsense
- **Textbooks with sidebars and captions** scatter those elements into the middle of paragraphs
- **Scanned books** produce nothing usable without OCR first

Documents that started life as Word files are a different story. [DOCX to EPUB](/convert/docx-to-epub) gives much cleaner output, because the heading structure was actually stored rather than implied by font size. If you can find the original DOCX, use it. Our [ebook formats explained](/blog/ebook-formats-explained) post covers which formats hold structure and which don't.`
    },
    {
      heading: `Fixing Broken Line Breaks, Headers, and Hyphens`,
      body: `Here's what a first-pass PDF conversion usually looks like, and what to do about each problem.

### Every line is its own paragraph

The classic one. The converter read each visual line as a paragraph because it couldn't distinguish wrapped text from a real break. This tends to hit PDFs with unusual line spacing or narrow columns. If your output looks like this, the source layout is fighting the converter — try a differently formatted version of the document if one exists.

### Hyphenated words split across lines

Print typesetting breaks words at line ends, and conversion sometimes keeps both halves as separate words, giving you *conver-* and *sion*. Most survive-and-fix cases are quick find-and-replace work in any EPUB editor after download.

### Page numbers and running headers in the text

A PDF has no idea that *Chapter Four — 87* at the top of a page is furniture rather than content, so it flows into your paragraphs. Regular-expression cleanup in a desktop editor handles repeating headers and footers if there are enough of them to bother you.

### Images landing in the wrong place

Figures anchored to page coordinates get dropped wherever the text happens to be when the converter reaches them. There's no automatic fix. Move them in an editor, or live with the drift if it's a reading copy rather than a reference.

### Footnotes turning into inline gibberish

Footnotes sit at the bottom of a page in a smaller font, and conversion often dumps them mid-paragraph. Heavily footnoted academic PDFs are among the worst conversion candidates, which leads directly into the next section.

For serious cleanup work — custom search-and-replace passes, tuning line unwrapping by hand, chapter detection with XPath rules — desktop Calibre is the fallback, and the [Calibre conversion documentation](https://manual.calibre-ebook.com/conversion.html) explains every option in its PDF input panel. For a normal text PDF you shouldn't need any of it.

Going the other direction for printing or submission? [EPUB to PDF](/convert/epub-to-pdf) does that too.`
    },
    {
      heading: `When You Should Keep the PDF`,
      body: `Sometimes the right answer is to leave the file alone. Fixed layout exists for a reason.

Keep the PDF when:

- **Layout carries meaning.** Sheet music, poetry with deliberate line placement, art books, comics, and graphic novels lose the point when text reflows.
- **It's a reference document.** Legal filings, forms, standards, and anything where a citation says *page 42* need stable pagination.
- **The tables are complicated.** Multi-level headers and merged cells survive PDF and rarely survive conversion.
- **It's a heavily formatted textbook.** Sidebars, callouts, equations, and figure captions all depend on position.
- **You need to print it.** PDF was built for print output. EPUB wasn't.

There's a middle path worth knowing about: fixed-layout EPUB keeps positioning while still being an EPUB, which suits comics and picture books. Reader support is inconsistent, so test on your target device before committing a library to it.

The honest test is what you plan to do with the file. Reading long-form prose on a phone or e-reader? Convert it. Consulting, citing, annotating, or printing? Keep the PDF and stop worrying about it.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Test the text layer first.** If you can't select and copy text, it's a scan — run OCR elsewhere before uploading, because BookConv doesn't do OCR.
- **BookConv handles text PDFs in the browser.** Upload, convert, download. Free tier is 10 MB per file and 5 conversions per hour, no account, no install.
- **Save the file right away.** Download links are temporary and converted files are deleted after a period.
- **PDF stores position, not structure.** Every converter is guessing at paragraphs and chapters, which is why a novel converts cleanly and a textbook doesn't.
- **Some PDFs shouldn't be converted.** Comics, sheet music, forms, and reference documents lose their meaning the moment text reflows.`
    }
  ]
};

export const faqs = [
  {
    question: `Can BookConv convert a scanned PDF to EPUB?`,
    answer: `It will produce a file, but not a useful one. A scan contains images rather than text, so you'd get an EPUB of unsearchable page pictures. Run OCR first with something like Tesseract or Acrobat Pro, then upload the result.`,
  },
  {
    question: `How do I know if my PDF is scanned?`,
    answer: `Try selecting a sentence with your cursor. If the text highlights, there's a real text layer. If you get a selection rectangle over an image, it's a scan. Zooming in is the second check — scanned text pixelates, real text stays sharp.`,
  },
  {
    question: `What's the file size limit?`,
    answer: `10 MB per file on the free tier, 50 MB on Pro, and 100 MB through the API. PDFs are bulkier than most ebook formats, so image-heavy documents hit these limits faster than plain text ones.`,
  },
  {
    question: `Can I convert a password-protected PDF?`,
    answer: `Not while it's protected — encrypted content can't be read by any conversion tool. Remove the password yourself first if it's your own file. DRM-protected files are rejected at upload and can't be converted at all.`,
  },
  {
    question: `Why does my converted EPUB have one line per paragraph?`,
    answer: `The converter read each visual line as a separate paragraph, which usually means the source PDF has unusual line spacing or narrow columns. Desktop Calibre lets you tune the line unwrapping factor manually if you need that level of control.`,
  },
  {
    question: `Does converting to EPUB reduce quality?`,
    answer: `Text quality holds up when the PDF has a proper text layer. What you lose is layout — exact positioning, page breaks, and typography. Images are re-encoded, so very high-resolution figures may come out slightly softer.`,
  },
  {
    question: `My conversion is taking a while. Is it stuck?`,
    answer: `Probably not. Large or slow files go through a background worker queue, and the progress bar keeps updating while that runs. Leave the page open until the download link appears.`,
  }
];
