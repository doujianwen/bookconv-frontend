const fs = require('fs');
let t = fs.readFileSync('src/app/page.tsx', 'utf8');
t = t.replace('from "./metadata"}const', 'from "./metadata"\n\nconst');
fs.writeFileSync('src/app/page.tsx', t);
console.log('Fixed page.tsx spacing');

// Also verify metadata.ts
let meta = fs.readFileSync('src/app/metadata.ts', 'utf8');
console.log('metadata.ts first 5 lines:');
meta.split('\n').slice(0, 6).forEach((l, i) => console.log((i+1) + ': ' + JSON.stringify(l)));