const fs = require('fs');
const data = {
  betalist: {
    name: 'FreeBookConvert',
    tagline: 'Free online ebook format converter — 28+ formats, no signup, no ads',
    description: 'FreeBookConvert is a free online ebook format converter that supports 28+ formats including EPUB, PDF, MOBI, AZW3, TXT, HTML, and more. Built with the powerful Calibre engine, it delivers fast, accurate conversions with no file size limits, no signup required, and zero ads. Perfect for readers, authors, and publishers who need reliable format conversion anytime, anywhere—straight from your browser.',
    category: 'Books & Literature',
    url: 'https://yourdomain.com',
    twitter: '@freebookconvert',
    logo: 'E:/一人公司/电子书格式转换站/docs/logo-beta-list.png'
  }
};
fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/submissions/betalist_content.json', JSON.stringify(data, null, 2), 'utf8');
console.log('BetaList content saved with logo path.');
console.log('\n=== BetaList Submission Content ===');
console.log('Name:', data.betalist.name);
console.log('Tagline:', data.betalist.tagline, '(' + data.betalist.tagline.length + ' chars)');
console.log('Description:', data.betalist.description, '(' + data.betalist.description.length + ' chars)');
console.log('Category:', data.betalist.category);
console.log('URL:', data.betalist.url);
console.log('Logo:', data.betalist.logo);
console.log('Logo file exists:', fs.existsSync(data.betalist.logo));
console.log('Logo size:', fs.statSync(data.betalist.logo).size, 'bytes');
