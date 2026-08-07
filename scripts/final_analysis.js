const https = require('https');
const http = require('http');
const fs = require('fs');
function get(url, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const parts = url.match(/^https?:\/\/([^\/]+)(\/.*)$/);
    if (!parts) return reject(new Error('bad url'));
    const mod = url.startsWith('https:') ? https : http;
    const req = mod.get({hostname: parts[1], path: parts[2], timeout}, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}
async function main() {
  const results = { auto_submit: [], manual_only: [], blocked: [], no_info: [] };
  
  // TechAsoft
  const ta = await get('https://www.techasoft.com/submit');
  results.auto_submit.push({
    name: 'TechAsoft',
    url: 'https://www.techasoft.com/submit',
    type: 'contact_form_with_lead_url',
    status: ta.status,
    fields: ['lead_url', 'contact_fname', 'contact_email', 'contact_phone', 'contact_message', 'enquiry'],
    method: 'GET',
    csrf: false,
    note: 'Contact form with lead_url. No CSRF. Can submit via GET.'
  });
  
  // PRLog - no API
  results.manual_only.push({
    name: 'PRLog',
    url: 'https://www.prlog.org/submit-free-press-release.html',
    type: 'js_rendered_form',
    note: 'Submit form is JS-rendered. No public API. All /api/* return 301.'
  });
  
  // StartupStash - 403
  const ss = await get('https://startupstash.com/');
  results.blocked.push({
    name: 'StartupStash',
    url: 'https://startupstash.com/',
    type: 'blocked_403',
    status: ss.status,
    note: 'Returns 403. Needs full browser session with proper headers.'
  });
  
  // Write report
  const report = '# Auto-Submit Feasibility Report\n\n' +
    '## Auto-Submit Candidates (1)\n\n' +
    '| Site | URL | Method | Fields | CSRF |\n' +
    '|------|-----|--------|--------|------|\n' +
    '| TechAsoft | https://www.techasoft.com/submit | GET | lead_url, contact_fname, contact_email, contact_message | No |\n\n' +
    '## Manual Only (7)\n\n' +
    '| Site | URL | Reason |\n' +
    '|------|-----|--------|\n' +
    '| PRLog | https://www.prlog.org/ | JS-rendered form, no API |\n' +
    '| SubmitSaaS | https://submitsaas.com/ | No form, link-based |\n' +
    '| SubmitCube | https://www.submitcube.com/ | No form, link-based |\n' +
    '| GetLeadWave | https://getleadwave.io/ | No form, link-based |\n' +
    '| SaaSPedia | https://saaspedia.io/ | Contact forms only |\n' +
    '| BacklinkCRM | https://backlinkcrm.io/ | Contact forms only |\n' +
    '| LinkDr | https://linkdr.com/ | Needs investigation |\n\n' +
    '## Blocked (1)\n\n' +
    '| Site | URL | Status | Note |\n' +
    '|------|-----|--------|------|\n' +
    '| StartupStash | https://startupstash.com/ | 403 | CDN-protected, needs browser automation |\n\n' +
    '## PRLog API Test Results\n\n' +
    'All API endpoints return 301 redirects:\n' +
    '- /api/1/ -> /news/tag/api-1/\n' +
    '- /api/1/submit -> /news/tag/api-1-submit/\n' +
    '- No public submission API exists.\n\n' +
    '## Conclusion\n\n' +
    'Only TechAsoft can be auto-submitted (contact form). All others require manual submission or browser automation.';
  
  fs.mkdirSync('E:/一人公司/电子书格式转换站/docs/submissions', { recursive: true });
  fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/submissions/auto_submit_report.md', report);
  fs.writeFileSync('E:/一人公司/电子书格式转换站/docs/submissions/site_analysis.json', JSON.stringify(results, null, 2));
  console.log(report);
  console.log('\nReport saved to docs/submissions/');
}
main().catch(console.error);
