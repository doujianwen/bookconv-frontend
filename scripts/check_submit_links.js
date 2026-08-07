const { chromium } = require('playwright');
async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  
  // Check GetLeadWave, SubmitSaaS, SubmitCube for submit links
  const checks = [
    { name: 'GetLeadWave', url: 'https://getleadwave.io/' },
    { name: 'SubmitSaaS', url: 'https://submitsaas.com/' },
    { name: 'SubmitCube', url: 'https://www.submitcube.com/' },
  ];
  
  for (const t of checks) {
    console.log('\n=== ' + t.name + ' ===');
    const page = await browser.newPage();
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(1500);
    
    // Get submit-related links
    const links = await page.locator('a[href]').all();
    const submitLinks = [];
    for (const link of links) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && /submit|add|list|contribute|pitch|share/i.test(href + ' ' + text)) {
        submitLinks.push(href + ' | ' + (text || '').substring(0, 40));
      }
    }
    console.log('Submit links:');
    submitLinks.slice(0, 10).forEach(l => console.log('  ' + l));
    
    await page.close();
  }
  
  await browser.close();
}
main().catch(console.error);
