const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const results = [];
  
  // Test sites that might have real submission forms
  const sites = [
    {name: 'AlternativeTo', url: 'https://alternativeto.net/'},
    {name: 'Slant', url: 'https://www.slant.co/'},
    {name: 'ProductHunt', url: 'https://www.producthunt.com/'},
    {name: 'IndieWeb', url: 'https://indieweb.org/'},
    {name: 'OSSIndex', url: 'https://www.ossindex.io/'},
    {name: 'Freelogodesign', url: 'https://www.freelogodesign.org/'},
    {name: 'ToolBase', url: 'https://toolbase.io/'},
    {name: 'SAASList', url: 'https://saaslist.io/'},
    {name: 'AppSumo', url: 'https://appsumo.com/'},
    {name: 'G2', url: 'https://www.g2.com/'},
    {name: 'Capterra', url: 'https://www.capterra.com/'},
    {name: 'GetApp', url: 'https://www.getapp.com/'},
  ];
  
  for (const t of sites) {
    try {
      const p = await b.newPage();
      await p.goto(t.url, {waitUntil: 'domcontentloaded', timeout: 15000});
      await p.waitForTimeout(1500);
      const title = (await p.title()).substring(0, 40);
      const forms = await p.locator('form').count();
      const inputs = await p.locator('input[name], textarea').count();
      const sl = await p.locator('a[href*=\"submit\"], a[href*=\"/add\"]').count();
      results.push({name: t.name, title, forms, inputs, submitLinks: sl});
      console.log(t.name + ': forms=' + forms + ' inputs=' + inputs + ' links=' + sl + ' | ' + title);
      await p.close();
    } catch(e) {
      results.push({name: t.name, error: e.message.substring(0, 80)});
      console.log(t.name + ': ERROR ' + e.message.substring(0, 50));
    }
  }
  
  await b.close();
  fs.mkdirSync('E:/一人公司/电子书格式转换站/docs/submissions', {recursive: true});
  fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/submissions/more_dirs_check.json', JSON.stringify(results, null, 2));
  console.log('\nDone. Results saved.');
}
main().catch(console.error);
