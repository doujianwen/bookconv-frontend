import { writeFileSync } from 'fs';

const code = \import type { Metadata } from "next"
import Link from "next/link"
import { Calendar, Tag, ArrowLeft, BookOpen, Clock, ChevronRight } from "lucide-react"
import { getLocale, getMessage } from "@/i18n/utils"
import { getPostBySlug, getAllPosts, buildPostSlugs, extractHeadings, generateTocHtml, renderMarkdownToHtml, buildInternalLinks } from "@/data/blog/types"

interface BlogSlugProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return buildPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogSlugProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  const baseUrl = "https://bookconv.com"
  const description = post.content.intro?.slice(0, 160) || post.title

  return {
    title: \\ | BookConv Blog\,
    description,
    keywords: [...post.tags, "ebook converter", "calibre", "epub"],
    alternates: { canonical: \\/blog/\\ },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.date,
      url: \\/blog/\\,
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
  const post = getPostBySlug(slug)

  if (!post) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">文章未找到</h1>
          <Link href="/blog" className="mt-4 inline-block text-blue-600 hover:underline">返回博客</Link>
        </div>
      </div>
    )
  }

  const allPosts = getAllPosts()
  const headings = extractHeadings(post.content)
  const tocHtml = generateTocHtml(headings)

  const linkedIntro = buildInternalLinks(post.content, post.slug, new Map(allPosts.map(p => [p.slug, p])))
  const linkedSections = post.content.sections.map(s => ({
    ...s,
    body: buildInternalLinks({ intro: "", sections: [{ heading: s.heading, body: s.body }] }, post.slug, new Map(allPosts.map(p => [p.slug, p]))).replace(/<h2[^>]*>.*?<\\\\/h2>/g, ""),
  }))

  const relatedPosts = allPosts.filter(p => p.slug !== post.slug && (post.relatedSlugs?.includes(p.slug) || p.tags.some(t => post.tags.includes(t)))).slice(0, 3)

  const wordCount = post.content.intro.length + post.content.sections.reduce((sum, s) => sum + s.body.replace(/\\\\n/g, "").length, 0)
  const readTime = Math.max(1, Math.ceil(wordCount / 300))

  return (
    <>
      <script
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.content.intro,
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
              logo: { "@type": "ImageObject", url: "https://bookconv.com/icon.svg" },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": \https://bookconv.com/blog/\\ },
            inLanguage: "zh-CN",
            wordCount: wordCount,
            keywords: post.tags.join(", "),
          }),
        }}
      />

      <main className="mx-auto max-w-4xl px-4 py-16">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
            <li><ChevronRight className="h-3 w-3" /></li>
            <li><Link href="/blog" className="hover:text-blue-600">Blog</Link></li>
            <li><ChevronRight className="h-3 w-3" /></li>
            <li aria-current="page" className="font-medium text-gray-900 truncate">{post.title}</li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {headings.length > 0 && (
            <aside className="hidden lg:block lg:w-56 xl:w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div
                  className="rounded-xl border bg-gray-50 p-5"
                  dangerouslySetInnerHTML={{ __html: tocHtml }}
                />
              </div>
            </aside>
          )}

          <div className="min-w-0 flex-1">
            <header className="mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.date).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
                </span>
                <span>{post.author || "BookConv Team"}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  阅读 {readTime} 分钟
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {post.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      <Tag className="h-2.5 w-2.5 mr-0.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </header>

            {headings.length > 0 && (
              <details className="mb-8 rounded-xl border bg-gray-50 p-5 lg:hidden">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700">目录导航</summary>
                <div className="mt-3" dangerouslySetInnerHTML={{ __html: tocHtml.replace('aria-label="Table of contents"', 'aria-label="Mobile table of contents"').replace("<h2", "<h3") }} />
              </details>
            )}

            <article className="prose prose-gray max-w-none">
              <div className="mb-8 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-5">
                <p className="text-lg text-gray-700 leading-relaxed m-0" dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(linkedIntro) }} />
              </div>

              {linkedSections.map((section, index) => (
                <section key={index} id={section.heading.toLowerCase().replace(/[^\\\\w]+/g, "-")} className="mt-10 scroll-mt-24">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">{section.heading}</h2>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(section.body) }} />
                </section>
              ))}
            </article>

            {post.internalLinkTargets && post.internalLinkTargets.length > 0 && (
              <section className="mt-12 rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 p-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">关键词索引</h2>
                <div className="flex flex-wrap gap-2">
                  {post.internalLinkTargets.map((keyword) => (
                    <span key={keyword} className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-12 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
              <h2 className="mb-2 text-lg font-semibold text-gray-900">准备好转换了吗？</h2>
              <p className="mb-4 text-sm text-gray-600">试试我们的免费在线转换器：</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/convert/epub-to-mobi"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <BookOpen className="h-4 w-4" />
                  开始转换
                </Link>
                <Link
                  href="/#"
                  className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  浏览所有转换器
                </Link>
              </div>
            </section>

            {relatedPosts.length > 0 && (
              <section className="mt-12 border-t pt-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900">相关文章</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedPosts.map((rp) => (
                    <Link
                      key={rp.slug}
                      href={/blog/\}
                      className="group block rounded-xl border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {rp.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {rp.content.intro?.slice(0, 80)}...
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(rp.date).toLocaleDateString("zh-CN")}
                        <div className="flex gap-1">
                          {rp.tags.slice(0, 2).map(t => (
                            <span key={t} className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600">{t}</span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-12 pt-6 border-t">
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <ArrowLeft className="h-4 w-4" />
                返回所有文章
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
\;

writeFileSync('E:/一人公司/电子书格式转换站/ebook-converter/src/app/blog/[slug]/page.tsx', code);
console.log('Written', code.split('\\n').length, 'lines');
