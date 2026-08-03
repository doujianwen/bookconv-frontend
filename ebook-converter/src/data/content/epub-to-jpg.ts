export const slug = 'epub-to-jpg';
export const title = 'Free EPUB to JPG Converter — No Sign-up';
export const level = 'B' as const;
export const wordCount = 2400;

export const content = {
  hero: {
    title: 'EPUB to JPG - Convert Ebooks to HD Images',
    subtitle: 'Free EPUB to JPG converter. No sign-up — convert each ebook page into shareable, high-quality JPG images.'
  },

  sections: [
    {
      heading: 'What is JPG and Why Use It Here?',
      body: `JPG (or JPEG — same thing, the extension just got shortened for old Windows filename limits) is the most widely used image format on the planet. It's been around since 1992 and every camera, phone, browser, and social platform speaks it fluently.

The core idea is **lossy compression**. JPG analyzes an image, figures out which details your eye is least likely to notice, and discards them. The result is dramatically smaller files at a barely perceptible quality cost.

How that plays out for book pages:

- **A text page as PNG:** 200-600 KB
- **The same page as JPG at quality 90:** 60-200 KB

That's a 3-4x reduction. For a 300-page book, you're looking at maybe 40MB instead of 150MB.

The cost is real but small. JPG can leave faint gray fuzz — called ringing artifacts — around high-contrast edges like black text on white. At quality settings above 85 you have to squint to see it. Below 70 it becomes obvious.

**Where JPG genuinely wins:** any page with photographs, watercolor illustrations, or smooth color gradients. That's exactly the content JPG was designed for, and it beats PNG on size by a wide margin with no visible difference.`
    },
    {
      heading: 'Turning a Reflowable Book into Fixed Pages',
      body: `An EPUB doesn't have pages. This surprises people every time.

EPUB text reflows — it fills whatever space the reader app provides. Increase the font size and what was "page 50" becomes "page 63." There is no canonical page layout stored in the file.

So the conversion has to **create** pages. The pipeline is two steps:

**EPUB → PDF (Calibre) → JPG (ImageMagick)**

Calibre renders the book into a PDF, fixing the layout at a specific page size and font size. Then ImageMagick rasterizes each PDF page into a JPG at 300 DPI.

Two things follow from this:

- **Page count is generated, not inherited.** A book that runs 320 pages in paperback might produce 280 or 400 images. It reflects the conversion layout, not any print edition.
- **The result is frozen.** No font adjustment, no dark mode, no reflow. That's the trade — you get a fixed visual artifact you can drop anywhere.

If you want text that stays adjustable and searchable, this isn't the conversion you want. Go to PDF instead.`
    },
    {
      heading: 'How to Convert EPUB to JPG',
      body: `**1. Upload.** Drag your .epub onto the drop zone or click to browse. Free accounts handle files up to 50MB, which covers basically every ebook — text-only novels are usually 1-3MB, and even illustrated books rarely break 30MB.

**2. Let it render.** Calibre lays out the book, then each page gets rasterized at 300 DPI. This takes longer than a typical format conversion because you're generating hundreds of images, not rewriting one file. A short book: well under a minute. A 600-page reference work: a few minutes.

**3. Download the ZIP.** Images arrive numbered in reading order — page-001.jpg, page-002.jpg — so they sort correctly in any file browser.

Heads up on **DRM**. If you bought the book from Kobo, Google Play Books, or any store using Adobe's DRM, the file is encrypted and the conversion will fail. There's no workaround — the file literally can't be read without the license. Books from Project Gutenberg, Standard Ebooks, Humble Bundle, indie authors, or your own exports will convert without complaint.

And the practical note: check your disk space first. Even at JPG's smaller sizes, a long illustrated book can produce a 100MB+ archive.`
    },
    {
      heading: 'When Do You Need This Conversion?',
      body: `**Sharing passages on social media.** WeChat Moments, Weibo, Instagram, and X all handle JPG natively and will re-compress anything you upload anyway — so starting from JPG loses you nothing. A clean 300 DPI page image looks far better than a phone screenshot with your reading app's UI in the corner.

**Building presentations.** Dropping a page image into PowerPoint, Keynote, or Google Slides takes two seconds. Rebuilding a formatted page from copied text takes twenty minutes.

**Print and layout work.** Designers placing book content into magazines, brochures, or catalogs want images they can position directly in InDesign or Affinity Publisher.

**Universal viewing without a reader app.** JPG opens on literally anything — a smart TV, an old digital photo frame, a locked-down work PC, a car infotainment screen. No EPUB reader required.

**Generating previews and thumbnails.** Course platforms, library catalogs, and bookstore listings often need sample page images. JPG is the standard for that.

**Emailing excerpts.** JPG's small size means you can attach twenty pages without hitting a mailbox limit.

**Quick visual reference.** Sometimes you just want a handful of pages on your phone's camera roll where you can swipe through them without opening an app.`
    },
    {
      heading: 'JPG vs PNG — Making the Right Call',
      body: `We offer both. Here's how to choose without regretting it.

| Factor | JPG | PNG |
|--------|-----|-----|
| Compression | Lossy | Lossless |
| Text page size | 60-200 KB | 200-600 KB |
| Photo page size | 200-600 KB | 1-3 MB |
| Text edge sharpness | Very good at q85+ | Perfect |
| Transparency | ❌ No | ✅ Yes |
| Safe to re-save | ❌ Degrades each time | ✅ No loss ever |
| Social upload | ✅ Ideal | Gets re-compressed anyway |
| OCR accuracy | Good | Slightly better |
| Best for | Sharing, photos, size-conscious work | Archiving, charts, editing |

**Go JPG** when the book has photos or painted illustrations, when you're sharing or emailing, when total size matters, or when the destination will re-compress the image regardless.

**Go PNG** when the book is dense text or technical diagrams, when this is your permanent archive copy, when you'll edit the images afterward, or when you're feeding them to OCR.

One rule that saves grief: **don't re-save a JPG repeatedly.** Each save runs compression again and the quality degrades a little more. Edit from a PNG master, export to JPG once, done.`
    }
  ],

  faq: [
    { q: 'What resolution are the converted JPG images?', a: 'Default output is 300 DPI, which is sharp enough for printing and looks crisp on high-density phone and laptop screens. Pro users can push it higher for professional print work, though file sizes climb quickly.' },
    { q: 'Does JPG lose noticeable quality?', a: 'At quality settings above 85 the loss is essentially invisible on normal viewing — you would need to zoom well past 100% to spot the faint fuzz around letter edges. For photo-heavy pages the difference from PNG is undetectable while the file is several times smaller.' },
    { q: 'Why does my page count differ from the printed edition?', a: 'EPUB text reflows rather than sitting on fixed pages, so the converter has to generate page boundaries during layout. The resulting count reflects the conversion settings and will not match any specific print or Kindle edition.' },
    { q: 'Can I copy or search the text in the JPG files?', a: 'No — once a page is rasterized the text becomes pixels with no underlying text layer. Convert to PDF instead if you need selectable, searchable text, or run OCR on the images afterward.' },
    { q: 'What is the file size limit for uploads?', a: 'Free accounts accept EPUB files up to 50MB, which comfortably covers even heavily illustrated books since most ebooks are only a few megabytes. Pro accounts raise that limit and add batch processing for converting multiple books at once.' }
  ]
};
