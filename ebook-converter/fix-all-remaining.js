const fs = require('fs');
const dir = 'src/data/content';

// Fix all content files that have broken template literals
let fixedCount = 0;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
files.forEach(f => {
  let text = fs.readFileSync(dir + '/' + f, 'utf8');
  const lines = text.split('\n');
  let changed = false;
  
  for (let i = 0; i < lines.length; i++) {
    // Fix: body: `Content**... -> body: `**Content...
    // Pattern: body: ` followed by non-backtick, non-star text ending with .**
    if (/^\s+body:\s+\`[^\*]/.test(lines[i]) && lines[i].includes('**')) {
      const match = lines[i].match(/^(\s+body:\s+\`)([^`]+)/);
      if (match) {
        // Check if the content ends with .** or similar pattern
        const content = match[2];
        if (content.includes('**')) {
          lines[i] = match[1] + content;
          changed = true;
          console.log(f + ' L' + (i+1) + ': Fixed body:`X** -> body:`**X');
        }
      }
    }
    
    // Fix: Remove double closing };
    if (lines[i].trim() === '};' && i+1 < lines.length && lines[i+1].trim() === '}') {
      lines.splice(i+1, 1);
      changed = true;
      console.log(f + ' L' + (i+2) + ': Removed duplicate }');
      i--;
    }
    
    // Fix: } without comma before next section
    if (lines[i].trim() === '}' && i+1 < lines.length && /^\s*\{/.test(lines[i+1])) {
      lines[i] = lines[i].replace('}', '},');
      changed = true;
      console.log(f + ' L' + (i+1) + ': Added missing comma');
    }
    
    // Fix: Missing comma after section }
    if (lines[i].trim() === '}' && i+1 < lines.length && !lines[i+1].trim().startsWith('}')) {
      // Check if next line is a new section
      if (/^\s*\{/.test(lines[i+1]) || /^\s*\]/.test(lines[i+1])) {
        lines[i] = lines[i].replace('}', '},');
        changed = true;
        console.log(f + ' L' + (i+1) + ': Added trailing comma');
      }
    }
  }
  
  if (changed) {
    fs.writeFileSync(dir + '/' + f, lines.join('\n'), 'utf8');
    fixedCount++;
  }
});

console.log('Total files fixed: ' + fixedCount);