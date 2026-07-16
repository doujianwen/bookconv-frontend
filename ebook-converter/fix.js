const fs = require('fs');
const path = 'src/data/content/azw3-to-pdf.ts';
const content = fs.readFileSync(path, 'utf8');
fs.writeFileSync(path + '.bak', content);

const bt = '`';
const lines = content.split('\n');
let out = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  if (line.includes('body:') && line.includes(bt)) {
    // Start of multi-line template body
    let bodyLines = [line];
    i++;
    while (i < lines.length) {
      const next = lines[i];
      if (next.trim() === ',') {
        bodyLines.push(next);
        i++;
        break;
      }
      if (next.trim() === '\\n},') {
        bodyLines.push(next);
        i++;
        break;
      }
      if (next.trim() === ']') {
        bodyLines.push(next);
        i++;
        break;
      }
      bodyLines.push(next);
      i++;
    }
    console.log('Found body block starting at L' + (out.length + 1));
    // Process: join bodyLines, extract content, convert to single-quoted string
    // ... complex logic
    out = out.concat(bodyLines);
  } else {
    out.push(line);
    i++;
  }
}
console.log('Processed');
