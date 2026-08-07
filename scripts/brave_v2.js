const https = require('https');
function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      headers: {'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'},
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
  const braveKey = process.env.BRAVE_API_KEY;
  
  // Try Brave API with simple query
  console.log('Brave API: best saas directories to submit');
  try {
    const r = await get('https://api.search.brave.com/res/v1/web/search?q=best+saas+directories+to+submit+2024&count=5', {
      'X-Subscription-Token': braveKey,
      'Accept': 'application/json'
    });
    console.log('Status:', r.status);
    console.log(r.body.substring(0, 600));
  } catch(e) { console.log('Error:', e.message); }
  
  // Try Brave API for ebook converter
  console.log('\nBrave API: ebook converter directories');
  try {
    const r = await get('https://api.search.brave.com/res/v1/web/search?q=submit+ebook+converter+directory&count=5', {
      'X-Subscription-Token': braveKey,
      'Accept': 'application/json'
    });
    console.log('Status:', r.status);
    console.log(r.body.substring(0, 600));
  } catch(e) { console.log('Error:', e.message); }
}
main().catch(console.error);
