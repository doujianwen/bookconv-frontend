const https = require('https');
const http = require('http');
const fs = require('fs');
function get(url) {
  return new Promise((resolve, reject) => {
    const parts = url.match(/^https?:\/\/([^\/]+)(\/.*)$/);
    if (!parts) return reject(new Error('bad url'));
    const mod = url.startsWith('https:') ? https : http;
    const req = mod.get({hostname: parts[1], path: parts[2], timeout: 8000}, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({status: res.statusCode, body: d, headers: res.headers}));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}
async function main() {
  // Check more free submission directories
  const sites = [
    'https://www.softwaredirectory.org/',
    'https://www.freeprogrammingresources.com/',
    'https://www.producthunt.com/',
    'https://betalist.com/',
    'https://www.saashub.com/',
    'https://www.slant.co/',
    'https://alternativeto.net/',
    'https://www.g2.com/',
    'https://www.capterra.com/',
    'https://www.trustpilot.com/',
  ];
  for (const url of sites) {
    try {
      const r = await get(url);
      const blocked = r.body.includes('Cloudflare') || r.body.includes('Attention Required') || r.body.includes('Checking your browser');
      const hasForm = r.body.includes('<form');
      console.log(url.substring(8, 40) + ' -> ' + r.status + ' form=' + hasForm + ' blocked=' + blocked);
    } catch(e) {
      console.log(url.substring(8, 40) + ' -> ERROR ' + e.message);
    }
  }
}
main().catch(console.error);
