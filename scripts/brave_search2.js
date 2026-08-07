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
      timeout: 10000
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({status: res.statusCode, body: d}));
    }).on('error', reject);
  });
}
async function main() {
  const braveKey = process.env.BRAVE_API_KEY;
  console.log('Brave API: ebook converter directories');
  try {
    const r = await get('https://api.search.brave.com/res/v1/web/search?q=best+ebook+converter+submit+directory&count=10', {
      'X-Subscription-Token': braveKey
    });
    console.log('Status:', r.status);
    console.log(r.body.substring(0, 800));
  } catch(e) { console.log('Error:', e.message); }
}
main().catch(console.error);
