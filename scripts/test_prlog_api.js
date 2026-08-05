const https = require('https');
function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      },
      timeout: 10000
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
}
async function main() {
  // Test PRLog API endpoints
  const endpoints = [
    '/api/1/',
    '/api/1/submit',
    '/api/1/add',
    '/api/submit',
  ];
  for (const ep of endpoints) {
    try {
      const r = await postJson('https://www.prlog.org' + ep, {
        title: 'Test',
        body: 'Test press release body'
      });
      console.log('POST ' + ep + ' -> ' + r.status + ' (' + r.body.substring(0, 200) + ')');
    } catch (e) {
      console.log('POST ' + ep + ' -> ERROR: ' + e.message);
    }
  }
  
  // Also try GET on API endpoints
  console.log('\n--- GET tests ---');
  const getEndpoints = [
    '/api/1/',
    '/api/1/sites',
    '/api/1/categories',
  ];
  for (const ep of getEndpoints) {
    try {
      const r = await postJson('https://www.prlog.org' + ep, {});
      console.log('GET ' + ep + ' -> ' + r.status + ' (' + r.body.substring(0, 200) + ')');
    } catch (e) {
      console.log('GET ' + ep + ' -> ERROR: ' + e.message);
    }
  }
}
main().catch(console.error);
