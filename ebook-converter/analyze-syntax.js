const fs = require('fs');
const dir = 'src/data/content';

// Fix UTF-16 files
['fb2-to-epub.ts', 'mobi-to-pdf.ts'].forEach(f => {
  const raw = fs.readFileSync(dir + '/' + f);
  const text = raw.toString('utf16le');
  fs.writeFileSync(dir + '/' + f, text, 'utf8');
  console.log('Fixed encoding: ' + f);
});

// Now analyze all content files for syntax errors
const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
const ts = require('typescript');

allFiles.forEach(f => {
  const text = fs.readFileSync(dir + '/' + f, 'utf8');
  const result = ts.transpileModule(text, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 }
  });
  if (result.diagnostics && result.diagnostics.length > 0) {
    console.log('ERROR in ' + f + ':');
    result.diagnostics.forEach(d => {
      const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
      if (d.file) {
        const pos = d.file.getLineAndCharacterOfPosition(d.start);
        console.log('  Line ' + (pos.line + 1) + ': ' + msg);
      } else {
        console.log('  ' + msg);
      }
    });
  } else {
    console.log('OK: ' + f);
  }
});