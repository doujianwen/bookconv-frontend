import type { Metadata } from "next"
import Link from "next/link"
import { KEYWORDS } from "@/lib/constants"
import { getConversion, FORMAT_DISPLAY_NAMES } from "@/lib/conversion-map"
import { getSlug } from "@/lib/utils"

interface ConvertIndexProps {
  params: Promise<{ locale: string }>
}

const BASE_URL = "https://www.bookconv.com"

export async function generateMetadata({ params }: ConvertIndexProps): Promise<Metadata> {
  const { locale } = await params
  const title = "All Ebook Format Conversions | BookConv"
  const description =
    "Browse every ebook format conversion BookConv supports — EPUB, AZW3, MOBI, PDF, and more. Pick a pair and convert free in your browser, no install."
  const url = `${BASE_URL}/convert`
  return {
    title,
    description,
    keywords: ["ebook converter", "convert ebook", "epub", "azw3", "mobi", "pdf", "calibre", "free"],
    alternates: {
      canonical: url,
      languages: { en: "/convert", es: "/es/convert" },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "BookConv",
      locale: locale === "es" ? "es_ES" : "en_US",
    },
    twitter: { card: "summary_large_image", title, description },
  }
}

function formatLabel(format: string): string {
  return FORMAT_DISPLAY_NAMES[format.toLowerCase()] || format.toUpperCase()
}

export default async function ConvertIndexPage() {
  const items = KEYWORDS.map((k) => {
    const slug = getSlug(k.source, k.target)
    const conversion = getConversion(k.source, k.target)
    return {
      slug,
      source: k.source,
      target: k.target,
      label: `${formatLabel(k.source)} to ${formatLabel(k.target)}`,
      description: conversion?.description,
    }
  })

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Supported ebook format conversions",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/convert/${item.slug}`,
      name: `Convert ${item.label}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="mx-auto max-w-5xl px-4 py-16">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li aria-current="page" className="font-medium text-gray-900">Converters</li>
          </ol>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">All Ebook Conversions</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Every format pair BookConv can handle, in one place. Pick a source and target, then convert free in your
            browser — no account, no installer, Calibre running server-side.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/convert/${item.slug}`}
              className="group block rounded-xl border bg-white p-5 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-600">
                {item.label}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Convert {item.source.toUpperCase()} to {item.target.toUpperCase()}
              </p>
              {item.description && (
                <p className="mt-2 text-xs text-gray-400 leading-relaxed">{item.description}</p>
              )}
            </Link>
          ))}
        </section>

        <div className="mt-12 pt-6 border-t">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
            Back to home
          </Link>
        </div>
      </main>
    </>
  )
}
