const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const sites = [
    {name: 'AIToolsDir', url: 'https://aitoolsdirectory.com/'},
    {name: 'TheresAnAI', url: 'https://theresanaiforthat.com/'},
    {name: 'ToolFinder', url: 'https://toolfinder.ai/'},
    {name: 'AIToolKit', url: 'https://aitoolkit.ai/'},
    {name: 'ProductHunt', url: 'https://www.producthunt.com/'},
    {name: 'ProductHunt2', url: 'https://api.producthunt.com/'},
  ];
  for (const t of sites) {
    try {
      const p = await b.newPage();
      await p.goto(t.url, {waitUntil: 'domcontentloaded', timeout: 12000});
      await p.waitForTimeout(1500);
      const title = (await p.title()).substring(0, 50);
      const forms = await p.locator('form').count();
      const sl = await p.locator('a[href*=\"submit\"], a[href*=\"/add\"]').count();
      console.log(t.name + ': forms=' + forms + ' links=' + sl + ' | ' + title);
      await p.close();
    } catch(e) {
      console.log(t.name + ': ERROR ' + e.message.substring(0, 60));
    }
  }
  await b.close();
}
main().catch(console.error);
