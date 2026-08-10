const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const p = await b.newPage();
  
  await p.goto('https://www.futuretools.io/submit-a-tool', {waitUntil: 'domcontentloaded', timeout: 20000});
  await p.waitForTimeout(2000);
  console.log('URL:', p.url());
  console.log('Title:', await p.title());
  
  // Fill form fields
  await p.locator('input[name=\"submitter_name\"]').fill('EbookConverter Founder');
  await p.locator('input[name=\"tool_name\"]').fill('EbookConverter');
  await p.locator('input[name=\"tool_url\"]').fill((process.env.BOOKCONV_DOMAIN || 'https://yourdomain.com'));
  await p.locator('textarea[name=\"description\"]').fill('A free online ebook converter supporting 28+ formats including epub, pdf, mobi, azw3, txt, html. No signup required, no limits, no ads. Built with Calibre engine.');
  await p.locator('input[name=\"submitter_email\"]').fill((process.env.BOOKCONV_EMAIL || 'founder@yourdomain.com'));
  
  // Select category
  const catSelect = p.locator('select[name=\"category\"]');
  if (await catSelect.count() > 0) {
    await catSelect.selectOption({label: 'Software'});
    console.log('Selected category');
  }
  
  // Select pricing
  const pricingOptions = p.locator('input[name=\"pricing_tier\"]');
  if (await pricingOptions.count() > 0) {
    await pricingOptions.first().check();
    console.log('Selected pricing');
  }
  
  // Submit
  console.log('Submitting...');
  await p.locator('button[type=submit], input[type=submit]').click();
  await p.waitForTimeout(3000);
  
  console.log('After submit URL:', p.url());
  console.log('After submit Title:', await p.title());
  
  const content = await p.content();
  const hasSuccess = content.includes('success') || content.includes('added') || content.includes('thank');
  console.log('Success:', hasSuccess);
  console.log('Content length:', content.length);
  
  await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/futuretools_result.png'});
  await p.close();
  await b.close();
  console.log('Done');
}
main().catch(console.error);
