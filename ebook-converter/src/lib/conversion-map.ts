/**
 * Conversion map — defines supported format pairs and metadata.
 *
 * The `command` field was removed: the queue worker always calls
 * `ebook-convert` directly via Calibre CLI. Shell command strings
 * in the original map (ImageMagick, LibreOffice, djvulibre) were
 * dead code — never executed.
 *
 * The `tool` and `description` fields are kept for UI display only
 * (shown on the conversion page to inform users what backend is used).
 */

export interface ConversionEntry {
  tool: string; // e.g. "calibre", "calibre+imagemagick", "libreoffice+calibre"
  description: string;
}

type ConversionMap = Record<string, ConversionEntry>;

/** Display name aliases: maps user-friendly names to real Calibre format identifiers. */
const DISPLAY_NAME_TO_REAL: Record<string, string> = {
  word: "docx",
  text: "txt",
};

export const CONVERSION_MAP: ConversionMap = {
  "epub-azw3":  { tool: "calibre", description: "EPUB to AZW3 (Kindle Format 8)" },
  "azw3-epub":  { tool: "calibre", description: "AZW3 to EPUB (Universal E-book)" },
  "epub-rtf":   { tool: "calibre", description: "EPUB to RTF (Rich Text)" },
  "epub-jpg":   { tool: "calibre+imagemagick", description: "EPUB to JPG Images (via PDF)" },
  "epub-html":  { tool: "calibre", description: "EPUB to HTMLZ (Zipped Web Pages)" },
  "epub-doc":   { tool: "calibre", description: "EPUB to DOC (Microsoft Word)" },
  "fb2-epub":   { tool: "calibre", description: "FB2 to EPUB" },
  "lit-epub":   { tool: "calibre", description: "LIT to EPUB (Old MS Reader Files)" },
  "epub-pdf":   { tool: "calibre", description: "EPUB to PDF" },
  "rtf-epub":   { tool: "calibre", description: "RTF to EPUB" },
  "epub-png":   { tool: "calibre+imagemagick", description: "EPUB to PNG Images (via PDF)" },
  "azw3-mobi":  { tool: "calibre", description: "AZW3 to MOBI (Legacy Kindle)" },
  "mobi-txt":   { tool: "calibre", description: "MOBI to TXT (Plain Text)" },
  "epub-docx":  { tool: "calibre", description: "EPUB to Word (DOCX)" },
  "docx-epub":  { tool: "calibre", description: "DOCX to EPUB" },
  "txt-epub":   { tool: "calibre", description: "TXT to EPUB" },
  "html-epub":  { tool: "calibre", description: "HTML to EPUB" },
  "epub-txt":   { tool: "js", description: "EPUB to TXT (Pure JS, no Calibre)" },
  "azw3-pdf":   { tool: "calibre", description: "AZW3 to PDF" },
  "mobi-epub":  { tool: "calibre", description: "MOBI to EPUB" },
  "doc-epub":   { tool: "libreoffice+calibre", description: "DOC to EPUB (via LibreOffice)" },
  "cbr-pdf":    { tool: "calibre", description: "CBR to PDF" },
  "mobi-pdf":   { tool: "calibre", description: "MOBI to PDF" },
  "pdf-epub":   { tool: "calibre", description: "PDF to EPUB" },
  "djvu-pdf":   { tool: "calibre", description: "DJVU to PDF" },
  "epub-mobi":  { tool: "calibre", description: "EPUB to MOBI" },
  "epub-zip":   { tool: "passthrough", description: "EPUB to ZIP (EPUB is already a ZIP archive)" },
  "lit-mobi":   { tool: "calibre", description: "LIT to MOBI (Kindle)" },
  "azw-mobi":   { tool: "calibre", description: "AZW to MOBI (Kindle)" },
  "chm-mobi":   { tool: "calibre", description: "CHM to MOBI (Kindle)" },
};

/** Resolve display name aliases to real Calibre format identifiers. */
export function normalizeFormat(format: string): string {
  const normalized = format.toLowerCase().replace(".", "");
  return DISPLAY_NAME_TO_REAL[normalized] || normalized;
}

export function getConversionKey(source: string, target: string): string {
  return `${source.toLowerCase()}-${target.toLowerCase()}`;
}

export function getConversion(source: string, target: string): ConversionEntry | undefined {
  // Normalize display-name aliases (word→docx, text→txt) before lookup
  const s = normalizeFormat(source);
  const t = normalizeFormat(target);
  return CONVERSION_MAP[getConversionKey(s, t)];
}

/**
 * Derive supported formats from CONVERSION_MAP keys.
 * Only includes formats that appear as valid Calibre format identifiers.
 */
export const SUPPORTED_FORMATS = Array.from(
  new Set(Object.keys(CONVERSION_MAP).flatMap((k) => k.split("-")))
).sort();

export const FORMAT_DISPLAY_NAMES: Record<string, string> = {
  epub: "EPUB",
  azw3: "AZW3",
  mobi: "MOBI",
  pdf: "PDF",
  txt: "TXT",
  doc: "DOC",
  docx: "DOCX",
  rtf: "RTF",
  html: "HTML",
  fb2: "FB2",
  lit: "LIT",
  cbr: "CBR",
  djvu: "DJVU",
  jpg: "JPG",
  png: "PNG",
  zip: "ZIP",
  azw: "AZW",
  chm: "CHM",
};
