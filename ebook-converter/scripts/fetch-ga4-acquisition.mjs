#!/usr/bin/env node
/**
 * fetch-ga4-acquisition.mjs — GA4 流量获取（来源/媒介、渠道组、落地页、国家）只读取数。
 *
 * 与 fetch-ga4-daily.mjs 同源（复用 gsc-service-account.json + analytics.readonly），
 * 但面向「来源结构」而非「每日转化」。零新增依赖。
 *
 * 用法：
 *   node scripts/fetch-ga4-acquisition.mjs --start 2026-10-05 --end 2026-11-01 --out 数据分析/xxx.json
 *   node scripts/fetch-ga4-acquisition.mjs --probe        # 只跑时区/完整性探针
 *
 * 设计纪律（对应 CP3 / 本补充 §2-§4）：
 * - 期间级用户数一律由「整段 dateRange 的 runReport」直接取（GA4 服务端去重），
 *   绝不由逐日用户相加得出；逐日序列只用于观察形态与完整性，另存一份。
 * - 会话口径（sessionSource/sessionMedium/渠道组）与用户口径（firstUserSource）分开取，
 *   不拼接、不相加。
 * - 每个 report 独立容错：失败写 {error} 而非 0，禁止把失败当「无数据」。
 * - 原样落盘 raw，不做任何过滤/剔除；可疑流量由分析层单列标注。
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { summarizeTiers, extractUtm, hasContainerParams } from './lib/referrer-tiers.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SA_PATH = path.join(ROOT, 'scripts', 'gsc-service-account.json')
const PROPERTY_ID = process.env.GA4_PROPERTY_ID || '547131052'

const argv = process.argv.slice(2)
const argOf = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined }
const PROBE = argv.includes('--probe')
const START = argOf('--start')
const END = argOf('--end')
const OUT = argOf('--out')

const SA = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')

async function getToken() {
  const iat = Math.floor(Date.now() / 1000)
  const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({
    iss: SA.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat, exp: iat + 3600,
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
  const j = await res.json()
  if (!j.access_token) throw new Error('token exchange failed: ' + JSON.stringify(j).slice(0, 300))
  return j.access_token
}

async function runReport(token, body) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`,
    { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )
  const json = await res.json()
  if (!res.ok) {
    const e = new Error(`GA4 ${res.status}: ${JSON.stringify(json).slice(0, 300)}`)
    e.status = res.status
    throw e
  }
  return json
}

/** 通用：把 report 转成 [{dim..., metric...}] 数组，维度/指标名按 header 取 */
function table(report) {
  const dims = (report.dimensionHeaders || []).map(h => h.name)
  const mets = (report.metricHeaders || []).map(h => h.name)
  return (report.rows || []).map(r => {
    const o = {}
    dims.forEach((d, i) => { o[d] = r.dimensionValues?.[i]?.value ?? null })
    mets.forEach((m, i) => { o[m] = Number(r.metricValues?.[i]?.value ?? 0) })
    return o
  })
}

async function safe(label, fn) {
  try { const v = await fn(); return { ok: true, data: v } }
  catch (e) { return { ok: false, error: String(e.message || e).slice(0, 300) } }
}

const METS = {
  session: ['sessions', 'engagedSessions', 'keyEvents', 'engagementRate', 'averageSessionDuration'],
  user: ['totalUsers', 'newUsers'],
  page: ['sessions', 'engagedSessions', 'keyEvents', 'screenPageViews'],
}

