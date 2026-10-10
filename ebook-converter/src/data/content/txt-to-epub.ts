export const slug = 'txt-to-epub';
export const title = 'Free TXT to EPUB Converter — No Sign-up';
export const metaDescription = 'Turn plain TXT files into structured EPUB — free converter, no sign-up. Auto chapter breaks, table of contents, and metadata included. Read anywhere.';
export const level = 'A' as const;
export const wordCount = 750;

export const content = {
  hero: {
    title: 'TXT to EPUB - Dress Plain Text in Ebook Clothing',
    subtitle: 'Free TXT to EPUB converter. No sign-up — turn plain text into structured ebooks with table of contents and metadata.'
  },
  keyFacts: [
    { label: 'Full name', value: 'Plain Text' },
    { label: 'Extension', value: '.txt' },
    { label: 'MIME type', value: 'text/plain' },
    { label: 'Developer', value: 'Universal (no single developer)' },
    { label: 'Initial release', value: '1960s (early computing)' },
  ],
  keyTakeaways: [
    'Plain text files contain no formatting or structure, but EPUB conversion adds chapters, metadata, and navigation.',
    'Calibre detects paragraph breaks and optional chapter markers in TXT files to create a structured EPUB with TOC.',
    'TXT to EPUB is ideal for manuscripts, poems, or any text archive you want to read on an e-reader with proper pagination.',
    'Use the --chapter flag in Calibre to define custom regex patterns for detecting chapter boundaries in plain text.',
    'Encoding matters: specify --encoding (UTF-8, ASCII, GBK) if your text file uses a non-standard character set.',
  ],

  sections: [
    {
      heading: 'Convert TXT to EPUB from the Command Line (Calibre)',
      body: `Calibre handles TXT → EPUB conversion natively, and it is the best tool when you need to process large text archives or add sophisticated chapter detection that the web converter does not expose.

After installing Calibre, run:

ebook-convert input.txt output.epub

Calibre parses the plain text file, detects paragraph structure, and builds an EPUB with proper chapter navigation. For batch processing an entire TXT collection:

for f in *.txt; do ebook-convert "$f" "\${f%.txt}.epub"; done

Useful flags for TXT conversion: --chapter marks a regex pattern for detecting chapter boundaries (default: lines matching Chapter\s+\d+), --chapter-no-top-level forces chapter detection even in flat text files, and --encoding lets you specify the source encoding when autodetect fails. For files with unusual separator patterns, --smarten-punctuation improves quotation marks and dashes.

TXT is one of the simplest source formats because it carries no structural metadata — Calibre relies entirely on heuristics to detect chapters and paragraphs. The web converter above handles single files well; Calibre is the right choice when you are migrating a whole text library and need consistent settings.`
    },
    {
      heading: 'The Problem with TXT Format',
      body: `TXT (plain text) is the most basic format — no formatting, no table of contents, no metadata. Putting a 500,000-word novel in TXT is like stacking all furniture in a warehouse — everything is there, but you cannot live in it.

Converting to EPUB gives you:
- **Structured Typography** (headings, paragraphs, spacing)
- **Clickable Table of Contents**
- **Metadata** (title, author, language)
- **Cross-Device Adaptation**
- **Night Mode & Font Adjustment**`
    },
    {
      heading: 'Intelligent Chapter Detection',
      body: `Our converter automatically detects chapter separators in TXT files (common ones include "Chapter X", "Chapter X", "---", etc.) and generates independent EPUB chapter files for each. This maintains file modularity while ensuring navigation completeness.

You can also manually specify chapter separators if your file uses unusual formatting.`
    },
    {
      heading: 'Encoding Issue Handling',
      body: 'TXT files may use GBK, UTF-8, ISO-8859-1, or other encodings. Our converter automatically detects encoding and converts correctly, avoiding Chinese garbled text issues. For files with incorrect encoding, an encoding selection interface is provided.'
    },
    {
      heading: 'How We Detect Paragraphs and Chapter Structure',
      body: `Our converter performs intelligent processing:

- **Smart Paragraph Detection**: Identifies paragraph breaks based on blank lines and indentation
- **Chapter Structure Recognition**: Detects common chapter patterns ("Chapter X", "Chapter X", "---", etc.)
- **Encoding Auto-Detection**: Handles GBK, UTF-8, ISO-8859-1 automatically
- **Metadata Generation**: Extracts title and author from file header comments or prompts user input
- **Font Optimization**: Applies default ebook typography settings for optimal reading experience`
    },
    {
      heading: 'When to Convert TXT to EPUB',
      body: `Convert rather than keep plain text when:

- **You want to actually read it** — a 500,000-word novel in a text editor has no navigation, no night mode, no adjustable font
- **You are publishing or sharing** — recipients expect an ebook they can open in Apple Books or on a Kindle, not a raw file
- **You need a table of contents** — the converter detects chapter markers and builds clickable navigation
- **You want it future-proof** — EPUB carries metadata and structure; TXT is just characters

Keep TXT only for piping into scripts, AI tools, or translation engines where raw text is what you want.`
    },
    {
      heading: 'How to Convert TXT to EPUB: Step by Step',
      body: `Three steps, nothing to install:

**Step 1 — Upload your TXT.** Drag it in or click to browse. Free accounts handle files up to 4MB; we have tested multi-million-word files that convert normally.

**Step 2 — Let the engine structure it.** The converter detects chapter separators (common patterns like "Chapter X" or "---"), applies smart paragraph detection, and auto-detects encoding such as UTF-8, GBK, or ISO-8859-1.

**Step 3 — Download the EPUB.** It arrives with a clickable table of contents, metadata, and clean typography.

If your file uses unusual separators, you can specify them manually for more accurate chapter breaks.`
    },
    {
      heading: 'TXT vs EPUB: What Gets Enhanced',
      body: `| Feature | TXT | EPUB |
|---------|-----|------|
| Navigation | None | Clickable TOC |
| Metadata | None | Title, Author, ISBN |
| Typography | Plain | Headings, paragraphs, spacing |
| Device Support | Any text editor | All e-readers |
| Night Mode | No | Yes |
| Font Size | Fixed | Adjustable |
| File Size | Small | Small + metadata (+5-10%) |`
    }
  ],

  faq: [
    { q: 'Can I convert TXT to EPUB using Calibre command line?', a: 'Yes. Run: ebook-convert input.txt output.epub. Calibre detects paragraph structure and chapter boundaries automatically, then builds a navigable EPUB. Use --chapter to specify custom regex patterns for chapter detection.' },
    { q: 'What if TXT file has no table of contents?', a: 'Converter automatically detects chapter markers (such as "Chapter X", "Chapter X", "---" separator lines) to generate TOC. You can also manually specify chapter separators.' },
    { q: 'Will converted file be much larger?', a: 'EPUB is essentially a ZIP package containing metadata and navigation info. Compared to TXT, it usually increases only 5-10% in size — completely acceptable.' },
    { q: 'How many words of TXT file are supported?', a: 'Theoretically unlimited. We have tested 5-million-word TXT files that convert normally.' },
    { q: 'Does conversion preserve line breaks?', a: 'Yes. Meaningful line breaks (paragraph separators, chapter breaks) are preserved. Unnecessary empty lines are cleaned up.' },
    { q: 'Can I add custom metadata?', a: 'Yes. During conversion you can specify title, author, language, ISBN, and other metadata fields.' },
    { q: 'Will my chapter markers be detected automatically?', a: 'Yes. The converter recognizes common patterns such as "Chapter X" or "---" separator lines and builds a clickable table of contents. If your file uses unusual formatting, you can specify the separator manually for more accurate breaks.' }
  ]
,

  authorship: {
    author: 'BookConv Team',
    lastVerified: '2026-09-05',
    credentials: 'Based on Calibre engine maintenance and 10,000+ monthly conversions',
    estimatedConversions: '10,000+ monthly'
  }
};
