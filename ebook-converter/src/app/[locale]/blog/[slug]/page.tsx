import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, Tag, ArrowLeft, BookOpen } from "lucide-react"
import { getAllPosts } from "@/data/blog"
import { renderMarkdownToHtml, stripMarkdown, BlogPostContent, BlogFaq, BlogPostLocalized } from "@/data/blog/types"
import { getRelatedPosts, getRelatedGuidesForBlogPost, isHubTag, slugifyTag } from "@/lib/internal-links"

interface BlogPostData {
  slug: string
  title: string
  date: string
  author?: string
  tags: string[]
  content: BlogPostContent
  faqs?: BlogFaq[]
  es?: BlogPostLocalized
}

const BLOG_POSTS: Record<string, BlogPostData> = {};
for (const p of getAllPosts()) {
  BLOG_POSTS[p.slug] = {
    slug: p.slug,
    title: p.title,
    date: p.date,
    author: p.author,
    tags: p.tags,
    content: p.content,
    faqs: p.faqs,
    es: p.es,
  };
}

interface BlogSlugProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  return Object.keys(BLOG_POSTS).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogSlugProps): Promise<Metadata> {
  const { locale, slug } = await params
  const post = BLOG_POSTS[slug]
  if (!post) return {}

  const baseUrl = "https://www.bookconv.com"
  const isEs = locale === "es" && !!post.es
  const displayTitle = isEs ? post.es!.title : post.title
  const displayContent = isEs ? post.es!.content : post.content
  const description = displayContent.intro || displayTitle
  const canonical = `${baseUrl}${isEs ? "/es" : ""}/blog/${slug}`

