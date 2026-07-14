const fs = require('fs');
const dir = 'src/data/content';

// Files that already work correctly (single-line body strings)
const goodFiles = ['cbr-to-pdf.ts', 'djvu-to-pdf.ts'];

// All other content files need fixing
const badFiles = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts' && !goodFiles.includes(f));

badFiles.forEach(f => {
  let text = fs.readFileSync(dir + '/' + f, 'utf8');
  
  // Normalize line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Fix 1: heading trailing comma on separate line
  // Pattern: heading: '...'\n,  ->  heading: '...',
  text = text.replace(/(heading:\s*'[^']*')\n(\s*,)/g, '$1,');
  
  // Fix 2: Fix body that starts with ` but has \\`Content not available\\` placeholder
  // These need real content
  if (text.includes('Content not available')) {
    console.log(f + ': has placeholder content, needs rewrite');
  }
  
  // Fix 3: Remove duplicate lines (like mobi-to-txt.ts line 16)
  const lines = text.split('\n');
  const fixed = [];
  let skipUntil = -1;
  for (let i = 0; i < lines.length; i++) {
    if (i >= skipUntil) {
      fixed.push(lines[i]);
    }
  }
  
  // Fix 4: Fix the ] + faq pattern
  // Pattern: ]`,\n      faq: [\n  ->  ],\n  faq: [\n
  text = text.replace(/\]\s*,?\s*\n\s*faq:/g, '],\n  faq:');
  
  // Fix 5: Remove duplicate closing };
  text = text.replace(/(}\n)(}\n;)/g, '$1');
  text = text.replace(/(}\n)(};\n)(};)/g, '$1$2');
  
  // Fix 6: Fix double }};
  text = text.replace(/}};\n;/g, '};\n');
  
  fs.writeFileSync(dir + '/' + f, text, 'utf8');
  console.log('Fixed ' + f);
});

console.log('Done!');