const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const b = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const p = await b.newPage();
  
  // Navigate to BetaList submit page
  console.log('Navigating to BetaList...');
  await p.goto('https://betalist.com/sign_in', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  
  console.log('Current URL:', p.url());
  console.log('Title:', await p.title());
  
  // Check if we're at login page
  const isLoginPage = p.url().includes('sign_in') || (await p.title()).includes('sign_in');
  console.log('Is login page:', isLoginPage);
  
  if (isLoginPage) {
    console.log('\n=== BetaList requires login ===');
    console.log('You need to sign in with Twitter/X account to submit.');
    console.log('Please manually complete the login, then let me know.');
    
    // Keep browser open for manual login
    await p.screenshot({ path: 'E:/一人公司/电子书格式转换站/docs/submissions/betalist_login.png' });
    console.log('Screenshot saved. Browser will stay open for 60 seconds...');
    
    // Wait for user to login manually
    await p.waitForTimeout(60000);
    
    console.log('After wait, URL:', p.url());
  }
  
  // Check if we're on submit page now
  if (!p.url().includes('sign_in')) {
    console.log('\n=== Logged in! Submitting... ===');
    
    // Fill the form
    await p.goto('https://betalist.com/submit', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('Submit page URL:', p.url());
    console.log('Title:', await p.title());
    
    // Wait for form to load
    await p.waitForTimeout(2000);
    
    // Fill form fields
    try {
      // Name
      const nameInput = p.locator('input[name=\"name\"], input[placeholder*=\"name\"], input[name*=\"name\"]');
      if (await nameInput.count() > 0) {
        await nameInput.fill('FreeBookConvert');
        console.log('Filled name');
      }
      
      // Tagline
      const taglineInput = p.locator('input[name=\"tagline\"], input[placeholder*=\"tagline\"], textarea[name*=\"tagline\"]');
      if (await taglineInput.count() > 0) {
        await taglineInput.fill('Free online ebook format converter — 28+ formats, no signup, no ads');
        console.log('Filled tagline');
      }
      
      // Description
      const descInput = p.locator('textarea[name=\"description\"], input[name=\"description\"]');
      if (await descInput.count() > 0) {
        await descInput.fill('FreeBookConvert is a free online ebook format converter that supports 28+ formats including EPUB, PDF, MOBI, AZW3, TXT, HTML, and more. Built with the powerful Calibre engine, it delivers fast, accurate conversions with no file size limits, no signup required, and zero ads. Perfect for readers, authors, and publishers who need reliable format conversion anytime, anywhere—straight from your browser.');
        console.log('Filled description');
      }
      
      // Website
      const urlInput = p.locator('input[name=\"url\"], input[name=\"website\"], input[placeholder*=\"url\"]');
      if (await urlInput.count() > 0) {
        await urlInput.fill((process.env.BOOKCONV_DOMAIN || 'https://yourdomain.com'));
        console.log('Filled URL');
      }
      
      // Category
      const categorySelect = p.locator('select[name=\"category\"], input[name*=\"category\"]');
      if (await categorySelect.count() > 0) {
        await categorySelect.selectOption('Books & Literature');
        console.log('Selected category');
      }
      
      // Upload logo
      const fileInput = p.locator('input[type=\"file\"]');
      if (await fileInput.count() > 0) {
        const logoPath = 'E:/一人公司/电子书格式转换站/docs/logo-beta-list-1200.png';
        await fileInput.setInputFiles(logoPath);
        console.log('Uploaded logo:', logoPath);
      }
      
      // Submit
      const submitBtn = p.locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), button:has-text(\"Looks good\")');
      if (await submitBtn.count() > 0) {
        console.log('Clicking submit...');
        await submitBtn.click();
        await p.waitForTimeout(5000);
        
        console.log('After submit URL:', p.url());
        console.log('After submit Title:', await p.title());
        
        // Check for success
        const content = await p.content();
        const hasSuccess = content.includes('success') || content.includes('submitted') || content.includes('added') || content.includes('thank you');
        const hasError = content.includes('error') || content.includes('failed') || content.includes('invalid');
        
        console.log('Has success:', hasSuccess);
        console.log('Has error:', hasError);
        
        await p.screenshot({ path: 'E:/一人公司/电子书格式转换站/docs/submissions/betalist_submit_result.png' });
        
        if (hasSuccess || !hasError) {
          console.log('\n=== SUBMISSION COMPLETE! ===');
        }
      }
    } catch(e) {
      console.log('Form fill error:', e.message);
    }
  }
  
  await b.close();
}

main().catch(console.error);
