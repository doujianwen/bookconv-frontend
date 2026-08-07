const {chromium} = require('playwright');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  
  // Try StartupStash with different approach
  const p = await b.newPage();
  await p.setExtraHTTPHeaders({'Accept-Language': 'en-US,en;q=0.9'});
  await p.setViewportSize({width: 1920, height: 1080});
  
  try {
    await p.goto('https://startupstash.com/', {waitUntil: 'networkidle', timeout: 45000});
    await p.waitForTimeout(5000);
    console.log('URL:', p.url());
    console.log('Title:', await p.title());
    
    // Check if we're blocked
    const content = await p.content();
    console.log('Content length:', content.length);
    
    // Try to find submit button
    const submitBtns = await p.locator('button, a').count();
    console.log('Total buttons/links:', submitBtns);
    
    // Look for specific submit elements
    const submitEls = await p.locator('a:has-text(Submit), a:has-text(Add), a:has-text(List), button:has-text(Submit), button:has-text(Add)').count();
    console.log('Submit-related elements:', submitEls);
    
    // Screenshot
    await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/startupstash_home2.png'});
    await p.close();
    console.log('Screenshot saved');
  } catch(e) {
    console.log('Error:', e.message.substring(0, 200));
  }
  
  await b.close();
}
main().catch(console.error);
