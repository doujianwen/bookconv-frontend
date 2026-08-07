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
  // Check more sites for submission pages
  const tests = [
    ['SubmitCube', 'https://www.submitcube.com/'],
    ['SubmitCube2', 'https://www.submitcube.com/submit'],
    ['GetLeadWave', 'https://getleadwave.io/'],
    ['GrowPad', 'https://growpad.pro/'],
    ['EffortlessBL', 'https://www.effortlessbacklinks.com/'],
    ['SerpMaestro', 'https://serpmaestro.com/'],
    ['StartupSauce', 'https://www.startupsauce.com/'],
  ];
  for (const [name, url] of tests) {
    try {
      const r = await get(url);
      const forms = r.body.match(/<form[^>]*>/gi) || [];
      const inputs = r.body.match(/name=[\"']([^\"']*)[\"']/g) || [];
      const uniqueInputs = [...new Set(inputs)];
      const textareas = r.body.match(/<textarea[^>]*>/gi) || [];
      console.log(name + ': ' + r.status + ' forms=' + forms.length + ' fields=' + uniqueInputs.length + ' ta=' + textareas.length);
      if (uniqueInputs.length > 0) console.log('  Fields: ' + uniqueInputs.slice(0, 10).join(', '));
      if (textareas.length > 0) console.log('  Textareas: ' + textareas.slice(0, 3).join('\n  '));
    } catch(e) {
      console.log(name + ': ERROR ' + e.message);
    }
  }
}
main().catch(console.error);
