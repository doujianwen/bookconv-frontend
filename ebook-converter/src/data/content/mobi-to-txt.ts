export const slug = 'mobi-to-txt';
export const title = 'MOBI to TXT Converter';
export const level = 'B' as const;
export const wordCount = 1200;

export const content = {
  hero: {
    title: 'MOBI to TXT - Extract Pure Text from Kindle Books',
    subtitle: 'Get clean plain text from MOBI ebooks for backlight-free reading and text analysis.'
  }
,

  sections: [
    {
      heading: 'Why Convert MOBI to TXT?',
      body: `**Backlight-Free Reading** — Old Kindles and basic e-ink devices read TXT files smoothly. **Text Analysis** — Clean text is ideal for NLP processing word frequency analysis and sentiment analysis. **AI Summarization** — Feed clean text to AI tools for automatic summaries and insights. **Translation** — Plain text translates more accurately than formatted documents. **Maximum Compatibility** — Any text editor note app or code tool can open TXT filesbody: **Backlight-Free Reading** — Old Kindles and basic e-ink devices read TXT files smoothly. **Text Analysis** — Clean text is ideal for NLP processing, word frequency analysis, and sentiment analysis. **AI Summarization** — Feed clean text to AI tools for automatic summaries and insights. **Translation** — Plain text translates more accurately than formatted documents. **Maximum Compatibility** — Any text editor, note app, or code tool can open TXT files.
    },
    {
      heading: 'Conversion Quality',
      body: `Our converter extracts clean text from MOBI files:

- **Smart Tag Removal**: Strips formatting tags while preserving paragraph and chapter structure
- **Special Characters**: Properly handles Unicode characters including accented letters and symbols
- **Chapter Separation**: Chapters separated by blank lines for easy navigation
- **Whitespace Cleanup**: Removes excessive line breaks while preserving meaningful spacing
- **Metadata Header**: Book title and author added as comment lines at file start"
    }

  ],
  faq: [
    { q: 'Will images be preserved?' a: 'No. TXT is a pure text format that cannot contain images. If your MOBI has important images keep the original or convert to EPUB instead.' }
    { q: 'What encoding does the TXT file use?' a: 'Default UTF-8 encoding supporting multilingual content including Chinese Japanese Korean and European languages.' ],
};
}
};
