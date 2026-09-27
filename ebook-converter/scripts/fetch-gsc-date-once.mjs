/**
 * fetch-gsc-date-once.mjs — one-off: GSC date-dimension rows (dimensions: []),
 * the authoritative baseline per VI/caliber rules. Reuses the same service account.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SA = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'gsc-service-account.json'), 'utf8'))

const base64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')

async function getAccessToken() {
  const iat = Math.floor(Date.now() / 1000)
  const unsigned =
    base64url({ alg: 'RS256', typ: 'JWT' }) +
    '.' +
    base64url({
      iss: SA.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat,
      exp: iat + 3600,
    })
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(SA.private_key, 'base64url')
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + sig }),
  })
  const json = await res.json()
  if (!json.access_token) throw new Error('token exchange failed: ' + JSON.stringify(json))
  return json.access_token
}

const DAYS = 14
const token = await getAccessToken()
const end = new Date(Date.now() - 2 * 864e5)
const start = new Date(end.getTime() - DAYS * 864e5)
const fmt = (d) => d.toISOString().slice(0, 10)
const startDate = fmt(start)
const endDate = fmt(end)

const url =
  'https://www.googleapis.com/webmasters/v3/sites/' +
  encodeURIComponent('https://www.bookconv.com/') +
  '/searchAnalytics/query'

const res = await fetch(url, {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
  body: JSON.stringify({ startDate, endDate, dimensions: ['date'], rowLimit: 25000, type: 'web' }),
})
const json = await res.json()
if (!res.ok) {
  console.error('API error ' + res.status + ': ' + JSON.stringify(json).slice(0, 400))
  process.exit(1)
}
const out = path.join(ROOT, '数据分析', 'GSC_API_date_2026-09-23.json')
fs.writeFileSync(out, JSON.stringify({ startDate, endDate, rows: json.rows || [] }, null, 2))
const rows = json.rows || []
const tc = rows.reduce((a, r) => a + (r.clicks || 0), 0)
const ti = rows.reduce((a, r) => a + (r.impressions || 0), 0)
console.log(`date rows=${rows.length} clicks=${tc} impressions=${ti} -> ${out}`)
