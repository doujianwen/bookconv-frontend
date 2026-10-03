// scripts/patch-warn-pages.cjs
// One-shot, hit-count-asserted transform of the 9 WARN convert pages
// to satisfy the calibrated GEO audit (>=8 headings, Quality, Comparison, FAQ>=6,
// honest wordCount metadata). Files are CRLF.
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'src/data/content');

// ---- audit-consistent counters ----
function countWordsIn(text) {
  return text.split(/\s+/).filter(w => /^[a-zA-Z]{3,}$/.test(w)).length;
}
function countBodyWords(src) {
  let t = 0;
  for (const m of src.matchAll(/body:\s*`([\s\S]*?)`\s*}/g)) t += countWordsIn(m[1]);
  for (const m of src.matchAll(/body:\s*'((?:[^'\\]|\\.)*)'\s*}/g)) t += countWordsIn(m[1]);
  return t;
}
function enOnly(src) {
  const i = src.indexOf('export const es =');
  return i > 0 ? src.slice(0, i) : src;
}
// normalize any newline style to CRLF
function crlf(s) { return s.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'); }

// ---- builders ----
function sec(heading, body, NL) {
  return '    {' + NL +
    "      heading: '" + heading + "'," + NL +
    '      body: `' + crlf(body) + '`' + NL +
    '    }';
}

function replaceOnce(src, find, repl, label) {
  const i = src.indexOf(find);
  if (i < 0) throw new Error('NOT FOUND: ' + label);
  const i2 = src.indexOf(find, i + 1);
  if (i2 >= 0) throw new Error('MULTIPLE: ' + label);
  return src.slice(0, i) + repl + src.slice(i + find.length);
}
function replaceOnceRe(src, re, repl, label) {
  const all = src.match(new RegExp(re.source, re.flags.replace('g', '') + 'g'));
  if (!all) throw new Error('NOT FOUND: ' + label);
  if (all.length !== 1) throw new Error('MULTIPLE: ' + label + ' (' + all.length + ')');
  return src.replace(re, repl);
}

// ---- reusable section bodies ----
const QUALITY = `Before you call the conversion done, run through this short list. It takes thirty seconds and catches the mistakes that waste an hour later.

- **Text is complete** — open the first and last chapters; no missing pages or truncated paragraphs.
- **Chapters are in order** — the reading sequence matches the original, with no duplicates or skips.
- **Special characters render** — accents, em dashes, and curly quotes show correctly, not as empty boxes.
- **Images came through** — covers and diagrams are present, not blank.
- **Source was DRM-free** — a successful file proves the converter could read it; locked files fail outright.
- **It opens on your target device** — the final proof is opening it where you actually intend to read.

Any of these look wrong? Re-run the conversion, or check whether your source file itself was the problem.`;

const BEFORE = (fmt) => `A clean source file is half the battle. Before you upload, take one minute to verify three things.

- **The file is really ${fmt}** — a wrong extension or a corrupted download is the most common cause of a failed conversion.
- **It is DRM-free** — files locked by a store or rights system cannot be read by any converter; you need the original unlocked copy.
- **It is under the size limit** — free accounts accept files up to 10MB, which covers most books; very large or image-heavy files may need a desktop tool.

If the file passes all three and the conversion still misbehaves, the problem is almost always the source, not the tool.`;

const TROUBLE = `Most conversions are clean, but a few patterns show up often enough to recognize in advance.

- **Pages out of order** — usually a source file with a broken reading-order manifest; re-export from the original.
- **Blank pages** — often a scanned image the converter could not decode; check the source.
- **Garbled text** — a character-encoding mismatch in the original; the content is there but needs a re-save as UTF-8.
- **Missing images** — media the source stored outside the main container; not every file bundles everything.

None of these mean the tool failed. They mean the source had an issue the converter did its best to interpret.`;

const CMP = {
  'AZW3 vs MOBI: Format Comparison': `You are choosing between a rich modern format and a bare-minimum legacy one. The table makes the trade obvious.

| Feature | AZW3 | MOBI |
|---------|------|------|
| Embedded fonts | Yes | No |
| CSS styling | Full subset | Minimal |
| Fixed layout | Supported | No |
| File size | Smaller (modern) | Larger (old) |
| Device support | 2011 and later Kindles | Every Kindle ever |
| Best for | Reading on modern devices | Legacy hardware only |

If your Kindle predates late 2011, MOBI is your only option. For anything newer, AZW3 reads better and takes less space. This conversion exists for the older hardware, not because MOBI is superior.`,
  'CHM vs MOBI: Format Comparison': `CHM is HTML in a box; MOBI is a stripped-down HTML reader format. Here is what the move costs and gains.

| Feature | CHM | MOBI |
|---------|-----|------|
| Underlying structure | HTML pages | Simplified HTML |
| Kindle support | None | Every Kindle |
| Embedded images | Yes | Yes |
| Advanced CSS | Lost | Lost |
| Searchable text | Yes | Yes |
| Best for | Windows help viewers | Kindle reading |

CHM converts cleanly because both formats are HTML-based, but MOBI drops the precise layout. For reading manuals and docs on a Kindle, that simplification is rarely a problem.`,
  'EPUB vs DOCX: Format Comparison': `Both are structured document formats, which is why this conversion is unusually faithful. The differences that matter:

| Feature | EPUB | DOCX |
|---------|------|------|
| Primary use | Reading | Editing |
| Heading styles | Semantic | Word styles |
| Track changes | No | Yes |
| Page model | Reflowable | Page or flow |
| Best for | Consumer ebooks | Manuscripts and drafts |

The conversion lands on DOCX because that is where editing, reviewing, and collaboration happen. You lose EPUB's reading-focused design but gain Word's production tooling.`,
  'LIT vs MOBI: Format Comparison': `LIT and MOBI are close cousins — both descend from early HTML ebook containers. The practical differences:

| Feature | LIT | MOBI |
|---------|-----|------|
| Origin | Microsoft Reader | Mobipocket and Kindle |
| Kindle support | None | Every Kindle |
| DRM | Often Microsoft-locked | DRM-free only here |
| Styling | Basic HTML | Smaller HTML subset |
| Best for | Dead-format archives | Kindle reading |

Because LIT is already HTML under the hood, conversion to MOBI is smooth and keeps your text and chapters intact. The main catch is DRM: locked LIT files cannot be converted by any tool.`,
  'MOBI vs AZW3: Format Comparison': `This is an upgrade, not a side-grade. MOBI is the outdated container; AZW3 is the modern one Amazon ships today.

| Feature | MOBI | AZW3 |
|---------|------|------|
| Embedded fonts | No | Yes |
| CSS styling | Minimal | Full subset |
| File size | Larger | Smaller |
| Device support | Every Kindle | 2011 and later Kindles |
| Best for | Pre-2011 hardware | Modern reading |

Unless your device predates late 2011, AZW3 is strictly better: sharper typography, smaller files, and proper styling. Convert to AZW3 to modernize a legacy library; convert the other way only for old Kindle hardware.`
};

// ---- per-file plan: ordered list of [heading, body] to insert ----
const PLAN = {
  'azw-to-mobi': [
    ['Conversion Quality Checklist', QUALITY],
    ['Before You Convert: Check Your AZW', BEFORE('AZW')],
    ['Troubleshooting: When the File Will Not Open', TROUBLE]
  ],
  'azw3-to-mobi': [
    ['AZW3 vs MOBI: Format Comparison', CMP['AZW3 vs MOBI: Format Comparison']],
    ['Conversion Quality Checklist', QUALITY],
    ['Before You Convert: Check Your AZW3', BEFORE('AZW3')]
  ],
  'djvu-to-pdf': [
    ['Conversion Quality Checklist', QUALITY],
    ['Before You Convert: Check Your DjVu', BEFORE('DjVu')],
    ['Troubleshooting: When Pages Look Wrong', TROUBLE]
  ],
  'epub-to-jpg': [
    ['Conversion Quality Checklist', QUALITY],
    ['Before You Convert: Check Your EPUB', BEFORE('EPUB')],
    ['Troubleshooting: When Images Look Wrong', TROUBLE]
  ],
  'epub-to-png': [
    ['Conversion Quality Checklist', QUALITY],
    ['Before You Convert: Check Your EPUB', BEFORE('EPUB')],
    ['Troubleshooting: When Images Look Wrong', TROUBLE]
  ],
  'chm-to-mobi': [
    ['CHM vs MOBI: Format Comparison', CMP['CHM vs MOBI: Format Comparison']],
    ['Conversion Quality Checklist', QUALITY],
    ['Before You Convert: Check Your CHM', BEFORE('CHM')]
  ],
  'epub-to-word': [
    ['EPUB vs DOCX: Format Comparison', CMP['EPUB vs DOCX: Format Comparison']],
    ['Conversion Quality Checklist', QUALITY],
    ['Before You Convert: Check Your EPUB', BEFORE('EPUB')]
  ],
  'lit-to-mobi': [
    ['LIT vs MOBI: Format Comparison', CMP['LIT vs MOBI: Format Comparison']],
    ['Conversion Quality Checklist', QUALITY],
    ['Before You Convert: Check Your LIT', BEFORE('LIT')]
  ],
  'mobi-to-azw3': [
    ['MOBI vs AZW3: Format Comparison', CMP['MOBI vs AZW3: Format Comparison']],
    ['Conversion Quality Checklist', QUALITY],
    ['Before You Convert: Check Your MOBI', BEFORE('MOBI')]
  ]
};

// ---- per-file FAQ additions (only where FAQ < 6) ----
const FAQ = {
  'djvu-to-pdf': {
    q: 'Is DjVu the same as PDF?',
    a: 'No. DjVu is a scan-optimized archive format that almost nothing opens natively, while PDF is the universal document standard every device reads. Converting DjVu to PDF is about compatibility, not quality — you trade a smaller file for a file that actually opens anywhere.'
  },
  'epub-to-jpg': {
    q: 'Can I convert only some pages to JPG?',
    a: 'Pro users can set a custom page range to pull just the pages they need, which is handy for a single diagram or passage. Free conversions process the whole book into a numbered ZIP of images.'
  },
  'epub-to-png': {
    q: 'Can I convert only some pages to PNG?',
    a: 'Pro users can specify a custom page range to extract just the pages they need, useful for a single chart or excerpt. Free conversions rasterize the entire book into a numbered ZIP of PNG files.'
  },
  'epub-to-word': {
    q: 'Will tables and images survive the conversion?',
    a: 'Basic tables and inline images carry over reliably, with tables keeping their structure and images placed at their original resolution. Complex CSS layout and embedded fonts get normalized to standard Word styling, which is usually what you want for editing.'
  }
};

const ANCHOR_SECTIONS = (NL) => '    }' + NL + '  ],' + NL + NL + '  faq: [';
// anchor includes the previous (original last) faq item's closing '}' so we can
// insert a comma after it when prepending the new item.
const ANCHOR_FAQ = (NL) => '    }' + NL + '  ]' + NL + ',';

let report = [];
for (const [slug, sections] of Object.entries(PLAN)) {
  const file = path.join(DIR, slug + '.ts');
  let src = fs.readFileSync(file, 'utf8');

  // already patched? skip (idempotent re-run safety)
  if (src.includes('Conversion Quality Checklist')) {
    const wc = countBodyWords(enOnly(src));
    report.push({ slug, wordCount: wc, skipped: true });
    continue;
  }

  // per-file EOL (repo mixes CRLF and LF)
  const NL = src.includes('\r\n') ? '\r\n' : '\n';

  // 1) insert sections before faq
  const insertBlock = sections.map(([h, b]) => sec(h, b, NL)).join(',' + NL + NL);
  const replSections = '    },' + NL + NL + insertBlock + NL + '  ],' + NL + NL + '  faq: [';
  src = replaceOnce(src, ANCHOR_SECTIONS(NL), replSections, slug + ':sections');

  // 2) append FAQ if planned
  if (FAQ[slug]) {
    const faq = FAQ[slug];
    const faqBlock = '    },' + NL + "    { q: '" + faq.q + "', a: '" + faq.a + "' }," + NL + '  ]' + NL + ',';
    src = replaceOnce(src, ANCHOR_FAQ(NL), faqBlock, slug + ':faq');
  }

  // 3) recompute honest wordCount metadata from EN-only body
  const wc = countBodyWords(enOnly(src));
  src = replaceOnceRe(src, /export const wordCount = \d+;/, 'export const wordCount = ' + wc + ';', slug + ':wordCount');

  fs.writeFileSync(file, src, 'utf8');
  report.push({ slug, wordCount: wc });
}

console.log('Patched:');
for (const r of report) console.log('  ' + r.slug + ' -> wordCount=' + r.wordCount);
