export const slug = `txt-to-epub`;
export const title = `How to Turn a Plain TXT File into an EPUB with a Table of Contents`;
export const date = `2026-08-02`;
export const author = "BookConv Team";
export const tags = ["TXT", "EPUB", "table of contents", "ebook", "BookConv", "conversion", "guide"];

export const content = {
  intro: `Got a plain .txt file — your own manuscript, a Project Gutenberg download, or public-domain text — that you want to read on a Kindle, Kobo, or phone without squinting at a wall of unbroken text? A TXT file has no chapters, no table of contents, and no structure. Converting it to EPUB gives you a proper ebook with a navigable TOC. This guide shows the shortest path and how to get clean chapter breaks.`,
  sections: [
    {
      heading: `What a TXT File Is Missing`,
      body: `Plain text is just characters. An e-reader opens it, but you get one endless scroll with no way to jump to Chapter 5 or see your reading position as a percentage of a real book.

An EPUB adds three things a TXT lacks:
- **Structure** — chapters and sections marked as distinct blocks
- **A table of contents** — the navigation panel you tap into on any device
- **Metadata** — title, author, and language so the book files correctly in your library

You don't have to build any of that by hand. The converter infers it from the text.`
    },
    {
      heading: `Convert TXT to EPUB on BookConv in Three Steps`,
      body: `1. Open the [TXT to EPUB converter](/convert/txt-to-epub) and upload your .txt file.
2. BookConv scans the text, detects chapter breaks, and wraps each section in proper EPUB markup with a generated table of contents.
3. Download the .epub and send it to your reader. It opens on Kindle, Kobo, Apple Books, and most apps.

The free tier handles files up to 10 MB — enough for a long novel several times over.

### Two things to know before you upload

- **Download links are temporary.** Converted files are deleted after a period, so save the .epub to your device right after the progress bar finishes.
- **Encoding matters.** Save your .txt as UTF-8. A file saved in an old code page will show garbled characters for accents and non-Latin scripts.`
    },
    {
      heading: `How Chapter Detection Works`,
      body: `The converter looks for consistent patterns that mark a new chapter. You get the best result by pre-formatting the text just a little:

- **Blank-line-separated blocks** — each block becomes a section.
- **Numbered or titled headings** — lines like "Chapter 1", "1. The Beginning", or "PART TWO" are recognized as chapter starts.
- **Consistent markers** — if every chapter starts with a centered title in ALL CAPS, keep that pattern; the detector learns it.

A few minutes of cleanup before upload beats fighting the output afterward. If your file is already one giant paragraph with no breaks, the converter can only split on the cues it finds.`
    },
    {
      heading: `After Conversion: Check the Table of Contents`,
      body: `Open the EPUB and tap the contents or Go To menu. You should see one entry per detected chapter.

If the TOC looks wrong — too many entries, or chapters merged — the cause is almost always in the source text:
- Inconsistent heading style (some chapters titled, others not)
- Missing blank lines between sections
- A repeated phrase the detector mistook for a heading

Fix the .txt, re-upload, and convert again. It's a 30-second round trip. For the wider format trade-offs, see [Ebook formats explained](/blog/ebook-formats-explained).`
    },
    {
      heading: `TXT to EPUB vs Building an EPUB by Hand`,
      body: `You can author an EPUB manually with a tool like Sigil or Calibre's editor, and that's worth it for a polished, styled release. But for turning an existing text into a readable book fast, automated conversion wins:

- **No markup to learn** — you skip XHTML, OPF, and NCX entirely.
- **TOC is free** — generated from your headings, not hand-coded.
- **Good enough to read** — clean structure, correct metadata, navigable chapters.

If you later want a Kindle-native file from the same text, convert the EPUB onward to [EPUB to AZW3](/convert/epub-to-azw3).`
    },
    {
      heading: `Key Takeaways`,
      body: `- **TXT has no structure; EPUB adds it.** Chapters and a table of contents come from the conversion, not from you hand-coding.
- **Three steps on BookConv.** Upload, convert, download — no install, no account, 10 MB free tier.
- **Pre-format for clean chapters.** Blank-line breaks and consistent "Chapter N" headings get the best TOC.
- **Save as UTF-8.** Old code pages produce garbled characters.
- **Save immediately.** Download links are temporary and files are deleted after a period.`
    }
  ]
};

export const faqs = [
  {
    question: `Do I need any special software to make the EPUB?`,
    answer: `No. BookConv runs the conversion on its servers. You only need an e-reader app or device to open the finished .epub.`,
  },
  {
    question: `Will my TXT keep its chapter structure in the EPUB?`,
    answer: `The converter detects chapter breaks from patterns like "Chapter 1" headings and blank-line-separated blocks, then builds a table of contents from them. Consistent formatting in the source text gives the cleanest result.`,
  },
  {
    question: `What if my table of contents looks wrong after conversion?`,
    answer: `It almost always means the source text was inconsistent — missing blank lines, or some chapters untitled. Fix the .txt, re-upload, and convert again; it takes about 30 seconds.`,
  },
  {
    question: `My text shows strange characters. Why?`,
    answer: `Your .txt was likely saved in an old character encoding. Re-save it as UTF-8 and re-upload; accented and non-Latin characters will render correctly.`,
  },
  {
    question: `Can I read the resulting EPUB on a Kindle?`,
    answer: `Yes. Kindle devices and the Kindle app read EPUB directly through Send to Kindle, or you can convert it onward to AZW3 for native sideloading.`,
  }
];
