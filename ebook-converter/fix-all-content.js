const fs = require('fs');
const dir = 'src/data/content';

// Get all content files except index.ts and the 2 that are already correct
const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

allFiles.forEach(f => {
  let text = fs.readFileSync(dir + '/' + f, 'utf8');
  let changed = false;
  
  // Fix 1: body with escaped backtick placeholders like \`Content not available\` or \`HTML is...\`
  // These should be regular strings or proper template literals
  text = text.replace(/body: \x60 \\\`([\s\S]*?)\\\`\x60/g, (match, content) => {
    return 'body: `' + content.replace(/\\\`/g, '`').replace(/\\\/`/g, '`') + '`';
  });
  
  // Fix 2: Remove escaped backticks in template literals
  text = text.replace(/\\\`/g, '`');
  
  // Fix 3: Fix }`, pattern - close template literal properly
  text = text.replace(/\}\`,/g, '},');
  
  // Fix 4: Fix ]`, pattern - close sections array properly
  text = text.replace(/\]\`,/g, '],');
  
  // Fix 5: Fix heading with comma on next line
  text = text.replace(/(heading:\s*'[^']*')\n(\s*,)/g, '$1,');
  
  // Fix 6: Fix ] + faq pattern
  text = text.replace(/\]\n\s*faq:/g, '],\n  faq:');
  
  // Fix 7: Remove duplicate closing };
  text = text.replace(/(\}\n)(\}\n;)/g, '$1');
  text = text.replace(/(\}\n)(};\n)(};)/g, '$1$2');
  
  // Fix 8: Fix double }};
  text = text.replace(/}};\n;/g, '};\n');
  
  // Fix 9: Fix missing commas between FAQ items
  text = text.replace(/(\}\)\n)(\s*\{ q:)/g, '$1  $2');
  
  if (text !== fs.readFileSync(dir + '/' + f, 'utf8')) {
    fs.writeFileSync(dir + '/' + f, text);
    console.log('Fixed ' + f);
  } else {
    console.log('OK ' + f);
  }
});

console.log('Done!');