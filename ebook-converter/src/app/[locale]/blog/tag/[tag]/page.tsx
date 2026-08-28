import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, Tag } from "lucide-react"
import { getMessage, resolvePath } from '@/i18n/utils'
import { getHubTags, getPostsByTagSlug, slugifyTag } from "@/lib/internal-links"

interface TagPageProps {
  params: Promise<{ locale: string; tag: string }>
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

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { locale, tag } = await params
  const hub = getHubTags().find((h) => h.slug === tag)
  if (!hub) return {}
  const posts = getPostsByTagSlug(tag)
  if (posts.length === 0) return {}
  const label = hub.label
  const url = `https://www.bookconv.com${localePrefix(locale)}/blog/tag/${tag}`

  return {
    title: `${label} articles`,
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
      title: `${label} articles | BookConv Blog`,
      description: `Expert BookConv guides about ${label}.`,
      type: "website",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: `${label} articles | BookConv Blog`,
    },
    // Tag archive pages are thin (auto-generated lists) — exclude from index
    // so Google spends crawl budget on money pages instead.
    robots: { index: false, follow: true },
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { locale, tag } = await params
  const hub = getHubTags().find((h) => h.slug === tag)
  if (!hub) notFound()
  const posts = getPostsByTagSlug(tag)
  if (posts.length === 0) notFound()

  const label = hub.label
  const messages = await getMessage(locale)
  const t = (key: string) => resolvePath(messages, key) || key
  const prefix = localePrefix(locale)

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${label} articles`,
            description: `All BookConv guides about ${label}.`,
            url: `https://www.bookconv.com${prefix}/blog/tag/${tag}`,
            hasPart: posts.map((p) => ({
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
          <li aria-current="page" className="font-medium text-gray-900 truncate">{label}</li>
        </ol>
      </nav>

      <header className="mb-10">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          <Tag className="h-3 w-3" />
          {label}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Articles tagged “{label}”
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {posts.length} {posts.length === 1 ? "article" : "articles"} in this topic.
        </p>
      </header>

      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b pb-8">
            <Link href={`/blog/${post.slug}`} className="group block">
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              {post.content?.intro && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{post.content.intro}</p>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.date).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t">
        <Link href={`${prefix}/blog`} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
          ← {t("common.blog")}
        </Link>
      </div>
    </main>
  )
}
