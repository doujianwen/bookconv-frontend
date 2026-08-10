const fs = require('fs');
const { execSync } = require('child_process');

// Try to convert using ImageMagick if available
try {
  const result = execSync('magick -version', { encoding: 'utf8', timeout: 5000 });
  console.log('ImageMagick available');
  
  // Convert SVG to PNG
  execSync('magick E:/一人公司/电子书格式转换站/docs/logo-square-800x800.svg[0] -resize 800x800 E:/一人公司/电子书格式转换站/docs/logo-beta-list.png', { encoding: 'utf8' });
  console.log('Created logo-beta-list.png');
  
  execSync('magick E:/一人公司/电子书格式转换站/docs/logo-square-800x800.svg[0] -resize 400x400 E:/一人公司/电子书格式转换站/docs/logo-beta-list-400.png', { encoding: 'utf8' });
  console.log('Created logo-beta-list-400.png');
} catch(e) {
  console.log('ImageMagick not available');
  console.log('Trying alternative method...');
  
  // Use Node.js to create a minimal PNG
  const svg = fs.readFileSync('E:/一人公司/电子书格式转换站/docs/logo-square-800x800.svg', 'utf8');
  console.log('SVG size:', svg.length, 'bytes');
}
