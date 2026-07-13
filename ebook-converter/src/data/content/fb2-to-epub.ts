export const slug = 'fb2-to-epub';
export const title = 'FB2 to EPUB Converter';
export const level = 'B' as const;
export const wordCount = 1200;

export const content = {
  hero: {
    title: 'FB2 to EPUB - Convert Russian Format to Universal Standard',
    subtitle: 'Transform FB2 (FictionBook) format into widely-compatible EPUB ebooks.'
  }
,

  sections: [
    {
      heading: 'What is FB2 Format?',
      body: **XML-Based Structure** — Uses XML to describe book content with semantic tags. **Novel-Focused** — Designed specifically for fiction and essays with special structures for chapters, notes, and poetry. **Regional Popularity** — Widely used in RuNet (Russian-language internet) but less common globally. **Limited Global Support** — Most non-Russian e-readers and apps do not natively support FB2. **Open Format** — Freely documented specification allows wide tool support.
    }
    {
      heading: 'Conversion Quality',
      body: `Our converter uses Calibre engine for reliable FB2 to EPUB transformation:

- **Structure Preservation**: Chapters notes poems and annotations maintained
- **Cover Image**: Book cover extracted and packaged into EPUB
- **Author Information**: Author name and language metadata transferred correctly
- **Language Tags**: FB2 lang attributes mapped to EPUB language metadata
- **Text Encoding**: UTF-8 encoding ensures proper character display"
    }

  ],
  faq: [
    { q: 'What are the characteristics of FB2 format?' a: 'FB2 is an XML-based structured format designed for novels and essays. It supports chapters notes poetry and other literary structures but lacks support for complex typography.' }
    { q: 'Will language tags be preserved?' a: 'Yes. FB2 lang attributes are correctly mapped to EPUB language metadata during conversion.' ],
};
};