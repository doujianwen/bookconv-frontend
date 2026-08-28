import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'epub-to-txt-extract'
export const title = 'EPUB to TXT: Extract Plain Text Without Losing Your Chapter Order'
export const problem = 'You need the words out of an EPUB — for quoting, indexing, or pasting into another tool — but a bad EPUB to TXT export dumps everything in one block with no chapter breaks. Here is how to extract clean plain text and keep the order.'
export const date = '2026-08-02'
export const tags = ['epub', 'txt', 'plain text', 'extract', 'ebook conversion']
export const formats = { source: 'epub', target: 'txt' }
export const keyTakeaways = [
  'TXT is plain text with no formatting, so conversion is about preserving reading order, not style.',
  'Chapter breaks survive only when the converter follows the EPUB heading structure.',
  'BookConv extracts EPUB to TXT in the browser and keeps paragraphs and chapter order intact.',
  'For the reverse direction (TXT into a real ebook), see the TXT to EPUB guide.',
]
export const content = {
  intro: 'Sometimes you do not want a fancy ebook — you want the text. Quoting a passage, feeding a manuscript into another tool, or searching across a book all call for plain text. EPUB to TXT strips the formatting and leaves the words, but a sloppy export loses your chapter breaks. This guide shows how to extract EPUB to TXT and keep the reading order.',
  sections: [
    {
      heading: 'When you actually need EPUB to TXT',
      body: `**TXT** is the simplest file format: pure characters, no styling. You reach for it when you need the words, not the layout — quoting in a document, running text through another processor, or making a book searchable. It is not a replacement for EPUB as a reading format; it is a side output. The reverse workflow, building a real ebook from text, is in [/blog/txt-to-epub](/blog/txt-to-epub).`,
    },
    {
      heading: 'What goes wrong in a bad EPUB to TXT export',
      body: `EPUB carries structure; TXT does not. Naive converters flatten everything:

- **Chapter breaks vanish** because the tool ignores the EPUB heading records.
- **Paragraphs merge** into one wall of text when line breaks are dropped.
- **Reading order scrambles** when the converter processes the EPUB spine out of sequence.

Your original EPUB is untouched; the converter just lost the structure on the way out.`,
    },
    {
      heading: 'Extract with BookConv (fastest)',
      body: `BookConv runs the Calibre engine in the browser, so you get a proper EPUB to TXT extraction with nothing to install. Upload the EPUB, choose **TXT**, and it follows the book spine to keep chapter and paragraph order. Start here: [/convert/epub-to-txt](/convert/epub-to-txt).`,
    },
    {
      heading: 'Extract with Calibre (more control)',
      body: `If you want to tune the output, Calibre converts EPUB to TXT with options for line endings and structure. Open the book, pick **Convert books → TXT**, then review the **TXT output** panel. A format overview is in [/blog/ebook-formats-explained](/blog/ebook-formats-explained). For choosing between desktop and online tools, see [/guide/calibre-vs-online-converter](/guide/calibre-vs-online-converter).`,
    },
    {
      heading: 'Check the result before you trust it',
      body: `Open the TXT in any editor and confirm two things: **chapter headings** still appear in order, and **paragraphs** are separated. If everything is one block, the converter dropped structural breaks — re-run with a tool that reads the EPUB spine.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Can I convert EPUB to TXT?', answer: 'Yes. Online converters like BookConv and desktop tools like Calibre both export EPUB to plain TXT.' },
  { question: 'Will EPUB to TXT keep my chapter order?', answer: 'It can, if the converter follows the EPUB spine and heading structure. BookConv preserves chapter and paragraph order during extraction.' },
  { question: 'Does EPUB to TXT keep formatting like bold or italics?', answer: 'No. TXT is plain text and cannot store styling. If you need formatting, keep the EPUB; use TXT only when you need the raw words.' },
  { question: 'Is BookConv free for EPUB to TXT?', answer: 'Yes. BookConv extracts EPUB to TXT in the browser at no cost for standard files, with no software to install.' },
  { question: 'What if I want a real ebook from my text instead?', answer: 'Convert the other way: TXT to EPUB rebuilds a reflowable ebook. See [/blog/txt-to-epub](/blog/txt-to-epub).' },
  { question: 'Why is my extracted TXT one giant block?', answer: 'Because the converter ignored the EPUB structure. Use a tool that reads the spine and heading records so paragraphs and chapters stay separated.' },
]
