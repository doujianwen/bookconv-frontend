export const slug = 'fb2-to-epub';
export const title = 'FB2 to EPUB Converter';
export const level = 'B' as const;
export const wordCount = 1200;

export const content = {
  hero: {
    title: 'FB2 to EPUB - Convert FictionBook to Universal Ebook Format',
    subtitle: 'Transform FB2 (FictionBook) files into EPUB for maximum device compatibility and reading flexibility.',
  },
  sections: [
    {
      heading: 'What is FB2 Format?',
      body: 'FB2 (FictionBook) is an XML-based ebook format that originated in Russia and has gained popularity across Eastern Europe and among digital libraries worldwide. It was designed specifically for fiction reading with built-in support for chapters, annotations, images, and structured metadata. Unlike plain text formats, FB2 preserves the literary structure of novels and short stories with semantic markup. The format supports custom fonts through embedded stylesheets, though most readers use default serif fonts optimized for long-form reading. FB2 files are typically smaller than PDFs while maintaining excellent readability on e-ink displays. Major Russian ebook platforms like LitRes and MyBook distribute content primarily in FB2 format.',
    },
    {
      heading: 'Why Convert FB2 to EPUB?',
      body: 'EPUB has become the de facto standard for ebook distribution across virtually all modern reading platforms including Apple Books, Google Play Books, Kobo, and most dedicated ebook readers. Converting FB2 to EPUB dramatically expands your audience reach and device compatibility. While FB2 works well on specific platforms, EPUB ensures your books can be read on any device from smartphones to tablets to dedicated e-readers. EPUB also supports reflowable text, adaptive layouts, and advanced accessibility features like screen reader optimization that FB2 lacks. For self-publishing authors, EPUB is required by major retailers including Amazon Kindle Direct Publishing (via conversion), Barnes & Noble, and Apple Books. The conversion process maintains all structural elements including chapter divisions, footnotes, and embedded images.',
    },
    {
      heading: 'Conversion Quality & Features',
      body: 'Our converter uses Calibre engine for high-fidelity FB2 to EPUB conversion that preserves every detail of your original file. Chapter Structure — All chapter divisions and navigation points are maintained with proper EPUB navigation document generation. Image Handling — Embedded illustrations and cover images are converted to web-optimized formats while preserving quality. Metadata Transfer — Author names, titles, series information, and subject tags from FB2 are mapped to EPUB Dublin Core standards. Text Reflow — FB2 fixed-layout text becomes fully reflowable in EPUB, adapting to any screen size or font setting. Accessibility — The converted EPUB includes proper heading hierarchy, semantic markup, and reading order for screen readers. Font Embedding — Custom fonts defined in FB2 are preserved or gracefully substituted with standard readable typefaces.',
    },
    {
      heading: 'How to Use the Converter',
      body: 'Upload your FB2 file using the drag-and-drop zone or click to browse your files. Our system automatically detects the FB2 format and prepares the conversion pipeline. You can optionally select EPUB version preferences (EPUB 3 for modern features or EPUB 2 for maximum compatibility). The conversion typically completes within seconds for standard-length novels and under a minute for longer works with many illustrations. Once complete, you receive a download link for your new EPUB file which you can transfer to any reading device. For batch conversions of multiple FB2 files, consider our Pro plan which supports up to 50 simultaneous conversions with priority queue processing.',
    },
  ],
  faq: [
    { q: 'Does FB2 support images and illustrations?', a: 'Yes. FB2 files can contain embedded images for illustrations, covers, and diagrams. Our converter preserves all embedded images during the FB2 to EPUB conversion process.' },
    { q: 'Will my FB2 book work on Kindle devices?', a: 'Kindle devices do not natively support FB2 format. Converting to EPUB first, then using Calibre to convert EPUB to AZW3 for Kindle, gives the best results. Alternatively, Amazon accepts EPUB uploads to their KDP platform and handles the conversion automatically.' },
    { q: 'Is the conversion reversible?', a: 'You can convert EPUB back to FB2 using the same tool. However, some EPUB-specific features like advanced typography may not map perfectly back to FB2 structure.' },
    { q: 'Does FB2 support footnotes and endnotes?', a: 'Yes, FB2 has native support for annotations and footnotes using its <annotation> element. These are preserved as interactive links in the converted EPUB file.' },
  ],
};
