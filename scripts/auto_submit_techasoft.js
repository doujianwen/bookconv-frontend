const https = require('https');
const http = require('http');
const fs = require('fs');
function postForm(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const query = Object.entries(data).map(([k,v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.request({
      hostname: u.hostname, path: u.pathname + (u.search || '') + '?' + query,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.end();
  });
}
async function main() {
  const DOMAIN = (process.env.BOOKCONV_DOMAIN || 'https://yourdomain.com');
  const TITLE = 'EbookConverter - Free Online Ebook Format Converter';
  const DESC = 'A free online ebook converter supporting 28+ formats. No signup, no limits, no ads.';
  const SITE_NAME = 'EbookConverter';
  const CONTACT_NAME = 'Founder';
  const CONTACT_EMAIL = (process.env.BOOKCONV_EMAIL || 'founder@yourdomain.com');
  
  const submitData = {
    lead_url: DOMAIN,
    enquiry: '1',
    contact_fname: CONTACT_NAME,
    contact_email: CONTACT_EMAIL,
    contact_phone: '',
    contact_message: SITE_NAME + ': ' + TITLE + '\n' + DESC + '\nURL: ' + DOMAIN
  };
  
  console.log('Testing TechAsoft auto-submission...');
  console.log('Data:', JSON.stringify(submitData, null, 2));
  
  try {
    const r = await postForm('https://www.techasoft.com/submit', submitData);
    console.log('Status:', r.status);
    console.log('Response length:', r.body.length);
    console.log('Response preview:', r.body.substring(0, 500));
    
    const results = {
      site: 'TechAsoft',
      url: 'https://www.techasoft.com/submit',
      method: 'GET',
      status: r.status,
      submitted_data: submitData,
      response_preview: r.body.substring(0, 300),
      success: r.status === 200
    };
    
    fs.mkdirSync('E:/一人公司/电子书格式转换站/docs/submissions', { recursive: true });
    fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/submissions/techasoft_submit_result.json', JSON.stringify(results, null, 2));
    console.log('\nResult saved to docs/submissions/techasoft_submit_result.json');
  } catch(e) {
    console.log('Error:', e.message);
  }
}
main().catch(console.error);
