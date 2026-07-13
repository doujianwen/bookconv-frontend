export const slug = 'epub-to-png';
export const title = 'EPUB to PNG Converter';
export const level = 'B' as const;
export const wordCount = 1200;

export const content = {
  hero: {
    title: 'EPUB to PNG - Convert Ebooks to High-Quality Images',
    subtitle: 'Transform EPUB ebooks into PNG images with perfect quality and detail preservation.'
  }
,

  sections: [
    {
      heading: 'When to Convert EPUB to PNG',
      body: 'High-Quality Archiving — PNG preserves every pixel without compression artifacts. Illustration Books — Perfect for comics, graphic novels, and art books. Academic Papers — Maintain precise charts, graphs, and formulas. Print Preparation — PNG images can be easily integrated into professional layouts. Social Media — Share beautiful book excerpts as high-quality images.',    },
    {
      heading: 'Conversion Quality Guarantee',
      body: 'Our converter uses a two-step pipeline for optimal results: EPUB → PDF → PNG (ImageMagick). This approach ensures: Lossless Compression — PNG preserves every pixel without quality degradation. High DPI Output — Default 300 DPI suitable for both screen display and printing. Color Accuracy — Perfect for books with illustrations, diagrams, and photographs. Batch Processing — Convert entire books page by page automatically. The converter intelligently handles multi-page layouts maintaining proper reading order and page breaks.',    }
  ]
      faq: [
    { q: 'What is the difference between PNG and JPG?', a: 'PNG is a lossless format ideal for text, charts, and graphics with sharp edges. JPG is better for photos with smooth gradients. For ebooks, PNG is generally preferred for crisp text rendering.' },
    { q: 'How large are the converted PNG files?', a: 'File size depends on page complexity. A plain text page typically produces 100-300 KB PNG files. Pages with images or complex layouts may be 500 KB to 2 MB each.' },
    { q: 'Can I convert just specific pages?', a: 'Yes. Pro users can select custom page ranges for conversion making it easy to extract specific chapters or sections.' ],
};
