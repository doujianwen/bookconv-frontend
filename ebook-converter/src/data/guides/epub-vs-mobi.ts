import { BlogFaq } from '../blog/types'

export const slug = 'epub-vs-mobi'
export const title = 'EPUB vs MOBI: Device Compatibility Guide'
export const problem = 'EPUB and MOBI both hold ebooks, but they serve different purposes. One is the modern open standard; the other is the legacy Kindle format. Here is how they compare and which one your device actually needs.'
export const date = '2026-09-10'
export const updatedAt = '2026-11-01'
export const tags = ['epub', 'mobi', 'ebook format', 'kindle', 'comparison']
export const keyTakeaways = [
  'EPUB is the open standard — used by Kobo, Apple Books, Google Play, and most readers except Kindle.',
  'MOBI is Amazon\'s legacy format — still required by older Kindles, but being phased out for AZW3.',
  "Send to Kindle accepts EPUB directly; AZW3 is an option for compatible USB sideloading.",
  'EPUB preserves more formatting and font embedding; MOBI is simpler and more forgiving of broken source files.',
]
export const content = {
  intro: "You have an ebook — maybe a downloaded EPUB from your library, or a MOBI file from an old Kindle purchase — and you need to know which one your device can actually read. The confusion is real: some devices prefer one format, some prefer the other, and a few do not support either without a conversion step.\n\nThis guide breaks down EPUB vs MOBI in plain terms so you can stop guessing and pick the right file for your reader.\n\nQuick answer: for Kindle cloud delivery, use a supported DRM-free EPUB with Send to Kindle. For compatible USB sideloading, consider AZW3. Use MOBI only when a specific legacy reader requires it. EPUB works with compatible Kobo and mobile reader apps.",
  sections: [
    {
      heading: 'EPUB at a glance',
      body: "**EPUB** (short for Electronic Publication) is the open, industry-standard ebook format maintained by the International Digital Publishing Forum (IDPF). It is supported natively by:\n\n- **Kobo** (all models)\n- **Apple Books** (iPhone, iPad, Mac)\n- **Google Play Books**\n- **Barnes & Noble Nook**\n- **Most other ebook readers** except Kindle\n\nEPUB supports reflowable text, embedded fonts, CSS styling, fixed-layout books, and images. It is the format used by virtually all public libraries (via OverDrive/Libby) and major bookstores outside Amazon.\n\nNative file support and cloud delivery are different. Send to Kindle accepts EPUB and converts it for delivery. For compatible USB sideloading, choose a device-supported format such as AZW3. See [Amazon’s transfer documentation](https://digprjsurvey.amazon.com/csad/help/node/TCUBEdEkbIhK07ysFu).",
    },
    {
      heading: 'MOBI at a glance',
      body: `**MOBI** (originally Mobipocket format) is an older proprietary format that Amazon adopted and used as the default for Kindle for many years. It is supported natively by:\n\n- **Kindle devices from roughly 2007 to 2015** (pre-AZW3 era)\n- **Kindle apps on some older smartphones**\n\nMOBI is a simpler format — it supports basic text, images, and limited styling. It does **not** support embedded custom fonts, advanced CSS, or complex layout features. This means:\n\n- Font choices are limited to what Kindle provides.\n- Images may be downgraded or lost during conversion.\n- Chapter breaks can collapse if the converter does not read heading styles.\n\nAmazon effectively replaced MOBI with **AZW3 (Kindle Format 8)** starting in 2011, and newer Kindles no longer recommend MOBI.`,
    },
    {
      heading: 'Side-by-side comparison',
      body: "| Feature | EPUB | MOBI |\n|---|---|---|\n| Open standard | ✅ Yes (IDPF) | ❌ Proprietary (Amazon legacy) |\n| Native Kindle support | Cloud conversion via Send to Kindle; not native EPUB opening | ✅ Yes (older Kindles) |\n| Kobo / Apple Books / Nook | ✅ Yes | ❌ No |\n| Embedded fonts | ✅ Yes | ❌ Limited / no |\n| Advanced CSS styling | ✅ Yes | ❌ No |\n| Image handling | ✅ Good (SVG + raster) | ⚠️ Fair (often downgraded) |\n| Library / bookstore compatible | ✅ Broad | ❌ Amazon-only |\n| File size | ⚠️ Larger (richer features) | ✅ Smaller (simpler structure) |\n\n**Bottom line:** EPUB is the better format for quality and compatibility across most devices. MOBI is only necessary if you have an older Kindle that cannot read AZW3.",
    },
    {
      heading: 'Which format should you use?',
      body: "Choose the delivery route first:\n\n- **Kindle cloud delivery:** upload a supported DRM-free EPUB through [Amazon Send to Kindle](https://www.amazon.com/sendtokindle). A separate MOBI conversion is usually unnecessary.\n- **Compatible Kindle USB sideloading:** use AZW3, or MOBI only if the device specifically requires it. Check the device documentation.\n- **Kobo, Apple Books or another EPUB reader:** open a compatible EPUB directly.\n- **Existing DRM-free MOBI for an EPUB reader:** [convert MOBI to EPUB](/convert/mobi-to-epub), then check chapters and images; a text-reconstruction route may lose styling and illustrations.\n\nStore purchases and library loans may be protected. BookConv does not remove DRM or transfer store entitlements. No conversion guarantees identical layout.",
    },
    {
      heading: 'Converting between EPUB and MOBI',
      body: "Convert only when your reader or delivery route requires another format. [EPUB to MOBI](/convert/epub-to-mobi) is for a specific legacy requirement; [EPUB to AZW3](/convert/epub-to-azw3) is an option for compatible USB sideloading; [MOBI to EPUB](/convert/mobi-to-epub) serves EPUB readers with supported DRM-free inputs.\n\nFiles are processed on servers, and methods vary by pair. Check [batch limits](/batch) and the [privacy policy](/privacy) for processing, caching and retention. Some routes rebuild text and cannot preserve all images, styles or metadata.",
    },
    {
      heading: 'Should you bother converting at all?',
      body: "Not always. If you already have an EPUB and your device reads EPUB natively (Kobo, Apple Books, etc.), leave it as EPUB. Converting only adds risk — each conversion can degrade images, lose fonts, or mishandle chapter structure.\n\nConvert only when your device requires a different format. For Kindle users, first consider Send to Kindle with EPUB; conversion to AZW3 is an option for compatible USB sideloading. For everyone else, stick with EPUB and avoid the extra step. For device-specific setup tips on Kobo and other non-Kindle readers, see [Read EPUB on Any Device](/blog/read-epub-on-any-device). And if you have FB2 or Lit files in your library, [FB2 vs EPUB](/blog/fb2-vs-epub) and [Lit format conversion guide](/blog/lit-format-conversion-and) explain those ecosystems.",
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Can Kindle read EPUB files?', answer: "Send to Kindle accepts supported DRM-free EPUB and converts it for delivery. For compatible USB sideloading, use a format supported by the device, such as AZW3. Native EPUB opening and cloud conversion are separate capabilities." },
  { question: 'Is MOBI better than EPUB for Kindle?', answer: 'No. MOBI is a legacy format with limited styling support. For Kindles from 2016 onward, AZW3 is the better choice because it preserves more layout, fonts, and images. Use MOBI only if your Kindle is too old to support AZW3.' },
  { question: 'Which format is better overall, EPUB or MOBI?', answer: 'EPUB is the better format in almost every way — it is open, widely supported, and preserves rich formatting. MOBI is only useful if you have an older Kindle that cannot read AZW3 or EPUB.' },
  { question: 'Do I need to convert my EPUB if I have a Kobo?', answer: 'No. Kobo e-readers natively support EPUB. Converting would only risk degrading the file. Keep your EPUB and load it directly onto your Kobo.' },
  { question: 'How do I convert EPUB to MOBI for free?', answer: 'Use a free online converter like BookConv at [/convert/epub-to-mobi](/convert/epub-to-mobi). Upload your EPUB, select MOBI, and download the converted file. No install needed.' },
  { question: 'Can I convert MOBI back to EPUB?', answer: 'Yes. If you want to move your MOBI files to a non-Kindle device, use [BookConv\'s MOBI to EPUB converter](/convert/mobi-to-epub). Note that formatting may be simplified since MOBI holds less information than EPUB.' },
  { question: 'What about other formats like FB2 or Lit?', answer: 'FB2 is common in Russian ebook libraries — see [FB2 vs EPUB](/blog/fb2-vs-epub). Lit files are legacy Microsoft formats; our [Lit format conversion guide](/blog/lit-format-conversion-and) covers how to bring them into EPUB.' },
]

// E-E-A-T authorship block (2026-09-12 D3 Tier 3 differentiation)
export const authorship = {
  author: 'BookConv Team',
  lastVerified: '2026-10-21',
  credentials: 'Based on Calibre engine maintenance and 10,000+ monthly conversions',
  estimatedConversions: '10,000+ monthly',
}

// M5-2（2026-10-21）：真实西语译文（首篇，人工审稿批次 1/11）
export const es = {
  title: 'EPUB vs MOBI: guía de compatibilidad por dispositivo',
  problem: 'EPUB y MOBI contienen ambos libros electrónicos, pero sirven para cosas distintas: uno es el estándar abierto moderno; el otro, el formato legacy de Kindle. Aquí tienes la comparación y el formato que tu dispositivo necesita de verdad.',
  keyTakeaways: [
    'EPUB es el estándar abierto: lo usan Kobo, Apple Books, Google Play y casi todos los lectores, excepto Kindle.',
    'MOBI es el formato legacy de Amazon: los Kindle antiguos aún lo exigen, pero está siendo sustituido por AZW3.',
    "Send to Kindle acepta EPUB directamente; AZW3 es una opción para USB en un Kindle compatible.",
    'EPUB conserva más formato y fuentes incrustadas; MOBI es más simple y más tolerante con archivos de origen dañados.',
  ],
  content: {
    intro: "Tienes un libro electrónico —quizás un EPUB descargado de tu biblioteca o un MOBI de una compra antigua en Kindle— y necesitas saber cuál puede leer tu dispositivo. La confusión es real: algunos dispositivos prefieren un formato, otros el contrario, y unos cuantos no soportan ninguno sin un paso de conversión.\n\nEsta guía desglosa EPUB vs MOBI en términos sencillos para que dejes de adivinar y elijas el archivo correcto para tu lector.\n\nRespuesta rápida: para Kindle mediante la nube, utiliza un EPUB compatible sin DRM con Send to Kindle. Para USB en un Kindle compatible, considera AZW3. Usa MOBI solo cuando un lector legacy lo requiera. EPUB funciona con lectores Kobo y apps compatibles.",
    sections: [
      {
        heading: 'EPUB de un vistazo',
        body: "**EPUB** (de Electronic Publication) es el formato de libro electrónico abierto y estándar de la industria, mantenido por el International Digital Publishing Forum (IDPF). Es compatible de forma nativa con:\n\n- **Kobo** (todos los modelos)\n- **Apple Books** (iPhone, iPad, Mac)\n- **Google Play Books**\n- **Barnes & Noble Nook**\n- **La mayoría de los demás lectores**, excepto Kindle\n\nEPUB admite texto reflowable, fuentes incrustadas, estilos CSS, libros de maquetación fija e imágenes. Es el formato que usan prácticamente todas las bibliotecas públicas (vía OverDrive/Libby) y las grandes librerías fuera de Amazon.\n\nEl soporte nativo y la entrega mediante la nube son distintos. Send to Kindle acepta EPUB y lo convierte para entregarlo. Para USB, elige un formato admitido por el dispositivo, como AZW3. Consulta la [documentación de Amazon](https://digprjsurvey.amazon.com/csad/help/node/TCUBEdEkbIhK07ysFu).",
      },
      {
        heading: 'MOBI de un vistazo',
        body: `**MOBI** (originalmente formato Mobipocket) es un formato propietario antiguo que Amazon adoptó y usó como predeterminado de Kindle durante muchos años. Es compatible de forma nativa con:\n\n- **Dispositivos Kindle de aproximadamente 2007 a 2015** (era previa a AZW3)\n- **Apps de Kindle en algunos smartphones antiguos**\n\nMOBI es un formato más simple: admite texto básico, imágenes y estilos limitados. **No** admite fuentes personalizadas incrustadas, CSS avanzado ni funciones complejas de maquetación. Eso significa:\n\n- Las opciones de fuente se limitan a las que ofrece Kindle.\n- Las imágenes pueden degradarse o perderse durante la conversión.\n- Los saltos de capítulo pueden colapsarse si el conversor no lee los estilos de encabezado.\n\nAmazon sustituyó efectivamente MOBI por **AZW3 (Kindle Format 8)** a partir de 2011, y los Kindle nuevos ya no recomiendan MOBI.`,
      },
      {
        heading: 'Comparación lado a lado',
        body: "| Característica | EPUB | MOBI |\n|---|---|---|\n| Estándar abierto | ✅ Sí (IDPF) | ❌ Propietario (legacy de Amazon) |\n| Soporte nativo en Kindle | Conversión mediante Send to Kindle; no apertura nativa de EPUB | ✅ Sí (Kindles antiguos) |\n| Kobo / Apple Books / Nook | ✅ Sí | ❌ No |\n| Fuentes incrustadas | ✅ Sí | ❌ Limitado / no |\n| Estilos CSS avanzados | ✅ Sí | ❌ No |\n| Manejo de imágenes | ✅ Bueno (SVG + raster) | ⚠️ Regular (suele degradarse) |\n| Compatible con bibliotecas / librerías | ✅ Amplio | ❌ Solo Amazon |\n| Tamaño de archivo | ⚠️ Mayor (más funciones) | ✅ Menor (estructura simple) |\n\n**En resumen:** EPUB es el mejor formato en calidad y compatibilidad con la mayoría de dispositivos. MOBI solo es necesario si tienes un Kindle antiguo que no puede leer AZW3.",
      },
      {
        heading: '¿Qué formato deberías usar?',
        body: "Elige primero la ruta de entrega:\n\n- **Kindle mediante la nube:** sube un EPUB compatible y sin DRM a [Amazon Send to Kindle](https://www.amazon.com/sendtokindle). Normalmente no necesitas convertirlo a MOBI.\n- **Kindle compatible por USB:** utiliza AZW3, o MOBI solo si el dispositivo lo requiere. Consulta la documentación del modelo.\n- **Kobo, Apple Books u otro lector EPUB:** abre el EPUB compatible directamente.\n- **MOBI sin DRM para un lector EPUB:** [convierte MOBI a EPUB](/convert/mobi-to-epub) y comprueba capítulos e imágenes; una ruta de reconstrucción de texto puede perder estilos e ilustraciones.\n\nLas compras y préstamos pueden estar protegidos. BookConv no elimina DRM ni transfiere derechos entre tiendas. No se garantiza una maquetación idéntica.",
      },
      {
        heading: 'Convertir entre EPUB y MOBI',
        body: "Convierte solo cuando tu lector o ruta de entrega requiera otro formato. [EPUB a MOBI](/convert/epub-to-mobi) sirve para un requisito legacy concreto; [EPUB a AZW3](/convert/epub-to-azw3) es una opción para USB en un Kindle compatible; [MOBI a EPUB](/convert/mobi-to-epub) admite archivos compatibles sin DRM para lectores EPUB.\n\nLos archivos se procesan en servidores y el método depende del par. Consulta los [límites por lotes](/batch) y la [política de privacidad](/privacy) para el procesamiento, la caché y la retención. Algunas rutas reconstruyen texto y pueden perder imágenes, estilos o metadatos.",
      },
      {
        heading: '¿Merece la pena convertir?',
        body: "No siempre. Si ya tienes un EPUB y tu dispositivo lo lee de forma nativa (Kobo, Apple Books, etc.), déjalo en EPUB. Convertir solo añade riesgo: cada conversión puede degradar imágenes, perder fuentes o estropear la estructura de capítulos.\n\nConvierte solo cuando tu dispositivo exija otro formato. Para Kindle, considera primero Send to Kindle con EPUB; AZW3 es una opción para USB en dispositivos compatibles. Para todos los demás, quédate con EPUB y evita el paso extra. Para consejos de configuración específicos de Kobo y otros lectores que no son Kindle, consulta [Leer EPUB en cualquier dispositivo](/blog/read-epub-on-any-device). Y si tienes archivos FB2 o Lit en tu biblioteca, [FB2 vs EPUB](/blog/fb2-vs-epub) y [guía de conversión del formato Lit](/blog/lit-format-conversion-and) explican esos ecosistemas.",
      },
    ],
  },
  faqs: [
    { question: '¿Puede Kindle leer archivos EPUB?', answer: "Send to Kindle acepta EPUB compatible sin DRM y lo convierte para entregarlo. Para USB, utiliza un formato admitido por el dispositivo, como AZW3. La apertura nativa de EPUB y la conversión en la nube son capacidades diferentes." },
    { question: '¿Es MOBI mejor que EPUB para Kindle?', answer: 'No. MOBI es un formato legacy con soporte de estilos limitado. Para los Kindle desde 2016 en adelante, AZW3 es la mejor opción porque conserva más maquetación, fuentes e imágenes. Usa MOBI solo si tu Kindle es demasiado antiguo para soportar AZW3.' },
    { question: '¿Qué formato es mejor en general, EPUB o MOBI?', answer: 'EPUB es el mejor formato en casi todos los sentidos: es abierto, está ampliamante soportado y conserva el formato enriquecido. MOBI solo es útil si tienes un Kindle antiguo que no puede leer AZW3 ni EPUB.' },
    { question: '¿Necesito convertir mi EPUB si tengo un Kobo?', answer: 'No. Los lectores Kobo soportan EPUB de forma nativa. Convertir solo arriesgaría degradar el archivo. Conserva tu EPUB y cárgalo directamente en el Kobo.' },
    { question: '¿Cómo convierto EPUB a MOBI gratis?', answer: 'Usa un conversor online gratuito como BookConv en [/convert/epub-to-mobi](/convert/epub-to-mobi). Sube tu EPUB, elige MOBI y descarga el archivo convertido. Sin instalación.' },
    { question: '¿Puedo convertir MOBI de vuelta a EPUB?', answer: 'Sí. Si quieres pasar tus archivos MOBI a un dispositivo que no es Kindle, usa [el conversor de MOBI a EPUB de BookConv](/convert/mobi-to-epub). Ten en cuenta que el formato puede simplificarse, ya que MOBI contiene menos información que EPUB.' },
    { question: '¿Y otros formatos como FB2 o Lit?', answer: 'FB2 es común en las bibliotecas de libros electrónicos rusas; consulta [FB2 vs EPUB](/blog/fb2-vs-epub). Los archivos Lit son formatos legacy de Microsoft; nuestra [guía de conversión del formato Lit](/blog/lit-format-conversion-and) explica cómo pasarlos a EPUB.' },
  ],
} satisfies import('./types').GuideEs
