const {chromium} = require('playwright');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  
  // Try to submit to FutureTools
  const p = await b.newPage();
  await p.goto('https://www.futuretools.io/submit', {waitUntil: 'networkidle', timeout: 30000});
  await p.waitForTimeout(3000);
  console.log('FutureTools Submit:');
  console.log('URL:', p.url());
  console.log('Title:', await p.title());
  
  const forms = await p.locator('form').all();
  console.log('Forms:', forms.length);
  for (let i = 0; i < forms.length; i++) {
    const form = forms[i];
    const action = await form.getAttribute('action');
    console.log('Form ' + i + ': action=' + action);
    const inputs = await form.locator('input, textarea, select').all();
    console.log('  Fields: ' + inputs.length);
    for (const inp of inputs) {
      const tag = await inp.evaluate(e => e.tagName);
      const name = await inp.evaluate(e => e.name || '');
      const type = await inp.evaluate(e => e.type || '');
      const ph = await inp.evaluate(e => e.placeholder || '');
      console.log('    <' + tag + '> name=' + name + ' type=' + type + ' ph=' + ph);
    }
  }
  
  await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/futuretools_submit.png'});
  await p.close();
  await b.close();
}
main().catch(console.error);
