import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, Tag, ArrowLeft, BookOpen } from "lucide-react"
import { getAllGuides } from "@/data/guides"
import { renderMarkdownToHtml, stripMarkdown, type BlogFaq } from "@/data/blog/types"

interface GuideData {
  slug: string
  title: string
  problem: string
  date: string
  tags: string[]
  formats?: { source: string; target: string }
  keyTakeaways: string[]
  content: { intro?: string; sections: { heading: string; body: string }[] }
  faqs: BlogFaq[]
}

const GUIDES: Record<string, GuideData> = {}
for (const g of getAllGuides()) GUIDES[g.slug] = g as unknown as GuideData

interface GuideSlugProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return Object.keys(GUIDES).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: GuideSlugProps): Promise<Metadata> {
  const { slug } = await params
  const g = GUIDES[slug]
  if (!g) return {}

  const baseUrl = "https://www.bookconv.com"
  const description = g.problem || g.content.intro || g.title

  return {
    title: g.title,
    description,
    keywords: [...g.tags, "ebook converter", "calibre"],
    alternates: {
      canonical: `${baseUrl}/guide/${g.slug}`,
      languages: { en: `/guide/${g.slug}`, es: `/es/guide/${g.slug}`, 'x-default': `/guide/${g.slug}` },
    },
    openGraph: {
      title: g.title,
      description,
      type: "article",
      publishedTime: g.date,
      url: `${baseUrl}/guide/${g.slug}`,
      siteName: "BookConv",
      authors: ["BookConv Team"],
      tags: g.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: g.title,
      description,
    },
  }
}

export default async function GuidePage({ params }: GuideSlugProps) {
  const { slug } = await params
  const g = GUIDES[slug]

  if (!g) notFound()

  const baseUrl = "https://www.bookconv.com"
  const guideUrl = `${baseUrl}/guide/${g.slug}`
  const others = getAllGuides().filter((x) => x.slug !== slug)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: g.title,
            description: g.problem || g.content.intro || "",
            datePublished: g.date,
            dateModified: g.date,
            author: {
              "@type": "Person",
              name: "BookConv Team",
              url: baseUrl,
            },
            publisher: {
              "@type": "Organization",
              name: "BookConv",
              logo: { "@type": "ImageObject", url: baseUrl + "/icon.svg" },
              sameAs: [],
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": guideUrl },
            inLanguage: "en-US",
            keywords: g.tags.join(", "),
          }),
        }}
      />

      <main className="mx-auto max-w-3xl px-4 py-16">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li><Link href="/guide" className="hover:text-blue-600">Guides</Link></li>
            <li>/</li>
            <li aria-current="page" className="font-medium text-gray-900 truncate">{g.title}</li>
          </ol>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">{g.title}</h1>
          <p className="text-lg text-gray-600 mb-4">{g.problem}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(g.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <div className="flex items-center gap-1.5">
              {g.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  <Tag className="h-2.5 w-2.5 mr-0.5" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        {g.keyTakeaways?.length > 0 && (
          <div className="mb-10 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">Key Takeaways</h2>
            <ul className="space-y-1.5 text-sm text-gray-700">
              {g.keyTakeaways.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <article className="prose prose-gray max-w-none">
          {g.content.intro && (
            <p className="text-lg text-gray-700 leading-relaxed border-l-4 border-blue-500 pl-4 italic">{g.content.intro}</p>
          )}
          {g.content.sections.map((s, i) => (
            <section key={i} className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900">{s.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(s.body) }} />
            </section>
          ))}
        </article>

        {g.faqs?.length > 0 && (
          <section className="mt-12" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="mb-4 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {g.faqs.map((f, i) => (
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
                  mainEntity: g.faqs.map((f) => ({
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

        <section className="mt-12 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Try It Yourself</h2>
          {g.formats ? (
            <>
              <p className="mb-4 text-sm text-gray-600">Convert {g.formats.source.toUpperCase()} to {g.formats.target.toUpperCase()} for free:</p>
              <Link
                href={`/convert/${g.formats.source.toLowerCase()}-to-${g.formats.target.toLowerCase()}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <BookOpen className="h-4 w-4" />
                Convert {g.formats.source.toUpperCase()} to {g.formats.target.toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-600">Pick a format pair and convert it free:</p>
              <Link
                href="/convert"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <BookOpen className="h-4 w-4" />
                Browse All Converters
              </Link>
            </>
          )}
        </section>

        {others.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">More guides</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {others.map((o) => (
                <Link key={o.slug} href={`/guide/${o.slug}`} className="group block rounded-xl border bg-white p-5 transition-colors hover:border-blue-300 hover:bg-blue-50">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600">{o.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 leading-relaxed">{o.problem}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 pt-6 border-t">
          <Link href="/guide" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to all guides
          </Link>
        </div>
      </main>
    </>
  )
}
