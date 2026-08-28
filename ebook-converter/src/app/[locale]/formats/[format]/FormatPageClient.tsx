'use client'
import Link from 'next/link'
import { BookOpen, CheckCircle, CheckSquare, XCircle, ArrowRight } from 'lucide-react'
import type { FormatInfo } from '@/data/formats'

interface FormatPageClientProps {
  format: string
  data: FormatInfo
}

export function FormatPageClient({ format, data }: FormatPageClientProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            name: `${data.name} 电子书格式指南`,
            description: data.description,
            url: "https://www.bookconv.com/formats/" + format,
          }),
        }}
      />

      <main className="mx-auto max-w-5xl px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{data.name}</span>
        </div>

        {/* Format Header */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            {data.name} 电子书格式指南
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            {data.description}
          </p>
        </section>

        {/* Pros & Cons */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pros */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">优点</h2>
            </div>
            <ul className="space-y-2">
              {data.pros.map((pro, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                  <CheckSquare className="h-3 w-3 text-green-500" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900">缺点</h2>
            </div>
            <ul className="space-y-2">
              {data.cons.map((con, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-red-400" />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">适用场景</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.useCases.map((useCase, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <BookOpen className="mb-2 h-6 w-6 text-blue-600 mx-auto" />
                <p className="text-sm text-gray-700 font-medium">{useCase}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended Converters */}
        <section className="mb-12 rounded-xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/formats" className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">推荐转换器</h2>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            将 {data.name} 转换为其他格式：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.recommendedConverters.map((rec, i) => (
              <Link
                key={i}
                href={rec.href}
                className="group block rounded-lg border bg-white px-4 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">{rec.label}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          这是 BookConv 格式指南系列的一部分。
          <Link href="/formats/epub" className="text-blue-600 hover:underline">查看全部支持格式</Link>。
        </div>
      </main>
    </>
  )
}
