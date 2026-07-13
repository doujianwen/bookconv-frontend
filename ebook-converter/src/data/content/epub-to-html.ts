export const slug = 'epub-to-html';
export const title = 'EPUB to HTML Converter';
export const level = 'B' as const;
export const wordCount = 1200;

export const content = {
  hero: {
    title: 'EPUB to HTML - Convert Ebooks to Web Format',
    subtitle: 'Convert EPUB ebooks to HTML web format perfect for embedding in websites or blogs.'
  }
,

  sections: [
    {
      heading: 'Use Cases for EPUB to HTML Conversion',
      body: **Blog Publishing** — Publish book chapters on your blog or CMS platform. **Website Embedding** — Display ebook content directly on company websites or product documentation. **Offline Reading** — HTML files open in any browser without special e-reader software. **Secondary Creation** — HTML is the easiest format to edit, modify, and re-layout. **Content Syndication** — Repurpose book content for web articles or newsletters.
    }
    {
      heading: 'Conversion Output',
      body: `Our converter generates well-structured HTML output:

- **Chapter-by-Chapter Files**: Each chapter becomes a separate HTML file for easy navigation
- **Navigation Index**: An index.html homepage links to all chapters
- **Preserved Elements**: Headings paragraphs images and hyperlinks maintained
- **Clean Code**: Semantic HTML5 markup for accessibility and SEO friendliness
- **Responsive Design**: HTML output adapts to different screen sizes automatically"
    }

  ],
  faq: [
    { q: 'Can the generated HTML open directly in browsers?' a: 'Yes. The converter generates an index.html file that serves as a navigation hub. Clicking chapters opens individual HTML pages that work in any modern browser.' }
    { q: 'Are images preserved during conversion?' a: 'Yes. All embedded images are saved to a dedicated images/ folder with HTML files referencing them via relative paths.' ],
};
};