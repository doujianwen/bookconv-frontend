export const slug = 'epub-to-word';
export const title = 'EPUB to Word Converter';
export const level = 'B' as const;
export const wordCount = 1200;

export const content = {
  hero: {
    title: 'EPUB to Word - Convert Ebooks to DOCX Format',
    subtitle: 'Transform EPUB ebooks into Microsoft Word DOCX documents for editing and sharing.'
  },

  sections: [
    {
      heading: 'Why Convert EPUB to Word?',
      body: `**Content Editing** — Extract book text for editing, proofreading, or rewriting. **Academic Writing** — Many researchers extract quotes and passages from ebooks for papers. **Publishing Prep** — Self-publishers often convert ebooks to Word for manuscript submission. **Translation Work** — Translators prefer working with Word documents for terminology management. **Team Collaboration** — Word supports track changes and comments for collaborative editing.`
    },
    {
      heading: 'Conversion Quality',
      body: `Our converter produces clean, well-structured Word documents:

- **Text Integrity**: All text content preserved with proper paragraph structure
- **Heading Hierarchy**: Chapter titles and subheadings mapped to Word heading styles
- **Image Packaging**: Embedded images extracted and inserted into document
- **List Formatting**: Bulleted and numbered lists maintained
- **Metadata Transfer**: Book title, author, and description included in Word properties`
    }
  ],

  faq: [
    { q: 'Does this convert to DOC or DOCX?', a: 'We convert to DOCX, the modern Word format based on OpenXML. DOCX offers better compression, more features, and improved reliability compared to legacy DOC.' },
    { q: 'Will formatting be preserved?', a: 'Basic formatting including headings, bold, italic, lists, and images is preserved. Complex layouts and custom fonts may be simplified due to format differences.' }
  ]
};
