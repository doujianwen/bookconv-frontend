const { chromium } = require('playwright');
async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const results = [];
  const tests = [
    { name: 'StartupStash', url: 'https://startupstash.com/' },
    { name: 'GetLeadWave', url: 'https://getleadwave.io/' },
    { name: 'SubmitSaaS', url: 'https://submitsaas.com/' },
    { name: 'SubmitCube', url: 'https://www.submitcube.com/' },
    { name: 'PRLog Submit', url: 'https://www.prlog.org/submit-free-press-release.html' },
    { name: 'TechAsoft', url: 'https://www.techasoft.com/' },
    { name: 'SaaSPedia', url: 'https://saaspedia.io/' },
    { name: 'GrowPad', url: 'https://growpad.pro/' },
    { name: 'BacklinkCRM', url: 'https://backlinkcrm.io/' },
    { name: 'StartupSauce', url: 'https://www.startupsauce.com/' },
    { name: 'EffortlessBL', url: 'https://www.effortlessbacklinks.com/' },
    { name: 'SerpMaestro', url: 'https://serpmaestro.com/' },
  ];
  for (const t of tests) {
    try {
      const page = await browser.newPage();
      await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const currentUrl = page.url();
      const title = await page.title();
      const formCount = await page.locator('form').count();
      const buttons = await page.locator('button, input[type=submit]').count();
      const submitLinks = await page.locator('a[href*=\"submit\"], a[href*=\"/add\"], a[href*=\"/list\"]').count();
      const textareas = await page.locator('textarea').count();
      const inputs = await page.locator('input[name]').count();
      results.push({ name: t.name, url: currentUrl, title, forms: formCount, buttons, submitLinks, textareas, inputs, status: 'ok' });
      console.log(t.name + ': forms=' + formCount + ' btns=' + buttons + ' links=' + submitLinks + ' ta=' + textareas + ' inp=' + inputs);
      await page.close();
    } catch (e) {
      results.push({ name: t.name, error: e.message.substring(0, 200), status: 'error' });
      console.log(t.name + ': ERROR - ' + e.message.substring(0, 100));
    }
  }
  await browser.close();
  const fs = require('fs');
  fs.mkdirSync('E:/一人公司/电子书格式转换站/docs/submissions', { recursive: true });
  fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/submissions/playwright_check.json', JSON.stringify(results, null, 2));
  console.log('\nDone. Saved to docs/submissions/playwright_check.json');
}
main().catch(console.error);
