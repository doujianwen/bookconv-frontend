const https = require('https');
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: {'User-Agent': 'Mozilla/5.0'} }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    }).on('error', reject);
  });
}
async function main() {
  // Check main PRLog page for submit links
  const r = await get('https://www.prlog.org/');
  const body = r.body;
  
  // Find all links related to submit/submit
  const links = body.match(/href=[\"']([^\"']*)[\"']/gi) || [];
  const relevant = links.filter(l => /submit|press.release|add|release/i.test(l));
  console.log('Submit/release links on homepage:');
  relevant.forEach(l => console.log('  ' + l));
  
  // Look for the actual submission form URL
  const submitForms = body.match(/<a[^>]*href=[\"']([^\"']*)[\"'][^>]*>/gi) || [];
  console.log('\nAll links with submit/add/release:');
  submitForms.filter(l => /submit|add|release|press/i.test(l)).slice(0, 10).forEach(l => console.log('  ' + l.substring(0, 150)));
  
  // Check if there's a login/register requirement
  console.log('\nHas login link:', body.includes('login'));
  console.log('Has register link:', body.includes('register'));
  console.log('Has member area:', body.includes('member'));
  
  // Look for the actual submit page content  
  const r2 = await get('https://www.prlog.org/submit-free-press-release.html');
  console.log('\nSubmit page status:', r2.status);
  console.log('Submit page length:', r2.body.length);
  
  // Search for hidden content or script-based navigation
  const scripts = r2.body.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
  console.log('\nInline scripts:', scripts.length);
  scripts.forEach((s, i) => {
    const code = s.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
    if (code.length > 10) console.log('Script ' + i + ':', code.substring(0, 300));
  });
}
main().catch(console.error);
