export const slug = "why-convert-lit-to-epub"
export const title = 'Why Convert LIT to EPUB (And How to Do It on BookConv)';
export const date = '2026-07-12';
export const author = 'BookConv Team';
export const tags = ['LIT', 'EPUB', 'Microsoft Reader', 'BookConv', 'Ebook Conversion', 'Archiving'];

export const content = {
  intro: `LIT is Microsoft Reader's ebook format, and Microsoft shut that app down more than a decade ago. Converting LIT to EPUB is the only practical way to keep those books readable. You can do it online with BookConv in under a minute, or use Calibre if you need to batch hundreds of files at once.`,
  sections: [
    {
      heading: `What LIT Is, and Why It Stopped Working`,
      body: `LIT arrived with Microsoft Reader in 2000, back when reading a novel on a Pocket PC felt like the future. The format is essentially a compressed bundle of HTML and images wrapped in Microsoft's own container, frequently with DRM attached.

Microsoft announced the end of Microsoft Reader in 2011 and retired it for good in 2012. There was no successor app, no migration tool, and no official reader for modern Windows.

So a LIT file today is a book you own and can't open. It isn't corrupted or deleted. It's just locked inside a format nothing supports anymore.

**What you're dealing with technically:**
- A proprietary container holding HTML, CSS, and images
- Optional DRM tied to an account system that no longer authorizes anything
- Reader-specific extras like ClearType rendering that don't exist elsewhere
- Windows-only playback through software you can't legitimately install today

Before you plan anything, check whether your files came from a store. Purchased LIT books often carry DRM, and that changes what's possible.`
    },
    {
      heading: `What You Gain by Moving to EPUB`,
      body: `EPUB is the open standard that replaced formats like LIT across publishing. It's documented publicly, maintained publicly, and supported by nearly every reader that isn't a Kindle.

**Compatibility** — Apple Books, Kobo, Nook, Google Play Books, Thorium, Calibre's viewer, and plenty of phone apps open EPUB with no setup at all.

**Reflowable text** — raise the font size and the text re-wraps. LIT used its own pagination model built for small monochrome screens, and on a modern phone it shows.

**Longevity** — EPUB is a published [open specification](https://www.w3.org/TR/epub-33/), so the files stay readable even if a specific app dies. That's precisely the failure LIT taught everyone to avoid.

**Real navigation** — a well-built EPUB carries a navigation document, so chapter jumps, progress tracking, and search behave the way you'd expect.

And once a book is EPUB, it can become anything else. [Convert EPUB to AZW3](/convert/epub-to-azw3) if your actual reading happens on a Kindle.`
    },
    {
      heading: `Convert LIT to EPUB on BookConv`,
      body: `If you have a handful of LIT files and don't want to install anything, BookConv is the fastest route. The conversion uses the same Calibre engine as the desktop app, but runs in your browser.

### Upload the LIT file
Go to the [LIT to EPUB converter](/convert/lit-to-epub). Drag the file onto the upload area or click to browse. The uploader checks the file size immediately — free conversions accept up to 10MB, which covers almost every LIT novel.

### Check the preview
BookConv reads the metadata and shows the detected title and author before you start. LIT files often have messy metadata, so this is your chance to spot problems before they land in your library.

### Convert and download
Click **Convert**. The Calibre engine runs server-side, unpacks the LIT container, rebuilds the markup as EPUB, and packages the result. When the progress bar finishes, click the download button right away — the link is temporary and the file is removed from the server after it expires.

For a single book or a small rescue job, this is far less work than installing and learning Calibre.`
    },
    {
      heading: `Convert LIT to EPUB with Calibre (Batch Option)`,
      body: `Calibre is the standard desktop tool for this job, and it's free. It shines when you have dozens or hundreds of LIT files to rescue.

1. Install Calibre from the [official download page](https://calibre-ebook.com/download) and open it.
2. Click **Add books** and select your LIT files. A whole folder at once is fine.
3. Highlight the imported titles, then click **Convert books**.
4. Set the output format to **EPUB** using the dropdown in the top-right corner.
5. Open the **Metadata** panel and fix the title and author while you're in there. Old LIT metadata is usually a mess.
6. Click **OK** and wait. A typical novel finishes in seconds.

The converted file lands in Calibre's library folder, so use **Save to disk** to pull it out where you want it. The [Calibre conversion manual](https://manual.calibre-ebook.com/conversion.html) covers structure detection and styling options if a particular book comes out wrong.`
    },
    {
      heading: `What Survives the Conversion, and What Doesn't`,
      body: `Conversion isn't lossless. But LIT was never a rich format, so you lose less than you might fear.

**Usually preserved:**
- Full text and paragraph structure
- Chapter breaks and the table of contents
- Embedded images
- Basic italics, bold, and headings
- Core metadata such as title and author

**Often lost or changed:**
- Fine spacing and indentation, which sometimes needs a cleanup pass
- Footnote links, especially in older or sloppily built files
- Anything DRM-protected, which simply won't convert
- Bookmarks and highlights made inside Microsoft Reader

That last one catches people out. Annotations lived in the Reader app, not in the file, so there's nothing there to carry across.

Open the finished EPUB and skim the first chapter, the table of contents, and one image-heavy page. Two minutes of checking beats finding a broken book six months later.`
    },
    {
      heading: `When It's Worth Doing, and When to Skip It`,
      body: `Convert when the book matters and isn't easy to replace: out-of-print titles, old technical manuals, self-published work, family projects, anything you paid for once and can't buy again.

Skip it when the title is still sold as a clean commercial EPUB for pocket change. A properly produced modern file beats a converted one from 2004 every time.

If you do commit, batch the work. Calibre will chew through hundreds of files in a single job, and doing the whole folder once is far smarter than rediscovering the problem every couple of years.

Then back the results up somewhere sensible. The entire point of this exercise is not having to repeat it. If you're weighing EPUB against Kindle-native formats for your library, our [ebook formats comparison](/blog/ebook-formats-explained) lays out the differences.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **LIT is a dead format** — Microsoft retired the Reader app in 2012, and no current platform opens it.
- **EPUB is the replacement** — open standard, reflowable, and supported by nearly every non-Kindle reader.
- **BookConv handles small jobs fast** — upload, convert, download; no install, no account, powered by Calibre.
- **Calibre handles big libraries** — free, batch-capable, and it lets you fix broken metadata along the way.
- **DRM blocks conversion** — protected LIT files won't convert, and there's no legitimate workaround.
- **Always check the output** — skim a chapter and the table of contents before deleting the originals.`
    }
  ]
};

