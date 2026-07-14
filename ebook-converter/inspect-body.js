const fs = require('fs');
const dir = 'src/data/content';

['fb2-to-epub.ts', 'mobi-to-pdf.ts', 'doc-to-epub.ts'].forEach(f => {
  const t = fs.readFileSync(dir + '/' + f, 'utf8');
  const lines = t.split('\n');
  console.log('=== ' + f + ' L16 ===');
  console.log(JSON.stringify(lines[15]));
  console.log('Last 10:', JSON.stringify(lines[15].slice(-10)));
  console.log('Has backtick:', lines[15].includes('`'));
});