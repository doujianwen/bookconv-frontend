const {chromium} = require('playwright');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  
  // Try more high-value directories
  const pages = [
    {name: 'ProductHunt', url: 'https://www.producthunt.com/'},
    {name: 'BetaList', url: 'https://betalist.com/'},
    {name: 'IndieHackers', url: 'https://www.indiehackers.com/'},
  ];
  
  for (const t of pages) {
    try {
      const p = await b.newPage();
      await p.goto(t.url, {waitUntil: 'domcontentloaded', timeout: 20000});
      await p.waitForTimeout(2000);
      console.log(t.name + ': ' + p.url() + ' | ' + (await p.title()).substring(0, 50));
      
      const links = await p.locator('a[href]').all();
      const subLinks = [];
      for (const l of links) {
        const h = await l.getAttribute('href');
        const txt = await l.textContent();
        if (h && /submit|launch|pitch|add|share/i.test(h + ' ' + txt)) {
          subLinks.push(h + ' | ' + txt.substring(0, 30));
        }
      }
      console.log('Submit links:', subLinks.slice(0, 5).join('\n  '));
      await p.close();
    } catch(e) {
      console.log(t.name + ': ERROR ' + e.message.substring(0, 80));
    }
  }
  
  await b.close();
}
main().catch(console.error);
