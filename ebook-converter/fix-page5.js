const fs = require('fs');
let t = fs.readFileSync('src/app/page.tsx', 'utf8');
// The actual string in the file is: from "./metadata"}const
// We need to find it exactly and replace
const target = 'from "./metadata"}const';
if (t.includes(target)) {
  t = t.replace(target, 'from "./metadata"\n\nconst');
  console.log('Replaced with target string');
} else {
  // Try without }
  const target2 = 'from "./metadata"const';
  if (t.includes(target2)) {
    t = t.replace(target2, 'from "./metadata"\n\nconst');
    console.log('Replaced with target2');
  } else {
    // Just search for the pattern
    const idx = t.indexOf('generateMetadata');
    console.log('Found at index:', idx);
    console.log('Context:', JSON.stringify(t.substring(idx-5, idx+60)));
  }
}
fs.writeFileSync('src/app/page.tsx', t);
console.log('Done');