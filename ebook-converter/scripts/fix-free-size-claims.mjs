// scripts/fix-free-size-claims.mjs
//
// One-off content fix: several pages claimed the FREE tier accepts 50MB uploads,
// while the server enforces a global 10MB cap (MAX_FILE_SIZE_MB, not tier-aware).
// Free users were being promised something the API rejects.
//
// Only the explicitly listed lines are touched — lines that correctly say
// "10 MB free / 50 MB Pro" must keep their Pro figure, so a blind global
// replace is not safe here.
//
// Usage: node scripts/fix-free-size-claims.mjs [--dry]

import { readFileSync, writeFileSync } from 'node:fs';

const DRY = process.argv.includes('--dry');

/** file -> 1-based line numbers that assert "free tier = 50MB" */
const TARGETS = {
  'src/data/content/azw3-to-mobi.ts': [50, 110],
  'src/data/content/cbr-to-pdf.ts': [52, 104],
  'src/data/content/djvu-to-pdf.ts': [47, 97],
  'src/data/content/doc-to-epub.ts': [55],
  'src/data/content/epub-to-doc.ts': [44, 96],
  'src/data/content/epub-to-html.ts': [47],
  'src/data/content/epub-to-jpg.ts': [51, 106],
  'src/data/content/epub-to-png.ts': [53],
  'src/data/content/epub-to-rtf.ts': [47],
  'src/data/content/epub-to-word.ts': [45, 106],
  'src/data/content/fb2-to-epub.ts': [50, 104],
  'src/data/content/html-to-epub.ts': [44, 91],
  'src/data/content/mobi-to-pdf.ts': [46],
  'src/data/content/mobi-to-txt.ts': [46],
  'src/data/content/rtf-to-epub.ts': [50, 97],
  'src/data/blog/cbr-to-pdf.ts': [21, 39, 48, 72],
  'src/data/blog/djvu-to-pdf.ts': [25, 59, 80],
  'src/data/blog/epub-to-azw3.ts': [27],
  'src/data/blog/fb2-to-epub.ts': [21, 49, 73],
};

// 10MB is an exact, server-enforced number, so hedging words ("about",
// "around", "roughly") are dropped along with the figure itself.
const RULES = [
  [/\bup to (?:about|around|roughly) 50 ?MB\b/g, (m) => (m.includes('50 MB') ? 'up to 10 MB' : 'up to 10MB')],
  [/\b(?:about|around|roughly) 50 ?MB\b/g, (m) => (m.includes('50 MB') ? '10 MB' : '10MB')],
  [/\b50 ?MB\b/g, (m) => (m.includes('50 MB') ? '10 MB' : '10MB')],
];

let totalLines = 0;
let totalFiles = 0;

for (const [file, lineNos] of Object.entries(TARGETS)) {
  const raw = readFileSync(file, 'utf8');
  // Preserve the file's existing line endings.
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  let touched = 0;

  for (const ln of lineNos) {
    const idx = ln - 1;
    const before = lines[idx];
    if (before === undefined) {
      console.error(`  !! ${file}:${ln} does not exist — line numbers drifted, aborting`);
      process.exit(1);
    }
    if (!/50 ?MB/.test(before)) {
      console.error(`  !! ${file}:${ln} has no "50MB" — line numbers drifted, aborting`);
      console.error(`     got: ${before.slice(0, 120)}`);
      process.exit(1);
    }
    let after = before;
    for (const [re, fn] of RULES) after = after.replace(re, fn);
    if (after !== before) {
      lines[idx] = after;
      touched += 1;
      console.log(`  ${file}:${ln}`);
    }
  }

  if (touched > 0) {
    totalFiles += 1;
    totalLines += touched;
    if (!DRY) writeFileSync(file, lines.join(eol), 'utf8');
  }
}

console.log(`\n${DRY ? '[dry run] would change' : 'changed'} ${totalLines} lines across ${totalFiles} files`);
