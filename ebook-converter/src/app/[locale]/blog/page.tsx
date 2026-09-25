import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Calendar, Tag } from "lucide-react"
import { getAllPosts } from "@/data/blog"
import { getLocale, getMessage, resolvePath } from '@/i18n/utils'
import { buildAlternates } from "@/lib/seo/alternates"
import { isHubTag, slugifyTag } from "@/lib/internal-links"

const PAGE_SIZE = 8

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params
  const { page: pageParam } = await searchParams
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1
  const prefix = locale === "es" ? "/es" : ""
  const messages = await getMessage(locale)
  const t = (key: string) => resolvePath(messages, key) || key

  const { canonical, languages } = buildAlternates({
    locale,
    slugPath: "/blog",
    pageType: "list",
  })

  const pageTitle = currentPage > 1
    ? `${t("blog.title")} — Page ${currentPage}`
    : t("blog.title")

  const robots = locale === "es" ? { index: false, follow: true } : undefined;

  return {
    title: pageTitle,
    description: t("blog.subtitle") || "Expert guides on ebook conversion.",
    alternates: { canonical, languages },
    robots,
    openGraph: {
      title: pageTitle + " | BookConv",
      url: canonical,
      type: "website",
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle + " | BookConv",
    },
  }
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { page: pageParam } = await searchParams
  const messages = await getMessage(locale)
  const t = (key: string) => resolvePath(messages, key) || key

  const prefix = locale === "es" ? "/es" : ""
  const localeCode = locale === "es" ? "es-ES" : "en-US"

  const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1
  const allPosts = getAllPosts()
  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE)

  if (currentPage > totalPages && totalPages > 0) {
    redirect(`${prefix}/blog${currentPage > 1 ? `?page=${currentPage - 1}` : ""}`)
  }

  const startIdx = (currentPage - 1) * PAGE_SIZE
  const pagedPosts = allPosts.slice(startIdx, startIdx + PAGE_SIZE)

  const dateFmt = new Intl.DateTimeFormat(localeCode, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const pagHref = (page: number) =>
    `${prefix}/blog${page > 1 ? `?page=${page}` : ""}`

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: t("blog.title"),
            description: "Expert guides on ebook format conversion.",
            url: `https://www.bookconv.com${prefix}/blog`,
            publisher: { "@id": "https://www.bookconv.com/#organization" },
            blogPost: pagedPosts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: `https://www.bookconv.com${prefix}/blog/${p.slug}`,
              datePublished: p.date,
            })),
          }),
        }}
      />
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("blog.title")}</h1>
        <p className="text-lg text-gray-600">{t("blog.subtitle")}</p>
      </div>

      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href={prefix || "/"} className="hover:text-blue-600">{t("common.home")}</Link></li>
          <li>/</li>
          <li aria-current="page" className="font-medium text-gray-900">{t("common.blog")}</li>
        </ol>
      </nav>

      <div className="space-y-8">
        {pagedPosts.map((post) => (
          <article key={post.slug} className="border-b pb-8">
            <Link href={`${prefix}/blog/${post.slug}`} className="group block">
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              {post.content?.intro && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{post.content.intro}</p>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {dateFmt.format(new Date(post.date))}
                </span>
                <div className="flex items-center gap-1.5">
                  {post.tags.map((tag) => {
                    const clickable = isHubTag(tag)
                    const cls = "inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                    return clickable ? (
                      <Link key={tag} href={`${prefix}/blog/tag/${slugifyTag(tag)}`} className={cls + " hover:bg-blue-100 hover:text-blue-800 transition-colors"}>
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

      {totalPages > 1 && (
        <nav aria-label="Blog pagination" className="mt-10 flex justify-center gap-2 flex-wrap">
          {currentPage > 1 && (
            <Link
              href={pagHref(currentPage - 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-colors"
            >
              ← {t("blog.previous")}
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={pagHref(page)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300"
              }`}
            >
              {page}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link
              href={pagHref(currentPage + 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-colors"
            >
              {t("blog.next")} →
            </Link>
          )}
        </nav>
      )}

      <section className="mt-12 rounded-xl border bg-gray-50 p-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">{t("blog.popularConversions")}</h2>
        <p className="mb-4 text-sm text-gray-600">{t("blog.tryThese")}</p>
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
