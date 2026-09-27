/**
 * fetch-gsc-webmaster.mjs — Pull Google Search Console data via service account.
 *
 * Why this exists:
 *   GSC has no CSV-export automation, and the local snapshots under
 *   bookconv_data_asset/google/ are stale (latest 2026-09-06). This script
 *   pulls live data so Bing-vs-Google comparisons run on aligned windows.
 *
 * Auth: service account JWT (RS256) signed with Node's built-in crypto.
 *   No `googleapis` / `google-auth-library` dependency needed.
 *   Credential: scripts/gsc-service-account.json  (git-tracked, it is a
 *   service-account key with readonly scope — do NOT swap in a broader key)
 *
 * Usage:
 *   node scripts/fetch-gsc-webmaster.mjs
 *   node scripts/fetch-gsc-webmaster.mjs --days 90
 *   node scripts/fetch-gsc-webmaster.mjs --dimension page
 *
 * Output: 数据分析/GSC_API_<Dimension>_<endDate>.json
 *
 * Known limits:
 *   - GSC data lags ~2 days; script defaults endDate to today-2.
 *   - rowLimit max 25000 per request. This script does NOT paginate; if
 *     rows === rowLimit, raise it or add pagination before trusting totals.
 *   - Only web searchType. Discover/News not covered.
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const DEFAULT_SITE = 'https://www.bookconv.com/'
const SA_PATH = path.join(ROOT, 'scripts', 'gsc-service-account.json')

function argOf(flag, fallback) {
  const i = process.argv.indexOf(flag)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

const SITE = argOf('--site', DEFAULT_SITE)
const DAYS = Number(argOf('--days', '30'))
const DIMENSION = argOf('--dimension', 'query') // query | page | country | device

if (!fs.existsSync(SA_PATH)) {
  console.error(`Missing service account: ${SA_PATH}`)
  process.exit(1)
}
const SA = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))

function base64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url')
}

/** Exchange a signed JWT for an OAuth2 access token (2-legged / server flow). */
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
  const sig = crypto
    .createSign('RSA-SHA256')
    .update(unsigned)
    .sign(SA.private_key, 'base64url')

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: unsigned + '.' + sig,
    }),
  })
  const json = await res.json()
  if (!json.access_token) {
    throw new Error(`token exchange failed: ${JSON.stringify(json)}`)
  }
  return json.access_token
}

async function main() {
  const token = await getAccessToken()
  // GSC publishes with ~2 day lag; asking for today returns an empty tail.
  const end = new Date(Date.now() - 2 * 864e5)
  const start = new Date(end.getTime() - DAYS * 864e5)
  const fmt = (d) => d.toISOString().slice(0, 10)
  const startDate = fmt(start)
  const endDate = fmt(end)

  console.log(`site : ${SITE}`)
  console.log(`window: ${startDate} -> ${endDate} (${DAYS}d, GSC 2-day lag applied)`)
  console.log(`dim   : ${DIMENSION}`)

  const url =
    'https://www.googleapis.com/webmasters/v3/sites/' +
    encodeURIComponent(SITE) +
    '/searchAnalytics/query'

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: [DIMENSION],
      rowLimit: 25000,
      type: 'web',
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    console.error(`API error ${res.status}: ${JSON.stringify(json).slice(0, 400)}`)
    process.exit(1)
  }

  const rows = json.rows || []
  const ROW_LIMIT = 25000
  if (rows.length >= ROW_LIMIT) {
    console.warn(
      `WARN: rows hit rowLimit (${ROW_LIMIT}). Totals are truncated — add pagination.`
    )
  }

  const totClicks = rows.reduce((a, r) => a + (r.clicks || 0), 0)
  const totImpr = rows.reduce((a, r) => a + (r.impressions || 0), 0)
  console.log(`rows=${rows.length} clicks=${totClicks} impressions=${totImpr}`)

  const outDir = path.join(ROOT, '数据分析')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, `GSC_API_${DIMENSION}_${endDate}.json`)
  fs.writeFileSync(outFile, JSON.stringify({ startDate, endDate, rows }, null, 2))
  console.log(`wrote: ${outFile}`)
}

main().catch((e) => {
  console.error('FAILED:', e.message)
  process.exit(1)
})
