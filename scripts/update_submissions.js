const fs = require('fs');
const submissions = [
  {
    name: 'ActiveSearch',
    url: 'https://www.activesearchresults.com/addwebsite.php',
    method: 'POST',
    fields: ['url', 'email'],
    status: 'SUCCESS',
    confirmation: 'https://www.activesearchresults.com/urladdedconfirm.php',
    notes: 'HTTP POST, no login, no verification'
  },
  {
    name: 'FutureTools',
    url: 'https://www.futuretools.io/submit-a-tool',
    method: 'Playwright automation',
    fields: ['submitter_name', 'tool_name', 'tool_url', 'description', 'category', 'pricing_tier', 'submitter_email'],
    status: 'SUCCESS',
    confirmation: 'Page shows success',
    notes: 'AI tool directory, no login required'
  }
];
fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/submissions/actual_submissions.json', JSON.stringify(submissions, null, 2), 'utf8');
console.log('Submissions updated.');
