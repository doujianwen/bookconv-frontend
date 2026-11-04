// scripts/lib/referrer-tiers.mjs
// 「入口环境分层」口径的单一事实源。
//
// 背景（2026-11-04 红队实测）：
//   GA4 的 pageReferrer / pagePath 与 sessions 指标**不兼容** —— 同一会话会被拆到多行，
//   直接相加会膨胀：pageReferrer×sessions 在 Direct 下得 547（真值 336，1.63x）；
//   pagePath×sessions 得 712（真值 449，1.59x）。
//   但配 eventCount（限 eventName=page_view）完全闭合：pageReferrer×page_view = 882 = 真值。
//   ⇒ 会话级只能用 landingPage/sessionSource；页面级只能用 pageLocation/pageReferrer + eventCount。
//
// 另一个坑：GA4 的 landingPage 已剥离 query，URL 参数只能从 pageLocation / pageReferrer 取。
//   App 内嵌 WebView（IM 里点链接打开）留下的容器参数就是靠这个才能看到。
//
// 🔴 2026-11-04 红队第 3 轮追加约束（此前的版本在这里犯过硬错，勿回退）：
//   同一套四层标签用在 page_view 级 与 session 级，**含义完全不同**，不能混用一套文案：
//     · page_view 级 + pageReferrer：这是「每个 page_view 的上游页」，会话内跳转会大量命中
//       internal / container，**不代表入口**。实测 container 42(4.8%) / none 420(47.6%)。
//     · session 级（session_start 事件）：才是「会话入口」。实测 container **0** /
//       external 59(13.8%) / none **348(81.7%)**。
//   同一批数据两个口径差一倍以上，所以本模块强制调用方声明 level，不声明直接抛错。
//   「从容器打开」的正确测法是 session 级 + pageLocation（当前页 URL），实测 51 会话 = 12.0%；
//   用 pageReferrer 测永远得 0，因为容器参数在落地页自身 URL 上，不在上一页。

/** 容器参数特征：URL query 命中任一即判为「App/IM 内嵌打开」。新增前先在真实数据里找样本。 */
export const CONTAINER_PARAM_PATTERNS = [
  /[?&]use_xbridge3=/i,            // 跨端桥接容器
  /[?&]loader_name=/i,             // 容器名（如 forest）
  /[?&]webview_progress_bar=/i,    // 容器自带进度条
  /[?&]push_animated=/i,           // 容器转场动画
  /[?&]sec_link_scene=/i,          // 场景标识（如 im）
  /[?&]f_link_type=/i,             // 分享链接类型（如 f_linkinlinenote）
  /[?&]hybrid_event_param=/i,      // 混合容器事件参数（含 enterMethod）
  /[?&]enable_bottom_share_style=/i,
]

/** 判断一个 URL（location 或 referrer）是否带容器参数 */
export function hasContainerParams(url) {
  if (!url) return false
  return CONTAINER_PARAM_PATTERNS.some(re => re.test(url))
}

/** 从 URL 提取 UTM，用于判断「是否已有归因标记」 */
export function extractUtm(url) {
  if (!url || !/[?&]utm_/i.test(url)) return null
  let q
  try { q = new URL(url).searchParams } catch { return null }
  const pick = k => q.get(k) || null
  const out = {
    source: pick('utm_source'),
    medium: pick('utm_medium'),
    campaign: pick('utm_campaign'),
  }
  return out.source || out.medium || out.campaign ? out : null
}

/** 本站域名判定（含预览域，便于识别泄漏） */
const OURS = /(?:^|\.)bookconv\.com$|ebook-converter[a-z0-9-]*\.vercel\.app$/i

export function hostOf(url) {
  if (!url) return null
  try { return new URL(url).host } catch { return null }
}

/**
 * 四层分层。互斥且穷尽，任何 URL 都会落到且只落到一层。
 * @returns {'container'|'internal'|'external'|'none'}
 */
