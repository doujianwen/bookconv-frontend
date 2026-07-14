import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, Calendar, Tag } from "lucide-react"
import { getLocale, getMessage } from '@/i18n/utils'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = await getMessage(locale);
  const t = (key: string) => (messages as any)[key] || key;

  return {
    title: t('blog.title') + " | BookConv",
    description: t('seo.defaultDescription') || 'Expert guides on ebook conversion.',
    alternates: { canonical: `https://bookconv.com${locale === 'es' ? '/es' : ''}/blog` },
    openGraph: {
      title: t('blog.title') + " | BookConv",
      url: `https://bookconv.com${locale === 'es' ? '/es' : ''}/blog`,
      type: "website",
    },
    twitter: {
      card: 'summary_large_image',
      title: t('blog.title') + " | BookConv",
    },
  };
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
    excerpt: "A complete guide to converting EPUB files to MOBI format for older Kindle devices.",
    tags: ["EPUB", "MOBI", "Kindle", "Conversion Guide"],
  },
  {
    title: "Best Ebook Formats Explained: EPUB vs AZW3 vs PDF",
    slug: "ebook-formats-explained",
    date: "2026-07-10",
    excerpt: "Compare the three most popular ebook formats. Understand their strengths and weaknesses.",
    tags: ["EPUB", "AZW3", "PDF", "Format Comparison"],
  },
  {
    title: "Why You Should Convert LIT to EPUB",
    slug: "why-convert-lit-to-epub",
    date: "2026-07-09",
    excerpt: "Microsoft has discontinued LIT format support. Learn why converting is essential.",
    tags: ["LIT", "EPUB", "Data Migration", "Microsoft Reader"],
  },
]

export default async function BlogPage() {
  const locale = await getLocale();
  const messages = await getMessage(locale);
  const t = (key: string) => (messages as any)[key] || key;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: t('blog.title'),
            description: "Expert guides on ebook format conversion.",
            url: `https://bookconv.com${locale === 'es' ? '/es' : ''}/blog`,
            publisher: { "@id": "https://bookconv.com/#organization" },
            blogPost: posts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: `https://bookconv.com${locale === 'es' ? '/es' : ''}/blog/${p.slug}`,
              datePublished: p.date,
            })),
          }),
        }}
      />
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('blog.title')}</h1>
        <p className="text-lg text-gray-600">{t('blog.subtitle')}</p>
      </div>

      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href={locale === 'es' ? '/es' : '/'} className="hover:text-blue-600">{t('common.home')}</Link></li>
          <li>/</li>
          <li aria-current="page" className="font-medium text-gray-900">{t('common.blog')}</li>
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
                  {new Date(post.date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { year: "numeric", month: "long", day: "numeric" })}
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
        <h2 className="mb-3 text-lg font-semibold text-gray-900">{t('blog.popularConversions')}</h2>
        <p className="mb-4 text-sm text-gray-600">{t('blog.tryThese')}</p>
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
