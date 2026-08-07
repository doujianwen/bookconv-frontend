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
  // Check Google cache for StartupStash
  console.log('=== Google Cache: StartupStash ===');
  try {
    const r = await get('https://webcache.googleusercontent.com/search?q=cache:startupstash.com/submit');
    console.log('Status:', r.status);
    console.log('Has submit:', r.body.includes('submit') || r.body.includes('Submit'));
    console.log('Body length:', r.body.length);
  } catch(e) { console.log('Error:', e.message); }
  
  // Check archive.org for StartupStash
  console.log('\n=== Wayback Machine: StartupStash ===');
  try {
    const r = await get('https://web.archive.org/web/2024*/https://startupstash.com/');
    console.log('Status:', r.status);
    console.log('Has submit:', r.body.includes('submit'));
  } catch(e) { console.log('Error:', e.message); }
}
main().catch(console.error);
