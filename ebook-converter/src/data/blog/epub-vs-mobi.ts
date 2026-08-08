export const slug = `epub-vs-mobi`;
export const title = `EPUB vs MOBI: Which Ebook Format Should You Actually Use?`;
export const date = `2026-08-09`;
export const author = "BookConv Team";
export const tags = ["EPUB", "MOBI", "Ebook Formats", "Kindle", "BookConv", "Calibre"];

export const content = {
  intro: `EPUB and MOBI are the two format names most readers recognize, and they could not have come from more different worlds. EPUB is the open standard almost every non-Kindle reader uses; MOBI is Amazon's older format that now mostly lives on legacy Kindles. If you are deciding which to save your books in, or which to convert to, the answer follows straight from where you read. This is the practical comparison, not the spec-sheet version.`,
  sections: [
    {
      heading: `At a Glance`,
      body: `If you only remember one table, make it this one.

| | EPUB | MOBI |
|---|---|---|
| Backed by | International Digital Publishing Forum (open standard) | Amazon (legacy) |
| Best on | Kobo, Apple Books, Google Play Books, most e-readers | Older Amazon Kindles |
| Styling | Full CSS, embedded fonts, reflow | Limited; flattens complex layout |
| Open or locked | Open, portable | Amazon-centric |
| Future | Actively developed (EPUB 3) | Frozen; Amazon moved on to AZW3/KF8 |

The pattern is clear: EPUB is the portable, forward-looking choice, and MOBI is the one you keep around only for old Kindle hardware.`
    },
    {
      heading: `What Is EPUB?`,
      body: `**EPUB** (Electronic Publication) is an open standard built on HTML and CSS. That is why it reflows so well: a paragraph is a paragraph, not a fixed image of a page. EPUB 3 adds audio, video, and richer navigation, which is why it is the default for Kobo, Apple Books, Google Play Books, and almost every non-Amazon store.

Because it is open, no single company controls it. You can open an EPUB in one app, move it to another, and the book travels with you. That portability is the single biggest reason to keep your library as EPUB.`
    },
    {
      heading: `What Is MOBI?`,
      body: `**MOBI** (Mobipocket) is the format Amazon adopted for early Kindles. It did its job for a device generation that predates modern styling engines, but it carries real limits: weak CSS support, no reliable embedded-font handling, and a structure that quietly drops tables and complex layouts.

Amazon has since moved its Kindles to **AZW3** (KF8), a much richer format, and removed MOBI from Send to Kindle back in 2022. So MOBI today is mostly a compatibility format for readers who still own a pre-2015 Kindle. New books are not being authored in MOBI.`
    },
    {
      heading: `EPUB vs MOBI: The Differences That Matter`,
      body: `Beyond the labels, three differences change your day-to-day reading:

- **Reflow and accessibility** — EPUB reflows cleanly at any font size and supports proper semantic navigation; MOBI often forces a more rigid, less accessible layout.
- **Formatting fidelity** — an EPUB keeps the publisher's CSS, fonts, and tables; a MOBI conversion of the same book tends to strip or flatten them.
- **Where it opens** — EPUB opens almost everywhere except modern Kindles; MOBI opens on old Kindles and almost nowhere else of consequence.

If you care about how the book looks and reads, EPUB wins. If you are locked to a vintage Kindle, MOBI is the fallback that device still understands.`
    },
    {
      heading: `Which Should You Choose?`,
      body: `Decide by device, not by habit:

- **Kobo, Apple Books, Google Play Books, or any non-Kindle e-reader** → EPUB, every time.
- **A modern Kindle (2015 or later)** → AZW3, not MOBI; EPUB converts to AZW3 cleanly. Our [Kindle Formats guide](/guide/kindle-formats) breaks it down by model.
- **A pre-2015 Kindle** → MOBI is the format that sideloads most reliably over USB.
- **Your master library** → keep EPUB as the source of truth, then convert per device.

For the full Amazon-side comparison, see [AZW3 vs MOBI](/blog/azw3-vs-mobi) and the [MOBI vs AZW3 guide](/guide/mobi-vs-azw3). For the broader format landscape, [Ebook Formats Explained](/blog/ebook-formats-explained) covers EPUB, AZW3, MOBI, and more.`
    },
    {
      heading: `Converting Between EPUB and MOBI`,
      body: `The two convert in both directions, and it is a one-click job in a browser converter:

- **EPUB to MOBI** — for an old Kindle. [Convert EPUB to MOBI](/convert/epub-to-mobi), choose MOBI, download. Expect some styling loss, which is the format's limit, not the converter's.
- **MOBI to EPUB** — to free a book from a legacy device and read it anywhere. [Convert MOBI to EPUB](/convert/mobi-to-epub) restores proper reflow and a working table of contents.

Neither conversion needs desktop software for a handful of books. Keep your EPUB master, and you can feed any reader from one file.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **EPUB is the open, portable standard** — best on Kobo, Apple Books, Google Play Books, and most e-readers.
- **MOBI is Amazon's legacy format** for old Kindles; Amazon itself moved on to AZW3.
- **EPUB keeps formatting and reflow**; MOBI tends to flatten layout and fonts.
- **Modern Kindles want AZW3**, not MOBI — convert EPUB to AZW3 for them.
- **Keep EPUB as your master** and convert per device; you only re-process when a reader demands a different format.`
    }
  ]
};

export const faqs = [
  {
    question: `Which is better, EPUB or MOBI?`,
    answer: `EPUB is better for nearly every modern reader. It is an open standard with full CSS, embedded fonts, and proper reflow, and it opens on Kobo, Apple Books, Google Play Books, and most e-readers. MOBI only matters for pre-2015 Kindles, and even Amazon has replaced it with AZW3.`,
  },
  {
    question: `Can Kobo read EPUB and MOBI?`,
    answer: `Kobo reads EPUB natively and that is its best format. MOBI is not Kobo's native format and sideloads poorly, so if you have a MOBI, convert it to EPUB first — see our [MOBI to Kobo guide](/blog/mobi-to-kobo).`,
  },
  {
    question: `Should I save my books as EPUB or MOBI?`,
    answer: `Save them as EPUB. It is open, portable, and converts cleanly to whatever a specific device needs (AZW3 for modern Kindles, KEPUB for Kobo). MOBI is a dead-end format you only produce when an old Kindle demands it.`,
  },
  {
    question: `Does converting EPUB to MOBI lose quality?`,
    answer: `Yes, some. MOBI cannot represent the full CSS, embedded fonts, and complex layouts that EPUB carries, so a conversion to MOBI flattens those. That is a limit of the MOBI format itself, not the conversion tool. For a modern Kindle, convert EPUB to AZW3 instead to keep the formatting.`,
  },
  {
    question: `Is MOBI still used by Amazon?`,
    answer: `Not for new books. Amazon moved Kindles to AZW3 (KF8) and removed MOBI from Send to Kindle in 2022. MOBI now survives mainly as a compatibility format for readers who still own pre-2015 Kindle hardware.`,
  },
  {
    question: `How do I convert between EPUB and MOBI?`,
    answer: `For one or two books, use a browser converter: [EPUB to MOBI](/convert/epub-to-mobi) for an old Kindle, or [MOBI to EPUB](/convert/mobi-to-epub) to free a legacy book. No desktop Calibre install is required for small batches.`,
  }
];
