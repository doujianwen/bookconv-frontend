import Link from "next/link"
import { ArrowRight, Zap, Shield, Globe } from "lucide-react"
import { KEYWORDS } from "@/lib/constants"
import { getSlug } from "@/lib/utils"
import { FORMAT_DISPLAY_NAMES } from "@/lib/conversion-map"

export default function HomePage() {
  const p0Keywords = KEYWORDS.filter((k) => k.phase === "P0")

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Free Online Ebook Converter
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Convert EPUB, MOBI, AZW3, PDF, and more. No registration, no watermarks, no limits.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {p0Keywords.slice(0, 6).map((k) => {
              const slug = getSlug(k.source, k.target)
              return (
                <Link
                  key={slug}
                  href={`/convert/${slug}`}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-blue-50 hover:text-blue-600 hover:ring-blue-300"
                >
                  {k.source.toUpperCase()} → {k.target.toUpperCase()}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 text-center">
            <Zap className="mx-auto h-8 w-8 text-blue-500" />
            <h3 className="mt-3 font-semibold text-gray-900">Instant Conversion</h3>
            <p className="mt-1 text-sm text-gray-500">
              Convert your ebooks in seconds with our Calibre-powered engine.
            </p>
          </div>
          <div className="rounded-xl border bg-white p-6 text-center">
            <Shield className="mx-auto h-8 w-8 text-blue-500" />
            <h3 className="mt-3 font-semibold text-gray-900">100% Secure</h3>
            <p className="mt-1 text-sm text-gray-500">
              Files are encrypted in transit and automatically deleted within 1 hour.
            </p>
          </div>
          <div className="rounded-xl border bg-white p-6 text-center">
            <Globe className="mx-auto h-8 w-8 text-blue-500" />
            <h3 className="mt-3 font-semibold text-gray-900">No Registration</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start converting immediately. No account, no email, no hassle.
            </p>
          </div>
        </div>
      </section>

      {/* All conversions grid */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          All Supported Conversions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {KEYWORDS.map((k) => {
            const slug = getSlug(k.source, k.target)
            const s = FORMAT_DISPLAY_NAMES[k.source] || k.source.toUpperCase()
            const t = FORMAT_DISPLAY_NAMES[k.target] || k.target.toUpperCase()
            return (
              <Link
                key={slug}
                href={`/convert/${slug}`}
                className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 text-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
              >
                <span className="font-medium text-gray-700">
                  {s} → {t}
                </span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  KD {k.kd}
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}