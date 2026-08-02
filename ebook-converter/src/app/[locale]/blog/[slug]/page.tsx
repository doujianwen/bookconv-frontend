import type { Metadata } from "next"
import Link from "next/link"
import { Calendar, Tag, ArrowLeft, BookOpen } from "lucide-react"
import { getAllPosts } from "@/data/blog"
import { renderMarkdownToHtml } from "@/data/blog/types"
import { getRelatedPosts } from "@/lib/internal-links"

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

const BLOG_POSTS: Record<string, BlogPostData> = {};
for (const p of getAllPosts()) {
  BLOG_POSTS[p.slug] = {
    slug: p.slug,
    title: p.title,
    date: p.date,
    author: p.author,
    tags: p.tags,
    content: p.content,
  };
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

  const baseUrl = "https://www.bookconv.com"
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
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Post not found</h1>
          <Link href="/blog" className="mt-4 inline-block text-blue-600 hover:underline">Back to Blog</Link>
        </div>
      </div>
    )
  }

    const baseUrl = "https://www.bookconv.com"
    const postUrl = `${baseUrl}/blog/${post.slug}`
    const { source, target } = extractSourceTarget(post.title)
    const relatedPosts = getRelatedPosts(post.slug, 3)

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
              url: "https://www.bookconv.com",
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
                  href="/#"
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
