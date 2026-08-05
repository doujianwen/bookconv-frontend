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
  const tests = [
    ['PRLog home', 'https://www.prlog.org/'],
    ['PR.com home', 'https://www.pr.com/'],
    ['StartupStash', 'https://startupstash.com/'],
    ['GetLeadWave', 'https://getleadwave.io/'],
    ['SubmitSaaS', 'https://submitsaas.com/'],
  ];
  for (const [name, url] of tests) {
    const r = await get(url);
    const submitLinks = r.b.match(/href=["']([^"']*submit[^"']*)["']/gi) || [];
    const writeLinks = r.b.match(/href=["']([^"']*write[^"']*)["']/gi) || [];
    const forms = r.b.includes('<form');
    console.log(name + ': ' + r.s + ' forms=' + forms + ' submit_links=' + submitLinks.length + ' write_links=' + writeLinks.length);
    if (submitLinks.length > 0) submitLinks.slice(0,3).forEach(l => console.log('  submit: ' + l));
    if (writeLinks.length > 0) writeLinks.slice(0,2).forEach(l => console.log('  write: ' + l));
  }
}
main().catch(console.error);
