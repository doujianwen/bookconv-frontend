import type { Metadata } from 'next'
import Link from 'next/link'
import { buildAlternates } from '@/lib/seo/alternates'

const copy = {
  en: {
    title: 'BookConv File Security & Privacy: Before You Upload',
    description: 'Learn how BookConv processes ebook files on servers, when CloudConvert is involved, why deletion timing varies, and what to consider before uploading.',
    heading: 'BookConv File Security & Privacy',
    home: 'Home', label: 'File Security', updated: 'Updated November 5, 2026',
    intro: 'BookConv processes uploaded ebook files on servers. Some conversion routes send files to CloudConvert, a third-party conversion service. Converted results may also be cached for an identical conversion request.',
    note: 'Before uploading a confidential document, check whether you have permission to send it to an online service. A local conversion workflow may be more appropriate.',
    sections: [
      ['Does BookConv upload my file?', 'Yes. BookConv is a server-based converter. Depending on the conversion route, processing can involve temporary file storage, BookConv’s server-side tools, or CloudConvert. A file sent to CloudConvert is handled by that provider as well as by BookConv.'],
      ['Does HTTPS mean my file stays on my device?', 'No. HTTPS protects files in transit. It does not make BookConv an offline converter, prevent server-side processing, or establish how long a stored copy is kept.'],
      ['Does BookConv delete every copy immediately?', 'BookConv does not guarantee deletion of every copy immediately after conversion. Uploads, converted results, cached results, and third-party copies can have different retention schedules. An expired download link or cache entry does not, by itself, prove that all stored copies have been deleted.'],
      ['Do CloudConvert’s deletion terms cover BookConv’s copies?', 'No. CloudConvert’s retention terms apply to copies held by CloudConvert. They do not establish how long BookConv’s uploads or cached results are stored. Read the policies of BookConv and the relevant provider separately.'],
      ['Is file content the same as website activity data?', 'No. File contents and website activity data are separate categories. Deleting a document does not necessarily remove operational logs, account records, or analytics data. Our Privacy Policy also covers website data and cookies.'],
    ],
    sensitive: 'What should I consider before uploading a sensitive ebook?',
    sensitiveIntro: 'An unpublished manuscript, research document, or internal report may include personal details, confidential material, or information belonging to other people. Before uploading:',
    steps: ['Check that you have permission to upload the document to an online service.', 'Check any confidentiality requirements or workplace rules that apply.', 'If uploading is inappropriate, choose a local workflow and verify whether it uses cloud features.'],
    backup: 'Keep a backup of the original and test a copy when trying an unfamiliar conversion workflow.',
    questions: 'Questions about file handling?',
    contact: 'Use the contact details in our Privacy Policy. Describe your question without attaching a confidential document. If you need clarification about processing or retention, wait for that clarification before uploading.',
    policy: 'BookConv Privacy Policy', provider: 'CloudConvert Privacy Policy', about: 'About BookConv',
  },
  es: {
    title: 'Seguridad y privacidad de archivos en BookConv',
    description: 'Conoce cómo BookConv procesa ebooks en servidores, cuándo utiliza CloudConvert y qué debes comprobar antes de subir documentos confidenciales.',
    heading: 'Seguridad y privacidad de archivos en BookConv',
    home: 'Inicio', label: 'Seguridad de archivos', updated: 'Actualizado el 5 de noviembre de 2026',
    intro: 'BookConv procesa los ebooks subidos en servidores. Algunas rutas de conversión envían archivos a CloudConvert, un servicio de conversión externo. Los resultados también pueden guardarse en caché para atender una solicitud de conversión idéntica.',
    note: 'Antes de subir un documento confidencial, comprueba si tienes permiso para enviarlo a un servicio online. Un proceso de conversión local puede ser más adecuado.',
    sections: [
      ['¿BookConv sube mi archivo a un servidor?', 'Sí. BookConv es un conversor que funciona en servidores. Según la ruta, el proceso puede incluir almacenamiento temporal, herramientas de conversión de BookConv o CloudConvert. Los archivos enviados a CloudConvert son tratados por ese proveedor, además del tratamiento que realiza BookConv.'],
      ['¿HTTPS significa que mi archivo permanece en mi dispositivo?', 'No. HTTPS protege los archivos durante la transmisión. No convierte BookConv en una herramienta sin conexión, no impide el procesamiento en servidores ni establece cuánto tiempo se conserva una copia.'],
      ['¿BookConv elimina todas las copias inmediatamente?', 'BookConv no garantiza la eliminación de todas las copias inmediatamente después de la conversión. Las subidas, los resultados, la caché y las copias de terceros pueden tener plazos distintos. Que un enlace de descarga o una entrada de caché caduque no demuestra por sí solo que se hayan eliminado todas las copias almacenadas.'],
      ['¿Los plazos de eliminación de CloudConvert cubren las copias de BookConv?', 'No. Los plazos de CloudConvert se aplican a las copias que conserva CloudConvert. No establecen cuánto tiempo se conservan las subidas o los resultados en caché de BookConv. Consulta por separado las políticas de BookConv y del proveedor correspondiente.'],
      ['¿El contenido del archivo y los datos de uso del sitio son lo mismo?', 'No. Son categorías diferentes. Eliminar un documento no implica necesariamente eliminar registros operativos, datos de cuenta o datos analíticos. Nuestra política de privacidad también describe los datos del sitio y las cookies.'],
    ],
    sensitive: '¿Qué debo comprobar antes de subir un ebook confidencial?',
    sensitiveIntro: 'Un manuscrito inédito, un documento de investigación o un informe interno pueden contener datos personales, información confidencial o datos de otras personas. Antes de subirlo:',
    steps: ['Comprueba que tienes permiso para subir el documento a un servicio online.', 'Revisa los requisitos de confidencialidad y las normas de tu organización.', 'Si no debes subirlo, elige un proceso local y comprueba si utiliza funciones en la nube.'],
    backup: 'Conserva una copia de seguridad del original y prueba con una copia al utilizar un proceso de conversión desconocido.',
    questions: '¿Tienes preguntas sobre el tratamiento de archivos?',
    contact: 'Utiliza los datos de contacto de nuestra política de privacidad. Describe tu pregunta sin adjuntar documentos confidenciales. Si necesitas aclaraciones sobre el tratamiento o la conservación, espera a recibirlas antes de subir el archivo.',
    policy: 'Política de privacidad de BookConv', provider: 'Política de privacidad de CloudConvert (en inglés)', about: 'Acerca de BookConv (en inglés)',
  },
} as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const text = copy[locale === 'es' ? 'es' : 'en']
  const alternates = buildAlternates({ locale, slugPath: '/file-security', pageType: 'leaf', hasEsVersion: true })
  return {
    title: { absolute: text.title }, description: text.description, alternates,
    openGraph: { title: text.title, description: text.description, url: alternates.canonical, locale: locale === 'es' ? 'es_ES' : 'en_US', type: 'website' },
    twitter: { card: 'summary', title: text.title, description: text.description },
  }
}

