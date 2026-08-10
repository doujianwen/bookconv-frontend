const fs = require('fs');
const svg = fs.readFileSync('E:/一人公司/电子书格式转换站/docs/logo-square-800x800.svg', 'utf8');
console.log('SVG size:', svg.length, 'bytes');
console.log('SVG preview:', svg.substring(0, 100));
