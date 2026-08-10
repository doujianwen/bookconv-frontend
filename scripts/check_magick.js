const { execSync } = require('child_process');
const fs = require('fs');

// Check if ImageMagick is available
try {
  execSync('magick -version', { encoding: 'utf8', timeout: 3000 });
  console.log('ImageMagick available');
  
  // Convert SVG to PNG
  execSync('magick E:/一人公司/电子书格式转换站/docs/logo-square-800x800.svg[0] -resize 800x800 E:/一人公司/电子书格式转换站/docs/logo-beta-list.png', { encoding: 'utf8' });
  console.log('Created logo-beta-list.png');
  
  execSync('magick E:/一人公司/电子书格式转换站/docs/logo-square-800x800.svg[0] -resize 400x400 E:/一人公司/电子书格式转换站/docs/logo-beta-list-400.png', { encoding: 'utf8' });
  console.log('Created logo-beta-list-400.png');
} catch(e) {
  console.log('ImageMagick not available');
  // Try convert
  try {
    execSync('convert -version', { encoding: 'utf8', timeout: 3000 });
    console.log('ImageMagick (convert) available');
    execSync('convert E:/一人公司/电子书格式转换站/docs/logo-square-800x800.svg[0] -resize 800x800 E:/一人公司/电子书格式转换站/docs/logo-beta-list.png', { encoding: 'utf8' });
    console.log('Created logo-beta-list.png');
  } catch(e2) {
    console.log('ImageMagick not available');
    // Try node-canvas
    try {
      const { createCanvas } = require('canvas');
      console.log('canvas available');
    } catch(e3) {
      console.log('No image conversion available');
    }
  }
}
