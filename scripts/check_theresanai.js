const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  
  // Check There's An AI For That
  console.log('=== There is An AI For That ===');
  const p1 = await b.newPage();
  await p1.goto('https://theresanaiforthat.com/', {waitUntil: 'domcontentloaded', timeout: 15000});
  await p1.waitForTimeout(2000);
  console.log('URL:', p1.url());
  console.log('Title:', await p1.title());
  
  const links = await p1.locator('a[href]').all();
  const subLinks = [];
  for (const l of links) {
    const h = await l.getAttribute('href');
    const t = await l.textContent();
    if (h && /submit|add|list|contribute/i.test(h + ' ' + t)) {
      subLinks.push(h + ' | ' + t.substring(0, 30));
    }
  }
  console.log('Submit links:', subLinks.slice(0, 5).join('\n  '));
  await p1.close();
  
  // Check submit page
  console.log('\n=== Check submit page ===');
  const p2 = await b.newPage();
  await p2.goto('https://theresanaiforthat.com/submit', {waitUntil: 'domcontentloaded', timeout: 15000});
  await p2.waitForTimeout(2000);
  console.log('URL:', p2.url());
  console.log('Title:', await p2.title());
  const forms2 = await p2.locator('form').count();
  const inputs2 = await p2.locator('input[name], textarea, select').count();
  console.log('Forms:', forms2, 'Inputs:', inputs2);
  if (inputs2 > 0) {
    const allInputs = await p2.locator('input[name], textarea, select').all();
    for (const inp of allInputs.slice(0, 10)) {
      const name = await inp.evaluate(e => e.name || '');
      const type = await inp.evaluate(e => e.type || '');
      console.log('  ' + name + ' (' + type + ')');
    }
  }
  await p2.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/theresanaiforthat_submit.png'});
  await p2.close();
  
  await b.close();
}
main().catch(console.error);
