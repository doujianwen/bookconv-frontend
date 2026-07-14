const fs = require('fs');
const dir = 'src/data/content';

// Fix azw3-to-pdf.ts - add backticks to body values that need them
let text = fs.readFileSync(dir + '/azw3-to-pdf.ts', 'utf8');

// Fix the table body - line 41 starts with | but needs backtick
text = text.replace(
  /body: \|---------/,
  'body: `|---------'
);

// Fix the when/convert body - line 54 starts with - but needs backtick  
text = text.replace(
  /heading: \'When to Keep AZW3 vs When to Convert\',\n      body: - You are reading/,
  'heading: \'When to Keep AZW3 vs When to Convert\',\n      body: `- You are reading'
);

// Add closing backtick to the table body (after "Easy with PDF editors |")
text = text.replace(
  /Easy with PDF editors \|\n    }\n    {/,
  'Easy with PDF editors |`\n    },\n    {'
);

// Add closing backtick to the when/convert body (after "security features")
text = text.replace(
  /security features\n    }\n  \],/,
  'security features`\n    },\n  ],'
);

// Remove duplicate };
text = text.replace(/(\};\n)(\}\n;)/, '$1');

fs.writeFileSync(dir + '/azw3-to-pdf.ts', text, 'utf8');
console.log('Fixed azw3-to-pdf.ts');

// Verify
const lines = text.split('\n');
for (let i = 39; i < Math.min(lines.length, 70); i++) {
  console.log((i+1) + ': ' + JSON.stringify(lines[i]));
}