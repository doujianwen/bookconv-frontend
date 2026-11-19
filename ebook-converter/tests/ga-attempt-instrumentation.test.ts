import fs from 'node:fs'
import path from 'node:path'

/**
 * 埋点顺序守卫（2026-11-15）
 *
 * 不变量：`conversion_attempt` 必须在**任何终态事件之前**发出。
 * 原因：B6 的「终态 ≤ attempt + 容差」判据（scripts/lib/ga-attempt-closure.mjs）
 * 只在 attempt 先发的前提下成立。若有人后续把 attempt 挪到 file_upload 之后、
 * 或只给部分分支补 attempt，判据就会变成假门禁——这类"改动没报错但语义已破"的
 * 漂移，靠人眼 review 拦不住，必须由测试钉死。
 *
 * 这里刻意做**源码顺序断言**而不是渲染测试：两个调用点分别在 useCallback 与
 * 批量 worker 内部，渲染成本高且要 mock fetch/R2；而真正要守的是"谁先谁后"这一
 * 结构事实，顺序断言足够且便宜。
 */

const ROOT = path.resolve(__dirname, '..')

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8')
}

/** 返回 { ok, detail } 而不是直接 throw，便于负向对照复用同一判据。 */
export function attemptBeforeTerminals(src: string): { ok: boolean; detail: string } {
  const attempt = src.indexOf('"conversion_attempt"')
  if (attempt < 0) return { ok: false, detail: '未找到 conversion_attempt 埋点（事件被删除或改名）' }
  const terminals = ['"file_upload"', '"conversion_complete"', '"conversion_failed"']
    .map((t) => ({ t, i: src.indexOf(t) }))
    .filter((x) => x.i >= 0)
  if (terminals.length === 0) return { ok: false, detail: '未找到任何终态事件埋点（测试目标失效，需更新本守卫）' }
  const first = terminals.reduce((a, b) => (a.i <= b.i ? a : b))
  if (attempt > first.i) {
    return { ok: false, detail: `conversion_attempt(index ${attempt}) 晚于 ${first.t}(index ${first.i}) → 判据前提被破坏` }
  }
  return { ok: true, detail: `conversion_attempt(index ${attempt}) 早于 ${first.t}(index ${first.i})` }
}

describe('conversion_attempt 埋点顺序（B6 判据前提）', () => {
  test('单文件路径：attempt 在任何终态之前', () => {
    const r = attemptBeforeTerminals(read('src/app/[locale]/convert/[slug]/ToolPageClient.tsx'))
    expect(r.detail).toBeTruthy()
    expect(r.ok).toBe(true)
  })

  test('批量路径：attempt 在任何终态之前（含配额跳过分支）', () => {
    const src = read('src/components/tools/BatchUpload.tsx')
    const r = attemptBeforeTerminals(src)
    expect(r.ok).toBe(true)
    // 配额跳过会直接发 conversion_failed，attempt 必须仍在它前面
    const attempt = src.indexOf('"conversion_attempt"')
    const quotaFail = src.indexOf('"conversion_failed"')
    expect(attempt).toBeGreaterThanOrEqual(0)
    expect(attempt).toBeLessThan(quotaFail)
  })

  // 负向对照：证明判据真能抓到"顺序被改反/埋点被删"，而不是恒真
  test('负向对照：attempt 晚于终态时必须判失败', () => {
    const inverted = 'trackGAEvent("conversion_failed", {}); trackGAEvent("conversion_attempt", {})'
    expect(attemptBeforeTerminals(inverted).ok).toBe(false)
  })

  test('负向对照：埋点缺失时必须判失败', () => {
    expect(attemptBeforeTerminals('trackGAEvent("file_upload", {})').ok).toBe(false)
  })
})

/**
 * 前置拒绝细分守卫（2026-11-19 #6）
 *
 * 不变量：ToolPageClient 里 conversion_attempt **之后**、以 return 结束的两个前置守卫
 * （unsupported / magic_mismatch）发出的 file_rejected_client 必须带 error_code。
 * 原因：这两个分支发了 attempt 却无 conversion_failed 终态 → 是「未闭环 attempt」的构成；
 * 若 error_code 被删，这类拒绝就只能靠散落的 reason 字段区分，无法与统一 error_code
 * 归因并对接 advanced 的 rejected_by_code 模块（消费端），细分能力静默退化。
 *
 * 纯函数源码断言 + 负向对照，和 attemptBeforeTerminals 同风格：守的是结构事实，
 * 便宜且不依赖渲染。注意只检查 attempt 之后的分支；BatchUpload 加文件时的
 * file_rejected_client 发生在 attempt 之前，不属于本不变量，刻意不纳入。
 */
export function rejectedCarriesErrorCode(src: string): { ok: boolean; detail: string } {
  const calls = [...src.matchAll(/trackGAEvent\(\s*"file_rejected_client"\s*,\s*\{([\s\S]*?)\}\s*\)/g)]
  if (calls.length === 0) return { ok: false, detail: '未找到 file_rejected_client 埋点（测试目标失效）' }
  const missing = calls.filter((m) => !/error_code\s*:/.test(m[1]))
  if (missing.length) {
    return { ok: false, detail: `${missing.length}/${calls.length} 个 file_rejected_client 缺 error_code → 未闭环 attempt 无法按统一码细分` }
  }
  return { ok: true, detail: `${calls.length}/${calls.length} 个 file_rejected_client 均带 error_code` }
}

describe('前置拒绝细分埋点（#6 未闭环 attempt 归因）', () => {
  test('单文件路径：所有前置拒绝均带 error_code', () => {
    const r = rejectedCarriesErrorCode(read('src/app/[locale]/convert/[slug]/ToolPageClient.tsx'))
    expect(r.detail).toBeTruthy()
    expect(r.ok).toBe(true)
  })

  test('负向对照：删掉 error_code 必须判失败', () => {
    const stripped = `trackGAEvent("file_rejected_client", { source_format: "epub", reason: "magic_mismatch" })`
    expect(rejectedCarriesErrorCode(stripped).ok).toBe(false)
  })

  test('负向对照：部分分支缺 error_code 也必须判失败', () => {
    const mixed = `
      trackGAEvent("file_rejected_client", { reason: "unsupported_conversion", error_code: "UNSUPPORTED_CONVERSION" })
      trackGAEvent("file_rejected_client", { reason: "magic_mismatch" })
    `
    expect(rejectedCarriesErrorCode(mixed).ok).toBe(false)
  })
})
