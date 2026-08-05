const https = require('https');
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: {'User-Agent': 'Mozilla/5.0'} }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({s: res.statusCode, b: d}));
    }).on('error', reject);
  });
}
async function main() {
  // Get PRLog homepage and find all links
  const r = await get('https://www.prlog.org/');
  console.log('Status:', r.s);
  const allLinks = r.b.match(/href=["']([^"']*)["']/gi) || [];
  const submitLinks = allLinks.filter(l => l.toLowerCase().includes('submit') || l.toLowerCase().includes('press') || l.toLowerCase().includes('release'));
  console.log('\nAll submit/release links:');
  submitLinks.slice(0,10).forEach(l => console.log('  ' + l));
  
  // Check for the actual submission form
  const formActions = r.b.match(/<form[^>]*action=["']([^"']*)["']/gi) || [];
  console.log('\nForm actions:');
  formActions.forEach(f => console.log('  ' + f));
  
  // Check for textarea (press release content field)
  const textareas = r.b.match(/<textarea[^>]*>/gi) || [];
  console.log('\nTextareas:', textareas.length);
  
  // Check for input fields
  const inputs = r.b.match(/<input[^>]*>/gi) || [];
  console.log('Inputs:', inputs.length);
  inputs.slice(0,10).forEach(i => console.log('  ' + i.substring(0,100)));
}
main().catch(console.error);
