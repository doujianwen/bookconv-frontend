const fs = require('fs');
let t = fs.readFileSync('src/app/page.tsx', 'utf8');
// The actual text in the file is: from "./metadata"}const
// We need to replace }const with }\n\nconst
t = t.replace(/metadata\"\}const/, 'metadata"\n\nconst');
fs.writeFileSync('src/app/page.tsx', t);
console.log('Fixed page.tsx');
const lines = t.split('\n');
console.log('Line 14:', JSON.stringify(lines[13]));
console.log('Line 15:', JSON.stringify(lines[14]));