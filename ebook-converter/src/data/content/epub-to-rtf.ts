export const slug = 'epub-to-rtf';
export const title = 'Free EPUB to RTF Converter — No Sign-up';
export const level = 'B' as const;
export const wordCount = 2200;

export const content = {
  hero: {
    title: 'EPUB to RTF - Get Your Ebook into an Editable Document',
    subtitle: 'Free EPUB to RTF converter. No sign-up — turn ebooks into editable RTF documents that open in any word processor.'
  },

  sections: [
    {
      heading: 'What is EPUB Format?',
      body: `EPUB is the open standard for reflowable ebooks. Inside the file is a ZIP archive holding XHTML chapters, CSS, images, and a manifest that tells the reader what order everything goes in.

The whole design assumes reading, not editing. Text reflows to fit the screen, the reader controls the typography, and the file has no notion of a page — which is exactly why it feels great on a Kobo and awful the moment you need to mark up a draft.

**Things EPUB is genuinely good at:**

- Adapting to any screen size
- Remembering where you stopped reading
- Highlights, notes, and full-text search
- Working across Apple Books, Kobo, Nook, Google Play Books, and Kindle via Send to Kindle

**Things it is not built for:** track changes, comments, redlining, or handing a chapter to an editor who lives inside Word. That is where RTF comes in.`
    },
    {
      heading: 'What is RTF Format?',
      body: `RTF — Rich Text Format — is Microsoft's 1987 document interchange format. It stores formatted text as plain ASCII with control codes, which sounds primitive until you realize what it buys: near-universal compatibility.

Word opens it. LibreOffice opens it. Pages, WordPad, Google Docs, AbiWord, TextEdit, Scrivener, and a long tail of forgotten software all open it. No plugin, no version negotiation, no "this file was created in a newer version" dialog.

**RTF supports:**

- Bold, italic, underline, strikethrough
- Font families, sizes, and colours
- Paragraph alignment, indents, and spacing
- Bulleted and numbered lists
- Basic tables
- Embedded images

It is deliberately modest. Microsoft stopped developing it in 2008, so RTF will never gain modern features — but that frozen simplicity is precisely why it still works everywhere. If DOCX is the format that does everything, RTF is the format that never breaks.`
    },
    {
      heading: 'How to Convert EPUB to RTF',
      body: `**1. Upload your EPUB.** Drag it onto the upload area or browse for it. Free accounts handle files up to around 50MB, which covers virtually every ebook that is not a full-colour photography title.

**2. We unpack and rebuild.** The converter reads the OPF spine to get correct chapter order, merges the XHTML chapters into a single flowing document, translates HTML structure into RTF control codes, and embeds images inline.

**3. Download and edit.** Open the .rtf in whatever word processor you actually use and start working.

Most books convert in fifteen to forty seconds. Longer or image-heavy titles take a bit more. Pro accounts add batch conversion and larger uploads if you are moving a whole collection into editable form.`
    },
    {
      heading: 'When RTF Is the Right Choice',
      body: `**Editing a book you wrote.** Get your own manuscript back out of ebook form so you can revise it, then re-export when you are done.

**Sending work to an editor.** Editors work in word processors with track changes. Nobody marks up an EPUB.

**Feeding legacy or institutional software.** Some submission portals, court systems, and older publishing workflows still specify RTF and nothing else. It is a common lowest-common-denominator requirement.

**Cross-platform handoffs.** RTF moves between Windows, Mac, and Linux without the subtle layout drift that DOCX sometimes picks up along the way.

**Quoting and excerpting.** Pulling formatted passages out of a book for a report, a review, or a class handout is far easier from an editable document.

**When RTF is the wrong choice:** if you just want the words, EPUB to TXT is cleaner and produces a far smaller file. If you need modern Word features like comments and revision tracking, convert to DOCX instead.`
    },
    {
      heading: 'Format Limits You Should Know About',
      body: `RTF is a 1987 format handling content designed for 2020s reading apps. Some things do not make the trip.

- **CSS styling is gone.** Custom fonts, colour themes, drop caps, and fancy typography have no RTF equivalent. You get clean, plain formatting instead.
- **Hyperlinks become plain text.** Internal cross-references and external URLs survive as visible text, not clickable links.
- **The table of contents does not carry over as navigation.** Chapter headings remain as headings in the document, so you can rebuild a TOC in your word processor in one click — but the EPUB navigation document itself is not transferable.
- **Image positioning is approximate.** Pictures come through, but text wrapping and precise placement are simplified into the main flow.
- **DRM-protected books cannot be converted at all.** Encryption blocks the converter from reading the content in the first place.
- **File size grows.** RTF stores images as hex text, so a 3MB illustrated EPUB can easily become a 6MB or larger RTF.

None of this is a defect in the converter — it is the honest gap between a reading format and a 40-year-old document format.`
    }
  ],

  faq: [
    { q: 'Can I edit the converted RTF file?', a: 'Yes, that is the whole point. RTF opens in Microsoft Word, LibreOffice Writer, Pages, Google Docs, WordPad, and essentially every word processor in existence.' },
    { q: 'Are images preserved?', a: 'Yes, images are embedded in the RTF. Exact positioning and text wrapping get simplified, so illustrations sit in the text flow rather than in precise page locations.' },
    { q: 'Should I convert to RTF or DOCX?', a: 'Choose DOCX if you need track changes, comments, or modern Word features. Choose RTF when compatibility matters most — older software, institutional systems, or mixed Mac and Windows teams.' },
    { q: 'Why is the RTF bigger than the original EPUB?', a: 'RTF encodes images as hexadecimal text rather than binary, which roughly doubles their size, and it has no ZIP compression. Expect illustrated books to grow noticeably.' },
    { q: 'My EPUB will not convert. What is going on?', a: 'Almost always DRM from a store purchase, which encrypts the file. Books you wrote, bought DRM-free, or downloaded from public-domain sources convert without issue.' }
  ]
};
