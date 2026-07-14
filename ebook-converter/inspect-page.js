const fs = require('fs');
let t = fs.readFileSync('src/app/page.tsx', 'utf8');
// Find the exact problematic area
const idx = t.indexOf('generateMetadata');
console.log('Around generateMetadata:', JSON.stringify(t.substring(idx-10, idx+60)));