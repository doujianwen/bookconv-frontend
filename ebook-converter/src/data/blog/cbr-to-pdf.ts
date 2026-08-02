export const slug = `cbr-to-pdf`;
export const date = `2026-08-02`;
export const author = "BookConv Team";
export const title = `CBR to PDF: Convert Comic Books for Printing and Any Device`;
export const tags = ["CBR", "CBZ", "PDF", "Comics", "Ebook Formats", "BookConv"];

export const content = {
  intro: `Got a comic stuck in a .cbr file your tablet won't open? CBR is just a folder of images wearing a different coat — and turning it into a PDF takes seconds. This guide walks through converting CBR to PDF, why the file balloons, and how to keep pages in the right order. You'll also learn the CBZ difference and when PDF is the wrong call.`,
  sections: [
    {
      heading: `What Exactly Is a CBR File?`,
      body: `CBR is short for Comic Book RAR. It's a RAR archive of page images (usually JPG or PNG) renamed with a .cbr extension. CBZ is the same idea built on ZIP instead of RAR. Neither format holds any text — every speech bubble is a picture. To read one you need a comic reader like ComicRack or a tablet app; most ordinary PDF viewers choke on it.`
    },
    {
      heading: `Why Convert CBR to PDF?`,
      body: `PDF isn't a comic-first format, but it opens literally everywhere — Preview on Mac, Adobe on Windows, any browser, any printer. Converting CBR to PDF means you can print a spread, share the file with someone who has no comic app, or submit it to a platform that only takes PDF. Comic readers still do right-to-left and double-page spreads better, so PDF is the portable fallback, not the upgrade.`
    },
    {
      heading: `How to Convert CBR to PDF`,
      body: `1. Open [BookConv's CBR to PDF converter](/convert/cbr-to-pdf).
2. Upload the .cbr (or .cbz — we accept both) up to 50 MB on the free tier.
3. The converter uses ImageMagick to stitch the images into a single PDF.
4. Download it.

Most issues come down to page order, which we cover next.`
    },
    {
      heading: `Will the Pages Come Out in the Right Order?`,
      body: `Pages are sorted by their filenames inside the archive. Most comics use zero-padded numbers (001, 002, 010), so order is correct. Trouble starts when a file was packed as page1, page2, page10 — naive sorting puts page10 before page2. If your PDF looks scrambled, rename the images with zero-padding and reconvert.`
    },
    {
      heading: `File Size — What to Expect`,
      body: `PDF can't compress already-compressed comic scans much further, so the output is roughly your source size plus a little overhead:

- A 24-page issue: about 30–80 MB
- A 200-page graphic novel: 150–400 MB
- Hi-DPI manga: often over 500 MB

The free 50 MB cap fits most single issues; longer works need a Pro account or desktop [Calibre](https://calibre-ebook.com).`
    },
    {
      heading: `Key Takeaways`,
      body: `- **CBR is a RAR of images** — no text layer, needs a comic reader.
- **CBZ is the same, zipped** — we accept both interchangeably.
- **PDF opens everywhere** — your portable fallback for print and share.
- **Page order follows filenames** — zero-pad them to avoid scrambles.
- **Expect source-size output** — 24 pages ≈ 30–80 MB.
- **Free tier = 50 MB** — fine for single issues, not whole shelves.`
    }
  ]
};

export const faqs = [
  {
    question: `What is the difference between CBR and CBZ?`,
    answer: `CBR is a RAR archive of page images; CBZ is a ZIP archive of the same thing. There is no difference in image quality or reading experience, and our converter accepts both interchangeably.`,
  },
  {
    question: `How large will my PDF be?`,
    answer: `Expect roughly the same size as your source archive plus some overhead — a 24-page issue typically lands at 30–80 MB, and a 200-page graphic novel can run 150–400 MB. PDF cannot compress already-compressed comic scans much further.`,
  },
  {
    question: `Will my pages come out in the right order?`,
    answer: `Pages are sorted by their filenames inside the archive, which works for the vast majority of CBR files since most use zero-padded numbering. If a comic was packed as page1, page2, page10, sorting may place page10 too early.`,
  },
  {
    question: `Can I search the dialogue in the converted PDF?`,
    answer: `No. CBR pages are images with no text layer, so speech bubbles are just pixels and stay that way in the PDF. Making them searchable would require running OCR separately, and comic lettering fonts give OCR engines a hard time.`,
  },
  {
    question: `Is there a file size limit?`,
    answer: `Free users can upload files up to 50 MB, which fits most single issues. Full graphic novels and high-resolution manga volumes usually exceed that, so Pro accounts support larger uploads plus batch conversion.`,
  },
  {
    question: `Can I convert CBZ to PDF the same way?`,
    answer: `Yes. CBZ is just the ZIP version of CBR, and our converter treats them identically — upload the .cbz and it stitches the pages into a PDF the same way.`,
  },
  {
    question: `Is PDF the best format for reading comics?`,
    answer: `For portability and printing, yes. For the actual reading experience — spreads, right-to-left — a dedicated comic app is better. PDF is the safe exchange format you can open anywhere.`,
  }
];
