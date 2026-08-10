const fs = require('fs');
const svg = fs.readFileSync('E:/一人公司/电子书格式转换站/ebook-converter/public/logo.svg', 'utf8');
const ogSvg = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>' + String.fromCharCode(10) +
'<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1200 630\" width=\"1200\" height=\"630\">' + String.fromCharCode(10) +
'  <defs>' + String.fromCharCode(10) +
'    <linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">' + String.fromCharCode(10) +
'      <stop offset=\"0\" stop-color=\"#3b82f6\"/>' + String.fromCharCode(10) +
'      <stop offset=\"1\" stop-color=\"#1d4ed8\"/>' + String.fromCharCode(10) +
'    </linearGradient>' + String.fromCharCode(10) +
'  </defs>' + String.fromCharCode(10) +
'  <rect width=\"1200\" height=\"630\" fill=\"#ffffff\"/>' + String.fromCharCode(10) +
'  <g transform=\"translate(100, 215) scale(3.5)\">' + String.fromCharCode(10) +
'    <rect width=\"100\" height=\"100\" rx=\"22\" fill=\"url(#bg)\"/>' + String.fromCharCode(10) +
'    <path d=\"M50 36 C43 31 31 31 23 35 L23 59 C31 55 43 55 50 60 Z\" fill=\"#ffffff\"/>' + String.fromCharCode(10) +
'    <path d=\"M50 36 C57 31 69 31 77 35 L77 59 C69 55 57 55 50 60 Z\" fill=\"#dbeafe\"/>' + String.fromCharCode(10) +
'    <path d=\"M50 36 L50 60\" stroke=\"#ffffff\" stroke-width=\"2\" stroke-linecap=\"round\"/>' + String.fromCharCode(10) +
'    <line x1=\"34\" y1=\"77\" x2=\"66\" y2=\"77\" stroke=\"#38bdf8\" stroke-width=\"4\" stroke-linecap=\"round\"/>' + String.fromCharCode(10) +
'    <polygon points=\"28,77 36,73 36,81\" fill=\"#38bdf8\"/>' + String.fromCharCode(10) +
'    <polygon points=\"72,77 64,73 64,81\" fill=\"#38bdf8\"/>' + String.fromCharCode(10) +
'  </g>' + String.fromCharCode(10) +
'  <text x=\"480\" y=\"340\" font-family=\"system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif\" font-weight=\"700\" font-size=\"72\" fill=\"#0f172a\">Book<tspan fill=\"#2563eb\">Conv</tspan></text>' + String.fromCharCode(10) +
'  <text x=\"480\" y=\"400\" font-family=\"system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif\" font-size=\"28\" fill=\"#64748b\">Free online ebook converter — 28+ formats, no signup, no ads</text>' + String.fromCharCode(10) +
'</svg>';
fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/logo-1200x630.svg', ogSvg, 'utf8');
console.log('Created logo-1200x630.svg');
