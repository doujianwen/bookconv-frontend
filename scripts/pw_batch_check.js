const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const results = [];
  
  // Sites to test for auto-submission
  const sites = [
    {name: 'SubmitCube', url: 'https://www.submitcube.com/'},
    {name: 'LinkDr', url: 'https://linkdr.com/'},
    {name: 'GetLeadWave', url: 'https://getleadwave.io/'},
    {name: 'GrowPad', url: 'https://growpad.pro/'},
    {name: 'EffortlessBL', url: 'https://www.effortlessbacklinks.com/'},
    {name: 'SerpMaestro', url: 'https://serpmaestro.com/'},
    {name: 'FutureGen', url: 'https://www.futuregenapps.com/'},
    {name: 'DSOM', url: 'https://www.dsom.in/'},
  ];
  
  for (const t of sites) {
    try {
      const p = await b.newPage();
      await p.goto(t.url, {waitUntil: 'domcontentloaded', timeout: 20000});
      await p.waitForTimeout(2000);
      console.log(t.name + ': ' + p.url() + ' | ' + (await p.title()).substring(0, 50));
      
      const forms = await p.locator('form').count();
      const inputs = await p.locator('input[name], textarea, select').count();
      const submitLinks = await p.locator('a[href*=\"submit\"], a[href*=\"/add\"]').count();
      
      results.push({name: t.name, url: p.url(), forms, inputs, submitLinks, title: await p.title()});
      console.log('  forms=' + forms + ' inputs=' + inputs + ' submit_links=' + submitLinks);
      
      await p.close();
    } catch(e) {
      results.push({name: t.name, error: e.message.substring(0, 100)});
      console.log(t.name + ': ERROR ' + e.message.substring(0, 60));
    }
  }
  
  await b.close();
  fs.mkdirSync('E:/一人公司/电子书格式转换站/docs/submissions', {recursive: true});
  fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/submissions/site_check_results.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved.');
}
main().catch(console.error);
