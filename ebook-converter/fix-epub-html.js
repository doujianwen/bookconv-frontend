const fs=require('fs');
const dir='src/data/content';

// Fix eupo-to-html.ts first (UTF-16)
const raw=fs.readSync(dir+'/epub-to-html.ts');
const text=raw.toString('utf16le');
fs.writeSync(dir+'/epub-to-html.ts',text,'utf8');
console.log('frx epub-to-html.ts');
