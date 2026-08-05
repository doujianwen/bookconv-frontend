const https = require('https');
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: {'User-Agent': 'Mozilla/5.0'} }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({s: res.statusCode, b: d}));
    }).on('error', reject);
  });
}
async function main() {
  // PRLog submit form
  const r1 = await get('https://www.prlog.org/submit/');
  console.log('PRLog /submit/:', r1.s);
  const forms1 = r1.b.match(/<form[^>]*>/gi) || [];
  console.log('Forms:', forms1.length);
  forms1.forEach(f => console.log(f.substring(0, 300)));
  const inputs1 = r1.b.match(/name=["']([^"']*)["']/g) || [];
  console.log('Fields:', [...new Set(inputs1)].slice(0,15).join(', '));
  
  console.log('\n---\n');
  
  // PR.com submit
  const r2 = await get('https://www.pr.com/submit.aspx');
  console.log('PR.com /submit.aspx:', r2.s);
  const forms2 = r2.b.match(/<form[^>]*>/gi) || [];
  console.log('Forms:', forms2.length);
  const inputs2 = r2.b.match(/name=["']([^"']*)["']/g) || [];
  console.log('Fields:', [...new Set(inputs2)].slice(0,15).join(', '));
}
main().catch(console.error);
