#!/usr/bin/env node
/**
 * diagnose-a1a2a5.mjs — 对锁定快照做独立复算（A1/A2/A5）。
 * 只读 raw/，输出机器可读 JSON 到 stdout；所有口径写进结论，禁止把事件比率包装成成功率。
 * 用法：node diagnose-a1a2a5.mjs > diagnosis-a1a2a5.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const RAW = path.resolve(HERE, '..', 'raw')
const read = (f) => JSON.parse(fs.readFileSync(path.join(RAW, f), 'utf8'))
const csv = (f) => fs.readFileSync(path.join(RAW, f), 'utf8').trim().split('\n').slice(1).map(l => {
  const [date, query, clicks, impressions, avgClickPos, avgImpPos] = l.split(',')
  return { date, query, clicks: +clicks || 0, impressions: +impressions || 0, avgClickPos, avgImpPos }
})
const sum = (a, k) => a.reduce((s, r) => s + (Number(r[k]) || 0), 0)
const sliceWindow = (rows, start, end) => rows.filter(r => r.keys[0] >= start && r.keys[0] <= end)

const out = { generatedAt: new Date().toISOString(), source: 'raw/ 锁定快照（SHA256 见 RAW_MANIFEST）', A1: {}, A2: {}, A5: {} }

// ---------------- A1: date / query / page 一致性 ----------------
const dateJ = read('GSC_API_date_2026-11-14_d30.json')
const pageJ = read('GSC_API_page_2026-11-14_d10.json')
const queryJ = read('GSC_API_query_2026-11-14_d10.json')
const recent7 = sliceWindow(dateJ.rows, '2026-11-08', '2026-11-14')
const prev7 = sliceWindow(dateJ.rows, '2026-11-01', '2026-11-07')
const nonZeroClickDays = dateJ.rows.filter(r => r.clicks > 0).map(r => ({ d: r.keys[0], c: r.clicks, i: r.impressions }))
out.A1 = {
  date_window: `${dateJ.startDate}~${dateJ.endDate} (${dateJ.windowDays}d)`,
  date_total: { clicks: sum(dateJ.rows, 'clicks'), impressions: sum(dateJ.rows, 'impressions') },
  recent7_1108_1114: { clicks: sum(recent7, 'clicks'), impressions: sum(recent7, 'impressions'), days: recent7.length },
  prev7_1101_1107: { clicks: sum(prev7, 'clicks'), impressions: sum(prev7, 'impressions'), days: prev7.length },
  nonzero_click_days: nonZeroClickDays,
  page_window: `${pageJ.startDate}~${pageJ.endDate} (${pageJ.windowDays}d)`,
  page_total: { clicks: sum(pageJ.rows, 'clicks'), impressions: sum(pageJ.rows, 'impressions'), rows: pageJ.rows.length },
  page_clicked_urls: pageJ.rows.filter(r => r.clicks > 0).map(r => ({ url: r.keys[0], clicks: r.clicks, impressions: r.impressions })),
  query_window: `${queryJ.startDate}~${queryJ.endDate} (${queryJ.windowDays}d)`,
  query_total: { clicks: sum(queryJ.rows, 'clicks'), impressions: sum(queryJ.rows, 'impressions'), rows: queryJ.rows.length },
  contradiction_test: {}
}
// 矛盾复算：date recent7(11-08起)=0 click；page d10(11-04起) 首页 1 click。
// 11-05 那天 date=1 click/1 impr/pos1 → 落在 page 窗口内但落在 date recent7 之外。
const click1105 = dateJ.rows.find(r => r.keys[0] === '2026-11-05')
out.A1.contradiction_test = {
  claim: 'date 维度 recent7 0 clicks，但 page 维度显示 1 click',
  click_on_1105_from_date: click1105 ? { clicks: click1105.clicks, impressions: click1105.impressions, position: click1105.position } : null,
  is_1105_inside_page_window: '2026-11-05' >= pageJ.startDate && '2026-11-05' <= pageJ.endDate,
  is_1105_inside_date_recent7: '2026-11-05' >= '2026-11-08',
  verdict: 'WINDOW_MISMATCH',
  explanation: '两者窗口不同：page 为 11-04~11-14 的 10 天窗口，date recent7 为 11-08~11-14。唯一 1 click 发生在 11-05，落在 page 窗口内、落在 date recent7 之外，故非数据矛盾，属窗口错位。',
  residual: 'page 维度该 click 归属首页，但 query 维度同窗 clicks 合计为 0；GSC 各维度独立聚合，query/page 精确交叉需 query+page 双维度 API，本次快照未含 → 归属精确映射标 UNKNOWN。'
}

// ---------------- A2: 410 关键词分层 ----------------
const ks = read('keyword-series.json')
const gsc = ks.gsc.keywords
const BRAND = /(bookconv|book conv|book-conv)/i
const latest = gsc.map(k => {
  const pts = k.points || []
  const p = pts[pts.length - 1]
  return { query: k.query, pos: p ? +Number(p.position).toFixed(1) : null, impr: p ? (p.impressions || 0) : 0, clicks: p ? (p.clicks || 0) : 0, n: pts.length }
})
const band = (pos) => pos == null ? 'unknown' : pos < 10 ? 'top10' : pos < 30 ? 'top30' : pos < 50 ? 'top50' : 'beyond50'
const tierOf = (q) => BRAND.test(q) ? 'brand' : 'nonbrand'
const tiers = { brand: 0, nonbrand: 0 }
const bands = {}
const brandClick = { brand: 0, nonbrand: 0 }
for (const r of latest) {
  tiers[tierOf(r.query)]++
  brandClick[tierOf(r.query)] += r.clicks
  const b = band(r.pos); bands[b] = (bands[b] || 0) + 1
}
const positions = latest.map(r => r.pos).filter(p => p != null).sort((a, b) => a - b)
const median = positions.length ? (positions[Math.floor(positions.length / 2)] + (positions.length % 2 ? 0 : positions[positions.length - 1 - Math.floor(positions.length / 2)])) / 2 : null
const beyond30 = ['top30', 'top50', 'beyond50'].reduce((s, b) => s + (bands[b] || 0), 0)
const withImpr = latest.filter(r => r.impr > 0)
out.A2 = {
  source: 'data/keyword-series.json (generatedAt ' + ks.generatedAt + ') gsc.keywords',
  total: gsc.length,
  note: '410 = 观测词集合，不是全量词库；不得称全量。',
  brand_split: tiers,
  clicks_by_brand: brandClick,
  position_bands: bands,
  beyond_top30_count: beyond30,
  beyond_top30_pct: +(beyond30 / gsc.length * 100).toFixed(1),
  median_position: median == null ? null : +median.toFixed(1),
  keywords_with_impressions: withImpr.length,
  top_opportunities_by_impressions: withImpr.sort((a, b) => b.impr - a.impr).slice(0, 15),
  url_attribution: 'UNKNOWN — keyword-series 为 query 级，无 query×page 交叉；精确 URL 归属需新增 GSC query+page 双维度 API 采集。'
}

// ---------------- A5: Bing 11-08 尖峰归因 ----------------
const bingQ = csv('www.bookconv.com_BingAPI_Query_2026_11_16.csv')
const bingP = csv('www.bookconv.com_BingAPI_PageTraffic_2026_11_16.csv')
// RankAndTraffic 是每日 3 列 (Date,Clicks,Impressions)，与 Query/Page 的周桶 6 列不同源，单独解析
const bingR = fs.readFileSync(path.join(RAW, 'www.bookconv.com_BingAPI_RankAndTraffic_2026_11_16.csv'), 'utf8').trim().split('\n').slice(1).map(l => {
  const [date, clicks, impressions] = l.split(',')
  return { date, clicks: +clicks || 0, impressions: +impressions || 0 }
})
const day = (rows, d) => rows.filter(r => r.date === d)
const d1108 = day(bingQ, '2026-11-08')
const d1108p = day(bingP, '2026-11-08')
// Query/Page 是周桶（每周六），验证是否含 11-08 单日
const qDates = [...new Set(bingQ.map(r => r.date))].sort()
const pDates = [...new Set(bingP.map(r => r.date))].sort()
const rt = (d) => bingR.find(r => r.date === d)
const recent7sum = bingR.filter(r => r.date >= '2026-11-02' && r.date <= '2026-11-08')
const prev7sum = bingR.filter(r => r.date >= '2026-10-26' && r.date <= '2026-11-01')
const recent7_ex1108 = recent7sum.filter(r => r.date !== '2026-11-08')
out.A5 = {
  source: 'www.bookconv.com_BingAPI_*.csv (2026_11_16 快照；本轮实时 Query 端点 ECONNRESET，故用快照)',
  data_granularity_finding: {
    rank_traffic: '每日粒度（含 11-08）',
    query_page: '周桶粒度（每周六：10-30 / 11-06 / 11-13 …），不含 11-08 单日行',
    query_dates_last5: qDates.slice(-5),
    page_dates_last5: pDates.slice(-5),
    has_1108_in_query: qDates.includes('2026-11-08'),
    has_1108_in_page: pDates.includes('2026-11-08')
  },
  rank_traffic_1108: rt('2026-11-08'),
  query_breakdown_1108: d1108.map(r => ({ query: r.query, clicks: r.clicks, impressions: r.impressions, pos: r.avgImpPos })).sort((a, b) => b.clicks - a.clicks),
  page_breakdown_1108: d1108p.map(r => ({ page: r.query, clicks: r.clicks, impressions: r.impressions })).sort((a, b) => b.clicks - a.clicks),
  weekly_bucket_containing_1108: day(bingQ, '2026-11-06').map(r => ({ query: r.query, clicks: r.clicks, impressions: r.impressions })).filter(r => r.clicks > 0).sort((a, b) => b.clicks - a.clicks).slice(0, 8),
  recent7_clicks: sum(recent7sum, 'clicks'),
  prev7_clicks: sum(prev7sum, 'clicks'),
  recent7_excluding_1108_clicks: sum(recent7_ex1108, 'clicks'),
  recent7_impressions: sum(recent7sum, 'impressions'),
  trend_verdict: 'NO_TREND_CLAIM',
  explanation: '11-08 单日 11 clicks 为尖峰（当日 176 impr）；recent7(11-02~11-08) 含该尖峰，剔除后与 prev7 接近，故不得宣称持续增长。',
  residual: 'Query/Page 为周桶，无法把 11-08 单日 11 clicks 归属到具体 query/page/referral；一次性外部来源或品牌词驱动无法用本快照证实 → 单日尖峰具体归因标 UNKNOWN，只能给出其所在周桶(11-06 起)的点击分布作为旁证，不作因果断言。'
}
console.log(JSON.stringify(out, null, 2))
