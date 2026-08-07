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
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  // Inject stealth scripts
  await p.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
    Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
    Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});
    Object.defineProperty(navigator, 'platform', {get: () => 'Win32'});
    window.chrome = {runtime: {}};
  });
  
  console.log('Navigating to StartupStash...');
  const r = await p.goto('https://startupstash.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  
  console.log('Initial load done. Status:', r ? r.status() : 'none');
  console.log('URL:', p.url());
  console.log('Title:', await p.title());
  
  // Wait for Cloudflare challenge to resolve
  console.log('\nWaiting for Cloudflare challenge...');
  for (let i = 0; i < 10; i++) {
    await p.waitForTimeout(2000);
    const currentUrl = p.url();
    const currentTitle = await p.title();
    console.log('  [' + (i+1) + '] URL: ' + currentUrl.substring(0, 80) + ' Title: ' + currentTitle.substring(0, 40));
    
    // Check if challenge resolved
    if (!currentUrl.includes('__cf_chl') && !currentTitle.includes('Just a moment')) {
      console.log('\n=== Challenge resolved! ===');
      break;
    }
    
    // Check if blocked
    if (currentTitle.includes('Attention') || currentTitle.includes('Checking')) {
      console.log('  Still blocked, waiting...');
    }
  }
  
  const finalUrl = p.url();
  const finalTitle = await p.title();
  console.log('\nFinal URL:', finalUrl);
  console.log('Final Title:', finalTitle);
  
  const isBlocked = finalTitle.includes('Attention') || finalTitle.includes('Checking') || finalUrl.includes('challenges');
  const isChallenge = finalUrl.includes('__cf_chl');
  
  if (!isBlocked && !isChallenge) {
    console.log('\n=== SUCCESS! Cloudflare bypassed! ===');
    await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/startupstash_success.png'});
    
    // Find submit links
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
    console.log('\n=== BLOCKED ===');
    await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/startupstash_blocked2.png'});
    await p.close();
    await b.close();
  }
}
main().catch(console.error);
