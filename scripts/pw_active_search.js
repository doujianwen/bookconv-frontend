const {chromium} = require('playwright');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  
  const pages = [
    {name: 'ActiveSearch', url: 'https://www.activesearchresults.com/addwebsite.php'},
    {name: 'VieSearch', url: 'https://viesearch.com/join'},
  ];
  
  for (const t of pages) {
    const p = await b.newPage();
    await p.goto(t.url, {waitUntil: 'networkidle', timeout: 25000});
    await p.waitForTimeout(2000);
    console.log('\n=== ' + t.name + ' ===');
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
    
    await p.close();
  }
  
  await b.close();
}
main().catch(console.error);
