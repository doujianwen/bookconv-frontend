export const slug = `download-troubleshooting`;
export const title = `BookConv File Won't Download or Open? Fixes That Actually Work`;
export const date = `2026-07-30`;
export const author = `BookConv Team`;
export const tags = [`Download`, `Troubleshooting`, `BookConv`, `Ebook`, `FAQ`];

export const content = {
  intro: `If BookConv finished the conversion but the file won't download — or it lands on your disk and your reader refuses it — you're almost certainly hitting one of five things: a browser blocking the save, an expired download link, a file over your plan's size cap, a DRM or damaged source, or the wrong format for the device. Here's how to tell them apart in about a minute.`,
  sections: [
    {
      heading: `Sixty-Second Triage: Try These First`,
      body: `Work down this list before digging into anything specific. It clears most download problems on its own.

1. Check your Downloads folder — the file is often already there, saved without a prompt
2. Look for a blocked-download icon at the right edge of your browser's address bar
3. Reload the result page and click the download button once more
4. Open BookConv in a private window, where extensions are disabled by default
5. If you see an expired-link message, run the conversion again and save the file straight away

Nothing yet? The sections below are grouped by symptom, so jump to whichever one matches your screen.`
    },
    {
      heading: `When the Download Never Starts`,
      body: `You click, and nothing happens. In almost every case this is your browser, not our server — the conversion already finished and the file is sitting behind a link your browser won't follow.

### Chrome, Edge, or Safari blocked it quietly
Ebook extensions like EPUB, MOBI, and AZW3 land in the same bucket as unusual downloads, so browsers sometimes stop them with no visible warning. Look for a small download icon near the address bar, open it, and choose to keep the file. Chrome's [download settings help](https://support.google.com/chrome/answer/6261569) shows where those controls live.

### An extension is swallowing the request
Ad blockers, privacy add-ons, and download managers occasionally intercept the request and drop it. A private window disables most extensions in one move. If the download works there, whitelist BookConv rather than switching the extension off permanently.

### You're on mobile and the file went somewhere unexpected
On iOS it goes to the Files app under On My iPhone, then Downloads — never to Photos. On Android it lands in the Download folder. Check both before you conclude the download failed.

### The tab closed before the job finished
Large or slow files hand off to a background worker queue, and the download button appears when that worker finishes. Close the tab early and you lose the link even though the conversion completed. Keep the page open until the progress bar hits the end and the file is on disk. [How our background workers handle heavy jobs](/blog/background-workers) explains what's happening while you wait.`
    },
    {
      heading: `When the File Is Rejected Before Conversion Starts`,
      body: `Some uploads never make it to the conversion stage at all. That's deliberate, and the error message names the rule you hit.

**It's over the size limit.** The free tier accepts **10 MB per file**. Pro raises that to **50 MB**, and the API plan to **100 MB**. Oversized uploads are refused immediately with the limit stated, so you never sit through a job that was never going to run. Fixes in order of effort: compress the images, split the book into parts, or move up a tier.

**It's DRM-protected.** Purchases from Kindle, Kobo, and Google Play usually carry DRM, and those files are rejected on upload. We don't strip protection, so there's no workaround here — you'd need a DRM-free edition of the same title. Public-domain sources like [Project Gutenberg](https://www.gutenberg.org/) convert without any of this drama.

**The source is corrupt or truncated.** A half-downloaded EPUB or a PDF that ends mid-file gets refused too. Open the original in whatever reader you normally use. If it fails there, the damage travels with the file and no converter will repair it.

**You've hit the rate limit.** Free usage allows **5 conversions per hour** with no account needed. On shared office, campus, or library Wi-Fi, someone else on the same connection can eat part of that quota. Wait for the window to roll over, or switch networks.

One habit worth building: read the metadata preview before you confirm. It shows the title and author BookConv pulled out of the file, which is the fastest way to spot a source that isn't what you thought it was.`
    },
    {
      heading: `Expired Links: The File Is Already Gone`,
      body: `Converted files don't live on our servers. Download links are temporary, and once the window closes the file is deleted — that's the point, since we'd rather not keep your books.

So if you see an expired-link error, there's nothing to recover on our side. Convert again and save the result immediately. It takes seconds, and on the free tier it costs nothing but one of your five hourly conversions.

Three habits that avoid the problem entirely:

- Save the file the moment the download button appears, then confirm it opens
- Don't email yourself the result URL — the link stops working, so send the file instead
- Converting several books? Download each one as it completes rather than batching at the end

A 0 KB file is an interrupted transfer, not an expired link. Delete it and download again while the link is still live.`
    },
    {
      heading: `When It Downloads but Your Reader Won't Open It`,
      body: `The file is on disk at a sensible size and the reader still says no. At that point it's a format or sideloading problem, not a download problem.

### The format doesn't match the device
Easily the most common cause. Apple Books ignores MOBI and AZW3. Older Kindles won't open EPUB. Kobo wants EPUB. Nothing is broken — the book is just on the wrong device. Convert to what the hardware actually reads: [EPUB to AZW3](/convert/epub-to-azw3) for a modern Kindle, [MOBI to EPUB](/convert/mobi-to-epub) for almost everything else.

### Renaming isn't converting
Changing an extension from EPUB to MOBI does nothing to the contents, and readers reject the mismatch instantly. Run a real conversion.

### The sideload didn't finish
On Kindle, copy the file into the documents folder rather than the drive root, then eject the device properly instead of pulling the cable. An interrupted copy leaves a file that looks complete in a file manager and fails on the device. Restart the Kindle afterward so it re-indexes. Our [EPUB to MOBI walkthrough](/blog/epub-to-mobi-guide) covers sideloading step by step.

### It opens, but the layout is a mess
That's source quality, not a download failure. Messy markup carries straight through into the output. Fixed-layout PDFs are the usual offender — [PDF to EPUB](/convert/pdf-to-epub) gets you reflowable text, though heavily designed pages need cleanup afterward in a desktop editor. The Calibre [conversion documentation](https://manual.calibre-ebook.com/conversion.html) covers the settings that help.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Browser first** — silent blocking and interfering extensions cause more failed downloads than our servers ever do.
- **Links are temporary** — converted files are deleted after a while, so save the result as soon as it appears and re-convert if you miss the window.
- **Limits are upfront** — 10 MB free, 50 MB on Pro, 100 MB on API, with rejections at upload instead of halfway through.
- **DRM stops at the door** — protected files are refused on upload, and there's no workaround on our end.
- **Wrong device, not bad file** — most unopenable books just need converting to the format the reader supports.`
    }
  ]
};

