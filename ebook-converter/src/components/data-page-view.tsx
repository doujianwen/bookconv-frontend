import Link from "next/link"
import { Download } from "lucide-react"
import type { DataPageSpec } from "@/data/data-pages"

/**
 * Shared server-rendered body for /data/[slug] dataset pages (M4-2).
 * Every page states: data source, collection window, sample size, columns,
 * methodology, limitations, and a downloadable CSV — the acceptance criteria
 * for a citable data page. The case-boundary statement appears on every page.
 */
export function DataPageView({ spec }: { spec: DataPageSpec }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <p className="mb-2 text-sm text-gray-500">
        <Link href="/data" className="hover:underline">
          Public Datasets
        </Link>{" "}
        / {spec.slug}
      </p>

      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{spec.title}</h1>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">{spec.summary}</p>
      </section>

      {/* Key facts — the citability contract */}
      <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Dataset facts</h2>
        <dl className="space-y-3 text-gray-700">
          <div>
            <dt className="font-semibold text-gray-900">Data source</dt>
            <dd className="mt-0.5">{spec.source}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Collection window</dt>
            <dd className="mt-0.5">{spec.collectionWindow}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Sample size</dt>
            <dd className="mt-0.5">
              {spec.rowCount.toLocaleString("en-US")} records × {spec.columnCount} columns (CSV,
              UTF-8)
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Download</dt>
            <dd className="mt-0.5">
              <a
                href={spec.fileUrl}
                download
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Download {spec.fileUrl.replace("/data/", "")}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Columns</dt>
            <dd className="mt-0.5">
              <code className="block rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-800">
                {spec.columns.join(", ")}
              </code>
            </dd>
          </div>
        </dl>
      </section>

      <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Methodology</h2>
        <ul className="list-disc space-y-2 pl-5 text-gray-700 leading-relaxed">
          {spec.methodology.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Limitations — read before citing</h2>
        <ul className="list-disc space-y-2 pl-5 text-gray-700 leading-relaxed">
          {spec.limitations.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="mb-2 text-lg font-bold text-gray-900">Case boundary statement</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          This dataset is a single-case observation of the BookConv website and is provided as-is,
          without warranty. It is a case fact, not a general rule, and does not constitute a
          guarantee of results for any other site.
        </p>
      </section>
    </main>
  )
}
