const fs = require('fs');
const path = 'E:/一人公司/电子书格式转换站/docs/submissions/final_report_v3.md';
const report = fs.readFileSync(path, 'utf8');
console.log(report);
