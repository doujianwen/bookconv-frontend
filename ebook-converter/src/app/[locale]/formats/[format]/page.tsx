import type { Metadata } from 'next'
import Link from 'next/link'
import { getFormatData, SUPPORTED_FORMAT_SLUGS } from '@/data/formats'
import { FORMAT_DISPLAY_NAMES } from '@/lib/conversion-map'
import dynamic from 'next/dynamic'


const FormatPageClientDynamic = dynamic(
  () => import('./FormatPageClient').then((mod) => ({ default: mod.FormatPageClient })),
  { loading: () => (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-gray-500">Loading format info...</p>
    </div>
  )},
)

interface FormatPageProps {
  params: Promise<{ format: string }>
}

export function generateStaticParams() {
  return SUPPORTED_FORMAT_SLUGS.map((format) => ({ format }))
}

export async function generateMetadata({ params }: FormatPageProps): Promise<Metadata> {
  const { format } = await params
  const data = getFormatData(format)
  if (!data) {
    return { title: 'Format Not Found' }
  }
  const display = FORMAT_DISPLAY_NAMES[format] || format.toUpperCase()
  const title = "${display} Ebook Format Guide | BookConv"
  const description = "${display} is a popular ebook format. Learn about its pros, cons, ideal use cases, and how to convert it to other formats."
  return {
    title,
    description,
    alternates: { canonical: "https://bookconv.com/formats/${format}" },
    openGraph: {
      title,
      description,
      type: 'article',
      url: "https://bookconv.com/formats/${format}",
      siteName: 'BookConv',
    },
  }
}

export default async function FormatPage({ params }: FormatPageProps) {
  const { format } = await params
  const data = getFormatData(format)

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Format Not Found</h1>
        <p className="mt-2 text-gray-500">We don't have a guide page for this format yet.</p>
        <Link href="/formats/epub" className="mt-4 inline-block text-blue-600 hover:underline">
          ← View all supported formats
        </Link>
      </div>
    )
  }

  return (
    <FormatPageClientDynamic
      format={format}
      data={data}
    />
  )
}
