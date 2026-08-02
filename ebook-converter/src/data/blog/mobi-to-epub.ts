export const slug = `mobi-to-epub`;
export const title = `How to Convert MOBI to EPUB (And Why You'd Want To)`;
export const date = `2026-08-02`;
export const author = "BookConv Team";
export const tags = ["MOBI", "EPUB", "Kindle", "Kobo", "BookConv", "conversion", "guide"];

export const content = {
  intro: `Sitting on a pile of old .mobi files that only open on a Kindle? MOBI is Amazon's legacy format, and most non-Kindle readers — Kobo, Apple Books, Google Play Books — won't touch it. Converting MOBI to EPUB frees your books to read anywhere, because EPUB is the open standard nearly every device supports. This guide covers the quick conversion and what actually moves across.`,
  sections: [
    {
      heading: `Why Move MOBI to EPUB`,
      body: `MOBI came out of Mobipocket, which Amazon bought in 2007 and then moved past. The practical consequences today:

- **EPUB reads everywhere.** Kobo, Apple Books, Google Play Books, and most phone apps use EPUB. MOBI doesn't.
- **EPUB is the open standard.** No single company controls it, so your file isn't tied to one ecosystem.
- **Amazon itself moved on.** Send to Kindle stopped accepting MOBI uploads in August 2022. EPUB is what Amazon takes now.

So a MOBI you converted to EPUB is simply more useful — the same book, readable on more devices, and future-proofed against the next format sunset.`
    },
    {
      heading: `Convert MOBI to EPUB on BookConv in Three Steps`,
      body: `1. Open the [MOBI to EPUB converter](/convert/mobi-to-epub) and drop your .mobi onto the upload area.
2. BookConv reads the MOBI, extracts the text, images, and structure, and re-packages them as a standards-compliant EPUB.
3. Download the .epub and open it anywhere.

The free tier handles files up to 10 MB. Older MOBI files are usually small, so most convert without hitting a limit.

### Two things to know before you upload

- **Download links are temporary.** Converted files are deleted after a period, so save the .epub to your device right after the progress bar finishes.
- **DRM-protected MOBI is rejected.** If the file came from a retailer with encryption, no converter can read it. DRM-free personal MOBI files convert fine.`
    },
    {
      heading: `What Transfers and What Doesn't`,
      body: `MOBI is a stripped-down format, so a converted EPUB is usually an upgrade:

**Comes across**
- Body text and paragraphs
- Embedded images, placed near their original position
- Chapter structure, when the source MOBI carried a proper navigation record
- Basic bold and italic styling

**May need attention**
- MOBI's styling was limited, so there's often little formatting to preserve in the first place — the EPUB will look cleaner, not worse
- Some very old Mobipocket files lack a real table of contents; the converter builds one from headings when it can
- Series metadata MOBI faked by folding the series name into the title stays folded unless you clean it up

Because EPUB supports far more CSS than MOBI, the destination is the more capable format. The constraint is whatever the source MOBI held.`
    },
    {
      heading: `MOBI to EPUB vs Just Using Send to Kindle`,
      body: `If your only goal is reading on a Kindle, Send to Kindle accepts EPUB directly and converts it in the cloud. But that keeps you inside Amazon's ecosystem and uploads your file to their servers.

Convert to EPUB on BookConv when you want the book to:
- **Read on a Kobo, iPhone, or Android** app, not just a Kindle
- **Stay local** — no Amazon account, no cloud upload
- **Live in an open format** you can re-convert later (for example onward to [EPUB to AZW3](/convert/epub-to-azw3) for native Kindle sideloading)

If you're deciding which Kindle format to standardize on, [AZW3 vs MOBI](/blog/azw3-vs-mobi) breaks down the trade-offs, and [Ebook formats explained](/blog/ebook-formats-explained) covers the full landscape.`
    },
    {
      heading: `Dealing With Old or Locked MOBI Files`,
      body: `Two edge cases come up:

- **DRM-locked MOBI.** Retail purchases and library loans are encrypted. They're rejected at upload because no converter can read encrypted content. You'd need to read them in the app they were licensed for.
- **Very old Mobipocket files.** Some predate modern Kindle features and carry minimal metadata. The text converts fine; you may just want to fix the title and author in the EPUB afterward.

Neither is a blocker for the typical personal library of DRM-free MOBI books.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **EPUB reads everywhere; MOBI mostly reads only on Kindle.** Converting frees your books.
- **Three steps on BookConv.** Upload, convert, download — no install, no account, 10 MB free tier.
- **The destination is the better format.** EPUB supports more than MOBI, so output is rarely worse.
- **DRM is rejected.** Owned, DRM-free MOBI files convert; locked retail or library files don't.
- **Save immediately.** Download links are temporary and files are deleted after a period.`
    }
  ]
};

export const faqs = [
  {
    question: `Why would I convert MOBI to EPUB instead of keeping MOBI?`,
    answer: `Because EPUB is the open standard that Kobo, Apple Books, Google Play Books, and most apps support, while MOBI is Amazon's legacy format. Converting makes the same book readable on far more devices.`,
  },
  {
    question: `Will I lose quality converting from MOBI to EPUB?`,
    answer: `Almost never. MOBI is the more limited format, so the EPUB destination usually looks cleaner. Text, images, and chapter structure carry over; only DRM-locked files are rejected.`,
  },
  {
    question: `Can I open the EPUB on my Kindle after this?`,
    answer: `Yes. Send to Kindle accepts EPUB directly, or you can convert the EPUB onward to AZW3 for native sideloading. Either way the book stays readable on Kindle.`,
  },
  {
    question: `Why was my MOBI file rejected?`,
    answer: `Two usual causes: it's DRM-protected (encrypted retail or library files no converter can read), or it exceeds your tier's size limit — 10 MB on the free tier. Most old MOBI files are well under that.`,
  },
  {
    question: `Does Amazon still accept MOBI through Send to Kindle?`,
    answer: `No. Amazon stopped accepting MOBI uploads through Send to Kindle in August 2022. It takes EPUB now, which is one more reason to keep your library in EPUB.`,
  }
];
