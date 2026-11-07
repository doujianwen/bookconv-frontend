#!/usr/bin/env node
// verify-closure-gates.mjs — P0-1 关闭门禁校验（防假关闭）
//
// 痛点（红队 F1）：待办里「已关闭/✅/done」是手填标签，验收标准是同文件散文，
//   翻标签时 gate 从不被机器复核 → 2026-11-07 出现 R2 标「已关闭」但「连续3日PUT_FAILED≤2」
//   实际未满足（仅 11-06=0 一日期后数据）的假关闭。
//
// 本脚本：解析待办所有「关闭」项 → 抽取其数据类验收 gate → 用实时 GA4（离线快照降级）
//   重算 → 输出哪些关闭实际未达验收。让「关闭」成为 gate 派生状态，而非手填。
//
// 红队纪律：
//   - 判据无法执行 → UNKNOWN（不报 FAIL，禁假告警）
//   - 关闭项 gate 不通过 → FAIL → exit 1（真拦截假关闭）
//   - UNKNOWN 不阻断 exit（防报警疲劳），但显式标「未验证，需人工」
//   - 布局无关：F 段与 R 段表格列语义不同，故扫描「前两列」判关闭、全行搜 gate
//
// 用法：node scripts/verify-closure-gates.mjs [--no-live] [--todo=PATH]
//   --no-live   强制离线快照（不打 GA4 网络）
//   --todo=PATH 指定待办文件（默认仓库根的同名待办；反向验证用临时副本时传此参）

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const argTodo = process.argv.find((a) => a.startsWith('--todo='))
const TODO = argTodo ? argTodo.split('=').slice(1).join('=') : path.join(ROOT, '待办_2026-10-31_R2直传CORS与GA4行动项.md')
const SA = path.join(ROOT, 'scripts', 'gsc-service-account.json')
const PROPERTY_ID = '547131052'
const NO_LIVE = process.argv.includes('--no-live')

// ── 1. 解析待办表格 ───────────────────────────────────────────────
function parseTodo() {
  const text = fs.readFileSync(TODO, 'utf8')
  const rows = []
  for (const line of text.split('\n')) {
    const m = line.match(/^\|\s*\*\*(R\d+|F\d+)\*\*\s*\|(.*)\|\s*$/)
    if (!m) continue
    const cells = m[2].split('|').map((s) => s.trim())
    rows.push({ id: m[1].trim(), cells })
  }
  return rows
}

// 关闭判定（布局无关）：状态标签只可能落在前两列，且必为短单元格
// （R 段「✅ P0→…」在 cell[0]，F15「✅ 关闭 done」在 cell[1]；cell[1] 若是长描述则为事项列，不参与判定）
// ⚠️ 2026-11-07 红队实测缺陷修复：旧版逃生词扫「全行」，导致「状态已关闭 + 验收列残留『不关闭』」
//    的假关闭被静默跳过（注入 R2=已关闭 done 仍 exit 0 报「无假关闭」）。逃生词现与状态标签同域。
const STATUS_MAX = 60
function isClosed(r) {
  const status = r.cells.slice(0, 2).filter((c) => c && c.length <= STATUS_MAX)
  if (!status.length) return false
  const s = status.join(' ')
  if (/未关闭|不关闭|待观察|待复判|暂不关闭/.test(s)) return false
  return /关闭|done|closed/i.test(s)
}

// 抽取「连续 N 日 PUT_FAILED ≤ X」类数据 gate（全行搜索，覆盖 R2/F19 等直传族验收）
function extractPutGate(r) {
  for (const c of r.cells) {
    const m = c.match(/连续\s*(\d+)\s*日[^。]*?PUT_FAILED\s*[≤<=]+\s*(\d+)/i)
    if (m) return { days: Number(m[1]), threshold: Number(m[2]) }
  }
  return null
}

// 找「验收条件」文本（用于 UNKNOWN 提示）：优先含 gate 关键字的列，否则最长列
function acceptanceText(r) {
  const withGate = r.cells.find((c) => /PUT_FAILED|验收|连续\s*\d+\s*日/.test(c))
  if (withGate) return withGate
  return r.cells.slice(2).sort((a, b) => b.length - a.length)[0] || ''
}

