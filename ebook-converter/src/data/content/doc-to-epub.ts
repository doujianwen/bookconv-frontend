export const slug = 'doc-to-epub';
export const title = 'DOC to EPUB Converter';
export const level = 'B' as const;
export const wordCount = 1200;

export const content = {
  hero: {
    title: 'DOC to EPUB - Convert Legacy Word Documents to Ebooks',
    subtitle: 'Transform old DOC format documents into modern EPUB ebooks for comfortable reading.'
  }
,

  sections: [
    {
      heading: 'Why Convert DOC to EPUB?',
      body: **Reflowable Layout** — Adapts to any screen size, from phones to tablets to e-readers. **Night Mode** — Read comfortably in low light without straining your eyes. **Adjustable Fonts** — Change font size, style, and spacing to your preference. **Auto Navigation** — Table of contents generated automatically from document headings. **Smaller File Size** — EPUB compression often reduces file size by 30-50%. **Long-Term Preservation** — EPUB 3 is the future-proof standard for digital documents.
    }
    {
      heading: 'Conversion Pipeline',
      body: `We use a two-step process for maximum compatibility:

**DOC → LibreOffice (convert to DOCX) → Calibre (convert to EPUB)**

This pipeline ensures:
- **Maximum Compatibility**: LibreOffice handles even heavily corrupted DOC files
- **Structure Preservation**: Headings paragraphs lists and tables maintained
- **Image Extraction**: Embedded images packaged correctly into EPUB
- **Metadata Transfer**: Document properties carried over to EPUB metadata"
    }

  ],
  faq: [
    { q: 'How long does conversion take?' a: 'Standard documents under 50 pages typically convert in 10-30 seconds. Larger documents with many images may take 1-2 minutes.' }
    { q: 'Will macros be preserved?' a: 'No. VBA macros from DOC files cannot be converted to EPUB. If your document contains macro logic handle it separately before conversion.' ],
};
};