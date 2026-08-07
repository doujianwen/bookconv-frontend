const https = require('https');
const http = require('http');
function get(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const parts = url.match(/^https?:\/\/([^\/]+)(\/.*)$/);
    if (!parts) return reject(new Error('bad url'));
    const mod = url.startsWith('https:') ? https : http;
    const req = mod.get({hostname: parts[1], path: parts[2], timeout}, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({status: res.statusCode, body: d, headers: res.headers}));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}
async function main() {
  // Try Brave API with SerpAPI key for more directory info
  const serpKey = process.env.SERPAPI_KEY;
  
  // Try to search for ebook converter directories
  console.log('=== Searching for ebook converter directories ===');
  try {
    const r = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'serpapi.com',
        path: '/search.json?engine=google&q=best+ebook+converter+directories+submit&api_key=' + serpKey + '&num=10',
        method: 'GET',
        headers: {'User-Agent': 'Mozilla/5.0'},
        timeout: 15000
      }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve({status: res.statusCode, body: d}));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      req.end();
    });
    console.log('SerpAPI status:', r.status);
    if (r.status === 200) {
      const data = JSON.parse(r.body);
      if (data.organic_results) {
        console.log('\nSearch results:');
        data.organic_results.slice(0, 10).forEach((r, i) => {
          console.log((i+1) + '. ' + r.title);
          console.log('   ' + r.link);
        });
      } else {
        console.log('Response:', r.body.substring(0, 500));
      }
    } else {
      console.log('Error:', r.body.substring(0, 300));
    }
  } catch(e) {
    console.log('SerpAPI error:', e.message);
  }
}
main().catch(console.error);
