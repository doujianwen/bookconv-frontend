import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'calibre-vs-online-converter'
export const title = 'Calibre vs Online Converters: Which Should You Actually Use?'
export const problem = 'Calibre is powerful but heavy. Online converters are instant but raise privacy questions. Here is the honest trade-off — and when each one wins.'
export const date = '2026-08-02'
export const tags = ['calibre', 'online converter', 'privacy', 'ebook tools']
export const keyTakeaways = [
  'Calibre wins for batch jobs, device-specific tweaks, and offline/private workflows.',
  'Online converters win for one-off files, zero install, and automatic image/format handling.',
  'Privacy is the real difference: local tools never upload your file; online tools process it on a server.',
  'For most people a free online converter like BookConv covers daily needs without the setup.',
]
export const content = {
  intro: 'Every "how do I convert this ebook" thread ends with the same two answers: install Calibre, or use an online converter. Both are right — for different jobs. This guide lays out the real trade-offs so you can pick without installing something you will use once.',
  sections: [
    {
      heading: 'What Calibre does well',
      body: `Calibre is a full library manager, not just a converter. It shines when you:\n\n- Convert **in bulk** (hundreds of files, watched folders, recipes).\n- Need fine control over **page size, margins, fonts, and device profiles**.\n- Want everything to stay **on your machine** — no upload, no account.\n\nThe cost is setup. Calibre is a desktop app with a learning curve, and its PDF output in particular is functional but plain.`,
    },
    {
      heading: 'What online converters do well',
      body: `A browser-based converter like [BookConv](https://www.bookconv.com) trades depth for speed:\n\n- **No install** — open the page, drop the file, download the result.\n- Automatic handling of **images, SVG covers, and format quirks** (the things that break EPUB→PDF and PDF→EPUB).\n- Consistent results for **one-off conversions** without learning a new app.\n\nThe trade-off is that your file is processed on a server, however briefly.`,
    },
    {
      heading: 'Privacy: who sees your file',
      body: `This is the real dividing line. Calibre runs **entirely offline** — the file never leaves your computer. Reputable online converters (including BookConv) transfer over encrypted HTTPS and **delete the file automatically within an hour**, but the file does touch a server during conversion.\n\nFor a public-domain novel, that difference barely matters. For a manuscript, tax document, or anything sensitive, keep it local with Calibre.`,
    },
    {
      heading: 'Speed and batch work',
      body: `Calibre is dramatically faster for **repetitive** work: set it up once, point it at a folder, walk away. Online converters are faster for a **single file** — there is no setup, but you would not want to convert a thousand files by hand in a browser.\n\nBookConv also supports background conversion, so even larger files do not block your tab.`,
    },
    {
      heading: 'The verdict by use case',
      body: `**Use an online converter when:** it is a one-off file, you are on a device without Calibre, or you just want the result now.\n\n**Use Calibre when:** you convert constantly, need device-specific output, or the file is private enough that uploading it is a non-starter.\n\nMost people land somewhere in between — Calibre installed but rarely opened, and a bookmark for a fast online converter for everything else.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Is Calibre better than online converters?', answer: 'For bulk and offline work, yes. For a single quick file, an online converter is faster and needs no setup. Neither is universally "better" — it depends on volume, control, and privacy needs.' },
  { question: 'Are online ebook converters safe for private files?', answer: 'Reputable ones use encrypted HTTPS and auto-delete files within about an hour (BookConv deletes within 1 hour). But the file does touch a server. For sensitive documents, prefer Calibre, which runs fully offline.' },
  { question: 'Does BookConv use Calibre?', answer: 'Yes. BookConv is built on the open-source Calibre conversion engine, so it inherits Calibre’s format support while adding a browser UI and automatic image/cover handling.' },
  { question: 'Can I batch convert with an online converter?', answer: 'Generally no — online converters are designed for one file at a time. For true batch work, Calibre (or its command-line tools) is the right choice.' },
  { question: 'Which is faster, Calibre or an online converter?', answer: 'For one file, the online converter wins because there is no install or setup. For hundreds of files, Calibre wins because you automate the job once.' },
  { question: 'Do I need to install anything to convert an ebook?', answer: 'No. An online converter like BookConv runs in the browser with no install. Calibre only makes sense if you convert often or need offline privacy.' },
]
