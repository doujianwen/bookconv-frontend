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
  // Check what StartupStash returns with proper headers
  console.log('=== StartupStash with proper headers ===');
  const r = await get('https://startupstash.com/', 15000);
  console.log('Status:', r.status);
  console.log('Headers:', JSON.stringify(r.headers, null, 2));
  console.log('Body length:', r.body.length);
  console.log('Body preview:', r.body.substring(0, 500));
}
main().catch(console.error);
