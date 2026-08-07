const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  
  // Check more AI tool directories
  const sites = [
    {name: 'AI Tools Directory', url: 'https://aitoolsdirectory.com/'},
    {name: 'There's An AI For That', url: 'https://theresanaiforthat.com/'},
    {name: 'ToolFinder', url: 'https://toolfinder.ai/'},
    {name: 'AI Tool Kit', url: 'https://aitoolkit.ai/'},
    {name: 'Product Hunt', url: 'https://www.producthunt.com/'},
  ];
  
  for (const t of sites) {
    try {
      const p = await b.newPage();
      await p.goto(t.url, {waitUntil: 'domcontentloaded', timeout: 15000});
      await p.waitForTimeout(1500);
      console.log(t.name + ': ' + p.url());
      console.log('  Title: ' + (await p.title()).substring(0, 50));
      
      const forms = await p.locator('form').count();
      const sl = await p.locator('a[href*=\"submit\"], a[href*=\"/add\"]').count();
      console.log('  forms=' + forms + ' submit_links=' + sl);
      
      await p.close();
    } catch(e) {
      console.log(t.name + ': ERROR ' + e.message.substring(0, 60));
    }
  }
  
  await b.close();
}
main().catch(console.error);
