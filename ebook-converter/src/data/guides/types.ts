import { BlogFaq } from '../blog/types'

export interface GuideSection {
  heading: string
  body: string
}

export interface GuideMeta {
  slug: string
  title: string
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
}
