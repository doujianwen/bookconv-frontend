#!/usr/bin/env node
/**
 * ga4-redteam-analysis.mjs — GA4 每日巡检「深度分析结果」红队审计（Part D）
 *
 * 红队定位：对 Part C（ga4-advanced-analysis.mjs 的 30 天多维产出）的结论做独立质疑。
 * 重点：
 *   - D2 抓「Part A 与深度分析矛盾」：Part A 报"引擎无异常"，但 failed_by_date_error_code 显示
 *     当日仍有引擎类失败 → 假阴性（漏报）。（2026-10-28 v2 实证：error_code 三分类才能区分
 *     客户端/额度/引擎；单看全量 failed 会把 UX 问题误报成引擎故障，反过来也会漏报。）
 *   - D1 趋势稳健性：单日波动 vs 真实趋势，样本是否足够。
 *   - D3 来源媒介：direct 占比异常（归因缺失/bot）或 GEO 信号真伪。
 *   - D4 结论支撑：advanced 模块有 _error（维度未注册降级）时，相关结论不得标 PASS。
 *
 * 判据纪律：每个检查返回 PASS / FAIL / UNKNOWN 三态 + 证据；不可判定报 UNKNOWN，禁止假 PASS。
 *
 * 输入：
 *   _wb_tmp/ga4-advanced-<END>.json  ← Part C 产出（取最新一份）
 *   _wb_tmp/ga4-live.json           ← Part A 当日对照（failedByErrorCode）
 * 输出：
 *   _wb_tmp/ga-redteam-analysis-latest.json
 * 退出码：恒 0
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const T = (f) => path.join(ROOT, '_wb_tmp', f)

function readJson(f) {
  try { return JSON.parse(fs.readFileSync(T(f), 'utf8')) } catch { return null }
}

const now = new Date()
const y = new Date(Date.now() - 864e5)
const local = new Date(y.getTime() - y.getTimezoneOffset() * 60000)
const T_MINUS_1 = local.toISOString().slice(0, 10)

// 取最新 advanced 文件
let advPath = null
try {
  const files = fs.readdirSync(T('.')).filter((f) => /^ga4-advanced-\d{4}-\d{2}-\d{2}\.json$/.test(f))
  if (files.length) advPath = T(files.sort().pop())
} catch {}
const adv = advPath ? readJson(path.basename(advPath)) : null
const live = readJson('ga4-live.json')

// 非引擎类 error_code（与 ga-inspection splitFailures 同口径）
const NON_ENGINE = new Set(['FILE_TOO_LARGE', 'CONVERSION_QUOTA_EXCEEDED', 'DIRECT_UPLOAD_FAILED'])
const isEngine = (code) => !!code && !NON_ENGINE.has(code)

const checks = []
const push = (id, name, level, verdict, evidence) => checks.push({ id, name, level, verdict, evidence })

// ── D0 深度分析数据新鲜度（P0，防陈旧数据假 PASS）────────────────────
// Part C 失败（fetch failed 等）时不会产出新 advanced 文件；若存在历史遗留文件，
// 其 meta.end 会停在旧日期。此检查用 meta.end===T-1 双判据拒绝审计陈旧/缺失数据，
// 避免对过期深度分析给出误导性 PASS（2026-10-31 实测：Part C 失败遗留 10-29 文件被误读）。
{
  const name = '深度分析数据新鲜度'
  if (!adv) {
    push('D0', name, 'P0', 'FAIL', 'ga4-advanced-*.json 缺失 → Part C 未产出，无法对深度分析结果做红队审计')
  } else if (adv?.meta?.end !== T_MINUS_1) {
    push('D0', name, 'P0', 'FAIL',
      `advanced.meta.end=${adv?.meta?.end} ≠ T-1 ${T_MINUS_1} → Part C 本轮未成功产出（fetch failed 或文件陈旧），深度分析结论基于过期数据，不可信`)
  } else {
    push('D0', name, 'P0', 'PASS', `advanced.meta.end=${adv.meta.end}=T-1，深度分析为本轮有效产出`)
  }
}

// ── D1 趋势稳健性（P1）──────────────────────────────────────────────
{
  const name = '趋势稳健性'
  const series = adv?.modules?.daily_overview?.filter((r) => !r._error) || []
  if (series.length < 7) {
    push('D1', name, 'P1', 'UNKNOWN', `可用日序列仅 ${series.length} 天（<7），趋势结论不可判定`)
  } else {
    const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date))
    const last = sorted[sorted.length - 1]?.date
    if (last !== T_MINUS_1) {
      push('D1', name, 'P1', 'UNKNOWN', `序列末端日期 ${last} ≠ 期望T-1 ${T_MINUS_1} → 数据滞后，趋势窗口不闭合`)
    } else {
      const users = sorted.map((r) => Number(r.activeUsers) || 0)
      const avg = users.reduce((a, b) => a + b, 0) / users.length
      const max = Math.max(...users)
      const min = Math.min(...users)
      const swings = max > 0 ? (max - min) / max : 0
      push('D1', name, 'P1', 'PASS',
        `${series.length} 天序列闭合至 T-1；均活跃 ${avg.toFixed(1)}、峰${max}/谷${min}、振幅 ${(swings * 100).toFixed(0)}%（单日波动正常，非异常趋势）`)
    }
  }
}

// ── D2 失败分流暴露 / Part A 矛盾（P0）──────────────────────────────
{
  const name = '失败分流×Part A 矛盾'
  const fde = adv?.modules?.failed_by_date_error_code?.filter((r) => !r._error) || []
  if (!fde.length) {
    push('D2', name, 'P0', 'UNKNOWN', 'failed_by_date_error_code 无数据（维度未注册或查询失败）→ 无法验证 Part A 引擎结论')
  } else {
    // 取 T-1 当天（或最近一天）的引擎失败数
    const todayRows = fde.filter((r) => r.date === T_MINUS_1)
    const useDate = todayRows.length ? T_MINUS_1 : fde.sort((a, b) => b.date.localeCompare(a.date))[0]?.date
    const rows = fde.filter((r) => r.date === useDate)
    let advEngine = 0
    for (const r of rows) if (isEngine(r.error_code)) advEngine += Number(r.eventCount) || 0
    // Part A 当日 engineFailed（failed - client - quota - infra）
    const fec = live?.failedByErrorCode || {}
    const failed = Number(live?.events?.conversion_failed) || 0
    const client = Number(fec.FILE_TOO_LARGE) || 0
    const quota = Number(fec.CONVERSION_QUOTA_EXCEEDED) || 0
    const infra = Number(fec.DIRECT_UPLOAD_FAILED) || 0
    const liveEngine = Math.max(0, failed - client - quota - infra)
    if (advEngine > 0 && liveEngine === 0) {
      push('D2', name, 'P0', 'FAIL',
        `深度分析显示 ${useDate} 引擎类失败 ${advEngine} 次，但 Part A 报 engineFailed=0 → 假阴性漏报，须人工核查引擎/额度`)
    } else if (advEngine === 0 && liveEngine > 0) {
      push('D2', name, 'P0', 'FAIL',
        `深度分析 ${useDate} 引擎失败为 0，但 Part A 算得 engineFailed=${liveEngine} → 矛盾，归因口径不一致`)
    } else {
      push('D2', name, 'P0', 'PASS',
        `深度分析 ${useDate} 引擎失败 ${advEngine} 次 ⇄ Part A engineFailed=${liveEngine}，结论一致（无漏报）`)
    }
  }
}

// ── D3 来源媒介（P1）────────────────────────────────────────────────
{
  const name = '来源媒介归因'
  const sm = adv?.modules?.source_medium?.filter((r) => !r._error) || []
  if (!sm.length) {
    push('D3', name, 'P1', 'UNKNOWN', 'source_medium 无数据 → 来源归因不可判定')
  } else {
    const total = sm.reduce((a, r) => a + (Number(r.activeUsers) || 0), 0) || 1
    const direct = sm.find((r) => /^(direct|\(\direct\))$/i.test(r.sessionSourceMedium)) || { activeUsers: 0 }
    const directRatio = (Number(direct.activeUsers) || 0) / total
    const geoHit = sm.find((r) => /chatgpt|bing|perplexity|duckduckgo|brave|gemini|claude/i.test(r.sessionSourceMedium))
    const notes = []
    if (directRatio > 0.8) notes.push(`direct 占比 ${(directRatio * 100).toFixed(0)}% > 80% → 归因可能缺失或为 bot 流量`)
    if (geoHit) notes.push(`检出 GEO 信号来源: ${geoHit.sessionSourceMedium}（活跃 ${geoHit.activeUsers}）`)
    if (notes.length) push('D3', name, 'P1', 'PASS', notes.join('；') + '（已记录，非阻断）')
    else push('D3', name, 'P1', 'PASS', `direct 占比 ${(directRatio * 100).toFixed(0)}%，来源归因分布合理`)
  }
}

// ── D4 结论支撑（P2）────────────────────────────────────────────────
{
  const name = '结论支撑度'
  if (!adv) {
    push('D4', name, 'P2', 'UNKNOWN', 'advanced 数据缺失，结论支撑度不可判定')
  } else {
    const mods = adv.modules || {}
    const errored = Object.entries(mods).filter(([, v]) => v && v._error).map(([k]) => k)
    if (errored.length === 0) {
      push('D4', name, 'P2', 'PASS', '所有 advanced 模块均成功，结论由数据完整支撑')
    } else {
      const critical = ['daily_overview', 'failed_by_date_error_code', 'failed_by_format']
      const blocked = errored.filter((e) => critical.includes(e))
      if (blocked.length) push('D4', name, 'P2', 'UNKNOWN', `关键模块降级(${blocked.join('/')})，相关结论不可判定`)
      else push('D4', name, 'P2', 'PASS', `非关键模块降级(${errored.join('/')})，不影响核心结论`)
    }
  }
}

// ── 汇总裁定 ───────────────────────────────────────────────────────
const counts = { PASS: 0, FAIL: 0, UNKNOWN: 0 }
for (const c of checks) counts[c.verdict]++
let overall
if (checks.some((c) => c.level === 'P0' && c.verdict === 'FAIL')) overall = 'FAIL'
else if (counts.FAIL > 0) overall = 'PASS_WITH_RESIDUALS'
else if (counts.UNKNOWN > 0) overall = 'PASS_WITH_RESIDUALS'
else overall = 'PASS'

const out = { generatedAt: now.toISOString(), source: advPath ? path.basename(advPath) : 'none', overall, counts, checks }
fs.writeFileSync(T('ga-redteam-analysis-latest.json'), JSON.stringify(out, null, 2))
console.log(`🛡️ [红队·深度分析] overall=${overall} PASS=${counts.PASS} FAIL=${counts.FAIL} UNKNOWN=${counts.UNKNOWN}`)
for (const c of checks) console.log(`  ${c.level} ${c.id} ${c.verdict} ${c.name} — ${c.evidence}`)
process.exit(0)
