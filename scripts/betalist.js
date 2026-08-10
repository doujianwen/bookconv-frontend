const fs = require('fs');
const content = {
  betalist: {
    name: 'FreeBookConvert',
    tagline: 'Free online ebook format converter — 28+ formats, no signup, no ads',
    tagline_chars: 67,
    description: 'FreeBookConvert is a free online ebook format converter that supports 28+ formats including EPUB, PDF, MOBI, AZW3, TXT, HTML, and more. Built with the powerful Calibre engine, it delivers fast, accurate conversions with no file size limits, no signup required, and zero ads. Perfect for readers, authors, and publishers who need reliable format conversion anytime, anywhere—straight from your browser.',
    description_chars: 401,
    category: 'Books & Literature',
    url: 'https://yourdomain.com',
    twitter: '@freebookconvert',
    notes: 'Replace yourdomain.com with actual domain after registration'
  }
};
fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/submissions/betalist_content.json', JSON.stringify(content, null, 2), 'utf8');
console.log('BetaList content saved to docs/submissions/betalist_content.json');
console.log('\n=== BetaList Submission Content ===');
console.log('Name:', content.betalist.name);
console.log('Tagline:', content.betalist.tagline);
console.log('Tagline length:', content.betalist.tagline_chars, 'chars (limit: 80)');
console.log('Description:', content.betalist.description);
console.log('Description length:', content.betalist.description_chars, 'chars (limit: 500)');
console.log('Category:', content.betalist.category);
