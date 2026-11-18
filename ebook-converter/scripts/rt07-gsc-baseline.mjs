// RT07: GSC pre-launch baseline for M14-1 page (read-only, 7-day window).
// Window: 2026-11-10 ~ 2026-11-16 (7 days before deploy 2026-11-17 08:06 +08:00).
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..', '..', '..')
const SA = JSON.parse(fs.readFileSync(path.join(__dirname, 'gsc-service-account.json'), 'utf8'))
const SITE = process.env.GSC_SITE_URL || 'https://www.bookconv.com/'

const base64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
async function getAccessToken() {
  const iat = Math.floor(Date.now() / 1000)
  const unsigned =
    base64url({ alg: 'RS256', typ: 'JWT' }) +
    '.' +
    base64url({ iss: SA.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat, exp: iat + 3600 })
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(SA.private_key, 'base64url')
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${encodeURIComponent(unsigned + '.' + sig)}`,
  })
  const j = await res.json()
  if (!j.access_token) throw new Error('token failed: ' + JSON.stringify(j).slice(0, 300))
  return j.access_token
}

async function gscQuery(token, body) {
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const j = await res.json()
  if (j.error) throw new Error('GSC API error: ' + JSON.stringify(j.error).slice(0, 300))
  return j
}

const START = '2026-11-10'
const END = '2026-11-16'
const PAGE = 'https://www.bookconv.com/guide/how-to-read-epub-on-kindle'
const KINDLE_Q = 'can kindle read epub'

const token = await getAccessToken()
const out = { site: SITE, windowStart: START, windowEnd: END, fetchedAt: new Date().toISOString(), page: PAGE, queries: {} }

// A: page-level daily rows (7 days)
out.pageDaily = (await gscQuery(token, {
  startDate: START, endDate: END, dimensions: ['date'], rowLimit: 25000, type: 'web',
  dimensionFilterGroups: [{ filters: [{ dimension: 'page', expression: PAGE }] }],
})).rows || []

// B: page-level totals
out.pageTotals = (await gscQuery(token, {
  startDate: START, endDate: END, dimensions: ['page'], rowLimit: 10, type: 'web',
  dimensionFilterGroups: [{ filters: [{ dimension: 'page', expression: PAGE }] }],
})).rows || []

// C: target keyword daily rows
out.targetQueryDaily = (await gscQuery(token, {
  startDate: START, endDate: END, dimensions: ['date'], rowLimit: 25000, type: 'web',
  dimensionFilterGroups: [{ filters: [{ dimension: 'query', expression: KINDLE_Q }] }],
})).rows || []

// D: site-level daily totals (context)
out.siteDaily = (await gscQuery(token, {
  startDate: START, endDate: END, dimensions: ['date'], rowLimit: 25000, type: 'web',
})).rows || []

fs.writeFileSync(path.join(__dirname, 'rt07-gsc-baseline-raw.json'), JSON.stringify(out, null, 2))
console.log('OK window', START, '~', END, 'site:', SITE)
console.log('pageDaily rows:', out.pageDaily.length)
console.log('pageTotals:', JSON.stringify(out.pageTotals))
console.log('targetQueryDaily rows:', out.targetQueryDaily.length, JSON.stringify(out.targetQueryDaily))
const siteSum = out.siteDaily.reduce((a, r) => ({ clicks: a.clicks + (r.clicks || 0), impressions: a.impressions + (r.impressions || 0) }), { clicks: 0, impressions: 0 })
console.log('site 7d totals:', JSON.stringify(siteSum))
