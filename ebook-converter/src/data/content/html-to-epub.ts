export const slug = 'html-to-epub';
export const title = 'Free HTML to EPUB Converter — No Sign-up';
export const level = 'A' as const;
export const wordCount = 2500;

export const content = {
  hero: {
    title: 'HTML to EPUB - Turn Web Content into a Real Ebook',
    subtitle: 'Free HTML to EPUB converter. No sign-up — package web pages and saved articles into ebooks you can read offline anywhere.'
  },

  sections: [
    {
      heading: 'What is HTML Format?',
      body: `HTML is the markup that every web page is made of. Headings, paragraphs, lists, tables, images, links — each one is a tag that says what a piece of content is, while CSS handles how it looks.

It is brilliant for the web and mildly awful for long reading. A browser tab has no memory of where you stopped, no font controls worth using, no night mode that respects the page, and no offline guarantee once the site goes down.

**HTML also comes in a lot of shapes:**

- A single hand-written .html file
- A "Save Page As" dump from your browser, with a sidecar folder of assets
- Exported documentation from a static site generator
- Output from a writing tool like Scrivener, Pandoc, or Google Docs

All of those can become an ebook. The cleaner your markup, the better the result — but you do not need perfect HTML to get something readable.`
    },
    {
      heading: 'What is EPUB Format?',
      body: `EPUB is the open ebook standard, and it is what nearly every reading device speaks natively — Apple Books, Kobo, Nook, Google Play Books, PocketBook, and Kindle via Send to Kindle.

Under the hood it is a ZIP archive of XHTML, CSS, and images, which is exactly why HTML converts into it so naturally. The difference is everything EPUB wraps around that content:

- **Reflowable text** that reshapes itself for a phone, a tablet, or a 6-inch e-ink screen
- **Reader-controlled typography** — font, size, line spacing, margins, all adjustable
- **A real table of contents** built from your heading structure
- **Offline by default** — the whole thing is one self-contained file
- **Reading position, bookmarks, and highlights** that your app remembers between sessions

In short, HTML is built for browsing. EPUB is built for sitting down and reading for two hours.`
    },
    {
      heading: 'How to Convert HTML to EPUB',
      body: `**1. Upload your file.** Drop in a .html or .htm file. Free accounts cover files up to 10MB, which is far more than any realistic text document needs — that ceiling only matters if your page is stuffed with large images.

**2. We parse and restructure.** The converter reads your heading hierarchy to work out chapters, pulls the title and author from the document head where they exist, downloads any externally linked images so the book works offline, and rewrites inline styles into EPUB-safe CSS.

**3. Download the EPUB.** Send it to your reader, email it to your Kindle, or drop it into Apple Books.

Typical conversions finish in five to fifteen seconds. Image-heavy pages can take a minute or two while the linked assets are fetched and repackaged. Converting a set of pages? Pro accounts handle batches and larger uploads.`
    },
    {
      heading: 'When Do You Need This Conversion?',
      body: `**Reading long articles properly.** Save a 12,000-word essay or a multi-part investigative piece, convert it, and read it on e-ink without the ads, popups, and newsletter overlays.

**Self-publishing from a web-first draft.** Plenty of writers draft in Markdown, export to HTML, and need an EPUB for distribution. This is the last step of that chain.

**Turning documentation into a manual.** Export your docs site to HTML, bundle it as an EPUB, and hand it to a client or a field team who might not have connectivity.

**Archiving your own writing.** A blog can vanish overnight when a host shuts down. An EPUB on your own drive does not.

**Course and training material.** Reflowable text with a working table of contents beats a stack of printed pages or a folder of loose web files.`
    },
    {
      heading: 'What Converts Cleanly - and What Does Not',
      body: `**Handled well:**

- Heading tags become chapter entries in the navigation
- Paragraphs, bold, italic, underline, and blockquotes keep their meaning
- Ordered and unordered lists, including nesting
- Images, whether embedded or linked from a URL — they get downloaded and packaged inside the file
- Tables, converted to layouts that will not run off the edge of a small screen
- Metadata from the document head, written into the EPUB properties

**Simplified or dropped:**

- **JavaScript.** EPUB is a reading format, not an app platform. Interactive widgets become static content or disappear.
- **Fixed-position CSS layouts.** Absolute positioning and multi-column grids get flattened, because reflowable text has no fixed canvas.
- **Video and audio embeds.** EPUB 3 technically supports media, but most readers ignore it, so embeds usually reduce to a link.
- **Web fonts** may be swapped for reader defaults depending on licensing.

One practical tip: if your HTML uses styled div elements instead of real heading tags, the converter has nothing to build a table of contents from. Proper headings make a dramatically better ebook.`
    }
  ],

  faq: [
    { q: 'Can I convert a single HTML file into an EPUB?', a: 'Yes, and that is the most common case. A single page becomes a single-chapter ebook. For a multi-page site, either merge the pages into one HTML file first or convert section by section.' },
    { q: 'Will images hosted on the web still show up?', a: 'Yes. Externally linked images are downloaded during conversion and packaged inside the EPUB, so your book keeps working offline even if the original site goes down.' },
    { q: 'What happens to buttons, forms, and JavaScript?', a: 'They do not survive as interactive elements. EPUB readers deliberately restrict scripting, so dynamic content is flattened into its static equivalent or removed.' },
    { q: 'How does the table of contents get built?', a: 'From your heading hierarchy. If your document uses real heading tags in a sensible order, you will get clean chapter navigation. Pages that fake headings with styled text will produce a flat, single-entry TOC.' },
    { q: 'How long does conversion take, and is there a size limit?', a: 'Most pages finish in five to fifteen seconds. Free accounts accept files up to 10MB; Pro adds batch conversion and larger uploads for image-heavy documents.' }
  ]
};
