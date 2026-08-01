export const slug = `lit-ebook-format`;
export const date = `2026-08-01`;
export const author = "BookConv Team";
export const title = `What Is the LIT Ebook Format? A Complete Guide`;
export const tags = ["LIT", "Microsoft Reader", "Ebook Formats", "EPUB", "BookConv", "Archiving"];

export const content = {
  intro: `LIT is the ebook format Microsoft built for its never-quite-successful Reader app. Microsoft killed the app in 2012, which left every LIT file stranded. This guide explains what LIT is, why it died, and the three ways you can still open one today.`,
  sections: [
    {
      heading: `What the LIT Format Is`,
      body: `LIT (short for **Literature**) is Microsoft Reader's native ebook format, launched in 2000 alongside the Reader app for Pocket PC and early Windows. A LIT file is, at its core, a compressed bundle of HTML and CSS — Microsoft's own variant of the CHM help-file container, wrapped with ebook-specific metadata.

Most LIT files you'll encounter also carry **DRM**, locked to a Microsoft account that no longer authorizes anything. That single fact is why so many old LIT books are unreadable today, even when the file itself is perfectly intact.`
    },
    {
      heading: `A Short History of LIT`,
      body: `Microsoft Reader arrived in 2000 with genuine ambition — ClearType text rendering, a built-in dictionary, and a clean reading experience for the time. For a few years it was a credible alternative to early Palm and Franklin e-readers.

It never caught on widely, and Microsoft announced the end of Microsoft Reader in **2011**, retiring it for good in **2012**. There was no successor app and no official migration tool. Every LIT file became a book trapped in a format with no current reader.`
    },
    {
      heading: `How a LIT File Is Built`,
      body: `Technically, LIT is an **OEBPS** (Open eBook Publication Structure) document — the same family of standards that led to EPUB — packed inside Microsoft's ITOLITER container. Inside you'll find:
- XHTML content for the book's text
- A CSS stylesheet for basic styling
- Images referenced by the markup
- Metadata such as title and author
- Optional DRM tied to Microsoft Passport (the ancestor of modern Microsoft accounts)

Because it's HTML-based, the text is recoverable in principle. The DRM is the part that usually isn't.`
    },
    {
      heading: `Can You Still Open a LIT File Today`,
      body: `Not with anything Microsoft ships. The Reader app doesn't run on current Windows, and the DRM activation servers are long gone. Your realistic options are third-party tools that ignore the format's branding and read the HTML underneath.

The two that work are Calibre (desktop) and an online converter like BookConv. Both unpack the container and rebuild the content as a modern format. The detailed walkthrough lives in our [guide to converting LIT to EPUB](/blog/why-convert-lit-to-epub).`
    },
    {
      heading: `How to Open LIT Without Converting`,
      body: `If you just want to read the book and don't care about the output format:
1. Install [Calibre](https://calibre-ebook.com/download) and open it.
2. Click **Add books** and select the LIT file.
3. Select the title and click **View** to read it in Calibre's built-in viewer.

That gets the text on screen, but it leaves you dependent on Calibre forever. For a book you want to keep, converting is the better end state.`
    },
    {
      heading: `Why Converting to EPUB Is the Smarter Move`,
      body: `EPUB is the open standard nearly every non-Kindle reader supports — Apple Books, Kobo, Nook, Google Play Books, and dozens of apps. Converting your LIT to EPUB does three things at once:
- Frees the book from Microsoft's dead ecosystem
- Makes it readable on any modern device
- Gives you a clean intermediate you can later turn into PDF, AZW3, or anything else

[Convert LIT to EPUB on BookConv](/convert/lit-to-epub) takes a single file in the browser, no install. For a whole library, [our longer guide explains the Calibre batch workflow](/blog/why-convert-lit-to-epub).`
    },
    {
      heading: `LIT vs the Formats That Replaced It`,
      body: `LIT lost because it was proprietary and abandoned. The formats that outlived it share one trait: an open spec.

- **EPUB** — open, reflowable, supported almost everywhere except Kindle
- **AZW3 / KF8** — Amazon's active format, the Kindle equivalent
- **PDF** — fixed layout, ideal for printing but not for reading

None of these are locked to a single vendor's account system, which is exactly why your LIT files are stuck and theirs aren't. For the full picture across formats, [our ebook formats comparison](/blog/ebook-formats-explained) breaks it down.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **LIT is Microsoft Reader's dead format** — launched in 2000, retired in 2012, with no successor.
- **It's HTML in a proprietary box** — an OEBPS document inside Microsoft's ITOLITER container, usually with DRM.
- **Nothing Microsoft ships opens it now** — the app won't run and the DRM servers are gone.
- **Calibre or an online converter is the fix** — both unpack the container and rebuild it as EPUB.
- **Convert to EPUB, don't just view** — a converted file is portable; a Calibre-only view keeps you locked to one tool.`
    },
    {
      heading: `Frequently Asked Questions`,
      body: `Q: What is a LIT file?
A: LIT (Literature) is Microsoft Reader's native ebook format from 2000. It's a compressed bundle of HTML and CSS wrapped in Microsoft's own container, usually with DRM attached.

Q: Can I still open LIT files on Windows 11?
A: Not with Microsoft's software — the Reader app was retired in 2012 and won't run on current Windows. You'll need Calibre or an online converter to read or convert the file.

Q: Is the LIT format still used?
A: No. Microsoft discontinued it in 2012 and nothing has adopted it since. Any LIT file you find today is a legacy book from the early 2000s.

Q: How do I convert LIT to a readable format?
A: Use Calibre (desktop, batch-capable) or an online tool like [BookConv's LIT to EPUB converter](/convert/lit-to-epub). Both unpack the container and rebuild it as EPUB.

Q: Will converting LIT to EPUB keep my book intact?
A: Text, chapters, and images carry over cleanly. Exact spacing and page breaks may shift because EPUB reflows. DRM-protected LIT files won't convert at all.

Q: Why did Microsoft kill the LIT format?
A: Microsoft Reader never gained meaningful market share, and Amazon's Kindle plus the open EPUB standard won the ebook war. Microsoft ended the app in 2012 with no successor.

Q: Is LIT the same as EPUB?
A: No, but they're cousins. LIT is HTML-based like EPUB, but wrapped in a proprietary Microsoft container with optional DRM. EPUB is an open standard with no vendor lock-in.`
    }
  ]
};
