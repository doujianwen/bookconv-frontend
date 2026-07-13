export const slug = 'epub-to-text';
export const title = 'EPUB to Text Converter';
export const level = 'A' as const;
export const wordCount = 2000;

export const content = {
  hero: {
    title: 'EPUB to Text - Extract Pure Text Content',
    subtitle: 'Extract clean text from EPUB removing all formatting tags. Ideal for text analysis and speed reading.'
  }
,

  sections: [
    {
      heading: 'Application Scenarios for EPUB to Text Conversion',
      body: ` \`Content not available\`
    }`,
    {
      heading: 'Intelligent Text Extraction Process',
      body: ` \`Content not available\`
    }`,
    {
      heading: 'What Gets Lost in Conversion?',
      body: ` \`Content not available\`
    }`,
    {
      heading: 'Use Cases Beyond Reading',
      body: ` \`Content not available\`
    }
  ]`,
      faq: [
    { q: 'Will paragraph and chapter structure be preserved?' a: 'Yes. Although all HTML tags are removed paragraph separation is maintained through blank lines and chapter structure is preserved using chapter markers.' }
    { q: 'How are images and charts handled?' a: 'Pure text format cannot contain images. If the original EPUB contains images we attempt to extract alt text descriptions and insert them as notes in the text.' }
    { q: 'Can the converted text be used directly for AI analysis?' a: 'Absolutely. The output text has removed all formatting markers and extra whitespace. It is standard plain text that can be directly fed to any NLP tool AI summarizer or text analysis platform.' }
    { q: 'What encoding does the output TXT use?' a: 'Default is UTF-8 supporting Chinese English Japanese Korean Russian and other multilingual content. Other encodings (GBK BIG5) can be specified during conversion.' }
    { q: 'How do I batch convert multiple EPUB files?' a: 'Free users can convert up to 5 files per hour. Pro users enjoy unlimited batch conversion with files up to 50MB each.' ],
};
}};
