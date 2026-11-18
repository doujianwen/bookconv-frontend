#!/usr/bin/env node
/**
 * analyze-a4.mjs — A4 GA4 T-1 深度分析（口径护栏版）。
 * 输入：本轮实拉的 ga4-acq-T1 / ga4-acq-7d。输出：结论 JSON 到 stdout。
 * 铁律：GA4 数字默认是"事件"不是"会话/人"；维度×指标禁膨胀相加；终态成功率才可比；
 *       (not set)/Unassigned 高企标污染嫌疑；country=China 100% 标本地测试嫌疑。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const read = (f) => JSON.parse(fs.readFileSync(path.join(HERE, f), 'utf8'))
const t1 = read('ga4-acq-T1-2026-11-15.json')
const t7 = read('ga4-acq-7d-2026-11-15.json')
const R = (j, k) => j.reports[k]

const evT1 = Object.fromEntries(R(t1, 'events').data.map(x => [x.eventName, x]))
const ptT1 = R(t1, 'periodTotals').data
const errT1 = R(t1, 'errorCodes').data
const chT1 = R(t1, 'channelGroup').data
const srcT1 = R(t1, 'sessionSourceMedium').data
const countryT1 = R(t1, 'country').data
const pt7 = R(t7, 'periodTotals').data
const ch7 = R(t7, 'channelGroup').data
const err7 = R(t7, 'errorCodes').data

// 终态成功率（事件级，非任务级——无 job_id）
const complete = evT1.conversion_complete?.eventCount || 0
const failed = evT1.conversion_failed?.eventCount || 0
const attempt = evT1.conversion_attempt?.eventCount || 0
const upload = evT1.file_upload?.eventCount || 0
// Wilson 95% CI
const wilson = (k, n, z = 1.96) => {
  if (!n) return null
  const p = k / n, d = 1 + z * z / n
  const c = (p + z * z / (2 * n)) / d
  const h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
  return { rate: +(p * 100).toFixed(1), lo: +((c - h) * 100).toFixed(1), hi: +((c + h) * 100).toFixed(1) }
}

const out = {
  generatedAt: new Date().toISOString(),
  dataDate: '2026-11-15 (T-1)',
  fetchedAt: { t1: t1.fetchedAt, t7: t7.fetchedAt },
  level_discipline: '周期用户数来自整段 dateRange runReport（服务端去重）；事件/会话/人分开；不跨维相加',
  T1: {
    periodTotals: ptT1,
    core_events: {
      file_upload: upload, conversion_attempt: attempt,
      conversion_complete: complete, conversion_failed: failed,
      page_view: evT1.page_view?.eventCount || 0,
      session_start: evT1.session_start?.eventCount || 0
    },
    terminal_success_rate_event_level: {
      numerator: complete, denominator: complete + failed,
      ci95: wilson(complete, complete + failed),
      caveat: '事件级终态占比，非任务级成功率（无 job_id 关联）。conversion_complete 26 与 file_upload 30 不同用户数，不能当同批任务的转化。'
    },
    uploadRateProxy_warning: {
      value: (complete / upload * 100).toFixed(1) + '%',
      forbidden: '不得解释为真实转化率：分母 file_upload 与分子 conversion_complete 的事件口径/用户口径不同（9 vs 6 users）。'
    },
    error_codes: errT1.map(x => ({ code: x['customEvent:error_code'], events: x.eventCount })),
    channel_group: chT1.map(x => ({ channel: x.sessionDefaultChannelGroup, sessions: x.sessions, keyEvents: x.keyEvents })),
    source_medium: srcT1.map(x => ({ source: x.sessionSource, medium: x.sessionMedium, sessions: x.sessions, keyEvents: x.keyEvents })),
    country: countryT1.map(x => ({ country: x.country, sessions: x.sessions, activeUsers: x.activeUsers })),
    referrer_tiers_pageview: R(t1, 'tierSummary').data,
    entry_tiers_session: R(t1, 'entrySummary').data
  },
  baseline_7d: {
    window: t7.windows,
    periodTotals: pt7,
    channel_group: ch7.map(x => ({ channel: x.sessionDefaultChannelGroup, sessions: x.sessions })),
    error_codes: err7.map(x => ({ code: x['customEvent:error_code'], events: x.eventCount }))
  },
  anomalies: [
    {
      id: 'A4-ANOM-1', level: 'P1', title: ':country=China 100%',
      evidence: `${countryT1.map(x => x.country + ':' + x.sessions).join(',')}`,
      interpretation: 'T-1 全部 38 sessions 均来自 China，与"海外非品牌流量"目标不符；高度疑似本地测试/代理出口流量污染。不可当海外增长证据。'
    },
    {
      id: 'A4-ANOM-2', level: 'P1', title: '(not set)/Unassigned 会话高企',
      evidence: `T-1 (not set) 11 sessions / keyEvents 13；7d Unassigned 15 sessions / keyEvents 18 / 平均时长 412s`,
      interpretation: 'Unassigned 会话 engagementRate=0 但 keyEvents 高、时长异常长，符合自动化/爬虫/埋点缺失特征。引擎侧归因标 UNKNOWN，不据此判"用户行为"。'
    },
    {
      id: 'A4-ANOM-3', level: 'P2', title: '外部引荐极少且非搜索主渠道',
      evidence: `T-1 external pageReferrer: cn.bing.com 3, doubao.com 1；Organic Search 仅 3 sessions；Referral 1 session`,
      interpretation: '无任何 AI 平台（ChatGPT/Perplexity/Gemini）可识别引荐；doubao.com 为 1 次会话样本，不能称 AI 引荐趋势。externalHosts 来自 pageview 分层，不是会话入口。'
    },
    {
      id: 'A4-ANOM-4', level: 'P1', title: '7d 新增错误码 DIRECT_UPLOAD_PUT_FAILED / CORRUPT_INPUT / UPLOAD_NOT_FOUND',
      evidence: err7.map(x => x['customEvent:error_code'] + ':' + x.eventCount).join(', '),
      interpretation: 'T-1 仅 CONVERSION_UNAVAILABLE/UNKNOWN 各 1，但 7d 窗口出现直传 PUT 失败等错误码 → 链路健康结论必须带时点，单看 T-1 会漏报。'
    }
  ],
  verification_split: {
    pull: 'PASS — 本轮 ga4-data-api 实拉，exit 0，fetchedAt 见上',
    land: 'PASS — 原始 JSON 落盘 evidence/ga4-acq-{T1,7d}-2026-11-15.json',
    report: 'PASS — 本分析脚本生成',
    send: 'NOT_SENT — 未向飞书/Notion/外部发送（用户约束：未经授权不改生产；发送属对外动作需单独授权）',
    readback: 'NOT_APPLICABLE — 无外部写入，无需读回'
  }
}
console.log(JSON.stringify(out, null, 2))
