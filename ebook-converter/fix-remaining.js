const fs = require('fs');

// Fix blog/[slug]/page.tsx - double comma on wordCount line
let t1 = fs.readFileSync('src/app/blog/[slug]/page.tsx', 'utf8');
t1 = t1.replace(/,(\s*,)\s*\)/g, ')');
fs.writeFileSync('src/app/blog/[slug]/page.tsx', t1);
console.log('Fixed blog/[slug]/page.tsx');

// Fix pricing/page.tsx - extra closing brace
let t2 = fs.readFileSync('src/app/pricing/page.tsx', 'utf8');
const lines = t2.split('\n');
let found = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '}' && i + 1 < lines.length && lines[i+1].trim() === '}') {
    // Check if this is the closing of a function or component
    console.log('L' + (i+1) + ': ' + JSON.stringify(lines[i]));
    console.log('L' + (i+2) + ': ' + JSON.stringify(lines[i+1]));
    console.log('L' + (i+3) + ': ' + JSON.stringify(lines[i+2]));
    found = true;
    break;
  }
}
if (!found) console.log('pricing: no double close found');
console.log(t2.substring(0, 600));