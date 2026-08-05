const https = require('https');
const http = require('http');
const fs = require('fs');
const { URL } = require('url');

const outDir = 'E:/一人公司/电子书格式转换站/docs/submissions';
fs.mkdirSync(outDir, { recursive: true });

const DOMAIN = 'https://yourdomain.com';
const TITLE = 'EbookConverter - Free Online Ebook Format Converter';
const DESC = 'A free online ebook converter supporting 28+ formats. No signup, no limits, no ads. Built with Calibre engine.';

function get(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.get({hostname: u.hostname, path: u.pathname + u.search, timeout}, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({status: res.statusCode, body: d, headers: res.headers}));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function main() {
  const results = [];
  
  // Test each site
  const sites = [
    {name: 'StartupStash', url: 'https://startupstash.com/'},
    {name: 'PRLog', url: 'https://www.prlog.org/'},
    {name: 'GetLeadWave', url: 'https://getleadwave.io/'},
    {name: 'SubmitSaaS', url: 'https://submitsaas.com/'},
    {name: 'LinkDr', url: 'https://linkdr.com/'},
    {name: 'PR.com', url: 'https://www.pr.com/'},
    {name: 'EReleases', url: 'https://www.ereleases.com/'},
  ];
  
  for (const site of sites) {
    try {
      const r = await get(site.url);
      const hasForm = r.body.includes('<form');
      const submitLinks = r.body.match(/href=["']([^"']*submit[^"']*)["']/gi) || [];
      results.push({
        name: site.name,
        url: site.url,
        status: r.status,
        hasForm,
        submitLinks: submitLinks.slice(0,3)
      });
      console.log(`${site.name}: ${r.status} form=${hasForm} links=${submitLinks.length}`);
    } catch(e) {
      results.push({name: site.name, url: site.url, error: e.message});
      console.log(`${site.name}: ERROR - ${e.message}`);
    }
  }
  
  fs.writeFileSync(outDir + '/site_check.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to submissions/site_check.json');
}

main().catch(console.error);