export function classifyReferrer(referrer) {
  const ref = (referrer || '').trim()
  if (!ref) return 'none'
  const host = hostOf(ref)
  if (host && OURS.test(host)) return hasContainerParams(ref) ? 'container' : 'internal'
  // 站内相对路径（GA4 偶见）也算站内
  if (ref.startsWith('/')) return hasContainerParams(ref) ? 'container' : 'internal'
  return 'external'
}

export const TIER_LABELS = {
  container: 'A·带容器参数（App/IM 内嵌痕迹）',
  internal: 'B·站内跳转',
  external: 'C·外部域名',
  none: 'D·空（无上游）',
}

/**
 * 口径层级。**必须显式声明**，因为同一套 tier 名在两个层级下含义相反（见文件头注释）。
 * - pageview：配 eventName=page_view 的 eventCount，分母对照 screenPageViews
 *   - urlKey=pageReferrer → 「每个 page_view 的上游页」，不是入口
 *   - urlKey=pageLocation → 「每个 page_view 的当前 URL」
 * - session：配 eventName=session_start 的 eventCount，分母 **不等于 sessions**（实测 426 vs 449）
 *   - urlKey=pageReferrer → 「会话入口的来源页」（真正回答"从哪来"）
 *   - urlKey=pageLocation → 「会话入口的落地 URL（含 query）」（真正回答"从什么容器打开"）
 */
export const LEVELS = {
  pageview: {
    metric: 'eventCount',
    eventName: 'page_view',
    label: 'page_view 级',
    caveat: '这是 page_view 分布，不是会话入口。禁止用它说"X% 的用户从某处来"。',
  },
  session: {
    metric: 'eventCount',
    eventName: 'session_start',
    label: 'session 级（session_start）',
    caveat: 'session_start 事件数 ≠ sessions 指标（实测 426 vs 449，逐日双向波动）。分母要写清是哪一个。',
  },
}

/**
 * 汇总分层。
 * @param rows  形如 [{pageReferrer, pageLocation, eventCount, sessions, ...}]
 * @param opts.level       **必填** 'pageview' | 'session'，见 LEVELS
 * @param opts.metricKey   取哪个数值列（默认取该 level 的 metric）
 * @param opts.urlKey      用哪个 URL 列判定（'pageReferrer' | 'pageLocation'）
 * @param opts.expectedTotal  若提供，则做闭合断言；不闭合直接抛错，禁止静默汇总
 */
export function summarizeTiers(rows, opts = {}) {
  const { level, metricKey = 'eventCount', urlKey = 'pageReferrer', expectedTotal = null } = opts
  if (!level || !LEVELS[level]) {
    throw new Error(
      `summarizeTiers 必须声明 level（'pageview' | 'session'）。` +
      `原因：同一套 tier 在 page_view 级与 session 级含义相反，实测 container 42(4.8%) vs 0(0%)，` +
      `不声明就无法判断结论该写"page_view 占比"还是"会话占比"。`
    )
  }
  const tiers = { container: 0, internal: 0, external: 0, none: 0 }
  const externals = {}
  let total = 0

  for (const r of rows || []) {
    const v = Number(r[metricKey] || 0)
    if (!Number.isFinite(v)) continue
    total += v
    const tier = classifyReferrer(r[urlKey])
    tiers[tier] += v
    if (tier === 'external') {
      const h = hostOf(r[urlKey]) || '(unparsable)'
      externals[h] = (externals[h] || 0) + v
    }
  }

  if (expectedTotal != null && total !== expectedTotal) {
    throw new Error(
      `分组合计不闭合：${total} ≠ 期望 ${expectedTotal}（层级=${level}，维度=${urlKey}，指标=${metricKey}）。` +
      `多半是报表被 limit 截断，或该维度与指标不兼容。禁止按不闭合数据出结论。`
    )
  }

  const pct = n => (total ? +((100 * n) / total).toFixed(1) : 0)
  return {
    level, metricKey, urlKey, total,
    caveat: LEVELS[level].caveat,
    tiers: Object.fromEntries(Object.entries(tiers).map(([k, v]) => [k, { value: v, pct: pct(v) }])),
    externalHosts: Object.entries(externals).sort((a, b) => b[1] - a[1]),
  }
}

