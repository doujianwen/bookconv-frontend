const https = require('https');
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}, timeout: 10000}, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({status: res.statusCode, body: d, headers: res.headers}));
    }).on('error', reject);
  });
}
async function main() {
  // Check more AI tool directories
  const dirs = [
    'https://www.toolify.ai/submit',
    'https://www.futuretools.io/submit-a-tool',
    'https://www.betalist.com/submit',
    'https://saashub.com/register',
    'https://alternativeto.net/',
  ];
  for (const url of dirs) {
    try {
      const r = await get(url);
      console.log(url + ' -> ' + r.status);
      const inputs = r.body.match(/name=[\"']([^\"']*)[\"']/g) || [];
      const uniqueInputs = [...new Set(inputs)].filter(x => !/viewport|robots|description|twitter/i.test(x));
      console.log('  Fields:', uniqueInputs.slice(0, 8).join(', '));
    } catch(e) {
      console.log(url + ' -> ERROR ' + e.message);
    }
  }
}
main().catch(console.error);
