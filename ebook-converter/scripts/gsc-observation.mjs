#!/usr/bin/env node
// Read-only, append-only evidence for the original 117 URL cohort.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { inspectionSummary, observationWindows, shiftDay } from './lib/gsc-observation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const plan = JSON.parse(fs.readFileSync(path.join(root, 'docs/gsc-index-audit-2026-11-01/observation-plan.json'), 'utf8'));
const outRoot = path.join(root, '_wb_tmp/gsc-observation');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(outRoot, stamp);
fs.mkdirSync(outDir, { recursive: true });
const save = (name, data) => fs.writeFileSync(path.join(outDir, name), JSON.stringify(data, null, 2), { flag: 'wx' });
const urls = [...new Set(plan.urls)];
if (urls.length !== 117 || urls.some(u => !u.startsWith(plan.site))) throw new Error('Invalid fixed URL cohort');
const sa = JSON.parse(fs.readFileSync(path.join(root, 'scripts/gsc-service-account.json'), 'utf8'));
const b64 = data => Buffer.from(JSON.stringify(data)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;

async function main() {
  const auth = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${crypto.createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url')}` }), signal: AbortSignal.timeout(20000) });
  const token = await auth.json();
  if (!auth.ok || !token.access_token) throw new Error(`Authentication HTTP ${auth.status}`);
  const headers = { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' };
  async function post(url, body) {
    const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
    const data = await r.json();
    if ([401, 403, 429].includes(r.status)) throw new Error(`API authorization/quota HTTP ${r.status}`);
    return { http: r.status, data };
  }
  const rows = [];
  let cursor = 0;
  async function worker() {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      try {
        const r = await post('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { inspectionUrl: url, siteUrl: plan.site, languageCode: 'en-US' });
        rows.push({ url, checkedAt: new Date().toISOString(), http: r.http, ...r.data });
      } catch (e) {
        rows.push({ url, http: 0, error: e.message });
        if (/authorization\/quota/.test(e.message)) throw e;
      }
    }
  }
  try { await Promise.all([worker(), worker(), worker()]); }
  finally { save('inspection.json', rows); }
  const previousDirs = fs.readdirSync(outRoot).filter(d => d !== stamp && fs.existsSync(path.join(outRoot, d, 'inspection.json'))).sort();
  const previous = previousDirs.length ? JSON.parse(fs.readFileSync(path.join(outRoot, previousDirs.at(-1), 'inspection.json'), 'utf8')) : [];
  const ptToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const availableThrough = shiftDay(ptToday, -3); // conservative lag; API final state still controls readiness
  const windows = observationWindows(plan, availableThrough);
  const searchUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(plan.site)}/searchAnalytics/query`;
  async function query(startDate, endDate, dimensions) {
    const all = [];
    for (let startRow = 0; startRow < 250000; startRow += 25000) {
      const r = await post(searchUrl, { startDate, endDate, dimensions, type: 'web', dataState: 'final', rowLimit: 25000, startRow });
      if (r.http !== 200) throw new Error(`Search Analytics HTTP ${r.http}`);
      const page = r.data.rows || [];
      all.push(...page);
      if (page.length < 25000) return { startDate, endDate, dimensions, rows: all, paginationComplete: true, caveat: 'GSC returns top rows; pagination does not establish complete search demand. Missing dates are not filled as zero.' };
    }
    throw new Error('Search Analytics pagination bound reached');
  }
  // Preserve all baseline windows, even when final dates are not yet available.
  const performance = [];
  for (const w of windows) {
    const periods = [{ label: 'pre', start: w.preStart, end: w.preEnd }];
    if (w.performanceWindowElapsed) periods.push({ label: 'post', start: w.start, end: w.end });
    for (const period of periods) {
      const daily = await query(period.start, period.end, ['date']);
      const pages = await query(period.start, period.end, ['page']);
      const queries = await query(period.start, period.end, ['query', 'page']);
      performance.push({ days: w.days, period: period.label, daily, cohortPages: { ...pages, rows: pages.rows.filter(r => urls.includes(r.keys[0])) }, queryPages: { ...queries, rows: queries.rows.filter(r => urls.includes(r.keys[1])) }, datesReported: daily.rows.map(r => r.keys[0]).sort(), note: 'Site daily dates indicate reporting availability; missing dates remain ambiguous. Query rows omit anonymized terms. Do not infer zero or causality.' });
    }
  }
  save('performance.json', performance);
  const summary = { checkedAt: new Date().toISOString(), cohortSha256: crypto.createHash('sha256').update(urls.join('\n')).digest('hex'), availableThrough, windows, inspection: inspectionSummary(rows, previous), previousSnapshot: previousDirs.at(-1) || null };
  save('summary.json', summary);
  console.log(JSON.stringify({ output: outDir, ...summary }, null, 2));
}
main().catch(e => { save('failure.json', { at: new Date().toISOString(), message: e.message }); console.error(e.message); process.exitCode = 1; });
