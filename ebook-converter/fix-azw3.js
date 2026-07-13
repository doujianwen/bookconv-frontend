var fs = require('fs');
var d = './src/data/content';
var c = fs.readFileSync(d+'/azw3-to-pdf.ts', 'utf8');
var orig = c;
// Fix: }; then }}; -> };
c = c.replace(/;\r?\n\}\};/g, ';');
console.log('Changed:', c !== orig);
if (c !== orig) {
  console.log('New ending:', JSON.stringify(c.slice(-100)));
}
fs.writeFileSync(d+'/azw3-to-pdf.ts', c, 'utf8');