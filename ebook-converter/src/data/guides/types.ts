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
