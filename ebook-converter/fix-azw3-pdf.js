const fs = require('fs');
const dir = 'src/data/content';

// Fix azw3-to-pdf.ts
let text = fs.readFileSync(dir + '/azw3-to-pdf.ts', 'utf8');
const lines = text.split('\n');

// Find and fix the structure issues
let changed = false;

// Remove duplicate } on line 53 (index 52)
if (lines[52].trim() === '}' && lines[51].trim() === '},') {
  // Check if this is a duplicate closing brace
  console.log('L52:', JSON.stringify(lines[52]));
  console.log('L53:', JSON.stringify(lines[53]));
  // The } on L53 should be removed as it duplicates the } on L52
  lines.splice(52, 1);
  changed = true;
  console.log('Removed duplicate } on L53');
}

// Fix body:- pattern - merge multi-line body into single template literal
// Lines 56-65 need to be wrapped in backticks
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("body: `-") && !lines[i].endsWith('`')) {
    // Start of a multi-line body that needs fixing
    let bodyLines = [lines[i]];
    i++;
    while (i < lines.length && !lines[i].includes('heading:') && !lines[i].includes('faq:') && lines[i].trim() !== '' && !/^\s*\]/.test(lines[i])) {
      bodyLines.push(lines[i]);
      i++;
    }
    // Remove trailing empty line
    while (bodyLines.length > 0 && bodyLines[bodyLines.length-1].trim() === '') {
      bodyLines.pop();
      i--;
    }
    const merged = '`' + bodyLines.join('\n').replace(/`/g, '\\`') + '`';
    // Replace lines from start to current position
    for (let j = bodyLines.length - 1; j >= 0; j--) {
      lines.splice(i - j, 1);
    }
    lines.splice(i - bodyLines.length, 0, merged);
    changed = true;
    console.log('Merged multi-line body');
  }
}

if (changed) {
  fs.writeFileSync(dir + '/azw3-to-pdf.ts', lines.join('\n'), 'utf8');
  console.log('Fixed azw3-to-pdf.ts');
} else {
  console.log('No changes needed for azw3-to-pdf.ts');
}