const { chromium } = require('playwright');
async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const results = [];
  
  const tests = [
    { name: 'StartupStash', url: 'https://startupstash.com/' },
    { name: 'GetLeadWave', url: 'https://getleadwave.io/' },
    { name: 'SubmitSaaS', url: 'https://submitsaas.com/' },
    { name: 'SubmitCube', url: 'https://www.submitcube.com/' },
    { name: 'PRLog', url: 'https://www.prlog.org/submit-free-press-release.html' },
    { name: 'TechAsoft', url: 'https://www.techasoft.com/' },
    { name: 'SaaSPedia', url: 'https://saaspedia.io/' },
    { name: 'GrowPad', url: 'https://growpad.pro/' },
  ];
  
  for (const t of tests) {
    try {
      const page = await browser.newPage();
      await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const url = page.url();
      const title = await page.title();
      const hasForm = await page.locator('form').count();
      const submitBtn = await page.locator('button[type=submit], input[type=submit], a:has-text(Submit), a:has-text(Add), a:has-text(List)').count();
      results.push({ name: t.name, url, title, hasForm, submitBtn });
      console.log(t.name + ': ' + url + ' | form=' + hasForm + ' btns=' + submitBtn + ' | ' + title.substring(0, 60));
      await page.close();
    } catch (e) {
      results.push({ name: t.name, error: e.message });
      console.log(t.name + ': ERROR - ' + e.message);
    }
  }
  
  await browser.close();
  
  // Save results
  const fs = require('fs');
  fs.mkdirSync('E:/一人公司/电子书格式转换站/docs/submissions', { recursive: true });
  fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/submissions/playwright_check.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to docs/submissions/playwright_check.json');
}
main().catch(console.error);
