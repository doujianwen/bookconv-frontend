export interface FormatInfo {
  name: string
  description: string
  pros: string[]
  cons: string[]
  useCases: string[]
  recommendedConverters: Array<{ label: string; href: string }>
}

const formatMap: Record<string, Omit<FormatInfo, 'recommendedConverters'>> = {
  epub: {
    name: 'EPUB',
    description: 'EPUB (Electronic Publication) is an open standard developed by the International Digital Publishing Forum (IDPF) and the most widely supported ebook format. Built on ZIP, HTML, and CSS, it supports reflowable layout and responsive typography.',
    pros: ['Cross-platform support (iOS, Android, Kobo, desktop, and more)', 'Reflowable layout with adjustable font size and line spacing', 'Supports embedded fonts and CSS styling', 'Small file size (ZIP-based compression)', 'Open standard with an active community'],
    cons: ['Not supported on some older Kindle devices', 'Complex layouts can sometimes render inconsistently', 'No standardized DRM implementation'],
    useCases: ['General ebook distribution', 'Library lending (OverDrive and similar)', 'Personal reading (phone, tablet, e-reader)'],
  },
  pdf: {
    name: 'PDF',
    description: 'PDF (Portable Document Format), developed by Adobe, is a fixed-layout document format that keeps its appearance identical on every device. It is the default choice for academic papers and business documents.',
    pros: ['Consistent cross-platform rendering with no layout shift', 'Supports embedded fonts, images, and vector graphics', 'Ideal for printing and formal document distribution', 'Universally supported — nearly every device can open it', 'Supports forms, annotations, and digital signatures'],
    cons: ['Fixed layout, poor for small-screen reading', 'Text size cannot be adjusted fluidly', 'Usually large file size', 'Hard to edit; not suited to content revision'],
    useCases: ['Academic papers and technical documents', 'Business reports and legal contracts', 'Print publications'],
  },
  mobi: {
    name: 'MOBI',
    description: 'MOBI (Mobipocket) was one of the earliest ebook formats supported by Kindle. Although largely superseded by AZW3, it remains the standard format for many older Kindle devices.',
    pros: ['Native support on virtually all Kindle devices', 'Relatively small file size', 'Broad compatibility and wide circulation'],
    cons: ['No support for complex layout or advanced typography', 'Limited features; superseded by AZW3', 'No EPUB-level CSS styling', 'Recommended only for older Kindle users'],
    useCases: ['Reading on older Kindle devices', 'Simple plain-text ebooks', 'Classic Kindle owners'],
  },
  azw3: {
    name: 'AZW3',
    description: 'AZW3 (Kindle Format 8) is Amazon’s premium ebook format for Kindle devices, released in 2011. It delivers better layout and font rendering and is the mainstream format within the Kindle ecosystem.',
    pros: ['Native Kindle support with the best layout quality', 'Better font rendering and table display', 'Preserves complex CSS styling', 'Supports bookmarks, notes, and highlights'],
    cons: ['Limited to Kindle devices and the Kindle app', 'Less compatible than EPUB', 'Not an open standard'],
    useCases: ['Kindle Paperwhite / Oasis reading', 'Novels that need refined typography', 'Kindle Unlimited content'],
  },
  txt: {
    name: 'TXT',
    description: 'TXT is the simplest, most basic plain-text format. It carries no formatting and stores only raw characters, making it the most universal of all formats.',
    pros: ['Universal compatibility — opens on any device', 'Extremely small file size', 'Easy to edit and process', 'No encoding issues (ASCII/UTF-8)'],
    cons: ['No formatting (no bold, italics, etc.)', 'No metadata (title, author, etc.)', 'Cannot preserve layout', 'Unsuited to documents with complex structure'],
    useCases: ['Plain-text novels', 'Code and script files', 'Quick notes and memos'],
  },
  docx: {
    name: 'DOCX',
    description: 'DOCX is the default file format used by Microsoft Word 2007 and later. An XML-based open format, it is widely used for office documents and ebook authoring.',
    pros: ['Native Microsoft Word support', 'Powerful formatting and editing', 'Supports embedded images, tables, and styles', 'Easy collaboration and revision'],
    cons: ['Not a dedicated ebook format', 'May render inconsistently across readers', 'Relatively large file size', 'Requires conversion before use in e-readers'],
    useCases: ['Ebook first-draft authoring', 'Academic papers and reports', 'Documents needing collaborative editing'],
  },
  rtf: {
    name: 'RTF',
    description: 'RTF (Rich Text Format), introduced by Microsoft in 1987, is a cross-platform rich-text format. It supports basic formatting such as bold, italic, and underline while staying broadly compatible.',
    pros: ['Good cross-platform compatibility', 'Supports basic text formatting', 'Opens in almost any word processor', 'Moderate file size'],
    cons: ['No support for complex layout or advanced formatting', 'Limited image support', 'Gradually replaced by DOCX', 'Encoding issues can cause garbled text'],
    useCases: ['Simple rich-text exchange', 'Legacy system data migration', 'Email attachment documents'],
  },
  jpg: {
    name: 'JPG/JPEG',
    description: 'JPG (JPEG) is a widely used lossy image-compression format. In ebooks it is often used to turn book pages into images, suited to cases where text search is not needed.',
    pros: ['Very high compression with small file size', 'Displays on every device', 'Good for photos and complex images', 'Supports 24-bit color'],
    cons: ['Lossy compression; quality drops with repeated saves', 'No transparent background', 'Unsuited to plain text or line art', 'No text search or copy'],
    useCases: ['Scanned pages as images', 'Image-based ebooks', 'Old documents where text cannot be extracted'],
  },
  png: {
    name: 'PNG',
    description: 'PNG (Portable Network Graphics) is a lossless image format with transparent-background and 24-bit color support. In ebooks it is commonly used for high-quality image preservation.',
    pros: ['Lossless compression with no quality loss', 'Supports transparent background', 'Ideal for line art and screenshots', 'Broad browser and device support'],
    cons: ['Larger than JPG', 'No animation support', 'Unsuited to photo content', 'No 32-bit color support'],
    useCases: ['High-quality image preservation', 'Assets with transparent backgrounds', 'Technical-document screenshots'],
  },
  html: {
    name: 'HTML',
    description: 'HTML is the foundational markup language of the web. As an ebook format it opens directly in a browser and suits content that needs to keep web structure and styling.',
    pros: ['Opens directly in a browser with no special software', 'Easy to edit and modify', 'Supports hyperlinks and multimedia', 'Fully compatible with web technology'],
    cons: ['Not a dedicated ebook format', 'No DRM protection', 'May display differently across browsers', 'Unsuited to offline reading'],
    useCases: ['Online documentation and knowledge bases', 'Technical manuals', 'Web-content archiving'],
  },
  fb2: {
    name: 'FB2',
    description: 'FB2 (FictionBook) is an XML-based ebook format designed for the Russian-language market. Popular across Russia and the former Soviet states, it is especially suited to novels and literary works.',
    pros: ['Designed for fiction with elegant typography', 'XML-based with clear structure', 'Supports metadata and cover images', 'Widely supported in the Russian-speaking region'],
    cons: ['Mainly popular in the Russian-speaking region', 'Limited support on Western devices', 'No support for complex layout', 'Smaller community'],
    useCases: ['Russian novels and literature', 'Reading across the former Soviet region', 'XML-format ebooks'],
  },
  lit: {
    name: 'LIT',
    description: 'LIT is an ebook format developed by Microsoft for Windows Mobile and Pocket PC. An important early format for mobile reading, it has since been replaced by more modern standards.',
    pros: ['Native Windows Mobile support', 'Basic DRM protection', 'Moderate file size'],
    cons: ['Discontinued; only legacy devices supported', 'Poor compatibility', 'Limited features', 'Superseded by EPUB'],
    useCases: ['Old Windows Mobile devices', 'Historical-document archiving', 'Legacy system compatibility'],
  },
  cbr: {
    name: 'CBR',
    description: 'CBR (Comic Book RAR) is an ebook format for comics and images — essentially a renamed RAR archive. It stores comic pages as images and is a favorite among comic readers.',
    pros: ['Naturally suited to comic serials', 'High RAR compression ratio', 'Widely supported by comic readers', 'Supports color comics'],
    cons: ['No text search', 'Requires a dedicated comic reader', 'Can be large', 'Not a standard ebook format'],
    useCases: ['Comics and graphic novels', 'Comic-strip archiving', 'Comic serial reading'],
  },
  djvu: {
    name: 'DJVU',
    description: 'DJVU is an image-compression format optimized for scanned documents, developed by AT&T. Its compression far exceeds PDF’s, making it ideal for documents with many scanned pages.',
    pros: ['Extremely high compression, far better than PDF', 'Suited to large scanned-page collections', 'Keeps crisp text rendering', 'Supports multi-layer images'],
    cons: ['Weaker compatibility', 'Requires a dedicated reader', 'Hard to edit', 'Limited community support'],
    useCases: ['Ancient books and document scanning', 'Large scanned-document collections', 'Archive preservation'],
  },
  doc: {
    name: 'DOC',
    description: 'DOC is the default file format of Microsoft Word 97-2003. Although superseded by DOCX, it remains widely used in many legacy systems.',
    pros: ['Found throughout historical documents', 'Opens in almost any word processor', 'Supports basic formatting'],
    cons: ['No longer updated; lower security', 'No modern typography features', 'Larger file size', 'Weaker cross-platform compatibility than DOCX'],
    useCases: ['Reading legacy documents', 'Old-system compatibility', 'Legal and government documents'],
  },
  word: {
    name: 'Word (DOCX)',
    description: 'Word documents (DOCX) are today’s most common office format, used by the Microsoft Office suite. They are the standard starting point for ebook authoring and collaboration.',
    pros: ['The world’s most popular document format', 'Powerful editing features', 'Rich templates and styles', 'Good cloud-collaboration support'],
    cons: ['Not an ebook-specific format', 'Requires conversion for e-readers', 'Version-compatibility issues'],
    useCases: ['Ebook authoring starting point', 'Collaborative editing', 'Formal documents'],
  },
  text: {
    name: 'Text',
    description: 'Plain text (Text/TXT) is the most basic document format, carrying no formatting. It is the foundational format for all text processing.',
    pros: ['The simplest format', 'Zero compatibility barriers', 'Smallest file size', 'Easy to process programmatically'],
    cons: ['No formatting support', 'No metadata', 'No structuring ability'],
    useCases: ['Code files', 'Log files', 'Plain-text notes'],
  },
}

