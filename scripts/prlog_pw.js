const { chromium } = require('playwright');
async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  // Test PRLog submit page specifically
  const page = await browser.newPage();
  await page.goto('https://www.prlog.org/submit-free-press-release.html', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('PRLog URL:', page.url());
  console.log('PRLog Title:', await page.title());
  
  // Check for dynamic content
  await page.waitForTimeout(2000);
  
  // Look for forms after JS rendering
  const forms = await page.locator('form').count();
  console.log('Forms after JS:', forms);
  
  // Get all input fields
  const inputs = await page.locator('input, textarea, select').all();
  console.log('Input elements:', inputs.length);
  for (const el of inputs.slice(0, 20)) {
    const tag = await el.evaluate(e => e.tagName);
    const name = await el.evaluate(e => e.name || '');
    const type = await el.evaluate(e => e.type || '');
    console.log('  <' + tag + '> name=' + name + ' type=' + type);
  }
  
  // Screenshot
  await page.screenshot({ path: 'E:/一人公司/电子书格式转换站/docs/submissions/prlog_submit.png' });
  console.log('Screenshot saved');
  
  await browser.close();
}
main().catch(console.error);
