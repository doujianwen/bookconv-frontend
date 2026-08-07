const {chromium} = require('playwright');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const p = await b.newPage();
  await p.goto('https://www.prlog.org/submit-free-press-release.html', {waitUntil: 'networkidle', timeout: 30000});
  await p.waitForTimeout(3000);
  console.log('URL:', p.url());
  console.log('Title:', await p.title());
  
  // Check for any visible submit form
  const forms = await p.locator('form').all();
  console.log('Forms:', forms.length);
  for (let i = 0; i < forms.length; i++) {
    const form = forms[i];
    const action = await form.getAttribute('action');
    const inputs = await form.locator('input, textarea, select').all();
    console.log('Form ' + i + ': action=' + action + ' inputs=' + inputs.length);
    for (const inp of inputs) {
      const tag = await inp.evaluate(e => e.tagName);
      const name = await inp.evaluate(e => e.name || '');
      const type = await inp.evaluate(e => e.type || '');
      console.log('  <' + tag + '> name=' + name + ' type=' + type);
    }
  }
  
  await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/prlog_submit2.png'});
  await p.close();
  await b.close();
  console.log('Done');
}
main().catch(console.error);
