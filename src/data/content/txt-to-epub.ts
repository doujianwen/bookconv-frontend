export const slug = 'txt-to-epub';
export const title = 'TXT to EPUB Converter';
export const level = 'A' as const;
export const wordCount = 2000;

export const content = {
  hero: {
    title: 'TXT to EPUB - Dress Plain Text in Ebook Clothing',
    subtitle: 'Convert simple TXT text files to structured EPUB ebooks with table of contents, metadata, and beautiful typography.'
  },

  sections: [
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
      heading: 'Conversion Quality Guarantee',
      body: `Our converter performs intelligent processing:

- **Smart Paragraph Detection**: Identifies paragraph breaks based on blank lines and indentation
- **Chapter Structure Recognition**: Detects common chapter patterns ("Chapter X", "Chapter X", "---", etc.)
- **Encoding Auto-Detection**: Handles GBK, UTF-8, ISO-8859-1 automatically
- **Metadata Generation**: Extracts title and author from file header comments or prompts user input
- **Font Optimization**: Applies default ebook typography settings for optimal reading experience`
    },
    {
      heading: 'What Gets Enhanced',
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
    { q: 'What if TXT file has no table of contents?', a: 'Converter automatically detects chapter markers (such as "Chapter X", "Chapter X", "---" separator lines) to generate TOC. You can also manually specify chapter separators.' },
    { q: 'Will converted file be much larger?', a: 'EPUB is essentially a ZIP package containing metadata and navigation info. Compared to TXT, it usually increases only 5-10% in size — completely acceptable.' },
    { q: 'How many words of TXT file are supported?', a: 'Theoretically unlimited. We have tested 5-million-word TXT files that convert normally.' },
    { q: 'Does conversion preserve line breaks?', a: 'Yes. Meaningful line breaks (paragraph separators, chapter breaks) are preserved. Unnecessary empty lines are cleaned up.' },
    { q: 'Can I add custom metadata?', a: 'Yes. During conversion you can specify title, author, language, ISBN, and other metadata fields.' }
  ]
};
