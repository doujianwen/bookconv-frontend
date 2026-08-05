const https = require('https');
function get(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https:') ? https : require('http');
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}
async function main() {
  console.log('=== PRLog Submit Page ===');
  const prlog = await get('https://www.prlog.org/submit-free-press-release.html');
  console.log('Status:', prlog.status);
  const forms = prlog.body.match(/<form[^>]*>/gi) || [];
  console.log('Forms found:', forms.length);
  forms.forEach((f, i) => { console.log('\nForm ' + i + ':', f.substring(0, 400)); });
  const allFields = prlog.body.match(/name=[\"']([^\"']*)[\"']/g) || [];
  console.log('\nAll field names:', [...new Set(allFields)].join('\n'));
  const textareas = prlog.body.match(/<textarea[^>]*>/gi) || [];
  console.log('\nTextareas:', textareas.length, textareas.join('\n'));
  const selects = prlog.body.match(/<select[^>]*>[\s\S]*?<\/select>/gi) || [];
  console.log('\nSelects:', selects.length);
  selects.forEach((s, i) => console.log('Select ' + i + ':', s.substring(0, 200)));
  const options = prlog.body.match(/<option[^>]*>/gi) || [];
  console.log('\nOptions:', options.length, options.slice(0, 20).join('\n'));
}
main().catch(console.error);
