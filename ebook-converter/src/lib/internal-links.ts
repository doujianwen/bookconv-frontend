import { getAllPosts, getPostBySlug } from "@/data/blog"
import type { BlogPostMeta } from "@/data/blog/types"

export interface RelatedPostRef {
  title: string
  slug: string
  href: string
  excerpt: string
  tags: string[]
}

// Infra/dev posts that should NOT surface as "related guides" on conversion pages.
const DEV_POST_SLUGS = new Set([
  "background-workers",
  "webhook-integration",
  "env-variables-setup",
  "sitemap-seo-guide",
])

// Generic/brand tags that create noise in similarity scoring (present on almost every post).
export const GENERIC_TAGS = new Set([
  "bookconv",
  "calibre",
  "ebook",
  "ebook formats",
  "ebook format",
  "technical",
  "guide",
  "conversion",
  "ebook conversion",
  "convert ebook",
  "faq",
  "step-by-step",
  "cli",
  "archiving",
  "microsoft reader",
  "download",
  "troubleshooting",
  "self-hosting",
])

function excerptOf(post: BlogPostMeta): string {
  if (post.content?.intro) return post.content.intro
  const first = post.content?.sections?.[0]?.body?.replace(/[#*`>\[\]()]/g, "").trim()
  return first ? first.slice(0, 160) : post.title
}

function toRef(post: BlogPostMeta): RelatedPostRef {
  return {
    title: post.title,
    slug: post.slug,
    href: "/blog/" + post.slug,
    excerpt: excerptOf(post),
    tags: post.tags,
  }
}

/**
 * P1: relevant blog posts for a conversion page, matched by source/target format.
 * Excludes dev/infra posts; ranks by tag + title + body relevance.
 */
export function getRelatedBlogPostsForConversion(
  source: string,
  target: string,
  limit = 3,
): RelatedPostRef[] {
  const src = source.toLowerCase()
  const tgt = target.toLowerCase()
  const candidates = getAllPosts().filter((p) => !DEV_POST_SLUGS.has(p.slug))

  const scored = candidates.map((p) => {
    let score = 0
    const title = p.title.toLowerCase()
    if (title.includes(src)) score += 2
    if (title.includes(tgt)) score += 2
    for (const tag of p.tags) {
      const t = tag.toLowerCase()
      if (t === src || t === tgt) score += 3
      else if (t.includes(src) || t.includes(tgt)) score += 1
    }
    const body = (p.content?.intro || "") + " " + (p.content?.sections?.map((s) => s.body).join(" ") || "")
    const pair = new RegExp(`${src}\\s+(to|vs)\\s+${tgt}`)
    if (pair.test(body.toLowerCase()) || pair.test(title)) score += 2
    return { post: p, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => toRef(s.post))
}

/**
 * P2: related blog posts for a blog detail page, matched by shared specific tags.
 * Brand/generic tags are ignored so format posts and infra posts cluster separately.
 */
export function getRelatedPosts(currentSlug: string, limit = 3): RelatedPostRef[] {
  const current = getPostBySlug(currentSlug)
  if (!current) return []
  const curTags = current.tags.map((t) => t.toLowerCase()).filter((t) => !GENERIC_TAGS.has(t))

  const scored = getAllPosts()
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      const shared = p.tags
        .map((t) => t.toLowerCase())
        .filter((t) => !GENERIC_TAGS.has(t) && curTags.includes(t)).length
      let score = shared * 2
      const title = p.title.toLowerCase()
      for (const ct of curTags) {
        if (ct.length > 2 && title.includes(ct)) score += 1
      }
      return { post: p, score }
    })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => toRef(s.post))
}

/**
 * Normalize a tag into a URL-safe slug (lowercase, non-alphanumerics -> hyphen).
 * e.g. "Ebook Formats" -> "ebook-formats", "Microsoft Reader" -> "microsoft-reader".
 */
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export interface HubTag {
  slug: string
  label: string
  count: number
}

/**
 * Tags worth a dedicated hub page: non-generic (brand/format-agnostic noise removed)
 * AND attached to >= 2 posts (avoids thin 1-post hubs).
 * Sorted by post count desc. Drives tag pages, clickable chips, and sitemap.
 */
export function getHubTags(): HubTag[] {
  const bySlug = new Map<string, { label: string; count: number }>()
  for (const p of getAllPosts()) {
    for (const t of p.tags) {
      if (GENERIC_TAGS.has(t.toLowerCase())) continue
      const s = slugifyTag(t)
      const entry = bySlug.get(s)
      if (entry) entry.count++
      else bySlug.set(s, { label: t, count: 1 })
    }
  }
  return [...bySlug.entries()]
    .filter(([, v]) => v.count >= 2)
    .map(([slug, v]) => ({ slug, label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count)
}

/** Posts whose tags (after slugify) match the given tag slug. */
export function getPostsByTagSlug(slug: string): BlogPostMeta[] {
  return getAllPosts().filter((p) => p.tags.some((t) => slugifyTag(t) === slug))
}

/** Whether a raw tag string maps to a generated hub page (i.e. should render as a link). */
export function isHubTag(tag: string): boolean {
  const s = slugifyTag(tag)
  return getHubTags().some((h) => h.slug === s)
}
