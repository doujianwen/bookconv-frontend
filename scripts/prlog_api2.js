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
  const apis = ['/api/1/', '/api/1/submit', '/api/1/add', '/api/'];
  for (const api of apis) {
    try {
      const r = await get('https://www.prlog.org' + api);
      console.log(api + ' -> ' + r.status + ' Location: ' + (r.headers.location || 'none'));
    } catch(e) {
      console.log(api + ' -> ERROR: ' + e.message);
    }
  }
  
  try {
    const r = await get('https://www.prlog.org/register.html');
    console.log('\nregister.html -> ' + r.status);
    console.log('Body length:', r.body.length);
    console.log('Has form:', r.body.includes('<form'));
  } catch(e) {
    console.log('register.html -> ERROR: ' + e.message);
  }
  
  try {
    const r = await get('https://www.prlog.org/submit-free-press-release.html');
    console.log('\nsubmit page -> ' + r.status);
    console.log('Body length:', r.body.length);
    console.log('Has form:', r.body.includes('<form'));
    console.log('Has textarea:', r.body.includes('<textarea'));
    console.log('Has input name=title:', r.body.includes('name="title"'));
  } catch(e) {
    console.log('submit page -> ERROR: ' + e.message);
  }
}
main().catch(console.error);
