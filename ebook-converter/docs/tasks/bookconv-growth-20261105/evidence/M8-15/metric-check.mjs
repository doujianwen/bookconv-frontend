import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'
const ROOT = path.resolve(import.meta.dirname, '..', '..')
const SA = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/gsc-service-account.json'), 'utf8'))
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url')
async function nf(url, init) {
  let last
  for (let i = 0; i < 5; i++) {
    try { return await fetch(url, init) } catch (e) {
      last = e
      if (/fetch failed|socket|reset|ECONNRESET/i.test(String(e) + String(e?.cause?.code))) { await new Promise(r => setTimeout(r, 700 * (i + 1))); continue }
      throw e
    }
  }
  throw last
}
const iat = Math.floor(Date.now() / 1000)
const u = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({ iss: SA.client_email, scope: 'https://www.googleapis.com/auth/analytics.readonly', aud: 'https://oauth2.googleapis.com/token', iat, exp: iat + 3600 })
const sig = crypto.createSign('RSA-SHA256').update(u).sign(SA.private_key, 'base64url')
const tr = await nf('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: u + '.' + sig }) })
const tj = await tr.json(); if (!tr.ok) throw new Error('token ' + JSON.stringify(tj).slice(0, 150))
const token = tj.access_token
const body = {
  dateRanges: [{ startDate: '2026-10-08', endDate: '2026-11-04' }],
  dimensions: [{ name: 'country' }],
  metrics: [{ name: 'activeUsers' }, { name: 'totalUsers' }, { name: 'sessions' }],
  limit: '50',
}
const res = await nf('https://analyticsdata.googleapis.com/v1beta/properties/547131052:runReport', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const j = await res.json(); if (!res.ok) throw new Error('GA4 ' + res.status + ' ' + JSON.stringify(j).slice(0, 200))
const dims = j.dimensionHeaders.map(h => h.name), mets = j.metricHeaders.map(h => h.name)
const rows = (j.rows || []).map(r => { const o = {}; dims.forEach((d, i) => o[d] = r.dimensionValues[i].value); mets.forEach((m, i) => o[m] = Number(r.metricValues[i].value)); return o })
console.log('=== country × {activeUsers,totalUsers,sessions} 独立复核 ===')
for (const r of rows) console.log(JSON.stringify(r))
fs.writeFileSync(path.join(import.meta.dirname, 'metric-check.json'), JSON.stringify({ fetchedAt: new Date().toISOString(), rows }, null, 2))
