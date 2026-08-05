const https = require('https');
const http = require('http');
function get(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.get({hostname: u.hostname, path: u.pathname + u.search, timeout}, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers, url: url }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}
async function main() {
  // Follow PRLog API redirects
  const apis = ['/api/1/', '/api/1/submit', '/api/1/add'];
  for (const api of apis) {
    const r = await get('https://www.prlog.org' + api);
    console.log(api + ' -> ' + r.status + ' Location: ' + r.headers.location);
    if (r.headers.location) {
      const r2 = await get('https://www.prlog.org' + r.headers.location);
      console.log('  -> ' + r2.status + ' Location: ' + r2.headers.location);
    }
  }
  
  // Try the main submit page with POST
  console.log('\n--- PRLog submit page POST test ---');
  const r = await get('https://www.prlog.org/submit-free-press-release.html');
  console.log('GET status:', r.status);
  
  // Check if there is a separate API endpoint for submission
  const r2 = await get('https://www.prlog.org/api/');
  console.log('GET /api/ -> ' + r2.status + ' Location: ' + r2.headers.location);
  
  // Try PRLog registration/login to see the actual submit form
  const r3 = await get('https://www.prlog.org/register.html');
  console.log('GET /register.html -> ' + r3.status);
  
  const r4 = await get('https://www.prlog.org/login.html');
  console.log('GET /login.html -> ' + r4.status);
}
main().catch(console.error);
