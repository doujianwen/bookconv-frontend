const https = require('https');
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}, timeout: 10000}, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({status: res.statusCode, body: d, headers: res.headers}));
    }).on('error', reject);
  });
}
async function main() {
  // BetaList
  console.log('=== BetaList ===');
  const r1 = await get('https://betalist.com/');
  console.log('Status:', r1.status);
  const links1 = r1.body.match(/href=[\"']([^\"']*)[\"']/gi) || [];
  const sub1 = links1.filter(l => /submit|add|list|sign/i.test(l));
  console.log('Submit links:', sub1.slice(0, 5).join('\n  '));
  
  // Toolify
  console.log('\n=== Toolify ===');
  const r2 = await get('https://www.toolify.ai/');
  console.log('Status:', r2.status);
  const links2 = r2.body.match(/href=[\"']([^\"']*)[\"']/gi) || [];
  const sub2 = links2.filter(l => /submit|add|list|contribute/i.test(l));
  console.log('Submit links:', sub2.slice(0, 5).join('\n  '));
  
  // FutureTools
  console.log('\n=== FutureTools ===');
  const r3 = await get('https://www.futuretools.io/');
  console.log('Status:', r3.status);
  const links3 = r3.body.match(/href=[\"']([^\"']*)[\"']/gi) || [];
  const sub3 = links3.filter(l => /submit|add|list|contribute/i.test(l));
  console.log('Submit links:', sub3.slice(0, 5).join('\n  '));
  
  // Check BetaList submit page
  console.log('\n=== BetaList /submit ===');
  try {
    const r4 = await get('https://betalist.com/submit');
    console.log('Status:', r4.status);
    const inputs4 = r4.body.match(/name=[\"']([^\"']*)[\"']/g) || [];
    console.log('Fields:', [...new Set(inputs4)].slice(0, 10).join(', '));
  } catch(e) { console.log('Error:', e.message); }
}
main().catch(console.error);
