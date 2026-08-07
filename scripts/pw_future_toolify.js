const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  
  // Check FutureTools submit page
  const p = await b.newPage();
  await p.goto('https://www.futuretools.io/', {waitUntil: 'domcontentloaded', timeout: 20000});
  await p.waitForTimeout(2000);
  console.log('FutureTools:');
  console.log('Title:', await p.title());
  
  const links = await p.locator('a[href]').all();
  const subLinks = [];
  for (const l of links) {
    const h = await l.getAttribute('href');
    const t = await l.textContent();
    if (h && /submit|add|list/i.test(h + ' ' + t)) {
      subLinks.push(h + ' | ' + t.substring(0, 30));
    }
  }
  console.log('Submit links:');
  subLinks.slice(0, 5).forEach(l => console.log('  ' + l));
  
  await p.close();
  
  // Check Toolify
  const p2 = await b.newPage();
  await p2.goto('https://www.toolify.ai/', {waitUntil: 'domcontentloaded', timeout: 20000});
  await p2.waitForTimeout(2000);
  console.log('\nToolify:');
  console.log('Title:', await p2.title());
  const links2 = await p2.locator('a[href]').all();
  const subLinks2 = [];
  for (const l of links2) {
    const h = await l.getAttribute('href');
    const t = await l.textContent();
    if (h && /submit|add|list|contribute/i.test(h + ' ' + t)) {
      subLinks2.push(h + ' | ' + t.substring(0, 30));
    }
  }
  console.log('Submit links:');
  subLinks2.slice(0, 5).forEach(l => console.log('  ' + l));
  await p2.close();
  
  // Check SaaSGenius
  const p3 = await b.newPage();
  await p3.goto('https://saasgenius.com/', {waitUntil: 'domcontentloaded', timeout: 20000});
  await p3.waitForTimeout(2000);
  console.log('\nSaaSGenius:');
  console.log('Title:', await p3.title());
  const forms3 = await p3.locator('form').all();
  console.log('Forms:', forms3.length);
  for (let i = 0; i < forms3.length; i++) {
    const form = forms3[i];
    const inputs = await form.locator('input, textarea, select').all();
    console.log('Form ' + i + ': ' + inputs.length + ' inputs');
    for (const inp of inputs) {
      const name = await inp.evaluate(e => e.name || '');
      const type = await inp.evaluate(e => e.type || '');
      console.log('  ' + name + ' (' + type + ')');
    }
  }
  await p3.close();
  
  await b.close();
}
main().catch(console.error);