// ── 2. GA4 取数（实时优先，离线快照降级）───────────────────────────
const ymd = (d) => new Date(d.getTime() + 8 * 3600 * 1000).toISOString().slice(0, 10).replace(/-/g, '')
const fmt = (s) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`

function latestAdvancedFile() {
  const dir = path.join(ROOT, '_wb_tmp')
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^ga4-advanced-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .reverse()
  return files.length ? path.join(dir, files[0]) : null
}

async function ga4PutFailed(days) {
  const sa = JSON.parse(fs.readFileSync(SA, 'utf8'))
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const iat = Math.floor(Date.now() / 1000)
  const jwt =
    b64({ alg: 'RS256', typ: 'JWT' }) +
    '.' +
    b64({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat,
      exp: iat + 3600,
    })
  const sig = crypto.createSign('RSA-SHA256').update(jwt).sign(sa.private_key, 'base64url')
  const tokR = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt + '.' + sig,
    }),
  })
  const tokJ = await tokR.json()
  if (!tokJ.access_token) throw new Error('token fail: ' + JSON.stringify(tokJ).slice(0, 200))
  const body = {
    dateRanges: [{ startDate: fmt(days[days.length - 1]), endDate: fmt(days[0]) }],
    dimensions: [{ name: 'date' }, { name: 'customEvent:error_code' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'conversion_failed' } },
    },
  }
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + tokJ.access_token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const j = await r.json()
  if (!r.ok) throw new Error(`GA4 ${r.status}: ${JSON.stringify(j).slice(0, 250)}`)
  const map = {}
  for (const row of j.rows || []) {
    const date = row.dimensionValues[0].value
    const code = row.dimensionValues[1].value
    const cnt = Number(row.metricValues[0].value) || 0
    if (code === 'DIRECT_UPLOAD_PUT_FAILED') map[date] = (map[date] || 0) + cnt
  }
  return days.map((d) => ({ date: d, count: map[d] || 0 }))
}

function fallbackPutFailed(days) {
  const f = latestAdvancedFile()
  if (!f) throw new Error('无离线 advanced 快照')
  const data = JSON.parse(fs.readFileSync(f, 'utf8'))
  const mod = data.modules && data.modules.failed_by_date_error_code
  if (!Array.isArray(mod)) throw new Error('快照无 failed_by_date_error_code')
  const set = new Set(days)
  const map = {}
  for (const row of mod) {
    if (row.error_code === 'DIRECT_UPLOAD_PUT_FAILED' && set.has(String(row.date)))
      map[row.date] = (map[row.date] || 0) + (Number(row.eventCount) || 0)
  }
  return days.map((d) => ({ date: d, count: map[d] || 0 }))
}

const CACHE = new Map()
async function getRecentPutFailed(days) {
  const key = days.join(',')
  if (CACHE.has(key)) return CACHE.get(key)
  let res
  if (NO_LIVE) {
    res = fallbackPutFailed(days)
    res._source = 'fallback:' + path.basename(latestAdvancedFile())
  } else {
    try {
      res = await ga4PutFailed(days)
      res._source = 'live'
    } catch (e) {
      try {
        res = fallbackPutFailed(days)
        res._source = 'fallback:' + path.basename(latestAdvancedFile())
      } catch (_) {
        throw e
      }
    }
  }
  CACHE.set(key, res)
  return res
}

// ── 3. 评估 gate ──────────────────────────────────────────────────
async function evalPutGate(gate) {
  const today = new Date()
  const days = []
  for (let i = 1; i <= gate.days; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(ymd(d))
  }
  const perDay = await getRecentPutFailed(days)
  const source = perDay._source || 'live'
  const fails = perDay.filter((d) => d.count > gate.threshold)
  const enough = perDay.length >= gate.days
  const ok = fails.length === 0 && enough
  return {
    ok,
    source,
    evidence: perDay.map((d) => `${fmt(d.date)}:${d.count}`).join(' / '),
    note: !enough
      ? `仅获 ${perDay.length}/${gate.days} 日数据`
      : ok
        ? '连续达标'
        : `超阈日: ${fails.map((d) => fmt(d.date)).join(',')}`,
  }
}

// ── 4. 主流程 ─────────────────────────────────────────────────────
async function main() {
  const rows = parseTodo()
  const out = []
  let closed = 0
  let invalid = 0
  let unknown = 0
  let passed = 0

  for (const r of rows) {
    if (!isClosed(r)) continue
    closed++
    const gate = extractPutGate(r)
    if (!gate) {
      unknown++
      out.push(`⚠️  UNKNOWN ${r.id}：关闭项，但验收无可自动校验的数据 gate（${acceptanceText(r).slice(0, 36)}…）→ 未验证，需人工核验`)
      continue
    }
    let res
    try {
      res = await evalPutGate(gate)
    } catch (e) {
      unknown++
      out.push(`⚠️  UNKNOWN ${r.id}：gate 执行失败（${e.message.slice(0, 70)}）→ 未验证，需人工核验`)
      continue
    }
    if (res.ok) {
      passed++
      out.push(`✅ PASS    ${r.id}：关闭项 gate 满足（${res.evidence}；${res.note}）[${res.source}]`)
    } else {
      invalid++
      out.push(`❌ FAIL    ${r.id}：关闭项 gate 未达成（${res.evidence}；${res.note}）→ 假关闭，需打回/降级 [${res.source}]`)
    }
  }

  // 主动情报：未关闭但含可校验 gate 的项（如 R2 当前），显示 gate 当前状态
  for (const r of rows) {
    if (isClosed(r)) continue
    const gate = extractPutGate(r)
    if (!gate) continue
    try {
      const res = await evalPutGate(gate)
      out.push(`ℹ️  INFO    ${r.id}（未关闭）：gate 当前状态（${res.evidence}；${res.note}）[${res.source}]`)
    } catch (_) {
      /* 离线不可用则跳过情报行 */
    }
  }

  console.log('=== 关闭门禁校验（防假关闭）===')
  console.log(`待办文件：${path.relative(ROOT, TODO)}`)
  for (const l of out) console.log(l)
  console.log(`\n汇总：关闭项 ${closed} → 通过 ${passed} / 未达成(假关闭) ${invalid} / 无法验证 ${unknown}`)
  console.log(invalid > 0 ? '❌ 存在假关闭，exit 1（拦截）' : '✅ 无假关闭')
  process.exit(invalid > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('脚本异常：', e.message)
  process.exit(2)
})
