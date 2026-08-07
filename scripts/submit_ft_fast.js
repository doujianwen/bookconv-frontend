const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const p = await b.newPage();
  
  // Try FutureTools with faster load
  console.log('=== FutureTools Submit (fast) ===');
  await p.goto('https://www.futuretools.io/submit-a-tool', {waitUntil: 'domcontentloaded', timeout: 15000});
  await p.waitForTimeout(1500);
  console.log('URL:', p.url());
  console.log('Title:', await p.title());
  
  // Check if page loaded properly
  const body = await p.content();
  console.log('Body length:', body.length);
  
  // Try to fill and submit
  try {
    await p.locator('input[name=\"submitter_name\"]').fill('Test');
    await p.locator('input[name=\"tool_name\"]').fill('Test Tool');
    await p.locator('input[name=\"tool_url\"]').fill('https://example.com');
    await p.locator('textarea[name=\"description\"]').fill('Test description');
    await p.locator('input[name=\"submitter_email\"]').fill('test@example.com');
    console.log('Form filled');
    
    await p.locator('button[type=submit]').click();
    await p.waitForTimeout(3000);
    
    console.log('After submit:', p.url());
    console.log('After title:', await p.title());
    
    const content = await p.content();
    console.log('Has success:', content.includes('success') || content.includes('added'));
    
    await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/futuretools_fast_result.png'});
  } catch(e) {
    console.log('Submit error:', e.message);
  }
  
  await p.close();
  await b.close();
}
main().catch(console.error);
