const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  // Test with different browser configurations to find one that bypasses Cloudflare
  const configs = [
    {name: 'headless+stealth', args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--disable-features=IsolateOrigins,site-per-process']},
    {name: 'headless2', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']},
    {name: 'headed', args: ['--no-sandbox']},
  ];
  
  for (const cfg of configs) {
    try {
      const b = await chromium.launch({headless: true, args: cfg.args});
      const p = await b.newPage();
      
      // Set realistic viewport and headers
      await p.setViewportSize({width: 1920, height: 1080});
      await p.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      // Override navigator properties
      await p.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
        Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
        Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});
        window.chrome = {runtime: {}, loadTimes: function(){}};
      });
      
      console.log('Testing: ' + cfg.name);
      const r = await p.goto('https://startupstash.com/', {waitUntil: 'domcontentloaded', timeout: 30000});
      const title = await p.title();
      const url = p.url();
      console.log('  Title: ' + title.substring(0, 60));
      console.log('  URL: ' + url.substring(0, 80));
      console.log('  Status: ' + (r ? r.status() : 'none'));
      
      const isBlocked = title.includes('Attention') || title.includes('Cloudflare') || title.includes('Checking');
      console.log('  Blocked: ' + isBlocked);
      
      if (!isBlocked) {
        await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/startupstash_' + cfg.name + '.png'});
        console.log('  Screenshot saved!');
      }
      
      await p.close();
      await b.close();
      
      if (!isBlocked) {
        console.log('\nSUCCESS: Config ' + cfg.name + ' bypassed Cloudflare!');
        process.exit(0);
      }
      console.log('');
    } catch(e) {
      console.log(cfg.name + ': ERROR ' + e.message.substring(0, 100) + '\n');
    }
  }
  
  console.log('All configs blocked. Trying with headed browser...');
}
main().catch(console.error);
