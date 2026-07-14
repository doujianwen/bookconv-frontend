const fs = require('fs');
const dir = 'src/data/content';

// Fix rtf-to-epub.ts - duplicate body text on line 16, missing closing backtick on line 26
let rtf = fs.readFileSync(dir + '/rtf-to-epub.ts', 'utf8');
rtf = rtf.replace(
  /body: \x60\x60(.*?)body: \x60(.*?)\./s,
  'body: `$2.'
);
rtf = rtf.replace(/metadata\\\"/, 'metadata`');
rtf = rtf.replace(/(\};\n)(\}\n;)/, '$1');
fs.writeFileSync(dir + '/rtf-to-epub.ts', rtf);
console.log('Fixed rtf-to-epub.ts');

// Fix txt-to-epub.ts - broken template literal on lines 27, 34
let txt = fs.readFileSync(dir + '/txt-to-epub.ts', 'utf8');
txt = txt.replace(
  /heading: \'Intelligent Chapter Detection\'\n\x60\s*body: \x60/,
  'heading: \'Intelligent Chapter Detection\',\n      body: `'
);
txt = txt.replace(
  /heading: \'Encoding Issue Handling\'\n\x60\s*body: \x60/,
  'heading: \'Encoding Issue Handling\',\n      body: `'
);
fs.writeFileSync(dir + '/txt-to-epub.ts', txt);
console.log('Fixed txt-to-epub.ts');

// Fix azw3-to-epub.ts - double backtick on body lines
let azw3 = fs.readFileSync(dir + '/azw3-to-epub.ts', 'utf8');
azw3 = azw3.replace(/body: \x60 \x60/g, 'body: `');
azw3 = azw3.replace(/\]\s*,\s*\n\s*faq:/g, '],\n  faq:');
fs.writeFileSync(dir + '/azw3-to-epub.ts', azw3);
console.log('Fixed azw3-to-epub.ts');

// Fix pricing/page.tsx - extra closing brace
let pricing = fs.readFileSync('src/app/pricing/page.tsx', 'utf8');
const pLines = pricing.split('\n');
for (let i = 0; i < pLines.length; i++) {
  if (pLines[i].trim() === '}' && i + 1 < pLines.length && pLines[i+1].trim() === '}') {
    console.log('pricing L' + (i+1) + ': ' + JSON.stringify(pLines[i]));
    console.log('pricing L' + (i+2) + ': ' + JSON.stringify(pLines[i+1]));
    // Remove one of the duplicate }
    pLines.splice(i, 1);
    break;
  }
}
pricing = pLines.join('\n');
fs.writeFileSync('src/app/pricing/page.tsx', pricing);
console.log('Fixed pricing/page.tsx');

console.log('Done!');