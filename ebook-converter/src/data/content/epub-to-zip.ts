export const slug = 'epub-to-zip';
export const title = 'Free EPUB to ZIP Converter — No Sign-up';
export const metaDescription = 'Extract the files inside any EPUB free — convert EPUB to ZIP and pull out XHTML, CSS, images & fonts in seconds. No sign-up, your file stays private.';
export const level = 'A' as const;
export const wordCount = 2000;

export const content = {
  hero: {
    title: 'EPUB to ZIP - Unlock the Files Inside Your E-book',
    subtitle: 'Free EPUB to ZIP converter. No sign-up — extract the raw XHTML, CSS, images, and fonts from any e-book in seconds. Your file is never stored.'
  },

  sections: [
    {
      heading: 'What Is an EPUB, Really?',
      body: 'An EPUB file is not a single opaque document — it is a ZIP archive with a specific internal structure. Open one and you will find XHTML chapters, a CSS stylesheet, embedded images, and an OPF metadata file wired together by META-INF/container.xml. Because the container is standard ZIP, converting EPUB to ZIP does not transform your content at all: it simply re-presents the same bytes under a .zip extension that every operating system can open natively.'
    },
    {
      heading: 'When Should You Convert EPUB to ZIP?',
      body: 'You usually want the ZIP when you care about the parts, not the package. Reuse Assets — Pull the cover image, illustrations, or embedded fonts out for a presentation or redesign. Recover Text — Extract the XHTML source to paste into a Word document, CMS, or translation tool without re-typing. Inspect Layout — Study how a publisher structured their CSS and template to learn or debug your own e-books. Bulk Process — Run your own scripts (spell-check, search-and-replace, watermarking) across the raw files before repackaging. Archive Raw — Keep an unencrypted, tool-agnostic copy of the content independent of any reader app.'
    },
    {
      heading: 'Why a Passthrough Converter Is Safe',
      body: 'Because an EPUB already is a ZIP, this conversion is a byte-exact copy — the same archive, only renamed. Nothing is re-encoded, recompressed, or re-flowed, so there is zero risk of text loss or formatting drift. Our server simply streams the original file back to you with a .zip extension; no third-party engine touches your data and the original is never modified.'
    },
    {
      heading: 'EPUB vs ZIP: Same Data, Different Wrapper',
      body: `| Aspect | EPUB | ZIP |
|--------|-------|-----|
| Container format | ZIP (standard) | ZIP (standard) |
| Internal content | XHTML, CSS, images, OPF | Identical bytes |
| Opens in | E-readers, Calibre | Any OS, 7-Zip, WinRAR |
| Best for | Reading | Extracting & editing assets |
| Risk of data loss | n/a | None (byte-exact copy) |

If you only want to read the book, keep the EPUB. If you need to get inside it, ZIP is the key.`
    },
    {
      heading: 'What to Do After Extracting',
      body: `Once you have the ZIP, open it with any archive tool and look for: OEBPS/ or EPUB/ — the folder holding chapter .xhtml files. images/ — cover and inline illustrations. style/ — the CSS that controls typography. META-INF/container.xml and content.opf — the manifest and metadata. Edit what you need, then re-zip and (if required) rename back to .epub to rebuild a valid e-book.`
    }
  ],

  faq: [
    { q: 'Does converting EPUB to ZIP change my content?', a: 'No. The conversion is a byte-exact copy of the same archive under a .zip extension. Your text, images, and metadata are untouched.' },
    { q: 'Can I open the resulting ZIP on Windows or macOS?', a: 'Yes. Any built-in archive viewer (File Explorer, Finder), 7-Zip, or WinRAR opens it. The internal .xhtml and image files are plain, readable formats.' },
    { q: 'Is my file uploaded to a server?', a: 'The EPUB is processed to return the ZIP, but the conversion is a direct copy with no re-encoding. We do not retain or modify your original content.' },
    { q: 'Can I turn the ZIP back into an EPUB?', a: 'Yes. After editing, re-zip the folder and rename the archive to .epub. As long as META-INF/container.xml and the OPF are intact, it remains a valid e-book.' },
    { q: 'Why not just rename the file to .zip myself?', a: 'You can — the bytes are identical. Our tool does exactly that for you and delivers a clean download without you hunting for the right extension or worrying about a mislabeled file.' }
  ]
};
