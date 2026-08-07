const https = require('https');
function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        ...headers
      },
      timeout: 15000
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({status: res.statusCode, body: d, headers: res.headers}));
    }).on('error', reject);
  });
}
async function main() {
  // Try Brave API
  const braveKey = process.env.BRAVE_API_KEY;
  
  console.log('=== Brave API: ebook converter directories ===');
  try {
    const r = await get('https://api.search.brave.com/res/v1/web/search?q=best+ebook+converter+submit+directory&count=10', {
      'X-Subscription-Token': braveKey
    });
    console.log('Brave status:', r.status);
    console.log('Response:', r.body.substring(0, 1000));
  } catch(e) {
    console.log('Brave error:', e.message);
  }
  
  // Try Google cache
  console.log('\n=== Checking known directories via HTTP ===');
  const dirs = [
    'https://www.betalist.com/',
    'https://saashub.com/',
    'https://www.toolify.ai/',
    'https://www.futuretools.io/',
    'https://www.softwaredirectory.org/',
  ];
  for (const url of dirs) {
    try {
      const r = await get(url);
      const isChallenge = r.body.includes('Just a moment') || r.body.includes('Checking');
      const hasSubmit = r.body.toLowerCase().includes('submit') || r.body.toLowerCase().includes('/add');
      console.log(url.substring(8, 45) + ' -> ' + r.status + ' challenge=' + isChallenge + ' submit=' + hasSubmit);
    } catch(e) {
      console.log(url.substring(8, 45) + ' -> ERROR');
    }
  }
}
main().catch(console.error);
