export const slug = `epub3-vs-epub2`;
export const title = `EPUB 3 vs EPUB 2: What Changed and Why It Matters`;
export const date = `2026-08-09`;
export const author = "BookConv Team";
export const tags = ["EPUB", "EPUB 3", "EPUB 2", "Ebook Formats", "BookConv"];

export const content = {
  intro: `EPUB 2 and EPUB 3 are the two versions of the open ebook standard. Most readers handle both without you noticing, but they are not the same underneath. EPUB 3 added multimedia, better accessibility, and richer navigation. Here is what changed and whether it matters for your books.`,
  sections: [
    {
      heading: `At a Glance`,
      body: `| | EPUB 2 | EPUB 3 |
|---|---|---|
| Baseline | XHTML 1.1 | XHTML 5 |
| Multimedia | None | Audio, video, embedded interactivity |
| Accessibility | Basic | ARIA roles, semantic markup |
| Navigation | NCX (legacy) | EPUB Navigation Document (HTML) |
| Math | Images only | MathML |
| Adoption | Legacy books | New books since ~2014 |

EPUB 3 is the current version; EPUB 2 survives mainly in older titles.`
    },
    {
      heading: `What Is EPUB 2?`,
      body: `**EPUB 2** (2007) is built on XHTML 1.1 with an NCX file for the table of contents. It covers the basics — reflowable text, images, and a TOC — and almost every reader supports it. It is perfectly fine for novels and simple non-fiction.`
    },
    {
      heading: `What Is EPUB 3?`,
      body: `**EPUB 3** (2011, widely adopted after 2014) is built on XHTML 5, the same family as modern web pages. That lets it carry audio and video, proper semantic structure for accessibility, MathML for equations, and a navigation document written in HTML rather than the older NCX format.`
    },
    {
      heading: `What Changed in EPUB 3`,
      body: `- **Multimedia** — audio and video become first-class, enabling read-along children's books and embedded media.
- **Accessibility** — ARIA roles and semantic markup let screen readers navigate by structure, not just by reading order.
- **Navigation** — the EPUB Navigation Document is plain HTML, easier to build and style than NCX.
- **Math and complexity** — MathML and richer layouts suit textbooks and technical works.
- **International text** — better support for vertical writing and right-to-left languages.`
    },
    {
      heading: `Do You Need EPUB 3?`,
      body: `For a novel or a simple book, **no** — EPUB 2 reads identically on every device. You need EPUB 3 when your content has audio, video, equations, or strict accessibility requirements. Most modern reading apps accept both, so the version rarely blocks you from reading.`
    },
    {
      heading: `Converting Between Them`,
      body: `Converters generally read either version and can output EPUB 3 by default. If you convert an EPUB 2 to another format, the multimedia features (if any) are lost, because target formats like MOBI or PDF cannot carry them:

- **EPUB to AZW3** — [Convert EPUB to AZW3](/convert/epub-to-azw3) for a Kindle; rich EPUB 3 features flatten to what AZW3 supports.
- **EPUB to PDF** — [Convert EPUB to PDF](/convert/epub-to-pdf); layout becomes fixed, so interactivity is gone.

For the broader format picture, [Ebook Formats Explained](/blog/ebook-formats-explained) compares EPUB to everything else.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **EPUB 3 is the current standard**; EPUB 2 is legacy but still reads fine.
- **EPUB 3 adds** audio, video, accessibility, and MathML.
- **Most readers accept both** — the version rarely stops you reading.
- **Rich EPUB 3 features are lost** when converting to MOBI or PDF.
- **You rarely choose manually** — converters output EPUB 3 by default.`
    }
  ]
};

export const faqs = [
  {
    question: `Is EPUB 3 better than EPUB 2?`,
    answer: `For most novels, they read the same. EPUB 3 is better when a book uses audio, video, equations, or needs strong accessibility, because it supports those natively. Both open in any modern reader.`
  },
  {
    question: `Will my older reader open EPUB 3?`,
    answer: `Almost all readers from the last decade support EPUB 3. Very old devices may only handle EPUB 2, but those are rare now. If a book will not open, it is usually a different format issue, not the EPUB version.`
  },
  {
    question: `Does converting EPUB lose the version?`,
    answer: `Converters typically output EPUB 3. If you convert to MOBI or PDF, the target format cannot carry EPUB 3's multimedia or rich structure, so those features are dropped — expected, not a bug.`
  },
  {
    question: `Do I need to pick EPUB 2 or 3 when publishing?`,
    answer: `Publish in EPUB 3; it is the current standard and every modern store and reader accepts it. EPUB 2 only matters if you specifically target a legacy device.`
  },
  {
    question: `What is the EPUB Navigation Document?`,
    answer: `It is the EPUB 3 table of contents, written in HTML, replacing the older NCX file used by EPUB 2. It is easier to build and style, and gives readers a cleaner chapter list.`
  },
  {
    question: `Can EPUB 3 include audio and video?`,
    answer: `Yes. EPUB 3 supports embedded audio and video, which enables read-along books and enriched content. EPUB 2 cannot carry media natively.`
  }
];
