export const slug = 'txt-to-epub';
export const title = 'Free TXT to EPUB Converter — No Sign-up';
export const metaDescription = 'Convert UTF-8 plain text into a simple EPUB for reading. Check paragraphs, navigation and language support before replacing your source file.';
export const level = 'A' as const;
export const wordCount = 650;
export const content = {
  hero: { title: 'TXT to EPUB — Make a Simple Reading Copy', subtitle: 'Package UTF-8 plain text as an EPUB. Keep your source and inspect the output in your reading app.' },
  keyTakeaways: [
    'The local text path reads UTF-8 and builds a simple EPUB document. It does not provide automatic encoding detection or an encoding selector.',
    'Blank-line-separated blocks become paragraphs. Existing chapter labels remain text; the local path does not infer a multi-chapter book from those labels.',
    'The local output has a generic Converted Document title and one navigation entry. The uploader does not expose custom author, ISBN or chapter controls.',
    'Choose Calibre or an ebook editor when you need detailed metadata, encoding settings or chapter navigation.',
    'A successful download is a starting point: check the opening, ending, paragraphs and characters in your intended reader.'
  ],
  sections: [
    { heading: 'What Plain Text Can Bring into an EPUB', body: `TXT stores characters without a book package, illustrations or rich formatting. An EPUB can wrap that text in documents and navigation that ebook readers understand. The reader can then offer its own font sizes, themes and reflow controls.

Conversion cannot reconstruct information missing from the text file. A chapter label typed as plain text is not the same as an EPUB heading with an associated table-of-contents entry. Keep the best available source if you also have a structured Word, HTML or EPUB version.` },
    { heading: 'How to Convert a UTF-8 TXT File to EPUB', body: `Open the source in a text editor and confirm it is saved as UTF-8. Select the TXT to EPUB pair, upload the file, convert and download. Follow the limit shown by the selected uploader: the server upload path is capped at 4 MB, while enabled direct storage uploads support larger inputs.

Open the downloaded book before discarding anything. Look at the first paragraph, a section near the middle and the final paragraph. This verifies more than the filename or a successful response. No unlimited word count or five-million-word benchmark is claimed.` },
    { heading: 'When a Simple Text EPUB Is Useful', body: `This route fits a reading copy of your notes, a short manuscript or a plain-text archive where paragraph flow matters more than complex navigation. It is also useful when your reader handles EPUB more conveniently than TXT.

For a publication with chapters, footnotes, a cover and carefully edited metadata, use an ebook editor or a desktop conversion workflow. A simple text export should not be treated as a finished publishing manuscript. Test one representative document before migrating a collection.` },
    { heading: 'TXT and EPUB: Format Comparison', body: `TXT is easy to search and edit with a text editor. EPUB adds a package manifest, reading order and navigation documents for ebook applications. Those capabilities depend on the actual documents created by the converter.

The local BookConv text path produces one content document with a generic title and a single navigation link. EPUB does not automatically imply a detailed chapter list, a populated ISBN or correct language metadata. File size depends on text compression and package overhead; there is no fixed five-to-ten-percent increase.` },
    { heading: 'Quality Checklist for TXT Encoding and Paragraphs', body: `Check accented letters, Chinese or other non-Latin characters before and after conversion. If the source already displays replacement characters or garbled text, save it with the correct encoding before uploading. Renaming its extension cannot repair the underlying bytes.

In the local text path, blocks separated by blank lines become paragraphs. Single line breaks inside a block are not converted into separate verse lines. Poetry, source code and aligned tables can therefore need manual editing. Compare a representative passage in the output rather than assuming every whitespace choice is retained.` },
    { heading: 'Chapter Navigation and Metadata Limits', body: `The local output is titled Converted Document and links to that content document from its navigation file. It does not recognize Chapter 1 or separator lines as instructions to create individual chapter documents. The uploader does not expose manual chapter separator or custom metadata fields.

If navigation is your main requirement, create semantic headings in a structured source or edit the EPUB after conversion. Preserve the original text so that a later edit can be checked against it.` },
    { heading: 'Using Calibre for More Control', body: `For an offline workflow, Calibre provides TXT input and EPUB output options. A basic command is:

ebook-convert input.txt output.epub

Consult the installed version with ebook-convert input.txt output.epub -h. Input encoding uses --input-encoding; chapter detection uses an XPath expression with --chapter. These are desktop controls, not settings exposed by BookConv's uploader. See the [official command reference](https://manual.calibre-ebook.com/generated/en/ebook-convert.html) before using advanced options.` },
    { heading: 'Handling Sensitive Notes and Keeping Originals', body: `BookConv processes uploaded files on the server. Review the [privacy policy](/privacy) and use an offline tool for material you prefer to keep on your device. Access expiry and physical storage cleanup are separate mechanisms.

Keep the source and output as separate files until you have checked the result. To extract readable text from an existing ebook instead, use [EPUB to TXT](/convert/epub-to-txt). If your source is a structured web document, consider [HTML to EPUB](/convert/html-to-epub) rather than flattening it to text first.` }
  ],
  faq: [
    { q: 'Does the local converter detect chapters?', a: 'It builds one content document. Chapter labels remain text, and the navigation has a single document entry.' },
    { q: 'Can I choose GBK or another input encoding?', a: 'The uploader has no encoding selector. Save the input as UTF-8 first, or use an offline tool with explicit encoding controls.' },
    { q: 'Can I set the author and ISBN?', a: 'The uploader does not expose those controls. Use an ebook editor or Calibre when custom metadata is required.' },
    { q: 'Are line breaks preserved?', a: 'Blank-line-separated blocks become paragraphs. Single line breaks within a paragraph are not preserved as explicit verse lines.' },
    { q: 'What size files can I upload?', a: 'Use the limit displayed by the selected uploader. Multipart uploads use the 4 MB cap; enabled direct uploads use a separate larger limit. No unlimited word count is promised.' },
    { q: 'Should I delete my TXT source?', a: 'Keep it until you have inspected the ebook, including its first and final passages, non-Latin text and navigation.' }
  ],
  authorship: { author: 'BookConv Team', lastVerified: '2026-11-01', credentials: 'Reviewed against the local text packaging implementation and official Calibre options' }
};
