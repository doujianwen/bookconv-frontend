const { chromium } = require('playwright');
async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  
  const checks = [
    { name: 'StartupStash', url: 'https://startupstash.com/' },
    { name: 'TechAsoft', url: 'https://www.techasoft.com/' },
    { name: 'SaaSPedia', url: 'https://saaspedia.io/' },
    { name: 'BacklinkCRM', url: 'https://backlinkcrm.io/' },
  ];
  
  for (const t of checks) {
    console.log('\n=== ' + t.name + ' ===');
    const page = await browser.newPage();
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(1500);
    
    // Get all forms with their details
    const forms = await page.locator('form').all();
    console.log('Forms count:', forms.length);
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const action = await form.getAttribute('action');
      const method = await form.getAttribute('method');
      console.log('  Form ' + i + ': action=' + (action || 'none') + ' method=' + (method || 'GET'));
      
      // Get inputs in this form
      const inputs = await form.locator('input, textarea, select').all();
      console.log('  Inputs: ' + inputs.length);
      for (const inp of inputs.slice(0, 10)) {
        const tag = await inp.evaluate(e => e.tagName.toLowerCase());
        const name = await inp.evaluate(e => e.name || '');
        const type = await inp.evaluate(e => e.type || '');
        const placeholder = await inp.evaluate(e => e.placeholder || '');
        console.log('    <' + tag + '> name=' + name + ' type=' + type + ' ph=' + placeholder);
      }
    }
    
    // Check for submit/modal dialogs
    const pageContent = await page.content();
    console.log('Page size:', pageContent.length);
    
    await page.close();
  }
  
  await browser.close();
}
main().catch(console.error);
