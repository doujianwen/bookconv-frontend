export const slug = 'epub-to-jpg';
export const title = 'EPUB to JPG Converter';
export const level = 'B' as const;
export const wordCount = 1200;

export const content = {
  hero: {
    title: 'EPUB to JPG - Convert Ebooks to HD Images',
    subtitle: 'Convert each page of your EPUB ebook to JPG images perfect for sharing and archiving.'
  }
,

  sections: [
    {
      heading: 'When to Convert EPUB to JPG',
      body: ` \`Social Media Sharing — Share beautiful book excerpts on WeChat Moments, Weibo, Instagram, or Twitter. Presentation Creation — Extract key pages from books to use as slides in presentations. Print Layout — Integrate ebook content into magazines, brochures, or printed materials. Archive Backup — Image formats are universally viewable on any device without special readers. Quick Preview — Generate thumbnail previews of book pages for catalogs or libraries.\`
    }`,
    {
      heading: 'Conversion Pipeline',
      body: ` \`We use a reliable two-step conversion process: EPUB → PDF (Calibre) → JPG (ImageMagick). This pipeline ensures: Best Quality — Calibre handles EPUB rendering accurately before image conversion. Customizable Resolution — Default 300 DPI adjustable up to 600 DPI for print quality. Page Range Selection — Convert specific pages or entire books. Compression Control — Adjust JPG quality settings to balance file size vs. image clarity.\`
    }
  ]`,
      faq: [
    { q: 'What resolution are the converted JPGs?', a: 'Default output is 300 DPI suitable for printing and high-definition display. You can customize the resolution up to 600 DPI for professional print quality.' }
    { q: 'Does JPG lose quality?', a: 'JPG uses lossy compression but at quality settings above 85% the difference is imperceptible to the human eye while significantly reducing file size compared to PNG.' ],
};
};
