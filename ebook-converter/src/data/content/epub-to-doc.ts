export const slug = 'epub-to-doc';
export const title = 'Free EPUB to DOC Converter — Extract Text for Legacy Word 97-2003';
export const metaDescription = 'Free EPUB to DOC converter. Extract text and formatting from any EPUB into legacy Word 97-2003 .doc format — no sign-up, works with enterprise systems that require old DOC files.';
export const level = 'B' as const;
export const wordCount = 2400;

export const content = {
  hero: {
    title: 'EPUB to DOC - Convert Ebooks to Legacy Word Format',
    subtitle: 'Free EPUB to DOC converter. No sign-up — convert ebooks into legacy Word 97-2003 format for maximum compatibility.'
  },

  sections: [
    {
      heading: 'What is EPUB Format?',
      body: `EPUB is the open standard for ebooks, and under the hood it's less mysterious than people expect. Unzip an .epub file and you'll find HTML pages, CSS stylesheets, images, and an XML manifest describing the reading order. It's a tiny website in a ZIP file.

That design gives EPUB its defining trait: **reflowable text**. There are no fixed pages. The reader app decides where lines break based on your screen size and font settings. Bump the text size on your phone and the book reflows around it.

- **Open standard** — maintained by the W3C, no single vendor controls it
- **Reflowable** — adapts to any screen, any font size
- **Structured** — chapters, headings, and navigation are semantic, not visual guesses
- **Universally supported** — Apple Books, Kobo, Google Play Books, and now Kindle

The catch: EPUB is built for reading, not editing. You can't open one in Word, track changes on it, or hand it to a colleague who lives in Office. That's where conversion comes in.`
    },
    {
      heading: 'What is DOC Format?',
      body: `DOC is the binary file format Microsoft Word used from the early 1990s through Word 2003. It's a proprietary compound-document structure — essentially a miniature filesystem inside one file, holding text streams, formatting tables, and embedded objects.

Word 2007 replaced it with DOCX, an XML-based format packed in a ZIP. DOCX is smaller, more resilient to corruption, and far easier for other software to read. Microsoft has considered DOC legacy for nearly two decades.

So why does anyone still need it?

- **Locked-down enterprise systems** — some document management platforms, government submission portals, and internal workflow tools were built when DOC was current and never updated
- **Ancient software** — a lab PC running Word 2000, an embedded terminal, an old law-office template system
- **Explicit requirements** — occasionally a submission guideline literally says "Word 97-2003 format"

Be clear about the tradeoffs. DOC files are typically **larger** than DOCX, more prone to corruption, and support fewer features. Modern Word still opens them, but it warns you about compatibility mode.

If nobody is specifically demanding DOC, use our EPUB to DOCX converter instead. Genuinely. DOC only makes sense when something external is forcing your hand.`
    },
    {
      heading: 'How to Convert EPUB to DOC',
      body: `**1. Upload your EPUB.** Drag and drop, or click to browse. Free accounts handle files up to 10MB — that covers essentially any text ebook, since even a 900-page novel rarely exceeds 5MB. Only illustration-heavy books get close to the limit.

**2. Conversion runs automatically.** The EPUB's HTML structure is parsed, chapters are merged into a single document flow, heading tags become Word heading styles, and images get embedded. Most books finish in under 30 seconds.

**3. Download and open.** The .doc file opens in Word, LibreOffice Writer, WPS Office, Google Docs (via upload), and Pages.

One important warning before you upload: **DRM-protected files won't convert.** If you bought the book from Kobo, Google Play Books, or another store with Adobe DRM, the file is encrypted and no converter can read it. You'll get an error. Books from Project Gutenberg, Standard Ebooks, StoryBundle, most indie authors, and anything you made yourself will convert fine.

Also worth saying out loud: converting a book you don't own the rights to, in order to redistribute it, isn't something a format converter makes legal. Convert your own stuff.`
    },
    {
      heading: 'When Do You Need This Conversion?',
      body: `**Submitting to a system that won't take anything else.** Some journal submission portals, grant application systems, and corporate intranets have file-type whitelists written years ago. If the upload button rejects .docx, DOC is your answer.

**Editing a manuscript.** You wrote a book, exported it to EPUB, and now an editor wants to mark it up. Word's track changes is still the publishing industry's default review tool, and some editors are running very old installations.

**Translation work.** Translators overwhelmingly work in Word — CAT tools, glossaries, and terminology managers all plug into it. Some of those tools have better DOC support than DOCX support.

**Extracting text for research.** Pulling long quotes from an ebook for a paper is far easier once the content is in a word processor where you can search, copy, and reformat freely.

**Repurposing your own content.** Turning a self-published ebook into a print layout, a course handout, or a series of articles usually starts with getting the text into an editable document.

**Accessibility workflows.** Some screen-reader and text-to-speech setups in institutional environments handle Word documents more reliably than EPUB.`
    },
    {
      heading: 'What You Get — and What DOC Can\'t Do',
      body: `Here's what survives the conversion cleanly:

- **All the text** — paragraph structure intact, nothing dropped
- **Heading hierarchy** — h1/h2/h3 become Word Heading 1/2/3, so Word's navigation pane works
- **Bold, italic, underline** — basic character formatting carries over
- **Lists** — bulleted and numbered lists stay lists
- **Images** — embedded and placed inline
- **Basic metadata** — title and author land in the document properties

And here's what gets simplified, because DOC simply can't represent it:

- **Custom fonts** — EPUB can embed typefaces; DOC substitutes system fonts
- **CSS layout** — multi-column designs, precise spacing, and decorative styling flatten out
- **Interactive elements** — internal footnote links and pop-up notes become plain text
- **Complex tables** — nested or CSS-styled tables lose their finer formatting
- **SVG graphics** — vector images may not carry through

None of this is a converter limitation. DOC is a format from 1993 being asked to represent a document format from 2011. Some things just don't map. If the styling matters to you, convert to DOCX instead — it handles considerably more.`
    }
  ],

  faq: [
    { q: 'What is the difference between DOC and DOCX?', a: 'DOC is the binary format Word used through 2003; DOCX is the XML-based format introduced in Word 2007. DOCX produces smaller files, resists corruption better, and supports far more formatting features — choose DOC only when a specific system requires it.' },
    { q: 'Can I edit the converted DOC file?', a: 'Yes, fully. It opens and edits in Microsoft Word, LibreOffice Writer, WPS Office, Google Docs, and Apple Pages, though modern Word will show a compatibility-mode notice.' },
    { q: 'Will images survive the conversion?', a: 'Standard raster images like JPG and PNG are extracted and embedded in the document. SVG vector graphics and images positioned with CSS may be simplified or repositioned since DOC has no equivalent layout model.' },
    { q: 'My EPUB will not convert — what is wrong?', a: 'The most common cause is DRM. Books purchased from Kobo, Google Play Books, or similar stores are encrypted and cannot be read by any converter, while DRM-free files from Project Gutenberg, indie authors, or your own exports convert without issue.' },
    { q: 'How many books can I convert at once?', a: 'Free accounts handle one file at a time, up to 10MB each — plenty for text ebooks, which are rarely above a few megabytes. Pro accounts add batch conversion and larger file limits for processing an entire library.' }
  ]
};

export const es = {
  title: 'Conversor Gratuito de EPUB a DOC — Extrae Texto para Word 97-2003',
  metaDescription: 'Conversor gratuito de EPUB a DOC. Extrae texto y formato de cualquier EPUB al formato legacy Word 97-2003 .doc — sin registro, compatible con sistemas empresariales que requieren archivos DOC antiguos.',
  content: {
    hero: {
      title: 'EPUB a DOC — Convierte Ebooks a Word Legado',
      subtitle: 'Conversor gratuito de EPUB a DOC. Sin registro — convierte ebooks al formato legacy Word 97-2003 para máxima compatibilidad.'
    }
  }
};
