export const slug = 'epub-to-doc';
export const title = 'EPUB to DOC Converter';
export const level = 'B' as const;
export const wordCount = 1200;

export const content = {
  hero: {
    title: 'EPUB to DOC - Convert Ebooks to Legacy Word Format',
    subtitle: 'Convert EPUB ebooks to Microsoft Word 97-2003 DOC format for maximum compatibility.'
  }
,

  sections: [
    {
      heading: 'Why Convert EPUB to DOC?',
      body: **Corporate Legacy Systems** — Many enterprise document management systems still require DOC files for internal sharing. **Academic Submission** — Some universities and journals still accept DOC-format manuscripts. **Email Compatibility** — Smaller file sizes make DOC files faster to transmit via email. **Older Software Support** — Legacy word processors and note-taking apps may only support DOC.
    }
    {
      heading: 'Conversion Considerations',
      body: `DOC is an older binary format with limitations compared to DOCX:

- **Limited Formatting**: Cannot support advanced typography CSS styling or complex layouts
- **No Smart Tags**: Lacks modern XML-based features like tracked changes metadata
- **Larger File Size**: Binary compression is less efficient than DOCX's ZIP-based format
- **Reduced Feature Set**: No support for embedded fonts multimedia or equations

For most use cases DOCX (via our EPUB to DOCX converter) is recommended. However if you have a specific requirement for DOC compatibility our converter handles it reliably."
    }

  ],
  faq: [
    { q: 'What is the difference between DOC and DOCX?' a: 'DOC is a binary format used in Word 97-2003 while DOCX is an OpenXML format based on ZIP compression introduced in Word 2007. DOCX supports more features and generally produces smaller files but DOC remains necessary for legacy system compatibility.' }
    { q: 'Can I edit the converted DOC file?' a: 'Yes. The converted DOC file can be opened and edited in Microsoft Word LibreOffice Writer WPS Office and other compatible word processors.' }
    { q: 'Will images be preserved during conversion?' a: 'Basic images are preserved but complex layouts and formatting may be simplified due to DOC format limitations.' ],
};
}};
