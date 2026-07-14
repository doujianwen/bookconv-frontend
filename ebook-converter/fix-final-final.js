const fs = require('fs');
const dir = 'src/data/content';

// Fix azw3-to-epub.ts - add commas between FAQ items
let azw3 = fs.readFileSync(dir + '/azw3-to-epub.ts', 'utf8');
azw3 = azw3.replace(
  /\}\s*\n(\s*\{ q:)/g,
  '},\n$1'
);
fs.writeFileSync(dir + '/azw3-to-epub.ts', azw3);
console.log('Fixed azw3-to-epub.ts');

// Fix txt-to-epub.ts - remove double backtick on L33, remove stray backtick on L65
let txt = fs.readFileSync(dir + '/txt-to-epub.ts', 'utf8');
txt = txt.replace(/body: \x60 \x60TXT/, 'body: `TXT');
txt = txt.replace(/\}\;\r?\n\}\;\r?\n\x60\r?\n$/, '};\n');
fs.writeFileSync(dir + '/txt-to-epub.ts', txt);
console.log('Fixed txt-to-epub.ts');

// Fix pricing/page.tsx - remove extra }
let pricing = fs.readFileSync('src/app/pricing/page.tsx', 'utf8');
pricing = pricing.replace(/export const metadata: Metadata = \{[\s\S]*?\n\},\n\}\r?\n\r?\n/, 'export const metadata: Metadata = {\n  title: "Pricing — Free & Pro Plans | BookConv",\n  description: "Start converting ebooks for free. Upgrade to Pro for batch conversion, larger files, and priority processing. No hidden fees. Plans from $0–$5/month.",\n  alternates: { canonical: "https://bookconv.com/pricing" },\n  openGraph: {\n    title: "Pricing — Free & Pro Plans | BookConv",\n    description: "Start converting ebooks for free. Upgrade to Pro for batch conversion, larger files, and priority processing.",\n    url: "https://bookconv.com/pricing",\n    type: "website",\n  },\n  twitter: {\n    card: "summary_large_image",\n    title: "Pricing — Free & Pro Plans | BookConv",\n    description: "Start converting ebooks for free. Upgrade to Pro for batch conversion.",\n  },\n};\n\n');
fs.writeFileSync('src/app/pricing/page.tsx', pricing);
console.log('Fixed pricing/page.tsx');

console.log('Done!');