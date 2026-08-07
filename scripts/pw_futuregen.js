const {chromium} = require('playwright');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  
  // Check FutureGen forms
  const p = await b.newPage();
  await p.goto('https://www.futuregenapps.com/', {waitUntil: 'domcontentloaded', timeout: 20000});
  await p.waitForTimeout(2000);
  console.log('FutureGen forms:');
  const forms = await p.locator('form').all();
  for (let i = 0; i < forms.length; i++) {
    const form = forms[i];
    const action = await form.getAttribute('action');
    const inputs = await form.locator('input[name], textarea[name]').all();
    console.log('Form ' + i + ': action=' + action + ' fields=' + inputs.length);
    for (const inp of inputs.slice(0, 5)) {
      const name = await inp.evaluate(e => e.name || '');
      console.log('  ' + name);
    }
  }
  await p.close();
  
  // Check EffortlessBL submit link
  const p2 = await b.newPage();
  await p2.goto('https://www.effortlessbacklinks.com/', {waitUntil: 'domcontentloaded', timeout: 20000});
  await p2.waitForTimeout(2000);
  console.log('\nEffortlessBL:');
  const slinks = await p2.locator('a[href*=\"submit\"], a[href*=\"/add\"]').all();
  for (const l of slinks) {
    const href = await l.getAttribute('href');
    const text = await l.textContent();
    console.log('  ' + href + ' | ' + text.substring(0, 40));
  }
  await p2.close();
  
  await b.close();
}
main().catch(console.error);