export default async function FileSecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'
  const text = copy[es ? 'es' : 'en']
  const prefix = es ? '/es' : ''
  const url = `https://www.bookconv.com${prefix}/file-security`
  const schema = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebPage', '@id': `${url}#page`, url, name: text.heading, description: text.description, inLanguage: es ? 'es' : 'en', dateModified: '2026-11-05', breadcrumb: { '@id': `${url}#breadcrumb` } },
      { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: text.home, item: `https://www.bookconv.com${prefix}` },
        { '@type': 'ListItem', position: 2, name: text.label, item: url },
      ] },
    ],
  }
  return <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <nav aria-label={es ? 'Ruta de navegación' : 'Breadcrumb'} className="mb-8 text-sm text-gray-600">
      <Link href={prefix || '/'} className="underline">{text.home}</Link><span aria-hidden="true"> / </span><span>{text.label}</span>
    </nav>
    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{text.heading}</h1>
    <p className="mt-4 text-sm text-gray-500"><time dateTime="2026-11-05">{text.updated}</time></p>
    <p className="mt-6 text-lg leading-relaxed text-gray-700">{text.intro}</p>
    <aside className="my-8 rounded-xl border border-blue-200 bg-blue-50 p-5 leading-relaxed text-gray-800">{text.note}</aside>
    <div className="space-y-8 leading-relaxed text-gray-700">
      {text.sections.map(([title, body]) => <section key={title}><h2 className="mb-3 text-xl font-semibold text-gray-900">{title}</h2><p>{body}</p></section>)}
      <section><h2 className="mb-3 text-xl font-semibold text-gray-900">{text.sensitive}</h2><p>{text.sensitiveIntro}</p><ul className="my-4 list-disc space-y-2 pl-6">{text.steps.map(step => <li key={step}>{step}</li>)}</ul><p>{text.backup}</p></section>
      <section><h2 className="mb-3 text-xl font-semibold text-gray-900">{text.questions}</h2><p>{text.contact}</p></section>
      <nav aria-label={es ? 'Políticas relacionadas' : 'Related policies'} className="flex flex-col items-start gap-3 border-t pt-6 text-blue-700 underline">
        <Link href={`${prefix}/privacy`}>{text.policy}</Link>
        <a href="https://cloudconvert.com/privacy/">{text.provider}</a>
        <Link href="/about">{text.about}</Link>
      </nav>
    </div>
  </article>
}
