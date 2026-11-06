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
import { parseDiagnosticPrefix, aggregateDiagnosticErrors } from './lib/direct-upload-diagnostic.mjs'

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

// ── 联合模块校验（2026-11-05 增补）──────────────────────────────────
// 纪律：判据无法执行 / 自相矛盾时绝不静默出数（项目 MEMORY：静默假成功是头号敌人）。
//  ① 新模块与 2f(date × error_code) 的 eventCount 合计必须闭合；
//  ② 全 null / 全 (not set) 视为维度映射假阴性 —— 2026-11-05 独立探针踩过：
//     自定义维度按 header 字面量映射错位时全返 null，却不报错，会造成假阴性。
function assertJointClosure(data, base) {
  const sum = (a) => (Array.isArray(a) ? a.reduce((s, x) => s + (Number(x.eventCount) || 0), 0) : null)
  const baseSum = sum(base)
  const newSum = sum(data)
  if (baseSum === null) throw new Error('UNKNOWN: 2f 模块降级，无法校验闭合')
  if (baseSum !== newSum) throw new Error(`闭合失败: 2f=${baseSum} 2g=${newSum}`)
  if (data.length && data.every((x) => x.error_code === null || x.error_code === '(not set)')) {
    throw new Error('疑似维度映射假阴性: error_code 全为 null/(not set)')
  }
  return true
}

// ── 归因完整性判据（2026-11-05 增补，防第 3 次复发）──────────────────
// 复发史：2026-10-31 待办 §三已撤销「66% 失败无错误码，P0 修埋点」；
//         2026-11-05 分期红队报告 §4 P0-2 又把「PRE 期 44 次 (not set)」立项为
//         「给 conversion_failed 加兜底 error_code」。两次都是把「埋点上线前的
//         历史存量」误读成「当前埋点缺陷」。本判据只看最近 7 天，历史存量
//         永不参与判定；无失败事件时显式 UNKNOWN，绝不 fallthrough 到 PASS。
function checkAttributionFreshness(codeRows, end) {
  const endKey = end.replace(/-/g, '')
  if (!Array.isArray(codeRows)) return { verdict: 'UNKNOWN', reason: '2f 模块降级，不可判定' }
  const cutoff = new Date(end + 'T00:00:00Z')
  cutoff.setUTCDate(cutoff.getUTCDate() - 6)
  const from = cutoff.toISOString().slice(0, 10).replace(/-/g, '')
  const recent = codeRows.filter((x) => x.date >= from)
  const total = recent.reduce((s, x) => s + (Number(x.eventCount) || 0), 0)
  if (total === 0) return { verdict: 'UNKNOWN', reason: '最近 7 天无失败事件，不可判定', window: [from, endKey] }
  const notSet = recent.filter((x) => x.error_code === '(not set)').reduce((s, x) => s + x.eventCount, 0)
  return {
    verdict: notSet > 0 ? 'FAIL' : 'PASS',
    window: [from, endKey],
    recentFailures: total,
    recentNotSet: notSet,
    note: notSet > 0
      ? '当前埋点疑似缺陷：最近 7 天仍有 (not set)，须立项排查'
      : '当前归因健康：历史 (not set) 属埋点上线前存量，禁止据此立项「修埋点」',
  }
}

