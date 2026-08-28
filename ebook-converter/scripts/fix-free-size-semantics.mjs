// scripts/fix-free-size-semantics.mjs
//
// Follow-up to fix-free-size-claims.mjs. Swapping 50MB -> 10MB fixed the number
// but left sentences whose *reasoning* only held at 50MB, e.g.:
//   - "10MB comfortably covers a single standard issue"  (CBR issues run 20-80MB)
//   - "10MB, well beyond what a typical MOBI needs ... usually sits under 10MB"
//   - "10MB covers basically every ebook ... illustrated books rarely break 30MB"
//
// Being honest about the ceiling is also better content: a clear limit with a
// stated workaround is more useful (and more quotable) than a false reassurance.
//
// Usage: node scripts/fix-free-size-semantics.mjs [--dry]

import { readFileSync, writeFileSync } from 'node:fs';

const DRY = process.argv.includes('--dry');

/** file -> [ [exact old substring, new substring], ... ] */
const EDITS = {
  'src/data/content/cbr-to-pdf.ts': [
    [
      'Free accounts handle files up to 10MB, which comfortably covers a single standard issue. Full graphic novels and long manga volumes usually run larger — that\'s what Pro is for.',
      'Uploads are capped at 10MB. Comics are image-heavy, so this is the one category where the ceiling bites early — a single issue often lands above it, and full graphic novels almost always do. If your file is over the limit, compress the images first or use desktop [Calibre](https://calibre-ebook.com) for the large ones.',
    ],
    [
      'Free users can upload files up to 10MB, which fits most single issues. Full graphic novels and high-resolution manga volumes usually exceed that, so Pro accounts support larger uploads plus batch conversion for processing a whole series at once.',
      'Yes — 10MB per file. Comics hit that ceiling more often than any other format, since scanned pages are large. Slim or lower-resolution issues usually fit; full graphic novels and high-resolution manga volumes generally do not. For those, compress the images beforehand or convert locally with desktop Calibre.',
    ],
  ],
  'src/data/blog/cbr-to-pdf.ts': [
    [
      'The free 10 MB cap fits most single issues; longer works need a Pro account or desktop [Calibre](https://calibre-ebook.com).',
      'The 10 MB cap is the real constraint here — comic scans are large, so anything beyond a slim issue tends to exceed it. Compress the images first, or use desktop [Calibre](https://calibre-ebook.com) for full volumes.',
    ],
    [
      '- **Free tier = 10 MB** — fine for single issues, not whole shelves.',
      '- **10 MB per file** — the tightest constraint for comics; compress images or convert locally for full volumes.',
    ],
    [
      'Free users can upload files up to 10 MB, which fits most single issues. Full graphic novels and high-resolution manga volumes usually exceed that, so Pro accounts support larger uploads plus batch conversion.',
      'Uploads are capped at 10 MB. Comics reach that ceiling faster than other formats because scanned pages are large — slim or lower-resolution issues usually fit, while full graphic novels and high-resolution manga volumes generally do not. Compress the images first, or convert those locally with desktop Calibre.',
    ],
  ],
  'src/data/content/epub-to-jpg.ts': [
    [
      'Free accounts handle files up to 10MB, which covers basically every ebook — text-only novels are usually 1-3MB, and even illustrated books rarely break 30MB.',
      'Uploads are capped at 10MB. Text-only novels are usually 1-3MB and fit easily; heavily illustrated books can run well past the limit, so those need to be compressed first or handled with a desktop tool.',
    ],
    [
      'Free accounts accept EPUB files up to 10MB, which comfortably covers even heavily illustrated books since most ebooks are only a few megabytes. Pro accounts raise that limit and add batch processing for converting multiple books at once.',
      'Uploads are capped at 10MB. Most ebooks are only a few megabytes, so text-led titles fit comfortably. Image-heavy books are the exception and can exceed the ceiling — compress the images first, or convert those locally with desktop Calibre.',
    ],
  ],
  'src/data/content/mobi-to-pdf.ts': [
    [
      'Free accounts handle files up to 10MB — well beyond what a typical MOBI needs, since even a long illustrated title usually sits under 10MB.',
      'Uploads are capped at 10MB, which suits most MOBI files — a full-length novel typically lands between 300KB and 2MB. Heavily illustrated titles are the ones that can run past the limit.',
    ],
  ],
  'src/data/content/epub-to-png.ts': [
    [
      'Free accounts handle files up to 10MB — no text ebook comes close, and even heavily illustrated ones rarely do.',
      'Uploads are capped at 10MB. Text ebooks are nowhere near that, though image-heavy titles can exceed it.',
    ],
  ],
  'src/data/content/epub-to-html.ts': [
    [
      'Free accounts handle files up to 10MB, which covers essentially every text-based ebook and plenty of illustrated ones.',
      'Uploads are capped at 10MB, which covers essentially every text-based ebook. Image-heavy titles can exceed it.',
    ],
  ],
  'src/data/content/epub-to-rtf.ts': [
    [
      'Free accounts handle files up to 10MB, which covers virtually every ebook that is not a full-colour photography title.',
      'Uploads are capped at 10MB, which covers virtually every text-led ebook. Illustrated and full-colour titles can exceed it.',
    ],
  ],
  'src/data/content/djvu-to-pdf.ts': [
    [
      'Free accounts handle files up to 10MB, which covers the vast majority of scanned books since DjVu compresses so aggressively.',
      'Uploads are capped at 10MB. DjVu compresses aggressively, so many scanned books fit — but long or high-resolution scans can still exceed the limit.',
    ],
    [
      'Free users can upload files up to 10MB, which covers most DjVu books given how efficiently the format compresses. Pro accounts support larger uploads and batch conversion if you have a whole shelf to process.',
      'Yes — 10MB per file. DjVu is efficient enough that many scanned books fit under that, but long or high-resolution scans can exceed it. For those, convert locally with a desktop tool.',
    ],
  ],
  'src/data/blog/djvu-to-pdf.ts': [
    [
      '- **Free tier covers 10 MB** — enough for most DjVu books.',
      '- **10 MB per file** — DjVu compresses well, so many scans fit; long or high-resolution ones may not.',
    ],
    [
      'Free accounts upload files up to 10 MB, which covers most DjVu books given how efficiently the format compresses. Pro accounts support larger uploads and batch conversion.',
      'Uploads are capped at 10 MB. DjVu compresses efficiently, so many scanned books fit under that — long or high-resolution scans can still exceed it and are better converted locally.',
    ],
  ],
};

let applied = 0;
let failed = 0;

for (const [file, pairs] of Object.entries(EDITS)) {
  const raw = readFileSync(file, 'utf8');
  let out = raw;

  for (const [oldStr, newStr] of pairs) {
    if (!out.includes(oldStr)) {
      console.error(`  !! NOT FOUND in ${file}:`);
      console.error(`     ${oldStr.slice(0, 90)}...`);
      failed += 1;
      continue;
    }
    const occurrences = out.split(oldStr).length - 1;
    if (occurrences > 1) {
      console.error(`  !! AMBIGUOUS (${occurrences}x) in ${file}: ${oldStr.slice(0, 60)}...`);
      failed += 1;
      continue;
    }
    out = out.replace(oldStr, newStr);
    applied += 1;
    console.log(`  ok  ${file}`);
  }

  if (out !== raw && !DRY) writeFileSync(file, out, 'utf8');
}

console.log(`\n${DRY ? '[dry run] ' : ''}applied ${applied}, failed ${failed}`);
if (failed > 0) process.exit(1);
