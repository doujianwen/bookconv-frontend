const fs = require('fs');
let t = fs.readFileSync('src/app/blog/[slug]/page.tsx', 'utf8');
// Fix the double comma: replace ",," with ","
t = t.replace(/,(\s*,)\)/g, ')');
// Also try direct replacement
t = t.replace(/length, 0) \|\| 0),,/g, 'length, 0) || 0),');
fs.writeFileSync('src/app/blog/[slug]/page.tsx', t);
console.log('Fixed blog/[slug]/page.tsx');
const lines = t.split('\n');
console.log('Line 119:', JSON.stringify(lines[118]));