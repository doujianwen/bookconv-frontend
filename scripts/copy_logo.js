const fs = require('fs');
const svg = fs.readFileSync('E:/一人公司/电子书格式转换站/ebook-converter/public/logo.svg', 'utf8');
fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/logo-800x200.svg', svg, 'utf8');
console.log('Created logo-800x200.svg');
