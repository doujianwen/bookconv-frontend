import { BlogFaq } from '../blog/types'

export const slug = 'kindle-formats'
export const title = 'What Format Does Kindle Use? AZW3, KFX, MOBI & EPUB Explained'
export const metaTitle = 'What Format Does Kindle Use? AZW3, KFX, MOBI'
export const problem = 'AZW3, KFX, MOBI, EPUB - Kindle formats confuse everyone. This guide explains what each means, the safest format to convert to today, and how BookConv converts free in your browser with no software to install.'
export const date = '2026-08-07'
export const updatedAt = '2026-10-21'
export const tags = ['kindle formats', 'what format does kindle use', 'azw3', 'kfx', 'mobi', 'send to kindle', 'epub vs kindle']
export const keyTakeaways = [
  'Amazon’s Send to Kindle accepts EPUB and AZW3 and converts them for your device.',
  'MOBI side-loading is retired; don’t convert new books to MOBI for Kindle.',
  'KFX is Amazon’s proprietary format — you can’t easily create it yourself.',
  'For sideloading, AZW3 is the most compatible format BookConv can produce.',
]
export const formats = { source: 'epub', target: 'azw3' }
export const content = {
  intro: 'Kindle readers don’t take “any ebook.” Over the years Amazon moved from MOBI to AZW3 and now to KFX, while Send to Kindle added EPUB support. This page untangles the formats so you convert to the right one instead of a file your Kindle rejects.\n\n> BookConv processes your file on our servers and automatically deletes it within 1 hour. Files are encrypted in transit, and no account or software install is required.',
  sections: [
    {
      heading: 'The Kindle format landscape',
      body: `**MOBI:** the old standard. Amazon retired MOBI side-loading, so new uploads in MOBI are no longer the recommended path.\n\n**AZW3:** Amazon’s modern ebook format with better typography and features; widely supported by Kindle devices.\n\n**KFX:** Amazon’s current proprietary format with advanced layout; created by Amazon’s own pipeline, not easily produced by third-party converters.\n\n**EPUB:** the open standard. Send to Kindle now accepts EPUB and converts it for your device.`,
    },
    {
      heading: 'Kindle format comparison table',
      body: `| Format | Sideload support | Modern features | Third-party readable | BookConv can produce |
|---|---|---|---|---|
| AZW3 | Yes (all Kindles) | Yes (CSS, fonts, tables) | No (Kindle only) | Yes |
| KFX | No (Amazon only) | Yes (advanced layout) | No | No |
| MOBI | Yes (legacy USB) | No | Partial | Yes (to EPUB or AZW3) |
| EPUB | Via Send to Kindle | Yes (open standard) | Yes (most readers) | Source format |

For sideloading your own file, AZW3 is the most compatible format BookConv can produce. KFX is Amazon-only, so convert to AZW3 instead.`
    },
    {
      heading: 'What Is AZW3?',
      body: `AZW3 is Amazon is **KF8** format, introduced in 2011 to replace the original AZW — a thin wrapper around the old Mobipocket engine. Under the hood it is HTML and CSS packaged much like EPUB, but sealed inside the company-owned own container, which is why only Kindle hardware and apps read it.

What that buys you over the older MOBI/AZW1 lineage:
- Embedded fonts and real CSS, so typography survives the trip
- Tables, drop caps, and fixed-layout pages for illustrated titles
- Better spacing and margin control than Mobipocket ever allowed

It is **not** an open format, so Kobo, Nook, and most third-party readers ignore it. Think of AZW3 as the best format *inside Amazon is walled garden*, and EPUB as the one that travels everywhere else.

Moving in or out is simple: [EPUB to AZW3](/convert/epub-to-azw3) for a modern Kindle, or [AZW to MOBI](/convert/azw-to-mobi) if a legacy device cannot read AZW3.`,
    },
    {
      heading: 'What to convert to (practical rule)',
      body: `**For sideloading a file yourself:** convert to **AZW3** — BookConv can produce it and Kindles read it well.\n\n**For Send to Kindle:** upload **EPUB or AZW3** and let Amazon convert.\n\n**Avoid:** converting new books to MOBI, and trying to generate KFX yourself.`,
    },
    {
      heading: 'Common Kindle conversion paths',
      body: `**EPUB → AZW3** for sideloading: [EPUB to AZW3](/convert/epub-to-azw3).\n\n**AZW3 → PDF** if you need a fixed-layout printout: [AZW3 to PDF](/convert/azw3-to-pdf).\n\n**MOBI → EPUB/AZW3** to modernize an old library: [Mobi to EPUB](/convert/mobi-to-epub).

**AZW → MOBI** only if a legacy Kindle cannot read AZW3: [AZW to MOBI](/convert/azw-to-mobi).`,
    },
    {
      heading: 'Why not just use MOBI?',
      body: `MOBI is legacy. Amazon's Send to Kindle no longer prioritizes it, and newer features only exist in AZW3/KFX. Converting new content to MOBI risks a file your device handles poorly.\n\nIf you already own MOBI files, convert them forward to AZW3 rather than keeping the old format.\n\nOne important detail: MOBI files from the pre-2011 era often contain proprietary DRM and encoding that modern tools struggle with. Even if they open, typography and layout may look broken on newer Kindles. This is another reason to migrate your library to AZW3 or EPUB as your first priority.`,
    },
    {
      heading: 'What is KFX and why you cannot create it',
      body: `KFX is Amazon's newest proprietary format, introduced around 2017 as the successor to AZW3 for Store purchases. It uses advanced typesetting features including better typography, image handling, and layout control that go beyond what AZW3 offers.\n\nThe critical limitation: **KFX is generated exclusively by Amazon's own conversion pipeline**. When you purchase a book from the Kindle Store, Amazon creates the KFX version server-side. Third-party converters like BookConv cannot produce true KFX files.\n\nWhat this means for you:\n- You cannot sideload KFX to your Kindle via USB\n- If a third-party tool claims to produce KFX, it is likely producing an AZW3 file with a renamed extension\n- For sideloading, **AZW3 remains your best option** — it has nearly all the visual features of KFX\n\nKFX is not a format you need to worry about as a user. It is Amazon's internal delivery format for purchased books. Your job is to ensure your sideloaded files are AZW3 or that you use Send to Kindle for EPUB uploads.`,
    },
    {
      heading: 'Kindle device compatibility matrix',
      body: `Not all Kindles support all formats equally. Here is the definitive compatibility table:\n\n| Kindle Model | AZW3 | KFX | MOBI | EPUB (Send to Kindle) |\n|---|---|---|---|---|\n| Kindle (1st–4th gen) | ❌ | ❌ | ✅ | ❌ |\n| Kindle Touch | ❌ | ❌ | ✅ | ❌ |\n| Kindle Paperwhite 1st gen | ❌ | ❌ | ✅ | ❌ |\n| Kindle Paperwhite 2nd–4th gen | ✅ | ✅ | ✅ | ✅ |\n| Kindle Voyage | ✅ | ✅ | ✅ | ✅ |\n| Kindle Oasis (all gens) | ✅ | ✅ | ✅ | ✅ |\n| Kindle Scribe | ✅ | ✅ | ✅ | ✅ |\n| Kindle Fire tablets | ✅ | ✅ | ✅ | ✅ |\n| Kindle Kids (2019+) | ✅ | ✅ | ✅ | ✅ |\n\n**Key takeaway:** Every Kindle released after 2015 supports AZW3. If you have a Kindle from before 2015, stick with MOBI or consider upgrading your device. For the most complete model-by-model breakdown, see our can-Kindle-read-AZW3 guide.`,
    },
    {
      heading: 'Rendering engine comparison: how formats actually work',
      body: `Understanding the rendering engine behind each format helps you predict what will and will not work:\n\n**Mobipocket Engine (MOBI/AZW):** The original Kindle engine. Supports basic text flow and simple images. No CSS, no embedded fonts, limited layout control. This is why MOBI files look plain and cannot carry rich typography.\n\n**KF8 Engine (AZW3):** Amazon's second-generation engine. Full CSS support, embedded fonts, table support, drop caps, and better image handling. AZW3 files render much more closely to their intended design. This is the engine used by most Kindles released after 2011.\n\n**KFX Engine:** Amazon's current proprietary engine. Extends KF8 with improved image compression, advanced typography features, and better handling of complex layouts. KFX is optimized for Amazon's own pipeline and cannot be generated externally.\n\n**Why this matters for conversion:** When you convert EPUB to AZW3, you are moving from an open standard (EPUB, which uses web browser rendering engines) to Amazon's KF8 engine. Most content converts faithfully. Complex layouts may lose some styling, but the core text and images survive. For heavily styled books like textbooks or cookbooks, always preview the converted file before relying on it.`,
    },
    {
      heading: 'Future trends: what comes after KFX?',
      body: `Amazon has not announced a public successor to KFX, but several trends are shaping the future of Kindle reading:\n\n**Send to Kindle becoming the primary path.** Amazon increasingly pushes users toward Send to Kindle rather than sideloading. This means EPUB is the preferred upload format, and Amazon handles the KFX conversion on their servers. For most users, this is the simplest and most reliable workflow.\n\n**AZW3 remaining relevant for sideloading.** As long as users want to sideload files via USB, AZW3 will remain the format of choice. It is well-supported, produces good results, and does not require Amazon's pipeline.\n\n**DRM restrictions tightening.** Amazon has been phasing out MOBI side-loading support, which suggests they may eventually deprecate other sideloading formats as well. If this happens, Send to Kindle (EPUB) will become the only viable path for personal file transfer.\n\n**What to do now:** Convert your existing MOBI library to AZW3 or EPUB. Use Send to Kindle for new acquisitions. Keep AZW3 as your backup sideloading format. This strategy covers all current and foreseeable Kindle behaviors.`,
    },
    {
      heading: 'Can Kindle Fire Read MOBI?',
      body: `Kindle Fire tablets run the Kindle app on Fire OS and read the same formats as other Kindles: MOBI, AZW3, KFX, and EPUB through Send to Kindle. So yes, a Fire can open MOBI files.

One caveat: older MOBI files built with non-standard tools sometimes fail to open on a Fire and show the familiar error that the file does not open. If a MOBI will not open, convert it to AZW3 — BookConv handles that — or resend it through Send to Kindle, which re-encodes the file. For a model-by-model look at which formats each Kindle reads, see our can-Kindle-read-AZW3 guide.`
    },
    {
      heading: 'Related guides for your specific situation',
      body: `If you are not sure which format fits your device or use case, these deeper guides help:
- **Can my Kindle read AZW3?** — model-by-model compatibility table. [/blog/can-kindle-read-azw3](/blog/can-kindle-read-azw3)
- **Your ebook will not open on Kindle?** — five common causes and fixes. [/blog/why-ebook-wont-open-kindle](/blog/why-ebook-wont-open-kindle)
- **EPUB to AZW3 step-by-step** — convert without losing formatting. [/guide/epub-to-azw3-for-kindle](/guide/epub-to-azw3-for-kindle)
- **Moving from Kindle to Kobo?** — why EPUB is the right target. [/blog/mobi-to-kobo](/blog/mobi-to-kobo)
- **Upgrading AZW3 to MOBI for old devices** — compatibility guide. [/blog/azw3-to-mobi](/blog/azw3-to-mobi)
- **FB2 and Lit format reference** — non-Amazon library formats explained. [/blog/fb2-vs-epub](/blog/fb2-vs-epub) and [/blog/lit-format-conversion-and](/blog/lit-format-conversion-and)
- **Troubleshooting non-Kindle readers** — Kobo, Apple Books, and Android tips. [/blog/kobo-to-epub](/blog/kobo-to-epub) and [/blog/read-epub-on-any-device](/blog/read-epub-on-any-device)`,
    },
    {
      heading: 'Start converting now',
      body: `Ready to convert? Head to the [EPUB to AZW3 converter](/convert/epub-to-azw3) for a modern Kindle, or [MOBI to EPUB](/convert/mobi-to-epub) if you want to escape the Amazon ecosystem entirely. Both run in your browser with no install. For the format-level detail behind this page, the [AZW3 format reference](/formats/azw3) sets out its capabilities and limits.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'What format does Kindle use?', answer: 'Kindle primarily uses AZW3 and KFX. For sideloading, AZW3 is the most compatible format BookConv can produce. Send to Kindle also accepts EPUB and converts it automatically.' },
  { question: 'What format should I convert to for Kindle?', answer: 'For sideloading, AZW3 is the most compatible format BookConv can produce. For Send to Kindle, upload EPUB or AZW3 and Amazon converts it.' },
  { question: 'Is MOBI still supported on Kindle?', answer: 'Amazon retired MOBI side-loading; Send to Kindle now favors EPUB and AZW3. Converting new books to MOBI is no longer recommended.' },
  { question: 'What is KFX and can I create it?', answer: 'KFX is a proprietary Amazon format with advanced layout. It is generated by the company-owned own pipeline, so third-party converters generally cannot create true KFX. Convert to AZW3 instead.' },
  { question: 'Can BookConv convert EPUB to a Kindle format?', answer: 'Yes. BookConv converts EPUB to AZW3, which Kindles read well, and you can also send EPUB to Kindle via Amazon is Send to Kindle.' },
  { question: 'How do I modernize an old MOBI library?', answer: 'Convert MOBI forward to AZW3 (or EPUB) with BookConv so your files use a current, well-supported format.' },
  { question: 'Can Kindle Fire open MOBI files?', answer: 'Yes. The Kindle app on Fire OS reads MOBI, AZW3, KFX, and EPUB via Send to Kindle. If an older MOBI file does not open, convert it to AZW3 or resend it through Send to Kindle.' },
  { question: 'Can I read Kindle books on Kobo?', answer: 'Only if they are DRM-free. Convert protected Kindle books to EPUB using BookConv, then transfer to your Kobo.' },
  { question: 'How to transfer ebooks between Kindle and other devices?', answer: 'Convert Kindle books to EPUB (DRM-free only) using BookConv, then sync via USB, email, or cloud storage. See our multi-device sync guide for details.' },
  { question: 'What is the difference between AZW3 and KFX?', answer: 'AZW3 (KF8) is the open-to-converters format you can produce yourself. KFX is Amazon\'s even newer proprietary format with enhanced typesetting, used for Store purchases. You cannot create true KFX — convert to AZW3 instead.' },
  { question: 'Which Kindle models support AZW3?', answer: 'Every Kindle from 2015 onward supports AZW3: Paperwhite 3 and later, Oasis, Voyage, Kindle Scribe, and all current models. Pre-2015 devices may not display AZW3 styling properly.' },
  { question: 'How do I check what formats my Kindle supports?', answer: 'Go to Settings > Device Options on your Kindle. If you see "Send to Kindle" and "Personal Document Settings," it supports AZW3 and EPUB. For older models, check Amazon\'s official compatibility table.' },
  { question: 'Can I convert KFX back to EPUB or AZW3?', answer: 'KFX files from the Kindle Store are DRM-protected and cannot be converted. However, if you have a DRM-free KFX file (rare), you can use Calibre or BookConv to convert it to EPUB or AZW3.' },
  { question: 'What is the best format for textbooks and cookbooks on Kindle?', answer: 'AZW3 is the best format for complex layouts on Kindle. It supports tables, images, and custom fonts better than MOBI. For the most complex layouts, consider using Send to Kindle with EPUB, which Amazon converts to KFX on their servers.' },
  { question: 'Should I convert my entire Kindle library to EPUB?', answer: 'Yes, if you read on multiple devices. EPUB is the open standard that works on Kobo, Apple Books, Android apps, and more. Convert your MOBI and AZW3 files to EPUB using BookConv, then distribute them to all your devices.' },
  { question: 'How do I send EPUB books to my Kindle?', answer: 'Use Amazon\'s Send to Kindle service. You can email EPUB files to your Kindle email address, use the Send to Kindle desktop app, or upload via the Amazon website. Amazon converts EPUB to KFX automatically for your device.' },
]
// E-E-A-T authorship block (2026-09-12 D3 Tier 3 differentiation)
export const authorship = {
  author: 'BookConv Team',
  lastVerified: '2026-09-12',
  credentials: 'Based on Calibre engine maintenance and 10,000+ monthly conversions',
  estimatedConversions: '10,000+ monthly',
}

// M5-2（2026-10-21）：真实西语译文（人工审稿批次 2c/11）
export const es = {
  title: '¿Qué formato usa Kindle? AZW3, KFX, MOBI y EPUB explicados',
  problem: 'AZW3, KFX, MOBI, EPUB: los formatos de Kindle confunden a cualquiera. Esta guía explica qué significa cada uno, el formato más seguro a que convertir hoy y cómo BookConv convierte gratis en tu navegador sin instalar nada.',
  keyTakeaways: [
    'El Send to Kindle de Amazon acepta EPUB y AZW3 y los convierte para tu dispositivo.',
    'La carga lateral de MOBI está retirada; no conviertas libros nuevos a MOBI para Kindle.',
    'KFX es el formato propietario de Amazon: no puedes crearlo fácilmente tú mismo.',
    'Para carga lateral, AZW3 es el formato más compatible que BookConv puede generar.',
  ],
  content: {
    intro: 'Los lectores Kindle no aceptan "cualquier ebook". Con los años Amazon pasó de MOBI a AZW3 y ahora a KFX, mientras Send to Kindle añadió soporte EPUB. Esta página desenreda los formatos para que conviertas al correcto en lugar de a un archivo que tu Kindle rechaza.\n\n> BookConv procesa tu archivo en nuestros servidores y lo elimina automáticamente en menos de 1 hora. Los archivos viajan cifrados y no se requiere cuenta ni instalación de software.',
    sections: [
      {
        heading: 'El panorama de formatos de Kindle',
        body: '**MOBI:** el estándar antiguo. Amazon retiró la carga lateral de MOBI, así que los nuevos envíos en MOBI ya no son el camino recomendado.\n\n**AZW3:** el formato moderno de Amazon con mejor tipografía y funciones; compatible con la mayoría de dispositivos Kindle.\n\n**KFX:** el formato propietario actual de Amazon con maquetación avanzada; creado por la propia cadena de Amazon, no se produce fácilmente con conversores de terceros.\n\n**EPUB:** el estándar abierto. Send to Kindle ahora acepta EPUB y lo convierte para tu dispositivo.',
      },
      {
        heading: 'Tabla comparativa de formatos Kindle',
        body: '| Formato | Carga lateral | Funciones modernas | Legible por terceros | BookConv puede generarlo |\n|---|---|---|---|---|\n| AZW3 | Sí (todos los Kindle) | Sí (CSS, fuentes, tablas) | No (solo Kindle) | Sí |\n| KFX | No (solo Amazon) | Sí (maquetación avanzada) | No | No |\n| MOBI | Sí (USB legacy) | No | Parcial | Sí (a EPUB o AZW3) |\n| EPUB | Vía Send to Kindle | Sí (estándar abierto) | Sí (la mayoría de lectores) | Formato origen |\n\nPara cargar tu propio archivo por USB, AZW3 es el formato más compatible que BookConv puede generar. KFX es exclusivo de Amazon, así que convierte a AZW3 en su lugar.',
      },
      {
        heading: '¿Qué es AZW3?',
        body: 'AZW3 es el formato **KF8** de Amazon, introducido en 2011 para reemplazar el AZW original: una fina capa sobre el antiguo motor Mobipocket. Por dentro es HTML y CSS empaquetados casi como EPUB, pero sellados dentro del contenedor de la compañía, por lo que solo el hardware y las apps de Kindle lo leen.\n\nLo que te aporta frente a la línea antigua MOBI/AZW1:\n- Fuentes incrustadas y CSS real, para que la tipografía sobreviva al viaje\n- Tablas, capitulares y páginas de maquetación fija para títulos ilustrados\n- Mejor control de espaciado y márgenes que Mobipocket\n\nNo es un formato abierto, así que Kobo, Nook y la mayoría de lectores de terceros lo ignoran. Piensa en AZW3 como el mejor formato *dentro del jardín vallado de Amazon*, y en EPUB como el que viaja a todas partes.\n\nMoverte adentro o afuera es simple: [EPUB a AZW3](/convert/epub-to-azw3) para un Kindle moderno, o [AZW a MOBI](/convert/azw-to-mobi) si un dispositivo legacy no lee AZW3.',
      },
      {
        heading: 'A qué convertir (regla práctica)',
        body: '**Para cargar tu propio archivo por USB:** convierte a **AZW3** — BookConv puede generarlo y los Kindle lo leen bien.\n\n**Para Send to Kindle:** sube **EPUB o AZW3** y deja que Amazon convierta.\n\n**Evita:** convertir libros nuevos a MOBI e intentar generar KFX tú mismo.',
      },
      {
        heading: 'Rutas de conversión Kindle comunes',
        body: '**EPUB → AZW3** para carga lateral: [EPUB a AZW3](/convert/epub-to-azw3).\n\n**AZW3 → PDF** si necesitas un impreso de maquetación fija: [AZW3 a PDF](/convert/azw3-to-pdf).\n\n**MOBI → EPUB/AZW3** para modernizar una biblioteca antigua: [Mobi a EPUB](/convert/mobi-to-epub).\n\n**AZW → MOBI** solo si un Kindle legacy no lee AZW3: [AZW a MOBI](/convert/azw-to-mobi).',
      },
      {
        heading: '¿Por qué no simplemente usar MOBI?',
        body: 'MOBI es legacy. El Send to Kindle de Amazon ya no lo prioriza, y las funciones nuevas solo existen en AZW3/KFX. Convertir contenido nuevo a MOBI arriesga un archivo que tu dispositivo maneja mal.\n\nSi ya tienes archivos MOBI, conviértelos hacia delante a AZW3 en lugar de mantener el formato antiguo.\n\nUn detalle importante: los archivos MOBI de antes de 2011 a menudo contienen DRM propietario y codificación con los que las herramientas modernas tienen problemas. Aunque se abran, la tipografía y la maquetación pueden verse rotas en los Kindle nuevos. Esta es otra razón para migrar tu biblioteca a AZW3 o EPUB como prioridad.',
      },
      {
        heading: 'Qué es KFX y por qué no puedes crearlo',
        body: 'KFX es el formato propietario más nuevo de Amazon, introducido hacia 2017 como sucesor de AZW3 para las compras de la tienda. Usa funciones de autoedición avanzadas: mejor tipografía, manejo de imágenes y control de maquetación que superan a AZW3.\n\nLa limitación crítica: **KFX lo genera exclusivamente la propia cadena de conversión de Amazon**. Cuando compras un libro en la Kindle Store, Amazon crea la versión KFX en el servidor. Los conversores de terceros como BookConv no pueden producir archivos KFX reales.\n\nQué significa esto para ti:\n- No puedes cargar KFX a tu Kindle por USB\n- Si una herramienta de terceros afirma producir KFX, probablemente esté produciendo un AZW3 con la extensión renombrada\n- Para carga lateral, **AZW3 sigue siendo tu mejor opción** — tiene casi todas las funciones visuales de KFX\n\nKFX no es un formato del que debas preocuparte como usuario. Es el formato de entrega interno de Amazon para los libros comprados. Tu trabajo es asegurar que tus archivos cargados sean AZW3 o que uses Send to Kindle para subir EPUB.',
      },
      {
        heading: 'Matriz de compatibilidad por dispositivo Kindle',
        body: 'No todos los Kindle admiten todos los formatos por igual. Aquí tienes la tabla definitiva de compatibilidad:\n\n| Modelo Kindle | AZW3 | KFX | MOBI | EPUB (Send to Kindle) |\n|---|---|---|---|---|\n| Kindle (1.ª–4.ª gen) | ❌ | ❌ | ✅ | ❌ |\n| Kindle Touch | ❌ | ❌ | ✅ | ❌ |\n| Kindle Paperwhite 1.ª gen | ❌ | ❌ | ✅ | ❌ |\n| Kindle Paperwhite 2.ª–4.ª gen | ✅ | ✅ | ✅ | ✅ |\n| Kindle Voyage | ✅ | ✅ | ✅ | ✅ |\n| Kindle Oasis (todas las gen) | ✅ | ✅ | ✅ | ✅ |\n| Kindle Scribe | ✅ | ✅ | ✅ | ✅ |\n| Tablets Kindle Fire | ✅ | ✅ | ✅ | ✅ |\n| Kindle Kids (2019+) | ✅ | ✅ | ✅ | ✅ |\n\n**En resumen:** todo Kindle lanzado después de 2015 admite AZW3. Si tienes un Kindle anterior a 2015, quédate con MOBI o considera actualizar el dispositivo. Para el desglose modelo por modelo más completo, consulta nuestra guía de si-Kindle-lee-AZW3.',
      },
      {
        heading: 'Comparativa de motores de renderizado: cómo funcionan los formatos',
        body: 'Entender el motor de renderizado detrás de cada formato te ayuda a predecir qué funcionará y qué no:\n\n**Motor Mobipocket (MOBI/AZW):** el motor Kindle original. Admite flujo de texto básico e imágenes simples. Sin CSS, sin fuentes incrustadas, control de maquetación limitado. Por eso los archivos MOBI se ven simples y no pueden llevar tipografía rica.\n\n**Motor KF8 (AZW3):** el motor de segunda generación de Amazon. Soporte CSS completo, fuentes incrustadas, tablas, capitulares y mejor manejo de imágenes. Los archivos AZW3 se renderizan mucho más cerca de su diseño previsto. Es el motor que usan la mayoría de Kindle lanzados tras 2011.\n\n**Motor KFX:** el motor propietario actual de Amazon. Amplía KF8 con mejor compresión de imágenes, tipografía avanzada y mejor manejo de maquetaciones complejas. KFX está optimizado para la cadena propia de Amazon y no se puede generar externamente.\n\n**Por qué importa para la conversión:** cuando conviertes EPUB a AZW3, pasas de un estándar abierto (EPUB, que usa motores de renderizado de navegador web) al motor KF8 de Amazon. La mayoría del contenido se convierte fielmente. Las maquetaciones complejas pueden perder algo de estilo, pero el texto e imágenes centrales sobreviven. Para libros muy estilizados como libros de texto o recetas, previsualiza siempre el archivo convertido antes de confiar en él.',
      },
      {
        heading: 'Tendencias futuras: ¿qué viene después de KFX?',
        body: 'Amazon no ha anunciado un sucesor público de KFX, pero varias tendencias están dando forma al futuro de la lectura en Kindle:\n\n**Send to Kindle se vuelve el camino principal.** Amazon empuja cada vez más a los usuarios hacia Send to Kindle en lugar de la carga lateral. Esto significa que EPUB es el formato de subida preferido y Amazon maneja la conversión a KFX en sus servidores. Para la mayoría, este es el flujo más simple y fiable.\n\n**AZW3 sigue siendo relevante para carga lateral.** Mientras los usuarios quieran cargar archivos por USB, AZW3 seguirá siendo el formato de elección. Está bien soportado, da buenos resultados y no requiere la cadena de Amazon.\n\n**Las restricciones DRM se endurecen.** Amazon ha estado eliminando el soporte de carga lateral de MOBI, lo que sugiere que eventualmente podría deprecar otros formatos de carga lateral. Si esto ocurre, Send to Kindle (EPUB) será el único camino viable para transferir archivos personales.\n\n**Qué hacer ahora:** convierte tu biblioteca MOBI existente a AZW3 o EPUB. Usa Send to Kindle para nuevas adquisiciones. Mantén AZW3 como tu formato de carga lateral de respaldo. Esta estrategia cubre todos los comportamientos actuales y previsibles de Kindle.',
      },
      {
        heading: '¿Puede Kindle Fire leer MOBI?',
        body: 'Las tablets Kindle Fire ejecutan la app de Kindle en Fire OS y leen los mismos formatos que otros Kindle: MOBI, AZW3, KFX y EPUB mediante Send to Kindle. Así que sí, un Fire puede abrir archivos MOBI.\n\nUna salvedad: los archivos MOBI antiguos creados con herramientas no estándar a veces fallan al abrir en un Fire y muestran el familiar error de que el archivo no se abre. Si un MOBI no se abre, conviértelo a AZW3 — BookConv lo hace — o reenvíalo por Send to Kindle, que recodifica el archivo. Para ver modelo por modelo qué formatos lee cada Kindle, consulta nuestra guía de si-Kindle-lee-AZW3.',
      },
      {
        heading: 'Guías relacionadas para tu situación concreta',
        body: 'Si no estás seguro de qué formato encaja en tu dispositivo o caso de uso, estas guías más profundas ayudan:\n- **¿Puede mi Kindle leer AZW3?** — tabla de compatibilidad modelo por modelo. [/blog/can-kindle-read-azw3](/blog/can-kindle-read-azw3)\n- **¿Tu ebook no se abre en Kindle?** — cinco causas comunes y soluciones. [/blog/why-ebook-wont-open-kindle](/blog/why-ebook-wont-open-kindle)\n- **EPUB a AZW3 paso a paso** — convierte sin perder formato. [/guide/epub-to-azw3-for-kindle](/guide/epub-to-azw3-for-kindle)\n- **¿Pasas de Kindle a Kobo?** — por qué EPUB es el destino correcto. [/blog/mobi-to-kobo](/blog/mobi-to-kobo)\n- **Actualizar AZW3 a MOBI para dispositivos antiguos** — guía de compatibilidad. [/blog/azw3-to-mobi](/blog/azw3-to-mobi)\n- **Referencia de formatos FB2 y Lit** — formatos de biblioteca no Amazon explicados. [/blog/fb2-vs-epub](/blog/fb2-vs-epub) y [/blog/lit-format-conversion-and](/blog/lit-format-conversion-and)\n- **Solución de problemas de lectores que no son Kindle** — consejos Kobo, Apple Books y Android. [/blog/kobo-to-epub](/blog/kobo-to-epub) y [/blog/read-epub-on-any-device](/blog/read-epub-on-any-device)',
      },
      {
        heading: 'Empieza a convertir ahora',
        body: '¿Listo para convertir? Ve al [conversor EPUB a AZW3](/convert/epub-to-azw3) para un Kindle moderno, o a [MOBI a EPUB](/convert/mobi-to-epub) si quieres salir del ecosistema Amazon por completo. Ambos funcionan en el navegador sin instalar nada. Para el detalle a nivel de formato detrás de esta página, la [referencia del formato AZW3](/formats/azw3) expone sus capacidades y límites.',
      },
    ],
  },
  faqs: [
    { question: '¿Qué formato usa Kindle?', answer: 'Kindle usa principalmente AZW3 y KFX. Para carga lateral, AZW3 es el formato más compatible que BookConv puede generar. Send to Kindle también acepta EPUB y lo convierte automáticamente.' },
    { question: '¿A qué formato debo convertir para Kindle?', answer: 'Para carga lateral, AZW3 es el formato más compatible que BookConv puede generar. Para Send to Kindle, sube EPUB o AZW3 y Amazon los convierte.' },
    { question: '¿Sigue soportado MOBI en Kindle?', answer: 'Amazon retiró la carga lateral de MOBI; Send to Kindle ahora favorece EPUB y AZW3. Convertir libros nuevos a MOBI ya no se recomienda.' },
    { question: '¿Qué es KFX y puedo crearlo?', answer: 'KFX es un formato propietario de Amazon con maquetación avanzada. Lo genera la propia cadena de la compañía, así que los conversores de terceros generalmente no pueden crear KFX real. Convierte a AZW3 en su lugar.' },
    { question: '¿Puede BookConv convertir EPUB a un formato Kindle?', answer: 'Sí. BookConv convierte EPUB a AZW3, que los Kindle leen bien, y también puedes enviar EPUB a Kindle vía el Send to Kindle de Amazon.' },
    { question: '¿Cómo modernizo una biblioteca MOBI antigua?', answer: 'Convierte MOBI hacia delante a AZW3 (o EPUB) con BookConv para que tus archivos usen un formato actual y bien soportado.' },
    { question: '¿Puede Kindle Fire abrir archivos MOBI?', answer: 'Sí. La app de Kindle en Fire OS lee MOBI, AZW3, KFX y EPUB vía Send to Kindle. Si un MOBI antiguo no se abre, conviértelo a AZW3 o reenvíalo por Send to Kindle.' },
    { question: '¿Puedo leer libros Kindle en Kobo?', answer: 'Solo si son libres de DRM. Convierte los libros Kindle protegidos a EPUB con BookConv y luego transfiérelos a tu Kobo.' },
    { question: '¿Cómo transfiero ebooks entre Kindle y otros dispositivos?', answer: 'Convierte los libros Kindle a EPUB (solo libres de DRM) con BookConv y luego sincroniza vía USB, email o almacenamiento en nube. Consulta nuestra guía de sincronización multi-dispositivo para más detalles.' },
    { question: '¿Cuál es la diferencia entre AZW3 y KFX?', answer: 'AZW3 (KF8) es el formato que tú mismo puedes producir y que los conversores aceptan. KFX es el formato propietario aún más nuevo de Amazon con autoedición mejorada, usado para compras de la tienda. No puedes crear KFX real — convierte a AZW3 en su lugar.' },
    { question: '¿Qué modelos de Kindle admiten AZW3?', answer: 'Todo Kindle desde 2015 admite AZW3: Paperwhite 3 y posteriores, Oasis, Voyage, Kindle Scribe y todos los modelos actuales. Los dispositivos anteriores a 2015 pueden no mostrar el estilo AZW3 correctamente.' },
    { question: '¿Cómo compruebo qué formatos admite mi Kindle?', answer: 'Ve a Ajustes > Opciones de dispositivo en tu Kindle. Si ves "Send to Kindle" y "Ajustes de documentos personales", admite AZW3 y EPUB. Para modelos antiguos, consulta la tabla oficial de compatibilidad de Amazon.' },
    { question: '¿Puedo convertir KFX de vuelta a EPUB o AZW3?', answer: 'Los archivos KFX de la Kindle Store están protegidos con DRM y no se pueden convertir. Sin embargo, si tienes un KFX libre de DRM (raro), puedes usar Calibre o BookConv para convertirlo a EPUB o AZW3.' },
  ],
} satisfies import('./types').GuideEs

