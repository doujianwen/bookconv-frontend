const fs = require('fs');
const dir = 'src/app';

// Fix page.tsx - missing newline after import
let page = fs.readFileSync(dir + '/page.tsx', 'utf8');
page = page.replace(
  'from "./metadata"}const',
  'from "./metadata"\n\nconst'
);
fs.writeFileSync(dir + '/page.tsx', page);
console.log('Fixed page.tsx');

// Fix blog/[slug]/page.tsx - double comma on wordCount
let blog = fs.readFileSync(dir + '/blog/[slug]/page.tsx', 'utf8');
blog = blog.replace(/,\s*,\s*\)/g, ')');
fs.writeFileSync(dir + '/blog/[slug]/page.tsx', blog);
console.log('Fixed blog/[slug]/page.tsx');

console.log('Done!');