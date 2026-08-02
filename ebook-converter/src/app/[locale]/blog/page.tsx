import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, Calendar, Tag } from "lucide-react"
import { getLocale, getMessage, resolvePath } from '@/i18n/utils'
import { getAllPosts } from "@/data/blog"
import { isHubTag, slugifyTag } from "@/lib/internal-links"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = await getMessage(locale);
  const t = (key: string) => resolvePath(messages, key) || key;

  return {
    title: t('blog.title') + " | BookConv",
    description: t('seo.defaultDescription') || 'Expert guides on ebook conversion.',
    alternates: { canonical: `https://www.bookconv.com${'/' + locale}/blog` },
    openGraph: {
      title: t('blog.title') + " | BookConv",
      url: `https://www.bookconv.com${'/' + locale}/blog`,
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

const posts: BlogPost[] = getAllPosts().map((p) => ({
  title: p.title,
  slug: p.slug,
  date: p.date,
  excerpt: p.content?.intro || "",
  tags: p.tags,
}))

export default async function BlogPage() {
  const locale = await getLocale();
  const messages = await getMessage(locale);
  const t = (key: string) => resolvePath(messages, key) || key;

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
            url: `https://www.bookconv.com${'/' + locale}/blog`,
            publisher: { "@id": "https://www.bookconv.com/#organization" },
            blogPost: posts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: `https://www.bookconv.com${'/' + locale}/blog/${p.slug}`,
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
