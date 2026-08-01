export const slug = `epub-to-mobi-guide`;
export const title = `How to Convert EPUB to MOBI for Kindle: The Definitive Guide`;
export const date = `2026-07-30`;
export const author = "BookConv Team";
export const tags = ["EPUB", "MOBI", "Kindle", "conversion", "guide"];

export const content = {
  intro: `Most people who want to convert EPUB to MOBI don't actually need MOBI anymore, and the ones who do have a very specific reason. This guide shows you which camp you're in, how to run the conversion properly, and how to fix the covers, metadata, and table-of-contents problems that ruin most attempts.`,
  sections: [
    {
      heading: `Do You Actually Need MOBI Anymore?`,
      body: `Start here, because the answer saves most readers a step. If your Kindle was made after roughly 2015, you don't need MOBI at all. Send the EPUB straight to the device and Amazon handles the rest.

MOBI came out of Mobipocket, a French company Amazon bought in 2007. Amazon built the early Kindle ecosystem on it, then moved on: KF8 (the format inside AZW3 files) replaced plain MOBI for anything with real styling, and in August 2022 Amazon stopped accepting MOBI files through Send to Kindle entirely. Meanwhile EPUB became the format Amazon *does* accept.

So MOBI is now a legacy target. You still want it in a few real cases:

- **Pre-2015 Kindle hardware** such as the Kindle Keyboard, Kindle 4, Kindle Touch, and early Paperwhite units that you sideload over USB
- **Offline sideloading** where you have no Wi-Fi or no email access to the device
- **Archival copies** of a library you already keep in MOBI and want to stay consistent
- **Old third-party readers** that were built around Mobipocket and never added EPUB support

If none of those apply, skip to the Send to Kindle section below. If one does, the Calibre method is next.

For a plainer walkthrough aimed at first-timers, we also have a shorter [step-by-step EPUB to MOBI tutorial](/blog/how-to-convert-epub-to-mobi-en). And if you're still deciding which format to standardise on, [ebook formats explained](/blog/ebook-formats-explained-en) covers the trade-offs.`
    },
    {
      heading: `Converting EPUB to MOBI With Calibre, Step by Step`,
      body: `Calibre is free, runs on Windows, macOS, and Linux, and gives you more control than any web tool. It's the reference implementation most other converters copy.

1. Install Calibre from the official site and open it.
2. Click **Add books** and pick your EPUB, or just drag the file into the library window.
3. Select the book in the list, then click **Convert books**.
4. In the top-right dropdown, set **Output format** to MOBI. Input format should already read EPUB.
5. Open the **MOBI Output** panel on the left. Set **MOBI file type** to *old* if you're targeting a pre-2015 Kindle — the *both* and *new* options embed KF8 data that old firmware chokes on.
6. Open **Metadata** and confirm the title, author, and cover are correct before you convert, not after.
7. Click **OK**. Watch the jobs counter in the bottom-right corner; when it hits zero, the MOBI is ready.
8. Right-click the book, choose **Save to disk**, or connect your Kindle over USB and use **Send to device**.

### Settings worth changing

Two options in the **Look & feel** panel matter more than the rest. **Remove spacing between paragraphs** fixes EPUBs that were built with CSS margins the old MOBI renderer ignores. **Base font size** is worth setting to 0 so the Kindle's own font controls stay in charge.

Under **Structure detection**, leave the defaults alone unless your chapters aren't splitting. The full option reference lives in the [Calibre conversion documentation](https://manual.calibre-ebook.com/conversion.html), which is genuinely well written.

If you'd rather not install anything, our [EPUB to MOBI converter](/convert/epub-to-mobi) runs the same conversion in the browser. For newer Kindles that support KF8 styling, [EPUB to AZW3](/convert/epub-to-azw3) is the better target.`
    },
    {
      heading: `The Faster Route: Send to Kindle Accepts EPUB Directly`,
      body: `Here's the part that makes most conversions unnecessary. Amazon's Send to Kindle service takes EPUB files and converts them on Amazon's servers into KF8, using the same pipeline that handles Kindle Store books.

You've got three ways in:

- **Email** — send the EPUB as an attachment to your device's @kindle.com address from an approved sender address
- **Web** — drag the file into the Send to Kindle page in a browser
- **App** — the desktop and mobile Send to Kindle apps take drag-and-drop

Amazon's conversion is usually cleaner than a local one, because it's the same engine that renders commercial titles. You get working X-Ray-style navigation, correct chapter breaks, and Whispersync position tracking across devices. A locally converted MOBI often won't sync at all.

The catch: you need an Amazon account, an internet connection, and a device registered to that account. Files also land in your Kindle library rather than staying purely local, which some people don't want. Amazon's own [Send to Kindle help page](https://www.amazon.com/sendtokindle) lists the current file size limits and supported types.

Rule of thumb — modern Kindle, use Send to Kindle. Old Kindle or no account, convert to MOBI yourself.`
    },
    {
      heading: `Keeping Covers, Metadata, and the Table of Contents Intact`,
      body: `Conversions rarely fail outright. They fail quietly, and you notice three weeks later when your library is a wall of grey placeholder tiles.

### Covers

MOBI stores the cover as a specially flagged image inside the file, not as a separate asset. If the source EPUB references its cover only through an OPF manifest entry and no guide reference, some converters drop it. In Calibre, open the metadata editor before converting and make sure a cover thumbnail is actually showing. If it isn't, click **Download cover** or point it at a JPEG yourself. A 1600x2560 pixel JPEG is a safe size.

### Metadata

Title and author are what your Kindle sorts by, so fix them at the source. Series information is trickier — MOBI has no native series field, and Calibre fakes it by writing the series name into the title. That's fine for a personal library, confusing if you share files.

### Table of contents

Kindles use two separate navigation systems: the inline TOC page you can tap into, and the NCX index the Go To menu reads. An EPUB with only an HTML contents page and no proper nav document will convert into a MOBI with a dead Go To menu.

Calibre can rebuild the NCX from your heading structure. Under **Table of Contents**, set **Level 1 TOC** to an XPath expression like //h:h1 and Calibre will index every H1 as a chapter. Tick **Force use of auto-generated Table of Contents** only when the existing one is broken, since it overwrites a good TOC just as happily as a bad one.

The underlying structure comes from the source file, which is why a well-built EPUB converts well and a sloppy one doesn't. The [W3C EPUB 3 specification](https://www.w3.org/TR/epub-33/) defines what that nav document should look like.`
    },
    {
      heading: `Fixing the Errors That Ruin Most Conversions`,
      body: `Four problems account for nearly every failed EPUB to MOBI conversion.

### Garbled or boxed-out text

Almost always an encoding problem. The source EPUB declares one character set and actually uses another, so accented characters and smart quotes turn into question marks or black diamonds. Fix it by opening the EPUB in Calibre's editor and checking that every XHTML file declares UTF-8. Non-Latin scripts need an embedded font too — old Kindle firmware ships with limited glyph coverage, and no conversion setting invents characters the device can't draw.

### Missing cover on the device

If the cover looks right in Calibre but not on the Kindle, the device cached the old thumbnail. Delete the book from the Kindle, then delete the matching folder in the hidden system thumbnail cache, then re-sideload. Annoying, but it's a caching bug, not a conversion bug.

### Broken or empty table of contents

Covered above — rebuild the NCX with an XPath rule. If chapters run together into one giant page, your EPUB is probably a single XHTML file. Set **Split on** to the same heading tag in the Structure detection panel.

### Wildly wrong formatting

Justified text collapsing, images overflowing the screen, indents everywhere. Old MOBI supports a small subset of CSS and drops the rest. Tick **Filter style information** or run the conversion through AZW3 instead, which handles modern CSS properly. This is the clearest sign you should stop fighting MOBI and use a format the device was designed for.

Going the other direction? Our [MOBI to EPUB converter](/convert/mobi-to-epub) handles DRM-free MOBI files if you're migrating an old library to something more portable.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Check your Kindle first.** Anything made after about 2015 reads EPUB through Send to Kindle, so MOBI conversion is usually wasted effort.
- **MOBI is legacy.** Amazon stopped accepting it through Send to Kindle in August 2022 and moved to KF8 inside AZW3 files years before that.
- **Calibre is the tool** for genuinely old hardware. Set MOBI file type to *old*, verify metadata before converting, and rebuild the NCX if the TOC is broken.
- **Fix problems at the source.** Bad encoding, missing nav documents, and absent covers come from the EPUB, and no output setting repairs them after the fact.
- **Use AZW3 for modern Kindles** if you insist on sideloading a converted file, since it supports current CSS and MOBI doesn't.`
    },
    {
      heading: `Frequently Asked Questions`,
      body: `Q: Does my Kindle still support MOBI files?
A: If it's a physical Kindle, yes — sideloading a MOBI over USB still works on virtually every model. What changed is Send to Kindle, which stopped accepting MOBI uploads in August 2022. So you can put MOBI on the device by cable, but you can't email it there.

Q: What's the difference between MOBI and AZW3?
A: AZW3 contains KF8, the newer Kindle format. It supports modern CSS, embedded fonts, proper tables, and fixed-layout content. Plain MOBI supports a much smaller subset and dates back to Mobipocket. For any Kindle from the last decade, AZW3 gives noticeably better results.

Q: Will converting EPUB to MOBI lose my highlights and notes?
A: Yes. Annotations live in the device's own database and are tied to a specific file, so a converted copy is a new book as far as the Kindle is concerned. Export existing notes before you replace the file.

Q: Why does my converted book show no cover on the Kindle?
A: Two likely causes. Either the cover wasn't embedded during conversion — check the metadata editor showed a thumbnail — or the Kindle cached the old placeholder. Removing the book and re-adding it clears the second one.

Q: Can I convert DRM-protected EPUB files to MOBI?
A: No. DRM-protected files are encrypted and no converter can open them. That includes files from library lending services and most retail stores. You can only convert books you own DRM-free.

Q: Is Calibre or an online converter better?
A: Calibre if you need fine control over TOC structure, CSS filtering, or batch jobs. An online tool if you have one file and don't want a desktop install. Both use similar underlying logic, so a clean EPUB converts about the same either way.

Q: My converted MOBI has no page numbers. Why?
A: MOBI uses location markers rather than pages, because reflowable text has no fixed page boundaries. Real page numbers only appear on Kindle Store books where Amazon has mapped them to a print edition, and conversion can't add that mapping.`
    }
  ]
};
