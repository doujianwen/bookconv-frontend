const { chromium } = require('playwright');
async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  
  const sites = [
    { name: 'SubmitSaaS', url: 'https://submitsaas.com/' },
    { name: 'GetLeadWave', url: 'https://getleadwave.io/' },
    { name: 'SubmitCube', url: 'https://www.submitcube.com/' },
    { name: 'SaaSPedia', url: 'https://saaspedia.io/' },
    { name: 'StartupStash', url: 'https://startupstash.com/' },
    { name: 'BacklinkCRM', url: 'https://backlinkcrm.io/' },
  ];
  
  for (const t of sites) {
    console.log('\n=== ' + t.name + ' ===');
    const page = await browser.newPage();
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 20000 });
    
    // Find all links
    const links = await page.locator('a[href]').all();
    const allLinks = [];
    for (const link of links) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && href.startsWith('http')) {
        allLinks.push(href);
      }
    }
    
    // Look for submission-related pages
    const submitPages = allLinks.filter(l => 
      /submit|add|list|directory|contribute|pitch|feature|showcase/i.test(l)
    );
    console.log('Potential submit pages:', submitPages.slice(0, 5).join('\n  '));
    
    // Also check for common patterns
    const commonPages = allLinks.filter(l => 
      /\/submit|\/add|\/list-your|\/contribute|\/pitch|\/feature|\/directory|\/categories/i.test(l)
    );
    console.log('Common pattern pages:', commonPages.slice(0, 5).join('\n  '));
    
    await page.close();
  }
  
  await browser.close();
}
main().catch(console.error);