export const faqs = [
  {
    question: `Can I still install Microsoft Reader on Windows 11?`,
    answer: `No. Microsoft ended distribution in 2012 and the app doesn't run on current Windows. Even if you tracked down an installer, the activation service for DRM-protected books is long gone.`,
  },
  {
    question: `Is converting my own LIT books legal?`,
    answer: `Converting DRM-free files you own, for your own use, is generally fine. Removing DRM is a separate question and not something we support. Treat protected files as unreadable.`,
  },
  {
    question: `Can I convert LIT to EPUB without installing software?`,
    answer: `Yes. BookConv's [LIT to EPUB converter](/convert/lit-to-epub) runs the Calibre engine in the cloud, so you only need a browser.`,
  },
  {
    question: `Will the book look different after conversion?`,
    answer: `A little. Text, chapters, and images carry over cleanly, while exact spacing and page breaks may shift. EPUB reflows anyway, so fixed pagination was never going to survive the trip.`,
  },
  {
    question: `Can I convert an entire folder at once?`,
    answer: `Yes. Calibre's bulk conversion handles large batches in one run. Online tools generally work file by file, which is fine for a handful.`,
  },
  {
    question: `My converted EPUB has no table of contents. Now what?`,
    answer: `Run the conversion again with Calibre's structure detection pointed at your heading tags. The [Calibre documentation](https://manual.calibre-ebook.com/conversion.html) walks through the XPath settings involved.`,
  },
  {
    question: `Should I convert straight to a Kindle format instead?`,
    answer: `Go to EPUB first. It's the cleanest intermediate format and the better archival copy. Generate a Kindle file from it afterward if you need one.`,
  },
  {
    question: `How can I tell whether a LIT file has DRM?`,
    answer: `If conversion fails or produces an empty file, DRM is the usual culprit. Files shared freely by authors or public archives are typically clean.`,
  }
];
