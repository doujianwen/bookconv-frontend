export const slug = `large-file-conversion-guide`;
export const title = `How to Convert Large Ebooks (Over 10 MB): Free Methods and When to Upgrade`;
export const date = `2026-08-15`;
export const author = `BookConv Team`;
export const tags = [`Large File`, `Troubleshooting`, `BookConv`, `Ebook`, `Pro`];

export const content = {
  intro: `The free tier accepts files up to 10 MB. If your ebook is larger — whether it's packed with images, has embedded fonts, or is a scanned PDF — you'll hit the limit. This guide explains why files get big, how to shrink them for free, and when upgrading to Pro makes sense.`,
  sections: [
    {
      heading: `Why Your Ebook Is Over 10 MB`,
      body: `Most text-only ebooks are under 2 MB. Files over 10 MB usually have one of these characteristics:\n\n**Embedded images.** Cookbooks, art books, and children's books pack many high-resolution images into the EPUB.\n\n**Scanned PDFs.** A PDF created from a scanner is essentially a collection of images — easily 20–100 MB for a 300-page book.\n\n**Embedded fonts.** Some publishers embed multiple font weights and styles, which adds size without adding content.\n\n**Lossless formats.** CBZ and CBR (comic book archives) store full-page images, making them inherently large.`
    },
    {
      heading: `Free Method: Shrink Your EPUB Before Converting`,
      body: `An EPUB is just a ZIP archive with XML and images inside. You can reduce its size before uploading by stripping unnecessary elements.\n\n**Remove embedded fonts.** If the ebook doesn't need custom fonts, extracting and re-converting to EPUB often strips them automatically.\n\n**Compress images.** Open the EPUB as a ZIP file (rename .epub to .zip), find the images folder, and compress images with a tool like [Squoosh](https://squoosh.app/) or [ImageOptim](https://imageoptim.com/). Pack them back and rename to .epub.\n\n**Strip cover images.** If you only need the text, remove the cover image from the archive before converting.\n\n**Reduce DPI in scanned PDFs.** For PDFs, lowering the scan resolution from 300 DPI to 150 DPI can cut file size by 75% while keeping text readable.`
    },
    {
      heading: `Free Method: Split the Book Into Parts`,
      body: `If you can't shrink the file enough, splitting it across multiple conversions is often faster than waiting for Pro.\n\n**Split by chapters.** Most reading apps can combine multiple EPUB files into a single library view. Upload each part separately, then merge the outputs in your reader.\n\n**Use Calibre to split.** If you have Calibre installed, it can split a large book by chapter markers automatically. The free desktop tool handles files of any size.\n\n**Export as plain text.** For AI prep (NotebookLM, ChatGPT), extracting just the text via EPUB → TXT gives you a small, manageable file with no images or formatting.`
    },
    {
      heading: `When to Upgrade to Pro`,
      body: `Pro raises the file size limit from 10 MB to 50 MB and removes hourly conversion limits. Consider upgrading if:\n\n**You convert large files regularly.** If 10 MB blocks you more than once a week, Pro pays for itself in time saved.\n\n**You need batch conversion.** Pro allows multiple files in one upload, which matters when processing entire libraries.\n\n**You're a publisher or author.** Managing multiple format outputs for a single manuscript is faster with bulk uploads and priority queueing.\n\n**You don't want to invest time in compression.** If shrinking files feels like extra work, the 50 MB limit removes that friction.`
    },
    {
      heading: `Quick Decision Checklist`,
      body: `- **Under 10 MB?** Upload directly. No action needed.\n- **10–50 MB?** Try compression (remove fonts, shrink images, lower PDF DPI).\n- **Over 50 MB?** Split the file or upgrade to Pro.\n- **Converting regularly?** Pro likely saves more time than compression effort.\n- **Need plain text for AI?** Convert to TXT instead — text-only files are almost always under 5 MB.`
    }
  ]
};

export const faqs = [
  {
    question: `What's the file size limit on the free tier?`,
    answer: `Free users can upload files up to 10 MB per conversion. Pro raises this to 50 MB, and the API plan allows up to 100 MB.`
  },
  {
    question: `How do I shrink an EPUB file before uploading?`,
    answer: `Open the EPUB as a ZIP file, find the images folder, compress images with a tool like Squoosh, then repack. You can also strip embedded fonts and cover images if they're not needed.`
  },
  {
    question: `Can I split a large book into parts?`,
    answer: `Yes. Most reading apps can combine multiple EPUB files into one library view. Calibre's free desktop tool can also split books by chapter markers automatically.`
  },
  {
    question: `Is 50 MB enough for most ebooks?`,
    answer: `Most text-only ebooks are under 2 MB. Even illustrated books are usually under 20 MB after compression. 50 MB covers nearly all standard publications, including scanned PDFs at moderate DPI.`
  },
  {
    question: `Does Pro let me convert files faster?`,
    answer: `Pro includes priority queueing, which means your conversions run before free-tier jobs. On busy days, this can cut wait time significantly.`
  },
  {
    question: `Can I convert a scanned PDF to EPUB without losing quality?`,
    answer: `Scanned PDFs are image-heavy by nature. Converting to EPUB will reduce file size because EPUB reflows text, but if your source is pure images (no text layer), the output will still be large. Lowering DPI before conversion helps most.`
  }
];
