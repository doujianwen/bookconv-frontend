import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, FileText, Image, Globe, FileCode, FileSpreadsheet } from 'lucide-react'
import { FORMAT_DATA } from '@/data/formats'
import { FORMAT_DISPLAY_NAMES } from '@/lib/conversion-map'

const FORMAT_ICONS: Record<string, any> = {
  epub: Globe,
  pdf: FileText,
  mobi: BookOpen,
  azw3: BookOpen,
  txt: FileCode,
  docx: FileSpreadsheet,
}

export const metadata: Metadata = {
  title: '电子书格式指南',
  description: '了解 EPUB、PDF、MOBI、AZW3、TXT、DOCX 等主流电子书格式的优缺点和适用场景。',
  alternates: {
    canonical: 'https://www.bookconv.com/formats',
    languages: { en: '/formats', es: '/es/formats', 'x-default': '/formats' },
  },
}

export default function FormatsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">电子书格式指南</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
          深入了解各种电子书格式的特点，选择最适合你的格式。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(FORMAT_DATA).map(([slug, data]) => {
          const Icon = FORMAT_ICONS[slug] || BookOpen
          const display = FORMAT_DISPLAY_NAMES[slug] || slug.toUpperCase()
          return (
            <Link
              key={slug}
              href={`/formats/${slug}/`}
              className="group block rounded-xl border border-gray-200 bg-white p-6 transition-colors hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon className="h-8 w-8 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">{display}</h2>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">{data.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600">
                了解更多
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}