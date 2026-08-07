const {chromium} = require('playwright');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  
  // Try to submit to ActiveSearch
  const p = await b.newPage();
  await p.goto('https://www.activesearchresults.com/addwebsite.php', {waitUntil: 'domcontentloaded', timeout: 20000});
  await p.waitForTimeout(2000);
  console.log('URL:', p.url());
  console.log('Title:', await p.title());
  
  // Fill the form
  await p.locator('input[name=url]').fill('https://yourdomain.com');
  await p.locator('input[name=email]').fill('founder@yourdomain.com');
  
  // Submit
  await p.locator('input[name=submiturl]').click();
  await p.waitForTimeout(3000);
  
  console.log('After submit URL:', p.url());
  console.log('Page title:', await p.title());
  
  const content = await p.content();
  console.log('Content length:', content.length);
  console.log('Has success:', content.includes('success') || content.includes('added') || content.includes('submitted'));
  console.log('Has error:', content.includes('error') || content.includes('invalid'));
  
  await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/activesearch_result.png'});
  await p.close();
  await b.close();
  console.log('Done');
}
main().catch(console.error);
