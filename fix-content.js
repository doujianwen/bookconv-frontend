var fs = require('fs');
var path = require('path');
var d = './ebook-converter/src/data/content';
var files = ['azw3-to-pdf.ts','epub-to-rtf.ts','epub-to-txt.ts','mobi-to-txt.ts','pdf-to-epub.ts','rtf-to-epub.ts'];
var bt = String.fromCharCode(96);
var sq = String.fromCharCode(39);
var bs = String.fromCharCode(92);
var crlf = String.fromCharCode(13) + String.fromCharCode(10);
var lf = String.fromCharCode(10);

files.forEach(function(f) {
  var c = fs.readFileSync(path.join(d, f), 'utf8');
  var orig = c;

  // Fix 1: \\\" at end of line -> '
  c = c.replace(new RegExp(bs + String.fromCharCode(34) + '$', 'gm'), sq);

  // Fix 2: }}; followed by }; -> };
  c = c.replace(/;\r?\n\};/g, ';');

  // Fix 3: Missing comma between faq items
  var pattern3 = sq + '}' + crlf + '(\\s+)\\{ q:';
  var repl3 = sq + '},\\n{ q:';
  c = c.replace(new RegExp(pattern3, 'g'), repl3);

  // Fix 4: subtitle closing with newline-comma
  var pattern4 = '(subtitle:[^,' + sq + ']*)\\r?\\n(\\s+)\\}\\r?\\n,';
  c = c.replace(new RegExp(pattern4, 'g'), ',\\n},');

  // Fix 5: Remove trailing backtick on its own line before }
  var pattern5 = '\\r?\\n' + bt + '\\r?\\n(\\s+)\\}';
  c = c.replace(new RegExp(pattern5, 'g'), '\\n}');

  // Fix 6: body: |table| without backticks
  var lines = c.split(lf);
  var newLines = [];
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i];
    if (l.indexOf('body: |') >= 0 && l.indexOf(bt) < 0) {
      var tableStart = l.indexOf('body: |');
      var tableContent = l.substring(tableStart);
      i++;
      while (i < lines.length && (tableContent.indexOf('|') >= 0 || lines[i].trim() === '')) {
        tableContent += lf + lines[i];
        i++;
      }
      newLines.push(l.substring(0, tableStart) + bt + tableContent + bt);
    } else if (l.indexOf('body: - ') >= 0 && l.indexOf(bt) < 0) {
      var listStart = l.indexOf('body: - ');
      var listContent = l.substring(0, listStart) + bt + lf + '- ' + l.substring(listStart + 7);
      i++;
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('**') || lines[i].trim() === '')) {
        listContent += lf + lines[i];
        i++;
      }
      listContent += bt;
      newLines.push(listContent);
    } else {
      newLines.push(l);
    }
  }
  c = newLines.join(lf);

  // Fix 7: Fix double }; };
  c = c.replace(/;\r?\n\};/g, ';');

  fs.writeFileSync(path.join(d, f), c, 'utf8');
  console.log((c !== orig ? 'Fixed' : 'OK') + ': ' + f);
});
console.log('Done!');