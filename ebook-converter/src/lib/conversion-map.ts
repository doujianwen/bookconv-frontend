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
  "azw3-epub":  { tool: "js", description: "AZW3 to EPUB (Pure JS, no CloudConvert)" },
  "epub-rtf":   { tool: "js", description: "EPUB to RTF (Rich Text) (Pure JS, no CloudConvert)" },
  "epub-jpg":   { tool: "calibre+imagemagick", description: "EPUB to JPG Images (via PDF)" },
  "epub-html":  { tool: "calibre", description: "EPUB to HTMLZ (Zipped Web Pages)" },
  "epub-doc":   { tool: "calibre", description: "EPUB to DOC (Microsoft Word)" },
  "epub-pdf":   { tool: "calibre", description: "EPUB to PDF" },
  "epub-png":   { tool: "calibre+imagemagick", description: "EPUB to PNG Images (via PDF)" },
  "azw3-mobi":  { tool: "calibre", description: "AZW3 to MOBI (Legacy Kindle)" },
  "mobi-azw3":  { tool: "calibre", description: "MOBI to AZW3 (Kindle Format 8)" },
  "mobi-txt":   { tool: "js", description: "MOBI to TXT (Pure JS, no Calibre)" },
  "azw3-txt":   { tool: "js", description: "AZW3 to TXT (Pure JS, no Calibre)" },
  "docx-txt":   { tool: "js", description: "DOCX to TXT (Pure JS, no Calibre)" },
  "html-txt":   { tool: "js", description: "HTML to TXT (Pure JS, no Calibre)" },
  "epub-docx":  { tool: "js", description: "EPUB to Word (DOCX) (Pure JS, no CloudConvert)" },
  "docx-epub":  { tool: "js", description: "DOCX to EPUB (Pure JS text fallback, no CloudConvert)" },
  "txt-epub":   { tool: "js", description: "TXT to EPUB (Pure JS, no CloudConvert)" },
  "html-epub":  { tool: "js", description: "HTML to EPUB (Pure JS text fallback, no CloudConvert)" },
  "epub-txt":   { tool: "js", description: "EPUB to TXT (Pure JS, no CloudConvert)" },
  "azw3-pdf":   { tool: "calibre", description: "AZW3 to PDF" },
  "mobi-epub":  { tool: "js", description: "MOBI to EPUB (Pure JS, no CloudConvert)" },
  "doc-epub":   { tool: "libreoffice+calibre", description: "DOC to EPUB (via LibreOffice)" },
  "cbr-pdf":    { tool: "calibre", description: "CBR to PDF" },
  "mobi-pdf":   { tool: "calibre", description: "MOBI to PDF" },
  "pdf-epub":   { tool: "calibre", description: "PDF to EPUB (CloudConvert; PDF text extraction)" },
  "djvu-pdf":   { tool: "calibre", description: "DJVU to PDF" },
  "epub-mobi":  { tool: "calibre", description: "EPUB to MOBI" },
  "epub-zip":   { tool: "passthrough", description: "EPUB to ZIP (EPUB is already a ZIP archive)" },
  "lit-mobi":   { tool: "calibre", description: "LIT to MOBI (Kindle)" },
  "azw-mobi":   { tool: "calibre", description: "AZW to MOBI (Kindle)" },
  "chm-mobi":   { tool: "calibre", description: "CHM to MOBI (Kindle)" },
  "epub-epub":  { tool: "js", description: "EPUB to EPUB (Pure JS re-pack, text fallback)" },
  "rtf-epub":   { tool: "js", description: "RTF to EPUB (Pure JS text fallback, no CloudConvert)" },
  "fb2-epub":   { tool: "js", description: "FB2 to EPUB (Pure JS text fallback, no CloudConvert)" },
  "lit-epub":   { tool: "js", description: "LIT to EPUB (Pure JS text fallback, no CloudConvert)" },

  // ── Pure-JS text-derived family (2026-10-22) ──────────────────────────────
  // Every text source (epub/mobi/azw3/docx/html/rtf/fb2/lit/txt) can be routed
  // to every text target (epub/rtf/docx/fb2/txt) via extract(source) → plain
  // text → synthesize(target). These are immune to the CloudConvert 402 quota
  // wall. Identity pairs (e.g. epub-epub) are excluded from this block because
  // they are registered individually above.
  "epub-fb2":   { tool: "js", description: "EPUB to FB2 (FictionBook) (Pure JS, no CloudConvert)" },
  "mobi-rtf":   { tool: "js", description: "MOBI to RTF (Pure JS text fallback, no CloudConvert)" },
  "mobi-docx":  { tool: "js", description: "MOBI to Word (DOCX) (Pure JS text fallback, no CloudConvert)" },
  "mobi-fb2":   { tool: "js", description: "MOBI to FB2 (Pure JS text fallback, no CloudConvert)" },
  "azw3-rtf":   { tool: "js", description: "AZW3 to RTF (Pure JS text fallback, no CloudConvert)" },
  "azw3-docx":  { tool: "js", description: "AZW3 to Word (DOCX) (Pure JS text fallback, no CloudConvert)" },
  "azw3-fb2":   { tool: "js", description: "AZW3 to FB2 (Pure JS text fallback, no CloudConvert)" },
  "docx-rtf":   { tool: "js", description: "DOCX to RTF (Pure JS text fallback, no CloudConvert)" },
  "docx-fb2":   { tool: "js", description: "DOCX to FB2 (Pure JS text fallback, no CloudConvert)" },
  "html-rtf":   { tool: "js", description: "HTML to RTF (Pure JS text fallback, no CloudConvert)" },
  "html-docx":  { tool: "js", description: "HTML to Word (DOCX) (Pure JS text fallback, no CloudConvert)" },
  "html-fb2":   { tool: "js", description: "HTML to FB2 (Pure JS text fallback, no CloudConvert)" },
  "rtf-docx":   { tool: "js", description: "RTF to Word (DOCX) (Pure JS text fallback, no CloudConvert)" },
  "rtf-fb2":    { tool: "js", description: "RTF to FB2 (Pure JS text fallback, no CloudConvert)" },
  "rtf-txt":    { tool: "js", description: "RTF to TXT (Pure JS, no CloudConvert)" },
  "fb2-rtf":    { tool: "js", description: "FB2 to RTF (Pure JS text fallback, no CloudConvert)" },
  "fb2-docx":   { tool: "js", description: "FB2 to Word (DOCX) (Pure JS text fallback, no CloudConvert)" },
  "fb2-txt":    { tool: "js", description: "FB2 to TXT (Pure JS, no CloudConvert)" },
  "lit-rtf":    { tool: "js", description: "LIT to RTF (Pure JS text fallback, no CloudConvert)" },
  "lit-docx":   { tool: "js", description: "LIT to Word (DOCX) (Pure JS text fallback, no CloudConvert)" },
  "lit-fb2":    { tool: "js", description: "LIT to FB2 (Pure JS text fallback, no CloudConvert)" },
  "lit-txt":    { tool: "js", description: "LIT to TXT (Pure JS, no CloudConvert)" },
  "txt-rtf":    { tool: "js", description: "TXT to RTF (Pure JS, no CloudConvert)" },
  "txt-docx":   { tool: "js", description: "TXT to Word (DOCX) (Pure JS, no CloudConvert)" },
  "txt-fb2":    { tool: "js", description: "TXT to FB2 (Pure JS, no CloudConvert)" },
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