  return {
    // No brand suffix: the global title template appends "| BookConv".
    title: displayTitle,
    description,
    keywords: [...post.tags, "ebook converter", "calibre", "epub"],
    alternates: {
      canonical,
      languages: {
        en: `${baseUrl}/blog/${slug}`,
        es: `${baseUrl}/es/blog/${slug}`,
        "x-default": `${baseUrl}/blog/${slug}`,
      },
    },
    openGraph: {
      title: displayTitle,
      description,
      type: "article",
      publishedTime: post.date,
      url: canonical,
      siteName: "BookConv",
      authors: [post.author || "BookConv Team"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle,
      description,
    },
  }
}

export default async function BlogPostPage({ params }: BlogSlugProps) {
  const { locale, slug } = await params
  const post = BLOG_POSTS[slug]

  if (!post) notFound()

    const baseUrl = "https://www.bookconv.com"
    const isEs = locale === "es" && !!post.es
    const displayTitle = isEs ? post.es!.title : post.title
    const displayContent = isEs ? post.es!.content : post.content
    const displayFaqs = isEs ? post.es?.faqs : post.faqs
    const postUrl = `${baseUrl}${isEs ? "/es" : ""}/blog/${post.slug}`
    const { source, target } = extractSourceTarget(displayTitle)
    const relatedPosts = getRelatedPosts(post.slug, 3)
    const relatedGuides = getRelatedGuidesForBlogPost(post.slug, 3)

    const allPosts = getAllPosts()
    const curIdx = allPosts.findIndex((p) => p.slug === post.slug)
    const newerPost = curIdx > 0 ? allPosts[curIdx - 1] : null
    const olderPost = curIdx < allPosts.length - 1 ? allPosts[curIdx + 1] : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: displayTitle,
            description: displayContent.intro || "",
            datePublished: post.date,
            dateModified: post.date,
            author: {
              "@type": "Person",
              name: post.author || "BookConv Team",
              url: "https://www.bookconv.com",
            },
            publisher: {
              "@type": "Organization",
              name: "BookConv",
              logo: { "@type": "ImageObject", url: baseUrl + "/icon.svg" },
              sameAs: [],
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
            inLanguage: isEs ? "es-ES" : "en-US",
            wordCount: (displayContent.intro || "").split(/\s/).length + (displayContent.sections?.reduce((a, s) => a + (s.body || "").split(/\s/).length, 0) || 0),
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
            <li aria-current="page" className="font-medium text-gray-900 truncate">{displayTitle}</li>
          </ol>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">{displayTitle}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span>{post.author || "BookConv Team"}</span>
              <div className="flex items-center gap-1.5">
              {post.tags.map((tag) => {
                const clickable = isHubTag(tag)
                const cls = "inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                return clickable ? (
                  <Link key={tag} href={`/blog/tag/${slugifyTag(tag)}`} className={cls + " hover:bg-blue-100 hover:text-blue-800 transition-colors"}>
                    <Tag className="h-2.5 w-2.5 mr-0.5" />
                    {tag}
                  </Link>
                ) : (
                  <span key={tag} className={cls}>
                    <Tag className="h-2.5 w-2.5 mr-0.5" />
                    {tag}
                  </span>
                )
              })}
            </div>
          </div>
        </header>

        <article className="prose prose-gray max-w-none">
          {displayContent.intro && (
            <p className="text-lg text-gray-700 leading-relaxed border-l-4 border-blue-500 pl-4 italic">{displayContent.intro}</p>
          )}
          {displayContent.sections?.map((section, index) => (
            <section key={index} className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900">{section.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(section.body) }} />
            </section>
          ))}
        </article>

        {displayFaqs && displayFaqs.length > 0 && (
          <section className="mt-12" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="mb-4 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {displayFaqs!.map((f, i) => (
                <div key={i} className="rounded-xl border bg-white p-5">
                  <h3 className="text-base font-semibold text-gray-900">{f.question}</h3>
                  <div
                    className="mt-2 text-sm text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(f.answer) }}
                  />
                </div>
              ))}
            </div>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: displayFaqs!.map((f) => ({
                    "@type": "Question",
                    name: f.question,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: stripMarkdown(f.answer),
                    },
                  })),
                }),
              }}
            />
          </section>
        )}

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
                  href="/convert"
                  className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  Browse All Converters
                </Link>
              )}
            </div>
          </section>
        )}

        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Related posts</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((rp) => (
                <Link key={rp.slug} href={rp.href} className="group block rounded-xl border bg-white p-5 transition-colors hover:border-blue-300 hover:bg-blue-50">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600">{rp.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 leading-relaxed">{rp.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedGuides.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Related Guides</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedGuides.map((rg) => (
                <Link key={rg.slug} href={rg.href} className="group block rounded-xl border bg-white p-5 transition-colors hover:border-blue-300 hover:bg-blue-50">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600">{rg.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 leading-relaxed">{rg.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(newerPost || olderPost) && (
          <nav aria-label="More posts" className="mt-12 flex items-stretch justify-between gap-4 border-t pt-6">
            {olderPost ? (
              <Link href={`/blog/${olderPost.slug}`} className="group flex-1 rounded-xl border bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50">
                <span className="text-xs text-gray-400">← Older</span>
                <p className="mt-1 text-sm font-medium text-gray-900 group-hover:text-blue-600">{olderPost.title}</p>
              </Link>
            ) : (
              <span className="flex-1" />
            )}
            {newerPost ? (
              <Link href={`/blog/${newerPost.slug}`} className="group flex-1 rounded-xl border bg-white p-4 text-right transition-colors hover:border-blue-300 hover:bg-blue-50">
                <span className="text-xs text-gray-400">Newer →</span>
                <p className="mt-1 text-sm font-medium text-gray-900 group-hover:text-blue-600">{newerPost.title}</p>
              </Link>
            ) : (
              <span className="flex-1" />
            )}
          </nav>
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
  const patterns = [/(\w+)\s+to\s+(\w+)/i, /(\w+)\s+vs\s+(\w+)/i]
  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) return { source: match[1], target: match[2] }
  }
  return {}
}
