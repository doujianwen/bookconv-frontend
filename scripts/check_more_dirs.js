const https = require('https');
const http = require('http');
function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parts = url.match(/^https?:\/\/([^\/]+)(\/.*)$/);
    if (!parts) return reject(new Error('bad url'));
    const mod = url.startsWith('https:') ? https : http;
    const req = mod.get({
      hostname: parts[1], path: parts[2],
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        ...headers
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({status: res.statusCode, body: d, headers: res.headers, cookies: res.headers['set-cookie']}));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}
async function main() {
  // Try StartupStash with cookie (from previous challenge)
  console.log('=== StartupStash with cookie ===');
  const r1 = await get('https://startupstash.com/', {
    'Cookie': '__cf_bm=LvNUW3kEVTv.xDrRevOof8BlRNY_dLijqa2u0269RB4-1785973874.3003983-1.0.1.1-QhHUQp3gOL6VC7riEzVsfxyHYMuYsgDTe_ip2EB25btshG5S5FBSREITxMjdfzTg14a6HT5RLbqSuSu6eWmRJPcwRtIJ_zhoB5UUTD2l_Jgvgmlv0Jw.Zy3tAVG7XcQ9'
  });
  console.log('Status:', r1.status);
  console.log('Has challenge:', r1.body.includes('Just a moment'));
  console.log('Has submit:', r1.body.includes('submit') || r1.body.includes('Submit'));
  
  // Try Brave API to get StartupStash content
  console.log('\n=== Brave API: StartupStash ===');
  const braveKey = process.env.BRAVE_API_KEY;
  try {
    const braveBody = JSON.stringify({q: 'site:startupstash.com submit', count: 5});
    const braveR = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.search.brave.com',
        path: '/ss/v3/web/search?q=site:startupstash.com+submit&count=5',
        method: 'GET',
        headers: {
          'X-Subscription-Token': braveKey,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 10000
      }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve({status: res.statusCode, body: d}));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      req.end();
    });
    console.log('Brave status:', braveR.status);
    console.log('Brave body (first 500):', braveR.body.substring(0, 500));
  } catch(e) {
    console.log('Brave error:', e.message);
  }
  
  // Try other directories that might not have Cloudflare
  console.log('\n=== Testing more directories ===');
  const dirs = [
    'https://www.producthunt.com/',
    'https://www.betalist.com/',
    'https://saashub.com/',
    'https://alternativeto.net/',
    'https://www.slant.co/',
    'https://www.g2.com/',
    'https://www.capterra.com/',
    'https://www.saaslist.io/',
    'https://www.startups.com/',
    'https://www.toolify.ai/',
    'https://www.futuretools.io/',
    'https://www.softwaredirectory.org/',
  ];
  for (const url of dirs) {
    try {
      const r = await get(url);
      const isChallenge = r.body.includes('Just a moment') || r.body.includes('Checking');
      const isBlocked = r.status === 403 || r.status === 503;
      const hasSubmit = r.body.toLowerCase().includes('submit') || r.body.toLowerCase().includes('/add');
      console.log(url.substring(8, 45) + ' -> ' + r.status + ' challenge=' + isChallenge + ' blocked=' + isBlocked + ' submit=' + hasSubmit);
    } catch(e) {
      console.log(url.substring(8, 45) + ' -> ERROR ' + e.message);
    }
  }
}
main().catch(console.error);
