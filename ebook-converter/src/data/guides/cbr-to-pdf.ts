import { BlogFaq } from '../blog/types'
import type { GuideMeta } from './types'

export const slug = 'cbr-to-pdf'
export const title = 'CBR to PDF: Read Your Comics on Any Device'
export const problem = 'You have a comic in CBR that your reader app will not open. Converting CBR to PDF makes it viewable everywhere. Here is how to do it without losing pages.'
export const date = '2026-08-02'
export const tags = ['cbr', 'pdf', 'comics', 'manga', 'ebook conversion']
export const formats = { source: 'cbr', target: 'pdf' }
export const keyTakeaways = [
  'CBR is a comic archive (RAR of images) many readers and printers cannot open.',
  'PDF presents each page as an image, which is exactly how comics are meant to be read.',
  'Converting CBR to PDF keeps every page in order and viewable on any device.',
  'BookConv converts CBR to PDF in the browser with no install.',
]
export const content = {
  intro: 'CBR is how comics and manga are shared: a folder of images squeezed into a RAR archive. Great for collectors, terrible for compatibility — most PDF readers, phones, and printers have no idea what to do with a CBR. PDF opens everywhere and shows comics exactly as intended, one full page at a time. This guide shows how to convert CBR to PDF cleanly.',
  sections: [
    {
      heading: 'What is CBR and why readers reject it',
      body: `**CBR** stands for Comic Book RAR — a RAR-compressed set of page images. Specialized comic apps open it, but mainstream PDF readers, e-readers, and printers do not. If you try to open a CBR in a normal viewer, nothing happens.

PDF, by contrast, is understood by essentially every device you own.`,
    },
    {
      heading: 'Why PDF suits comics',
      body: `Comics are **fixed-layout page images**, not reflowing text. PDF presents each page as a fixed image, which is precisely how a comic should look. Converting CBR to PDF preserves the page order and lets you read or print the comic on any device.

You lose the comic-reader features (panel zoom, double-page spread), but you gain universal compatibility.`,
    },
    {
      heading: 'Convert with BookConv (fastest)',
      body: `BookConv converts CBR to PDF in the browser using the Calibre backend, with no software to install. Upload the CBR, choose **PDF**, and it assembles the pages into a PDF. Start here: [/convert/cbr-to-pdf](/convert/cbr-to-pdf).

A deeper look at the format is in [/blog/cbr-to-pdf](/blog/cbr-to-pdf).`,
    },
    {
      heading: 'Convert with Calibre (desktop)',
      body: `Calibre treats CBR as a comic and converts it to PDF page by page. Add the file, pick **Convert books → PDF**, and the images become PDF pages in order. This is the same engine BookConv runs in the browser.

If you are choosing between a desktop tool and an online converter, see [/guide/calibre-vs-online-converter](/guide/calibre-vs-online-converter).`,
    },
    {
      heading: 'Check page order before you share',
      body: `After conversion, flip through the PDF once to confirm the pages are in the right order and none are missing. CBR page ordering depends on the original file names; a clean source produces a clean PDF. For scanned-book archives in a different format, see [/guide/djvu-to-pdf](/guide/djvu-to-pdf).`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Can I convert CBR to PDF?', answer: 'Yes. BookConv converts CBR to PDF in the browser, and Calibre does it on the desktop. The result is a PDF of the comic pages that any reader or printer can open.' },
  { question: 'Why will my reader not open CBR?', answer: 'CBR is a RAR archive of comic page images that most PDF readers and e-readers do not support. Converting it to PDF makes it open in virtually any viewer.' },
  { question: 'Does CBR to PDF keep every page?', answer: 'Yes, when the source is complete. The conversion assembles the page images in order into a PDF; a full CBR becomes a full PDF.' },
  { question: 'Will the comic look the same?', answer: 'Yes. Comics are fixed-layout images, and PDF shows each page as a fixed image, so the reading experience is faithful. You lose comic-app features like panel zoom, but the pages look as drawn.' },
  { question: 'Is BookConv free for CBR to PDF?', answer: 'Yes. BookConv converts CBR to PDF in the browser at no cost for standard files, with nothing to install.' },
  { question: 'CBR or PDF — which should I keep?', answer: 'Keep PDF for everyday reading and sharing, since every device opens it. Keep the original CBR only if you want comic-reader features like panel zoom.' },
]
