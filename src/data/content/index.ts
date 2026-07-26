import * as epub_to_azw3 from './epub-to-azw3';
import * as azw3_to_epub from './azw3-to-epub';
import * as epub_to_rtf from './epub-to-rtf';
import * as epub_to_jpg from './epub-to-jpg';
import * as epub_to_html from './epub-to-html';
import * as epub_to_doc from './epub-to-doc';
import * as fb2_to_epub from './fb2-to-epub';
import * as lit_to_epub from './lit-to-epub';
import * as epub_to_pdf from './epub-to-pdf';
import * as rtf_to_epub from './rtf-to-epub';
import * as epub_to_png from './epub-to-png';
import * as azw3_to_mobi from './azw3-to-mobi';
import * as mobi_to_txt from './mobi-to-txt';
import * as epub_to_word from './epub-to-word';
import * as docx_to_epub from './docx-to-epub';
import * as txt_to_epub from './txt-to-epub';
import * as html_to_epub from './html-to-epub';
import * as epub_to_text from './epub-to-text';
import * as azw3_to_pdf from './azw3-to-pdf';
import * as mobi_to_epub from './mobi-to-epub';
import * as epub_to_txt from './epub-to-txt';
import * as doc_to_epub from './doc-to-epub';
import * as cbr_to_pdf from './cbr-to-pdf';
import * as mobi_to_pdf from './mobi-to-pdf';
import * as pdf_to_epub from './pdf-to-epub';
import * as djvu_to_pdf from './djvu-to-pdf';
import * as epub_to_mobi from './epub-to-mobi';

export const CONTENT_MAP: Record<string, any> = {
  'epub-to-azw3': epub_to_azw3,
  'azw3-to-epub': azw3_to_epub,
  'epub-to-rtf': epub_to_rtf,
  'epub-to-jpg': epub_to_jpg,
  'epub-to-html': epub_to_html,
  'epub-to-doc': epub_to_doc,
  'fb2-to-epub': fb2_to_epub,
  'lit-to-epub': lit_to_epub,
  'epub-to-pdf': epub_to_pdf,
  'rtf-to-epub': rtf_to_epub,
  'epub-to-png': epub_to_png,
  'azw3-to-mobi': azw3_to_mobi,
  'mobi-to-txt': mobi_to_txt,
  'epub-to-word': epub_to_word,
  'docx-to-epub': docx_to_epub,
  'txt-to-epub': txt_to_epub,
  'html-to-epub': html_to_epub,
  'epub-to-text': epub_to_text,
  'azw3-to-pdf': azw3_to_pdf,
  'mobi-to-epub': mobi_to_epub,
  'epub-to-txt': epub_to_txt,
  'doc-to-epub': doc_to_epub,
  'cbr-to-pdf': cbr_to_pdf,
  'mobi-to-pdf': mobi_to_pdf,
  'pdf-to-epub': pdf_to_epub,
  'djvu-to-pdf': djvu_to_pdf,
  'epub-to-mobi': epub_to_mobi,
};

export function getContent(slug: string) {
  return CONTENT_MAP[slug] || null;
}
