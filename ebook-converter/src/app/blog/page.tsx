import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, Calendar, Tag } from "lucide-react"

export const metadata: Metadata = {
  title: "Ebook Conversion Blog — Guides, Tips & Format Comparisons | BookConv",
  description: "Expert guides on ebook conversion: format comparisons, how-to tutorials, and tips for getting the best results. Learn about EPUB, MOBI, AZW3, PDF and more.",
  alternates: { canonical: "https://bookconv.com/blog" },
  openGraph: {
    title: "Ebook Conversion Blog | BookConv",
    description: "Expert guides on ebook conversion: format comparisons, how-to tutorials, and tips.",
    url: "https://bookconv.com/blog",
    type: "website",
    siteName: "BookConv",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ebook Conversion Blog | BookConv",
    description: "Expert guides on ebook conversion.",
  },
}

interface BlogPost {
  title: string
  slug: string
  date: string
  excerpt?: string
  tags: string[]
}

const posts: BlogPost[] = [
  {
    title: "How to Convert EPUB to MOBI for Free",
    slug: "how-to-convert-epub-to-mobi",
    date: "2026-07-11",
    excerpt: "A complete guide to converting EPUB files to MOBI format for older Kindle devices. Learn about compatibility, quality, and best practices.",
    tags: ["EPUB", "MOBI", "Kindle", "Conversion Guide"],
  },
  {
    title: "Best Ebook Formats Explained: EPUB vs AZW3 vs PDF",
    slug: "ebook-formats-explained",
    date: "2026-07-10",
    excerpt: "Compare the three most popular ebook formats. Understand their strengths, weaknesses, and which one is right for your reading needs.",
    tags: ["EPUB", "AZW3", "PDF", "Format Comparison"],
  },
  {
    title: "Why You Should Convert LIT to EPUB",
    slug: "why-convert-lit-to-epub",
    date: "2026-07-09",
    excerpt: "Microsoft has discontinued LIT format support. Learn why converting your LIT collection to EPUB is essential for future-proofing your library.",
    tags: ["LIT", "EPUB", "Data Migration", "Microsoft Reader"],
  },
]

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "BookConv Blog",
            description: "Expert guides on ebook format conversion, format comparisons, and reading tips.",
            url: "https://bookconv.com/blog",
            publisher: { "@id": "https://bookconv.com/#organization" },
            blogPost: [
              { "@type": "BlogPosting", headline: "How to Convert EPUB to MOBI for Free", url: "https://bookconv.com/blog/how-to-convert-epub-to-mobi", datePublished: "2026-07-11" },
              { "@type": "BlogPosting", headline: "Best Ebook Formats Explained: EPUB vs AZW3 vs PDF", url: "https://bookconv.com/blog/ebook-formats-explained", datePublished: "2026-07-10" },
              { "@type": "BlogPosting", headline: "Why You Should Convert LIT to EPUB", url: "https://bookconv.com/blog/why-convert-lit-to-epub", datePublished: "2026-07-09" },
            ],
          }),
        }}
      />
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Ebook Conversion Blog</h1>
        <p className="text-lg text-gray-600">
          Expert guides, format comparisons, and tips for getting the most out of your ebook library.
        </p>
      </div>

      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
          <li>/</li>
          <li aria-current="page" className="font-medium text-gray-900">Blog</li>
        </ol>
      </nav>

      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b pb-8">
            <Link href={`/blog/${post.slug}`} className="group block">
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{post.excerpt}</p>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
                <div className="flex items-center gap-1.5">
                  {post.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      <Tag className="h-2.5 w-2.5 mr-0.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <section className="mt-12 rounded-xl border bg-gray-50 p-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Popular Conversions</h2>
        <p className="mb-4 text-sm text-gray-600">Try these conversions directly:</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { label: "EPUB to MOBI", href: "/convert/epub-to-mobi" },
            { label: "PDF to EPUB", href: "/convert/pdf-to-epub" },
            { label: "AZW3 to EPUB", href: "/convert/azw3-to-epub" },
            { label: "MOBI to EPUB", href: "/convert/mobi-to-epub" },
            { label: "LIT to EPUB", href: "/convert/lit-to-epub" },
            { label: "EPUB to TXT", href: "/convert/epub-to-txt" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 border"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}