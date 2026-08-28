export const slug = `check-converted-file-quality`;
export const title = `How to Check Your Converted Ebook's Quality: A 5-Minute Checklist`;
export const date = `2026-08-15`;
export const author = `BookConv Team`;
export const tags = [`Quality`, `Checklist`, `Ebook`, `Troubleshooting`, `BookConv`];

export const content = {
  intro: `Conversion success doesn't always mean the output looks right. A file can convert without errors but still have missing chapters, lost images, or broken formatting. This 5-minute checklist helps you verify quality before you discard your source file.`,
  sections: [
    {
      heading: `Step 1: Verify File Size`,
      body: `After conversion, check the output file size against what you expect.\n\n**Rule of thumb:** Output should be within 20% of the source file size for text-heavy books, or smaller for compressed EPUBs.\n\n**Red flags:**\n- 0 KB or under 100 KB → conversion likely failed silently\n- 3× larger than source → possible image duplication or format issue\n- Significantly smaller with images in source → images may have been stripped\n\nIf the size is way off, reconvert and check the error message. Most quality issues surface as abnormal file sizes.`
    },
    {
      heading: `Step 2: Open in Your Target Reader`,
      body: `The most important test: does the file open and render correctly in the device or app you'll actually use?\n\n**Check these basics:**\n- The book opens without error messages\n- The table of contents is present and clickable\n- Pages turn smoothly without freezing\n- Text is selectable (not an image-only PDF)\n\nIf it doesn't open, the format may not match your reader. Check our format compatibility guide: [EPUB vs MOBI vs AZW3](/blog/epub-vs-mobi).`
    },
    {
      heading: `Step 3: Inspect Content Completeness`,
      body: `Flip through the book and verify key elements survived the conversion.\n\n**Table of contents:**\n- All chapters listed?\n- Links navigate correctly?\n- Section ordering matches the source?\n\n**Images and graphics:**\n- Photos display at reasonable resolution?\n- Diagrams aren't cut off or pixelated?\n- Image captions are intact?\n\n**Special formatting:**\n- Footnotes and endnotes accessible?\n- Code blocks preserved (for technical books)?\n- Math formulas readable?\n\nMissing elements usually trace back to source file quality, not the converter.`
    },
    {
      heading: `Step 4: Test on Your Actual Device`,
      body: `A file that works on your desktop reader might behave differently on a phone or e-ink device.\n\n**Sync and test:**\n- Send the file to your primary reading device\n- Check font rendering on e-ink displays (EPUB renders better than PDF)\n- Test on mobile for layout adaptability\n- Verify bookmark sync works if your reader supports cloud sync\n\nIf the file works on one device but not another, the issue is device compatibility, not conversion quality.`
    },
    {
      heading: `Step 5: Fix Common Issues`,
      body: `**Missing table of contents:**\nThe source file may lack TOC metadata. Check the original in your reader first. If it's missing there too, nothing we can do. If it exists in the source but disappeared during conversion, try a different output format.\n\n**Lost images:**\nCompress images in the source EPUB before converting. Remove embedded fonts if possible. For scanned PDFs, lower DPI to 150 before conversion.\n\n**Broken layout:**\nComplex layouts rarely survive conversion perfectly. Try converting to PDF instead of EPUB for print-like output, or accept that some formatting adjustments will be needed.\n\n**Text encoding issues:**\nIf you see garbled characters, the source file may have encoding problems. Try converting to TXT first, then back to EPUB, which often resets encoding.`
    }
  ]
};

export const faqs = [
  {
    question: `My converted file is 0 KB. What went wrong?`,
    answer: `This usually means the conversion failed silently. Check the browser console for errors, verify the source file opens in your reader, and try converting again. If the problem persists, the source may be corrupted or DRM-protected.`
  },
  {
    question: `Why did my images disappear during conversion?`,
    answer: `EPUB converters sometimes strip images to reduce file size. To preserve them, compress images in the source EPUB before converting, or choose a format that preserves graphics better (like PDF). Our [PDF to EPUB guide](/convert/pdf-to-epub) covers image handling.`
  },
  {
    question: `The table of contents is missing. Can I add it?`,
    answer: `If the source has a TOC but the output doesn't, try a different target format. If the source lacks a TOC entirely, you'll need to add one manually in a tool like Calibre or by editing the EPUB's XML directly.`
  },
  {
    question: `How do I fix encoding/garbled text issues?`,
    answer: `Garbled text usually means the source file has encoding problems. Try: 1) Converting to TXT first to extract clean text, 2) Opening the source in your reader to check if the issue is pre-existing, 3) Using Calibre's "Tweaks" feature to force UTF-8 encoding.`
  },
  {
    question: `What's the best format for preserving complex layouts?`,
    answer: `For complex layouts (columns, footnotes, special fonts), PDF is usually best for preservation. For reflowable text on e-readers, EPUB works well but may lose some styling. Test both formats before deciding.`
  },
  {
    question: `Can I recover a file if the conversion looks wrong?`,
    answer: `Always keep your source file until you've verified the output. If something went wrong, check the error message and try a different format pair. Our [conversion error guide](/blog/conversion-error-guide) covers common failure scenarios.`
  }
];
