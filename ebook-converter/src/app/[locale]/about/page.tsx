import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, Shield, Zap, Globe, GitBranch } from "lucide-react"
import { getLocale } from "@/i18n/utils"
import { buildAlternates } from "@/lib/seo/alternates"
import { clampMetaDescription } from "@/lib/seo/meta-description"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { canonical, languages } = buildAlternates({
    locale,
    slugPath: "/about",
    pageType: "leaf",
  })

  return {
    title: "About BookConv — Free Online eBook Converter",
    description: clampMetaDescription("Learn about BookConv's mission to make eBook conversion accessible, secure, and free for everyone. See supported formats and output limitations."),
    keywords: ["about", "bookconv", "ebook converter", "calibre", "privacy"],
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

const aboutFaqs = [
  { q: 'Is BookConv really free?', a: "Yes! BookConv is completely free for personal use. When direct upload is available, a single file can be uploaded up to 100 MB; the multipart fallback and batch uploads are limited to 4 MB per file. Upload capability does not guarantee every format and route can complete a conversion at that size. Batch conversion is free during public beta; Pro is listed at $5/month on the pricing page. Personal conversions require no registration." },
  { q: 'How long are my files stored?', a: 'Retention depends on the processing route. Some converted outputs may be cached and third-party copies follow their own policies. Immediate deletion of every copy is not guaranteed; see our privacy policy.' },
  { q: 'Who processes my files?', a: 'BookConv processes files on servers. Some routes use CloudConvert and results may be cached. Read our file security information and privacy policy before uploading confidential documents.' },
  { q: 'What formats do you support?', a: 'We support 28+ formats including EPUB, MOBI, AZW3, PDF, DOCX, TXT, RTF, HTML, FB2, LIT, CBR, DJVU, JPG, and PNG. New formats are added regularly based on user demand.' },
  { q: 'Is BookConv the same as BookReverb or BookConvert?', a: 'No. BookConv (bookconv.com) is an independent, free online converter using format-specific conversion methods. It is not affiliated with, related to, or endorsed by BookReverb, BookConvert, or any similar-named product. If you have been referred to one of those names, this site is bookconv.com only.' },
];

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
            description: "BookConv is a free online eBook format converter using format-specific conversion methods. We are not affiliated with BookReverb or BookConvert — any site using those names is a separate product.",
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
              sameAs: ["https://x.com/GinoTou2024", "https://www.reddit.com/r/ebooks/comments/1v8ypvd/"],
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
            Whether you&apos;re switching from Kindle to Kobo, converting old MOBI files to EPUB, or preparing manuscripts for publication,
            format compatibility shouldn&apos;t be a barrier.
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            We believe eBook conversion should be:
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Free</strong> — No hidden fees; free for personal use</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Secure</strong> — Files are transferred over HTTPS and processed server-side; see our privacy policy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Simple</strong> — No registration, no software to install</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Open</strong> — Format-specific tools with explicit output limits</span>
            </li>
          </ul>
          <p className="mt-4 text-gray-700 leading-relaxed">
            BookConv transfers files over HTTPS and processes them on servers; some routes use third-party services — no account or software install required.
          </p>
      </section>

      {/* Features Grid */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Why Choose BookConv?</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Format-Specific Processing</h3>
              <p className="text-sm text-gray-600">
                Upload a supported file without installing desktop software. Processing time depends on file size, format and service availability.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Privacy First</h3>
              <p className="text-sm text-gray-600">
                No registration required for personal conversions. Files are transferred over HTTPS; see our privacy policy for processing and retention details.
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-600">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">28+ Formats</h3>
              <p className="text-sm text-gray-600">
                Support for EPUB, MOBI, AZW3, PDF, DOCX, TXT, and many more. Choose from the supported conversion pairs.
              </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Format Preserved</h3>
              <p className="text-sm text-gray-600">
                Preservation depends on the conversion route and target format. Some routes rebuild text only; check images, chapters and styling in your reader.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="mb-12 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Format-specific conversion methods</h2>
          <p className="text-gray-700 leading-relaxed">
            Some BookConv routes use the <a href="https://calibre-ebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-700">Calibre engine</a> ; other routes extract and rebuild text or use a third-party service.
            Choose a route based on the file and output you need:
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>Industry-standard conversion quality</strong> — Check font rendering, chapter structure and metadata after conversion</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>Transparent process</strong> — Methods differ by format; text-only output cannot preserve images and styling</span>
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

        {/* CTA Section — funnel person-page traffic into the free converter */}
        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">Ready to Convert Your eBooks — Free?</h2>
          <p className="mb-6 text-blue-100">
            Use the free BookConv converter: 28+ formats, no registration, HTTPS transfers; server-side processing.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            Try the Free Converter
            <Zap className="h-4 w-4" />
          </Link>
        </section>

        {/* Social & Contact */}
        <section className="mb-12 rounded-2xl border border-gray-200 bg-white p-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Get in Touch</h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            Questions, feedback, or feature requests? Reach out through any channel — we read everything.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:hello@bookconv.com"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <span aria-hidden="true">✉️</span>
              hello@bookconv.com
            </a>
            <a
              href="https://x.com/GinoTou2024"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow BookConv on X (Twitter)"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <span aria-hidden="true">𝕏</span>
              @GinoTou2024
            </a>
            <a
              href="https://www.reddit.com/r/ebooks/comments/1v8ypvd/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="BookConv on Reddit"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <span aria-hidden="true">✳</span>
              Reddit
            </a>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold">Explore BookConv</h2>
          <p className="mt-4"><Link href="/compare/bookconv-vs-calibre" className="underline">Compare BookConv and Calibre</Link> for different conversion workflows, or explore our <Link href="/data" className="underline">public measurement datasets</Link> and their limitations.</p>
        </section>
        {/* FAQ Section */}
        <section className="mb-12 mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {aboutFaqs.map((f, i) => (
              <details key={i} className="rounded-xl border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-gray-900">{f.q}</summary>
                <p className="mt-2 text-sm text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: aboutFaqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      </main>
    </>
  )
}
