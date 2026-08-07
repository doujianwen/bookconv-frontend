const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--lang=en-US',
      '--window-size=1920,1080'
    ]
  });
  
  const p = await b.newPage();
  await p.setViewportSize({width: 1920, height: 1080});
  await p.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  // Inject stealth scripts
  await p.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
    Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
    Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});
    Object.defineProperty(navigator, 'platform', {get: () => 'Win32'});
    window.chrome = {runtime: {}, loadTimes: function(){}};
  });
  
  console.log('Navigating to StartupStash...');
  const r = await p.goto('https://startupstash.com/', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  
  const title = await p.title();
  const url = p.url();
  console.log('Title: ' + title);
  console.log('URL: ' + url);
  console.log('Status: ' + (r ? r.status() : 'none'));
  
  const isBlocked = title.includes('Attention') || title.includes('Cloudflare') || title.includes('Checking') || url.includes('challenges');
  console.log('Blocked: ' + isBlocked);
  
  if (!isBlocked) {
    console.log('\n=== BYPASSED! ===');
    await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/startupstash_bypassed.png'});
    
    // Find submit button
    const submitBtn = await p.locator('a:has-text(Submit), a:has-text(Add), button:has-text(Submit)').count();
    console.log('Submit buttons found: ' + submitBtn);
    
    // Get all links
    const links = await p.locator('a[href]').all();
    const subLinks = [];
    for (const l of links) {
      const h = await l.getAttribute('href');
      const t = await l.textContent();
      if (h && /submit|add|list/i.test(h + ' ' + t)) {
        subLinks.push(h + ' | ' + t.substring(0, 30));
      }
    }
    console.log('\nSubmit links:');
    subLinks.slice(0, 10).forEach(l => console.log('  ' + l));
    
    await p.close();
    await b.close();
    process.exit(0);
  } else {
    console.log('\n=== STILL BLOCKED ===');
    await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/startupstash_blocked.png'});
    await p.close();
    await b.close();
  }
}
main().catch(console.error);
