var fs = require('fs');
var d = './ebook-converter/src/data/content';
var files = ['azw3-to-pdf.ts','epub-to-rtf.ts','epub-to-txt.ts','mobi-to-txt.ts','pdf-to-epub.ts','rtf-to-epub.ts'];

files.forEach(function(f) {
  var c = fs.readFileSync(d+'/'+f, 'utf8');
  var orig = c;
  
  // Fix subtitle closing: subtitle: '...'\n  }\n, -> subtitle: '...',\n  },
  c = c.replace(/(subtitle:[^,\x27]*)\r?\n(\s+)\}\r?\n,/g, ',\n},');
  
  // Fix \" at end of body content -> '
  c = c.replace(/\\"\s*$/gm, '\x27');
  
  // Fix }}; followed by }; -> };
  c = c.replace(/;\r?\n\};/g, ';');
  
  // Fix missing comma between faq items
  c = c.replace(/\x27\}\r?\n(\s+)\{ q:/g, '\x27},\n{ q:');
  
  // Fix trailing backtick on its own line before }
  c = c.replace(/\r?\n\r?\n(\s+)\}/g, '\n$1}');
  
  fs.writeFileSync(d+'/'+f, c, 'utf8');
  console.log((c !== orig ? 'Fixed' : 'OK') + ': '+f);
});
console.log('Done!');