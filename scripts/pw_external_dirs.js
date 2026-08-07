const {chromium} = require('playwright');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  
  // Check the external submission pages from SubmitSaaS
  const pages = [
    {name: 'SaaSHub', url: 'https://www.saashub.com/register'},
    {name: 'GoodAI', url: 'https://goodaitools.com/submit'},
    {name: 'BrownBook', url: 'https://www.brownbook.net/register'},
  ];
  
  for (const t of pages) {
    try {
      const p = await b.newPage();
      await p.goto(t.url, {waitUntil: 'domcontentloaded', timeout: 20000});
      await p.waitForTimeout(1500);
      console.log(t.name + ': ' + p.url());
      console.log('  Title: ' + await p.title());
      
      const forms = await p.locator('form').count();
      console.log('  Forms: ' + forms);
      
      if (forms > 0) {
        const inputs = await p.locator('input, textarea, select').count();
        console.log('  Inputs: ' + inputs);
      }
      
      await p.close();
    } catch(e) {
      console.log(t.name + ': ERROR ' + e.message.substring(0, 100));
    }
  }
  
  await b.close();
}
main().catch(console.error);
