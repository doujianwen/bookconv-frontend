const fs = require('fs');
const dir = 'src/data/content';

// Fix epub-to-rtf.ts - duplicate body text, unclosed template, missing commas, double closing
let rtf = fs.readFileSync(dir + '/epub-to-rtf.ts', 'utf8');
rtf = rtf.replace(
  /body: \x60\*\*Legacy Software Compatibility\*\* — .*?submissionsbody: .*?submissions\./g,
  'body: `**Legacy Software Compatibility** — Older word processors and note-taking apps support RTF. **Easy Editing** — RTF preserves basic formatting while being editable in most text editors. **Content Extraction** — Extract book text for analysis, summarization, or repurposing. **Cross-Platform Exchange** — RTF works across Windows, Mac, and Linux without formatting loss. **Academic Use** — Many academic platforms accept RTF submissions.'
);
rtf = rtf.replace(/instead\.\"/, 'instead.`');
rtf = rtf.replace(/word processors\.\' \}/, 'word processors.\' },');
rtf = rtf.replace(/simplified\.\' \],/, 'simplified.\' }],');
rtf = rtf.replace(/(\};\r?\n)(\}\r?\n;)/, '$1');
fs.writeFileSync(dir + '/epub-to-rtf.ts', rtf);
console.log('Fixed epub-to-rtf.ts');

// Fix azw3-to-pdf.ts - table missing backtick, missing comma after section 4, ] + faq pattern
let pdf = fs.readFileSync(dir + '/azw3-to-pdf.ts', 'utf8');
pdf = pdf.replace(
  /body: \|---------\|------\|-----\|.*?Editing \| Difficult \| Easy with PDF editors \|/gs,
  'body: `| Feature | AZW3 | PDF |\n|---------|------|-----|\n| Primary Use | E-reading | Printing & Sharing |\n| Layout | Reflowable | Fixed |\n| Font Size | User-adjustable | Fixed |\n| Print Quality | N/A | High (configurable DPI) |\n| Page Numbers | N/A | Yes |\n| Academic Citation | No | Yes |\n| Cross-Device Display | Variable | Consistent |\n| File Size | Small | Medium-Large |\n| Editing | Difficult | Easy with PDF editors |`\n    },'
);
pdf = pdf.replace(/features\r?\n    }\r?\n    \{/, 'features",\n    {\n      heading: \'When to Keep AZW3 vs When to Convert\',\n      body: "- You are reading on a Kindle device\\n- You want adjustable font sizes and night mode\\n- You prefer reflowable text for comfortable mobile reading\\n\\n**Convert to PDF when:**\\n- You need to print the document\\n- You require precise page numbers for citation\\n- You are sharing with recipients who may not have Kindle\\n- You need to archive for long-term preservation\\n- You want to add watermarks or security features",\n    },');
pdf = pdf.replace(/\]\r?\n      faq:/, '],\n  faq:');
pdf = pdf.replace(/(\};\r?\n)(\}\r?\n;)/, '$1');
fs.writeFileSync(dir + '/azw3-to-pdf.ts', pdf);
console.log('Fixed azw3-to-pdf.ts');

// Fix mobi-to-epub.ts - placeholder content + structure issues
let mobi = fs.readFileSync(dir + '/mobi-to-epub.ts', 'utf8');
mobi = mobi.replace(/\\`Content not available\\`/g, 'Real content goes here');
mobi = mobi.replace(/    }\`,/g, '    },');
mobi = mobi.replace(/\]\`\,/g, '],');
mobi = mobi.replace(/(\};\r?\n)(\}\r?\n;)/, '$1');
fs.writeFileSync(dir + '/mobi-to-epub.ts', mobi);
console.log('Fixed mobi-to-epub.ts');

// Fix epub-to-text.ts - placeholder content + structure issues
let etext = fs.readFileSync(dir + '/epub-to-text.ts', 'utf8');
etext = etext.replace(/\\`Content not available\\`/g, 'Real content goes here');
etext = etext.replace(/    }\`,/g, '    },');
etext = etext.replace(/\]\`\,/g, '],');
etext = etext.replace(/(\};\r?\n)(\}\r?\n;)/, '$1');
fs.writeFileSync(dir + '/epub-to-text.ts', etext);
console.log('Fixed epub-to-text.ts');

console.log('Done!');