const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const p = await b.newPage();
  
  await p.goto('https://www.futuretools.io/submit-a-tool', {waitUntil: 'domcontentloaded', timeout: 20000});
  await p.waitForTimeout(2000);
  console.log('URL:', p.url());
  console.log('Title:', await p.title());
  
  // Get all form fields
  const allInputs = await p.locator('input, textarea, select').all();
  console.log('Total inputs:', allInputs.length);
  
  // Fill the form
  await p.locator('input[name=\"submitter_name\"]').fill('EbookConverter Founder');
  await p.locator('input[name=\"tool_name\"]').fill('EbookConverter');
  await p.locator('input[name=\"tool_url\"]').fill((process.env.BOOKCONV_DOMAIN || 'https://yourdomain.com'));
  await p.locator('textarea[name=\"description\"]').fill('A free online ebook converter supporting 28+ formats including epub, pdf, mobi, azw3, txt, html. No signup required, no limits, no ads.');
  await p.locator('input[name=\"submitter_email\"]').fill((process.env.BOOKCONV_EMAIL || 'founder@yourdomain.com'));
  
  // Try to select category
  const catSelect = p.locator('select[name=\"category\"]');
  if (await catSelect.count() > 0) {
    await catSelect.selectOption({label: 'Software'});
    console.log('Selected category: Software');
  }
  
  // Try to select pricing tier
  const pricingOptions = p.locator('input[name=\"pricing_tier\"]');
  const pricingCount = await pricingOptions.count();
  console.log('Pricing options:', pricingCount);
  if (pricingCount > 0) {
    await pricingOptions.first().check();
    console.log('Selected first pricing option');
  }
  
  // Find and click submit button
  const submitBtn = p.locator('button[type=submit], input[type=submit]');
  if (await submitBtn.count() > 0) {
    console.log('Submitting...');
    await submitBtn.click();
    await p.waitForTimeout(3000);
    
    console.log('After submit URL:', p.url());
    console.log('After submit Title:', await p.title());
    
    const content = await p.content();
    const hasSuccess = content.includes('success') || content.includes('added') || content.includes('thank') || content.includes('confirm') || content.includes('submitted');
    const hasError = content.includes('error') || content.includes('invalid') || content.includes('failed');
    
    console.log('Has success:', hasSuccess);
    console.log('Has error:', hasError);
    
    await p.screenshot({path: 'E:/一人公司/电子书格式转换站/docs/submissions/futuretools_submit_result.png'});
    
    if (hasSuccess) {
      console.log('\n=== SUBMISSION SUCCESSFUL! ===');
    } else if (hasError) {
      console.log('\n=== SUBMISSION ERROR ===');
    } else {
      console.log('\n=== UNKNOWN RESULT ===');
    }
  } else {
    console.log('No submit button found');
  }
  
  await p.close();
  await b.close();
}
main().catch(console.error);
