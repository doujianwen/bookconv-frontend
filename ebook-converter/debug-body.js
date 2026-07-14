const fs = require('fs');
const dir = 'src/data/content';

// Check fb2-to-epub.ts line 16 character by character
const t = fs.readFileSync(dir + '/fb2-to-epub.ts', 'utf8');
const lines = t.split('\n');
const line16 = lines[15];

console.log('Line length:', line16.length);
console.log('First 30 chars:', JSON.stringify(line16.substring(0, 30)));
console.log('Last 30 chars:', JSON.stringify(line16.substring(line16.length - 30)));

// Check if it ends with a period followed by word chars
const lastChars = line16.slice(-20);
console.log('Last 20 chars:', JSON.stringify(lastChars));

// Try direct string replacement
if (line16.startsWith('      body: **') && !line16.includes('`')) {
  console.log('MATCH: Line starts with body:** and has no backticks');
}

// Count occurrences of **
const starCount = (line16.match(/\*\*/g) || []).length;
console.log('Double star count:', starCount);

// Find all positions of **
let pos = 0;
while ((pos = line16.indexOf('**', pos)) !== -1) {
  console.log('** at position', pos);
  pos += 2;
}