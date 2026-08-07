const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const results = [];
  
  // Test accessible directories
  const sites = [
    {name: 'BetaList', url: 'https://betalist.com/'},
    {name: 'Toolify', url: 'https://www.toolify.ai/'},
    {name: 'FutureTools', url: 'https://www.futuretools.io/'},
    {name: 'ActiveSearch', url: 'https://www.activesearchresults.com/'},
    {name: 'SubmitCube', url: 'https://www.submitcube.com/'},
  ];
  
  for (const t of sites) {
    try {
      const p = await b.newPage();
      await p.goto(t.url, {waitUntil: 'domcontentloaded', timeout: 15000});
      await p.waitForTimeout(1500);
      console.log(t.name + ': ' + p.url());
      console.log('  Title: ' + (await p.title()).substring(0, 50));
      
      const forms = await p.locator('form').count();
      const sl = await p.locator('a[href*=\"submit\"], a[href*=\"/add\"], a[href*=\"/list-your\"]').count();
      console.log('  forms=' + forms + ' submit_links=' + sl);
      
      // Find submit links
      const links = await p.locator('a[href]').all();
      const subLinks = [];
      for (const l of links) {
        const h = await l.getAttribute('href');
        const txt = await l.textContent();
        if (h && /submit|add|list|contribute|pitch/i.test(h + ' ' + txt)) {
          subLinks.push(h + ' | ' + txt.substring(0, 30));
        }
      }
      if (subLinks.length > 0) {
        console.log('  Links:');
        subLinks.slice(0, 5).forEach(l => console.log('    ' + l));
      }
      
      results.push({name: t.name, url: p.url(), forms, submitLinks: subLinks.length});
      await p.close();
    } catch(e) {
      results.push({name: t.name, error: e.message.substring(0, 100)});
      console.log(t.name + ': ERROR ' + e.message.substring(0, 60));
    }
  }
  
  await b.close();
  fs.mkdirSync('E:/一人公司/电子书格式转换站/docs/submissions', {recursive: true});
  fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/submissions/accessible_dirs.json', JSON.stringify(results, null, 2));
  console.log('\nDone. Results saved.');
}
main().catch(console.error);
