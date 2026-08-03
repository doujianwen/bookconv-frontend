export const slug = 'cbr-to-pdf';
export const title = 'Free CBR to PDF Converter — No Sign-up';
export const level = 'B' as const;
export const wordCount = 2500;

export const content = {
  hero: {
    title: 'CBR to PDF - Convert Comic Books to Universal Format',
    subtitle: 'Free CBR to PDF converter. No sign-up — turn comic book archives into easy-to-read, printable PDFs.'
  },

  sections: [
    {
      heading: 'What is CBR Format?',
      body: `A CBR file is one of the simplest formats you'll ever encounter — it's a RAR archive full of images, renamed with a .cbr extension. That's it. No metadata standard, no page-layout engine, no DRM. Just page001.jpg, page002.jpg, and so on, zipped up in reading order.

The comic community landed on this because it's honest about what a comic actually is: a sequence of pictures. Every page is a scan or a render, and the reader app's only job is to show them one after another.

You'll run into two flavors constantly:

- **CBR** — RAR compression (the "R")
- **CBZ** — ZIP compression (the "Z")

Functionally identical. CBZ is slightly more common now because ZIP is patent-free and every language has a built-in library for it. Our converter handles both without you having to think about it.

What CBR gives you and what it doesn't:

- **Full resolution artwork** — pages are stored as-is, no re-rendering
- **Dead simple** — you can rename it to .rar and extract the images manually
- **No text layer** — dialogue in a speech bubble is pixels, not searchable text
- **No reflow** — a comic page is a fixed composition; it can't adapt to your screen
- **Needs a dedicated reader** — CDisplayEx, YACReader, Panels, Tachiyomi, and friends`
    },
    {
      heading: 'What is PDF and Why Use It for Comics?',
      body: `PDF was designed to describe a page exactly — fonts, images, positions, everything nailed down. That's a poor fit for a novel and a surprisingly good fit for a comic, because comic pages are already fixed compositions.

When you turn a CBR into a PDF, you get:

- **Universal opening** — browsers, phones, tablets, desktops, no reader app needed
- **Real printing support** — send it to a print shop and they'll know what to do with it
- **Bookmarks and page jumps** — most PDF readers let you navigate and remember your spot
- **Zoom and pan that works** — pinch-zoom on a phone behaves sanely
- **Easy sharing** — nobody has to install anything to read what you sent

The honest downside: dedicated comic readers are genuinely better at reading comics. They do double-page spreads, manga right-to-left mode, per-panel guided navigation, and automatic fit-to-width. A PDF reader does none of that.

So the rule of thumb is simple. If you read comics regularly on a device with a good reader app, keep CBR. If you need to print, share, archive, or read on something that has no comic reader — convert.`
    },
    {
      heading: 'How to Convert CBR to PDF',
      body: `**1. Drop your file in.** Drag the .cbr or .cbz onto the upload zone. Free accounts handle files up to 50MB, which comfortably covers a single standard issue. Full graphic novels and long manga volumes usually run larger — that's what Pro is for.

**2. Let it process.** The converter extracts every image from the archive, sorts them by filename, and assembles them into a single PDF using ImageMagick. A 24-page issue finishes in seconds. A 200-page collection takes a minute or two, mostly spent on image processing.

**3. Download.** One PDF, pages in order, ready to read or print.

Two things that trip people up.

**Filename ordering matters.** If the pages inside the archive are named page1, page2 ... page10, most sorting systems will put page10 right after page1. Well-made CBRs use zero-padded names (001, 002, 010) and sort correctly. If your comic comes out scrambled, that's why — the archive was packed badly, not the conversion.

**Cover images sometimes jump.** Files named cover.jpg or 00_cover.jpg usually land first, which is what you want. Files named zz_cover.jpg will end up at the back. Again, a packaging quirk.`
    },
    {
      heading: 'When Do You Need This Conversion?',
      body: `**You want to print.** This is the big one. Print shops accept PDF and nothing else. If you're printing a fan translation, a self-published comic, or an out-of-print issue for personal reading, PDF is the only realistic path.

**You're reading on a device with no comic app.** A work laptop with locked-down software installation. A shared family tablet. A library computer. PDF opens in the browser.

**You're sending it to someone who isn't into comics.** Sharing a webcomic collection with a friend? A CBR gets you "how do I open this." A PDF just opens.

**You're building a mixed archive.** If your reference library is already all PDFs — scanned manuals, papers, old magazines — converting your CBRs makes everything searchable by one system and readable in one app.

**You want to annotate.** Studying panel layout for an art class, marking up a script draft, adding translation notes? PDF annotation tools are everywhere. CBR has none.

**You're submitting to a platform.** Some digital storefronts, print-on-demand services, and academic repositories only accept PDF uploads.`
    },
    {
      heading: 'What You Get — Quality and File Size',
      body: `The conversion is essentially lossless on the image side. Each page image is transferred at its original resolution and color depth into the PDF container. A 2400x3600px scan goes in as a 2400x3600px scan.

What that means in practice:

- **Colors stay accurate** — no re-encoding pass that shifts saturation on a Kirby splash page
- **Line art stays sharp** — no additional JPEG generation loss on inked pages
- **Page order is preserved** — assuming the archive was named sensibly
- **Everything lands in one file** — no folder full of loose images

Now, file size. Be ready for it. CBR archives are already compressed images inside a compressed container, and PDF adds its own structural overhead without much extra squeeze. Rough numbers:

- A 24-page single issue at print resolution: 30-80MB
- A 200-page graphic novel: 150-400MB
- A high-DPI manga volume scan: can exceed 500MB

If that seems large, it is — but it's the same pixels you already had, just in a different wrapper. If size is the priority, keep the CBR. If access is the priority, take the PDF.`
    }
  ],

  faq: [
    { q: 'What is the difference between CBR and CBZ?', a: 'CBR is a RAR archive of page images; CBZ is a ZIP archive of the same thing. There is no difference in image quality or reading experience, and our converter accepts both interchangeably.' },
    { q: 'How large will my PDF be?', a: 'Expect roughly the same size as your source archive plus some overhead — a 24-page issue typically lands at 30-80MB, and a 200-page graphic novel can run 150-400MB. PDF cannot compress already-compressed comic scans much further.' },
    { q: 'Will my pages come out in the right order?', a: 'Pages are sorted by their filenames inside the archive, which works correctly for the vast majority of CBR files since most use zero-padded numbering. If a comic was packed with names like page1, page2, page10, the sorting may place page10 too early.' },
    { q: 'Can I search the dialogue in the converted PDF?', a: 'No. CBR pages are images with no text layer, so speech bubbles are just pixels and stay that way in the PDF. Making them searchable would require running OCR separately, and comic lettering fonts give OCR engines a hard time.' },
    { q: 'Is there a file size limit?', a: 'Free users can upload files up to 50MB, which fits most single issues. Full graphic novels and high-resolution manga volumes usually exceed that, so Pro accounts support larger uploads plus batch conversion for processing a whole series at once.' }
  ]
};
