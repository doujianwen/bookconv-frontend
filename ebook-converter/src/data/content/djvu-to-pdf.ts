export const slug = 'djvu-to-pdf';
export const title = 'DjVu to PDF Converter';
export const level = 'B' as const;
export const wordCount = 1200;

export const content = {
  hero: {
    title: 'DjVu to PDF - Convert Archive Format to Universal Standard',
    subtitle: 'Transform DjVu documents into PDF format for broader compatibility.',
  },
  sections: [
    {
      heading: 'What is DjVu Format?',
      body: 'Small File Sizes — DjVu achieves remarkable compression while maintaining readability. Archival Standard — Widely used by libraries and institutions for digitizing documents. Mixed Content — Handles both text pages and image-heavy pages efficiently. Limited Compatibility — Requires specialized software to view, limiting accessibility. OCR Integration — Often includes hidden text layers for searchability.',
    },
    {
      heading: 'Conversion Quality',
      body: 'Our converter produces high-quality PDF output from DjVu files: Image Preservation — Original scan quality maintained in PDF output. Text Layer — If DjVu contains OCR text it is preserved in PDF for searchability. Multi-Page Support — Entire documents converted with pages in correct order. Color Accuracy — Preserves original colors and tonal values from scans. Print Ready — PDF output suitable for both screen viewing and printing.',
    },
  ],
  faq: [
    { q: 'Is text searchable in the converted PDF?', a: 'If the original DjVu file contains an OCR text layer the converted PDF will be searchable. Files without OCR may need separate text recognition.' },
    { q: 'Can I convert multi-page DjVu documents?', a: 'Yes. Our converter handles entire multi-page documents preserving page order and layout. Large documents may take a few minutes to process.' },
  ],
};
