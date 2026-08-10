const fs = require('fs');
const data = {
  betaList: {
    name: 'FreeBookConvert',
    tagline: 'Free online ebook format converter — 28+ formats, no signup, no ads',
    description: 'FreeBookConvert is a free online ebook format converter that supports 28+ formats including EPUB, PDF, MOBI, AZW3, TXT, HTML, and more. Built with the powerful Calibre engine, it delivers fast, accurate conversions with no file size limits, no signup required, and zero ads. Perfect for readers, authors, and publishers who need reliable format conversion anytime, anywhere—straight from your browser.',
    category: 'Books & Literature',
    url: 'https://yourdomain.com',
    twitter: '@freebookconvert'
  }
};
fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/submissions/betalist_content.json', JSON.stringify(data, null, 2), 'utf8');
console.log('BetaList content saved.');
console.log('\n=== BetaList Submission Content ===');
console.log('Name:', data.betaList.name);
console.log('Tagline:', data.betaList.tagline);
console.log('Tagline length:', data.betaList.tagline.length, 'chars');
console.log('Description:', data.betaList.description);
console.log('Description length:', data.betaList.description.length, 'chars');
console.log('Category:', data.betaList.category);
console.log('URL:', data.betaList.url);
