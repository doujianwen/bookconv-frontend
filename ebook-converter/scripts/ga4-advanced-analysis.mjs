#!/usr/bin/env node
/**
 * ga4-advanced-analysis.mjs — GA4 进阶分析批量拉取（bookconv.com 媒体资源 547131052）
 *
 * 复用 fetch-ga4-daily.mjs 的鉴权与服务账号，按「GA4进阶分析维度手册」P0 模块拉取多维度数据：
 *   模块 0 数据质量   → 流量来源构成（direct/bot 占比）、平台/设备概览
 *   模块 2 漏斗+失败分流 → 日序列(file_upload/conversion_complete/conversion_failed/activeUsers)、
 *                          conversion_failed 按 source_format×target_format 分流（已注册维度）、
 *                          尝试 customEvent:error（P0-3，未注册则 400 降级）
 *   模块 5 技术设备   → 设备类别(mobile/desktop/tablet)×事件、操作系统×事件、Android Webview 观察
 *   模块 8 GEO 桥接   → 流量来源媒介 sessionSourceMedium × 事件（看有无 geo UTM / AI 域名）
 *
 * 输出：_wb_tmp/ga4-advanced-<ENDDATE>.json（供报告消费）
 * 退出码：0 = 主流程完成（部分维度降级也视为完成）；1 = 鉴权/核心失败。
 *
 * 设计纪律（见项目 MEMORY）：逐报告 try/catch，单报告失败不阻断整体；
 * 判据先实测再采信；不可判定项明确标 UNKNOWN，不报假 PASS。
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SA_PATH = path.join(ROOT, 'scripts', 'gsc-service-account.json')
const PROPERTY_ID = '547131052'

// 窗口：默认最近 30 天（含昨日，避开今日部分数据）
const END = (() => {
  const a = process.argv.find((x) => /^\d{4}-\d{2}-\d{2}$/.test(x))
  if (a) return a
  const y = new Date(Date.now() - 864e5) // 昨天
  const local = new Date(y.getTime() - y.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
})()
const DAYS = Number(process.argv.find((x) => /^--days=(\d+)$/.test(x))?.split('=')[1] || 30)
const START = (() => {
  const d = new Date(END + 'T00:00:00')
  d.setDate(d.getDate() - (DAYS - 1))
  return d.toISOString().slice(0, 10)
})()

const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')

async function token() {
  const iat = Math.floor(Date.now() / 1000)
  const jwt =
    b64({ alg: 'RS256', typ: 'JWT' }) + '.' +
    b64({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/analytics.readonly', aud: 'https://oauth2.googleapis.com/token', iat, exp: iat + 3600 })
  const sig = crypto.createSign('RSA-SHA256').update(jwt).sign(sa.private_key, 'base64url')
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt + '.' + sig }),
  })
  const j = await r.json()
  if (!j.access_token) throw new Error('token fail: ' + JSON.stringify(j).slice(0, 200))
  return j.access_token
}

async function report(tok, body) {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`, {
    method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  const j = await r.json()
  if (!r.ok) { const e = new Error(`GA4 ${r.status}: ${JSON.stringify(j).slice(0, 250)}`); e.status = r.status; throw e }
  return j
}

// 通用：维度行 -> 对象数组
function rows(reportJson, dimNames) {
  return (reportJson.rows || []).map((row) => {
    const o = {}
    dimNames.forEach((n, i) => { o[n] = row.dimensionValues?.[i]?.value ?? null })
    ;(reportJson.metricHeaders || []).forEach((m, i) => { o[m.name] = Number(row.metricValues?.[i]?.value) || 0 })
    return o
  })
}

const out = {
  meta: { property: PROPERTY_ID, start: START, end: END, generatedAt: new Date().toISOString(), source: 'ga4-data-api' },
  modules: {},
}

async function safe(name, fn) {
  try { out.modules[name] = await fn(); console.error('✅ ' + name) }
  catch (e) { out.modules[name] = { _error: (e.message || e).slice(0, 300), _status: e.status || 'throw' }; console.error('⚠️ ' + name + ' 失败: ' + (e.message || e).slice(0, 160)) }
}

try {
  const tok = await token()
  console.error('🔑 token OK，窗口 ' + START + ' ~ ' + END)

  // 模块 2a：日序列（整体活跃用户）
  await safe('daily_overview', async () => {
    const r = await report(tok, { dateRanges: [{ startDate: START, endDate: END }], dimensions: [{ name: 'date' }], metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }, { name: 'sessions' }] })
    return rows(r, ['date'])
  })

  // 模块 2b：日序列 × 事件（file_upload/conversion_complete/conversion_failed）
  await safe('daily_events', async () => {
    const r = await report(tok, {
      dateRanges: [{ startDate: START, endDate: END }],
      dimensions: [{ name: 'date' }, { name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: ['file_upload', 'conversion_complete', 'conversion_failed'] } } },
    })
    // 重组为 date -> {event: count}
    const map = {}
    for (const row of rows(r, ['date', 'eventName'])) {
      map[row.date] ??= { date: row.date, file_upload: 0, conversion_complete: 0, conversion_failed: 0 }
      map[row.date][row.eventName] = row.eventCount
    }
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
  })

  // 模块 0 + 模块 5：设备类别 × 整体指标
  await safe('device_overview', async () => {
    const r = await report(tok, { dateRanges: [{ startDate: START, endDate: END }], dimensions: [{ name: 'deviceCategory' }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'engagementRate' }, { name: 'eventCount' }] })
    return rows(r, ['deviceCategory'])
  })

  // 模块 5：设备类别 × 关键事件
  await safe('device_events', async () => {
    const r = await report(tok, {
      dateRanges: [{ startDate: START, endDate: END }],
      dimensions: [{ name: 'deviceCategory' }, { name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: ['file_upload', 'conversion_complete', 'conversion_failed'] } } },
    })
    const map = {}
    for (const row of rows(r, ['deviceCategory', 'eventName'])) {
      map[row.deviceCategory] ??= { deviceCategory: row.deviceCategory, file_upload: 0, conversion_complete: 0, conversion_failed: 0 }
      map[row.deviceCategory][row.eventName] = row.eventCount
    }
    return Object.values(map)
  })

  // 模块 5：操作系统 × 关键事件（含 Android Webview 观察 P2-8）
  await safe('os_events', async () => {
    const r = await report(tok, {
      dateRanges: [{ startDate: START, endDate: END }],
      dimensions: [{ name: 'operatingSystem' }, { name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: { values: ['file_upload', 'conversion_complete', 'conversion_failed', 'page_view'] },
        },
      },
    })
    const map = {}
    for (const row of rows(r, ['operatingSystem', 'eventName'])) {
      map[row.operatingSystem] ??= { operatingSystem: row.operatingSystem, file_upload: 0, conversion_complete: 0, conversion_failed: 0, page_view: 0 }
      map[row.operatingSystem][row.eventName] = row.eventCount
    }
    return Object.values(map).sort((a, b) => b.page_view - a.page_view)
  })

  // 模块 0：流量来源媒介构成（direct/bot/referral 占比）
  await safe('source_medium', async () => {
    const r = await report(tok, { dateRanges: [{ startDate: START, endDate: END }], dimensions: [{ name: 'sessionSourceMedium' }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'engagementRate' }], limit: 50 })
    return rows(r, ['sessionSourceMedium'])
  })

  // 模块 8：来源媒介 × 转化事件（看有无 geo UTM / AI 域名引荐）
  await safe('source_events', async () => {
    const r = await report(tok, {
      dateRanges: [{ startDate: START, endDate: END }],
      dimensions: [{ name: 'sessionSourceMedium' }, { name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: ['file_upload', 'conversion_complete', 'conversion_failed'] } } },
      limit: 200,
    })
    const map = {}
    for (const row of rows(r, ['sessionSourceMedium', 'eventName'])) {
      map[row.sessionSourceMedium] ??= { sessionSourceMedium: row.sessionSourceMedium, file_upload: 0, conversion_complete: 0, conversion_failed: 0 }
      map[row.sessionSourceMedium][row.eventName] = row.eventCount
    }
    return Object.values(map).sort((a, b) => (b.conversion_complete + b.file_upload) - (a.conversion_complete + a.file_upload))
  })

  // 模块 2c：conversion_failed 按 source_format × target_format 分流（已注册维度）
  await safe('failed_by_format', async () => {
    const r = await report(tok, {
      dateRanges: [{ startDate: START, endDate: END }],
      dimensions: [{ name: 'customEvent:source_format' }, { name: 'customEvent:target_format' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'conversion_failed' } } },
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    })
    return rows(r, ['source_format', 'target_format'])
  })

  // P0-3：尝试 customEvent:error（未注册则 400 降级，不阻断）
  await safe('failed_by_error', async () => {
    const r = await report(tok, {
      dateRanges: [{ startDate: START, endDate: END }],
      dimensions: [{ name: 'customEvent:error' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'conversion_failed' } } },
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 50,
    })
    return rows(r, ['error'])
  })

  // 模块 5 补充：Android Webview 信号——operatingSystem=Android 且 deviceCategory=mobile 的参与度
  await safe('android_detail', async () => {
    const r = await report(tok, {
      dateRanges: [{ startDate: START, endDate: END }],
      dimensions: [{ name: 'operatingSystem' }, { name: 'deviceCategory' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'engagementRate' }],
      dimensionFilter: { filter: { fieldName: 'operatingSystem', stringFilter: { matchType: 'EXACT', value: 'Android' } } },
    })
    return rows(r, ['operatingSystem', 'deviceCategory'])
  })

  // 写盘
  const file = path.join(ROOT, '_wb_tmp', `ga4-advanced-${END}.json`)
  fs.writeFileSync(file, JSON.stringify(out, null, 2))
  console.error('✅ 已写 ' + file)
  console.log(JSON.stringify(out, null, 2))
} catch (e) {
  console.error('❌ 核心失败: ' + (e.message || e))
  process.exit(1)
}
