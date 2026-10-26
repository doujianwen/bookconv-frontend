/**
 * Spanish route whitelist — SINGLE SOURCE OF TRUTH (2026-10-21)
 *
 * 背景：/es/* 路由受 P3-C 规则约束（middleware.ts），只有白名单内的 slug
 * 才有真实 /es 路由，其余一律 404。因此任何生成 /es 前缀链接的代码
 * 都必须以本模块判定，否则会产生 404 死链。
 *
 * 治理：此前同一份清单在 middleware.ts（2 处）与 sitemap.ts（2 处）重复硬编码，
 * 存在漂移风险；本模块抽出后三处统一 import，新增西语页面只需改这一处。
 *
 * 口径说明：
 * - ESP_GUIDE_SLUGS：/es/guide/* 可路由的 guide（11 篇，含 4 篇真西语译文 + 7 篇英文兜底）
 * - ESP_BLOG_SLUGS：/es/blog/* 可路由的 blog（6 篇真西语译文）
 * - ESP_CONVERT_SLUGS：/es/convert/* 可路由的转换页（5 篇真西语译文）
 */

export const ESP_BLOG_SLUGS: readonly string[] = [
  'azw3-vs-mobi',
  'can-kindle-read-azw3',
  'ebook-formats-explained',
  'epub-to-mobi-guide',
  'mobi-to-epub',
  'why-convert-lit-to-epub',
]

export const ESP_GUIDE_SLUGS: readonly string[] = [
  'calibre-vs-online-converter',
  'best-ebook-converter',
  'epub-vs-mobi',
  'azw3-vs-mobi',
  'kindle-formats',
  'batch-converter',
  'ai-ebook-converter',
  'calibre-alternative',
  'epub-to-azw3-for-kindle',
  'epub-to-mobi-keep-formatting',
  'azw3-to-mobi-keep-formatting',
]

export const ESP_CONVERT_SLUGS: readonly string[] = [
  'epub-to-doc',
  'epub-to-txt',
  'lit-to-epub',
  'epub-to-mobi',
  'epub-to-azw3',
]

/** guide 的西语路由链接；不在白名单内回退英文路由（避免 404） */
export function esGuideHref(slug: string): string {
  return ESP_GUIDE_SLUGS.includes(slug) ? `/es/guide/${slug}` : `/guide/${slug}`
}

/** blog 的西语路由链接；不在白名单内回退英文路由（避免 404） */
export function esBlogHref(slug: string): string {
  return ESP_BLOG_SLUGS.includes(slug) ? `/es/blog/${slug}` : `/blog/${slug}`
}

/** convert 的西语路由链接；不在白名单内回退英文路由（避免 404）。M5-6 新增：
 *  guide 详情页 CTA 与 convert 索引页在 /es 下按白名单判定，白名单外回退英文路由。
 *  注意：/es/convert（索引页）与 /es/guide、/es/blog 索引路由本身未在 middleware
 *  白名单开放（P3-C 只放行白名单 slug 详情页）⇒ 索引页链接一律回退英文路由。 */
export function esConvertHref(slug: string): string {
  return ESP_CONVERT_SLUGS.includes(slug) ? `/es/convert/${slug}` : `/convert/${slug}`
}

/**
 * 把西语页面正文里的站内 markdown 链接改写为西语路由。
 * 仅改写白名单内的目标；白名单外的链接保持英文路由（其 /es 版本会 404）。
 */
export function localizeEsInternalLinks(markdown: string): string {
  return markdown
    .replace(/\]\(\/guide\/([^)\s]+)\)/g, (m, slug: string) =>
      ESP_GUIDE_SLUGS.includes(slug) ? `](/es/guide/${slug})` : m,
    )
    .replace(/\]\(\/blog\/([^)\s]+)\)/g, (m, slug: string) =>
      ESP_BLOG_SLUGS.includes(slug) ? `](/es/blog/${slug})` : m,
    )
}
