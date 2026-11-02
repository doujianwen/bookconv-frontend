import type { Metadata } from 'next'
import Link from 'next/link'
import { buildAlternates } from '@/lib/seo/alternates'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const alternates = buildAlternates({ locale, slugPath: '/privacy', pageType: 'leaf', hasEsVersion: true })
  return { title: locale === 'es' ? 'Política de privacidad' : 'Privacy Policy', description: locale === 'es' ? 'Cómo BookConv procesa archivos, utiliza servicios de terceros y gestiona cookies y datos operativos.' : 'How BookConv processes files, uses third-party services, and handles cookies and operational data.', alternates, openGraph: { url: alternates.canonical, locale: locale === 'es' ? 'es_ES' : 'en_US', type: 'website' } }
}
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'
  const sections = es ? [
    ['Tratamiento de archivos y eliminación de datos', 'Los archivos se transfieren por HTTPS y se procesan en servidores. Algunas conversiones utilizan servicios de terceros, incluido CloudConvert. Las subidas directas utilizan almacenamiento temporal de objetos; los resultados convertidos pueden guardarse en caché para atender de nuevo una conversión idéntica.'],
    ['Recopilación de datos', 'Procesamos el contenido subido y datos operativos para ofrecer las conversiones. Una ruta que utiliza un servicio de conversión de terceros envía el archivo a ese proveedor. Consulta la política de privacidad de CloudConvert para conocer sus prácticas de tratamiento.'],
    ['Cookies', 'El sitio utiliza cookies para la preferencia de idioma y las sesiones, y puede utilizar analítica para comprender el uso del sitio.'],
    ['Contacto', 'Si tienes preguntas sobre esta política, escríbenos a privacy@bookconv.com.'],
  ] : [
    ['File Handling & Data Deletion', 'Files are transferred over HTTPS and processed on servers. Some conversions use third-party processing, including CloudConvert. Direct uploads use temporary object storage; converted outputs may be cached to serve an identical conversion again.'],
    ['Data Collection', 'We process uploaded content and operational data to provide conversions. A route using a third-party conversion service sends the file to that processor. See CloudConvert’s privacy policy for its handling practices.'],
    ['Cookies', 'The site uses cookies for language preference and sessions and may use analytics to understand site usage.'],
    ['Contact', 'If you have questions about this policy, please contact us at privacy@bookconv.com.'],
  ]
  return <main className="mx-auto max-w-3xl px-4 py-16"><nav aria-label={es ? 'Ruta de navegación' : 'Breadcrumb'}><Link href={es ? '/es' : '/'}>{es ? 'Inicio' : 'Home'}</Link></nav><h1 className="my-8 text-4xl font-bold">{es ? 'Política de privacidad' : 'Privacy Policy'}</h1><div className="space-y-6">{sections.map(([title,body]) => <section key={title}><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-3">{body}</p></section>)}</div></main>
}
