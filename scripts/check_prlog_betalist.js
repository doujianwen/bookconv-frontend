const https = require('https');
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers: {'User-Agent': 'Mozilla/5.0'}, timeout: 8000}, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({status: res.statusCode, body: d}));
    }).on('error', reject);
  });
}
async function main() {
  // Check PRLog submit page
  console.log('=== PRLog ===');
  const r = await get('https://www.prlog.org/submit-free-press-release.html');
  console.log('Status:', r.status);
  console.log('Has form:', r.body.includes('<form'));
  console.log('Has textarea:', r.body.includes('<textarea'));
  
  // Check BetaList
  console.log('\n=== BetaList ===');
  const r2 = await get('https://betalist.com/submit');
  console.log('Status:', r2.status);
  console.log('Redirects to:', r2.body.includes('sign_in') ? 'login page' : 'submit page');
}
main().catch(console.error);
