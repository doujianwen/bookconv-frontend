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
import { normalizeGaDate, dailyWindow } from './lib/ga-date.mjs'
import { isEngineFailureCode } from './lib/ga-error-codes.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
// 测试钩子：WB_TMP_DIR 指向临时目录即可做「注入事故 → 判定翻转 → 恢复 → 判定复原」，
// 证明判据真的有效（只跑当前状态不算验证）。不设时默认 ROOT/_wb_tmp，行为不变。
const TMP_DIR = process.env.WB_TMP_DIR ? path.resolve(process.env.WB_TMP_DIR) : path.join(ROOT, '_wb_tmp')
const T = (f) => path.join(TMP_DIR, f)

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

// 非引擎类 error_code 的判定统一走共享常量（scripts/lib/ga-error-codes.mjs）。
// 2026-11-15 收口：此前本文件自建 NON_ENGINE + D2 里手算
// `liveEngine = failed − FILE_TOO_LARGE − quota − 直传族`，**漏了 USER_INPUT_CODES**，
// 与 Part A 的 splitFailures 口径失配 —— 一旦出现 UPLOAD_EMPTY 就会判「矛盾」（假 FAIL）。
// 红队审计 2026-11-02 G3 已实证过「一码多处硬编码、漏改一处即误判」，故统一 import。
const isEngine = isEngineFailureCode

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
    const window = dailyWindow(series, T_MINUS_1)
    const sorted = window.rows
    if (!window.ok) {
      // 点名缺哪几天，而不是只报"有缺口"——2026-11-15 实测缺 20261112，
      // 只说"缺口"会让人无法判断是阈值化抑制还是真丢数。
      const present = new Set(window.rows.map((r) => r.date))
      const missing = []
      if (window.rows.length) {
        const cur = new Date(window.rows[0].date + 'T00:00:00Z')
        const last = new Date(T_MINUS_1 + 'T00:00:00Z')
        while (cur <= last) {
          const k = cur.toISOString().slice(0, 10)
          if (!present.has(k)) missing.push(k)
          cur.setUTCDate(cur.getUTCDate() + 1)
        }
      }
      const missNote = missing.length ? `（缺 ${missing.slice(0, 5).join(',')}${missing.length > 5 ? ' 等' : ''}）` : ''
      push('D1', name, 'P1', 'UNKNOWN', `${window.reason}${missNote} → 趋势窗口不闭合，趋势结论不可判定（累计数须按实到天数口径引用）`)
    } else {
      const users = sorted.map((r) => Number(r.activeUsers) || 0)
      const avg = users.reduce((a, b) => a + b, 0) / users.length
      const max = Math.max(...users)
      const min = Math.min(...users)
      const swings = max > 0 ? (max - min) / max : 0
      // 2026-11-15：用户级序列闭合 ≠ 事件级闭合。实测 11-14 窗口 daily_overview 有 31 天，
      // 而 daily_events 缺 20261112 ⇒ 所有"30 天累计/失败分流"少算一天。
      // 因此不能只看 daily_overview 就给 PASS：件级缺口会让基于事件的趋势/累计失真，
      // 故降为 UNKNOWN，并在证据里写清"坏的是事件层，用户层是闭合的"。
      const cov = adv?.meta?.dayCoverage
      if (cov && cov.complete === false) {
        // 措辞精确到"哪一层不可判定"：用户级序列是闭合的，坏的是事件级。
        push('D1', name, 'P1', 'UNKNOWN',
          `用户级 ${series.length} 天序列闭合至 T-1（均活跃 ${avg.toFixed(1)}、峰${max}/谷${min}），但事件级缺 ${cov.missing.join(',')}（${cov.present}/${cov.expected} 天）→ 基于事件的累计/趋势结论不可判定，须按实到天数口径引用`)
      } else {
        push('D1', name, 'P1', 'PASS',
          `${series.length} 天序列闭合至 T-1；均活跃 ${avg.toFixed(1)}、峰${max}/谷${min}、振幅 ${(swings * 100).toFixed(0)}%。日期完整性通过；描述性振幅不能单独证明趋势正常或异常。`)
      }
    }
  }
}

