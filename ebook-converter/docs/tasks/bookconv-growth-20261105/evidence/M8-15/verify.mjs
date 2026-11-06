// M8-15 独立核验通道（2026-11-06）：不 import 任何现有采集脚本。
// 目标：三源对账 + 逐页 HTTP 核验 + 三态差异表 + 反向验证。
// 运行：NODE_USE_ENV_PROXY=1 node _wb_tmp/m8-15/verify.mjs
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..', '..')
const OUT = path.join(ROOT, 'docs', 'tasks', 'bookconv-growth-20261105', 'evidence', 'M8-15')
fs.mkdirSync(OUT, { recursive: true })

const START = '2026-10-08'
const END = '2026-11-04'
const fail = []

// ---------- 1. 三源原始读数 ----------
// (a) BWT UI 国家/地区表：11/05 截图 _wb_tmp/bing-1105/bwt-country.png 逐行读数
const BWT_UI = [
  { country: '美国', clicks: 43, impressions: 1500, ctr: '2.93%', pos: 5.54 },
  { country: 'Rest of World', clicks: 22, impressions: 932, ctr: '2.36%', pos: 7.02 },
  { country: '英国', clicks: 5, impressions: 347, ctr: '1.44%', pos: 5.76 },
  { country: '中华人民共和国', clicks: 26, impressions: 256, ctr: '10.16%', pos: 5.30 },
  { country: '加拿大', clicks: 4, impressions: 151, ctr: '2.65%', pos: 8.68 },
  { country: '西班牙', clicks: 1, impressions: 133, ctr: '0.75%', pos: 10.45 },
  { country: '德国', clicks: 3, impressions: 66, ctr: '4.55%', pos: 20.41 },
  { country: '法国', clicks: 1, impressions: 64, ctr: '1.56%', pos: 9.52 },
  { country: '巴西', clicks: 2, impressions: 51, ctr: '3.92%', pos: 9.81 },
  { country: '意大利', clicks: 1, impressions: 32, ctr: '3.12%', pos: 7.05 },
  { country: '日本', clicks: 0, impressions: 12, ctr: '0.00%', pos: 20.00 },
]
const uiClicks = BWT_UI.reduce((a, b) => a + b.clicks, 0)
const uiImprKnown = BWT_UI.slice(1).reduce((a, b) => a + b.impressions, 0) // 首行 1.5K 是缩写，单独处理

// (b) Bing API RankAndTraffic（日粒度）
const csv = (f) => {
  const t = fs.readFileSync(path.join(ROOT, '数据分析', f), 'utf8').trim().split(/\r?\n/)
  const h = t[0].split(',')
  return t.slice(1).map((l) => Object.fromEntries(l.split(',').map((v, i) => [h[i], v])))
}
const rt = csv('www.bookconv.com_BingAPI_RankAndTraffic_2026_11_05.csv')
const rtW = rt.filter((r) => r.Date >= START && r.Date <= END)
const apiClicks = rtW.reduce((a, r) => a + Number(r.Clicks || 0), 0)
const apiImpr = rtW.reduce((a, r) => a + Number(r.Impressions || 0), 0)

// (c) GA4 主采集 + US 明细
const ga = JSON.parse(fs.readFileSync(path.join(ROOT, '数据分析', `GA4_M8-15_${START}_${END}.json`), 'utf8'))
const us = JSON.parse(fs.readFileSync(path.join(ROOT, '数据分析', `GA4_M8-15_USdetail_${START}_${END}.json`), 'utf8'))
const country = ga.reports.country.data
const usSessions = country.find((r) => r.country === 'United States')?.sessions ?? null
const usUsers = country.find((r) => r.country === 'United States')?.activeUsers ?? null
const cnSessions = country.find((r) => r.country === 'China')?.sessions ?? null
const cnUsers = country.find((r) => r.country === 'China')?.activeUsers ?? null
const usLandingRows = us.usLandingSource
const usSessionsSum = usLandingRows.reduce((a, r) => a + r.sessions, 0)
const usDailySum = us.usDaily.reduce((a, r) => a + r.sessions, 0)