// Generate recommended converters dynamically based on format relationships
function getRecommendedConverters(slug: string): Array<{ label: string; href: string }> {
  const converters: Record<string, Array<{ label: string; href: string }>> = {
    epub: [
      { label: 'PDF → EPUB', href: '/convert/pdf-to-epub' },
      { label: 'MOBI → EPUB', href: '/convert/mobi-to-epub' },
      { label: 'AZW3 → EPUB', href: '/convert/azw3-to-epub' },
      { label: 'DOCX → EPUB', href: '/convert/docx-to-epub' },
      { label: 'TXT → EPUB', href: '/convert/txt-to-epub' },
    ],
    pdf: [
      { label: 'EPUB → PDF', href: '/convert/epub-to-pdf' },
      { label: 'AZW3 → PDF', href: '/convert/azw3-to-pdf' },
      { label: 'MOBI → PDF', href: '/convert/mobi-to-pdf' },
      { label: 'DJVU → PDF', href: '/convert/djvu-to-pdf' },
    ],
    mobi: [
      { label: 'EPUB → MOBI', href: '/convert/epub-to-mobi' },
      { label: 'AZW3 → MOBI', href: '/convert/azw3-to-mobi' },
      { label: 'MOBI → TXT', href: '/convert/mobi-to-txt' },
      { label: 'MOBI → EPUB', href: '/convert/mobi-to-epub' },
    ],
    azw3: [
      { label: 'EPUB → AZW3', href: '/convert/epub-to-azw3' },
      { label: 'AZW3 → EPUB', href: '/convert/azw3-to-epub' },
      { label: 'AZW3 → PDF', href: '/convert/azw3-to-pdf' },
      { label: 'AZW3 → MOBI', href: '/convert/azw3-to-mobi' },
    ],
    txt: [
      { label: 'TXT → EPUB', href: '/convert/txt-to-epub' },
      { label: 'MOBI → TXT', href: '/convert/mobi-to-txt' },
      { label: 'EPUB → TXT', href: '/convert/epub-to-txt' },
    ],
    docx: [
      { label: 'DOCX → EPUB', href: '/convert/docx-to-epub' },
      { label: 'EPUB → Word (DOCX)', href: '/convert/epub-word' },
    ],
    rtf: [
      { label: 'RTF → EPUB', href: '/convert/rtf-to-epub' },
      { label: 'EPUB → RTF', href: '/convert/epub-to-rtf' },
    ],
    jpg: [
      { label: 'EPUB → JPG', href: '/convert/epub-to-jpg' },
      { label: 'EPUB → PNG', href: '/convert/epub-to-png' },
    ],
    png: [
      { label: 'EPUB → PNG', href: '/convert/epub-to-png' },
      { label: 'EPUB → JPG', href: '/convert/epub-to-jpg' },
    ],
    html: [
      { label: 'HTML → EPUB', href: '/convert/html-to-epub' },
      { label: 'EPUB → HTML', href: '/convert/epub-to-html' },
    ],
    fb2: [
      { label: 'FB2 → EPUB', href: '/convert/fb2-to-epub' },
      { label: 'EPUB → FB2', href: '/convert/epub-to-fb2' },
    ],
    lit: [
      { label: 'LIT → EPUB', href: '/convert/lit-to-epub' },
      { label: 'EPUB → LIT', href: '/convert/epub-to-lit' },
    ],
    cbr: [
      { label: 'CBR → PDF', href: '/convert/cbr-to-pdf' },
    ],
    djvu: [
      { label: 'DJVU → PDF', href: '/convert/djvu-to-pdf' },
    ],
    doc: [
      { label: 'DOC → EPUB', href: '/convert/doc-to-epub' },
    ],
    word: [
      { label: 'EPUB → Word', href: '/convert/epub-word' },
    ],
    text: [
      { label: 'TXT → EPUB', href: '/convert/txt-to-epub' },
    ],
  }
  return converters[slug] || []
}

export const FORMAT_DATA: Record<string, FormatInfo> = {}
for (const [slug, data] of Object.entries(formatMap)) {
  FORMAT_DATA[slug] = {
    ...data,
    recommendedConverters: getRecommendedConverters(slug),
  }
}

export function getFormatData(slug: string): FormatInfo | undefined {
  return FORMAT_DATA[slug.toLowerCase()]
}

export const SUPPORTED_FORMAT_SLUGS = Object.keys(FORMAT_DATA)
