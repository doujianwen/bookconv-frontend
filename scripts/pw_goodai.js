const {chromium} = require('playwright');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const p = await b.newPage();
  await p.goto('https://goodaitools.com/submit', {waitUntil: 'networkidle', timeout: 30000});
  await p.waitForTimeout(2000);
  console.log('URL:', p.url());
  console.log('Title:', await p.title());
  
  const forms = await p.locator('form').all();
  console.log('Forms:', forms.length);
  for (let i = 0; i < forms.length; i++) {
    const form = forms[i];
    const action = await form.getAttribute('action');
    const method = await form.getAttribute('method');
    console.log('Form ' + i + ': action=' + action + ' method=' + method);
    
    const inputs = await form.locator('input, textarea, select').all();
    console.log('  Inputs: ' + inputs.length);
    for (const inp of inputs) {
      const tag = await inp.evaluate(e => e.tagName);
      const name = await inp.evaluate(e => e.name || '');
      const type = await inp.evaluate(e => e.type || '');
      const ph = await inp.evaluate(e => e.placeholder || '');
      console.log('    <' + tag + '> name=' + name + ' type=' + type + ' ph=' + ph);
    }
  }
  
  // Also check for buttons
  const buttons = await p.locator('button, input[type=submit]').all();
  console.log('Buttons:', buttons.length);
  for (const btn of buttons) {
    const text = await btn.textContent();
    const type = await btn.evaluate(e => e.type);
    console.log('  btn type=' + type + ' text=' + text.substring(0, 30));
  }
  
  await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/goodai_submit.png'});
  await p.close();
  await b.close();
  console.log('Done');
}
main().catch(console.error);
