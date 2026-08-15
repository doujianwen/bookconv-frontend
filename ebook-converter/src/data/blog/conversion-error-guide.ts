export const slug = `conversion-error-guide`;
export const title = `Conversion Failed? Here's How to Fix Common Ebook Conversion Errors`;
export const date = `2026-08-15`;
export const author = `BookConv Team`;
export const tags = [`Troubleshooting`, `Error`, `BookConv`, `Ebook`, `FAQ`];

export const content = {
  intro: `Conversion errors are rarely about the tool failing — they're usually about input quality, size limits, or format mismatches. This guide covers the five most common error scenarios we see, what each one means, and exactly how to fix it.`,
  sections: [
    {
      heading: `When Conversion Fails Before It Starts`,
      body: `The upload endpoint rejects your file immediately. This is usually one of three things:\n\n**File too large.** Free tier: 10 MB. Pro: 50 MB. API: 100 MB. If your file exceeds the limit, the error names the cap and you won't waste time waiting for a job that was never going to run.\n\n**DRM-protected.** Books purchased from Kindle, Kobo, or Google Play often carry DRM. We reject them on upload because we don't strip protection. Look for a DRM-free edition of the same title.\n\n**Corrupted or truncated.** A half-downloaded EPUB or PDF that ends mid-file gets refused. Open the source file in your normal reader. If it fails there, no converter will repair it.`
    },
    {
      heading: `When Conversion Starts but Doesn't Finish`,
      body: `You uploaded successfully, the job kicked off, but then failed partway through. This is where most user errors surface.\n\n**Unsupported source format.** Not every format converts to every other format. If you selected an impossible pair, the engine tells you immediately.\n\n**Source file has structural issues.** EPUB files are ZIP archives with XML inside. If the archive is malformed, Calibre-based engines can't read the book, even if your reader happens to open it.\n\n**Network timeout.** On shared Wi-Fi or slow connections, the upload itself may drop. Refresh the page and try again.`
    },
    {
      heading: `When the Output Looks Wrong`,
      body: `The conversion finished successfully, but the result isn't what you expected.\n\n**Missing table of contents.** Some source formats don't include TOC metadata. If your output has no chapters, the source likely didn't either. This isn't a bug — it's source quality.\n\n**Lost images.** Scanned PDFs or heavily illustrated EPUBs sometimes lose images during conversion if the output format doesn't support embedded graphics well.\n\n**Formatting breaks.** Complex layouts (columns, footnotes, special fonts) rarely survive round-trip conversion cleanly. For best results, convert once to the target format and adjust manually if needed.`
    },
    {
      heading: `Rate Limits and Quotas`,
      body: `Free users get 5 conversions per hour. This is a soft limit designed to prevent abuse on shared infrastructure.\n\nIf you see a rate-limit error, wait 60 minutes for the window to reset, or upgrade to Pro for unlimited hourly conversions.\n\nOn campus or office Wi-Fi, someone else on the same connection may have used part of your quota. Switch networks or wait.`
    },
    {
      heading: `When Nothing Works: What to Send Us`,
      body: `If you've tried everything above and the conversion still fails, here's what helps us reproduce the issue fastest:\n\n1. Source format and target format\n2. File size (not the file itself — we don't want your book)\n3. Browser and operating system\n4. The exact error message or code\n\nThat combination lets us identify the problem without waiting for a back-and-forth. Email us at hello@bookconv.com or open a GitHub issue.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Upload errors are fast** — size, DRM, or corruption are rejected immediately, not after a long wait.\n- **Output quality depends on source quality** — broken or complex source files produce broken or simplified outputs.\n- **Rate limits are hourly** — if you hit them, wait or upgrade.\n- **Send us metadata, not files** — we can reproduce the issue without seeing your book.`
    }
  ]
};

export const faqs = [
  {
    question: `My conversion shows "CONVERSION_FAILED". What does that mean?`,
    answer: `It means the conversion engine encountered an error during processing. Most often this is caused by a malformed source file or an unsupported format pair. Try uploading the file again, or check our troubleshooting guide for common fixes.`
  },
  {
    question: `I got "FILE_TOO_LARGE". How do I reduce the file size?`,
    answer: `Free tier accepts files up to 10 MB. To reduce size, remove unnecessary images, compress the EPUB, or upgrade to Pro (50 MB) or API (100 MB).`
  },
  {
    question: `Can I convert a book I bought from Amazon or Kobo?`,
    answer: `Only if it's DRM-free. Protected purchases are rejected on upload, and we don't remove DRM. Look for a DRM-free edition or public domain alternative.`
  },
  {
    question: `Why did my converted file lose images or formatting?`,
    answer: `Image and formatting loss usually comes from the source file being heavily designed or the target format having limitations. Scanned PDFs, for example, don't always convert well to EPUB.`
  },
  {
    question: `I keep hitting the rate limit. What's my quota?`,
    answer: `Free users get 5 conversions per hour with no account. The counter resets every 60 minutes. Pro and API plans have unlimited hourly conversions.`
  },
  {
    question: `How do I report a bug or request a feature?`,
    answer: `Email hello@bookconv.com with your source/target formats, file size, browser, OS, and the exact error. Or open a GitHub issue at github.com/doujianwen/bookconv-frontend/issues.`
  }
];
