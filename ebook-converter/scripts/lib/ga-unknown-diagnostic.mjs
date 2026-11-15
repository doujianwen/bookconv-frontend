#!/usr/bin/env node
/**
 * ga-unknown-diagnostic.mjs — 把 conversion_failed 中 error_code=UNKNOWN 的
 * 原始错误串（customEvent:error 参数）从 GA4 实时捞出来。
 *
 * 用途（红队 B2 防 phantom）：UNKNOWN 在 GA4 里是归因黑盒，但前端自 2026-11-05
 * （commit 56b8a70）起已在 conversion_failed 事件附带 `error` 参数（截断 100 字符的
 * 原始错误串）。本库让红队在检出 UNKNOWN 时直接拿到真实原始串，避免"待识别原始串"
 * 这类永远悬着的 phantom P1。
 *
 * ⚠️ 历史盲区：2026-11-14 当天的 UNKNOWN 事件跑在 8990285（网络失败正则首次引入）
 *   部署之前的旧 bundle 上，故 "Failed to fetch" / "Load failed" 都塌缩为 UNKNOWN；
 *   这两个串现已分别被 8990285 + b0427cb 覆盖。本库用于未来任何 UNKNOWN 的即时归因。
 *
 * 复用 fetch-ga4-daily.mjs 的服务账号认证（bookconv-gsc 项目，analytics.readonly）。
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..') // scripts/lib -> ebook-converter
const SA_PATH = path.join(ROOT, 'scripts', 'gsc-service-account.json')
const PROPERTY_ID = '547131052'

const base64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')

async function getAccessToken() {
  const SA = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))
  const iat = Math.floor(Date.now() / 1000)
  const unsigned =
    base64url({ alg: 'RS256', typ: 'JWT' }) + '.' +
    base64url({ iss: SA.client_email, scope: 'https://www.googleapis.com/auth/analytics.readonly', aud: 'https://oauth2.googleapis.com/token', iat, exp: iat + 3600 })
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(SA.private_key, 'base64url')
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + sig }),
  })
  const json = await res.json()
  if (!json.access_token) throw new Error('token exchange failed: ' + JSON.stringify(json))
  return json.access_token
}

async function runReport(token, body) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`, {
    method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`GA4 API ${res.status}: ${JSON.stringify(json).slice(0, 300)}`)
  return json
}

/**
 * 拉取指定日期 conversion_failed 中 error_code=UNKNOWN 的原始 error 串明细。
 * @param {string} date YYYY-MM-DD
 * @returns {Promise<{ok:boolean, rows:Array<{error:string,source_format:string,target_format:string,eventCount:number}>, note?:string}>}
 */
export async function fetchUnknownErrorStrings(date) {
  if (!fs.existsSync(SA_PATH)) {
    return { ok: false, rows: [], note: '服务账号 scripts/gsc-service-account.json 缺失' }
  }
  const token = await getAccessToken()
  const report = await runReport(token, {
    dateRanges: [{ startDate: date, endDate: date }],
    dimensions: [
      { name: 'customEvent:error' },
      { name: 'customEvent:error_code' },
      { name: 'customEvent:source_format' },
      { name: 'customEvent:target_format' },
    ],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      andGroup: {
        expressions: [
          { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'conversion_failed' } } },
          { filter: { fieldName: 'customEvent:error_code', stringFilter: { matchType: 'EXACT', value: 'UNKNOWN' } } },
        ],
      },
    },
  })
  const rows = (report.rows || []).map((r) => {
    const d = r.dimensionValues || []
    return {
      error: d[0]?.value || '(空)',
      error_code: d[1]?.value,
      source_format: d[2]?.value,
      target_format: d[3]?.value,
      eventCount: Number(r.metricValues?.[0]?.value) || 0,
    }
  })
  return { ok: true, rows }
}
