import type { Metadata } from "next"
import Link from "next/link"
import { getAllGuides } from "@/data/guides"
import { buildAlternates } from "@/lib/seo/alternates"

export function generateMetadata(): Metadata {
  const { canonical, languages } = buildAlternates({
    locale: 'en',
    slugPath: '/guide',
    pageType: 'list',
  })
  return {
    title: "Guides",
    description: "Troubleshooting and how-to guides for ebook format conversion: fix broken layouts, keep images, and choose the right tool for the job.",
    alternates: { canonical, languages },
    openGraph: {
      title: "Guides | BookConv",
      description: "Practical fixes and how-tos for ebook conversion problems.",
      url: canonical,
      siteName: "BookConv",
      type: "website",
    },
  }
}

export default function GuidesIndex() {
  const guides = getAllGuides()
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">Guides</h1>
        <p className="text-lg text-gray-600">Practical fixes and how-tos for the ebook conversion problems people actually hit.</p>
      </header>
      <div className="grid gap-4">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guide/${g.slug}`} className="group block rounded-xl border bg-white p-6 transition-colors hover:border-blue-300 hover:bg-blue-50">
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">{g.title}</h2>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{g.problem}</p>
          </Link>
        ))}
      </div>
      <div className="mt-12 pt-6 border-t">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">Read the blog →</Link>
      </div>
    </main>
  )
}
