#!/usr/bin/env node
/**
 * ga4-redteam.mjs — GA4 每日巡检「执行结果」红队审计（Part B）
 *
 * 红队定位：对 Part A 四步（fetch / syntax / geo / inspection）的产出做独立质疑，
 * 重点抓「假成功」——尤其 fetch 失败被 || true 容忍、旧数据照常"全绿"的盲区。
 * （2026-10-31 20:15/21:21 实测踩坑：fetch failed → ga4-live.json 未更新 →
 *  ga-inspection 用旧数据发全绿，红队缺位导致假成功未被拦截。）
 *
 * 判据纪律（项目 MEMORY 铁律：假门禁比没门禁更坏 / 不可判定报 UNKNOWN / 判据先测再采信）：
 *   每个检查返回 PASS / FAIL / UNKNOWN 三态 + 证据字符串，禁止假 PASS、禁止空话。
 *
 * 输入（Part A 产出）：
 *   _wb_tmp/ga4-fetch-status.json  ← F1 写好（{ok, freshMtime, date, at}）；缺失=未运行
 *   _wb_tmp/ga4-live.json          ← fetch --write 产出（注意：可能陈旧！）
 *   _wb_tmp/ga-syntax.json         ← F2 产出
 *   _wb_tmp/ga-geo.json            ← F3 产出
 * 输出：
 *   _wb_tmp/ga-redteam-latest.json ← { overall, counts, checks:[{id,name,level,verdict,evidence}] }
 * 退出码：恒 0（红队本身不阻断流水线；其结论由 ga-inspection 消费，决定是否发"全绿"）
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
// T-1 日期（与 fetch-ga4-daily 同口径：本地时区切片，防 GMT+8 早 8 点前错算前天）
const y = new Date(Date.now() - 864e5)
const local = new Date(y.getTime() - y.getTimezoneOffset() * 60000)
const T_MINUS_1 = local.toISOString().slice(0, 10)

const fetchStatus = readJson('ga4-fetch-status.json')
const live = readJson('ga4-live.json')
const syntax = readJson('ga-syntax.json')
const geo = readJson('ga-geo.json')

const checks = []
const push = (id, name, level, verdict, evidence) => checks.push({ id, name, level, verdict, evidence })

// ── B1 数据新鲜度（P0，防假成功核心）─────────────────────────────────
{
  const name = '数据新鲜度'
  if (!fetchStatus || fetchStatus.ok !== true) {
    push('B1', name, 'P0', 'FAIL',
      `fetch-status.ok=${fetchStatus ? fetchStatus.ok : '缺失'} → F1 未成功拉取；ga4-live.json 可能复用旧数据，巡检"全绿"不可信`)
  } else {
    const liveDate = live?.date
    if (liveDate !== T_MINUS_1) {
      push('B1', name, 'P0', 'FAIL',
        `ga4-live.json.date=${liveDate} ≠ 期望T-1 ${T_MINUS_1} → 数据非今日应拉取窗口，疑似陈旧`)
    } else {
      // mtime 比对：文件确为本轮 fetch 重写（而非历史遗留）
      let mtimeMatch = true
      try { mtimeMatch = fs.statSync(T('ga4-live.json')).mtimeMs === fetchStatus.freshMtime } catch { mtimeMatch = false }
      if (!mtimeMatch) {
        push('B1', name, 'P0', 'FAIL', `ga4-live.json mtime 与 fetch-status.freshMtime 不一致 → 文件非本轮重写，数据陈旧`)
      } else {
        push('B1', name, 'P0', 'PASS', `fetch 成功且 ga4-live.json.date=${liveDate}=T-1、mtime 与本轮一致，数据新鲜`)
      }
    }
  }
}

// ── B2 失败归因可信度（P1）──────────────────────────────────────────
{
  const name = '失败归因可信度'
  const fec = live?.failedByErrorCode
  const failed = Number(live?.events?.conversion_failed) || 0
  if (!fec || typeof fec !== 'object' || Object.keys(fec).length === 0) {
    push('B2', name, 'P1', 'UNKNOWN',
      `failedByErrorCode 缺失/为空 → 失败无法三分类（客户端/额度/引擎），归因不可判定`)
  } else {
    const unknown = Number(fec.UNKNOWN) || 0
    const ratio = failed > 0 ? unknown / failed : 0
    if (ratio > 0.5) push('B2', name, 'P1', 'FAIL', `UNKNOWN 占比 ${(ratio * 100).toFixed(0)}% > 50% → 失败明细大半不可判定，归因存疑`)
    else push('B2', name, 'P1', 'PASS', `failedByErrorCode 齐备，UNKNOWN 占比 ${(ratio * 100).toFixed(0)}%（失败${failed}次）`)
  }
}

// ── B3 指标口径完整（P1）────────────────────────────────────────────
{
  const name = '指标口径完整'
  const hasRate = typeof live?.conversionRate === 'string'
  const hasFec = !!live?.failedByErrorCode
  if (hasRate && hasFec) push('B3', name, 'P1', 'PASS', '同时提供完成率与 error_code 明细，可算真实成功率(完成/(完成+失败))与引擎侧成功率')
  else if (hasRate) push('B3', name, 'P1', 'UNKNOWN', '仅完成率、缺 error_code 明细 → 真实成功率不可算')
  else push('B3', name, 'P1', 'FAIL', '缺完成率与失败明细字段，指标口径不完整')
}

// ── B4 门禁完整性（P1）──────────────────────────────────────────────
{
  const name = '门禁完整性'
  const issues = []
  if (!syntax) issues.push('ga-syntax.json 缺失（F2 未运行）')
  else if (syntax.ok !== true) issues.push(`syntax FAIL: ${syntax.detail}`)
  if (!geo) issues.push('ga-geo.json 缺失（F3 未运行）')
  else if (geo.ok !== true) issues.push(`geo FAIL: ${geo.detail}`)
  const m = syntax?.detail?.match(/parsed\s+(\d+)\s+file/)
  if (m && Number(m[1]) <= 0) issues.push('syntax parsed 文件数 ≤ 0（疑似未真扫全量）')
  if (issues.length) push('B4', name, 'P1', 'FAIL', issues.join('；'))
  else push('B4', name, 'P1', 'PASS', `syntax ok (${syntax.detail})；geo ok (${geo.detail})`)
}

// ── B5 飞书结论可信（P0，依赖 B1）───────────────────────────────────
{
  const name = '飞书结论可信'
  const b1 = checks.find((c) => c.id === 'B1')
  if (b1 && b1.verdict !== 'PASS') {
    push('B5', name, 'P0', 'FAIL', `B1 未 PASS → 飞书不应发"全绿"，否则为假成功；须改为"⚠️ 数据未刷新，结论不可信"`)
  } else {
    push('B5', name, 'P0', 'PASS', 'B1 PASS → 飞书可基于有效数据发送巡检结论')
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

const out = { generatedAt: now.toISOString(), overall, counts, checks }
fs.writeFileSync(T('ga-redteam-latest.json'), JSON.stringify(out, null, 2))
console.log(`🛡️ [红队·执行结果] overall=${overall} PASS=${counts.PASS} FAIL=${counts.FAIL} UNKNOWN=${counts.UNKNOWN}`)
for (const c of checks) console.log(`  ${c.level} ${c.id} ${c.verdict} ${c.name} — ${c.evidence}`)
process.exit(0)
