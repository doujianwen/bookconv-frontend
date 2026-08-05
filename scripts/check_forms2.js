const https = require('https');
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: {'User-Agent': 'Mozilla/5.0'}, followRedirects: true }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({s: res.statusCode, b: d, finalUrl: res.request.res.responseUrl || url}));
    }).on('error', reject);
  });
}
async function main() {
  const tests = [
    ['PRLog submit', 'https://www.prlog.org/submit.aspx'],
    ['PRLog write', 'https://www.prlog.org/write.asp'],
    ['PR.com write', 'https://www.pr.com/write-press-release.html'],
    ['PR.com submit', 'https://www.pr.com/submit-press-release.html'],
    ['PRLog free', 'https://www.prlog.org/free.html'],
  ];
  for (const [name, url] of tests) {
    const r = await get(url);
    const forms = r.b.match(/<form[^>]*>/gi) || [];
    const inputs = r.b.match(/name=["']([^"']*)["']/g) || [];
    const uniqueInputs = [...new Set(inputs.map(i => i.replace(/name=["']([^"']*)["']/, '$1')))].filter(x => x && x !== 'viewport' && x !== 'robots');
    console.log(`${name}: ${r.s} (redirected to ${r.finalUrl.substring(0,60)})`);
    console.log(`  Forms: ${forms.length}, Fields: ${uniqueInputs.slice(0,10).join(', ')}`);
  }
}
main().catch(console.error);
