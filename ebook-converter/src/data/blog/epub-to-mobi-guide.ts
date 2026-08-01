export const slug = `epub-to-mobi-guide`;
export const title = `How to Convert EPUB to MOBI Online: The BookConv Guide`;
export const date = `2026-07-30`;
export const author = "BookConv Team";
export const tags = ["EPUB", "MOBI", "Kindle", "BookConv", "conversion", "guide"];

export const content = {
  intro: `Upload your EPUB and convert it to MOBI on BookConv in seconds — no Calibre install, no account, no settings to guess at. This guide shows you how to run the conversion cleanly, whether you even need MOBI in 2026, and how to fix the cover, metadata, and table-of-contents problems that quietly ruin most attempts.`,
  sections: [
    {
      heading: `Convert EPUB to MOBI on BookConv in Three Steps`,
      body: `Start here. Most people are done in under a minute.

1. Open the [EPUB to MOBI converter](/convert/epub-to-mobi) and drop your file onto the upload area.
2. Check the metadata preview. BookConv reads the title, author, and cover out of the EPUB and shows them to you *before* anything is converted, so you catch a wrong author or a missing cover while it's still cheap to fix.
3. Hit convert and watch the progress bar. When it finishes, your MOBI download link appears.

That's the whole flow. There's nothing to install, and it runs the same server-side Calibre engine that desktop users run locally — you just don't have to manage it.

### What the free tier gives you

- **10 MB per file** — comfortably more than a text-heavy novel, which usually lands between 300 KB and 3 MB
- **5 conversions per hour** — enough for a small batch in one sitting
- **No account** — no email, no signup wall, no confirmation link

If you're converting a big illustrated book or a photography-heavy title, Pro raises the per-file ceiling to 50 MB and the API to 100 MB.

### Two things to know before you upload

Download links are **temporary**. Files get deleted after a period, so save the MOBI to your device or your Kindle right away rather than bookmarking the link and coming back tomorrow. If a link has already expired, our [download troubleshooting notes](/blog/download-troubleshooting) cover what to do.

**DRM-protected files are rejected at upload.** That's not a limitation we can tune around — DRM encrypts the book's contents, and no converter can read encrypted text. Library loans and most retail purchases fall into this category. Books you own DRM-free convert fine.`
    },
    {
      heading: `Do You Actually Still Need MOBI?`,
      body: `Worth two minutes of thought, because the answer saves some readers a step entirely.

MOBI came out of Mobipocket, a French company Amazon bought in 2007. Amazon built the early Kindle ecosystem on it, then moved on. KF8 — the format inside AZW3 files — replaced plain MOBI for anything with real styling, and in August 2022 Amazon stopped accepting MOBI through Send to Kindle. EPUB is what Amazon takes now.

So MOBI is a legacy target. It's still the right one in these cases:

- **Pre-2015 Kindle hardware** like the Kindle Keyboard, Kindle 4, Kindle Touch, and early Paperwhite units you sideload over USB
- **Offline sideloading** where there's no Wi-Fi and no email path to the device
- **Archival consistency** if your existing library is already MOBI and you want it to stay that way
- **Old third-party readers** built around Mobipocket that never added EPUB support

If your Kindle is newer than that and you're sideloading anyway, [convert to AZW3 instead](/convert/epub-to-azw3). AZW3 carries KF8, which means current CSS, embedded fonts, and real tables. MOBI drops most of that.

Still deciding what to standardise your library on? [Ebook formats explained](/blog/ebook-formats-explained-en) walks through the trade-offs without the marketing.`
    },
    {
      heading: `Send to Kindle Takes EPUB Now — Here's When to Use It Instead`,
      body: `Amazon's Send to Kindle service accepts EPUB files directly and converts them on Amazon's servers into KF8, using the same pipeline that handles Kindle Store books. Three ways in: email the file to your device's kindle.com address from an approved sender, drag it into the Send to Kindle web page, or use the desktop or mobile app.

The upside is real. You get Whispersync position tracking across devices, correct chapter breaks, and the same rendering commercial titles get. A sideloaded MOBI usually won't sync at all.

The catch is also real. You need an Amazon account, an internet connection, and a registered device, and the file lands in your Amazon library rather than staying local. Some people specifically don't want that. Amazon's [Send to Kindle help page](https://www.amazon.com/sendtokindle) lists the current size limits and accepted types.

Simple rule: modern Kindle and you're fine with Amazon holding the file, use Send to Kindle. Old hardware, no account, or you want the file to stay yours — convert on BookConv and sideload over USB.`
    },
    {
      heading: `Keeping Covers, Metadata, and the Table of Contents Intact`,
      body: `Conversions rarely fail loudly. They fail quietly, and you notice three weeks later when your library is a wall of grey placeholder tiles.

### Covers

MOBI stores the cover as a specially flagged image inside the file, not as a separate asset. If the source EPUB points at its cover only through an OPF manifest entry with no guide reference, converters can drop it. This is exactly why BookConv shows you a metadata preview before converting — if no cover thumbnail appears there, the EPUB itself is missing a proper cover reference, and the MOBI will inherit that gap. Fix the source, then re-upload.

### Metadata

Title and author are what your Kindle sorts by, so they matter more than they look. Series information is trickier: MOBI has no native series field, and converters fake it by folding the series name into the title. Fine for a personal shelf, confusing if you share files with anyone.

### Table of contents

Kindles use two separate navigation systems — the inline contents page you tap into, and the NCX index behind the Go To menu. An EPUB carrying only an HTML contents page, with no proper nav document, converts into a MOBI with a dead Go To menu.

The structure comes from the source file. A well-built EPUB converts well and a sloppy one doesn't, which is less satisfying than a magic setting but it's the truth. The [W3C EPUB 3 specification](https://www.w3.org/TR/epub-33/) defines what that nav document should contain, and it's a useful reference if you're checking why a file is broken.`
    },
    {
      heading: `Fixing the Errors That Ruin Most Conversions`,
      body: `Four problems account for nearly every bad EPUB to MOBI result.

### Garbled or boxed-out text

Almost always encoding. The source EPUB declares one character set and actually uses another, so accented characters and smart quotes come out as question marks or black diamonds. Non-Latin scripts have a second problem: old Kindle firmware ships with limited glyph coverage and needs an embedded font. No conversion setting invents characters a device can't draw.

### Missing cover on the device

If the cover looked right in the metadata preview but not on the Kindle, the device cached the old thumbnail. Delete the book from the Kindle, clear the matching folder in the hidden system thumbnail cache, then re-sideload. It's a caching bug, not a conversion bug.

### Broken or empty table of contents

If chapters run together into one endless page, your EPUB is probably a single XHTML file with no split points. There's nothing on the output side to fix — the source has no chapter boundaries to find.

### Wildly wrong formatting

Justified text collapsing, images overflowing, stray indents. Old MOBI supports a small slice of CSS and drops the rest. This is the clearest signal to stop fighting MOBI and use [EPUB to AZW3](/convert/epub-to-azw3) instead, assuming your device can read it.

### When to fall back to desktop Calibre

BookConv covers the normal path. Desktop Calibre is still worth installing for genuine edge cases: rewriting a broken NCX with a custom XPath rule, running search-and-replace across a file, filtering style information selectively, or batch-converting a few hundred books at once. The [Calibre conversion documentation](https://manual.calibre-ebook.com/conversion.html) is genuinely well written if you get there.

One more note on speed: large or slow files go through a background worker queue rather than blocking your browser. The progress bar keeps updating, so a slow conversion looks slow rather than looking broken. There's more on how that works in our [background workers write-up](/blog/background-workers).

Migrating an old library the other direction? [MOBI to EPUB](/convert/mobi-to-epub) handles DRM-free MOBI files.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **BookConv is the fast path.** Upload, check the metadata preview, convert, download — no install, no account, 10 MB and 5 conversions an hour on the free tier.
- **Save your file immediately.** Download links are temporary and converted files are deleted after a period, so don't treat a link as storage.
- **Check your Kindle first.** Anything made after roughly 2015 reads EPUB through Send to Kindle, which makes MOBI conversion unnecessary for a lot of people.
- **MOBI is legacy.** Amazon stopped accepting it through Send to Kindle in August 2022, and AZW3 is the better sideload target for any modern device.
- **Fix problems at the source.** Bad encoding, missing nav documents, and absent covers live in the EPUB, and no output setting repairs them after the fact.`
    },
    {
      heading: `Frequently Asked Questions`,
      body: `Q: Do I need an account to convert EPUB to MOBI on BookConv?
A: No. The free tier needs no signup at all — 10 MB per file and 5 conversions per hour. Pro raises the per-file limit to 50 MB and the API to 100 MB if you're working with bigger illustrated books.

Q: How long does the download link stay active?
A: Not indefinitely. Links are temporary and converted files are deleted after a period, so download the MOBI as soon as the progress bar completes rather than saving the link for later.

Q: Why was my file rejected on upload?
A: Two usual causes. Either it's DRM-protected, which we detect and reject because encrypted content can't be read by any converter, or it's over your tier's size limit — 10 MB free, 50 MB Pro.

Q: Does my Kindle still support MOBI files?
A: On physical Kindles, yes — sideloading a MOBI over USB still works on virtually every model. What changed is Send to Kindle, which stopped accepting MOBI uploads in August 2022. You can cable it across, you just can't email it.

Q: What's the difference between MOBI and AZW3?
A: AZW3 contains KF8, the newer Kindle format, with modern CSS, embedded fonts, proper tables, and fixed-layout support. Plain MOBI handles a much smaller subset and dates back to Mobipocket. For any Kindle from the last decade, AZW3 looks noticeably better.

Q: Will converting EPUB to MOBI lose my highlights and notes?
A: Yes. Annotations live in the device's own database and are tied to a specific file, so a converted copy counts as a new book. Export your notes before replacing anything.

Q: Why does my converted MOBI have no page numbers?
A: MOBI uses location markers instead, because reflowable text has no fixed page boundaries. Real page numbers only appear on Kindle Store books where Amazon has mapped them to a print edition, and no conversion can add that mapping.`
    }
  ]
};
