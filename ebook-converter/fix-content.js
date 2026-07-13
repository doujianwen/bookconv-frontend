var fs = require('fs');
var path = require('path');
var d = './src/data/content';
var files = ['azw3-to-epub.ts','azw3-to-mobi.ts','docx-to-epub.ts','epub-to-azw3.ts','epub-to-jpg.ts','epub-to-mobi.ts','epub-to-pdf.ts','epub-to-png.ts','epub-to-text.ts','html-to-epub.ts','mobi-to-epub.ts','txt-to-epub.ts'];
var bt = String.fromCharCode(96);
var sq = String.fromCharCode(39);
var bs = String.fromCharCode(92);
var crlf = String.fromCharCode(13) + String.fromCharCode(10);

files.forEach(function(f) {
  var c = fs.readFileSync(path.join(d, f), 'utf8');
  var orig = c;

  // Fix 1: body:  \\content\\\r -> body: 'content',
  var pat1 = 'body: ' + bt + ' ' + bs+bs+bt + '([^' + bt + ']*)' + bs+bs+bt + crlf;
  c = c.replace(new RegExp(pat1, 'g'), function(m, content) {
    return 'body: ' + sq + content.trim() + sq + ',';
  });

  // Fix 2: Remove }, -> },
  c = c.replace(/\}\,$/gm, '},');

  // Fix 3: Remove ], -> ],
  c = c.replace(/\]\$/gm, ']');

  // Fix 4: Missing comma between faq items
  c = c.replace(sq + '}' + crlf + '(\\s+)\\{ q:', sq + '},\\n{ q:');

  // Fix 5: subtitle closing with newline-comma
  c = c.replace('(subtitle:[^,' + sq + ']*)' + crlf + '(\\s+)\\}' + crlf + ',', function(m, p1, p2) {
    return p1 + ',' + crlf + p2 + '}';
  });

  // Fix 6: Fix }}; followed by }; -> };
  c = c.replace(/;\r?\n\};/g, ';');

  fs.writeFileSync(path.join(d, f), c, 'utf8');
  console.log((c !== orig ? 'Fixed' : 'OK') + ': ' + f);
});
console.log('Done!');