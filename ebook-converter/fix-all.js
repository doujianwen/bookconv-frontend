const fs = require('fs');
const dir = 'src/data/content';

// Fix epub-to-html.ts (UTF-16)
try {
  const raw = fs.readFileSync(dir + '/epub-to-html.ts');
  const text = raw.toString('utf16le');
  fs.writeFileSync(dir + '/epub-to-html.ts', text, 'utf8');
  console.log('Fixed epub-to-html.ts encoding');
} catch(e) { console.log('epub-to-html error:', e.message); }

// Fix all other files
const files = [
  'doc-to-epub.ts','epub-to-doc.ts','epub-to-word.ts','epub-to-jpg.ts',
  'epub-to-png.ts','epub-to-rtf.ts','epub-to-txt.ts','lit-to-epub.ts',
  'mobi-to-txt.ts','pdf-to-epub.ts','rtf-to-epub.ts','txt-to-epub.ts',
  'azw3-to-epub.ts','epub-to-mobi.ts','epub-to-pdf.ts','epub-to-azw3.ts',
  'azw3-to-mobi.ts','azw3-to-pdf.ts','docx-to-epub.ts'
];

files.forEach(f => {
  let text;
  try {
    const raw = fs.readFileSync(dir + '/' + f);
    if (raw[0]===0xFF && raw[1]===0xFE) {
      text = raw.toString('utf16le');
    } else {
      text = raw.toString('utf8');
    }
  } catch(e) {
    console.log(f + ': read error ' + e.message);
    return;
  }

  // Step 1: Fix heading trailing comma on separate line
  text = text.replace(/(heading:\s*'[^']*')\r?\n(\s*,)/g, '$1,');

  // Step 2: Fix body single-quote multi-line - wrap in backticks
  const lines = text.split('\n');
  const result = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s+body:\s*'[^'\`]*$/.test(line)) {
      let bodyLines = [line];
      i++;
      while (i < lines.length) {
        const next = lines[i];
        bodyLines.push(next);
        if (next.includes("',") || next.includes("'}")) break;
        i++;
      }
      let merged = bodyLines.join('\n');
      merged = merged.replace(/^(\s+body:\s*)'/, '$1`');
      merged = merged.replace(/'\s*,?}/g, '`}');
      result.push(merged);
    } else {
      result.push(line);
    }
    i++;
  }
  text = result.join('\n');

  // Step 3: Remove double closing };
  text = text.replace(/(};\r?\n)(};)/g, '$1');

  fs.writeFileSync(dir + '/' + f, text, 'utf8');
  console.log('Fixed ' + f);
});
console.log('Done!');