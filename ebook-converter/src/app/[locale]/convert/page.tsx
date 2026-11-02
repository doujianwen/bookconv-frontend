import type { Metadata } from "next"
import Link from "next/link"
import { CONTENT_MAP } from '@/data/content'
import { unsupportedConversionInfo } from '@/lib/unsupported-conversions'
import { ESP_CONVERT_SLUGS } from '@/lib/es-routes'
import { KEYWORDS } from "@/lib/constants"
import { getConversion, FORMAT_DISPLAY_NAMES } from "@/lib/conversion-map"
import { getSlug } from "@/lib/utils"
import { buildAlternates } from "@/lib/seo/alternates"
import { clampMetaDescription } from "@/lib/seo/meta-description"
import { esConvertHref } from "@/lib/es-routes"
import { chrome } from "@/lib/ui-chrome"

interface ConvertIndexProps {
  params: Promise<{ locale: string }>
}

const BASE_URL = "https://www.bookconv.com"

export async function generateMetadata({ params }: ConvertIndexProps): Promise<Metadata> {
  const { locale } = await params
  const title = locale === 'es' ? 'Herramientas de conversión de libros electrónicos' : 'All Ebook Format Conversions'
  const description = locale === 'es' ? 'Elige una herramienta de conversión en español. Comprueba formatos compatibles, límites de subida y calidad antes de sustituir el original.' :
    "Browse every ebook format conversion BookConv supports — EPUB, AZW3, MOBI, PDF, and more. Pick a pair and convert free in your browser, no install."
  const { canonical, languages } = buildAlternates({
    locale,
    slugPath: '/convert',
    pageType: 'list',
  })
  return {
    title,
    description,
    keywords: ["ebook converter", "convert ebook", "epub", "azw3", "mobi", "pdf", "calibre", "free"],
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      siteName: "BookConv",
      locale: locale === 'es' ? 'es_ES' : 'en_US',
    },
    twitter: { card: "summary_large_image", title, description },
  }
}

function formatLabel(format: string): string {
  return FORMAT_DISPLAY_NAMES[format.toLowerCase()] || format.toUpperCase()
}

// M5-6：西语 chrome 本地化。/es/convert（索引）当前不在 middleware P3-C 白名单
// （只放行 3 个白名单 convert 详情页）⇒ isEs 分支为路由开放后即生效的正确实现；
// 卡片链接按 esConvertHref 白名单判定（白名单内 /es/convert/*，其余回退英文路由）。
// 英文页（/convert）行为与文案逐字不变。
export default async function ConvertIndexPage({ params }: ConvertIndexProps) {
  const { locale } = await params
  const isEs = locale === 'es'
  // Only link to pairs that are actually supported by CONVERSION_MAP.
  // Filtering out "planned" KEYWORDS pairs (epub-to-zip, epub-to-lrf, pdf-to-docx, …)
  // prevents internal links to 404 pages and stops Google from rediscovering them.
  const items = KEYWORDS
    .filter((k) => getConversion(k.source, k.target) && CONTENT_MAP[getSlug(k.source, k.target)] && !unsupportedConversionInfo(k.source, k.target))
    .map((k) => {
      const slug = getSlug(k.source, k.target)
      const conversion = getConversion(k.source, k.target)
      return {
        slug,
        source: k.source,
        target: k.target,
        label: `${formatLabel(k.source)} to ${formatLabel(k.target)}`,
        description: clampMetaDescription(conversion?.description),
      }
    })

  const localizedItems = isEs ? ESP_CONVERT_SLUGS.filter(slug => {
    const [source, target] = slug.split('-to-')
    return CONTENT_MAP[slug]?.es && getConversion(source, target) && !unsupportedConversionInfo(source, target)
  }).map(slug => {
    const [source, target] = slug.split('-to-')
    return { slug, source, target, label: CONTENT_MAP[slug].es?.title || `${source.toUpperCase()} a ${target.toUpperCase()}`, description: CONTENT_MAP[slug].es?.metaDescription || '' }
  }) : items
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isEs ? 'Herramientas de conversión en español' : 'Supported ebook format conversions',
    inLanguage: isEs ? 'es' : 'en',
    itemListElement: localizedItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}${isEs ? '/es' : ''}/convert/${item.slug}`,
      name: isEs ? item.label : `Convert ${item.label}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="mx-auto max-w-5xl px-4 py-16">
        <nav aria-label={chrome('breadcrumbLabel', isEs)} className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href={isEs ? '/es' : '/'} className="hover:text-blue-600">{chrome('home', isEs)}</Link></li>
            <li>/</li>
            <li aria-current="page" className="font-medium text-gray-900">{chrome('converters', isEs)}</li>
          </ol>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{chrome('allConversions', isEs)}</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            {isEs
              ? 'Estas herramientas tienen instrucciones en español. Elige un par compatible y revisa sus limitaciones. Los archivos se procesan en servidores; no necesitas una cuenta para convertir un archivo.'
              : 'Every format pair BookConv can handle, in one place. Pick a source and target, then convert free in your browser — no account, no installer, server-side processing.'}
          </p>
          <p className="mt-4 max-w-2xl text-base text-gray-600">
            {isEs
              ? 'Elige un par de formatos compatible. El método y la fidelidad varían; las rutas de solo texto no conservan imágenes ni estilos.'
              : 'Choose a supported format pair below. Conversion methods and output fidelity vary; text-only routes do not preserve images or styling.'}
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {localizedItems.map((item) => (
            <Link
              key={item.slug}
              href={isEs ? esConvertHref(item.slug) : `/convert/${item.slug}`}
              className="group block rounded-xl border bg-white p-5 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-600">
                {item.label}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {isEs ? `Convertir ${item.source.toUpperCase()} a ${item.target.toUpperCase()}` : `Convert ${item.source.toUpperCase()} to ${item.target.toUpperCase()}`}
              </p>
              {item.description && (
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">{item.description}</p>
              )}
            </Link>
          ))}
        </section>

        {isEs && <aside className="mt-8 rounded border p-5"><h2 className="font-semibold">Otros formatos y limitaciones</h2><p className="mt-2">BookConv no exporta DOC antiguo. Consulta la <Link href="/es/convert/epub-to-doc" className="underline">explicación de EPUB a DOC</Link>. Para herramientas sin instrucciones en español, visita el <Link href="/convert" className="underline">directorio completo (en inglés)</Link>.</p></aside>}
        <div className="mt-12 pt-6 border-t">
          <Link href={isEs ? '/es' : '/'} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
            {chrome('backToHome', isEs)}
          </Link>
        </div>
      </main>
    </>
  )
}
