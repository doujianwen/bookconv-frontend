import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Calendar, Tag } from "lucide-react"
import { getMessage, resolvePath } from '@/i18n/utils'
import { getHubTags, getPostsByTagSlug } from "@/lib/internal-links"

const PAGE_SIZE = 8

interface TagPageProps {
  params: Promise<{ locale: string; tag: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateStaticParams() {
  const locales = ["en", "es"] as const
  const hubs = getHubTags()
  const out: { locale: string; tag: string }[] = []
  for (const locale of locales) {
    for (const h of hubs) out.push({ locale, tag: h.slug })
  }
  return out
}

function localePrefix(locale: string): string {
  return locale === "en" ? "" : "/" + locale
}

export async function generateMetadata({ params, searchParams }: TagPageProps): Promise<Metadata> {
  const { locale, tag } = await params
  const { page: pageParam } = await searchParams
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1
  const hub = getHubTags().find((h) => h.slug === tag)
  if (!hub) return {}
  const posts = getPostsByTagSlug(tag)
  if (posts.length === 0) return {}
  const label = hub.label
  const prefix = localePrefix(locale)
  const url = `https://www.bookconv.com${prefix}/blog/tag/${tag}`

  const messages = await getMessage(locale)

  const pageTitle = currentPage > 1
    ? `${label} articles — Page ${currentPage}`
    : `${label} articles`

  return {
    title: pageTitle,
    description: `Expert BookConv guides about ${label} — ebook format conversion tips, comparisons, and how-tos.`,
    alternates: {
      canonical: url,
      languages: {
        en: `/blog/tag/${tag}`,
        es: `/es/blog/tag/${tag}`,
        'x-default': `/blog/tag/${tag}`,
      },
    },
    openGraph: {
      title: `${pageTitle} | BookConv Blog`,
      description: `Expert BookConv guides about ${label}.`,
      type: "website",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | BookConv Blog`,
    },
    robots: { index: false, follow: true },
  }
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { locale, tag } = await params
  const { page: pageParam } = await searchParams
  const hub = getHubTags().find((h) => h.slug === tag)
  if (!hub) notFound()
  const allPosts = getPostsByTagSlug(tag)
  if (allPosts.length === 0) notFound()

  const messages = await getMessage(locale)
  const t = (key: string) => resolvePath(messages, key) || key
  const prefix = localePrefix(locale)
  const localeCode = locale === "es" ? "es-ES" : "en-US"

  const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1
  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE)

  if (currentPage > totalPages) {
    redirect(`${prefix}/blog/tag/${tag}${currentPage > 1 ? `?page=${currentPage - 1}` : ""}`)
  }

  const startIdx = (currentPage - 1) * PAGE_SIZE
  const pagedPosts = allPosts.slice(startIdx, startIdx + PAGE_SIZE)

  const dateFmt = new Intl.DateTimeFormat(localeCode, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const pagHref = (page: number) =>
    `${prefix}/blog/tag/${tag}${page > 1 ? `?page=${page}` : ""}`

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${hub.label} articles`,
            description: `All BookConv guides about ${hub.label}.`,
            url: `https://www.bookconv.com${prefix}/blog/tag/${tag}`,
            hasPart: pagedPosts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: `https://www.bookconv.com${prefix}/blog/${p.slug}`,
              datePublished: p.date,
            })),
          }),
        }}
      />

      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href={prefix || "/"} className="hover:text-blue-600">{t("common.home")}</Link></li>
          <li>/</li>
          <li><Link href={`${prefix}/blog`} className="hover:text-blue-600">{t("common.blog")}</Link></li>
          <li>/</li>
          <li aria-current="page" className="font-medium text-gray-900 truncate">{hub.label}</li>
        </ol>
      </nav>

      <header className="mb-10">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          <Tag className="h-3 w-3" />
          {hub.label}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Articles tagged "{hub.label}"
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {allPosts.length} {allPosts.length === 1 ? "article" : "articles"} in this topic.
          {totalPages > 1 && ` — Page ${currentPage} of ${totalPages}`}
        </p>
      </header>

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
              </div>
            </Link>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Tag pagination" className="mt-10 flex justify-center gap-2 flex-wrap">
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

      <div className="mt-12 pt-6 border-t">
        <Link href={`${prefix}/blog`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
          ← {t("blog.backToList")}
        </Link>
      </div>
    </main>
  )
}
