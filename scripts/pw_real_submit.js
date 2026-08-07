const {chromium} = require('playwright');
const fs = require('fs');
async function main() {
  const b = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const submitted = [];
  
  // Test sites with real submission forms
  const tests = [
    {
      name: 'ActiveSearch',
      url: 'https://www.activesearchresults.com/addwebsite.php',
      fields: {url: 'https://yourdomain.com', email: 'founder@yourdomain.com'},
      submitSelector: 'input[name=submiturl]'
    },
    {
      name: 'FutureTools',
      url: 'https://futuretools.io/submit',
      fields: {company: 'EbookConverter', email: 'founder@yourdomain.com'},
      submitSelector: 'input[type=submit]'
    },
  ];
  
  for (const t of tests) {
    try {
      const p = await b.newPage();
      await p.goto(t.url, {waitUntil: 'domcontentloaded', timeout: 20000});
      await p.waitForTimeout(1500);
      
      // Fill form fields
      for (const [name, value] of Object.entries(t.fields)) {
        const input = p.locator('input[name=\"' + name + '\"]');
        if (await input.count() > 0) {
          await input.fill(value);
          console.log(t.name + ': filled ' + name);
        }
      }
      
      // Submit
      const submitBtn = p.locator(t.submitSelector);
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await p.waitForTimeout(3000);
        
        const newUrl = p.url();
        const title = await p.title();
        console.log(t.name + ': submitted! URL=' + newUrl + ' Title=' + title);
        
        const content = await p.content();
        const hasSuccess = content.includes('success') || content.includes('added') || content.includes('thank') || content.includes('confirm');
        const hasError = content.includes('error') || content.includes('invalid');
        
        submitted.push({
          name: t.name,
          originalUrl: t.url,
          finalUrl: newUrl,
          title: title,
          success: hasSuccess,
          error: hasError
        });
      } else {
        console.log(t.name + ': no submit button found');
        submitted.push({name: t.name, error: 'no submit button'});
      }
      
      await p.close();
    } catch(e) {
      console.log(t.name + ': ERROR ' + e.message.substring(0, 100));
      submitted.push({name: t.name, error: e.message.substring(0, 100)});
    }
  }
  
  await b.close();
  fs.mkdirSync('E:/一人公司/电子书格式转换站/docs/submissions', {recursive: true});
  fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/submissions/actual_submissions.json', JSON.stringify(submitted, null, 2));
  console.log('\nResults:');
  submitted.forEach(s => console.log('  ' + s.name + ': ' + (s.success ? 'SUCCESS' : s.error || 'unknown')));
}
main().catch(console.error);
