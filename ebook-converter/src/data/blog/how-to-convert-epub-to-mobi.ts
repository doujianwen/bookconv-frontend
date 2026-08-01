export const slug = `how-to-convert-epub-to-mobi`;
export const title = `How to Convert EPUB to MOBI on BookConv (Step-by-Step)`;
export const date = `2026-07-12`;
export const author = "BookConv Team";
export const tags = ["EPUB", "MOBI", "Kindle", "BookConv", "step-by-step"];

export const content = {
  intro: `Want to convert EPUB to MOBI without installing anything? On BookConv the whole job takes under a minute: upload your EPUB, pick MOBI, let the Calibre engine run server-side, then download the file. This walkthrough covers the exact clicks, the checks that catch bad conversions early, and when MOBI is even the right target.`,
  sections: [
    {
      heading: `Do You Actually Need MOBI?`,
      body: `Probably only if you're sideloading to an older Kindle. It's worth confirming before you convert anything.

Kindles from 2012 onward handle AZW3, and current Kindle software reads EPUB directly. Amazon also stopped accepting MOBI through its Send to Kindle service in late 2022, so email delivery is no longer a reason to convert to MOBI.

MOBI still earns its place in three situations:

- **Older hardware** — Kindle Keyboard, Kindle 4 and Kindle Touch era devices that predate AZW3 support
- **USB sideloading** — MOBI files copied into the documents folder still open on most Kindles
- **Mixed libraries** — one format that works across a decade of Kindle hardware without thinking about it

If your device is a recent Paperwhite, Oasis, Scribe or base Kindle, [convert to AZW3 instead](/convert/epub-to-azw3). AZW3 supports real CSS, embedded fonts and better hyphenation, so the same book simply looks nicer.

Worth knowing why EPUB is the safer archive format: it's an open standard maintained by the [W3C](https://www.w3.org/TR/epub-33/), while MOBI is a retired Amazon format. Keep the EPUB, convert copies. For a wider comparison of the two, see our [EPUB to MOBI format guide](/blog/epub-to-mobi-guide).`
    },
    {
      heading: `Step 1: Prepare the EPUB Before Uploading`,
      body: `Ten minutes of prep saves an hour of re-converting. Four things to check.

**Open the EPUB first.** If it won't open in a reader app, converting won't fix it — you'll just get a broken MOBI. Track down a fresh copy of the source instead.

**Check for DRM.** Books bought from most stores carry DRM, and no converter can read them. BookConv flags a DRM-protected file rather than producing a scrambled result. Titles from Project Gutenberg, Standard Ebooks and your own exports are DRM-free and convert without complaint.

**Look at the file size.** Free conversions handle files up to 10MB, which covers nearly every text-only novel. Illustrated books — comics, cookbooks, textbooks — run much larger and need a paid plan, where the ceiling rises to 50MB on Pro and 100MB on the API tier.

**Fix the metadata now.** The title and author fields inside the EPUB become what your Kindle shows on its home screen. If the file says "Unknown Author", your library will too. Calibre's metadata editor sorts this out in a couple of clicks, and it's far less annoying than renaming books on a six-inch screen later.`
    },
    {
      heading: `Step 2: Convert on BookConv`,
      body: `BookConv runs the same [Calibre](https://calibre-ebook.com/) ebook-convert engine you'd use on a desktop, but on our servers, so nothing installs and nothing times out your laptop.

### Upload the EPUB
Open the [EPUB to MOBI converter](/convert/epub-to-mobi). Drag the file onto the upload area, or click to browse. The uploader checks the size immediately and rejects anything over your plan limit with a clear message, so you don't waste time waiting for a job that was never going to run.

### Check the preview
BookConv reads the EPUB metadata and shows you the detected title, author and cover before conversion starts. If the metadata is wrong, stop and fix it in Calibre first — the output can only be as clean as the input.

### Start the conversion
Click **Convert**. Your file joins a server-side job queue, and the page shows a progress bar while the Calibre engine unpacks the EPUB, rewrites the markup for MOBI, re-encodes images and repackages everything. Most novels finish in seconds; image-heavy books take longer.

### Download the result
When the bar completes, the download button appears. Click it immediately — the generated file is served from a temporary link and is removed from the server once the link expires. If the download doesn't start, the [download troubleshooting guide](/blog/download-troubleshooting) walks through the usual browser blockers.

The free tier gives you five conversions per hour with no account required, which is plenty for a small library migration.`
    },
    {
      heading: `Step 3: Verify the MOBI Before You Trust It`,
      body: `A file appearing in your Downloads folder isn't proof the conversion worked. Two minutes of checking is worth it.

**Open it on a computer first.** Calibre's built-in viewer or Amazon's Kindle Previewer renders MOBI much the way a device does, and it's far quicker than copying to hardware and back.

**Then check these four things:**

- **Table of contents** — chapters listed and clickable, not one long blob
- **Chapter breaks** — each chapter starts on a fresh page rather than mid-screen
- **Images** — cover and inline figures render properly, not as grey boxes
- **Special characters** — em dashes, accents and curly quotes look right, not like question marks

**Now sideload it.** Connect the Kindle by USB, copy the MOBI into the documents folder, and eject the device safely rather than pulling the cable. The book should appear on the home screen; if it doesn't, restart the Kindle so it re-indexes, and rename the file to plain letters and numbers if it contains unusual characters.

When formatting looks wrong, the cause is nearly always in the source EPUB rather than the converter. Tidy the EPUB in Calibre, then convert again — same input, same output, every time.`
    },
    {
      heading: `When to Use Desktop Calibre Instead`,
      body: `BookConv is fastest for one-off conversions and jobs on computers where you can't install software. Desktop Calibre wins when you need more control.

Use Calibre directly for:

- **Hundreds of books at once** — batch conversion with custom output profiles
- **Fine styling control** — CSS overrides, custom fonts and per-device profiles
- **Broken sources** — structure detection, XPath-based TOC fixing and metadata repair
- **Offline work** — no upload, no queue, no network dependency

Both tools use the same conversion engine, so the output quality is identical. The difference is convenience versus control.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Legacy only** — convert to MOBI for pre-2012 Kindles you sideload to; otherwise AZW3 or EPUB is the better target
- **Prep pays** — a clean, DRM-free EPUB with correct metadata converts cleanly on the first attempt
- **BookConv is the fastest path** — upload, click Convert, download; the Calibre engine runs server-side with nothing to install
- **Watch the limits** — 10MB free, 50MB Pro, 100MB API; five conversions per hour on the free tier
- **Verify every file** — table of contents, chapter breaks, images and special characters, before deleting the original
- **Save promptly** — download links expire and converted files are deleted from the server afterwards`
    },
    {
      heading: `Frequently Asked Questions`,
      body: `Q: Does BookConv really use the same engine as Calibre?
A: Yes. The conversion is powered by Calibre's ebook-convert binary running on our servers. The output matches what desktop Calibre would produce for the same input.

Q: Does converting EPUB to MOBI lose any content?
A: No text is lost. Words, paragraphs, bold and italic all survive the trip. What does get simplified is complex styling — multi-column layouts, custom fonts and fancy CSS, because MOBI's rendering engine predates most of that.

Q: Why won't my Kindle show the MOBI I just copied over?
A: Three usual suspects: the file landed in the root of the drive instead of the documents folder, the device needs a restart to re-index, or the source EPUB was damaged. Open the file in Kindle Previewer on a computer to work out which one it is.

Q: Can I convert a book I bought from a store?
A: Not if it carries DRM, and most store purchases do. Converters can't read those files at all. Buying DRM-free where possible — many indie publishers offer it — avoids the problem entirely.

Q: What's the biggest EPUB I can convert for free?
A: 10MB, which covers virtually every novel. Pro handles up to 50MB and the API plan up to 100MB, which is where illustrated books and textbooks usually land.

Q: MOBI or AZW3 for my Kindle?
A: AZW3 for anything made since 2012. It supports proper CSS, embedded fonts and better line breaking, so the reading experience is noticeably better. Save MOBI for genuinely old hardware.

Q: How long does a conversion take on BookConv?
A: Seconds for a typical novel. Larger or image-heavy books take longer, and jobs that exceed the server's two-minute limit fail rather than stall, so you'll know quickly either way.

Q: How do I convert a whole shelf of books at once?
A: For large libraries, desktop Calibre is the better tool — it does unlimited batches for free. For five or ten books, running them one at a time through the [EPUB to MOBI tool](/convert/epub-to-mobi) is honestly faster than setting up anything else.`
    }
  ]
};
