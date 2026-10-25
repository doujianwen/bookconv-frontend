/**
 * fetch-gsc-query-once.mjs — one-off: GSC query-dimension rows.
 *
 * 目的：用真实查询数据核对 SEMrush 搜索量估算的偏差倍数。
 * 复用 scripts/gsc-service-account.json 服务账号。
 *
 * 输出：
 *   数据分析/GSC_query_2026-10-25.json         dimensions: ['query']
 *   数据分析/GSC_query_page_2026-10-25.json    dimensions: ['query','page']
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
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: unsigned + '.' + sig,
    }),
  })
  const json = await res.json()
  if (!json.access_token) throw new Error('token exchange failed: ' + JSON.stringify(json))
  return json.access_token
}

const DAYS = 90
const end = new Date(Date.now() - 2 * 864e5)
const start = new Date(end.getTime() - DAYS * 864e5)
const fmt = (d) => d.toISOString().slice(0, 10)
const startDate = fmt(start)
const endDate = fmt(end)

const SITE = 'https://www.bookconv.com/'
const API =
  'https://www.googleapis.com/webmasters/v3/sites/' +
  encodeURIComponent(SITE) +
  '/searchAnalytics/query'

async function query(token, dimensions, outName) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate, endDate, dimensions, rowLimit: 25000, type: 'web' }),
  })
  const json = await res.json()
  if (!res.ok) {
    console.error(`[${outName}] API error ${res.status}: ` + JSON.stringify(json).slice(0, 400))
    return null
  }
  const rows = json.rows || []
  const out = path.join(ROOT, '数据分析', outName)
  fs.writeFileSync(out, JSON.stringify({ startDate, endDate, dimensions, rows }, null, 2))
  const tc = rows.reduce((a, r) => a + (r.clicks || 0), 0)
  const ti = rows.reduce((a, r) => a + (r.impressions || 0), 0)
  console.log(`[${outName}] rows=${rows.length} clicks=${tc} impressions=${ti}`)
  return rows
}

const token = await getAccessToken()
console.log(`区间 ${startDate} ~ ${endDate}（${DAYS} 天）`)

const qRows = await query(token, ['query'], 'GSC_query_2026-10-25.json')
const qpRows = await query(token, ['query', 'page'], 'GSC_query_page_2026-10-25.json')

// 摘要：曝光最高的 30 个查询词
if (qRows?.length) {
  const top = [...qRows].sort((a, b) => b.impressions - a.impressions).slice(0, 30)
  console.log('\n--- 曝光 Top 30 查询词 ---')
  for (const r of top) {
    console.log(
      `${String(r.impressions).padStart(5)} imp | ${String(r.clicks).padStart(3)} clk | pos ${r.position.toFixed(1).padStart(5)} | ${r.keys[0]}`
    )
  }
}
