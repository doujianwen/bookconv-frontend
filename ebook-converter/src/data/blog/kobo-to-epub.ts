export const slug = `kobo-to-epub`;
export const title = `How to Convert Kobo Books to EPUB and PDF`;
export const date = `2026-08-09`;
export const author = "BookConv Team";
export const tags = ["Kobo", "EPUB", "PDF", "KEPUB", "BookConv"];

export const content = {
  intro: `Kobo's own format is already EPUB under the hood (its tuned variant is called KEPUB), so "converting a Kobo book to EPUB" is often simpler than it sounds — or impossible, if the book is store-DRMed. This guide explains both cases and what you can actually do.`,
  sections: [
    {
      heading: `Kobo's Native Format Is Already EPUB`,
      body: `Kobo stores and reads **EPUB** (and its Kobo-tuned **KEPUB**). If you side-loaded a DRM-free EPUB or KEPUB onto your Kobo, that file is already EPUB — you can copy it off the device and open it anywhere. In that case there is nothing to convert; the book was EPUB all along.`
    },
    {
      heading: `DRMed Kobo Store Books`,
      body: `Books bought from the Kobo store are protected with Adobe DRM (or Kobo's own DRM). Those files cannot be opened outside the Kobo ecosystem and **cannot be converted by BookConv or any standard converter** — the DRM must be removed by the account that owns the book, which is outside what a converter does.

If you only want to read a Kobo purchase elsewhere, the realistic path is to re-buy or re-download the title from a store that sells DRM-free EPUB, then keep that EPUB as your master.`
    },
    {
      heading: `Side-loaded DRM-Free Books`,
      body: `For a DRM-free EPUB or KEPUB you put on your Kobo yourself, the book is portable:

- **To read on another device** — copy the EPUB off the Kobo; it opens in Apple Books, Google Play Books, or any EPUB reader.
- **To make a PDF** — convert the EPUB to PDF with [EPUB to PDF](/convert/epub-to-pdf); the layout becomes fixed.

No special "Kobo" step is needed because the source is already EPUB.`
    },
    {
      heading: `Convert Kobo EPUB to PDF`,
      body: `If a destination only accepts PDF (a printer, a submission system, a strict viewer), run the EPUB through [EPUB to PDF](/convert/epub-to-pdf). Expect a fixed-page result that no longer reflows — fine for printing, less ideal for screen reading.

If instead you are moving a book *to* a Kobo from another ecosystem, that is the reverse direction: see [MOBI to Kobo](/blog/mobi-to-kobo) and [MOBI to EPUB](/convert/mobi-to-epub).`
    },
    {
      heading: `Moving a Kobo Book to Another Ecosystem`,
      body: `The practical rules:

- **Kobo to other e-reader (non-Kindle)**: your EPUB leaves Kobo as EPUB; just open it.
- **Kobo to Kindle**: a DRM-free EPUB becomes AZW3; [convert EPUB to AZW3](/convert/epub-to-azw3). DRMed store books cannot make this jump.
- **Other device to Kobo**: keep EPUB; Kobo reads it natively.

The [Kindle Formats guide](/guide/kindle-formats) covers the Amazon side in detail.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Kobo's format is EPUB/KEPUB** — side-loaded DRM-free books are already EPUB.
- **DRM store books cannot be converted** — only the owning account can remove DRM.
- **To make a PDF**, convert the EPUB with [EPUB to PDF](/convert/epub-to-pdf).
- **To a Kindle**, a DRM-free EPUB becomes AZW3 via [EPUB to AZW3](/convert/epub-to-azw3).
- **Keep EPUB as the master** — Kobo and most readers read it natively.`
    }
  ]
};

export const faqs = [
  {
    question: `Are Kobo books EPUB?`,
    answer: `Yes. Kobo's native format is EPUB, and its Kobo-tuned variant KEPUB is EPUB underneath. A side-loaded DRM-free Kobo book is already an EPUB you can open on any EPUB reader.`
  },
  {
    question: `Can I convert a Kobo store book to EPUB?`,
    answer: `Not if it is DRM-protected. Kobo store purchases carry Adobe or Kobo DRM that standard converters cannot open. Only the account that owns the book can remove that DRM; a converter like BookConv works on DRM-free files only.`
  },
  {
    question: `How do I get my Kobo book onto another device?`,
    answer: `If the book is a DRM-free EPUB you side-loaded, copy it off the Kobo and open it in Apple Books, Google Play Books, or any EPUB reader. If it is a DRMed store purchase, you cannot move it out of the Kobo ecosystem.`
  },
  {
    question: `How do I make a PDF from a Kobo book?`,
    answer: `Take the DRM-free EPUB and convert it with EPUB to PDF. The result is a fixed-page PDF, good for printing or strict viewers but no longer reflowing like an EPUB.`
  },
  {
    question: `Can I put a Kobo book on a Kindle?`,
    answer: `Only if it is DRM-free EPUB — convert that EPUB to AZW3 for the Kindle. DRMed Kobo store books cannot be transferred to a Kindle by conversion.`
  },
  {
    question: `What format should I keep as my master?`,
    answer: `EPUB. Kobo reads it natively, most other readers open it, and it converts cleanly to AZW3 for Kindles or PDF when a destination demands it.`
  }
];
