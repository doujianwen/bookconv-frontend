import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, Tag, ArrowLeft, BookOpen } from "lucide-react"
import * as blogConvertEpubMobiEn from "@/data/blog/how-to-convert-epub-to-mobi-en"
import * as blogEbookFormatsEn from "@/data/blog/ebook-formats-explained-en"
import * as blogConvertLitToEpubEn from "@/data/blog/why-convert-lit-to-epub-en"
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
  "how-to-convert-epub-to-mobi-en": {
    slug: blogConvertEpubMobiEn.slug,
    title: blogConvertEpubMobiEn.title,
    date: blogConvertEpubMobiEn.date,
    author: blogConvertEpubMobiEn.author,
    tags: blogConvertEpubMobiEn.tags,
    content: blogConvertEpubMobiEn.content,
  },
  "ebook-formats-explained-en": {
    slug: blogEbookFormatsEn.slug,
    title: blogEbookFormatsEn.title,
    date: blogEbookFormatsEn.date,
    author: blogEbookFormatsEn.author,
    tags: blogEbookFormatsEn.tags,
    content: blogEbookFormatsEn.content,
  },
  "why-convert-lit-to-epub-en": {
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
            wordCount: (post.content?.intro || "").split("\s").length + (post.content?.sections?.reduce((a, s) => a + (s.body || "").split("\s").length, 0) || 0),
            keywords: post.tags.join(", "),
          }),
        }}
      />

      <main className="mx-auto max-w-3xl px-4 py-16">
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

        <article className="prose prose-gray max-w-none">
          {post.content?.intro && (
            <p className="text-lg text-gray-700 leading-relaxed border-l-4 border-blue-500 pl-4 italic">{post.content.intro}</p>
          )}
          {post.content?.sections?.map((section, index) => (
            <section key={index} className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900">{section.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(section.body) }} />
            </section>
          ))}
        </article>

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
  const patterns = [/(w+)s+tos+(w+)/i, /(w+)s*vss*(w+)/i]
  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) return { source: match[1], target: match[2] }
  }
  return {}
}

function renderMarkdownToHtml(markdown: string): string {
  let html = markdown.replace(/\\n\\n/g, "\n\n").replace(/\\n/g, "<br />")
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>")
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul class=\"list-disc pl-6 space-y-2\">$&</ul>")
  html = html.replace(/\n\n/g, "</p><p>")
  html = "<p>" + html + "</p>"
  html = html.replace(/<p>\s*<\/p>/g, "")
  return html
}