export const faqs = [
  {
    question: `The download button does nothing when I click it. What now?`,
    answer: `Open a private window and try again — that rules out extensions in one move. If it works there, whitelist BookConv in your ad blocker or download manager. If it doesn't, check your browser's download settings for a blocked file type.`,
  },
  {
    question: `My download link expired. Can you resend the file?`,
    answer: `No, and not out of stubbornness — the file has already been deleted. Temporary links are how we avoid storing your books. Convert again and download straight away.`,
  },
  {
    question: `The file downloaded at 0 KB. What went wrong?`,
    answer: `The transfer stopped early, usually a dropped connection or a full disk. Free up space, reconnect, and download again while the link is still valid.`,
  },
  {
    question: `My file was rejected before the conversion even started. Why?`,
    answer: `Almost always the size cap. The free tier stops at 10 MB per file and names the limit in the error. Compress the images, split the book, or upgrade to Pro for 50 MB. The API plan allows 100 MB.`,
  },
  {
    question: `Can I convert a book I bought from Amazon or Kobo?`,
    answer: `Only if it's DRM-free. Protected purchases are rejected on upload, and we don't remove DRM, so there's nothing to troubleshoot. Look for a DRM-free edition of the same title.`,
  },
  {
    question: `I got a message about too many conversions.`,
    answer: `Free usage allows 5 conversions per hour without an account. Wait for the hour to roll over, or upgrade if you convert in volume. On shared Wi-Fi, other people on the same connection may have used part of that quota.`,
  },
  {
    question: `Nothing here worked. What should I send support?`,
    answer: `Source format, target format, file size, browser, operating system, and the exact error text you saw. That combination is usually enough to reproduce the issue on the first try.`,
  }
];
