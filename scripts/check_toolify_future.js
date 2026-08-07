const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  
  // Check Toolify submit page
  console.log('=== Toolify /submit ===');
  const p1 = await b.newPage();
  await p1.goto('https://www.toolify.ai/submit', {waitUntil: 'domcontentloaded', timeout: 20000});
  await p1.waitForTimeout(2000);
  console.log('URL:', p1.url());
  console.log('Title:', await p1.title());
  const forms1 = await p1.locator('form').count();
  const inputs1 = await p1.locator('input[name], textarea, select').count();
  console.log('Forms:', forms1, 'Inputs:', inputs1);
  if (inputs1 > 0) {
    const allInputs = await p1.locator('input[name], textarea, select').all();
    for (const inp of allInputs.slice(0, 10)) {
      const name = await inp.evaluate(e => e.name || '');
      const type = await inp.evaluate(e => e.type || '');
      console.log('  ' + name + ' (' + type + ')');
    }
  }
  await p1.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/toolify_submit.png'});
  await p1.close();
  
  // Check FutureTools submit page
  console.log('\n=== FutureTools /submit-a-tool ===');
  const p2 = await b.newPage();
  await p2.goto('https://www.futuretools.io/submit-a-tool', {waitUntil: 'domcontentloaded', timeout: 20000});
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
      const ph = await inp.evaluate(e => e.placeholder || '');
      console.log('  ' + name + ' (' + type + ') ph=' + ph);
    }
  }
  await p2.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/futuretools_tool_submit.png'});
  await p2.close();
  
  // Check BetaList submit page
  console.log('\n=== BetaList /submit ===');
  const p3 = await b.newPage();
  await p3.goto('https://betalist.com/submit', {waitUntil: 'domcontentloaded', timeout: 20000});
  await p3.waitForTimeout(2000);
  console.log('URL:', p3.url());
  console.log('Title:', await p3.title());
  const forms3 = await p3.locator('form').count();
  const inputs3 = await p3.locator('input[name], textarea, select').count();
  console.log('Forms:', forms3, 'Inputs:', inputs3);
  if (inputs3 > 0) {
    const allInputs = await p3.locator('input[name], textarea, select').all();
    for (const inp of allInputs.slice(0, 10)) {
      const name = await inp.evaluate(e => e.name || '');
      const type = await inp.evaluate(e => e.type || '');
      console.log('  ' + name + ' (' + type + ')');
    }
  }
  await p3.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/betalist_submit2.png'});
  await p3.close();
  
  await b.close();
}
main().catch(console.error);
