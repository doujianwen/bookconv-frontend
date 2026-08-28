export const slug = 'lit-to-mobi';
export const title = 'Free LIT to MOBI Converter — No Sign-up';
export const metaDescription = 'Turn discontinued Microsoft Reader (LIT) books into Kindle-readable MOBI — free LIT to MOBI converter, no sign-up. Fast, private, DRM-free files only.';
export const level = 'B' as const;
export const wordCount = 2400;

export const content = {
  hero: {
    title: 'LIT to MOBI - Read Old Microsoft Reader Books on Kindle',
    subtitle: 'Free LIT to MOBI converter. No sign-up — turn discontinued Microsoft Reader (LIT) files into Kindle-readable MOBI in seconds.'
  },

  sections: [
    {
      heading: 'What is LIT Format?',
      body: `LIT was the native ebook format of Microsoft Reader, a reading app Microsoft shipped from 2000 until it was discontinued in 2012. If you bought ebooks from Fictionwise, Powells, or other early stores that catered to Pocket PC and Windows-based readers, there is a good chance they landed in your library as .lit files.

Technically LIT is a compressed HTML container: HTML pages, a small image set, and metadata wrapped in an OEBPS-style package. It reads closer to EPUB than to MOBI under the hood, which is good news for conversion.

The catch is rights management. Many commercial LIT files carried Microsoft's DRM, and those encrypted files cannot be opened or converted by any tool today — Microsoft retired the activation servers years ago. This converter works only on DRM-free LIT files: personal exports, public-domain titles, and books you created yourself.`
    },
    {
      heading: 'What is MOBI Format?',
      body: `MOBI is the format Amazon built the original Kindle around. It is a simple, widely compatible container that every Kindle ever made can open, including the 2007 original.

Its strengths are reach and simplicity: a MOBI file opens on virtually any e-ink device, old third-party readers, and most free reading apps. Its weakness is presentation — MOBI supports only a small subset of HTML and CSS, so advanced typography and embedded fonts are lost. For reading a novel on a Kindle, that trade-off is usually invisible.

Because every Kindle reads MOBI natively, it remains the safest universal target when you just want a book to open on the device in your hand.`
    },
    {
      heading: 'How to Convert LIT to MOBI',
      body: `**1. Upload your LIT file.** Drag it in or browse. Free accounts handle files up to 10MB, which covers essentially every LIT book — they are text-heavy and small.

**2. Conversion runs.** The LIT container is unpacked, its HTML is simplified to what MOBI's renderer understands, images are re-packaged, and the chapter structure is rebuilt. Most files finish in under 30 seconds.

**3. Download and sideload.** Connect your Kindle by USB, drop the .mobi into the documents folder, and eject safely. It appears on the home screen.

**DRM stops this cold.** If your LIT file was purchased with Microsoft Reader DRM, it cannot be decrypted — no converter can. Use this on DRM-free files only.`
    },
    {
      heading: 'When Do You Actually Need This?',
      body: `LIT is a dead format, so you only reach for this when old files resurface.

**You found a LIT book in an archive.** Early-2000s purchases, CD-ROM bundles, or backups from a long-gone reader app often sit as .lit. Converting them to MOBI makes them readable again.

**You want them on a Kindle.** MOBI is the one format every Kindle opens without fuss. If your goal is "read it on my Kindle," this is the direct route.

**You are consolidating a library.** Moving a scattered personal collection into one universal format is easier to back up and search than maintaining a folder of obsolete containers.

If your LIT files are already DRM-free and you just want to read them, converting is the simplest fix. If they carry Microsoft DRM, no tool can help — you would need to re-acquire the title from a current store.`
    },
    {
      heading: 'What Carries Over',
      body: `LIT and MOBI are close enough that most reading content survives cleanly.

**Fully preserved:**
- **The text** — every word, nothing truncated
- **Chapter structure** — headings map to MOBI chapters
- **Basic emphasis** — bold and italic
- **Images** — covers and inline pictures carry through
- **Metadata** — title and author

**Lost or simplified:**
- **Advanced CSS** — custom margins, colored text, and styled boxes flatten
- **Embedded fonts** — the device substitutes its built-ins
- **Complex tables** — simple tables survive; heavily styled ones may degrade

For a standard novel or document, the result reads exactly as intended on a Kindle.

Later want that MOBI portable beyond Kindle? [Convert MOBI to EPUB](/convert/mobi-to-epub) frees it for any reader.`
    }
  ],

  faq: [
    { q: 'Can I convert DRM-protected LIT files?', a: 'No. Microsoft Reader DRM depends on activation servers Microsoft shut down, so encrypted LIT files cannot be opened by any converter. This tool works only on DRM-free LIT files such as public-domain titles or books you created yourself.' },
    { q: 'Will my chapters and table of contents survive?', a: 'Yes. LIT stores its content as HTML with heading-based structure, and that maps directly to MOBI chapters. A standard novel keeps its chapter breaks and reading order intact.' },
    { q: 'Why convert LIT to MOBI instead of EPUB?', a: 'If your goal is reading on a Kindle, MOBI is the universal choice — every Kindle model opens it. EPUB is better for non-Kindle readers and preserves more styling, so choose EPUB if you read on Kobo, Apple Books, or a phone app instead.' },
    { q: 'How big are LIT files and will they fit?', a: 'LIT books are almost always well under 10MB since they are text with a few images. Free accounts handle files up to 10MB, so size is rarely a concern.' },
    { q: 'Can I email the MOBI to my Kindle?', a: 'Amazon removed MOBI support from Send to Kindle in 2022, so email delivery is rejected. Sideload it over USB by copying the file into the documents folder on your Kindle.' },
    { q: 'What if my LIT file will not upload?', a: 'A file that will not open is usually DRM-protected or truncated. Confirm it is a DRM-free .lit and that the download was not interrupted. DRM-protected files cannot be converted by any tool.' }
  ]
};
