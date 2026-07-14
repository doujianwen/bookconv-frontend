const fs = require('fs');
const dir = 'src/data/content';

// Get all content files except index.ts and the 2 that are already correct
const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

allFiles.forEach(f => {
  let text = fs.readFileSync(dir + '/' + f, 'utf8');
  
  // Step 1: Normalize line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Step 2: Fix heading trailing comma on separate line
  text = text.replace(/(heading:\s*'[^']*')\n(\s*,)/g, '$1,');
  
  // Step 3: Fix body with escaped backticks like \` Content \`
  text = text.replace(/body:\s*\x60\s*\\\`/g, 'body: `');
  text = text.replace(/\\\`\s*\x60/g, '`');
  
  // Step 4: Fix }`, pattern - close template literal properly
  text = text.replace(/\}\`,/g, '},');
  
  // Step 5: Fix ]`, pattern - close sections array properly
  text = text.replace(/\]\`,/g, '],');
  
  // Step 6: Fix ] + faq pattern
  text = text.replace(/\]\n\s*faq:/g, '],\n  faq:');
  
  // Step 7: Remove duplicate closing };
  text = text.replace(/(\};\n)(\}\n;)/g, '$1');
  text = text.replace(/(\};\n)(};\n)(};)/g, '$1$2');
  
  // Step 8: Fix double }};
  text = text.replace(/}};\n;/g, '};\n');
  
  // Step 9: Fix missing commas between FAQ items
  text = text.replace(/(\}\)\n)(\s*\{ q:)/g, '$1  $2');
  
  // Step 10: Fix missing commas between sections
  // Pattern: }\n    {\n -> },\n    {
  text = text.replace(/(\}\n)(\s+\{)/g, (match, p1, p2) => {
    if (!p1.trim().endsWith(',') && !p1.trim().endsWith('`')) {
      return p1.replace(/\}$/, '},') + p2;
    }
    return match;
  });
  
  // Step 11: Fix body: **Content without quotes
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    // body: **Content... ending with ."
    if (/^\s+body:\s+\*\*.*\.\w+$/.test(lines[i]) && !lines[i].includes('`')) {
      const match = lines[i].match(/^(\s+body:\s+)\*\*(.*)$/);
      if (match) {
        lines[i] = match[1] + '`' + match[2] + '`';
      }
    }
    // body: -Content... ending with ."
    if (/^\s+body:\s+-.*\.\w+$/.test(lines[i]) && !lines[i].includes('`')) {
      const match = lines[i].match(/^(\s+body:\s+)(-.*)$/);
      if (match) {
        lines[i] = match[1] + '`' + match[2] + '`';
      }
    }
    // body: Plain text... ending with ."
    if (/^\s+body:\s+[A-Z][^`\*]*\.\w+$/.test(lines[i]) && !lines[i].includes('`') && !lines[i].includes("'")) {
      const match = lines[i].match(/^(\s+body:\s+)(.+)$/);
      if (match) {
        lines[i] = match[1] + '`' + match[2] + '`';
      }
    }
  }
  text = lines.join('\n');
  
  fs.writeFileSync(dir + '/' + f, text, 'utf8');
  console.log('Fixed ' + f);
});

console.log('Done!');