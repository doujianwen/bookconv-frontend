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
  const title = "${display} 电子书格式介绍 | BookConv"
  const description = "${display} 是一种流行的电子书格式。了解它的优缺点、适用场景，以及如何与其他格式互转。"
  return {
    title,
    description,
    alternates: { canonical: "https://www.bookconv.com/formats/${format}" },
    openGraph: {
      title,
      description,
      type: 'article',
      url: "https://www.bookconv.com/formats/${format}",
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
        <h1 className="text-2xl font-bold text-gray-900">格式未找到</h1>
        <p className="mt-2 text-gray-500">当前不支持该格式的科普页面。</p>
        <Link href="/formats/epub" className="mt-4 inline-block text-blue-600 hover:underline">
          ← 查看所有支持格式
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
