import type { Metadata } from "next"
import Link from "next/link"
import { User, BookOpen, Brain, TrendingUp } from "lucide-react"
import { getLocale } from "@/i18n/utils"
import { buildAlternates } from "@/lib/seo/alternates"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { canonical, languages } = buildAlternates({
    locale,
    slugPath: "/founder",
    pageType: "leaf",
  })

  return {
    title: "About the Founder — Hongjian Dou (Andy) | SEO & AI Visibility Expert",
    description:
      "Meet Hongjian Dou (Andy), founder of BookConv. 20+ years in internet growth, SEO, digital operations, and AI visibility. Now researching how AI search changes content discovery.",
    keywords: [
      "hongjian dou",
      "andy dou",
      "founder",
      "seo expert",
      "ai visibility",
      "geo optimization",
      "generative engine optimization",
      "bookconv founder",
    ],
    alternates: { canonical, languages },
    openGraph: {
      title: "About the Founder — Hongjian Dou (Andy) | SEO & AI Visibility Expert",
      description:
        "Meet Hongjian Dou (Andy), founder of BookConv. 20+ years in internet growth, SEO, and AI visibility research.",
      type: "website",
      url: canonical,
      siteName: "BookConv",
      images: [
        {
          url: "https://www.bookconv.com/og-image.svg",
          width: 1200,
          height: 630,
          alt: "About the Founder — Hongjian Dou",
        },
      ],
      locale: locale === "es" ? "es_ES" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "About the Founder — Hongjian Dou (Andy)",
      description: "20+ years in SEO and AI visibility. Founder of BookConv.",
      images: [`https://www.bookconv.com/og-image.svg`],
    },
  }
}

export default async function FounderPage() {
  return (
    <>
      {/* Person Schema for Founder Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Hongjian Dou",
            alternateName: "Andy",
            description:
              "Founder of BookConv. 20+ years in internet growth, SEO, digital operations, and AI visibility research.",
            url: "https://www.bookconv.com/founder",
            jobTitle: "Founder & CEO",
            worksFor: {
              "@type": "Organization",
              name: "BookConv",
              url: "https://www.bookconv.com",
            },
            sameAs: [
              "https://x.com/GinoTou2024",
            ],
            knownFor: [
              {
                "@type": "WebSite",
                name: "BookConv",
                url: "https://www.bookconv.com",
              },
            ],
          }),
        }}
      />

      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            About the Founder
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            20+ years shaping digital growth — now focused on AI visibility
          </p>
        </section>

        {/* Intro Section */}
        <section className="mb-12 rounded-2xl border border-gray-200 bg-white p-8">
          <p className="text-gray-700 leading-relaxed text-lg">
            Hi, I&apos;m <strong>Hongjian Dou (Andy)</strong>. I&apos;ve spent more than 20 years working
            in internet growth, SEO, digital operations, and online business systems.
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Over the years, I&apos;ve helped build growth programs, large-scale content operations, and
            B2B user acquisition projects. But the rise of AI search changed something fundamental:
            people are no longer discovering information only through traditional search engines.
            Increasingly, they ask ChatGPT, Gemini, Bing AI, Perplexity, and other AI systems directly.
          </p>
        </section>

        {/* Three Expertise Cards */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Areas of Expertise</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Internet Growth</h3>
              <p className="text-sm text-gray-600">
                Building growth programs and user acquisition systems that scale.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">SEO & Content</h3>
              <p className="text-sm text-gray-600">
                Large-scale content operations and organic traffic strategies.
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-600">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">AI Visibility</h3>
              <p className="text-sm text-gray-600">
                GEO research — how content gets discovered and cited by AI systems.
              </p>
            </div>
          </div>
        </section>

        {/* The Shift Section */}
        <section className="mb-12 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">The Shift to AI Search</h2>
          <p className="text-gray-700 leading-relaxed">
            That shift led me to focus on a new field: <strong>AI Visibility and GEO (Generative Engine Optimization)</strong>.
            BookConv is one of my real-world experiments. The goal wasn&apos;t simply to build another ebook converter.
            The goal was to understand how useful products become discoverable inside AI systems, how content earns citations,
            and how AI-driven visibility can translate into traffic, users, and business growth.
          </p>
        </section>

        {/* What I Share Section */}
        <section className="mb-12 rounded-2xl border border-gray-200 bg-white p-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">What I Share Here</h2>
          <p className="text-gray-700 leading-relaxed">
            Today, BookConv serves readers around the world while also acting as a living laboratory for
            AI Visibility research. Every page, every guide, and every improvement helps us better understand
            how people discover information in the AI era.
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            What I share here comes from actual building, testing, measuring, and learning — not theory.
          </p>
        </section>

        {/* CTA Section */}
        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">
            Interested in AI Visibility or GEO?
          </h2>
          <p className="mb-6 text-blue-100">
            If you want to understand how AI search is changing content discovery, check out our blog guides
            or reach out directly.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              <BookOpen className="h-4 w-4" />
              Read the Blog
            </Link>
            <a
              href="mailto:hello@bookconv.com"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Get in Touch
            </a>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12 mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="rounded-xl border border-gray-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">
                What is GEO?
              </summary>
              <p className="mt-2 text-sm text-gray-600">
                GEO (Generative Engine Optimization) is the practice of making content discoverable and citable
                by AI search systems like ChatGPT, Gemini, and Bing AI — not just traditional search engines.
              </p>
            </details>

            <details className="rounded-xl border border-gray-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">
                Why BookConv?
              </summary>
              <p className="mt-2 text-sm text-gray-600">
                BookConv is both a real product serving readers worldwide and a research lab for understanding
                how AI systems discover and cite content. It gives us first-hand data on what works.
              </p>
            </details>

            <details className="rounded-xl border border-gray-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">
                How can I work with you?
              </summary>
              <p className="mt-2 text-sm text-gray-600">
                I offer GEO consulting for businesses looking to improve their visibility in AI search.
                Contact us at hello@bookconv.com or find me on X @GinoTou2024.
              </p>
            </details>
          </div>
        </section>
      </main>
    </>
  )
}