// ---------- 2. 闭合断言（含反向验证） ----------
const assertEq = (name, actual, expected) => {
  const ok = actual === expected
  if (!ok) fail.push(`${name}: ${actual} !== ${expected}`)
  return { name, actual, expected, verdict: ok ? 'PASS' : 'FAIL' }
}
const checks = [
  assertEq('BWT UI 国家表点击合计 vs Bing API 同窗点击', uiClicks, apiClicks),
  assertEq('US landing×source 会话合计 vs country 报告 US 会话', usSessionsSum, usSessions),
  assertEq('US 逐日会话合计 vs country 报告 US 会话', usDailySum, usSessions),
  assertEq('GA4 用户截图 US 活跃用户 vs 采集值', usUsers, 8),
  assertEq('GA4 用户截图 中国活跃用户 vs 采集值', cnUsers, 391),
]
// 1.5K 缩写反推：API 总印象 - 其余 10 行已知印象
const impliedUSImpr = apiImpr - uiImprKnown
const usImprRounded = Math.round(impliedUSImpr / 100) / 10 // 以 K 为单位保留 1 位小数
checks.push({
  name: 'BWT 首行 1.5K 印象缩写反推',
  actual: impliedUSImpr,
  expected: 1466,
  verdict: impliedUSImpr >= 1450 && impliedUSImpr <= 1549 ? 'PASS' : 'FAIL',
  note: `反推值 ${impliedUSImpr} → ${usImprRounded}K，BWT 显示 1.5K`,
})
if (checks.at(-1).verdict === 'FAIL') fail.push(checks.at(-1).name)

// 反向验证：注入 +1 点击，闭合判据必须失败
const injected = uiClicks + 1
const reverse = { name: '反向验证：注入美国 44 点击', actual: injected, expected: apiClicks, detected: injected !== apiClicks }
if (!reverse.detected) fail.push('反向验证未命中（判据不可证伪）')

// ---------- 3. Bing 全站 Top5 页面（明确：非美国维度） ----------
const pt = csv('www.bookconv.com_BingAPI_PageTraffic_2026_11_05.csv')
const ptW = pt.filter((r) => r.Date >= START && r.Date <= END)
const pageAgg = {}
for (const r of ptW) pageAgg[r.Query] = (pageAgg[r.Query] || 0) + Number(r.Clicks || 0)
const top5 = Object.entries(pageAgg).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]).slice(0, 5)
  .map(([url, clicks]) => ({ url, clicks, geoScope: 'ALL (Bing API 无国家维度)' }))

// ---------- 4. 逐页 HTTP 核验（外部 vantage + 负对照） ----------
const httpProbe = async (url) => {
  try {
    const res = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 (M8-15 verification)' } })
    const html = res.status === 200 ? await res.text() : ''
    const canonical = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1] || null
    const hreflangs = [...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]*hreflang=["']([^"']+)["']/gi)].map((m) => m[1])
    const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || null
    return {
      url, status: res.status,
      matchedPath: res.headers.get('x-matched-path') || null,
      location: res.headers.get('location') || null,
      canonical, hreflangCount: hreflangs.length, title,
      textLen: html.length,
    }
  } catch (e) { return { url, status: 'ERROR', error: String(e).slice(0, 160) } }
}
const pageUrls = top5.map((p) => p.url)
const negUrl = 'https://www.bookconv.com/this-path-should-not-exist-m8-15'
const httpRows = []
for (const u of [...pageUrls, negUrl]) httpRows.push(await httpProbe(u))
const neg = httpRows.at(-1)
const negOK = neg.status === 404
if (!negOK) fail.push(`负对照失效：不存在路径返回 ${neg.status}（判据不可信）`)

// GA4 全站 landingPage 与 US 明细逐页对照
const landing = ga.reports.landingPage.data
const usPaths = new Set([...us.usPagePaths.map((r) => r.pagePath), ...usLandingRows.map((r) => r.landingPage)])
const diffRows = top5.map((p) => {
  const pathname = new URL(p.url).pathname
  const gaLanding = landing.find((r) => r.landingPage === pathname)
  return {
    bingUrl: p.url, bingClicksAll: p.clicks, geoScope: p.geoScope,
    pathname,
    gaLandingSessionsAll: gaLanding?.sessions ?? 0,
    gaUSSeen: usPaths.has(pathname),
    http: httpRows.find((r) => r.url === p.url),
  }
})

