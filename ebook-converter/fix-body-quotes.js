const fs = require('fs');
const dir = 'src/data/content';

// Fix body: lines that start with ** but have no quotes
// Pattern: body: **Content...  ->  body: `**Content...`
let fixedCount = 0;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
files.forEach(f => {
  let text = fs.readFileSync(dir + '/' + f, 'utf8');
  const lines = text.split('\n');
  let changed = false;
  
  for (let i = 0; i < lines.length; i++) {
    // Fix body: that starts with ** without quotes
    if (/^\s+body:\s+\*\*/.test(lines[i])) {
      // Find the end of this body value (the closing } or ,)
      // For single-line body values
      const match = lines[i].match(/^(body:\s+)\*\*(.*)$/);
      if (match) {
        // Check if line ends with } or ,
        if (lines[i].endsWith('}') || lines[i].endsWith(',')) {
          lines[i] = match[1] + '`' + match[2] + '`';
          changed = true;
        }
      }
    }
    
    // Fix body: that starts with - without quotes
    if (/^\s+body:\s+-/.test(lines[i]) && !lines[i].includes('`')) {
      const match = lines[i].match(/^(body:\s+)(-.*)$/);
      if (match) {
        if (lines[i].endsWith('}') || lines[i].endsWith(',')) {
          lines[i] = match[1] + '`' + match[2] + '`';
          changed = true;
        }
      }
    }
  }
  
  if (changed) {
    fs.writeFileSync(dir + '/' + f, lines.join('\n'), 'utf8');
    console.log('Fixed ' + f);
    fixedCount++;
  }
});

console.log('Total fixed: ' + fixedCount);