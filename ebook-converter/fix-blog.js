const fs = require('fs');
// Fix blog/[slug]/page.tsx - double comma on wordCount line
let t = fs.readFileSync('src/app/blog/[slug]/page.tsx', 'utf8');
t = t.replace(/,(\s*,)\s*\)/g, ')');
fs.writeFileSync('src/app/blog/[slug]/page.tsx', t);
console.log('Fixed blog/[slug]/page.tsx');

// Verify
const lines = t.split('\n');
console.log('Line 119:', JSON.stringify(lines[118]));