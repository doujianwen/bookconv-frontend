const fs = require('fs');
const svg = fs.readFileSync('E:/一人公司/电子书格式转换站/ebook-converter/public/logo.svg', 'utf8');
const largeSvg = svg.replace('viewBox=\"0 0 220 56\"', 'viewBox=\"0 0 220 56\"');
fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/logo-800x200.svg', largeSvg, 'utf8');
console.log('Created logo-800x200.svg');
const squareSvg = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>' + String.fromCharCode(10) +
'<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" width=\"800\" height=\"800\">' + String.fromCharCode(10) +
'  <defs>' + String.fromCharCode(10) +
'    <linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">' + String.fromCharCode(10) +
'      <stop offset=\"0\" stop-color=\"#3b82f6\"/>' + String.fromCharCode(10) +
'      <stop offset=\"1\" stop-color=\"#1d4ed8\"/>' + String.fromCharCode(10) +
'    </linearGradient>' + String.fromCharCode(10) +
'  </defs>' + String.fromCharCode(10) +
'  <rect width=\"100\" height=\"100\" rx=\"22\" fill=\"url(#bg)\"/>' + String.fromCharCode(10) +
'  <path d=\"M50 36 C43 31 31 31 23 35 L23 59 C31 55 43 55 50 60 Z\" fill=\"#ffffff\"/>' + String.fromCharCode(10) +
'  <path d=\"M50 36 C57 31 69 31 77 35 L77 59 C69 55 57 55 50 60 Z\" fill=\"#dbeafe\"/>' + String.fromCharCode(10) +
'  <path d=\"M50 36 L50 60\" stroke=\"#ffffff\" stroke-width=\"2\" stroke-linecap=\"round\"/>' + String.fromCharCode(10) +
'  <line x1=\"34\" y1=\"77\" x2=\"66\" y2=\"77\" stroke=\"#38bdf8\" stroke-width=\"4\" stroke-linecap=\"round\"/>' + String.fromCharCode(10) +
'  <polygon points=\"28,77 36,73 36,81\" fill=\"#38bdf8\"/>' + String.fromCharCode(10) +
'  <polygon points=\"72,77 64,73 64,81\" fill=\"#38bdf8\"/>' + String.fromCharCode(10) +
'</svg>';
fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/logo-square-800x800.svg', squareSvg, 'utf8');
console.log('Created logo-square-800x800.svg');
