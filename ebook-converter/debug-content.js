const fs = require('fs');
const dir = 'src/data/content';

const files = [
  'epub-to-text.ts', 'html-to-epub.ts', 'mobi-to-epub.ts', 'azw3-to-epub.ts',
  'azw3-to-mobi.ts', 'azw3-to-pdf.ts', 'doc-to-epub.ts', 'docx-to-epub.ts',
  'epub-to-azw3.ts', 'epub-to-doc.ts', 'epub-to-html.ts', 'epub-to-jpg.ts',
  'epub-to-mobi.ts', 'epub-to-pdf.ts', 'epub-to-png.ts', 'epub-to-rtf.ts',
  'epub-to-txt.ts', 'epub-to-word.ts', 'lit-to-epub.ts', 'mobi-to-txt.ts',
  'pdf-to-epub.ts', 'rtf-to-epub.ts', 'txt-to-epub.ts'
];

files.forEach(f => {
  const t = fs.readFileSync(dir + '/' + f, 'utf8');
  const lines = t.split('\n');
  
  // Find lines with backtick but not properly used as template literals
  let issues = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check for body: followed by content that should be a string
    if (trimmed.startsWith('body:') || trimmed.startsWith('body :')) {
      // Does it have backticks?
      if (trimmed.includes('`')) {
        // Count backticks - should be even
        const btCount = (trimmed.match(/`/g) || []).length;
        if (btCount % 2 !== 0) {
          issues.push('L' + (i+1) + ': odd backtick count in body start');
        }
      } else if (!trimmed.endsWith("'") && !trimmed.endsWith('"')) {
        issues.push('L' + (i+1) + ': body starts without closing quote');
      }
    }
    
    // Check for unbalanced quotes
    if (trimmed.startsWith("heading: '") && trimmed.endsWith(',')) {
      // This is fine - heading with comma
    }
    
    // Check for lines that look like they might break the object structure
    if (trimmed === '`}' || trimmed === "'`" || trimmed === "`") {
      issues.push('L' + (i+1) + ': suspicious standalone backtick/quote');
    }
  }
  
  if (issues.length > 0) {
    console.log(f + ': ' + issues.join('; '));
  } else {
    console.log(f + ': OK (' + lines.length + ' lines)');
  }
});