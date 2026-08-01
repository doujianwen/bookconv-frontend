export const slug = `how-to-convert-epub-to-mobi-en`;
export const title = `EPUB to MOBI: A Step-by-Step Conversion Walkthrough for Kindle`;
export const date = `2026-07-12`;
export const author = "BookConv Team";
export const tags = ["EPUB", "MOBI", "Kindle", "conversion", "step-by-step"];

export const content = {
  intro: `Need to convert EPUB to MOBI for an older Kindle? The short version: clean up the EPUB, run it through a Calibre-based converter, sideload the result over USB, then check the table of contents before you trust it. This walkthrough covers each step and the checks that catch a bad conversion early.`,
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
      heading: `Step 1: Prepare the EPUB Before You Convert`,
      body: `Ten minutes of prep saves an hour of re-converting. Four things to check.

**Open the EPUB first.** If it won't open in a reader app, converting won't fix it — you'll just get a broken MOBI. Track down a fresh copy of the source instead.

**Check for DRM.** Books bought from most stores carry DRM, and no converter can read them. BookConv flags a DRM-protected file rather than producing a scrambled result. Titles from Project Gutenberg, Standard Ebooks and your own exports are DRM-free and convert without complaint.

**Look at the file size.** Free conversions handle files up to 10MB, which covers nearly every text-only novel. Illustrated books — comics, cookbooks, textbooks — run much larger and need a paid plan, where the ceiling rises to 50MB on Pro and 100MB on the API tier.

**Fix the metadata now.** The title and author fields inside the EPUB become what your Kindle shows on its home screen. If the file says "Unknown Author", your library will too. Calibre's metadata editor sorts this out in a couple of clicks, and it's far less annoying than renaming books on a six-inch screen later.`
    },
    {
      heading: `Step 2: Choose a Conversion Method`,
      body: `Three realistic options, and the right one depends on how many books you have.

### Online converter — fastest for a few books
Upload, wait, download. Nothing to install, works on a Chromebook or a phone, and BookConv runs the Calibre engine on the server so the output matches what desktop Calibre would produce. Best when you're converting one book or a small handful.

### Desktop Calibre — most control
[Calibre](https://calibre-ebook.com/) is free and open source. You get output profiles, CSS overrides, custom conversion rules and unlimited batch jobs. The trade-off is a crowded interface and a proper install. If you're migrating hundreds of books, this is the one.

### Send to Kindle — skip the conversion entirely
Amazon's [Send to Kindle](https://www.amazon.com/sendtokindle) now accepts EPUB and converts on Amazon's side. It won't take new MOBI uploads. If your Kindle is modern, this is usually easier than converting anything yourself.`
    },
    {
      heading: `Step 3: Run the Conversion`,
      body: `On BookConv the whole job is five steps:

1. Open the [EPUB to MOBI converter](/convert/epub-to-mobi)
2. Drag your EPUB onto the upload area, or click to browse for it
3. Check the detected title and author in the preview panel
4. Start the conversion — a Calibre job runs server-side
5. Download the MOBI once the progress bar completes

Most novels finish in well under a minute. Image-heavy files take longer, and any job that runs past the server's two-minute limit fails cleanly instead of hanging. If you hit that, shrink the source images or convert locally in Calibre where nothing times out.

A couple of practical notes. The free tier allows five conversions an hour and doesn't ask for a credit card. Download links are temporary and the converted file is removed once the link expires, so save it before you close the tab. If the download itself misbehaves, our [download troubleshooting checklist](/blog/download-troubleshooting) walks through the usual causes.`
    },
    {
      heading: `Step 4: Verify the MOBI Before You Trust It`,
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
      heading: `Key Takeaways`,
      body: `- **Legacy only** — convert to MOBI for pre-2012 Kindles you sideload to; otherwise AZW3 or EPUB is the better target
- **Prep pays** — a clean, DRM-free EPUB with correct metadata converts cleanly on the first attempt
- **Two good tools** — BookConv for speed, desktop Calibre for control and batches; both use the same engine
- **Verify every file** — table of contents, chapter breaks, images and special characters, before deleting the original
- **Save promptly** — download links expire and converted files are deleted from the server afterwards`
    },
    {
      heading: `Frequently Asked Questions`,
      body: `Q: Does converting EPUB to MOBI lose any content?
A: No text is lost. Words, paragraphs, bold and italic all survive the trip. What does get simplified is complex styling — multi-column layouts, custom fonts and fancy CSS, because MOBI's rendering engine predates most of that.

Q: Why won't my Kindle show the MOBI I just copied over?
A: Three usual suspects: the file landed in the root of the drive instead of the documents folder, the device needs a restart to re-index, or the source EPUB was damaged. Open the file in Kindle Previewer on a computer to work out which one it is.

Q: Can I convert a book I bought from a store?
A: Not if it carries DRM, and most store purchases do. Converters can't read those files at all. Buying DRM-free where possible — many indie publishers offer it — avoids the problem entirely.

Q: What's the biggest EPUB I can convert for free?
A: 10MB, which covers virtually every novel. Pro handles up to 50MB and the API plan up to 100MB, which is where illustrated books and textbooks usually land.

Q: MOBI or AZW3 for my Kindle?
A: AZW3 for anything made since 2012. It supports proper CSS, embedded fonts and better line breaking, so the reading experience is noticeably better. Save MOBI for genuinely old hardware.

Q: How long does a conversion take?
A: Seconds for a typical novel. Larger or image-heavy books take longer, and jobs that exceed the two-minute server limit fail rather than stall, so you'll know quickly either way.

Q: How do I convert a whole shelf of books at once?
A: Batch conversion is a paid feature here; desktop Calibre does unlimited batches for free. For five or ten books, running them one at a time through the [EPUB to MOBI tool](/convert/epub-to-mobi) is honestly faster than setting up anything else.`
    }
  ]
};
