const https = require('https');
function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      headers: {'User-Agent': 'Mozilla/5.0', 'Accept': '*/*'},
      timeout: 8000
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({status: res.statusCode, body: d}));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}
async function main() {
  // Quick check of directories
  const dirs = [
    'https://betalist.com/',
    'https://saashub.com/',
    'https://www.toolify.ai/',
    'https://www.futuretools.io/',
    'https://www.softwaredirectory.org/',
    'https://www.activesearchresults.com/',
  ];
  for (const url of dirs) {
    try {
      const r = await get(url);
      const isChallenge = r.body.includes('Just a moment') || r.body.includes('Checking');
      const hasSubmit = r.body.toLowerCase().includes('submit') || r.body.toLowerCase().includes('/add');
      console.log(url.substring(8, 40) + ' -> ' + r.status + ' challenge=' + isChallenge + ' submit=' + hasSubmit);
    } catch(e) {
      console.log(url.substring(8, 40) + ' -> ERROR');
    }
  }
}
main().catch(console.error);
