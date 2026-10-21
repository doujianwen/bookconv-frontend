import { BlogFaq } from '../blog/types'

export interface GuideSection {
  heading: string
  body: string
}

/**
 * 西语本地化内容（M5-2，2026-10-21 起）。
 * 存在时 /es/guide/* 渲染本字段；缺省回退英文（既有英文兜底行为不变）。
 * 字段与 GuideMeta 的展示子集同名，页面侧用同一 display 变量消费——
 * 与 blog 的 `es` 字段先例（azw3-vs-mobi 等 6 篇）保持同一模式。
 */
export interface GuideEs {
  title: string
  problem: string
  keyTakeaways: string[]
  content: {
    intro?: string
    sections: GuideSection[]
  }
  faqs: BlogFaq[]
}

export interface GuideMeta {
  slug: string
  title: string
  /** 可选的 SERP <title> 专用短标题（≤55 字符）。不填则回退到 title（同时也是可见 H1）。
   *  仅用于搜索引擎结果摘要，不影响页面 H1 / OG / 结构化数据。 */
  metaTitle?: string
  /** 一句话痛点，作为 hero 副标题 */
  problem: string
  date: string
  /**
   * 内容最后更新日期（可选）。仅用于 sitemap lastmod，不影响页面展示的发布日期。
   * 由于 sitemap lastmod 是固化常量（不能 new Date()），内容编辑后必须手动把
   * 这里 bump 到编辑当天，否则搜索引擎收不到更新信号、不会重抓。
   */
  updatedAt?: string
  tags: string[]
  /** 关联转换对，用于页内 CTA 与 /convert 链接；不填则显示通用 CTA */
  formats?: { source: string; target: string }
  /** 页面顶部蓝框要点 */
  keyTakeaways: string[]
  content: {
    intro?: string
    sections: GuideSection[]
  }
  faqs: BlogFaq[]
  /** 真实西语译文（M5-2）。未提供的 /es/guide/* 页继续英文兜底（不删页） */
  es?: GuideEs
}