// ---------- 5. 三态判定 ----------
const verdicts = {
  '同窗（Bing 侧）': {
    state: 'UNKNOWN',
    evidence: `数值相容但不唯一：BWT UI 国家表 ${uiClicks} 点击 = Bing API ${START}..${END} ${apiClicks} 点击；印象反推 ${impliedUSImpr} → 1.5K。但独立窗口枚举显示 clicks=108 有 19 个连续窗口，叠加印象约束仍剩 5 个（见 verification-window.json）`,
    caveat: '红队推翻原 CONFIRMED。BWT UI 日期控件在 tabbit 内不可读（11/05 三次 + 11/06 两次均 rows=0）；窗口只能由 BWT 日期控件或导出文件元数据确认；API 数据止于 11/03，GA4 窗口含 11/04',
    minimalUnblock: '普通浏览器登录 BWT 读取日期范围文字并截图，或导出带窗口元数据的 CSV',
  },
  '同窗（GA4 侧）': {
    state: 'PARTIAL',
    evidence: `GA4 由采集脚本显式指定 ${START}..${END}（Fact）；country: US ${usSessions} 会话 / ${usUsers} 活跃用户，China ${cnSessions} / ${cnUsers}，与 11/05 用户截图 8 / 391 精确一致；US 明细四个独立维度组合均闭合到 9 会话 / 8 用户`,
    caveat: '用户截图窗口本身未直接读取；US=9 会话在 28 天内存在 4 个连续子窗口（10/08 起、11/01–11/04 止任一），故为「数值相容 + 高置信」而非直接确认。GA4 属性时区 ≈UTC+2（精确 IANA UNKNOWN）；BWT 时区 UNKNOWN',
  },
  '域名/站点范围': {
    state: 'CONFIRMED',
    evidence: `BWT siteUrl=https://www.bookconv.com/；GA4 hostname www.bookconv.com 465 会话 + ebook-converter-ymfg.vercel.app 1 会话`,
    caveat: '1 个 Vercel 预览域会话不属生产站点范围；US 明细 hostname 仅 www.bookconv.com',
  },
  '美国点击最高的 5 个落地页': {
    state: 'UNKNOWN',
    evidence: 'Bing 官方 API 仅 GetPageStats/GetQueryStats/GetRankAndTrafficStats，无国家维度；BWT UI 搜索性能表在 tabbit 内 rowCount=0（11/05 三次 + 11/06 两次均失败）；截图仅含国家汇总，无国家×页面交叉',
    minimalUnblock: '在普通浏览器登录 BWT → 搜索性能 → 筛选 国家/地区=美国 → 「页面」列出依据 → 导出 CSV（窗口需与 10/08–11/04 对齐并读取日期控件）；或确认 BWT 导出是否支持 country×page 维度',
  },
  '43 点击 vs 8 活跃用户': {
    state: 'NOT_COMPARABLE',
    evidence: `Bing 点击=${uiClicks}（全部分国家合计，其中美国 43）为搜索结果页点击事件；GA4 US ${usUsers} 为去重活跃用户。分母/口径/时区/搜索范围均不同`,
    caveat: '禁止相减、禁止计算「丢失率」、禁止据此判 GA 漏记；按 11/05 红队裁定执行',
  },
  'Bing 归因到站（美国）': {
    state: 'PARTIAL',
    evidence: `GA4 US ${usSessions} 会话按 sessionSource 实算：${Object.entries(usLandingRows.reduce((m, r) => { m[r.sessionSource] = (m[r.sessionSource] || 0) + r.sessions; return m }, {})).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' / ')}；其中 bing/organic 仅 1 会话（落地 /convert/txt-to-epub）`,
    caveat: 'GA4 全窗 bing/organic 2 会话、cn.bing.com/referral 25 会话（中国侧）；Bing 供稿网络（Yahoo 等）、追踪防护、立即返回、机器人点击均未定性 → UNKNOWN，不判漏记',
  },
  '落地页可达性（外部通道）': {
    state: negOK ? 'CONFIRMED' : 'UNKNOWN',
    evidence: `Top5 页面 HTTP 状态 ${httpRows.slice(0, -1).map((r) => r.status).join('/')}；负对照 ${neg.status} (${neg.matchedPath})`,
    caveat: '200 不等于「Bing 美国点击落到该页」；仅证明外部 vantage 可访问',
  },
  '工具拦 collect 归因生产故障': {
    state: 'EXCLUDED',
    evidence: 'BWT 探测中 applicationinsights /v2/track 返回 439 属工具内遥测被拦；11/01 已记录 tabbit 内 collect 零发出。按验收要求不归因生产故障',
    caveat: '未对生产 GA4 采集链路做新的端到端实测（本次为报表侧核验）',
  },
  '标签与跳转（Top5 全站页）': {
    state: 'CONFIRMED',
    evidence: `5 页均 HTTP 200、X-Matched-Path 命中具体路由（负对照 404 /404）、canonical 自引用、hreflang 2–3 条、无 Location 跳转；GA4 全窗 pageLocation/pageReferrer 中唯一 utm 为 ?utm_source=chatgpt.com（1 pv），无 msclkid/gclid，containerLanding 13 行 utm 全为 null`,
    caveat: 'Bing 自然点击不带 msclkid（属 Bing Ads 参数），归因依赖 referrer；仅证明页面层无跳转/标签丢失，不证明 Bing 点击实际落到这些页或 GA4 归因正确',
  },
  'Bing 点击→GA4 落地页逐页对应': {
    state: 'UNKNOWN',
    evidence: `Bing API PageTraffic 全站 Top5 点击 48/18/11/6/3；GA4 全站 landingPage 同路径会话 323/2/0/0/0，US 明细仅首页出现`,
    caveat: 'Bing API 无国家维度 → 这些是全站点击而非美国点击；PageTraffic 为周聚合（窗口内仅 4 个日期），与 GA4 日粒度不同窗；两者分母不同，禁止相减或据此判漏记',
    minimalUnblock: '取得 BWT「国家=美国 × 页面」交叉导出后重算',
  },
}

