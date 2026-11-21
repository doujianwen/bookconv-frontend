import fs from 'node:fs'
import path from 'node:path'

/**
 * M8-19 下载与批量观测守卫（2026-11-20）
 *
 * 守三条结构不变量，沿用 ga-attempt-instrumentation.test.ts 的源码断言 + 负向对照风格：
 *  1. 单文件真实下载入口（BeforeAfterComparison 的 <a download>）发 download_clicked。
 *  2. 批量真实下载入口（BatchUpload.handleDownloadZip）发 download_clicked，带 batch_id 与统计。
 *  3. 批量 batch_id 在每个子任务的 conversion_attempt 之前生成（否则无法作父 ID 关联）。
 *  4. download_clicked 事件参数不含文件名/内容/用户身份字段（隐私边界）。
 *
 * 刻意用源码断言而非渲染测试：真正要守的是「埋点是否存在、顺序是否正确、参数是否越界」
 * 这些结构事实，渲染测试成本高且不直接覆盖这些点。
 */

const ROOT = path.resolve(__dirname, '..')

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8')
}

const SINGLE = 'src/components/tools/BeforeAfterComparison.tsx'
const BATCH = 'src/components/tools/BatchUpload.tsx'

/** 隐私边界判据：download_clicked 事件参数不得含文件名/内容/身份字段。返回 {ok,detail} 便于负向对照复用。 */
export function downloadEventsCarryNoPrivateData(src: string): { ok: boolean; detail: string } {
  const calls = [...src.matchAll(/trackGAEvent\(\s*"download_clicked"\s*,\s*\{([\s\S]*?)\}\s*\)/g)]
  if (calls.length === 0) return { ok: false, detail: '未找到 download_clicked 埋点（测试目标失效）' }
  // 越界字段：任何形式的 file_name/filename、用户身份字段、内容字段；allow opaque ID 与格式/批次统计
  const forbidden = /\b(file_name|file_path|filename|user_id|user_email|email|user_name|file_content|content_body)\b/i
  const bad = calls.filter((m) => forbidden.test(m[1]))
  if (bad.length) {
    return { ok: false, detail: `${bad.length}/${calls.length} 个 download_clicked 参数含隐私字段` }
  }
  return { ok: true, detail: `${calls.length}/${calls.length} 个 download_clicked 参数无隐私字段` }
}

describe('M8-19 下载发起观测（download_clicked）', () => {
  test('单文件真实下载入口有 download_clicked 且绑定在 <a download> 上', () => {
    const src = read(SINGLE)
    expect(src).toContain('"download_clicked"')
    // 事件必须由下载链接 <a download> 自身的 onClick 触发，不能是别的无关按钮
    const anchor = src.match(/<a\b[^>]*>[\s\S]*?<\/a>/)
    expect(anchor).not.toBeNull()
    expect(anchor![0]).toMatch(/\bdownload=/)
    expect(anchor![0]).toContain('onClick={handleDownloadClick}')
    // observation context 透传：事件展开自 context，携带 opaque ID
    expect(src).toContain('...observationContext')
  })

  test('批量 ZIP 下载入口有 download_clicked，带 batch_id 与批次统计', () => {
    const src = read(BATCH)
    const zipFn = src.slice(src.indexOf('handleDownloadZip'))
    expect(zipFn).toContain('"download_clicked"')
    expect(zipFn).toContain('batch_id')
    expect(zipFn).toContain('batch_completed')
    expect(zipFn).toContain('surface: "batch_zip"')
  })

  test('batch_id 在所有子任务 conversion_attempt 之前生成', () => {
    const src = read(BATCH)
    const gen = src.indexOf('const batchId = "batch-"')
    const attempt = src.indexOf('"conversion_attempt"')
    expect(gen).toBeGreaterThanOrEqual(0)
    expect(attempt).toBeGreaterThanOrEqual(0)
    expect(gen).toBeLessThan(attempt)
  })

  test('批量每个子任务事件携带独立 observation context（...obs）', () => {
    const src = read(BATCH)
    // attempt + 配额 failed + file_upload + complete + catch failed 五个事件都应带 ...obs
    const obsSpreads = (src.match(/\.\.\.obs/g) || []).length
    expect(obsSpreads).toBeGreaterThanOrEqual(5)
  })

  // 隐私判据施加到真实源码的事件参数块（红队复核改进：原版只测硬编码字符串，
  // 不能拦截「有人往真实 download_clicked 参数里加 file_name」的回归）。
  test('真实源码：两个 download_clicked 事件参数均不含隐私字段', () => {
    expect(downloadEventsCarryNoPrivateData(read(SINGLE)).ok).toBe(true)
    expect(downloadEventsCarryNoPrivateData(read(BATCH)).ok).toBe(true)
  })

  // 负向对照：证明同一判据真能抓到越界字段，而不是恒真
  test('负向对照：download_clicked 带文件名时必须被判失败', () => {
    const bad = `trackGAEvent("download_clicked", { file_name: afterFile.name, ...ctx })`
    expect(downloadEventsCarryNoPrivateData(bad).ok).toBe(false)
  })

  test('负向对照：干净事件参数不带越界字段', () => {
    const good = `trackGAEvent("download_clicked", { ...obs, surface: "batch_zip", batch_completed: 3 })`
    expect(downloadEventsCarryNoPrivateData(good).ok).toBe(true)
  })
})
