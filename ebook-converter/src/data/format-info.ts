// FormatInfo Database — Source of Truth for All Convert Pages
// One-time asset, reused across all 52 pages of D3 differentiation.
// Each format has: developer, version history, characteristics, use cases, and external authority links.

export type FormatInfo = {
  slug: string;
  name: string;
  fullName: string;
  developer: string;
  initialRelease: string;
  latestVersion: string;
  latestVersionDate: string;
  type: 'reflowable' | 'fixed' | 'container' | 'text';
  openStandard: boolean;
  primaryUse: string[];
  limitations: string[];
  authorityLinks: { label: string; url: string }[];
};

export const FORMAT_INFO: Record<string, FormatInfo> = {
  epub: {
    slug: 'epub',
    name: 'EPUB',
    fullName: 'Electronic Publication',
    developer: 'IDPF (International Digital Publishing Forum)',
    initialRelease: '2007',
    latestVersion: '3.3',
    latestVersionDate: '2023-05',
    type: 'reflowable',
    openStandard: true,
    primaryUse: [
      'Universal ebook format for most e-readers',
      'Apple Books, Google Play Books, Kobo, Nook',
      'Web reading platforms and libraries',
    ],
    limitations: [
      'Not natively supported by older Kindle devices (pre-2022)',
      'Complex layouts may not render consistently',
      'Interactive features require EPUB 3 support',
    ],
    authorityLinks: [
      { label: 'W3C EPUB 3.3 Specification', url: 'https://www.w3.org/publishing/epub3/' },
      { label: 'IDPF Official Site', url: 'https://idpf.org/' },
    ],
  },
  mobi: {
    slug: 'mobi',
    name: 'MOBI',
    fullName: 'Mobipocket',
    developer: 'Mobipocket / Amazon',
    initialRelease: '2000',
    latestVersion: 'KF8 (old MOBI)',
    latestVersionDate: '2011',
    type: 'reflowable',
    openStandard: false,
    primaryUse: [
      'Legacy Kindle devices (pre-2016)',
      'Kindle Paperwhite 1-3rd gen',
      'Kindle Keyboard and basic Kindle models',
    ],
    limitations: [
      'Dropped from Kindle after 2016',
      'No EPUB 3 modern features (video, audio, fixed layout)',
      'Limited CSS support compared to EPUB',
      'Font embedding not supported',
    ],
    authorityLinks: [
      { label: 'Amazon Kindle Formats', url: 'https://www.amazon.com/gp/help/customer/display.html?nodeId=200734350' },
    ],
  },
  azw3: {
    slug: 'azw3',
    name: 'AZW3',
    fullName: 'Amazon Kindle Format 8',
    developer: 'Amazon',
    initialRelease: '2011',
    latestVersion: 'AZW3',
    latestVersionDate: '2011',
    type: 'reflowable',
    openStandard: false,
    primaryUse: [
      'Modern Kindle devices (Paperwhite 3+, Oasis, Kindle Scribe)',
      'High-quality typography and layout',
      'Font embedding and advanced styling',
    ],
    limitations: [
      'Only works on Kindle ecosystem',
      'Not supported by other e-readers',
      'Proprietary format with limited tools',
    ],
    authorityLinks: [
      { label: 'Amazon AZW3 Documentation', url: 'https://www.amazon.com/gp/help/customer/display.html?nodeId=200734350' },
    ],
  },
  pdf: {
    slug: 'pdf',
    name: 'PDF',
    fullName: 'Portable Document Format',
    developer: 'Adobe Systems',
    initialRelease: '1993',
    latestVersion: '2.0 (ISO 32000-2)',
    latestVersionDate: '2017',
    type: 'fixed',
    openStandard: true,
    primaryUse: [
      'Print-ready documents and ebooks',
      'Academic papers and textbooks',
      'Preserving exact layout and formatting',
    ],
    limitations: [
      'Not reflowable — fixed page size',
      'Poor mobile reading experience',
      'Large file sizes for image-heavy content',
      'Limited text extraction for editing',
    ],
    authorityLinks: [
      { label: 'ISO 32000-2 PDF Specification', url: 'https://www.iso.org/standard/68515.html' },
      { label: 'Adobe PDF Resources', url: 'https://www.adobe.com/devnet/pdf.html' },
    ],
  },
  txt: {
    slug: 'txt',
    name: 'TXT',
    fullName: 'Plain Text',
    developer: 'Various (de facto standard)',
    initialRelease: '1960s',
    latestVersion: 'N/A',
    latestVersionDate: 'N/A',
    type: 'text',
    openStandard: true,
    primaryUse: [
      'Basic text storage and transfer',
      'Programming source code',
      'Legacy system compatibility',
    ],
    limitations: [
      'No formatting or structure',
      'No metadata (title, author, TOC)',
      'No images or multimedia',
      'Encoding issues across systems',
    ],
    authorityLinks: [
      { label: 'UTF-8 Standard (RFC 3629)', url: 'https://tools.ietf.org/html/rfc3629' },
    ],
  },
  docx: {
    slug: 'docx',
    name: 'DOCX',
    fullName: 'Office Open XML',
    developer: 'Microsoft',
    initialRelease: '2007',
    latestVersion: 'ISO/IEC 29500',
    latestVersionDate: '2016',
    type: 'container',
    openStandard: true,
    primaryUse: [
      'Word processing documents',
      'Business and academic writing',
      'Collaborative document editing',
    ],
    limitations: [
      'Not an ebook format — needs conversion',
      'Complex layouts may not translate well',
      'Font dependencies',
    ],
    authorityLinks: [
      { label: 'ISO 29500 Standard', url: 'https://www.iso.org/standard/46255.html' },
      { label: 'Microsoft Office Open XML', url: 'https://www.ecma-international.org/techstandards/eco-schemes/default.aspx?sc_o=ECMA-Scheme&sd_id=462' },
    ],
  },
  fb2: {
    slug: 'fb2',
    name: 'FB2',
    fullName: 'FictionBook',
    developer: 'Digital Firebird',
    initialRelease: '2003',
    latestVersion: 'FB2.1',
    latestVersionDate: '2008',
    type: 'reflowable',
    openStandard: true,
    primaryUse: [
      'Russian-language ebook distribution',
      'LitRes and similar platforms',
      'Simple fiction formats',
    ],
    limitations: [
      'Limited geographic adoption (mainly Russia/CIS)',
      'Simpler feature set than EPUB',
      'Fewer e-reader supports natively',
    ],
    authorityLinks: [
      { label: 'FictionBook Specification', url: 'http://www.fictionbook.org/index.php/Eng:index' },
    ],
  },
  cbr: {
    slug: 'cbr',
    name: 'CBR',
    fullName: 'Comic Book RAR',
    developer: 'DC Comics /RAR team',
    initialRelease: '1995',
    latestVersion: 'CBR/CBZ',
    latestVersionDate: '1995',
    type: 'container',
    openStandard: false,
    primaryUse: [
      'Comic books and manga',
      'Image-based publications',
      'Archived comic collections',
    ],
    limitations: [
      'Large file sizes',
      'Not reflowable',
      'Requires comic reader software',
    ],
    authorityLinks: [
      { label: 'RAR Format Documentation', url: 'https://www.rarlab.com/technote.htm' },
    ],
  },
  chm: {
    slug: 'chm',
    name: 'CHM',
    fullName: 'Compiled HTML Help',
    developer: 'Microsoft',
    initialRelease: '1997',
    latestVersion: 'CHM',
    latestVersionDate: '1997',
    type: 'fixed',
    openStandard: false,
    primaryUse: [
      'Windows Help files',
      'Technical documentation',
      'Software manuals',
    ],
    limitations: [
      'Windows-only native support',
      'Security restrictions on modern systems',
      'Not an ebook format',
    ],
    authorityLinks: [
      { label: 'Microsoft CHM Documentation', url: 'https://docs.microsoft.com/en-us/windows/win32/help/overview' },
    ],
  },
  djvu: {
    slug: 'djvu',
    name: 'DJVU',
    fullName: 'DjVu',
    developer: 'AT&T Labs',
    initialRelease: '1996',
    latestVersion: 'DjVuIM',
    latestVersionDate: '1999',
    type: 'fixed',
    openStandard: false,
    primaryUse: [
      'Scanned documents and books',
      'Archive preservation',
      'High-compression image storage',
    ],
    limitations: [
      'Requires specialized viewer',
      'Not supported by most e-readers',
      'Complex compression',
    ],
    authorityLinks: [
      { label: 'DjVu Technologies', url: 'https://sourceforge.net/projects/djvu/' },
    ],
  },
  rtf: {
    slug: 'rtf',
    name: 'RTF',
    fullName: 'Rich Text Format',
    developer: 'Microsoft',
    initialRelease: '1987',
    latestVersion: 'RTF 1.9',
    latestVersionDate: '2009',
    type: 'text',
    openStandard: true,
    primaryUse: [
      'Cross-platform text exchange',
      'Legacy word processing',
      'Simple formatted text',
    ],
    limitations: [
      'Limited formatting capabilities',
      'Not an ebook format',
      'Large file sizes compared to DOCX',
    ],
    authorityLinks: [
      { label: 'RTF Specification', url: 'https://www.biblioscape.com/rtf_specification.htm' },
    ],
  },
  html: {
    slug: 'html',
    name: 'HTML',
    fullName: 'HyperText Markup Language',
    developer: 'W3C',
    initialRelease: '1993',
    latestVersion: 'HTML5.3',
    latestVersionDate: '2017',
    type: 'container',
    openStandard: true,
    primaryUse: [
      'Web pages and online content',
      'EPUB internal structure',
      'Documentation and wikis',
    ],
    limitations: [
      'Browser-dependent rendering',
      'Not a packaged ebook format',
      'Requires web server for hosting',
    ],
    authorityLinks: [
      { label: 'W3C HTML Standard', url: 'https://html.spec.whatwg.org/' },
    ],
  },
  jpg: {
    slug: 'jpg',
    name: 'JPG',
    fullName: 'JPEG Image',
    developer: 'JPEG Committee',
    initialRelease: '1992',
    latestVersion: 'JPEG XL (2021)',
    latestVersionDate: '2021',
    type: 'container',
    openStandard: true,
    primaryUse: [
      'Photography and web images',
      'Compressed image storage',
      'Digital artwork',
    ],
    limitations: [
      'Lossy compression',
      'No text or structure',
      'Not an ebook format',
    ],
    authorityLinks: [
      { label: 'ISO/IEC 10918 JPEG Standard', url: 'https://www.iso.org/standard/34460.html' },
    ],
  },
  png: {
    slug: 'png',
    name: 'PNG',
    fullName: 'Portable Network Graphics',
    developer: 'PNG Development Group',
    initialRelease: '1996',
    latestVersion: 'PNG 1.2',
    latestVersionDate: '2003',
    type: 'container',
    openStandard: true,
    primaryUse: [
      'Web graphics with transparency',
      'Screenshots and diagrams',
      'Lossless image storage',
    ],
    limitations: [
      'Larger file sizes than JPG',
      'No animation support (APNG is extension)',
      'Not an ebook format',
    ],
    authorityLinks: [
      { label: 'W3C PNG Specification', url: 'https://www.w3.org/TR/PNG/' },
    ],
  },
  zip: {
    slug: 'zip',
    name: 'ZIP',
    fullName: 'ZIP Archive',
    developer: 'Phil Katz / PKWARE',
    initialRelease: '1989',
    latestVersion: 'ZIP 6.3',
    latestVersionDate: '2006',
    type: 'container',
    openStandard: true,
    primaryUse: [
      'File archiving and compression',
      'EPUB/AZW3 package containers',
      'Distributable ebook sources',
    ],
    limitations: [
      'Not a reading format',
      'Requires extraction',
      'Limited compression vs 7z/xz',
    ],
    authorityLinks: [
      { label: 'ZIP File Format Specification', url: 'https://www.pkware.com/documents/casestudies/APPNOTE.TXT' },
    ],
  },
};

// Export summary for quick reference
export const FORMAT_SUMMARIES = Object.fromEntries(
  Object.entries(FORMAT_INFO).map(([key, info]) => [
    key,
    {
      slug: info.slug,
      name: info.name,
      type: info.type,
      developer: info.developer,
      initialRelease: info.initialRelease,
      openStandard: info.openStandard,
      primaryUse: info.primaryUse[0],
    },
  ])
);
