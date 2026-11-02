import type { Metadata } from 'next'
import Link from 'next/link'
import HomePageClient from './HomePageClient'
import { CONTENT_MAP } from '@/data/content'
import { ESP_CONVERT_SLUGS } from '@/lib/es-routes'
import { getConversion } from '@/lib/conversion-map'
import { unsupportedConversionInfo } from '@/lib/unsupported-conversions'
import { buildAlternates } from '@/lib/seo/alternates'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const alternates = buildAlternates({ locale, slugPath: '/', pageType: 'home' })
  return locale === 'es' ? {
    title: 'Convertidor de libros electrónicos online',
    description: 'Convierte libros electrónicos con BookConv. Consulta las herramientas en español, los límites de subida y las comprobaciones de calidad.',
    alternates,
    openGraph: { title: 'Convertidor de libros electrónicos online', description: 'Herramientas y guías de BookConv en español.', url: alternates.canonical, locale: 'es_ES', type: 'website' },
  } : { alternates }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'es') return <HomePageClient />
  const slugs = ESP_CONVERT_SLUGS.filter(slug => {
    const [source, target] = slug.split('-to-')
    return CONTENT_MAP[slug]?.es && getConversion(source, target) && !unsupportedConversionInfo(source, target)
  })
  const faq = [
    ['¿Qué formatos puedo convertir?', 'Elige una herramienta compatible de la lista. La disponibilidad depende del par de formatos; BookConv no convierte EPUB a DOC antiguo.'],
    ['¿Cuál es el tamaño máximo?', 'Consulta el formulario. La subida directa de un archivo admite hasta 100 MB cuando está habilitada; la subida alternativa y cada archivo de un lote admiten 4 MB. Un archivo puede fallar aun dentro del límite.'],
    ['¿Se conserva la maquetación?', 'No se garantiza. La fidelidad depende del formato y del método utilizado; algunas rutas extraen solo texto. Compara el resultado con el original.'],
    ['¿Es gratuito?', 'La conversión por lotes es gratuita durante la beta pública. Pro está previsto para después de la beta. No necesitas una cuenta para convertir un archivo.'],
    ['¿Se elimina DRM o se reconoce texto escaneado?', 'BookConv no elimina DRM y no incluye OCR. Utiliza archivos que tengas derecho a convertir.'],
  ]
  return <main className="mx-auto max-w-5xl px-4 py-16">
    <h1 className="text-4xl font-bold">Convertidor de libros electrónicos online</h1>
    <p className="mt-5 text-lg">Convierte un libro a otro formato y comprueba el resultado antes de compartirlo. Consulta las limitaciones de cada herramienta y conserva el archivo original.</p>
    <h2 className="mt-10 text-2xl font-semibold">Herramientas en español</h2>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">{slugs.map(slug => <Link key={slug} href={`/es/convert/${slug}`} className="rounded-xl border p-5 text-blue-700">{CONTENT_MAP[slug].es?.title}</Link>)}</div>
    <p className="mt-5"><Link href="/es/convert" className="text-blue-700 underline">Ver el directorio de conversiones</Link></p>
    <h2 className="mt-10 text-2xl font-semibold">Cómo utilizar BookConv</h2>
    <ol className="mt-4 list-decimal space-y-3 pl-6"><li>Elige el formato de origen y el de destino.</li><li>Sube el archivo desde la herramienta y respeta el límite indicado.</li><li>Descarga el resultado y revisa texto, caracteres, orden e imágenes.</li></ol>
    <p className="mt-6">Los archivos se transfieren por HTTPS y se procesan en servidores. Algunas conversiones utilizan servicios de terceros. Consulta la <Link href="/es/privacy" className="text-blue-700 underline">política de privacidad</Link>.</p>
    <p className="mt-5"><Link href="/es/blog" className="text-blue-700 underline">Leer guías y comparaciones en español</Link></p>
    <h2 className="mt-10 text-2xl font-semibold">Preguntas frecuentes</h2>
    {faq.map(([q,a]) => <details key={q} className="mt-4 rounded border p-4"><summary className="font-semibold">{q}</summary><p className="mt-3">{a}</p></details>)}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: 'es', mainEntity: faq.map(([q,a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }) }} />
  </main>
}
