const {chromium} = require('playwright');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const p = await b.newPage();
  await p.goto('https://submitsaas.com/', {waitUntil: 'networkidle', timeout: 30000});
  await p.waitForTimeout(2000);
  console.log('URL:', p.url());
  console.log('Title:', await p.title());
  
  const links = await p.locator('a[href]').all();
  const subLinks = [];
  for (const l of links) {
    const h = await l.getAttribute('href');
    const t = await l.textContent();
    if (h && /submit|add|list|contribute|pitch/i.test(h + ' ' + t)) {
      subLinks.push(h + ' | ' + t.substring(0, 40));
    }
  }
  console.log('Submit links:');
  subLinks.slice(0, 8).forEach(l => console.log('  ' + l));
  
  await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/submitsaas_home.png'});
  await p.close();
  await b.close();
  console.log('Done');
}
main().catch(console.error);
