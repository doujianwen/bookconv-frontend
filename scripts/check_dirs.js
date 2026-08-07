const https = require('https');
const http = require('http');
function get(url, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const parts = url.match(/^https?:\/\/([^\/]+)(\/.*)$/);
    if (!parts) return reject(new Error('bad url'));
    const mod = url.startsWith('https:') ? https : http;
    const req = mod.get({hostname: parts[1], path: parts[2], timeout: timeout}, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}
async function main() {
  // Check more directory sites
  const tests = [
    ['DSOM', 'https://www.dsom.in/'],
    ['FutureGen', 'https://www.futuregenapps.com/'],
    ['PR.com', 'https://www.pr.com/'],
    ['EReleases', 'https://www.ereleases.com/'],
    ['LinkDr', 'https://linkdr.com/'],
  ];
  for (const [name, url] of tests) {
    try {
      const r = await get(url);
      const forms = r.body.match(/<form[^>]*>/gi) || [];
      const inputs = r.body.match(/name=[\"']([^\"']*)[\"']/g) || [];
      const uniqueInputs = [...new Set(inputs)];
      const textareas = r.body.match(/<textarea[^>]*>/gi) || [];
      const submitLinks = r.body.match(/href=[\"'][^\"']*submit[^\"']*[/\"']/gi) || [];
      console.log(name + ': ' + r.status + ' forms=' + forms.length + ' fields=' + uniqueInputs.length + ' ta=' + textareas.length + ' submit_links=' + submitLinks.length);
      if (uniqueInputs.length > 5) console.log('  Fields: ' + uniqueInputs.filter(x => !/viewport|robots|description|twitter/i.test(x)).slice(0, 10).join(', '));
    } catch(e) {
      console.log(name + ': ERROR ' + e.message);
    }
  }
}
main().catch(console.error);
