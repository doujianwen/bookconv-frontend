const https = require('https');
function fetch(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    https.get({hostname: u.hostname, path: u.pathname + u.search, headers: {'User-Agent': 'Mozilla/5.0'}}, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve({s: r.statusCode, b: d.substring(0, 8000)}));
    }).on('error', reject);
  });
}
async function main() {
  const sites = [
    'https://startupstash.com',
    'https://www.prlog.org',
    'https://getleadwave.io',
    'https://submitsaas.com',
    'https://linkdr.com',
    'https://www.submitcube.com',
    'https://adirectory.io',
    'https://www.effortlessbacklinks.com',
    'https://serpmaestro.com',
    'https://www.techasoft.com',
    'https://www.dsom.in',
    'https://www.futuregenapps.com',
    'https://saaspedia.io',
    'https://growpad.pro',
    'https://backlinkcrm.io',
    'https://www.startupsauce.com',
    'https://www.vefogix.com',
    'https://www.pr.com',
    'https://www.ereleases.com',
  ];
  for (const s of sites) {
    const r = await fetch(s);
    const hasForm = r.b.includes('<form');
    const submitLinks = r.b.match(/href=["'][^"']*submit[^"']*["']/gi) || [];
    console.log(`\n${s} -> ${r.s} | form=${hasForm} | submit_links=${submitLinks.length}`);
    if (submitLinks.length > 0) submitLinks.slice(0,3).forEach(l => console.log('  ' + l));
  }
}
main().catch(console.error);