// ── D2 失败分流暴露 / Part A 矛盾（P0）──────────────────────────────
// 2026-11-15 重写（治理「零失败 fallback 假阳性」）：
// 旧实现有三个静默漏洞，都会落进 PASS：
//   ① Part A 缺基线（ga4-live.json 缺失 / events.conversion_failed 非数值）时
//      Number(undefined)=NaN→||0→0，与 advanced 的 0 比对得出"结论一致"——把
//      **没有数据**说成"没有漏报"。
//   ② T-1 无明细行时回退到 `最近一天`（fde.sort(...)[0]），却仍拿 T-1 的 live 去比 →
//      跨日错配，旧日期的 0 撞上新日期，随机给出 PASS/FAIL。
//   ③ 手算 liveEngine 漏 USER_INPUT_CODES，与 Part A splitFailures 不同源 → 假 FAIL。
// 现在：无基线 → UNKNOWN；无 T-1 明细且 Part A 有失败 → FAIL（当日明细缺失）；
// 无 T-1 明细且 Part A 零失败 → PASS 但必须显式声明"两侧均零且数据在位"；
// 有明细 → 只比同一天（禁止跨日 fallback）。
{
  const name = '失败分流×Part A 矛盾'
  const fde = adv?.modules?.failed_by_date_error_code?.filter((r) => !r._error).map(r => ({ ...r, date: normalizeGaDate(r.date) })) || []
  const failedRaw = live?.events?.conversion_failed
  const hasLiveBaseline = !!live && failedRaw !== null && failedRaw !== undefined && Number.isFinite(Number(failedRaw))
  const fec = live?.failedByErrorCode

  if (!fde.length) {
    push('D2', name, 'P0', 'UNKNOWN', 'failed_by_date_error_code 无数据（维度未注册或查询失败）→ 无法验证 Part A 引擎结论')
  } else if (fde.some(r => !r.date)) {
    push('D2', name, 'P0', 'UNKNOWN', '失败明细包含缺失或无效日期，不能与Part A按日对照')
  } else if (!hasLiveBaseline) {
    // 关键：没有 Part A 基线时，"两侧都 0" 不是一致，而是不可判定。
    push('D2', name, 'P0', 'UNKNOWN',
      'ga4-live.json 缺失或 events.conversion_failed 非数值 → 无 Part A 基线；此时零失败不可视为「一致」（旧实现即在此假 PASS）')
  } else {
    const failed = Number(failedRaw) || 0
    let liveEngine = 0
    let liveFecTotal = 0
    for (const [code, v] of Object.entries(fec || {})) {
      const n = Number(v) || 0
      liveFecTotal += n
      if (isEngine(code)) liveEngine += n
    }
    const t1Rows = fde.filter((r) => r.date === T_MINUS_1)
    const evidenceBase = `Part A: failed=${failed}、error_code 合计=${liveFecTotal}、engineFailed=${liveEngine}`

    if (!t1Rows.length) {
      if (failed === 0) {
        push('D2', name, 'P0', 'PASS',
          `${T_MINUS_1} 两侧均零失败：Part A failed=0 且 advanced 无当日失败明细（数据在位，非缺失造成）→ 一致`)
      } else {
        push('D2', name, 'P0', 'FAIL',
          `Part A 报 ${T_MINUS_1} 失败 ${failed} 次，但 advanced 当日无任何失败明细行 → 深度分析当日数据缺失（窗口/维度可疑），不可视为无漏报`)
      }
    } else if (failed > 0 && (!fec || typeof fec !== 'object' || liveFecTotal === 0)) {
      push('D2', name, 'P0', 'UNKNOWN',
        `Part A 报失败 ${failed} 次但缺 error_code 明细（failedByErrorCode 空/降级）→ 引擎失败不可拆，无法与深度分析同日比对`)
    } else if (failed > 0 && Math.abs(liveFecTotal - failed) > 2) {
      push('D2', name, 'P0', 'UNKNOWN',
        `${evidenceBase}：明细合计与失败总数相差 ${Math.abs(liveFecTotal - failed)}（>2）→ Part A 基线自身不闭合，比对结论不可靠`)
    } else {
      let advEngine = 0
      for (const r of t1Rows) if (isEngine(r.error_code)) advEngine += Number(r.eventCount) || 0
      if (advEngine > 0 && liveEngine === 0) {
        push('D2', name, 'P0', 'FAIL',
          `深度分析显示 ${T_MINUS_1} 引擎类失败 ${advEngine} 次，但 Part A 报 engineFailed=0 → 假阴性漏报，须人工核查引擎/额度`)
      } else if (advEngine === 0 && liveEngine > 0) {
        push('D2', name, 'P0', 'FAIL',
          `${T_MINUS_1} 深度分析引擎失败为 0，但 ${evidenceBase} → 矛盾，归因口径不一致`)
      } else {
        push('D2', name, 'P0', 'PASS',
          `${T_MINUS_1} 同日同口径：深度分析引擎失败 ${advEngine} 次 ⇄ ${evidenceBase}，结论一致（无漏报）`)
      }
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
