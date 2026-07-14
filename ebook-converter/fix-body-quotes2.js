const fs = require('fs');
const dir = 'src/data/content';

// Fix body: lines that start with ** or - without quotes
let fixedCount = 0;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
files.forEach(f => {
  let text = fs.readFileSync(dir + '/' + f, 'utf8');
  const lines = text.split('\n');
  let changed = false;
  
  for (let i = 0; i < lines.length; i++) {
    // Pattern: body: **Content...** at end of line (no closing quote/backtick)
    if (/^\s+body:\s+\*\*.*\.\w+$/.test(lines[i]) && !lines[i].includes('`') && !lines[i].includes("'")) {
      // Single-line body starting with ** ending with a period followed by word chars
      const match = lines[i].match(/^(\s+body:\s+)\*\*(.*)$/);
      if (match) {
        lines[i] = match[1] + '`' + match[2] + '`';
        changed = true;
        console.log(f + ' L' + (i+1) + ': Fixed body:** -> body:`**...**`');
      }
    }
    
    // Pattern: body: -Content at end of line
    if (/^\s+body:\s+-/.test(lines[i]) && !lines[i].includes('`')) {
      const match = lines[i].match(/^(\s+body:\s+)(-.*)$/);
      if (match) {
        lines[i] = match[1] + '`' + match[2] + '`';
        changed = true;
        console.log(f + ' L' + (i+1) + ': Fixed body:- -> body:`-...`');
      }
    }
  }
  
  if (changed) {
    fs.writeFileSync(dir + '/' + f, lines.join('\n'), 'utf8');
    fixedCount++;
  }
});

console.log('Total files fixed: ' + fixedCount);