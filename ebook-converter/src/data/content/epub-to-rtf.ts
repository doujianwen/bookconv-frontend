export const slug = 'epub-to-rtf';
export const title = 'EPUB to RTF Converter';
export const level = 'B' as const;
export const wordCount = 1200;

export const content = {
  hero: {
    title: 'EPUB to RTF - Convert Ebooks to Rich Text Format',
    subtitle: 'Transform EPUB ebooks into RTF documents for editing and compatibility.'
  }
,

  sections: [
    {
      heading: 'Why Convert EPUB to RTF?',
      body: `**Legacy Software Compatibility** — Older word processors and note-taking apps support RTF. **Easy Editing** — RTF preserves basic formatting while being editable in most text editors. **Content Extraction** — Extract book text for analysis summarization or repurposing. **Cross-Platform Exchange** — RTF works across Windows Mac and Linux without formatting loss. **Academic Use** — Many academic platforms accept RTF submissionsbody: **Legacy Software Compatibility** — Older word processors and note-taking apps support RTF. **Easy Editing** — RTF preserves basic formatting while being editable in most text editors. **Content Extraction** — Extract book text for analysis, summarization, or repurposing. **Cross-Platform Exchange** — RTF works across Windows, Mac, and Linux without formatting loss. **Academic Use** — Many academic platforms accept RTF submissions.
    },
    {
      heading: 'Conversion Notes',
      body: `When converting EPUB to RTF be aware of format limitations:

- **No Advanced Typography**: Custom fonts and CSS styling cannot be represented in RTF
- **Simplified Images**: Images are preserved but may lose positioning precision
- **No Hyperlinks**: Links become plain text URLs without clickability
- **Basic Navigation**: Table of contents lost but chapter breaks preserved as section dividers

For pure text extraction without formatting consider our EPUB to TXT converter instead."
    }

  ],
  faq: [
    { q: 'Can I edit the converted RTF file?' a: 'Yes. RTF files can be opened and edited in Microsoft Word LibreOffice Writer Google Docs and most word processors.' }
    { q: 'Will images be preserved?' a: 'Basic images are preserved in RTF format though complex layouts and positioning may be simplified.' ],
};
}
};
