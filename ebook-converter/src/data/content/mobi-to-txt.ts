export const slug = 'mobi-to-txt';
export const title = 'MOBI to TXT Converter';
export const level = 'B' as const;
export const wordCount = 2200;

export const content = {
  hero: {
    title: 'MOBI to TXT - Extract Pure Text from Kindle Books',
    subtitle: 'Strip a MOBI ebook down to clean plain text for analysis, translation, AI tools, or old e-ink readers.'
  },

  sections: [
    {
      heading: 'What is MOBI Format?',
      body: `MOBI started life as Mobipocket, a French ebook format from the early 2000s. Amazon bought the company in 2005 and made MOBI the foundation of the Kindle ecosystem for well over a decade.

It is old technology, and it shows. MOBI is built on a compressed HTML core with a handful of proprietary extensions bolted on. Formatting support is thin, tables are unreliable, and the format has no real concept of modern CSS.

**Where MOBI files still turn up:**

- Older Kindle purchases downloaded before Amazon moved to AZW3 and KFX
- Self-published books distributed directly by authors
- Public-domain libraries like Project Gutenberg, which still offer MOBI downloads
- Archives and backups people made years ago and never revisited

Amazon retired MOBI for new Kindle uploads in 2022. The files still work, but the format is on a slow road to nowhere — which is a good reason to pull the text out while you can.`
    },
    {
      heading: 'What is TXT Format?',
      body: `Plain text is exactly what it sounds like: characters, line breaks, nothing else. No fonts, no styling, no images, no metadata block.

That sounds like a downgrade until you notice what it buys you. **A .txt file is the most durable and most portable thing in computing.** It opens in every editor ever written, on every operating system, and it will still open in fifty years.

For a lot of jobs, formatting is just noise in the way:

- **Text analysis** — word frequency, readability scoring, concordances, NLP pipelines
- **Feeding AI tools** — language models want clean prose, not markup
- **Translation** — machine translation handles raw text far more reliably than tagged documents
- **Scripting and grep** — you can search, split, and process text with two lines of code
- **Minimal e-ink readers** — plenty of older or budget devices read TXT smoothly when they choke on ebooks

The trade is honest and obvious: you keep every word and lose every visual detail.`
    },
    {
      heading: 'How to Convert MOBI to TXT',
      body: `**1. Upload the MOBI.** Drag it in or browse for it. Free accounts handle files up to 10MB — MOBI files are rarely anywhere near that, since a full-length novel usually lands between 300KB and 2MB.

**2. We unpack and strip.** The converter decompresses the MOBI record structure, removes the HTML tags, and rebuilds the text with sensible paragraph breaks. Chapters get separated by blank lines instead of vanishing into one endless wall of prose.

**3. Download the .txt.** UTF-8 encoded, ready for any editor, script, or reader.

Conversion is close to instant — usually under five seconds, because there is very little to compute once the tags are gone. Pro accounts add batch conversion, which is the sane way to process a whole folder of books at once.`
    },
    {
      heading: 'When Do You Need Plain Text?',
      body: `**Research and text mining.** If you are counting words, tracking character names across a series, or running sentiment analysis, formatted files just get in the way. TXT is the input format every tool accepts.

**Summarizing with AI.** Paste clean text into a model and you get better results than uploading an ebook that arrives half-mangled.

**Reading on stubborn hardware.** Old MP3 players, budget e-ink devices, in-car displays, and text-to-speech tools frequently support TXT and nothing else.

**Rebuilding a badly formatted book.** Sometimes the fastest fix for an ugly ebook is to strip it back to raw text and rebuild the structure from scratch.

**Long-term archiving.** Storing your library as text costs almost nothing and guarantees you can still read it when today's ebook apps are long gone.`
    },
    {
      heading: 'What You Lose in the Conversion',
      body: `Being upfront about this saves you a redo later.

- **Images disappear entirely.** TXT has no mechanism for them. If your MOBI has diagrams, maps, or illustrations that matter, keep the original or convert to EPUB instead.
- **All styling goes.** Bold, italic, headings, font sizes — none of it can be represented. Emphasis that carried meaning in the original is simply flattened.
- **Tables collapse.** Rows become lines of text. Column alignment is gone.
- **Clickable navigation is gone.** You get blank-line chapter breaks rather than a jumpable table of contents.
- **Footnotes lose their anchors** and typically end up inline or clustered at the end of a section.

**What you do keep:** every word, in the right order, in UTF-8, with paragraph structure and chapter separation preserved. Title and author are written as a short header at the top of the file so you can tell your archives apart.`
    }
  ],

  faq: [
    { q: 'Will images be preserved?', a: 'No. TXT is pure text and cannot hold images at all. If the illustrations matter, keep the MOBI or convert it to EPUB instead.' },
    { q: 'What character encoding does the output use?', a: 'UTF-8, so Chinese, Japanese, Korean, Cyrillic, Arabic, and accented European text all come through correctly. Curly quotes and em dashes are preserved rather than mangled into question marks.' },
    { q: 'My Kindle book will not convert. Why?', a: 'Books bought from the Kindle Store carry DRM, which encrypts the content and blocks any conversion. DRM-free MOBI files — Gutenberg downloads, author-direct copies, your own exports — work fine.' },
    { q: 'Are chapters still identifiable in the text file?', a: 'Yes. Chapter boundaries are marked with blank lines and the original chapter headings remain as plain lines of text, so you can still navigate or split the file by chapter.' },
    { q: 'Can I turn the TXT back into an ebook later?', a: 'You can, but the formatting will not come back — it was discarded, not hidden. Keep a copy of the original MOBI if you might need the styling again.' }
  ]
};
