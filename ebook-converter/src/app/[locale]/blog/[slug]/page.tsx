import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, Tag, ArrowLeft, BookOpen } from "lucide-react"
import * as blogConvertEpubMobiEn from "@/data/blog/how-to-convert-epub-to-mobi"
import * as blogEbookFormatsEn from "@/data/blog/ebook-formats-explained"
import * as blogConvertLitToEpubEn from "@/data/blog/why-convert-lit-to-epub"
import * as blogEpubToMobiGuide from "@/data/blog/epub-to-mobi-guide"
import * as blogPdfToEpubGuide from "@/data/blog/pdf-to-epub-guide"
import * as blogDownloadTroubleshooting from "@/data/blog/download-troubleshooting"
import * as blogBackgroundWorkers from "@/data/blog/background-workers"
import * as blogEnvVariablesSetup from "@/data/blog/env-variables-setup"
import * as blogWebhookIntegration from "@/data/blog/webhook-integration"
import * as blogSitemapSeoGuide from "@/data/blog/sitemap-seo-guide"
interface BlogPostData {
  slug: string
  title: string
  date: string
  author?: string
  tags: string[]
  content?: {
    intro?: string
    sections?: Array<{ heading: string; body: string }>
  }
}

const BLOG_POSTS: Record<string, BlogPostData> = {
  "how-to-convert-epub-to-mobi": {
    slug: blogConvertEpubMobiEn.slug,
    title: blogConvertEpubMobiEn.title,
    date: blogConvertEpubMobiEn.date,
    author: blogConvertEpubMobiEn.author,
    tags: blogConvertEpubMobiEn.tags,
    content: blogConvertEpubMobiEn.content,
  },
  "ebook-formats-explained": {
    slug: blogEbookFormatsEn.slug,
    title: blogEbookFormatsEn.title,
    date: blogEbookFormatsEn.date,
    author: blogEbookFormatsEn.author,
    tags: blogEbookFormatsEn.tags,
    content: blogEbookFormatsEn.content,
  },
  "why-convert-lit-to-epub": {
    slug: blogConvertLitToEpubEn.slug,
    title: blogConvertLitToEpubEn.title,
    date: blogConvertLitToEpubEn.date,
    author: blogConvertLitToEpubEn.author,
    tags: blogConvertLitToEpubEn.tags,
    content: blogConvertLitToEpubEn.content,
  },
  "epub-to-mobi-guide": {
    slug: blogEpubToMobiGuide.slug,
    title: blogEpubToMobiGuide.title,
    date: blogEpubToMobiGuide.date,
    author: blogEpubToMobiGuide.author,
    tags: blogEpubToMobiGuide.tags,
    content: blogEpubToMobiGuide.content,
  },
  "pdf-to-epub-guide": {
    slug: blogPdfToEpubGuide.slug,
    title: blogPdfToEpubGuide.title,
    date: blogPdfToEpubGuide.date,
    author: blogPdfToEpubGuide.author,
    tags: blogPdfToEpubGuide.tags,
    content: blogPdfToEpubGuide.content,
  },
  "download-troubleshooting": {
    slug: blogDownloadTroubleshooting.slug,
    title: blogDownloadTroubleshooting.title,
    date: blogDownloadTroubleshooting.date,
    author: blogDownloadTroubleshooting.author,
    tags: blogDownloadTroubleshooting.tags,
    content: blogDownloadTroubleshooting.content,
  },
  "background-workers": {
    slug: blogBackgroundWorkers.slug,
    title: blogBackgroundWorkers.title,
    date: blogBackgroundWorkers.date,
    author: blogBackgroundWorkers.author,
    tags: blogBackgroundWorkers.tags,
    content: blogBackgroundWorkers.content,
  },
  "env-variables-setup": {
    slug: blogEnvVariablesSetup.slug,
    title: blogEnvVariablesSetup.title,
    date: blogEnvVariablesSetup.date,
    author: blogEnvVariablesSetup.author,
    tags: blogEnvVariablesSetup.tags,
    content: blogEnvVariablesSetup.content,
  },
  "webhook-integration": {
    slug: blogWebhookIntegration.slug,
    title: blogWebhookIntegration.title,
    date: blogWebhookIntegration.date,
    author: blogWebhookIntegration.author,
    tags: blogWebhookIntegration.tags,
    content: blogWebhookIntegration.content,
  },
  "sitemap-seo-guide": {
    slug: blogSitemapSeoGuide.slug,
    title: blogSitemapSeoGuide.title,
    date: blogSitemapSeoGuide.date,
    author: blogSitemapSeoGuide.author,
    tags: blogSitemapSeoGuide.tags,
    content: blogSitemapSeoGuide.content,
  },
}

