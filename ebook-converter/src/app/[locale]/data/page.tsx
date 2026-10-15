import type { Metadata } from "next"
import Link from "next/link"
import { Database, Download, ExternalLink } from "lucide-react"
import { getLocale } from "@/i18n/utils"
import { buildAlternates } from "@/lib/seo/alternates"
import { clampMetaDescription } from "@/lib/seo/meta-description"
import { DATA_PAGES } from "@/data/data-pages"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { canonical, languages } = buildAlternates({
    locale,
    slugPath: "/data",
    pageType: "list",
  })

  return {
    title: "Public Datasets — BookConv SEO & AI Citation Data",
    description: clampMetaDescription(
      "Free, downloadable datasets from BookConv: Bing AI citations, Google Search performance, and a site event timeline, each with full methodology and limitations."
    ),
    alternates: { canonical, languages },
    openGraph: {
      title: "Public Datasets — BookConv SEO & AI Citation Data",
      description:
        "Downloadable, methodology-documented datasets: Bing AI citations, Google Search performance, and site event timeline.",
      type: "website",
      url: canonical,
      siteName: "BookConv",
    },
  }
}

export default function DataIndexPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Public Datasets
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Raw, downloadable measurement data from running an ebook converter site
        </p>
      </section>

      <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Why we publish raw data</h2>
        <p className="text-gray-700 leading-relaxed">
          Most &ldquo;SEO case study&rdquo; content shows only conclusions. We publish the underlying
          measurements instead: normalized exports with source, collection window, sample size, and
          stated limitations, so any number we cite elsewhere can be checked against the data it came from.
        </p>
        <p className="mt-4 text-gray-700 leading-relaxed">
          Every dataset below is a record of <strong>one small website over a limited window</strong>.
          It is a case fact, not a general rule — please read each dataset&apos;s limitations section
          before reusing it.
        </p>
      </section>

      <section className="mb-10 space-y-6">
        {DATA_PAGES.map((d) => (
          <div key={d.slug} className="rounded-2xl border border-gray-200 bg-white p-8">
            <div className="flex items-start gap-3">
              <Database className="mt-1 h-6 w-6 shrink-0 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  <Link href={`/data/${d.slug}`} className="hover:text-blue-700">
                    {d.title}
                  </Link>
                </h2>
                <p className="mt-2 text-gray-700 leading-relaxed">{d.summary}</p>
                <dl className="mt-4 grid gap-x-8 gap-y-1 text-sm text-gray-600 sm:grid-cols-2">
                  <div>
                    <dt className="inline font-semibold text-gray-800">Records: </dt>
                    <dd className="inline">{d.rowCount.toLocaleString("en-US")}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-gray-800">Window: </dt>
                    <dd className="inline">{d.collectionWindow.split(" plus ")[0].split(";")[0]}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <Link
                    href={`/data/${d.slug}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    Methodology &amp; download →
                  </Link>
                  <a
                    href={d.fileUrl}
                    className="inline-flex items-center gap-1 font-medium text-gray-700 hover:underline"
                    download
                  >
                    <Download className="h-4 w-4" />
                    CSV ({(d.rowCount + 1).toLocaleString("en-US")} lines incl. header)
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="mb-2 text-lg font-bold text-gray-900">Case boundary statement</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          All BookConv datasets are single-case observations of this website and are provided as-is,
          without warranty. Nothing here constitutes a guarantee of results for any other site. Where
          our other pages cite figures, they link back to these datasets.
        </p>
        <p className="mt-3 text-sm text-gray-600">
          Questions about the data? See{" "}
          <Link href="/about" className="font-medium text-blue-700 hover:underline">
            about BookConv
          </Link>{" "}
          <ExternalLink className="inline h-3.5 w-3.5" />.
        </p>
      </section>
    </main>
  )
}