// 自检门禁（可复跑，含反向验证：注入事故→exit 1，恢复→exit 0）
//   node scripts/ga4-advanced-analysis.mjs --self-test
if (process.argv.includes('--self-test')) {
  const base = [{ date: '20261101', error_code: 'INTERNAL_ERROR', eventCount: 3 }]
  const good = [
    { date: '20261101', error_code: 'INTERNAL_ERROR', file_size: '1024', eventCount: 2 },
    { date: '20261101', error_code: 'INTERNAL_ERROR', file_size: '2048', eventCount: 1 },
  ]
  const cases = [
    ['正常闭合 → PASS', () => assertJointClosure(good, base) === true, true],
    ['注入少一行 → 拒绝出数', () => { try { assertJointClosure(good.slice(0, 1), base); return false } catch { return true } }, true],
    ['2f 降级 → UNKNOWN 拒绝出数', () => { try { assertJointClosure(good, { _error: 'x' }); return false } catch (e) { return /UNKNOWN/.test(e.message) } }, true],
    ['全 (not set) → 假阴性拒绝出数', () => { try { assertJointClosure([{ error_code: '(not set)', eventCount: 3 }], [{ error_code: '(not set)', eventCount: 3 }]); return false } catch (e) { return /假阴性/.test(e.message) } }, true],
    ['恢复原始数据 → PASS', () => assertJointClosure(good, base) === true, true],
    ['归因健康 → PASS', () => checkAttributionFreshness([{ date: '20261101', error_code: 'UNKNOWN', eventCount: 2 }], '2026-11-04').verdict === 'PASS', true],
    ['注入当前 (not set) → FAIL', () => checkAttributionFreshness([{ date: '20261101', error_code: '(not set)', eventCount: 2 }], '2026-11-04').verdict === 'FAIL', true],
    ['仅历史 (not set) → 仍 PASS', () => checkAttributionFreshness([{ date: '20261005', error_code: '(not set)', eventCount: 14 }, { date: '20261101', error_code: 'UNKNOWN', eventCount: 2 }], '2026-11-04').verdict === 'PASS', true],
    ['2f 降级 → UNKNOWN', () => checkAttributionFreshness({ _error: 'x' }, '2026-11-04').verdict === 'UNKNOWN', true],
    ['近 7 天无失败 → UNKNOWN', () => checkAttributionFreshness([], '2026-11-04').verdict === 'UNKNOWN', true],
    // F20 P2：诊断前缀解析器
    ['解析直传前缀 PUT HTTP403 → 结构化维度', () => { const p = parseDiagnosticPrefix('PUT:HTTP403:on=1:>15s:'); return p.valid && p.stage === 'PUT' && p.kind === 'HTTP' && p.httpStatus === 403 && p.online === '1' && p.msBucket === '>15s' }, true],
    ['解析 CORS/网络失败 → NETWORK 无 status', () => { const p = parseDiagnosticPrefix('PUT:NETWORK:on=1:1-5s:'); return p.valid && p.kind === 'NETWORK' && p.httpStatus === null }, true],
    ['非直传 error → valid:false 且非异常', () => { const p = parseDiagnosticPrefix('Conversion failed'); return p.valid === false && p.malformed === false }, true],
    ['漂移头部 → malformed:true（契约漂移告警）', () => { const p = parseDiagnosticPrefix('PUT:NETWORK:on=2:1-5s:'); return p.malformed === true }, true],
    // R-2 (2026-11-06)：CSP 必须与 NETWORK 分成两个桶，不得被粗桶吞并
    ['解析 CSP 拦截前缀 → kind=CSP 且 cspBlocked', () => { const p = parseDiagnosticPrefix('PUT:CSP:on=1:<1s:'); return p.valid && p.kind === 'CSP' && p.cspBlocked === true && p.httpStatus === null }, true],
    ['CSP 与 NETWORK 同 on/msBucket 仍分桶', () => { const a = parseDiagnosticPrefix('PUT:CSP:on=1:1-5s:'); const b = parseDiagnosticPrefix('PUT:NETWORK:on=1:1-5s:'); return a.kind === 'CSP' && b.kind === 'NETWORK' && a.cspBlocked === true && b.cspBlocked === false }, true],
    ['近乎拼错的 kind → malformed:true（防 producer 私造 token）', () => { const p = parseDiagnosticPrefix('PUT:CSP-BLOCKED:on=1:<1s:'); return p.malformed === true }, true],
  ]
  let bad = 0
  for (const [name, fn, want] of cases) {
    const got = fn()
    console.log(`${got === want ? '✅' : '❌'} ${name}`)
    if (got !== want) bad++
  }
  console.log(bad === 0 ? `✅ selfTest ${cases.length}/${cases.length} PASS` : `❌ selfTest ${bad} 项失败`)
  process.exit(bad === 0 ? 0 : 1)
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

  // 模块 2d：conversion_failed 按 date × source_format × target_format（2026-10-30 增补）
  // 目的：闭环 2026-10-26 报告的「txt→epub 验证缺口」——只有含日期的维度才能判断
  // 某条纯 JS 路径上线后失败是否真降到 0，否则无法区分 legacy 与新发。
  // 2026-10-30 追加 file_size：用于区分「真超 100MB 上限」与「探测降级导致误拦 4MB」。
  await safe('failed_by_date_format', async () => {
    const r = await report(tok, {
      dateRanges: [{ startDate: START, endDate: END }],
      dimensions: [{ name: 'date' }, { name: 'customEvent:source_format' }, { name: 'customEvent:target_format' }, { name: 'customEvent:file_size' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'conversion_failed' } } },
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: 5000,
    })
    return rows(r, ['date', 'source_format', 'target_format', 'file_size'])
  })

  // 模块 2e：conversion_failed 按 date × error（2026-10-30 增补）
  // 目的：error_code 三分类（客户端拦截 / 降级展示 / 引擎异常）需要时间维度才能判断「当前是否仍在发生」。
  await safe('failed_by_date_error', async () => {
    const r = await report(tok, {
      dateRanges: [{ startDate: START, endDate: END }],
      dimensions: [{ name: 'date' }, { name: 'customEvent:error' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'conversion_failed' } } },
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: 5000,
    })
    return rows(r, ['date', 'error'])
  })

  // 模块 2e-d：failed_by_date_error 的诊断前缀结构化派生（F20 P2，2026-11-05）
  // 目的：2e 的 `error` 字段对直传失败是 `诊断前缀 + 友好文案`，但此前 failed_by_date_error
  // 只按整串分组，无法回答「PUT 阶段里 NETWORK(CORS/网络) 与 HTTP403 各占多少」。
  // 本模块复用 2e 已拉取的数据，逐行解析诊断前缀 → 按 date × stage × kind × httpStatus
  // × online × msBucket 聚合，使直传失败可根因归类（aggregateDiagnosticErrors 已抽为纯函数，
  // 可在 selfTest 中直接复跑验证，避免内联副本无守护）。
  // 纪律：解析器永不抛；非直传错误（无前缀）是期望态，计入 nonDiagnostic、绝不报异常；
  // malformed>0 才是真告警（producer/parser 契约漂移），交由 meta.diagnosticPrefixParse 暴露。
  await safe('failed_by_date_error_diagnostic', async () => {
    const src = out.modules.failed_by_date_error
    if (!Array.isArray(src)) throw new Error('UNKNOWN: 2e 模块降级，无法派生诊断维度')
    const { detail, parse } = aggregateDiagnosticErrors(src)
    // 防假阴性：有失败事件却零解析且零 malformed = 整个 error 维度塌陷，拒绝出数
    if (parse.total > 0 && parse.valid === 0 && parse.malformed === 0 && parse.nonDiagnostic === parse.total) {
      throw new Error('疑似维度映射假阴性: 2e 全部 error 行均无可解析的诊断前缀（error 维度可能整体未注册/塌陷）')
    }
    return { detail, parse }
  })

  // 模块 2f：conversion_failed 按 date × error_code（2026-10-31 增补，与 fetch-ga4-daily 同维度）
  // 目的：提供「与 Part A 同源的 error_code 时间序列」，供红队 Part D 做 apples-to-apples 引擎失败比对，
  // 避免 failed_by_date_error（customEvent:error，可能未注册降级）不可比导致的误判。
  await safe('failed_by_date_error_code', async () => {
    const r = await report(tok, {
      dateRanges: [{ startDate: START, endDate: END }],
      dimensions: [{ name: 'date' }, { name: 'customEvent:error_code' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'conversion_failed' } } },
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: 5000,
    })
    return rows(r, ['date', 'error_code'])
  })

  // 模块 2g：conversion_failed 按 date × error_code × file_size（2026-11-05 增补）
  // 来源：红队报告 `红队审计_GA4三十天分析与1027分期_2026-11-05.md` §4 P0-1 建议动作
  // 「按 date × error_code × file_size 建监控」。此前只能人工把 2f（无 size）与
  // 2d（无 code）两表按日期拼起来推断「29~40MB 大文件落在 PUT 阶段」，拼表结论
  // 不可复跑且易错。本模块把三者合一，使监控判据变成单查询、可复跑。
  // 闭合 / 假阴性校验见 assertJointClosure；失败由 safe() 降级为 _error
  // （Part D D4 会显式列出），绝不静默出数。
  await safe('failed_by_date_error_code_size', async () => {
    const r = await report(tok, {
      dateRanges: [{ startDate: START, endDate: END }],
      dimensions: [{ name: 'date' }, { name: 'customEvent:error_code' }, { name: 'customEvent:file_size' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'conversion_failed' } } },
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: 10000,
    })
    const data = rows(r, ['date', 'error_code', 'file_size'])
    assertJointClosure(data, out.modules.failed_by_date_error_code)
    return data
  })

  // 写盘前固化归因完整性判据（机器可读，随每日 Part C 产物落盘）
  out.meta.attributionGuard = checkAttributionFreshness(out.modules.failed_by_date_error_code, END)
  const guard = out.meta.attributionGuard
  console.error(`🛡️ 归因完整性: ${guard.verdict} — ${guard.note || guard.reason}`)

  // F20 P2：诊断前缀解析覆盖摘要（malformed>0 = producer/parser 契约漂移告警）
  const diagMod = out.modules.failed_by_date_error_diagnostic
  if (diagMod && !diagMod._error && diagMod.parse) {
    out.meta.diagnosticPrefixParse = diagMod.parse
    if (diagMod.parse.malformed > 0) {
      console.error(`⚠️ 诊断前缀漂移告警: ${diagMod.parse.malformed} 行匹配直传头部但无法解析（producer/parser 契约可能已漂移）`)
    } else {
      console.error(`🔎 诊断前缀解析: 有效 ${diagMod.parse.valid} / 非直传 ${diagMod.parse.nonDiagnostic} / 漂移 ${diagMod.parse.malformed}`)
    }
  }

  // 写盘
  const file = path.join(ROOT, '_wb_tmp', `ga4-advanced-${END}.json`)
  fs.writeFileSync(file, JSON.stringify(out, null, 2))
  console.error('✅ 已写 ' + file)
  console.log(JSON.stringify(out, null, 2))
} catch (e) {
  console.error('❌ 核心失败: ' + (e.message || e))
  process.exit(1)
}
