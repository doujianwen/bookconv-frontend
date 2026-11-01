export const slug = 'epub-to-html';
export const title = 'Free EPUB to HTML Converter — Download Chapters as ZIP';
export const metaDescription = 'Extract original XHTML chapters, images and CSS from a DRM-free EPUB. Download a ZIP with a reading-order index for editing and browser preview.';
export const level = 'B' as const;
export const wordCount = 600;
export const content = {
  hero: { title: 'EPUB to HTML — Extract Chapters and Resources', subtitle: 'Download original chapters, styles and images in a ZIP, with an index following the reading order.' },
  keyTakeaways: [
    'EPUB contains XHTML chapters and resources. This converter extracts the package on our server without an external conversion engine.',
    'The ZIP retains original filenames, chapter markup, CSS and image bytes, and adds a reading-order index.',
    'Extract the entire ZIP before opening the index. Browser appearance and font support can differ from your reading app.',
    'Use a DRM-free EPUB with a valid manifest and spine. Missing chapters or malformed packages can prevent conversion.',
    'Review chapters before publishing them. Extraction does not automatically make content accessible or optimized for search.'
  ],
  sections: [
    { heading: 'How the Export Works', body: `An EPUB is a ZIP package containing chapter documents, stylesheets, images and metadata. Its manifest identifies the files, and its spine specifies reading order. Alphabetical filenames can give the wrong sequence.

BookConv reads the package document and creates a small HTML index linking the spine chapters in order. Original chapter and resource paths remain unchanged. The output may contain .xhtml files as well as .html files: source markup and extensions are preserved.

This is extraction rather than a layout conversion. It does not normalize CSS, merge chapters, rewrite internal links, or reorganize images into a new folder.` },
    { heading: 'Upload, Download and Open', body: `Upload your DRM-free EPUB using the conversion area above. Follow the limit shown by the interface. The server upload path is limited to 4 MB; direct storage upload may support larger files.

Download the ZIP and extract the entire archive into one folder. Open index.html to see the chapter links. If the source already contains a root index.html, that file is preserved and the new index is named bookconv-index-0.html, or the next available number.

Open a chapter through the index and check its images, internal links and styles. Keep the complete directory together when moving it. Relative references depend on that structure.` },
    { heading: 'What Is Preserved and What Needs Checking', body: `Original chapters, images, CSS and other archive resources are retained. Existing links continue to use their source paths. The added index follows the spine but cannot create missing chapters or repair broken links in the original book.

Reader apps apply their own themes, margins and font settings. A browser may render the same source differently, and local-file restrictions can affect resources. Embedded font files remain in the ZIP; browser support and publishing permissions need separate review.

Annotations and reading progress stored only in a reader app are not exported. Fixed pagination is not added. For a paginated document, try [EPUB to PDF](/convert/epub-to-pdf) and inspect the output.` },
    { heading: 'Using Chapters on a Website', body: `For your own writing or material you have permission to publish, extracted chapters can be a starting point for documentation, editing or sample chapters. Import relevant content into your CMS and adapt its navigation, styles and image references.

The ZIP retains the original book content, including any scripts or external references. Extraction is not HTML sanitization; review those elements before publishing material on your website.

Check headings, alternative text, navigation, canonical URLs and metadata on published pages. Search visibility depends on those pages and their value to readers. Downloading an archive does not establish indexing or ranking.

To package a web document as an ebook, use [HTML to EPUB](/convert/html-to-epub).` }
  ],
  faq: [
    { q: 'Does the download contain one HTML file?', a: 'No. It contains original chapters and resources plus a reading-order HTML index. Chapters may retain their .xhtml extension.' },
    { q: 'Are images and styles preserved?', a: 'Original files and paths are retained. Browser rendering and broken references in the source still need checking.' },
    { q: 'Why will my EPUB not convert?', a: 'Possible causes include an invalid archive, missing package or spine chapter, upload limits and encrypted content. This tool does not decrypt DRM.' },
    { q: 'Can I open it offline?', a: 'Extract the whole ZIP and open the added index. Local chapters and resources can be viewed offline; external references still require a connection.' }
  ],
  authorship: { author: 'BookConv Team', lastVerified: '2026-11-01', credentials: 'Reviewed against the local EPUB extraction implementation and automated fixtures' }
};
