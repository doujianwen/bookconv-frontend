// scripts/fix-faq-comma.cjs
// Fix: inserted FAQ item lacked a comma after the previous last item.
// Byte-level, EOL-agnostic, no regex on the question text.
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'src/data/content');

const MAP = {
  'djvu-to-pdf': "Is DjVu the same as PDF?",
  'epub-to-jpg': "Can I convert only some pages to JPG?",
  'epub-to-png': "Can I convert only some pages to PNG?",
  'epub-to-word': "Will tables and images survive the conversion?"
};

for (const [slug, q] of Object.entries(MAP)) {
  const f = path.join(DIR, slug + '.ts');
  let s = fs.readFileSync(f, 'utf8');
  const marker = "{ q: '" + q + "'";
  const idx = s.indexOf(marker);
  if (idx < 0) throw new Error('MARKER NOT FOUND in ' + slug);
  if (s.indexOf(marker, idx + 1) >= 0) throw new Error('MULTIPLE MARKER in ' + slug);
  // backtrack to the '}' that closes the previous (original last) faq item
  let j = idx - 1;
  while (j >= 0 && s[j] !== '}') j--;
  if (j < 0) throw new Error('NO CLOSING BRACE before marker in ' + slug);
  if (!/[\r\n]/.test(s.slice(j, idx))) throw new Error('NO NEWLINE before marker in ' + slug);
  // already has a comma?
  if (s[j + 1] === ',') { console.log('already fixed', slug); continue; }
  s = s.slice(0, j + 1) + ',' + s.slice(j + 1);
  fs.writeFileSync(f, s, 'utf8');
  console.log('fixed', slug);
}
console.log('done');
