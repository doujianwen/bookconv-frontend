// RT-OPS: GSC observation for M14-1 (window 11-10 ~ 11-17, checks for post-launch rows).
// Derived from scripts/rt07-gsc-baseline.mjs (same auth, extended end date). Read-only.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
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
const END = '2026-11-17'
const PAGE = 'https://www.bookconv.com/guide/how-to-read-epub-on-kindle'
const KINDLE_Q = 'can kindle read epub'

const token = await getAccessToken()
const out = { site: SITE, windowStart: START, windowEnd: END, fetchedAt: new Date().toISOString(), page: PAGE, note: 'BC-OPS-20261118 M14-1 observation pull' }

out.pageDaily = (await gscQuery(token, {
  startDate: START, endDate: END, dimensions: ['date'], rowLimit: 25000, type: 'web',
  dimensionFilterGroups: [{ filters: [{ dimension: 'page', expression: PAGE }] }],
})).rows || []

out.targetQueryDaily = (await gscQuery(token, {
  startDate: START, endDate: END, dimensions: ['date'], rowLimit: 25000, type: 'web',
  dimensionFilterGroups: [{ filters: [{ dimension: 'query', expression: KINDLE_Q }] }],
})).rows || []

out.targetQueryTop = (await gscQuery(token, {
  startDate: START, endDate: END, dimensions: ['query'], rowLimit: 25, type: 'web',
  dimensionFilterGroups: [{ filters: [{ dimension: 'page', expression: PAGE }] }],
})).rows || []

out.siteDaily = (await gscQuery(token, {
  startDate: START, endDate: END, dimensions: ['date'], rowLimit: 25000, type: 'web',
})).rows || []

const outPath = path.join(__dirname, '..', 'docs', 'tasks', 'bookconv-ops-20261118', 'evidence', 'rt05-gsc-observe-1117.json')
fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
console.log('OK window', START, '~', END)
console.log('pageDaily:', JSON.stringify(out.pageDaily))
console.log('targetQueryDaily:', JSON.stringify(out.targetQueryDaily))
console.log('page top queries:', JSON.stringify(out.targetQueryTop))
console.log('siteDaily tail:', JSON.stringify(out.siteDaily.slice(-4)))
