export interface ConversionCommand {
  tool: "calibre" | "calibre+imagemagick" | "libreoffice+calibre" | "djvulibre"
  command: (input: string, output: string) => string
  description: string
}

type ConversionMap = Record<string, ConversionCommand>

function calibre(input: string, output: string): string {
  return `ebook-convert "${input}" "${output}"`
}

function calibreToPdfThenImages(format: "jpg" | "png"): (input: string, output: string) => string {
  return (input: string, output: string) =>
    `ebook-convert "${input}" temp.pdf && magick convert temp.pdf "${output}-%03d.${format}" && rm temp.pdf`
}

function libreofficeThenCalibre(input: string, output: string): string {
  return `soffice --headless --convert-to docx "${input}" && ebook-convert "${input.replace(/\.[^.]+$/, ".docx")}" "${output}"`
}

function djvu(input: string, output: string): string {
  return `ddjvu -format=pdf "${input}" "${output}"`
}

export const CONVERSION_MAP: ConversionMap = {
  "epub-azw3":  { tool: "calibre", command: calibre, description: "EPUB to AZW3 (Kindle Format 8)" },
  "azw3-epub":  { tool: "calibre", command: calibre, description: "AZW3 to EPUB (Universal E-book)" },
  "epub-rtf":   { tool: "calibre", command: calibre, description: "EPUB to RTF (Rich Text)" },
  "epub-jpg":   { tool: "calibre+imagemagick", command: calibreToPdfThenImages("jpg"), description: "EPUB to JPG Images" },
  "epub-html":  { tool: "calibre", command: calibre, description: "EPUB to HTMLZ (Zipped Web Pages, use .htmlz extension)" },
  "epub-doc":   { tool: "calibre", command: calibre, description: "EPUB to DOC (Microsoft Word)" },
  "fb2-epub":   { tool: "calibre", command: calibre, description: "FB2 to EPUB" },
  "lit-epub":   { tool: "calibre", command: calibre, description: "LIT to EPUB (Rescue Old MS Reader Files)" },
  "epub-pdf":   { tool: "calibre", command: calibre, description: "EPUB to PDF" },
  "rtf-epub":   { tool: "calibre", command: calibre, description: "RTF to EPUB" },
  "epub-png":   { tool: "calibre+imagemagick", command: calibreToPdfThenImages("png"), description: "EPUB to PNG Images" },
  "azw3-mobi":  { tool: "calibre", command: calibre, description: "AZW3 to MOBI (Legacy Kindle)" },
  "mobi-txt":   { tool: "calibre", command: calibre, description: "MOBI to TXT (Plain Text)" },
  "epub-word":  { tool: "calibre", command: calibre, description: "EPUB to Word (DOCX)" },
  "docx-epub":  { tool: "calibre", command: calibre, description: "DOCX to EPUB" },
  "txt-epub":   { tool: "calibre", command: calibre, description: "TXT to EPUB" },
  "html-epub":  { tool: "calibre", command: calibre, description: "HTML to EPUB" },
  "epub-text":  { tool: "calibre", command: calibre, description: "EPUB to Text" },
  "azw3-pdf":   { tool: "calibre", command: calibre, description: "AZW3 to PDF" },
  "mobi-epub":  { tool: "calibre", command: calibre, description: "MOBI to EPUB" },
  "epub-txt":   { tool: "calibre", command: calibre, description: "EPUB to TXT" },
  "doc-epub":   { tool: "libreoffice+calibre", command: libreofficeThenCalibre, description: "DOC to EPUB" },
  "cbr-pdf":    { tool: "calibre", command: calibre, description: "CBR to PDF" },
  "mobi-pdf":   { tool: "calibre", command: calibre, description: "MOBI to PDF" },
  "pdf-epub":   { tool: "calibre", command: calibre, description: "PDF to EPUB" },
  "djvu-pdf":   { tool: "djvulibre", command: djvu, description: "DJVU to PDF" },
  "epub-mobi":  { tool: "calibre", command: calibre, description: "EPUB to MOBI" },
}

export function getConversionKey(source: string, target: string): string {
  return `${source.toLowerCase()}-${target.toLowerCase()}`
}

export function getConversion(source: string, target: string): ConversionCommand | undefined {
  return CONVERSION_MAP[getConversionKey(source, target)]
}

export const SUPPORTED_FORMATS = Array.from(
  new Set(Object.keys(CONVERSION_MAP).flatMap((k) => k.split("-")))
).sort()

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
  word: "Word",
  text: "Text",
}
