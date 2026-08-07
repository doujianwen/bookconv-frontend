const https = require('https');
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'} }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers }));
    }).on('error', reject);
  });
}
async function main() {
  // TechAsoft submit page
  console.log('=== TechAsoft /submit ===');
  const r1 = await get('https://www.techasoft.com/submit');
  console.log('Status:', r1.status);
  console.log('Body length:', r1.body.length);
  
  // Extract form fields
  const inputs = r1.body.match(/name=[\"']([^\"']*)[\"']/g) || [];
  console.log('Field names:', [...new Set(inputs)].join('\n  '));
  
  const textareas = r1.body.match(/<textarea[^>]*>/gi) || [];
  console.log('Textareas:', textareas.length, textareas.join('\n  '));
  
  const selects = r1.body.match(/<select[^>]*>[\s\S]*?<\/select>/gi) || [];
  console.log('Selects:', selects.length);
  selects.forEach((s, i) => console.log('Select ' + i + ':', s.substring(0, 200)));
  
  // Also check /add-listing
  console.log('\n=== TechAsoft /add-listing ===');
  const r2 = await get('https://www.techasoft.com/add-listing');
  console.log('Status:', r2.status);
  const inputs2 = r2.body.match(/name=[\"']([^\"']*)[\"']/g) || [];
  console.log('Field names:', [...new Set(inputs2)].join('\n  '));
  const tas2 = r2.body.match(/<textarea[^>]*>/gi) || [];
  console.log('Textareas:', tas2.length, tas2.join('\n  '));
  
  // BacklinkCRM
  console.log('\n=== BacklinkCRM /add ===');
  const r3 = await get('https://backlinkcrm.io/add');
  console.log('Status:', r3.status);
  const inputs3 = r3.body.match(/name=[\"']([^\"']*)[\"']/g) || [];
  console.log('Field names:', [...new Set(inputs3)].join('\n  '));
  const tas3 = r3.body.match(/<textarea[^>]*>/gi) || [];
  console.log('Textareas:', tas3.length, tas3.join('\n  '));
  
  // SaaSPedia /add
  console.log('\n=== SaaSPedia /add ===');
  const r4 = await get('https://saaspedia.io/add');
  console.log('Status:', r4.status);
  const inputs4 = r4.body.match(/name=[\"']([^\"']*)[\"']/g) || [];
  console.log('Field names:', [...new Set(inputs4)].join('\n  '));
}
main().catch(console.error);