async function main() {
  const token = await getToken()
  const out = { property: PROPERTY_ID, fetchedAt: new Date().toISOString(), source: 'ga4-data-api', windows: {}, reports: {} }

  if (PROBE) {
    // 时区探针：dateHour 的最大小时值 vs 当前 UTC 小时，可判别属性时区是否为 UTC。
    const today = new Date().toISOString().slice(0, 10)
    const p = await safe('dateHour', () => runReport(token, {
      dateRanges: [{ startDate: today, endDate: today }],
      dimensions: [{ name: 'dateHour' }],
      metrics: [{ name: 'activeUsers' }],
      limit: 48,
    }))
    const rows = p.ok ? table(p.data) : []
    out.probe = {
      nowUtc: new Date().toISOString(),
      nowUtcHour: new Date().getUTCHours(),
      todayIso: today,
      maxDateHour: rows.length ? rows.map(r => r.dateHour).sort().slice(-1)[0] : null,
      distinctHours: rows.length,
      note: '若 maxDateHour 的小时部分明显大于 nowUtcHour，则属性时区非 UTC',
    }
    console.log(JSON.stringify(out, null, 2))
    return
  }

  if (!START || !END) { console.error('需要 --start YYYY-MM-DD --end YYYY-MM-DD（或 --probe）'); process.exit(2) }

  out.windows.main = { start: START, end: END }

  // ① 期间级汇总（服务端去重）——不得用逐日相加替代
  out.reports.periodTotals = await safe('periodTotals', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    metrics: ['activeUsers', 'totalUsers', 'newUsers', 'sessions', 'engagedSessions', 'keyEvents', 'screenPageViews'].map(name => ({ name })),
  }).then(r => table(r)[0] || {}))

  // ② 逐日序列（形态与完整性；用户数不可跨日相加）
  out.reports.daily = await safe('daily', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'date' }],
    metrics: ['activeUsers', 'totalUsers', 'newUsers', 'sessions', 'engagedSessions', 'keyEvents'].map(name => ({ name })),
    orderBys: [{ dimension: { dimensionName: 'date' } }],
    limit: 1000,
  }).then(table))

  // ③ 会话来源/媒介（会话口径）
  out.reports.sessionSourceMedium = await safe('sessionSourceMedium', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
    metrics: METS.session.map(name => ({ name })),
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 200,
  }).then(table))

  // ④ 会话默认渠道组
  out.reports.channelGroup = await safe('channelGroup', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: METS.session.map(name => ({ name })),
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 50,
  }).then(table))

  // ⑤ 首次用户来源/媒介（用户口径，独立列出，不与③混算）
  out.reports.firstUserSourceMedium = await safe('firstUserSourceMedium', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'firstUserSource' }, { name: 'firstUserMedium' }],
    metrics: [{ name: 'totalUsers' }, { name: 'newUsers' }],
    orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
    limit: 200,
  }).then(table))

  // ⑥ 落地页（会话口径）
  out.reports.landingPage = await safe('landingPage', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'landingPage' }],
    metrics: METS.page.map(name => ({ name })),
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 200,
  }).then(table))

  // ⑦ 国家（会话口径）
  out.reports.country = await safe('country', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'country' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 100,
  }).then(table))

  // ⑧ 事件全量计数（真实成功判定用；不代表任务成功率）
  out.reports.events = await safe('events', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 200,
  }).then(table))

  // ⑨ 失败事件按 error_code（口径分类用）
  out.reports.errorCodes = await safe('errorCodes', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'customEvent:error_code' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'conversion_failed' } } },
    limit: 100,
  }).then(table))

  // ⑩ 来源 × 落地页（会话口径，来源结构定位用；两个都是会话级，可兼容）
  out.reports.sourceLanding = await safe('sourceLanding', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }, { name: 'landingPage' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'keyEvents' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 300,
  }).then(table))

  // ⑪ 渠道组 × 城市（内部/开发测试流量判别：自有访问常高度集中于单一城市）
  out.reports.channelCity = await safe('channelCity', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }, { name: 'city' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 200,
  }).then(table))

  // ⑫ 渠道组 × 设备（移动端/桌面端结构，兼判测试流量）
  out.reports.channelDevice = await safe('channelDevice', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }, { name: 'deviceCategory' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'keyEvents' }],
    limit: 50,
  }).then(table))

  // ⑬ 来源 × 落地页（精确到 source/medium，用于判定 AI/搜索引荐具体落在哪一页）
  out.reports.sourceLandingDetail = await safe('sourceLandingDetail', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }, { name: 'landingPage' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'keyEvents' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 300,
  }).then(table))

  // ⑭ 主机名（域名/跨域核验：预览域、localhost、非 www 生产域是否在往同一属性送数）
  out.reports.hostname = await safe('hostname', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'hostname' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'keyEvents' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 50,
  }).then(table))

  // ⑮ 来源平台（GA4 自动识别的 AI/社交平台身份，比 medium=referral 手工推断更权威）
  out.reports.sourcePlatform = await safe('sourcePlatform', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'sessionSourcePlatform' }, { name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'keyEvents' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 50,
  }).then(table))

  // ⑯ 新老用户（判定 direct 336 会话里自有团队回访/老用户的比例）
  out.reports.newVsReturning = await safe('newVsReturning', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'newVsReturning' }, { name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'keyEvents' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 100,
  }).then(table))

  // ⑰ 逐日 × 渠道组（定位增长/异常的日期与渠道，避免期间汇总掩盖突变）
  out.reports.dailyByChannel = await safe('dailyByChannel', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'activeUsers' }],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
    limit: 1000,
  }).then(table))

  // ⑱ 入口环境分层·原始行
  //     ⚠️ pageReferrer 必须配 eventCount（限 page_view）才闭合；配 sessions 会膨胀约 1.6x。
  //     实测：pageReferrer×sessions 在 Direct 下 547 vs 真值 336；配 page_view 则为 882 = 真值。
  out.reports.referrerTiers = await safe('referrerTiers', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'pageReferrer' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'page_view', matchType: 'EXACT' } } },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 2000,
  }).then(table))

  // ⑲ 带参落地 URL（GA4 的 landingPage 已剥离 query，容器参数/UTM 只能从 pageLocation 取）
  out.reports.pageLocation = await safe('pageLocation', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'pageLocation' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'page_view', matchType: 'EXACT' } } },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 2000,
  }).then(table))

  // ⑳ 分层汇总（带闭合断言；不闭合就报错，绝不静默出百分比）
  //     ⚠️ level 必须显式声明：page_view 级的分层**不是会话入口**（2026-11-04 红队第 3 轮）
  out.reports.tierSummary = await safe('tierSummary', async () => {
    if (!out.reports.referrerTiers.ok) throw new Error('⑱ referrerTiers 未成功，无法分层')
    const pv = out.reports.periodTotals?.ok ? Number(out.reports.periodTotals.data.screenPageViews) : NaN
    if (!Number.isFinite(pv) || pv <= 0) {
      return { ...summarizeTiers(out.reports.referrerTiers.data, { level: 'pageview' }), closedCheck: 'SKIPPED（periodTotals 不可用）' }
    }
    return { ...summarizeTiers(out.reports.referrerTiers.data, { level: 'pageview', expectedTotal: pv }), closedCheck: `PASS（= screenPageViews ${pv}）` }
  })

  // ㉑ 带容器参数的落地 URL 明细（App/IM 内嵌打开的直接证据，含 UTM 情况）
  out.reports.containerLanding = await safe('containerLanding', () => {
    if (!out.reports.pageLocation.ok) throw new Error('⑲ pageLocation 未成功')
    const rows = out.reports.pageLocation.data
      .filter(r => hasContainerParams(r.pageLocation))
      .map(r => ({ ...r, utm: extractUtm(r.pageLocation) }))
      .sort((a, b) => b.eventCount - a.eventCount)
    return { rows, totalEvents: rows.reduce((s, r) => s + r.eventCount, 0), rowCount: rows.length }
  })

  // ㉒ 会话入口的来源页（session_start × pageReferrer）—— 这才是「从哪来」的正确口径
  //     page_view 级的 pageReferrer 是「每页上游」，会话内跳转会大量污染，不能当入口用
  out.reports.entryReferrer = await safe('entryReferrer', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'pageReferrer' }, { name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'session_start', matchType: 'EXACT' } } },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 2000,
  }).then(table))

  // ㉓ 会话入口的落地 URL（session_start × pageLocation × 来源/媒介）—— 判断「从什么容器打开」
  //     ⚠️ 容器参数在落地页自身 URL 上，所以必须用 pageLocation；用 pageReferrer 永远得 0
  out.reports.entryLocation = await safe('entryLocation', () => runReport(token, {
    dateRanges: [{ startDate: START, endDate: END }],
    dimensions: [{ name: 'pageLocation' }, { name: 'sessionSource' }, { name: 'sessionMedium' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'session_start', matchType: 'EXACT' } } },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 2000,
  }).then(table))

  // ㉔ 会话级分层汇总（闭合到 session_start 事件数，**不是** sessions 指标）
  out.reports.entrySummary = await safe('entrySummary', async () => {
    if (!out.reports.entryReferrer.ok) throw new Error('㉒ entryReferrer 未成功，无法做会话级分层')
    return summarizeTiers(out.reports.entryReferrer.data, { level: 'session' })
  })

  // ㉕ 容器打开的会话数（session_start 的 pageLocation 带容器参数）+ 其来源能否归因
  out.reports.entryContainer = await safe('entryContainer', () => {
    if (!out.reports.entryLocation.ok) throw new Error('㉓ entryLocation 未成功')
    const rows = out.reports.entryLocation.data.filter(r => hasContainerParams(r.pageLocation))
    const total = rows.reduce((s, r) => s + r.eventCount, 0)
    const attr = {}
    rows.forEach(r => { const k = `${r.sessionSource}/${r.sessionMedium}`; attr[k] = (attr[k] || 0) + r.eventCount })
    return { rows, sessionCount: total, attribution: attr, rowCount: rows.length }
  })

  // ㉖ session_start 与 sessions 的逐日差额（两者不可互替，差额须显式暴露）
  out.reports.sessionStartGap = await safe('sessionStartGap', async () => {
    const rows = await runReport(token, {
      dateRanges: [{ startDate: START, endDate: END }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'session_start', matchType: 'EXACT' } } },
      limit: 500,
    }).then(table)
    const daily = out.reports.daily?.ok ? out.reports.daily.data : []
    const byDate = Object.fromEntries(daily.map(d => [d.date, d.sessions]))
    const merged = rows.map(r => ({
      date: r.date, sessionStart: r.eventCount,
      sessions: byDate[r.date] ?? null,
      gap: byDate[r.date] != null ? r.eventCount - byDate[r.date] : null,
    }))
    const ssTotal = rows.reduce((s, r) => s + r.eventCount, 0)
    const sessTotal = daily.reduce((s, d) => s + d.sessions, 0)
    return { merged, sessionStartTotal: ssTotal, sessionsTotal: sessTotal, gapTotal: ssTotal - sessTotal }
  })

  if (OUT) {
    const p = path.isAbsolute(OUT) ? OUT : path.join(ROOT, OUT)
    fs.mkdirSync(path.dirname(p), { recursive: true })
    fs.writeFileSync(p, JSON.stringify(out, null, 2))
    console.error('✅ raw → ' + p)
  }
  // 摘要到 stdout（不全量刷屏）
  const summary = { property: PROPERTY_ID, window: out.windows.main, fetchedAt: out.fetchedAt }
  for (const [k, v] of Object.entries(out.reports)) {
    summary[k] = v.ok ? (Array.isArray(v.data) ? `rows=${v.data.length}` : 'ok') : 'ERROR: ' + v.error
  }

  // 分层结果单独打到 stderr，避免被 JSON 摘要淹掉
  const ts = out.reports.tierSummary
  if (ts?.ok) {
    const t = ts.data
    console.error(`— page_view 上游分层（page_view 事件口径，total=${t.total}）⚠️ 这不是会话入口`)
    for (const [k, v] of Object.entries(t.tiers)) console.error(`   ${k}: ${v.value} (${v.pct}%)`)
    console.error(`   闭合校验: ${t.closedCheck || '-'}`)
    if (t.externalHosts?.length) console.error(`   外部域名: ${t.externalHosts.map(([h, v]) => `${h}(${v})`).join(', ')}`)
  } else if (ts) {
    console.error('— page_view 上游分层: ERROR ' + ts.error)
  }
  const es = out.reports.entrySummary
  if (es?.ok) {
    const e = es.data
    console.error(`— 会话入口分层（session_start 口径，total=${e.total}；⚠️ 分母≠sessions 449）`)
    for (const [k, v] of Object.entries(e.tiers)) console.error(`   ${k}: ${v.value} (${v.pct}%)`)
    if (e.externalHosts?.length) console.error(`   外部域名: ${e.externalHosts.map(([h, v]) => `${h}(${v})`).join(', ')}`)
  } else if (es) {
    console.error('— 会话入口分层: ERROR ' + es.error)
  }
  const ec = out.reports.entryContainer
  if (ec?.ok) {
    console.error(`— 从容器打开的会话: ${ec.data.sessionCount} 个（pageLocation 带容器参数）| 归因 ${JSON.stringify(ec.data.attribution)}`)
  }
  const g = out.reports.sessionStartGap
  if (g?.ok) {
    console.error(`— session_start vs sessions: ${g.data.sessionStartTotal} vs 逐日相加 ${g.data.sessionsTotal}（gap ${g.data.gapTotal}）`)
  }
  const cl = out.reports.containerLanding
  if (cl?.ok) {
    console.error(`— 带容器参数的落地 URL: ${cl.data.rowCount} 行 / ${cl.data.totalEvents} 个 page_view`)
    for (const r of cl.data.rows.slice(0, 5)) {
      console.error(`   ${r.eventCount} | utm=${r.utm ? JSON.stringify(r.utm) : 'none'} | ${String(r.pageLocation).slice(0, 100)}`)
    }
  }

  console.log(JSON.stringify(summary, null, 2))
}

main().catch(e => { console.error('❌ ' + (e.message || e)); process.exit(1) })
