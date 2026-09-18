import type { Metadata } from "next"
import Link from "next/link"
import { Check, ExternalLink } from "lucide-react"
import { getLocale } from "@/i18n/utils"
import { buildAlternates } from "@/lib/seo/alternates"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { canonical, languages } = buildAlternates({
    locale,
    slugPath: "/compare/bookconv-vs-calibre",
    pageType: "leaf",
  })

  return {
    title: "BookConv vs Calibre: Which eBook Converter is Right for You?",
    description: "Compare BookConv (free online converter) vs Calibre (desktop software). Learn which tool is better for your eBook conversion needs.",
    keywords: ["bookconv vs calibre", "bookconv vs calibre comparison", "best ebook converter", "online vs desktop ebook converter"],
    alternates: { canonical, languages },
    openGraph: {
      title: "BookConv vs Calibre: Which eBook Converter is Right for You?",
      description: "Compare BookConv (free online converter) vs Calibre (desktop software).",
      type: "website",
      url: canonical,
      siteName: "BookConv",
      images: [{ url: "https://www.bookconv.com/og-image.svg", width: 1200, height: 630, alt: "BookConv vs Calibre" }],
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title: "BookConv vs Calibre", description: "Compare BookConv vs Calibre.", images: [`https://www.bookconv.com/og-image.svg`] },
  }
}

const COMPARISON_FEATURES = [
  { feature: "Cost", bookconv: "Free (Pro plan for batch)", calibre: "Free (open source)", winner: "tie" },
  { feature: "Setup Required", bookconv: "None - works in browser", calibre: "Download & install", winner: "bookconv" },
  { feature: "Privacy", bookconv: "Files auto-deleted in 1h", calibre: "Files stay on device", winner: "tie" },
  { feature: "Batch Conversion", bookconv: "Up to 50 files (Pro)", calibre: "Unlimited (free)", winner: "calibre" },
  { feature: "Format Support", bookconv: "28+ formats", calibre: "100+ formats", winner: "calibre" },
  { feature: "Device Compatibility", bookconv: "Any device with browser", calibre: "Windows/Mac/Linux only", winner: "bookconv" },
  { feature: "Advanced Editing", bookconv: "No - conversion only", calibre: "Full eBook editor", winner: "calibre" },
  { feature: "Library Management", bookconv: "No - single file", calibre: "Full library management", winner: "calibre" },
]

// Single source of truth: the same Q/A text drives both the visible FAQ
// block and the FAQPage JSON-LD. Divergence between rendered copy and
// schema is a GSC structured-data mismatch, so never hardcode either side.
const FAQ_ITEMS = [
  {
    q: "Is BookConv free to use?",
    a: "Yes! BookConv is completely free for personal use. We offer a Pro plan for batch processing and higher file size limits.",
  },
  {
    q: "Can I use BookConv on my phone?",
    a: "Absolutely! BookConv works in any modern browser on any device — phone, tablet, or computer. No app download required.",
  },
  {
    q: "Should I use Calibre or BookConv?",
    a: "It depends on your needs. For quick conversions, use BookConv. For batch processing, use Calibre. Many users use both!",
  },
] as const

export default async function ComparePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "BookConv vs Calibre: Which eBook Converter is Right for You?", description: "A detailed comparison of BookConv and Calibre.", author: { "@type": "Organization", name: "BookConv" } }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }) }} />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">BookConv vs Calibre</h1>
          <p className="mt-4 text-xl text-gray-600">Which eBook converter is right for you?</p>
        </section>

        <section className="mb-12 rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-4 text-xl font-bold text-blue-900">Quick Answer</h2>
          <p className="text-blue-800 leading-relaxed">
            <strong>BookConv</strong> is ideal for quick, one-off conversions on any device. <strong>Calibre</strong> is better for power users needing batch processing and advanced editing.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-200 bg-white p-4">
              <h3 className="font-semibold text-gray-900">Choose BookConv if:</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>• Quick conversions on the go</li>
                <li>• No software installation</li>
                <li>• Using shared/public computers</li>
                <li>• Value privacy (auto-deletion)</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="font-semibold text-gray-900">Choose Calibre if:</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>• Batch conversion of many files</li>
                <li>• Edit eBooks before converting</li>
                <li>• Need library management</li>
                <li>• Work offline frequently</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Feature Comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Feature</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">BookConv</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Calibre</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Winner</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {COMPARISON_FEATURES.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.feature}</td>
                    <td className="px-4 py-3 text-gray-700">{row.bookconv}</td>
                    <td className="px-4 py-3 text-gray-700">{row.calibre}</td>
                    <td className="px-4 py-3">
                      {row.winner === "bookconv" && <span className="inline-flex items-center gap-1 text-green-600"><Check className="h-4 w-4" /> BookConv</span>}
                      {row.winner === "calibre" && <span className="inline-flex items-center gap-1 text-gray-600"><Check className="h-4 w-4" /> Calibre</span>}
                      {row.winner === "tie" && <span className="text-gray-500">Tie</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12 space-y-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">When to Use BookConv</h2>
            <p className="text-gray-700 leading-relaxed">BookConv is perfect for quick, one-off conversions on any device. No installation, no registration, no watermarks.</p>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-green-600" /><span><strong>Browser-based:</strong> Works on any device</span></li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-green-600" /><span><strong>Privacy-focused:</strong> Files auto-delete after 1 hour</span></li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-green-600" /><span><strong>No limits:</strong> Free for personal use</span></li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">When to Use Calibre</h2>
            <p className="text-gray-700 leading-relaxed">Calibre is the industry-standard desktop application for eBook management. Ideal for power users who need batch processing and advanced features.</p>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-blue-600" /><span><strong>Batch processing:</strong> Convert entire libraries at once</span></li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-blue-600" /><span><strong>Full editor:</strong> Edit text, images, and metadata</span></li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-blue-600" /><span><strong>Library management:</strong> Organize, tag, and search</span></li>
            </ul>
          </div>
        </section>

        <section className="mb-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="mb-4 text-xl font-bold text-emerald-900">Use Both: The Best of Both Worlds</h2>
          <p className="text-emerald-800 leading-relaxed">Many power users choose to use both tools for different scenarios.</p>
          <ol className="mt-4 space-y-2 text-emerald-800">
            <li>1. Use <strong>BookConv</strong> for quick, one-off conversions on any device</li>
            <li>2. Use <strong>Calibre</strong> for batch processing and library management</li>
            <li>3. Sync between devices using cloud storage or Calibre's content server</li>
          </ol>
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">Ready to Try BookConv?</h2>
          <p className="mb-6 text-blue-100">Start converting your eBooks for free — no registration required.</p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Link href="/convert/epub-to-mobi" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-600 hover:bg-blue-50">
              Convert EPUB to MOBI <ExternalLink className="h-4 w-4" />
            </Link>
            <Link href="/convert/pdf-to-epub" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white px-6 py-3 text-base font-semibold text-white hover:bg-white/10">
              Convert PDF to EPUB <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mb-12 mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((f) => (
              <details key={f.q} className="rounded-xl border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-gray-900">{f.q}</summary>
                <p className="mt-2 text-sm text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
