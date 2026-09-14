export const slug = `bookconv-faq`;
export const title = `BookConv FAQ: Is It Safe, Free, and How Does It Compare to Calibre?`;
export const date = `2026-09-14`;
export const author = "BookConv Team";
export const tags = ["BookConv", "FAQ", "Ebook Converter", "Privacy", "Calibre"];

export const content = {
  intro: `Quick, straight answers to the questions people actually ask about BookConv — safety, price, supported formats, and how it stacks up against Calibre. No marketing fluff.`,
  sections: [
    {
      heading: `How a BookConv Conversion Actually Works`,
      body: `The loop is three steps: upload a file, pick the target format, download the result. Conversions run in your browser tab, so there is nothing to install and no desktop app holding your library. Common paths include [EPUB to AZW3](/convert/epub-to-azw3) for Kindle, [MOBI to EPUB](/blog/mobi-to-epub) for general readers, and [PDF to EPUB](/blog/pdf-to-epub-guide) when you want reflowable text. Background conversion means a larger file does not block your tab.`
    },
    {
      heading: `What "Private by Design" Really Means`,
      body: `BookConv is built to avoid holding onto your files after you are done. Uploaded files are encrypted in transit over HTTPS and deleted automatically within 1 hour of conversion — no account, no stored library. You do not hand your files to a desktop app's broader ecosystem just to switch formats. For highly sensitive manuscripts, a fully local tool such as Calibre gives you the most control, since the file never leaves your machine.`
    },
    {
      heading: `The Formats You Can Convert`,
      body: `The everyday set covers 27 format pairs: EPUB, MOBI, AZW3, PDF, and TXT, plus conversions between them. That handles the large majority of "this file won't open on my device" moments — for example [EPUB to AZW3](/convert/epub-to-azw3) for Kindle, or [MOBI to EPUB](/blog/mobi-to-epub) for a Kobo or generic reader. Rare formats (LIT, FB2, CBR, DJVU, and others) are where a desktop tool like Calibre still has broader coverage.`
    },
    {
      heading: `BookConv or Calibre? A Quick Decision`,
      body: `If you want a fast, no-install conversion on any device, BookConv is the lighter path. If you manage a large library, need niche formats, or want everything to stay local, Calibre fits better. The full [BookConv vs Calibre comparison](/blog/bookconv-vs-calibre) breaks it down format by format, and [Calibre vs Online Converters](/guide/calibre-vs-online-converter) covers the privacy trade-off in depth.`
    },
    {
      heading: `From Your File to Kindle or Kobo`,
      body: `For Kindle, convert to AZW3 (or use Amazon's Send to Kindle); BookConv supports [EPUB to AZW3](/convert/epub-to-azw3). Kobo reads EPUB natively, so an EPUB conversion is usually all you need. If a file still will not open, the cause is almost always a format mismatch — see [why an ebook won't open on Kindle](/blog/why-ebook-wont-open-kindle).`
    },
    {
      heading: `Key Takeaways`,
      body: `- BookConv is free for core conversions, with no account required.
- Conversions run in your browser; uploaded files are encrypted and deleted within 1 hour.
- Supports EPUB, MOBI, AZW3, PDF, and TXT, plus conversions between them.
- No software install — works on phone, tablet, and laptop.
- For one-off conversions on any device, BookConv is a lighter path than installing Calibre.`
    }
  ]
};

export const faqs = [
  {
    question: `Is BookConv safe?`,
    answer: `BookConv converts in the browser and is designed not to retain your files after conversion, with no software install required. For everyday files it is a low-risk converter; for sensitive manuscripts, a local tool gives the most control.`
  },
  {
    question: `Is BookConv free?`,
    answer: `Yes. Core format conversions are free and no account is needed.`
  },
  {
    question: `What file formats does BookConv support?`,
    answer: `EPUB, MOBI, AZW3, PDF, and TXT, plus conversions between them such as EPUB to AZW3 and MOBI to EPUB.`
  },
  {
    question: `Does BookConv work on mobile?`,
    answer: `Yes. Because it runs in the browser, you can convert on a phone or tablet without installing anything.`
  },
  {
    question: `Should I use BookConv or Calibre?`,
    answer: `Use BookConv for fast, no-install conversions on any device; use Calibre for large libraries, rare formats, and fully local management. The comparison page covers the details.`
  }
];
