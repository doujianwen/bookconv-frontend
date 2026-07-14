const fs = require('fs');
const dir = 'src/data/content';

// Fix azw3-to-pdf.ts - rewrite the broken section
let text = fs.readFileSync(dir + '/azw3-to-pdf.ts', 'utf8');

// Find and replace the problematic section (lines 54-65)
const oldSection = `    {
      heading: 'When to Keep AZW3 vs When to Convert',
      body: \`- You are reading on a Kindle device\`
- You want adjustable font sizes and night mode
- You prefer reflowable text for comfortable mobile reading

**Convert to PDF when:**
- You need to print the document
- You require precise page numbers for citation
- You are sharing with recipients who may not have Kindle
- You need to archive for long-term preservation
- You want to add watermarks or security features
    }`;

const newSection = `    {
      heading: 'When to Keep AZW3 vs When to Convert',
      body: \`- You are reading on a Kindle device
- You want adjustable font sizes and night mode
- You prefer reflowable text for comfortable mobile reading

**Convert to PDF when:**
- You need to print the document
- You require precise page numbers for citation
- You are sharing with recipients who may not have Kindle
- You need to archive for long-term preservation
- You want to add watermarks or security features\`
    },`;

text = text.replace(oldSection, newSection);

// Also fix double closing };
text = text.replace(/(\};\n)(\}\n;)/, '$1');

fs.writeFileSync(dir + '/azw3-to-pdf.ts', text, 'utf8');
console.log('Fixed azw3-to-pdf.ts');

// Verify
const lines = text.split('\n');
for (let i = 52; i < Math.min(lines.length, 75); i++) {
  console.log((i+1) + ': ' + JSON.stringify(lines[i]));
}