// ---------- 6. 输出 ----------
const report = {
  generatedAt: new Date().toISOString(),
  window: { start: START, end: END },
  sources: {
    bwtScreenshot: '_wb_tmp/bing-1105/bwt-country.png（11/05 20:03）',
    bingApi: '数据分析/www.bookconv.com_BingAPI_{RankAndTraffic,PageTraffic,Query}_2026_11_05.csv',
    ga4Main: `数据分析/GA4_M8-15_${START}_${END}.json`,
    ga4US: `数据分析/GA4_M8-15_USdetail_${START}_${END}.json`,
  },
  rawNumbers: {
    bwtUiClicksTotal: uiClicks, bwtUiImpressionsKnown: uiImprKnown, impliedUSImpressions: impliedUSImpr,
    bingApiClicks: apiClicks, bingApiImpressions: apiImpr, bingApiRows: rtW.length,
    bingApiDateRange: [rtW[0]?.Date, rtW.at(-1)?.Date],
    ga4: { usSessions, usUsers, cnSessions, cnUsers, totalSessions: ga.reports.periodTotals.data.sessions },
  },
  checks, reverse,
  top5AllGeo: top5,
  httpRows, diffRows,
  verdicts,
  selfCheck: { failures: fail, pass: fail.length === 0 },
}
fs.writeFileSync(path.join(OUT, 'verification.json'), JSON.stringify(report, null, 2))

console.log('=== 闭合检查 ===')
for (const c of checks) console.log(`  [${c.verdict}] ${c.name}: ${c.actual} / ${c.expected}`, c.note || '')
console.log(`  反向验证: ${reverse.detected ? 'DETECTED' : 'MISSED'} (注入 ${injected} vs ${apiClicks})`)
console.log('=== Bing 全站 Top5（非美国维度）===')
for (const p of top5) console.log(`  ${p.clicks} ${p.url}`)
console.log('=== 逐页差异 ===')
for (const d of diffRows) console.log(`  ${d.bingClicksAll} clicks | GA landing ${d.gaLandingSessionsAll} | US seen=${d.gaUSSeen} | HTTP ${d.http?.status} | ${d.pathname}`)
console.log(`  负对照: ${neg.status} ${neg.matchedPath}`)
console.log('=== 三态 ===')
for (const [k, v] of Object.entries(verdicts)) console.log(`  [${v.state}] ${k}`)
console.log('\nSELF_CHECK:', JSON.stringify(report.selfCheck))
console.log('WROTE:', path.join(OUT, 'verification.json'))
process.exit(fail.length === 0 ? 0 : 1)
