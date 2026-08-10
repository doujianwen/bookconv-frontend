const { execSync } = require('child_process');
const fs = require('fs');

// Read the original SVG
const svgContent = fs.readFileSync('E:/一人公司/电子书格式转换站/ebook-converter/public/logo.svg', 'utf8');

// Create a larger version (800x200 to maintain aspect ratio)
const largeSvg = svgContent
  .replace('viewBox=\"0 0 220 56\"', 'viewBox=\"0 0 220 56\"')
  .replace('role=\"img\"', 'role=\"img\" width=\"800\" height=\"200\"');

fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/logo-800x200.svg', largeSvg, 'utf8');
console.log('Created logo-800x200.svg');

// Also create a square version (800x800) for favicon/social media
const squareSvg = svgContent
  .replace('viewBox=\"0 0 220 56\"', 'viewBox=\"0 0 220 220\"')
  .replace('<text x=\"66\" y=\"37\"', '<text x=\"110\" y=\"180\" text-anchor=\"middle\"')
  .replace('font-size=\"27\"', 'font-size=\"35\"');

fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/logo-square.svg', squareSvg, 'utf8');
console.log('Created logo-square.svg');

// Create a 1200x630 version for social media (Open Graph)
const ogSvg = <?xml version=\"1.0\" encoding=\"UTF-8\"?>
<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1200 630\" width=\"1200\" height=\"630\">
  <defs>
    <linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">
      <stop offset=\"0\" stop-color=\"#3b82f6\"/>
      <stop offset=\"1\" stop-color=\"#1d4ed8\"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width=\"1200\" height=\"630\" fill=\"#ffffff\"/>
  
  <!-- Logo icon (left side) -->
  <g transform=\"translate(100, 215) scale(3.5)\">
    <rect width=\"100\" height=\"100\" rx=\"22\" fill=\"url(#bg)\"/>
    <path d=\"M50 36 C43 31 31 31 23 35 L23 59 C31 55 43 55 50 60 Z\" fill=\"#ffffff\"/>
    <path d=\"M50 36 C57 31 69 31 77 35 L77 59 C69 55 57 55 50 60 Z\" fill=\"#dbeafe\"/>
    <path d=\"M50 36 L50 60\" stroke=\"#ffffff\" stroke-width=\"2\" stroke-linecap=\"round\"/>
    <line x1=\"34\" y1=\"77\" x2=\"66\" y2=\"77\" stroke=\"#38bdf8\" stroke-width=\"4\" stroke-linecap=\"round\"/>
    <polygon points=\"28,77 36,73 36,81\" fill=\"#38bdf8\"/>
    <polygon points=\"72,77 64,73 64,81\" fill=\"#38bdf8\"/>
  </g>
  
  <!-- Logo text -->
  <text x=\"480\" y=\"340\" font-family=\"system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif\" font-weight=\"700\" font-size=\"72\" fill=\"#0f172a\">Book<tspan fill=\"#2563eb\">Conv</tspan></text>
  
  <!-- Tagline -->
  <text x=\"480\" y=\"400\" font-family=\"system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif\" font-size=\"28\" fill=\"#64748b\">Free online ebook converter — 28+ formats, no signup, no ads</text>
</svg>;

fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/logo-og.png', '', 'utf8'); // placeholder
fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/logo-1200x630.svg', ogSvg, 'utf8');
console.log('Created logo-1200x630.svg (Open Graph)');

console.log('\nCreated files:');
console.log('- logo-800x200.svg');
console.log('- logo-square.svg');
console.log('- logo-1200x630.svg');
