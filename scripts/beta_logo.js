const fs = require('fs');
const sharp = require('sharp');

async function main() {
  await sharp('E:/一人公司/电子书格式转换站/docs/logo-square-800x800.svg')
    .png()
    .toFile('E:/一人公司/电子书格式转换站/docs/logo-beta-list.png');
  console.log('Created logo-beta-list.png (800x800)');
  
  await sharp('E:/一人公司/电子书格式转换站/docs/logo-square-800x800.svg')
    .resize(400, 400)
    .png()
    .toFile('E:/一人公司/电子书格式转换站/docs/logo-beta-list-400.png');
  console.log('Created logo-beta-list-400.png (400x400)');
}
main().catch(console.error);
