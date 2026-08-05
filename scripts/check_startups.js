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
  const sites = [
    'https://startupstash.com/',
    'https://getleadwave.io/',
    'https://submitsaas.com/',
    'https://www.submitcube.com/',
    'https://adirectory.io/',
    'https://www.techasoft.com/',
    'https://saaspedia.io/',
    'https://growpad.pro/',
    'https://backlinkcrm.io/',
    'https://www.startupsauce.com/',
    'https://www.effortlessbacklinks.com/',
    'https://serpmaestro.com/',
    'https://www.dsom.in/',
    'https://www.futuregenapps.com/',
  ];
  for (const url of sites) {
    try {
      const r = await get(url);
      console.log('\n=== ' + url + ' (Status: ' + r.status + ') ===');
      const links = r.body.match(/href=[\"']([^\"']*)[\"']/gi) || [];
      const submitLinks = links.filter(l => /submit|add|list|share|contribute/i.test(l));
      console.log('Submit links:', submitLinks.slice(0, 5).join('\n  '));
      const forms = r.body.match(/<form[^>]*>/gi) || [];
      console.log('Forms:', forms.length);
      const fields = r.body.match(/name=[\"']([^\"']*)[\"']/g) || [];
      const uniqueFields = [...new Set(fields)];
      if (uniqueFields.length > 0) console.log('Fields:', uniqueFields.slice(0, 15).join(', '));
    } catch (e) {
      console.log('\n=== ' + url + ' ERROR: ' + e.message + ' ===');
    }
  }
}
main().catch(console.error);
