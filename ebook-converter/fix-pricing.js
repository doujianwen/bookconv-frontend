const fs = require('fs');
const dir = 'src/app';

// Fix pricing/page.tsx - missing closing } for metadata object
let t = fs.readFileSync(dir + '/pricing/page.tsx', 'utf8');
const lines = t.split('\n');
console.log('Lines 18-25:');
for (let i = 17; i < Math.min(26, lines.length); i++) {
  console.log((i+1) + ': ' + JSON.stringify(lines[i]));
}

// The metadata object needs a closing }
// Line 21 has }, and line 22 is empty, then line 23 exports function
// So we need to add } before the export
if (!lines[21].trim()) {
  // Insert } at line 22 (index 21)
  lines.splice(21, 0, '}');
  console.log('Added missing }');
}

fs.writeFileSync(dir + '/pricing/page.tsx', lines.join('\n'));
console.log('Fixed pricing/page.tsx');