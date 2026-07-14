const fs = require('fs');
let t = fs.readFileSync('src/app/page.tsx', 'utf8');
const oldStr = 'from "./metadata"}const';
const newStr = 'from "./metadata"\n\nconst';
t = t.replace(oldStr, newStr);
fs.writeFileSync('src/app/page.tsx', t);
console.log('Fixed page.tsx');
console.log('New content around line 14:', JSON.stringify(t.split('\n')[13]));