import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'batch-converter'
export const title = 'Batch Ebook Converter: Convert Many Files with BookConv (and When to Use Calibre)'
export const problem = 'Need to convert a stack of ebooks at once? Here is the honest split — BookConv now handles batches in the browser, and Calibre CLI is still the stronger fit for hundreds of files.'
export const date = '2026-08-07'
export const tags = ['batch ebook converter', 'bulk convert', 'calibre cli', 'automate']
export const keyTakeaways = [
  'BookConv supports batch conversion in the browser — upload up to 20 files and download a ZIP of results.',
  'Batch is included with BookConv Pro; the single-file converter stays free for occasional jobs.',
  'For hundreds of files or recurring bulk work, Calibre’s command line is still the stronger fit.',
  'Every batch file converts to the target format you pick, with no software install.',
]
export const formats = { source: 'epub', target: 'pdf' }
export const content = {
  intro: 'A “batch ebook converter” turns a pile of files into a pile of converted files in one run. BookConv now does this in the browser: upload up to 20 ebooks, pick one target format, and download everything as a single ZIP. This page shows how BookConv batch works, where it fits, and when a local tool like Calibre is still the better call.',
  sections: [
    {
      heading: 'How batch conversion works in BookConv',
      body: `BookConv’s batch tool runs in your browser:\n\n- **Upload up to 20 files** of a supported format.\n- **Pick one target format** — every file converts to it.\n- **Download a ZIP** of the converted ebooks when the run finishes.\n\nEach file is sent through BookConv’s conversion API and packaged locally, so there is no separate batch server to wait on. Open it here: [BookConv Batch Converter](/batch).`,
    },
    {
      heading: 'When BookConv batch is the right call',
      body: `BookConv batch fits when:\n\n- You have **a stack of files** (up to 20) to convert in one go.\n- You want **no install** and a result in minutes.\n- You are **prepping files** for Kindle or AI ingestion.\n\nFor those jobs, scripting a local tool is overkill. Try a single conversion first: [Mobi to EPUB](/convert/mobi-to-epub).`,
    },
    {
      heading: 'When Calibre’s command line is stronger',
      body: `For real bulk work, Calibre’s ebook-convert command (part of the desktop install) still wins:\n\n- It processes **folders of hundreds** of files.\n- It **automates** recurring jobs with a script or folder watch.\n- The work stays **fully offline**.\n\nFor large volumes, a local tool gives you scale and offline control that a browser upload cannot match.`,
    },
    {
      heading: 'A practical decision rule',
      body: `**A few files up to 20:** use [BookConv Batch](/batch), no setup.\n\n**Hundreds of files, recurring:** script Calibre’s command line.\n\n**Sensitive manuscripts in bulk:** Calibre offline — keep the files on your machine.\n\nMatch the tool to the volume; BookConv batch covers the everyday pile, Calibre covers the warehouse.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Does BookConv support batch conversion?', answer: 'Yes. BookConv’s batch converter lets you upload up to 20 ebooks, choose one target format, and download the converted files as a single ZIP. Batch is included with BookConv Pro.' },
  { question: 'How many files can I convert in a batch?', answer: 'Up to 20 files per batch, with each file up to 10 MB. For larger books, convert them one at a time or use a desktop tool such as Calibre.' },
  { question: 'How do I batch convert ebooks for free?', answer: 'The single-file converter on BookConv is free for occasional jobs. Batch conversion is part of BookConv Pro; for large free bulk work, Calibre’s command-line tools on your machine are a strong alternative.' },
  { question: 'Can I automate ebook conversion?', answer: 'BookConv batch handles a one-time pile of up to 20 files in the browser. For recurring automation over many files, Calibre’s command-line tools let you script conversions.' },
  { question: 'What formats can I batch convert?', answer: 'The same formats as the single-file converter — EPUB, PDF, MOBI, AZW3, TXT, DOCX, RTF, FB2, DJVU and more — with every file in the batch converting to the target format you choose.' },
]
