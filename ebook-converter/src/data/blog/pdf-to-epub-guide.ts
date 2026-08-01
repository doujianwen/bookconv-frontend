export const slug = `pdf-to-epub-guide`;
export const title = `How to Convert PDF to EPUB Properly (and When Not To)`;
export const date = `2026-07-30`;
export const author = "BookConv Team";
export const tags = ["PDF", "EPUB", "OCR", "conversion", "guide"];

export const content = {
  intro: `Converting PDF to EPUB is the messiest job in ebook conversion, because a PDF describes where ink goes on a page while an EPUB describes text that has to reflow on any screen. This guide covers how to check what's actually inside your PDF, how to run the conversion, how to clean up the damage, and when you should just keep the PDF.`,
  sections: [
    {
      heading: `Why PDF to EPUB Is Harder Than Other Conversions`,
      body: `Converting EPUB to MOBI is a translation between two similar things. Converting PDF to EPUB is closer to reverse-engineering.

A PDF is a page description. It says *put this glyph at these coordinates, in this font, at this size*. That's it. There's no reliable notion of a paragraph, a heading, or a chapter — just characters positioned on a canvas. Every converter has to guess that structure back into existence from spacing, font sizes, and line positions.

EPUB works the opposite way. It's XHTML and CSS in a zip container, and its whole point is that text reflows to fit whatever screen you're holding. Change the font size and the pages re-break. The [W3C EPUB 3 specification](https://www.w3.org/TR/epub-33/) defines the structure that makes that possible.

So the conversion has to invent semantics that the source file never stored. That's why results vary so wildly:

- **A single-column novel PDF** usually converts well, because the guesses are easy
- **A two-column academic paper** often interleaves the columns into nonsense
- **A textbook with sidebars and captions** scatters those elements into the middle of paragraphs
- **A scanned book** produces zero text, because there is no text — only pictures of text

Knowing which of those you have determines everything else. That's the next step.

If you're weighing formats more generally, [ebook formats explained](/blog/ebook-formats-explained-en) covers what each one is actually good at.`
    },
    {
      heading: `Check Your PDF First: Real Text or Scanned Images?`,
      body: `Do this before you touch a converter. It takes ten seconds and it decides your entire workflow.

Open the PDF in any reader and try to select a sentence with your cursor. If the text highlights and you can copy it, you have a text-layer PDF. If your cursor draws a rectangle over an image instead, it's a scan — a photograph of a page — and no converter can extract words from it without OCR.

Zooming in is the other tell. Real text stays sharp at 400 percent. Scanned text goes blurry and pixelated.

### If it's a scanned PDF, you need OCR first

Optical character recognition reads the image and produces actual text. It's a separate step that happens *before* conversion, and skipping it produces an EPUB full of full-page images that can't be resized, searched, or read aloud.

Your options:

- **Tesseract** — free, open source, and the engine behind most other tools. Command-line, so there's a learning curve. The [Tesseract project documentation](https://github.com/tesseract-ocr/tesseract) covers language packs and output modes.
- **Adobe Acrobat Pro** — its Recognize Text feature is accurate and writes the text layer back into the PDF in place, which is convenient. Paid.
- **Built-in OS tools** — recent macOS and Windows versions do basic OCR on images, fine for a few pages, painful for a book.

OCR accuracy depends almost entirely on scan quality. A clean 300 DPI scan of printed text gets you into the high nineties. A phone photo of a curled paperback page, or anything with handwriting, marginalia, or heavy show-through from the reverse side, will need real proofreading afterwards.

Once OCR has written a text layer into the PDF, treat it like any other text PDF and continue below.`
    },
    {
      heading: `Converting PDF to EPUB With Calibre, Step by Step`,
      body: `Calibre is free, cross-platform, and gives you the settings that actually matter for PDF input.

1. Install Calibre and open it.
2. Drag your PDF into the library window, or click **Add books**.
3. Select the file and click **Convert books**.
4. Set **Output format** to EPUB in the top-right dropdown.
5. Open the **PDF Input** panel on the left. This is the important one.
6. Tick **No default page breaks** if your PDF has short pages that would otherwise break mid-sentence.
7. Set **Line unwrapping factor** to around 0.45 as a starting point. Lower it if paragraphs stay broken into single lines; raise it if separate paragraphs merge together.
8. Open **Structure detection** and set **Detect chapters at** to an XPath rule that matches your headings, or leave the default and fix it after a test run.
9. Under **Table of Contents**, tick **Force use of auto-generated Table of Contents** — PDFs rarely carry a usable one.
10. Click **OK**, wait for the job counter to clear, then read the first few pages before doing anything else.

That last step isn't optional. PDF conversion always needs a look-and-fix pass, and it's much cheaper to change one setting and re-run than to hand-edit 300 pages.

The [Calibre conversion documentation](https://manual.calibre-ebook.com/conversion.html) explains every option in the PDF Input panel if you need to go deeper.

If you'd rather skip the install, our [PDF to EPUB converter](/convert/pdf-to-epub) handles the common cases in the browser. Going the other way for print or submission? [EPUB to PDF](/convert/epub-to-pdf) does that too.`
    },
    {
      heading: `Fixing Broken Line Breaks, Headers, and Hyphens`,
      body: `Here's what a first-pass conversion usually looks like, and how to deal with each problem.

### Every line is its own paragraph

The classic PDF conversion failure. The converter treated each visual line as a paragraph because it couldn't tell wrapped text from a real break. Raise the line unwrapping factor and re-run. If that over-corrects and merges genuine paragraphs, split the difference — somewhere between 0.35 and 0.55 works for most books.

### Hyphenated words split across lines

Print typesetting breaks words at line ends. Conversion often preserves both halves as separate words, giving you *conver-* and *sion*. Calibre's **Dehyphenate** option under Look & feel catches most of these. Some survive and need find-and-replace in Calibre's editor.

### Page numbers and running headers in the text

A PDF has no idea that *Chapter Four — 87* at the top of a page is furniture rather than content, so it flows into your paragraphs. Calibre's **Search and replace** panel takes a regular expression that strips repeating header and footer lines. Write one pattern that matches the header, one for the page numbers, and run a test conversion.

### Images landing in the wrong place

Figures anchored to page coordinates get dropped wherever the text happens to be when the converter reaches them. There's no automatic fix. Move them in Calibre's editor, or accept the drift if it's a reading copy rather than a reference.

### Footnotes turning into inline gibberish

Footnotes sit at the bottom of a page in a smaller font. Conversion often dumps them mid-paragraph. Academic PDFs with heavy footnoting are among the worst candidates for conversion, which brings us to the next section.

Documents that started life as Word files are far easier — [DOCX to EPUB](/convert/docx-to-epub) preserves real heading structure, because the structure was actually stored.`
    },
    {
      heading: `When EPUB Is the Wrong Target`,
      body: `Sometimes the right answer is to leave the PDF alone. Fixed layout exists for a reason.

Keep the PDF when:

- **Layout carries meaning.** Sheet music, poetry with deliberate line placement, art books, comics, and graphic novels lose the point when they reflow.
- **It's a reference document.** Legal filings, forms, standards documents, and anything where a citation says *page 42* need stable pagination.
- **The tables are complicated.** Multi-level headers and merged cells survive PDF and rarely survive conversion.
- **It's a heavily formatted textbook.** Sidebars, callouts, equations, and figure captions all depend on position.
- **You need to print it.** PDF was designed for print output. EPUB wasn't.

There's also a middle path worth knowing about: fixed-layout EPUB. It keeps positioning while still being an EPUB, which suits comics and children's picture books. Support is inconsistent across readers, though, so test on your target device before committing a whole library to it.

The honest test is what you're going to do with the file. Reading long-form prose on a phone or e-reader? Convert it. Consulting, citing, annotating, or printing it? Keep the PDF and stop worrying about it.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Test the text layer first.** If you can't select and copy text, it's a scan and you need OCR before any conversion tool will do anything useful.
- **PDF stores position, not structure.** Every converter is guessing at paragraphs and chapters, which is why results depend so heavily on the source layout.
- **Line unwrapping is the setting that matters.** Around 0.45 is a sane default in Calibre; adjust and re-run rather than hand-editing output.
- **Expect a cleanup pass.** Hyphens, running headers, page numbers, and stray footnotes all need attention after the first conversion.
- **Some PDFs shouldn't be converted.** Comics, sheet music, forms, and reference documents lose their meaning when text reflows.`
    },
    {
      heading: `Frequently Asked Questions`,
      body: `Q: Can every PDF be converted to EPUB?
A: Technically yes, usefully no. Single-column text converts well. Multi-column academic papers, complex textbooks, and image-heavy layouts often produce output that needs more editing than it's worth. Scanned PDFs need OCR first or you'll get an EPUB full of unsearchable pictures.

Q: How do I know if my PDF is scanned?
A: Try to select a sentence with your cursor. If the text highlights, there's a real text layer. If you get a selection rectangle over an image instead, it's a scan. Zooming in is a second check — scanned text pixelates, real text stays sharp.

Q: Why does my converted EPUB have one line per paragraph?
A: The converter read each visual line as a separate paragraph. In Calibre, raise the line unwrapping factor in the PDF Input panel and convert again. Too high and separate paragraphs merge, so tune it in small steps.

Q: Does converting to EPUB reduce quality?
A: Text quality stays intact when the PDF has a proper text layer. What you lose is layout — exact positioning, page breaks, and typography. Images are usually re-encoded, so very high-resolution figures may come out slightly softer.

Q: Should I use Calibre or an online converter?
A: Calibre when you need control over unwrapping, chapter detection, and search-and-replace cleanup, or when you're converting many files. An online tool when you have one straightforward document and don't want to install software.

Q: Can I convert a PDF that's password protected?
A: Not while it's protected. Encrypted PDFs can't be read by conversion tools. If it's your own file and you know the password, remove the protection first, then convert. DRM-protected files from stores or libraries can't be converted at all.

Q: What about PDFs with lots of tables?
A: Tables are the weakest part of PDF conversion. Simple grids sometimes survive; merged cells and multi-level headers almost never do. If the tables are the point of the document, keep the PDF.`
    }
  ]
};
