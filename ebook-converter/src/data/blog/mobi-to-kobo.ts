export const slug = `mobi-to-kobo`;
export const title = `MOBI to Kobo: How to Read Your MOBI Books on a Kobo Reader`;
export const date = `2026-08-09`;
export const author = "BookConv Team";
export const tags = ["Kobo", "MOBI", "EPUB", "Ebook Formats", "BookConv"];

export const content = {
  intro: `If you just bought a Kobo and you have a shelf of old MOBI files, the first question is simple: will they even open? The short answer is that Kobo's native, best-supported format is EPUB, not MOBI. MOBI is Amazon's legacy format, and while some Kobo firmware will limp through a MOBI sideload, the clean result everyone wants comes from converting MOBI to EPUB first. This guide shows you the fast, no-install way to do it and get your books onto your Kobo.`,
  sections: [
    {
      heading: `Does Kobo Read MOBI?`,
      body: `Kobo's open, first-class format is **EPUB** (and its Kobo-tuned variant KEPUB). That is what Kobo's store, its sync, and its reading engine are built around. MOBI sits outside that world — it is the format Amazon used for older Kindles, and Kobo never adopted it as a primary format.

When you drop a .mobi onto a Kobo, one of two things happens: it either refuses to show up in your library, or it opens with flattened styling and no embedded fonts. Neither is the experience you paid for. The reliable move is to turn the MOBI into an EPUB before it ever touches the device.`
    },
    {
      heading: `Why EPUB Is the Right Target for Kobo`,
      body: `EPUB is an open standard, so every Kobo reads it natively with full styling, reflowable text, and proper chapter navigation. After conversion you get:

- **Real reflow** — text adapts to your font size and screen, not a frozen page image
- **Embedded fonts and CSS** — the book looks the way the publisher intended
- **Working table of contents** — tap a chapter and jump, no scrolling through one long scroll
- **KEPUB friendliness** — Kobo's own format is EPUB under the hood, so an EPUB converts cleanly if you want KEPUB later

In short, EPUB is what your Kobo expects. [Convert MOBI to EPUB](/convert/mobi-to-epub) and the file behaves like it was born on the device.`
    },
    {
      heading: `Step-by-Step: MOBI to EPUB for Kobo`,
      body: `You do not need Calibre on your desktop for one or two books. A browser converter handles it in a minute.

1. **Export the MOBI** from wherever it lives — Calibre's library, an old Kindle download, or a backup folder.
2. **Open the converter** and upload the .mobi file. [Do it on BookConv](/convert/mobi-to-epub) with no account and no install.
3. **Pick EPUB** as the output format and start the conversion.
4. **Download the EPUB** — it lands as a normal file on your computer.
5. **Sideload to Kobo** — connect over USB and drop the EPUB into the Kobo eReader/Books folder, or email it to your Kobo's Dropbox-connected address. Eject and the book appears in your library.

That is the whole process. No software to install, no account to create.`
    },
    {
      heading: `Kobo vs Kindle: A Format Note`,
      body: `If you are moving a library *between* ecosystems, the direction matters:

- **Kindle → Kobo**: your MOBI or AZW3 files become EPUB. [Convert MOBI to EPUB](/convert/mobi-to-epub) is the workhorse here.
- **Kobo → Kindle**: flip it the other way — an EPUB becomes AZW3 or MOBI for an older Kindle. See our [AZW3 vs MOBI breakdown](/blog/azw3-vs-mobi) and the [Kindle Formats guide](/guide/kindle-formats) for the device-by-device call.

The common thread is EPUB as the neutral, portable format. Keep your master copies as EPUB and you can feed almost any reader from one source file.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Kobo's native format is EPUB**, not MOBI — convert first for the clean result.
- **MOBI sideloads poorly** on Kobo: missing fonts, broken TOC, or no show at all.
- **MOBI to EPUB takes about a minute** in a browser converter, no Calibre install required.
- **EPUB is the portable master** — keep your books as EPUB and feed any reader from one file.
- **Cross-ecosystem moves** run through EPUB: Kindle→Kobo is MOBI→EPUB, Kobo→Kindle is EPUB→AZW3.`
    }
  ]
};

export const faqs = [
  {
    question: `Can Kobo read MOBI files directly?`,
    answer: `Kobo's native format is EPUB, and MOBI is Amazon's legacy format. Some Kobo firmware will open a MOBI with limited styling, but the reliable, clean result comes from converting MOBI to EPUB first. EPUB gives you proper reflow, embedded fonts, and a working table of contents on Kobo.`,
  },
  {
    question: `What format should I use for Kobo?`,
    answer: `EPUB (or Kobo's KEPUB, which is EPUB-based). It is the open standard Kobo's reading engine is built around, so it preserves formatting and navigation better than any other format you can sideload.`,
  },
  {
    question: `How do I convert MOBI to EPUB for my Kobo?`,
    answer: `Export the .mobi, upload it to a browser converter like BookConv, choose EPUB as the target, download the result, and sideload it over USB or through your Kobo's connected email address. No desktop software is required for a few books.`,
  },
  {
    question: `Will my MOBI's chapters and fonts survive the conversion?`,
    answer: `Yes — converting to EPUB actually restores what MOBI lacks on Kobo. You get a real table of contents and embedded fonts in the EPUB output, which is why EPUB is the recommended target rather than sideloading the MOBI as-is.`,
  },
  {
    question: `I'm moving from Kindle to Kobo. What do I convert?`,
    answer: `Your Kindle MOBI or AZW3 files become EPUB for Kobo. Run them through [MOBI to EPUB](/convert/mobi-to-epub). If you ever go the other direction, convert EPUB to AZW3 for a modern Kindle — see our [Kindle Formats guide](/guide/kindle-formats).`,
  }
];
