const fs = require('fs');
const files = fs.readdirSync('E:/一人公司/电子书格式转换站/docs').filter(f => f.endsWith('.svg'));
console.log('SVG files in docs/:');
files.forEach(f => {
  const stat = fs.statSync('E:/一人公司/电子书格式转换站/docs/' + f);
  console.log('  ' + f + ' (' + stat.size + ' bytes)');
});
