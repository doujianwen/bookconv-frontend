import type { Metadata } from 'next'
import Link from 'next/link'
import { getFormatData, SUPPORTED_FORMAT_SLUGS } from '@/data/formats'
import { FORMAT_DISPLAY_NAMES } from '@/lib/conversion-map'
import { buildAlternates } from '@/lib/seo/alternates'
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
  params: Promise<{ locale: string; format: string }>
}

export function generateStaticParams() {
  return SUPPORTED_FORMAT_SLUGS.map((format) => ({ format }))
}

export async function generateMetadata({ params }: FormatPageProps): Promise<Metadata> {
  const { format, locale = 'en' } = await params
  const data = getFormatData(format)
  if (!data) {
    return { title: 'Format Not Found' }
  }
  const display = FORMAT_DISPLAY_NAMES[format] || format.toUpperCase()
  const title = `${display} Format Guide: Pros, Cons & Use Cases`
  const description = `${display} is a widely used ebook format. Learn its strengths and weaknesses, best use cases, and how to convert it to and from other formats.`
  // M5-1 修复（2026-10-03）：此前手写 languages 硬编码了 /es/formats/* 回指，
  // 但 middleware P3-C 对 /es/formats/* 一律 404 → es 回指全部指向死页。
  // 回归 buildAlternates 单一权威点：formats 无 es 版本 → 只输出 en + x-default。
  const alternates = buildAlternates({
    locale,
    slugPath: `/formats/${format}`,
    pageType: 'leaf',
    hasEsVersion: false,
  })
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.bookconv.com/formats/${format}`,
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
        <p className="mt-2 text-gray-500">We don&apos;t have a guide page for this format yet.</p>
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
