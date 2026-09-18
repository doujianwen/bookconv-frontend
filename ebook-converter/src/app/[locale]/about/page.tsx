import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, Shield, Zap, Globe, Users, GitBranch } from "lucide-react"
import { getLocale } from "@/i18n/utils"
import { buildAlternates } from "@/lib/seo/alternates"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { canonical, languages } = buildAlternates({
    locale,
    slugPath: "/about",
    pageType: "leaf",
  })

  return {
    title: "About BookConv — Free Online eBook Converter",
    description: "Learn about BookConv's mission to make eBook conversion accessible, secure, and free for everyone. Powered by Calibre, trusted by readers worldwide.",
    keywords: ["about", "bookconv", "ebook converter", "calibre", "open source", "privacy"],
    alternates: { canonical, languages },
    openGraph: {
      title: "About BookConv — Free Online eBook Converter",
      description: "Learn about BookConv's mission to make eBook conversion accessible, secure, and free for everyone.",
      type: "website",
      url: canonical,
      siteName: "BookConv",
      images: [
        {
          url: "https://www.bookconv.com/og-image.svg",
          width: 1200,
          height: 630,
          alt: "About BookConv",
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "About BookConv — Free Online eBook Converter",
      description: "Learn about BookConv's mission to make eBook conversion accessible, secure, and free.",
      images: [`https://www.bookconv.com/og-image.svg`],
    },
  }
}

export default async function AboutPage() {
  return (
    <>
      {/* FAQ Schema for About Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About BookConv",
            description: "BookConv is a free online eBook converter powered by Calibre, supporting 28+ formats with no registration required.",
            url: "https://www.bookconv.com/about",
            publisher: {
              "@type": "Organization",
              name: "BookConv",
              url: "https://www.bookconv.com",
            },
            mainEntity: {
              "@type": "Organization",
              name: "BookConv",
              description: "Free online eBook format converter",
              url: "https://www.bookconv.com",
              sameAs: [],
            },
          }),
        }}
      />

      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            About BookConv
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Making eBook conversion free, secure, and accessible for everyone
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-12 rounded-2xl border border-gray-200 bg-white p-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            BookConv was created to solve a simple problem: <strong>everyone has eBooks in the wrong format</strong>.
            Whether you're switching from Kindle to Kobo, converting old MOBI files to EPUB, or preparing manuscripts for publication,
            format compatibility shouldn't be a barrier.
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            We believe eBook conversion should be:
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Free</strong> — No hidden fees, no limits on personal use</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Secure</strong> — Your files are encrypted and auto-deleted within 1 hour</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Simple</strong> — No registration, no software to install</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Open</strong> — Powered by Calibre, the industry-standard open-source engine</span>
            </li>
          </ul>
        </section>

        {/* Features Grid */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Why Choose BookConv?</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Lightning Fast</h3>
              <p className="text-sm text-gray-600">
                Powered by Calibre's optimized conversion engine. Most conversions complete in seconds, not minutes.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Privacy First</h3>
              <p className="text-sm text-gray-600">
                No registration required. Files are encrypted during transfer and automatically deleted within 1 hour.
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-600">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">28+ Formats</h3>
              <p className="text-sm text-gray-600">
                Support for EPUB, MOBI, AZW3, PDF, DOCX, TXT, and many more. Convert between any combination of formats.
              </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Format Preserved</h3>
              <p className="text-sm text-gray-600">
                Images, chapters, metadata, and formatting are preserved during conversion. Your eBook looks exactly as intended.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="mb-12 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Powered by Calibre</h2>
          <p className="text-gray-700 leading-relaxed">
            BookConv uses the <a href="https://calibre-ebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-700">Calibre engine</a> — the most trusted open-source ebook library in the world.
            Used by millions of readers and developers, Calibre ensures:
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>Industry-standard conversion quality</strong> — Font rendering, chapter structure, and metadata are preserved faithfully</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>Open-source transparency</strong> — No black-box algorithms, fully auditable codebase</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>Active development</strong> — Continuously improved by a global community of contributors</span>
            </li>
          </ul>
          <div className="mt-6 flex items-center gap-3">
            <GitBranch className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-600">
              Calibre is available under GNU GPL v3. Source: <a href="https://github.com/kovidgoyal/calibre" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">github.com/kovidgoyal/calibre</a>
            </span>
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">Ready to Convert Your eBooks?</h2>
          <p className="mb-6 text-blue-100">
            Join thousands of readers who trust BookConv for their format conversion needs.
          </p>
          <Link
            href="/convert/epub-to-mobi"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            Start Converting Now
            <Zap className="h-4 w-4" />
          </Link>
        </section>

        {/* FAQ Section */}
        <section className="mb-12 mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="rounded-xl border border-gray-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">Is BookConv really free?</summary>
              <p className="mt-2 text-sm text-gray-600">
                Yes! BookConv is completely free for personal use. We offer a Pro plan for power users who need batch processing
                and higher file size limits, but individual conversions are always free with no registration required.
              </p>
            </details>

            <details className="rounded-xl border border-gray-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">How long are my files stored?</summary>
              <p className="mt-2 text-sm text-gray-600">
                Uploaded files are automatically deleted within 1 hour. We never store your content longer than necessary
                to complete the conversion and provide you with the download link.
              </p>
            </details>

            <details className="rounded-xl border border-gray-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">Do you sell my data?</summary>
              <p className="mt-2 text-sm text-gray-600">
                Absolutely not. We don't sell user data, and we don't use your files for any purpose other than conversion.
                Your privacy is our priority — that's why we don't even require account creation.
              </p>
            </details>

            <details className="rounded-xl border border-gray-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">What formats do you support?</summary>
              <p className="mt-2 text-sm text-gray-600">
                We support 28+ formats including EPUB, MOBI, AZW3, PDF, DOCX, TXT, RTF, HTML, FB2, LIT, CBR, DJVU, JPG, and PNG.
                New formats are added regularly based on user demand.
              </p>
            </details>
          </div>
        </section>
      </main>
    </>
  )
}
