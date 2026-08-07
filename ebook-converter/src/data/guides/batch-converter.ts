import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'batch-converter'
export const title = 'Batch Ebook Converter: How to Convert Many Files (and What BookConv Does)'
export const problem = 'Need to convert a hundred ebooks at once? Here is the honest split — what a true batch converter does, and where single-file tools like BookConv fit.'
export const date = '2026-08-07'
export const tags = ['batch ebook converter', 'bulk convert', 'calibre cli', 'automate']
export const keyTakeaways = [
  'True batch conversion is best done with Calibre’s command line or desktop app.',
  'BookConv converts one file at a time in the browser — fast for occasional jobs.',
  'For recurring bulk work, automate Calibre instead of uploading files one by one.',
  'You can still prep individual files for AI or Kindle with BookConv.',
]
export const formats = { source: 'epub', target: 'pdf' }
export const content = {
  intro: '“Batch ebook converter” implies converting dozens or hundreds of files in one run. Browser converters are built for one file at a time, so the honest answer is: use the right tool for the volume. This page explains the split and gives you a working path for both.',
  sections: [
    {
      heading: 'What “batch conversion” actually needs',
      body: `Batch work means:\n\n- **Many files** processed in one job.\n- **Automation** — a folder watch, a script, or a queue.\n- **No manual re-upload** per file.\n\nA browser tool with a single upload box is not built for this. BookConv converts one file at a time.`,
    },
    {
      heading: 'The batch path: Calibre command line',
      body: `For real bulk work, Calibre’s ebook-convert command (part of the desktop install) handles folders:\n\n- Install Calibre on your machine.\n- Use its command-line tools to loop over a folder.\n- Keep the job fully offline.\n\nBecause BookConv runs on the same Calibre engine, the output quality matches — you just trade the browser UI for automation.`,
    },
    {
      heading: 'Where BookConv fits',
      body: `BookConv is the right call when:\n\n- You have **a few files**, not hundreds.\n- You want **no install** and an immediate result.\n- You are **prepping one file** for AI ingestion or Kindle.\n\nFor those cases, batch tooling is overkill. Convert here: [Mobi to EPUB](/convert/mobi-to-epub).`,
    },
    {
      heading: 'A practical decision rule',
      body: `**Files ≤ a handful:** use BookConv, no setup.\n\n**Files in the dozens/hundreds, recurring:** script Calibre’s command line.\n\n**Sensitive files in bulk:** Calibre offline — never upload a manuscript batch to a server.\n\nMatch the tool to the volume; don’t force a browser tool into a bulk role.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Does BookConv support batch conversion?', answer: 'No. BookConv converts one file at a time in the browser. For true batch work, Calibre’s command-line tools are the right choice.' },
  { question: 'How do I batch convert ebooks for free?', answer: 'Use Calibre (free, open-source) on your machine — its command-line converter can process a folder of files. BookConv is better suited to one-off browser conversions.' },
  { question: 'Can I automate ebook conversion?', answer: 'Yes, with Calibre’s command-line tools you can script conversions over many files. Browser converters like BookConv are designed for manual, single-file use.' },
  { question: 'Is there a bulk converter better than uploading one by one?', answer: 'For bulk, a local tool (Calibre CLI) beats any upload-based converter because there is no per-file upload and the work stays offline.' },
  { question: 'Can I still use BookConv for part of a bulk workflow?', answer: 'Yes. You can prep individual tricky files (for example Mobi to EPUB) in BookConv, then handle the bulk with Calibre.' },
]
