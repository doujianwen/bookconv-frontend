const fs = require('fs');
const { execSync } = require('child_process');

// Try to install sharp locally
console.log('Checking for sharp...');
try {
  require('sharp');
  console.log('sharp is available');
} catch(e) {
  console.log('sharp not available, trying to install...');
  try {
    execSync('npm install sharp --save', { cwd: 'E:/一人公司/电子书格式转换站', encoding: 'utf8', timeout: 60000 });
    console.log('sharp installed');
  } catch(e2) {
    console.log('Failed to install sharp:', e2.message.substring(0, 100));
  }
}
