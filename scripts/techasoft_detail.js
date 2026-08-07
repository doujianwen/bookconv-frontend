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
  // Check TechAsoft submit form details more carefully
  console.log('=== TechAsoft /submit full check ===');
  const r = await get('https://www.techasoft.com/submit');
  console.log('Status:', r.status);
  
  // Look for the specific submit form with lead_url
  const formMatch = r.body.match(/<form[^>]*>[\s\S]*?<\/form>/gi) || [];
  console.log('Forms found:', formMatch.length);
  formMatch.forEach((f, i) => {
    const action = f.match(/action=[\"']([^\"']*)[\"']/i);
    const method = f.match(/method=[\"']([^\"']*)[\"']/i);
    const hasLeadUrl = f.includes('lead_url');
    console.log('Form ' + i + ': action=' + (action ? action[1] : 'none') + ' method=' + (method ? method[1] : 'GET') + ' has_lead_url=' + hasLeadUrl);
    const fields = f.match(/name=[\"']([^\"']*)[\"']/g) || [];
    console.log('  Fields: ' + fields.map(x => x.replace(/name=[\"']/, '').replace(/[\"']/, '')).join(', '));
  });
  
  // Check for hidden CSRF tokens
  const csrf = r.body.match(/name=[\"']_token[\"']|name=[\"']csrf[\"']|name=[\"']authenticity[\"']/gi) || [];
  console.log('\nCSRF tokens:', csrf.length, csrf.join(', '));
  
  // Look for the form action URL
  const actionMatches = r.body.match(/action=[\"']([^\"']*)[\"']/gi) || [];
  console.log('\nAll form actions:', actionMatches.map(a => a.replace(/action=[\"']/, '').replace(/[\"']$/, '')).join('\n  '));
}
main().catch(console.error);
