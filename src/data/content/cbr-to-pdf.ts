export const slug = 'cbr-to-pdf';
export const title = 'CBR to PDF Converter';
export const level = 'B' as const;
export const wordCount = 1200;

export const content = {
  hero: {
    title: 'CBR to PDF - Convert Comic Books to Universal Format',
    subtitle: 'Transform CBR (Comic Book RAR) files into PDF for easy reading and printing.',
  },
  sections: [
    {
      heading: 'What is CBR Format?',
      body: 'Image-Based Pages — Each page is a high-resolution image capturing artwork details. RAR Compression — Multiple pages packed into a single RAR archive for efficient storage. Popular in Comics Community — Widely used for manga, western comics, and graphic novels. No Text Layer — Unlike PDF, CBR pages are pure images without selectable text. Requires Special Reader — Needs comic book reader apps to view properly.',
    },
    {
      heading: 'Conversion Quality',
      body: 'Our converter uses ImageMagick for high-quality image processing: Original Resolution — Maintains full image quality from the original CBR file. Batch Processing — All pages converted automatically in correct reading order. Color Accuracy — Preserves vibrant colors essential for comic artwork. Single PDF Output — All pages combined into one searchable printable PDF. Optimized File Size — Intelligent compression balances quality and download speed.',
    },
  ],
  faq: [
    { q: 'What is the difference between CBR and CBZ?', a: 'CBR uses RAR compression while CBZ uses ZIP compression. Both are comic book formats; our converter supports both interchangeably.' },
    { q: 'How large will the PDF be?', a: 'File size depends on page count and image quality. A 200-page comic may produce a PDF between 100MB-500MB.' },
  ],
};
