export const slug = 'epub-to-png';
export const title = 'EPUB to PNG Converter';
export const level = 'B' as const;
export const wordCount = 2400;

export const content = {
  hero: {
    title: 'EPUB to PNG - Convert Ebooks to High-Quality Images',
    subtitle: 'Transform EPUB ebooks into PNG images with perfect quality and detail preservation.'
  },

  sections: [
    {
      heading: 'What is PNG and Why Use It for Book Pages?',
      body: `PNG is a lossless raster image format. That word — lossless — is the entire reason it exists. When PNG compresses an image, it throws away exactly zero information. Decompress it and you get back the original pixels, bit for bit.

That makes it very good and very bad at specific things.

**Where PNG shines:** sharp edges. Black text on a white background is nothing but sharp edges, and PNG handles those perfectly. Line art, charts, diagrams, tables, mathematical notation, screenshots — all crisp, no fuzz.

**Where PNG struggles:** photographs. A page with a full-bleed photo produces a huge PNG because there's no repeating pattern to compress. That same page as JPG might be one-fifth the size and look nearly identical.

So the honest tradeoff versus JPG:

- **PNG keeps every pixel** but produces bigger files
- **JPG loses some detail** but produces much smaller files
- For text-heavy pages, **PNG wins** — JPG artifacts show up as gray fuzz around letters
- For photo-heavy pages, **JPG usually wins** on size with no visible penalty

Since most ebook pages are mostly text, PNG is generally the right call for this conversion.`
    },
    {
      heading: 'Converting Reflowable Text into Fixed Images',
      body: `Here's the thing people don't expect: an EPUB has no pages.

EPUB is reflowable. Text flows into whatever space the reader app gives it. Change the font size and the "page count" changes. There's no such thing as "page 47" in an EPUB the way there is in a PDF.

So converting to images means **deciding** what a page is. The pipeline works like this:

**EPUB → PDF → PNG**

Calibre renders the EPUB into a PDF first, laying out the text at a chosen page size and font size. That fixes the layout. Then ImageMagick rasterizes each PDF page into a PNG at 300 DPI.

Two consequences worth understanding:

- **Your page count is generated, not inherited.** A 300-page paperback might become 220 or 400 image files depending on how the text lays out. It won't match the print edition.
- **The layout is now frozen.** No font resizing, no night mode, no reflow. You've traded flexibility for a fixed visual record — which is exactly the point if you're archiving or sharing screenshots.

If you want the text to stay adjustable, don't convert to images. Convert to PDF, or just keep the EPUB.`
    },
    {
      heading: 'How to Convert EPUB to PNG',
      body: `**1. Upload your EPUB.** Drag and drop, or browse. Free accounts handle files up to 50MB — no text ebook comes close, and even heavily illustrated ones rarely do.

**2. Processing runs.** Calibre lays the book out, then every page is rasterized at 300 DPI. This step is heavier than most conversions — you're generating hundreds of images. A short book takes under a minute; a long one takes several.

**3. Download.** You'll get a ZIP archive with the images numbered in reading order — page-001.png, page-002.png, and so on. Extract it and every page is a separate file you can open, edit, or drop into another document.

Before you start, a reality check on size. A 300-page book at 300 DPI produces roughly 300 PNG files. At an average of 400KB each, that's around 120MB — and text-light pages with images can push individual files past 2MB. Make sure you have the disk space and a reasonable connection.

Also: **DRM-protected EPUBs won't convert.** Files from Kobo, Google Play Books, or any store using Adobe DRM are encrypted and unreadable to any converter. DRM-free books — Project Gutenberg, Standard Ebooks, indie authors, your own exports — work fine.`
    },
    {
      heading: 'When Do You Need This Conversion?',
      body: `**You need visual excerpts for social media.** Screenshotting a passage from a reader app gives you whatever font size and theme you had set. Converting gives you clean, consistent, high-resolution page images.

**You're building slides.** Dropping a page image into PowerPoint or Keynote is trivial. Extracting formatted text and rebuilding the layout is not.

**You want a frozen archival record.** EPUB rendering varies between apps — the same book looks different on Apple Books than on Kobo. A PNG set is exactly what it is, forever, on any device.

**You're preparing for print or layout work.** Designers working in InDesign, Affinity Publisher, or Photoshop want images they can place directly. 300 DPI PNGs drop straight in.

**You're quoting technical content.** Charts, formulas, and tables from a textbook copy badly as text and perfectly as images. Lossless PNG keeps every gridline and subscript readable.

**You need thumbnails or previews.** Library catalogs, course platforms, and book databases often want page images for preview panels.

**You're doing OCR or text analysis.** Some pipelines need image input. PNG's lossless output gives OCR engines the cleanest possible source — noticeably better recognition rates than JPG at equivalent resolution.`
    },
    {
      heading: 'PNG vs JPG — Which Should You Pick?',
      body: `Both conversions exist on this site, so here's a direct comparison to save you a wrong guess.

| Factor | PNG | JPG |
|--------|-----|-----|
| Compression | Lossless | Lossy |
| Text sharpness | ✅ Perfect | Slight fuzz at edges |
| File size (text page) | 200-600 KB | 60-200 KB |
| File size (photo page) | 1-3 MB | 200-600 KB |
| Transparency | ✅ Supported | ❌ Not supported |
| Re-editing safely | ✅ No loss on resave | ❌ Degrades each save |
| Universal support | ✅ Yes | ✅ Yes |
| Best for | Text, charts, diagrams, archiving | Photos, sharing, web upload |

**Pick PNG** if the book is mostly text, if you'll edit the images afterward, if you're running OCR, or if this is your archival copy.

**Pick JPG** if the book is photo-heavy, if you're uploading to social platforms that re-compress anyway, or if total file size actually matters to you.

When you genuinely can't decide: text-heavy book, go PNG. The size difference is real but manageable, and text that's crisp beats text that's *almost* crisp.`
    }
  ],

  faq: [
    { q: 'What is the difference between PNG and JPG for ebook pages?', a: 'PNG is lossless and keeps text edges perfectly sharp, while JPG compresses more aggressively and can leave faint fuzz around letters. For text-heavy books PNG is the better choice; for photo-heavy books JPG gives you far smaller files with no visible penalty.' },
    { q: 'How large are the converted PNG files?', a: 'A plain text page at 300 DPI typically lands between 200 and 600 KB, while pages with illustrations or complex layouts can reach 1-3 MB each. A full 300-page book usually totals somewhere around 100-200 MB.' },
    { q: 'Why does my page count not match the printed book?', a: 'EPUB has no fixed pages — text reflows based on screen and font size, so page boundaries are generated during conversion rather than inherited. The resulting count depends on the layout settings used and will not match a specific print edition.' },
    { q: 'Can I convert only certain pages?', a: 'Pro users can specify custom page ranges, which is useful for pulling a single chapter or a handful of figures instead of rasterizing an entire book. Free conversions process the whole file.' },
    { q: 'Will the text in my PNG images be searchable?', a: 'No. Once a page becomes an image, the text is just pixels — there is no text layer to search or copy. If you need searchable output, convert to PDF instead, or run OCR on the PNG files afterward.' }
  ]
};
