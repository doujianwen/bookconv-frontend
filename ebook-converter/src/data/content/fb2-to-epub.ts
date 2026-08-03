export const slug = 'fb2-to-epub';
export const title = 'Free FB2 to EPUB Converter — No Sign-up';
export const level = 'B' as const;
export const wordCount = 2500;

export const content = {
  hero: {
    title: 'FB2 to EPUB - Convert FictionBook to Universal Ebook Format',
    subtitle: 'Free FB2 to EPUB converter. No sign-up — turn FictionBook files into EPUB for maximum device compatibility.'
  },

  sections: [
    {
      heading: 'What is FB2 Format?',
      body: `FB2 — FictionBook 2.0 — is an XML ebook format that came out of the Russian ebook scene around 2004. Unlike most formats, it wasn't designed by a company trying to lock in customers. It was designed by readers who wanted novels stored in a way that made structural sense.

The whole thing is a single XML file. Open it in a text editor and you'll see actual semantic tags: \`<section>\` for chapters, \`<title>\` for chapter names, \`<epigraph>\` for those quotes at the start of a chapter, \`<poem>\` and \`<stanza>\` for verse. It knows what a book *is*, not just what it looks like.

What that buys you:

- **Genuinely semantic markup** — a chapter is tagged as a chapter, not as "div with class chapter"
- **Rich metadata** — author, translator, series name, series number, genre, publication year, all standardized
- **Small files** — a full novel with a cover typically sits at 200-600KB
- **Images inline** — illustrations are base64-encoded directly into the XML
- **Single file, no archive** — nothing to unzip, nothing to corrupt

FB2 dominates Russian-language ebook distribution. LitRes, Flibusta, and most Eastern European digital libraries serve it by default, and it's the native format for readers like FBReader and CoolReader.

The problem is geography. Outside that ecosystem, almost nothing opens FB2.`
    },
    {
      heading: 'What is EPUB and Why Switch?',
      body: `EPUB is the international standard for ebooks, maintained by the W3C. Structurally it's a ZIP archive of HTML files, CSS, images, and a manifest — basically a small offline website that reader apps know how to display.

Both FB2 and EPUB give you reflowable text, so this isn't a jump in reading quality. It's a jump in **where you can read**.

- **Apple Books** — native EPUB, no FB2
- **Kobo** — native EPUB, no FB2
- **Google Play Books** — accepts EPUB uploads, not FB2
- **Kindle** — Amazon now accepts EPUB via Send to Kindle; FB2 was never supported
- **Every phone and tablet** — dozens of free EPUB readers on iOS and Android
- **Browsers** — plenty of web-based EPUB readers, essentially zero for FB2

There's also a publishing angle. If you wrote a novel and it's sitting in FB2, no retailer will take it. Kindle Direct Publishing, Apple Books, Kobo Writing Life, Draft2Digital — every one of them wants EPUB.

And EPUB 3 supports things FB2 never got: proper accessibility semantics for screen readers, media overlays for read-along audio, embedded fonts, and MathML. For a straight novel none of that matters much. For anything more ambitious, it does.`
    },
    {
      heading: 'How to Convert FB2 to EPUB',
      body: `**1. Upload the file.** Drag your .fb2 onto the drop zone. FB2 files are small — usually well under 1MB — so the 50MB free limit is never an issue unless the book is stuffed with illustrations. Zipped .fb2.zip files work too; they get unpacked automatically.

**2. Conversion runs.** The XML tree is parsed, sections become XHTML chapter files, the metadata block maps onto EPUB's Dublin Core fields, and embedded base64 images are extracted into real image files. Typical novel: a few seconds.

**3. Download and load it up.** Drop the EPUB into Apple Books, sideload it to a Kobo over USB, email it to your Kindle address, or open it in whatever reader you like.

Worth knowing: FB2 files essentially never have DRM. The format has no encryption mechanism, which is one reason it stayed popular in circles that dislike DRM. So unlike EPUB or AZW3 conversions, you won't hit a "this file is protected" wall here.

If a conversion does fail, the usual cause is malformed XML — some older FB2 files from scanning projects have unescaped characters or unclosed tags that break strict parsers. Opening the file in a proper FB2 editor and re-saving it usually fixes that.`
    },
    {
      heading: 'When Do You Need This Conversion?',
      body: `**You switched devices.** You've read on FBReader for years, then bought a Kobo or an iPad. Your entire library is FB2 and the new device shrugs at it.

**You want your books on Kindle.** Amazon's Send to Kindle now accepts EPUB directly. It has never accepted FB2 and never will. Convert once, email it in, done.

**You're publishing.** Wrote a novel in an FB2-native tool? Every retailer on Earth needs EPUB before they'll list it.

**You're sharing with someone outside the FB2 world.** Sending an FB2 to a friend in the US or Western Europe usually results in confusion. EPUB opens on their phone without a thought.

**You're future-proofing an archive.** FB2 is a stable format with a small, dedicated community — but "small and dedicated" is a risk profile. EPUB has W3C backing and commercial momentum. If you're preserving a family collection or a scanning project, EPUB is the safer bet.

**You need accessibility.** EPUB 3's semantic and ARIA support makes screen-reader navigation dramatically better than what FB2 readers typically manage.`
    },
    {
      heading: 'What Carries Over — and What Shifts',
      body: `FB2 and EPUB are both structured, semantic formats, so this is one of the cleaner conversions in the ebook world. Most things map almost one-to-one.

**Comes through intact:**

- **Chapter structure** — FB2 \`<section>\` elements become separate EPUB chapters with proper navigation entries
- **Table of contents** — generated automatically from section titles, fully clickable
- **Metadata** — title, author, series name and number, genre, language, and publication date map onto Dublin Core fields
- **Images** — base64 blobs get decoded into real PNG/JPG files inside the EPUB
- **Cover art** — flagged correctly so reader apps display it as the book cover
- **Footnotes** — FB2 note bodies become linked EPUB endnotes you can tap and return from
- **Emphasis and styling** — bold, italic, and strikethrough carry over cleanly
- **Poetry** — \`<poem>\` and \`<stanza>\` become properly indented verse blocks

**Gets approximated:**

- **Epigraphs** — EPUB has no dedicated epigraph element, so they become styled blockquotes
- **Custom stylesheets** — FB2's limited styling is normalized to clean, readable CSS
- **Exotic genre tags** — FB2's genre taxonomy is far more granular than EPUB's subject field, so some detail flattens

Nothing meaningful is lost. You'll notice the book looks slightly different in a new reader app — but that's the reader's default typography, not the conversion.`
    }
  ],

  faq: [
    { q: 'Does FB2 support images and illustrations?', a: 'Yes — FB2 stores images as base64 data embedded directly in the XML file, covering covers, illustrations, and diagrams. The converter decodes these back into real image files inside the EPUB.' },
    { q: 'Will my converted book work on a Kindle?', a: 'Yes. Amazon\'s Send to Kindle service accepts EPUB files directly now, so you can email the converted file to your Kindle address and it will appear on the device. Kindle has never supported FB2 natively, which is exactly why this conversion is needed.' },
    { q: 'Are FB2 files ever DRM-protected?', a: 'Essentially never. The FB2 specification includes no encryption or DRM mechanism, which is part of why it stayed popular among readers who dislike locked files, so conversions rarely fail for rights reasons.' },
    { q: 'Do footnotes and endnotes survive the conversion?', a: 'Yes. FB2 note bodies become linked EPUB endnotes, so tapping a note marker jumps to the note and most readers give you a back link to return to your place.' },
    { q: 'How many FB2 files can I convert at once?', a: 'Free accounts convert one file at a time up to 50MB, which is far more than any FB2 file needs since most novels are under a megabyte. Pro accounts add batch conversion, which matters if you are migrating an entire FB2 library.' }
  ]
};
