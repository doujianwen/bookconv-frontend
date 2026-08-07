const {firefox} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await firefox.launch({headless: true});
  const p = await b.newPage();
  await p.setViewportSize({width: 1920, height: 1080});
  await p.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
  });
  
  console.log('Testing StartupStash with Firefox...');
  const r = await p.goto('https://startupstash.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  
  console.log('Status:', r ? r.status() : 'none');
  console.log('URL:', p.url());
  console.log('Title:', await p.title());
  
  const isBlocked = (await p.title()).includes('Attention') || p.url().includes('challenges');
  console.log('Blocked:', isBlocked);
  
  if (!isBlocked) {
    console.log('\n=== Firefox bypassed Cloudflare! ===');
    await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/startupstash_firefox.png'});
    
    // Wait for content
    await p.waitForTimeout(3000);
    
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
    console.log('\nFirefox also blocked');
    await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/startupstash_firefox_blocked.png'});
    await p.close();
    await b.close();
  }
}
main().catch(console.error);
