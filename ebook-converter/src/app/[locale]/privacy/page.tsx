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
    ['Conservación y eliminación', 'Los archivos subidos, los resultados y la caché pueden tener plazos distintos. No garantizamos la eliminación inmediata de todas las copias al terminar la conversión o al caducar un enlace. El plazo de CloudConvert solo se aplica a sus propias copias. No publicamos un plazo máximo verificado que cubra todas las copias de todos los proveedores. Si necesitas esa garantía, solicita una aclaración antes de subir el archivo o utiliza un proceso local.'],
    ['Consultas sobre tus datos', 'Puedes utilizar el contacto indicado a continuación para preguntar por el tratamiento o solicitar la eliminación de tus datos. Describe el tipo de solicitud y los datos necesarios para localizarla sin adjuntar documentos confidenciales. Los archivos, registros operativos, datos de cuenta y datos analíticos son categorías diferentes; eliminar un archivo no significa eliminar automáticamente todas las demás categorías.'],
    ['Contacto', 'Si tienes preguntas sobre esta política, escríbenos a privacy@bookconv.com.'],
  ] : [
    ['File Handling & Data Deletion', 'Files are transferred over HTTPS and processed on servers. Some conversions use third-party processing, including CloudConvert. Direct uploads use temporary object storage; converted outputs may be cached to serve an identical conversion again.'],
    ['Data Collection', 'We process uploaded content and operational data to provide conversions. A route using a third-party conversion service sends the file to that processor. See CloudConvert’s privacy policy for its handling practices.'],
    ['Cookies', 'The site uses cookies for language preference and sessions and may use analytics to understand site usage.'],
    ['Retention and deletion', 'Uploads, results and cached outputs can follow different retention schedules. We do not guarantee immediate deletion of every copy when a conversion finishes or a download link expires. CloudConvert’s retention terms apply only to its own copies. We do not publish a verified maximum retention period covering every copy across all providers. If you require that assurance, ask for clarification before uploading or use a local workflow.'],
    ['Questions about your data', 'Use the contact below to ask about processing or request deletion of your data. Describe the request and the details needed to identify it without attaching confidential documents. Files, operational logs, account records and analytics are different categories; deleting a file does not automatically delete every other category.'],
    ['Contact', 'If you have questions about this policy, please contact us at privacy@bookconv.com.'],
  ]
  return <article className="mx-auto max-w-3xl px-4 py-16">
    <nav aria-label={es ? 'Ruta de navegación' : 'Breadcrumb'}><Link href={es ? '/es' : '/'}>{es ? 'Inicio' : 'Home'}</Link></nav>
    <h1 className="my-8 text-4xl font-bold">{es ? 'Política de privacidad' : 'Privacy Policy'}</h1>
    <p className="mb-6 text-sm text-gray-500"><time dateTime="2026-11-05">{es ? 'Actualizado el 5 de noviembre de 2026' : 'Updated November 5, 2026'}</time></p>
    <p className="mb-8"><Link href={es ? '/es/file-security' : '/file-security'} className="text-blue-700 underline">{es ? 'Guía de seguridad de archivos antes de subirlos' : 'File security: what to know before uploading'}</Link></p>
    <div className="space-y-6 leading-relaxed">{sections.map(([title,body]) => <section key={title}><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-3">{body}</p></section>)}</div>
    <p className="mt-8"><a href="https://cloudconvert.com/privacy/" className="text-blue-700 underline">{es ? 'Política de privacidad de CloudConvert (en inglés)' : 'CloudConvert Privacy Policy'}</a></p>
  </article>
}
