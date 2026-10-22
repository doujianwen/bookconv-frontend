import type { Metadata } from "next"
import Link from "next/link"
import { getAllGuides } from "@/data/guides"
import { buildAlternates } from "@/lib/seo/alternates"
import { clampMetaDescription } from "@/lib/seo/meta-description"
import { esGuideHref } from "@/lib/es-routes"
import { chrome } from "@/lib/ui-chrome"

interface GuidesIndexProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: GuidesIndexProps): Promise<Metadata> {
  const { locale } = await params
  const isEs = locale === 'es'
  const { canonical, languages } = buildAlternates({
    locale,
    slugPath: '/guide',
    pageType: 'list',
  })
  return {
    title: chrome('allGuidesTitle', isEs),
    description: clampMetaDescription(
      isEs
        ? 'Guías prácticas y tutoriales para los problemas reales de conversión de ebooks: arregla maquetaciones rotas, conserva imágenes y elige la herramienta adecuada.'
        : 'Troubleshooting and how-to guides for ebook format conversion: fix broken layouts, keep images, and choose the right tool for the job.',
    ),
    alternates: { canonical, languages },
    openGraph: {
      title: isEs ? 'Guías | BookConv' : 'Guides | BookConv',
      description: isEs
        ? 'Soluciones prácticas y tutoriales para problemas de conversión de ebooks.'
        : 'Practical fixes and how-tos for ebook conversion problems.',
      url: canonical,
      siteName: 'BookConv',
      type: 'website',
    },
  }
}

// M5-6：西语 chrome 本地化。注意 /es/guide（索引）当前不在 middleware P3-C
// 白名单（只放行白名单 slug 详情页）⇒ isEs 分支为「路由开放后即生效」的
// 正确实现，今天直访 /es/guide 仍 404（既有路由约束，非本页引入）。
// 英文页（/guide，经内部 rewrite 以 locale='en' 渲染）行为与文案逐字不变。
export default async function GuidesIndex({ params }: GuidesIndexProps) {
  const { locale } = await params
  const isEs = locale === 'es'
  const guides = getAllGuides()
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">{chrome('allGuidesTitle', isEs)}</h1>
        <p className="text-lg text-gray-600">{chrome('guidesIndexLead', isEs)}</p>
      </header>
      <div className="grid gap-4">
        {guides.map((g) => (
          <Link key={g.slug} href={isEs ? esGuideHref(g.slug) : `/guide/${g.slug}`} className="group block rounded-xl border bg-white p-6 transition-colors hover:border-blue-300 hover:bg-blue-50">
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">{g.title}</h2>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{g.problem}</p>
          </Link>
        ))}
      </div>
      <div className="mt-12 pt-6 border-t">
        {/* /es/blog 索引路由同样未开放 ⇒ 西语分支也回退英文 /blog（禁裸 /es 前缀） */}
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">{chrome('readTheBlog', isEs)}</Link>
      </div>
    </main>
  )
}
