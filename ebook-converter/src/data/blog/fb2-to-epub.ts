export const slug = `fb2-to-epub`;
export const date = `2026-08-02`;
export const author = "BookConv Team";
export const title = `FB2 to EPUB: Convert FictionBook for Any Reader (Including Kindle)`;
export const tags = ["FB2", "FictionBook", "EPUB", "Kindle", "Ebook Formats", "BookConv"];

export const content = {
  intro: `Have an FB2 file that won't open on your Kindle? FB2 — FictionBook — is huge in Russian-language ebook circles but nearly invisible everywhere else. The fix is simple: convert FB2 to EPUB, the open format almost every reader supports. This guide covers what FB2 is, why EPUB wins, and how to get your book onto a Kindle afterward.`,
  sections: [
    {
      heading: `What Is FB2 (FictionBook)?`,
      body: `FB2 is an XML-based ebook format that emerged from the Russian ebook scene around 2004. Instead of packing text into a fixed layout, it tags content semantically — chapters, epigraphs, poems, footnotes — so any reader can re-flow it. Files are small, typically 200–600 KB for a whole novel, and FB2 dominates Russian-language distribution. Outside that world, almost nothing reads it natively.`
    },
    {
      heading: `Why Convert FB2 to EPUB?`,
      body: `EPUB is a W3C-standard ZIP of HTML and CSS, and it's the default reflowable format for Apple Books, Kobo, Nook, and Google Play Books. Converting FB2 to EPUB jumps your book from a regional format to a universal one. It also unlocks publishing and sharing outside the FB2 ecosystem, and it future-proofs a file that only a handful of apps still understand.`
    },
    {
      heading: `How to Convert FB2 to EPUB`,
      body: `1. Open [BookConv's FB2 to EPUB converter](/convert/fb2-to-epub).
2. Upload the .fb2 (most novels are under 1 MB — well inside the 10 MB free cap).
3. The converter parses the XML, maps metadata to Dublin Core, and pulls out any embedded images.
4. Download the EPUB.

FB2 is essentially never DRM-protected, so conversions rarely fail for rights reasons.`
    },
    {
      heading: `Will It Work on a Kindle?`,
      body: `Yes. Amazon's Send to Kindle service now accepts EPUB directly — email the converted file to your Kindle address and it appears on the device. Kindle never supported FB2 natively, which is exactly why this conversion exists. For the Kindle-native path, you can also go EPUB to AZW3 with [our EPUB to AZW3 tool](/convert/epub-to-azw3).`
    },
    {
      heading: `What Carries Over — and What Shifts`,
      body: `Most of your book survives intact:

- Chapters, table of contents, and metadata
- Embedded illustrations and the cover
- Footnotes, which become linked endnotes you can tap and return from
- Poems and epigraphs

Styling and genre tags may flatten slightly, because EPUB expresses them more loosely than FB2's strict semantics. The reading experience is unaffected.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **FB2 is XML-based** — semantic tags, tiny files, big in Russia.
- **EPUB is the open standard** — Apple Books, Kobo, Nook, Google Play all read it.
- **Kindle works via Send to Kindle** — EPUB is accepted directly now.
- **FB2 is never DRM-locked** — conversions almost never fail.
- **Footnotes survive** — as tappable EPUB endnotes.
- **Most novels are under 1 MB** — far under the 10 MB free cap.`
    }
  ]
};

export const faqs = [
  {
    question: `Does FB2 support images and illustrations?`,
    answer: `Yes. FB2 stores images as base64 data embedded directly in the XML file, covering covers, illustrations, and diagrams. The converter decodes these back into real image files inside the EPUB.`,
  },
  {
    question: `Will my converted book work on a Kindle?`,
    answer: `Yes. Amazon's Send to Kindle service accepts EPUB files directly now, so you can email the converted file to your Kindle address and it will appear on the device. Kindle has never supported FB2 natively, which is exactly why this conversion is needed.`,
  },
  {
    question: `Are FB2 files ever DRM-protected?`,
    answer: `Essentially never. The FB2 specification includes no encryption or DRM mechanism, which is part of why it stayed popular among readers who dislike locked files, so conversions rarely fail for rights reasons.`,
  },
  {
    question: `Do footnotes and endnotes survive the conversion?`,
    answer: `Yes. FB2 note bodies become linked EPUB endnotes, so tapping a note marker jumps to the note and most readers give you a back link to return to your place.`,
  },
  {
    question: `How many FB2 files can I convert at once?`,
    answer: `Free accounts convert one file at a time up to 10 MB, which is far more than any FB2 file needs since most novels are under a megabyte. Pro accounts add batch conversion, which matters if you are migrating an entire FB2 library.`,
  },
  {
    question: `Is FB2 the same as EPUB?`,
    answer: `No, but they're cousins. Both are reflowable and text-based, yet FB2 uses strict semantic XML tags and is regional; EPUB is the open global standard with far broader device support.`,
  },
  {
    question: `Where is FB2 most popular?`,
    answer: `Across Russia and the former Soviet states, especially for novels and literary works. Almost nowhere else reads it without converting first, which is why FB2 to EPUB is the common bridge.`,
  }
];
