const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const results = [];
  
  // Check more directories from the resource list
  const sites = [
    {name: 'ProductList', url: 'https://www.producthunt.com/'},
    {name: 'SAASHub', url: 'https://saashub.com/'},
    {name: 'Startups', url: 'https://www.startups.com/'},
    {name: 'SaasScout', url: 'https://saasscout.com/'},
    {name: 'SaaSBatch', url: 'https://saasbatchlist.com/'},
    {name: 'SaaSGenius', url: 'https://saasgenius.com/'},
    {name: 'Toolify', url: 'https://www.toolify.ai/'},
    {name: 'FutureTools', url: 'https://www.futuretools.io/'},
  ];
  
  for (const t of sites) {
    try {
      const p = await b.newPage();
      await p.goto(t.url, {waitUntil: 'domcontentloaded', timeout: 15000});
      await p.waitForTimeout(1500);
      const title = (await p.title()).substring(0, 40);
      const forms = await p.locator('form').count();
      const sl = await p.locator('a[href*=\"submit\"], a[href*=\"/add\"], a[href*=\"/list\"]').count();
      const blocked = title.includes('Cloudflare') || title.includes('Attention');
      results.push({name: t.name, title, forms, submitLinks: sl, blocked: blocked});
      console.log(t.name + ': forms=' + forms + ' links=' + sl + ' blocked=' + blocked + ' | ' + title);
      await p.close();
    } catch(e) {
      results.push({name: t.name, error: e.message.substring(0, 80)});
      console.log(t.name + ': ERROR ' + e.message.substring(0, 50));
    }
  }
  
  await b.close();
  fs.mkdirSync('E:/一人公司/电子书格式转换站/docs/submissions', {recursive: true});
  fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/submissions/directory_check.json', JSON.stringify(results, null, 2));
  console.log('\nDone');
}
main().catch(console.error);
