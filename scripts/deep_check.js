const https = require('https');
const http = require('http');
const fs = require('fs');
const { URL } = require('url');

function get(url, timeout = 12000) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.get({hostname: u.hostname, path: u.pathname + u.search, timeout}, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers, finalUrl: res.responseUrl || url }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function getFull(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    function follow(u, count) {
      if (count > maxRedirects) return reject(new Error('too many redirects'));
      get(u, 10000).then(r => {
        if (r.status >= 300 && r.status < 400 && r.headers.location) {
          const next = new URL(r.headers.location, u).toString();
          console.log('  Redirect: ' + u + ' -> ' + next);
          follow(next, count + 1);
        } else {
          resolve(r);
        }
      }).catch(reject);
    }
    follow(url, 0);
  });
}

async function main() {
  const outDir = 'E:/一人公司/电子书格式转换站/docs/submissions';
  fs.mkdirSync(outDir, { recursive: true });

  // PRLog deep check
  console.log('=== PRLog Submit Page Deep Check ===');
  try {
    const r = await getFull('https://www.prlog.org/submit-free-press-release.html');
    console.log('Final status:', r.status, 'URL:', r.finalUrl);
    console.log('Body length:', r.body.length);
    
    // Look for any form with action containing submit
    const forms = r.body.match(/<form[^>]*>/gi) || [];
    console.log('All forms:', forms.length);
    forms.forEach((f, i) => {
      const action = f.match(/action=[\"']([^\"']*)[\"']/i);
      console.log('Form ' + i + ' action:', action ? action[1] : 'none');
      console.log('  ', f.substring(0, 300));
    });
    
    // Look for the actual submission form
    const allInputs = r.body.match(/<input[^>]*>/gi) || [];
    console.log('\nAll inputs:', allInputs.length);
    allInputs.forEach((inp, i) => {
      const name = inp.match(/name=[\"']([^\"']*)[\"']/i);
      const type = inp.match(/type=[\"']([^\"']*)[\"']/i);
      console.log('Input ' + i + ': type=' + (type ? type[1] : 'unknown') + ' name=' + (name ? name[1] : 'none'));
    });
    
    // Check for iframe or embedded content
    const iframes = r.body.match(/<iframe[^>]*>/gi) || [];
    console.log('\nIframes:', iframes.length, iframes.join('\n'));
    
    // Check the body content for clues
    const bodyText = r.body.substring(0, 2000);
    console.log('\nBody preview:', bodyText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    
  } catch(e) {
    console.log('PRLog error:', e.message);
  }
  
  // Check SubmitSaaS
  console.log('\n\n=== SubmitSaaS ===');
  try {
    const r = await getFull('https://submitsaas.com/');
    console.log('Status:', r.status);
    const forms = r.body.match(/<form[^>]*>/gi) || [];
    console.log('Forms:', forms.length);
    forms.forEach((f, i) => console.log('Form ' + i + ':', f.substring(0, 300)));
    
    // Check for modal or JS-based submit
    const submitBtns = r.body.match(/<button[^>]*>.*?submit.*?<\/button>/gi) || [];
    console.log('Submit buttons:', submitBtns.length);
    
    // Check the body for structure
    console.log('Body length:', r.body.length);
    console.log('Has /submit:', r.body.includes('/submit'));
    console.log('Has /add:', r.body.includes('/add'));
    console.log('Has class=submit:', r.body.toLowerCase().includes('class=\"submit\"'));
    
    // Look for JS that handles submission
    const scripts = r.body.match(/<script[^>]*src=[\"']([^\"']*)[\"']/gi) || [];
    console.log('External scripts:', scripts.slice(0, 5).join('\n'));
  } catch(e) {
    console.log('SubmitSaaS error:', e.message);
  }
  
  // Check StartupStash
  console.log('\n\n=== StartupStash ===');
  try {
    const r = await getFull('https://startupstash.com/');
    console.log('Status:', r.status);
    const forms = r.body.match(/<form[^>]*>/gi) || [];
    console.log('Forms:', forms.length);
    forms.forEach((f, i) => {
      const action = f.match(/action=[\"']([^\"']*)[\"']/i);
      console.log('Form ' + i + ' action:', action ? action[1] : 'inline');
      console.log('  ', f.substring(0, 300));
    });
    const fields = r.body.match(/name=[\"']([^\"']*)[\"']/g) || [];
    console.log('Fields:', [...new Set(fields)].slice(0, 20).join(', '));
    const hidden = r.body.match(/type=[\"']hidden[\"']/gi) || [];
    console.log('Hidden inputs:', hidden.length);
  } catch(e) {
    console.log('StartupStash error:', e.message);
  }
}

main().catch(console.error);