/** 已知不兼容组合的黑名单，供调用方 assert 用 */
export const INCOMPATIBLE = [
  { dims: ['pageReferrer'], metric: 'sessions', note: 'Direct 下实测 547 vs 真值 336（1.63x 膨胀）；探针已限 Direct、limit 500 未截断' },
  { dims: ['pagePath'], metric: 'sessions', note: '实测 712 vs 真值 449（1.59x 膨胀）' },
  { dims: ['session_start 事件数'], metric: 'sessions', note: '实测 426 vs 449，逐日双向波动（有的天 eventCount>sessions），两者不可互替' },
]

/**
 * 自检：不依赖网络，验证分层规则互斥、穷尽、且能识别已知样本。
 * 任何一条失败即抛错 —— 门禁用法：node -e "import('./scripts/lib/referrer-tiers.mjs').then(m=>m.selfTest())"
 */
export function selfTest() {
  const cases = [
    ['', 'none'],
    [null, 'none'],
    ['https://www.bookconv.com/', 'internal'],
    ['https://www.bookconv.com/convert/epub-to-pdf', 'internal'],
    ['https://www.bookconv.com/?push_animated=1&webview_progress_bar=1&show_loading=0&theme=light', 'container'],
    ['https://www.bookconv.com/?use_xbridge3=true&loader_name=forest&need_sec_link=1&sec_link_scene=im&theme=light', 'container'],
    ['https://www.bookconv.com/?f_link_type=f_linkinlinenote&flow_extra=xx', 'container'],
    ['https://cn.bing.com/', 'external'],
    ['https://www.doubao.com/chat/123', 'external'],
  ]
  for (const [url, want] of cases) {
    const got = classifyReferrer(url)
    if (got !== want) throw new Error(`selfTest 失败：classifyReferrer(${JSON.stringify(url)}) = ${got}，期望 ${want}`)
  }

  // 互斥穷尽：同一批行分层后合计必须等于输入合计
  const rows = cases.map(([u], i) => ({ pageReferrer: u, eventCount: i + 1 }))
  const sumIn = rows.reduce((s, r) => s + r.eventCount, 0)
  const out = summarizeTiers(rows, { level: 'pageview' })
  const sumTier = Object.values(out.tiers).reduce((s, t) => s + t.value, 0)
  if (sumTier !== sumIn) throw new Error(`selfTest 失败：分层合计 ${sumTier} ≠ 输入合计 ${sumIn}`)

  // 闭合断言必须真的抛错（防「断言写了但不生效」）
  let threw = false
  try { summarizeTiers(rows, { level: 'pageview', expectedTotal: sumIn + 1 }) } catch { threw = true }
  if (!threw) throw new Error('selfTest 失败：expectedTotal 不匹配时未抛错，闭合断言形同虚设')

  // 🔴 未声明 level 必须抛错（防「同一套标签跨层级误用」——这正是 2026-11-04 第 3 轮红队命中的真实错误）
  let noLevelThrew = false
  try { summarizeTiers(rows) } catch { noLevelThrew = true }
  if (!noLevelThrew) throw new Error('selfTest 失败：未声明 level 时未抛错，跨层级误用防护形同虚设')

  // 🔴 层级不同则 caveat 必须不同（防"两套口径共用一个免责声明"）
  const a = summarizeTiers(rows, { level: 'pageview' }).caveat
  const b = summarizeTiers(rows, { level: 'session' }).caveat
  if (a === b) throw new Error('selfTest 失败：pageview 与 session 的 caveat 相同，说明层级区分未生效')

  // UTM 提取
  const u = extractUtm('https://www.bookconv.com/?utm_source=chatgpt.com')
  if (!u || u.source !== 'chatgpt.com') throw new Error('selfTest 失败：extractUtm 未取到 chatgpt.com')

  return { passed: cases.length + 6, note: '分层互斥/穷尽/闭合断言/level 强制/caveat 区分/UTM 提取 全部通过' }
}
