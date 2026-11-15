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
