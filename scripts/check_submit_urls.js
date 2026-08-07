const https = require('https');
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'} }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers }));
    }).on('error', reject);
  });
}
async function main() {
  // Check common submit page URLs
  const tests = [
    ['StartupStash', 'https://startupstash.com/submit'],
    ['StartupStash2', 'https://startupstash.com/add'],
    ['StartupStash3', 'https://startupstash.com/list-your-startup'],
    ['GetLeadWave', 'https://getleadwave.io/submit'],
    ['GetLeadWave2', 'https://getleadwave.io/add'],
    ['SubmitSaaS', 'https://submitsaas.com/submit'],
    ['SubmitCube', 'https://www.submitcube.com/submit'],
    ['SaaSPedia', 'https://saaspedia.io/submit'],
    ['SaaSPedia2', 'https://saaspedia.io/add'],
    ['BacklinkCRM', 'https://backlinkcrm.io/submit'],
    ['BacklinkCRM2', 'https://backlinkcrm.io/add'],
    ['TechAsoft', 'https://www.techasoft.com/submit'],
    ['TechAsoft2', 'https://www.techasoft.com/add-listing'],
  ];
  for (const [name, url] of tests) {
    try {
      const r = await get(url);
      const hasForm = r.body.includes('<form');
      const hasTextarea = r.body.includes('<textarea');
      console.log(name + ': ' + r.status + ' form=' + hasForm + ' textarea=' + hasTextarea);
    } catch(e) {
      console.log(name + ': ERROR ' + e.message);
    }
  }
}
main().catch(console.error);
