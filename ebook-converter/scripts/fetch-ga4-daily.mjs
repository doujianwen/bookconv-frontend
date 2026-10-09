#!/usr/bin/env node
/**
 * fetch-ga4-daily.mjs — 用 GA4 Data API 实时拉取 bookconv.com 每日核心指标。
 *
 * 复用 GSC 的服务账号 gsc-service-account.json（同一 GCP 项目 bookconv-gsc），
 * 仅把 OAuth scope 换成 analytics.readonly。零新增 npm 依赖（纯 node:fs/crypto + fetch）。
 *
 * 用法：
 *   node scripts/fetch-ga4-daily.mjs            # 拉「昨天」数据
 *   node scripts/fetch-ga4-daily.mjs 2026-10-08 # 拉指定日期
 *   node scripts/fetch-ga4-daily.mjs --write    # 额外写 _wb_tmp/ga4-live.json 供 ga-inspection.mjs 消费
 *
 * 输出：JSON 到 stdout，结构 { date, activeUsers, eventCount, events:{...}, conversionRate, source }
 *
 * ──────────────────────────── 一次性 SETUP（需用户操作）────────────────────────────
 * 1. Google Cloud Console → 项目 bookconv-gsc → 启用「Google Analytics Data API」
 *    (https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com?project=bookconv-gsc)
 * 2. GA4 后台 → Admin → Property Access Management (property 547131052)
 *    → 添加成员 bookconv-gsc-reader@bookconv-gsc.iam.gserviceaccount.com，角色 Viewer
 * 完成后本脚本即可实时拉数；未授权前会返回 403，ga-inspection.mjs 自动回退到最新 GA4日报 md。
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SA_PATH = path.join(ROOT, 'scripts', 'gsc-service-account.json')
const PROPERTY_ID = '547131052' // bookconv.com GA4 property（来自 ga-daily-analysis 技能）
const WRITE = process.argv.includes('--write')

// ── 日期参数 ──────────────────────────────────────────────────────────
function targetDate() {
  const arg = process.argv.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a))
  if (arg) return arg
  const y = new Date(Date.now() - 864e5) // 默认昨天（GA4 数据有延迟）
  return y.toISOString().slice(0, 10)
}
const DATE = targetDate()

// ── 服务账号 + token ──────────────────────────────────────────────────
const SA = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))
const base64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')

async function getAccessToken() {
  const iat = Math.floor(Date.now() / 1000)
  const unsigned =
    base64url({ alg: 'RS256', typ: 'JWT' }) + '.' +
    base64url({
      iss: SA.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
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

// ── GA4 Data API runReport ─────────────────────────────────────────────
async function runReport(token, body) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
  const json = await res.json()
  if (!res.ok) {
    const err = new Error(`GA4 API ${res.status}: ${JSON.stringify(json).slice(0, 300)}`)
    err.status = res.status
    throw err
  }
  return json
}

function rowsToMap(report) {
  const out = {}
  for (const row of report.rows || []) {
    const name = row.dimensionValues?.[0]?.value
    const val = row.metricValues?.[0]?.value
    if (name != null) out[name] = Number(val) || 0
  }
  return out
}

// ── main ───────────────────────────────────────────────────────────────
try {
  const token = await getAccessToken()

  // ① 概览：活跃用户 + 总事件数
  const overview = await runReport(token, {
    dateRanges: [{ startDate: DATE, endDate: DATE }],
    metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }],
  })
  const activeUsers = Number(overview.rows?.[0]?.metricValues?.[0]?.value) || 0
  const eventCount = Number(overview.rows?.[0]?.metricValues?.[1]?.value) || 0

  // ② 转化相关事件明细
  const eventsReport = await runReport(token, {
    dateRanges: [{ startDate: DATE, endDate: DATE }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        inListFilter: { values: ['file_upload', 'conversion_complete', 'conversion_failed'] },
      },
    },
  })
  const events = rowsToMap(eventsReport)
  const upload = events.file_upload || 0
  const complete = events.conversion_complete || 0
  const failed = events.conversion_failed || 0
  const conversionRate = upload > 0 ? Math.round((complete / upload) * 100) + '%' : '—'

  const result = {
    date: DATE,
    activeUsers,
    eventCount,
    events: { file_upload: upload, conversion_complete: complete, conversion_failed: failed },
    conversionRate,
    source: 'ga4-data-api',
  }

  if (WRITE) {
    const p = path.join(ROOT, '_wb_tmp', 'ga4-live.json')
    fs.writeFileSync(p, JSON.stringify(result, null, 2))
    console.error('✅ 已写 ' + p)
  }
  console.log(JSON.stringify(result, null, 2))
} catch (e) {
  console.error('❌ GA4 Data API 拉取失败: ' + (e.message || e))
  if (e.status === 403) {
    console.error('   提示：服务账号未获 GA4 property 授权，或 Data API 未启用。')
    console.error('   参见脚本头部 SETUP 说明。ga-inspection.mjs 将自动回退到最新 GA4日报 md。')
  }
  process.exit(1)
}
