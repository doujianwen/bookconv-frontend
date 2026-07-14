const fs = require('fs');
let t = fs.readFileSync('src/app/page.tsx', 'utf8');
t = t.replace('from "./metadata"}const', 'from "./metadata"\n\nconst');
fs.writeFileSync('src/app/page.tsx', t);
console.log('Fixed page.tsx');