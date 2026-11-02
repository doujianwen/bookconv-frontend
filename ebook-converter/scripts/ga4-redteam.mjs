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
 *   _wb_tmp/ga4-fetch-status.json  ← F1 成功写 ga4-live.json 时一并写（{ok,date,at,mtimeMs}）；缺失=未运行/失败
 *   _wb_tmp/ga4-live.json          ← fetch --write 产出（可能陈旧，须配 fetch-status 校验）
 *   _wb_tmp/ga-syntax.json         ← F2 产出
 *   _wb_tmp/ga-geo.json            ← F3 产出
 *   _wb_tmp/ga-syntax.json         ← F2 产出
 *   _wb_tmp/ga-geo.json            ← F3 产出
 * 输出：
 *   _wb_tmp/ga-redteam-latest.json ← { overall, counts, checks:[{id,name,level,verdict,evidence}] }
 * 退出码：恒 0（红队本身不阻断流水线；其结论由 ga-inspection 消费，决定是否发"全绿"）
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sumDirectUploadInfra } from './lib/ga-error-codes.mjs'

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
// 依赖 fetch-ga4-daily.mjs --write 成功时写的 ga4-fetch-status.json（{ok,date,at,mtimeMs}）。
// fetch 失败被 || true 容忍时，脚本 exit 1 且不写任何文件 → fetchStatus 缺失/陈旧 → B1 FAIL。
// 双判据：① fetchStatus.date === T-1；② fetchStatus.at 须在最近 30min 内（本轮新写，非历史遗留）；
// 二次校验 ga4-live.json mtime 与 fetchStatus.mtimeMs 一致（文件确为本轮重写）。
// 2026-10-31 实测：fetch failed → 既无 ga4-live.json 更新也无令牌 → 旧数据照常全绿，此检查独立抓出假成功。
{
  const name = '数据新鲜度'
  if (!fetchStatus || fetchStatus.ok !== true) {
    push('B1', name, 'P0', 'FAIL',
      `ga4-fetch-status.json.ok=${fetchStatus ? fetchStatus.ok : '缺失'} → F1 未成功拉取；ga4-live.json 可能复用旧数据，巡检"全绿"不可信`)
  } else if (fetchStatus.date !== T_MINUS_1) {
    push('B1', name, 'P0', 'FAIL',
      `fetch-status.date=${fetchStatus.date} ≠ 期望T-1 ${T_MINUS_1} → 数据非今日应拉取窗口，疑似陈旧`)
  } else {
    let ageMin = -1
    try { ageMin = (now - fetchStatus.at) / 60000 } catch { ageMin = -1 }
    if (ageMin < 0 || ageMin > 30) {
      push('B1', name, 'P0', 'FAIL',
        `fetch-status.at 写于 ${ageMin < 0 ? '未知' : ageMin.toFixed(0) + ' 分钟前'}（阈值 30min）→ 非本轮运行新写，F1 失败被 || true 容忍的典型假成功`)
    } else {
      let mtimeMatch = true
      try { mtimeMatch = fs.statSync(T('ga4-live.json')).mtimeMs === fetchStatus.mtimeMs } catch { mtimeMatch = false }
      if (!mtimeMatch) {
        push('B1', name, 'P0', 'FAIL', 'ga4-live.json mtime 与 fetch-status.mtimeMs 不一致 → 文件非本轮重写，数据陈旧')
      } else {
        push('B1', name, 'P0', 'PASS',
          `fetch 成功且 date=${fetchStatus.date}=T-1、${ageMin.toFixed(0)} 分钟前本轮新写、mtime 一致 → 数据新鲜`)
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

// ── B6 指标内部一致性（P0，2026-10-31 红队复核新增）──────────────────
// 抓「数据假成功」：事件计数口径错乱。
// ⚠️ 不变量纠正：不可写成「完成+失败 ≤ 上传」——conversion_failed 含客户端拦截
// (FILE_TOO_LARGE)，这类在提交前就被前端拦下、从不计 file_upload，故合法数据里
// 失败可合法超过上传。若照此写会制造假 FAIL（判据先测再采信，假门禁比没门禁更坏）。
// 正确不变量：到达引擎的终态 = 完成 + (失败 − FILE_TOO_LARGE) 必须 ≤ 上传数；
// 完成数更不可 > 上传数。违反 = 事件重复计数/口径错乱（物理不可能）。
{
  const name = '指标内部一致性'
  const u = Number(live?.events?.file_upload)
  const c = Number(live?.events?.conversion_complete)
  const f = Number(live?.events?.conversion_failed)
  const hasFec = !!live?.failedByErrorCode
  if (!Number.isFinite(u) || !Number.isFinite(c) || !Number.isFinite(f)) {
    push('B6', name, 'P0', 'UNKNOWN', '上传/完成/失败字段缺失或非数值，内部一致性不可判定')
  } else if (c > u) {
    push('B6', name, 'P0', 'FAIL', `完成 ${c} > 上传 ${u}（物理不可能：完成数不可超过提交数）→ 事件计数错乱`)
  } else if (hasFec) {
    // 客户端拦截型失败：提交前即被前端拦下、从不计 file_upload，故合法数据里
    // 失败可超过上传。共有两类（fetch-ga4-daily.mjs:135-137 同口径）：
    //   FILE_TOO_LARGE          — 单文件：客户端大小护栏拦截（ToolPageClient.tsx:202）
    //   CONVERSION_QUOTA_EXCEEDED — 批量：额度耗尽跳过，不发 file_upload（BatchUpload.tsx:355）
    // 仅剥 FILE_TOO_LARGE 会漏掉批量配额场景 → 制造假 FAIL（假门禁比没门禁更坏）。
    // 未到达 file_upload 阶段就结束的前置失败（三类，均从不计 file_upload）：
    //   FILE_TOO_LARGE           — 单文件：客户端大小护栏拦截（ToolPageClient.tsx:201）
    //   CONVERSION_QUOTA_EXCEEDED — 批量：额度耗尽跳过，不发 file_upload（BatchUpload.tsx）
    //   直传族（DIRECT_UPLOAD_FAILED 聚合旧码 + 2026-11-02 拆分的 PRESIGN_UNAVAILABLE/
    //     PRESIGN_ERROR/PUT_FAILED 三码）— R2 直传阶段基础设施失败
    //     （ToolPageClient.tsx 直传 catch→line 294 conversion_failed），统一经共享常量剥离，
    //     防「一码三处硬编码、漏改一处即假 FAIL」复发（2026-11-02 红队审计 G1/G3 实证）。
    // 注：直传族在此剥离"到达引擎终态"，但 error-handler 刻意不当作"用户侧拦截"
    // （要暴露基础设施故障，飞书归灰而非红）；此处仅为口径计算，不改变其告警语义。
    // 漏剥任一直传码 → 假 FAIL（2026-11-02 实测：8 次直传失败被误判"口径错乱"）。
    const ftl = Number(live.failedByErrorCode.FILE_TOO_LARGE) || 0
    const quota = Number(live.failedByErrorCode.CONVERSION_QUOTA_EXCEEDED) || 0
    const direct = sumDirectUploadInfra(live.failedByErrorCode)
    const preUploadFailures = ftl + quota + direct
    const reached = c + f - preUploadFailures
    // GA4 实时事件计数为近似（非精确事务），小量级 ±2 抖动常见；TOL 吸收抖动避免误判。
    const TOL = 2
    if (reached > u + TOL) push('B6', name, 'P0', 'FAIL', `到达引擎终态(完成+失败−前置失败${preUploadFailures})=${reached} > 上传 ${u}+容差${TOL}（事件重复计数/口径错乱，物理不可能）`)
    else push('B6', name, 'P0', 'PASS', `到达引擎终态 ${reached} ≤ 上传 ${u}+容差${TOL}（前置失败 FILE_TOO_LARGE=${ftl}+QUOTA=${quota}+直传族=${direct} 未计上传，口径自洽）`)
  } else {
    push('B6', name, 'P0', 'UNKNOWN', '缺 failedByErrorCode 无法剥离客户端拦截，仅凭 完成≤上传 验证，全量一致性不可判定')
  }
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
