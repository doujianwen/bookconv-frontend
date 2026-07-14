const fs = require('fs');
const dir = 'src/data/content';

let fixedCount = 0;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
files.forEach(f => {
  let text = fs.readFileSync(dir + '/' + f, 'utf8');
  const lines = text.split('\n');
  let changed = false;
  
  for (let i = 0; i < lines.length; i++) {
    // Pattern: body: **Content...** ending with a period and word chars (no quotes/backticks)
    if (/^\s+body:\s+\*\*.*\.[a-zA-Z]+$/.test(lines[i]) && !lines[i].includes('`') && !lines[i].includes("'")) {
      const match = lines[i].match(/^(\s+body:\s+)\*\*(.*)$/);
      if (match) {
        lines[i] = match[1] + '`' + match[2] + '`';
        changed = true;
        console.log(f + ' L' + (i+1) + ': Fixed');
      }
    }
    
    // Pattern: body: -Content ending with period and word chars (no quotes/backticks)
    if (/^\s+body:\s+-.*\.[a-zA-Z]+$/.test(lines[i]) && !lines[i].includes('`') && !lines[i].includes("'")) {
      const match = lines[i].match(/^(\s+body:\s+)(-.*)$/);
      if (match) {
        lines[i] = match[1] + '`' + match[2] + '`';
        changed = true;
        console.log(f + ' L' + (i+1) + ': Fixed');
      }
    }
    
    // Pattern: body: Content... ending with period and word chars (no quotes/backticks, no **)
    if (/^\s+body:\s+[A-Z][^`\*]*\.[a-zA-Z]+$/.test(lines[i]) && !lines[i].includes('`') && !lines[i].includes("'") && !lines[i].includes('*')) {
      const match = lines[i].match(/^(\s+body:\s+)(.+)$/);
      if (match) {
        lines[i] = match[1] + '`' + match[2] + '`';
        changed = true;
        console.log(f + ' L' + (i+1) + ': Fixed plain body');
      }
    }
  }
  
  if (changed) {
    fs.writeFileSync(dir + '/' + f, lines.join('\n'), 'utf8');
    fixedCount++;
  }
});

console.log('Total files fixed: ' + fixedCount);