interface BlogSlugProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return Object.keys(BLOG_POSTS).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogSlugProps): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POSTS[slug]
  if (!post) return {}

  const baseUrl = "https://bookconv.com"
  const description = post.content?.intro || post.title

  return {
    title: `${post.title} | BookConv Blog`,
    description,
    keywords: [...post.tags, "ebook converter", "calibre", "epub"],
    alternates: { canonical: `${baseUrl}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.date,
      url: `${baseUrl}/blog/${post.slug}`,
      siteName: "BookConv",
      authors: [post.author || "BookConv Team"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  }
}

export default async function BlogPostPage({ params }: BlogSlugProps) {
  const { slug } = await params
  const post = BLOG_POSTS[slug]

  if (!post) {
    notFound()
  }

  const baseUrl = "https://bookconv.com"
  const postUrl = `${baseUrl}/blog/${post.slug}`
  const { source, target } = extractSourceTarget(post.title)
  const sections = post.content?.sections || []

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.content?.intro || "",
            datePublished: post.date,
            dateModified: post.date,
            author: {
              "@type": "Person",
              name: post.author || "BookConv Team",
              url: "https://bookconv.com",
            },
            publisher: {
              "@type": "Organization",
              name: "BookConv",
              logo: { "@type": "ImageObject", url: baseUrl + "/icon.svg" },
              sameAs: [],
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
            inLanguage: "en-US",
            wordCount:
              (post.content?.intro || "").split(/\s/).length +
              (sections.reduce((a, s) => a + (s.body || "").split(/\s/).length, 0) || 0),
            keywords: post.tags.join(", "),
          }),
        }}
      />

      <main className="mx-auto max-w-5xl px-4 py-16">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li><Link href="/blog" className="hover:text-blue-600">Blog</Link></li>
            <li>/</li>
            <li aria-current="page" className="font-medium text-gray-900 truncate">{post.title}</li>
          </ol>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span>{post.author || "BookConv Team"}</span>
            <div className="flex items-center gap-1.5">
              {post.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  <Tag className="h-2.5 w-2.5 mr-0.5" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-12">
          <article className="prose prose-gray max-w-none">
            {post.content?.intro && (
              <p className="text-lg leading-relaxed text-gray-700 border-l-4 border-blue-500 pl-4 italic">{post.content.intro}</p>
            )}
            {sections.map((section, index) => {
              const id = slugify(section.heading)
              return (
                <section key={index} className="mt-8">
                  <h2 id={id} className="scroll-mt-24 text-2xl font-bold text-gray-900">{section.heading}</h2>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(section.body) }} />
                </section>
              )
            })}
          </article>

          {sections.length > 1 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">On this page</p>
                <ul className="space-y-2 text-sm">
                  {sections.map((section, index) => (
                    <li key={index}>
                      <a href={`#${slugify(section.heading)}`} className="text-gray-500 hover:text-blue-600 hover:underline">
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>

        {(source || target) && (
          <section className="mt-12 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Ready to Convert?</h2>
            <p className="mb-4 text-sm text-gray-600">Try our free online converter:</p>
            <div className="flex flex-wrap gap-2">
              {source && target && (
                <Link
                  href={`/convert/${source.toLowerCase()}-to-${target.toLowerCase()}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <BookOpen className="h-4 w-4" />
                  Convert {source.toUpperCase()} to {target.toUpperCase()}
                </Link>
              )}
              {source && (
                <Link
                  href="#"
                  className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  Browse All Converters
                </Link>
              )}
            </div>
          </section>
        )}

        <div className="mt-12 pt-6 border-t">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to all posts
          </Link>
        </div>
      </main>
    </>
  )
}

function extractSourceTarget(title: string): { source?: string; target?: string } {
  const match = title.match(/(\w+)\s+to\s+(\w+)/i)
  if (match) return { source: match[1], target: match[2] }
  return {}
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function inlineMd(s: string): string {
  let t = escapeHtml(s)
  t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  t = t.replace(/\*(.+?)\*/g, "<em>$1</em>")
  t = t.replace(/`([^`]+)`/g, '<code class="rounded bg-gray-100 px-1 py-0.5 text-sm text-pink-600">$1</code>')
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
  return t
}

function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function renderMarkdownToHtml(markdown: string): string {
  const normalized = markdown.replace(/\r\n/g, "\n").replace(/---+/g, "").trim()
  const blocks = normalized.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  const html: string[] = []

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) continue

    const qIdx = lines.findIndex((l) => /^(?:\*\*)?(?:#{1,4}\s*)?Q:\s/i.test(l))
    if (qIdx !== -1) {
      const qRaw = lines[qIdx].replace(/^(?:\*\*\s*)?(?:#{1,4}\s*)?Q:\s*/i, "").replace(/\*\*$/, "")
      const answer = lines.filter((_, i) => i !== qIdx).join(" ").replace(/^A:\s*/i, "")
      html.push(
        `<div class="my-4 rounded-lg border border-gray-200 bg-gray-50 p-4">` +
          `<p class="mb-1 font-semibold text-gray-900">Q: ${inlineMd(qRaw)}</p>` +
          (answer ? `<p class="text-gray-700">${inlineMd(answer)}</p>` : "") +
        `</div>`
      )
      continue
    }

    if (lines.length === 1) {
      const h3 = lines[0].match(/^###\s+(.*)$/)
      if (h3) {
        html.push(`<h3 class="mt-8 mb-3 text-xl font-bold text-gray-900">${inlineMd(h3[1])}</h3>`)
        continue
      }
      const h4 = lines[0].match(/^####\s+(.*)$/)
      if (h4) {
        html.push(`<h4 class="mt-6 mb-2 text-lg font-semibold text-gray-900">${inlineMd(h4[1])}</h4>`)
        continue
      }
    }

    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      html.push(
        `<ul class="my-4 list-disc space-y-1 pl-6">${lines
          .map((l) => `<li>${inlineMd(l.replace(/^[-*]\s+/, ""))}</li>`)
          .join("")}</ul>`
      )
      continue
    }
    if (lines.every((l) => /^\d+\.\s+/.test(l))) {
      html.push(
        `<ol class="my-4 list-decimal space-y-1 pl-6">${lines
          .map((l) => `<li>${inlineMd(l.replace(/^\d+\.\s+/, ""))}</li>`)
          .join("")}</ol>`
      )
      continue
    }

    const text = lines.join(" ")
    if (/^\*Published/i.test(text)) {
      html.push(`<p class="mt-6 text-xs italic text-gray-400">${inlineMd(text)}</p>`)
      continue
    }
    html.push(`<p class="my-4 leading-relaxed text-gray-700">${inlineMd(text)}</p>`)
  }
  return html.join("\n")
}
