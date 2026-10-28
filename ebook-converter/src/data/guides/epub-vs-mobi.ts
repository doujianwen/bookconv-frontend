import { BlogFaq } from '../blog/types'

export const slug = 'epub-vs-mobi'
export const title = 'EPUB vs MOBI: Device Compatibility Guide'
export const problem = 'EPUB and MOBI both hold ebooks, but they serve different purposes. One is the modern open standard; the other is the legacy Kindle format. Here is how they compare and which one your device actually needs.'
export const date = '2026-09-10'
export const updatedAt = '2026-10-21'
export const tags = ['epub', 'mobi', 'ebook format', 'kindle', 'comparison']
export const keyTakeaways = [
  'EPUB is the open standard — used by Kobo, Apple Books, Google Play, and most readers except Kindle.',
  'MOBI is Amazon\'s legacy format — still required by older Kindles, but being phased out for AZW3.',
  'If you have a Kindle, you must convert to MOBI or AZW3; EPUB will not open natively on older models.',
  'EPUB preserves more formatting and font embedding; MOBI is simpler and more forgiving of broken source files.',
]
export const content = {
  intro: `You have an ebook — maybe a downloaded EPUB from your library, or a MOBI file from an old Kindle purchase — and you need to know which one your device can actually read. The confusion is real: some devices prefer one format, some prefer the other, and a few do not support either without a conversion step.

This guide breaks down EPUB vs MOBI in plain terms so you can stop guessing and pick the right file for your reader.

Quick answer: If you have a Kindle from before roughly 2016, convert your EPUB to MOBI. If you have any newer Kindle, convert to AZW3 instead. For Kobo, Apple Books, Google Play, or any non-Amazon reader, EPUB is the correct format.`,
  sections: [
    {
      heading: 'EPUB at a glance',
      body: `**EPUB** (short for Electronic Publication) is the open, industry-standard ebook format maintained by the International Digital Publishing Forum (IDPF). It is supported natively by:\n\n- **Kobo** (all models)\n- **Apple Books** (iPhone, iPad, Mac)\n- **Google Play Books**\n- **Barnes & Noble Nook**\n- **Most other ebook readers** except Kindle\n\nEPUB supports reflowable text, embedded fonts, CSS styling, fixed-layout books, and images. It is the format used by virtually all public libraries (via OverDrive/Libby) and major bookstores outside Amazon.

The catch: **Kindle does not natively read EPUB** on most models released before 2024. Amazon introduced limited EPUB support via its latest Send-to-Kindle pipeline, but the conversion is unreliable and you lose control over formatting.`,
    },
    {
      heading: 'MOBI at a glance',
      body: `**MOBI** (originally Mobipocket format) is an older proprietary format that Amazon adopted and used as the default for Kindle for many years. It is supported natively by:\n\n- **Kindle devices from roughly 2007 to 2015** (pre-AZW3 era)\n- **Kindle apps on some older smartphones**\n\nMOBI is a simpler format — it supports basic text, images, and limited styling. It does **not** support embedded custom fonts, advanced CSS, or complex layout features. This means:\n\n- Font choices are limited to what Kindle provides.\n- Images may be downgraded or lost during conversion.\n- Chapter breaks can collapse if the converter does not read heading styles.\n\nAmazon effectively replaced MOBI with **AZW3 (Kindle Format 8)** starting in 2011, and newer Kindles no longer recommend MOBI.`,
    },
    {
      heading: 'Side-by-side comparison',
      body: `| Feature | EPUB | MOBI |\n|---|---|---|\n| Open standard | ✅ Yes (IDPF) | ❌ Proprietary (Amazon legacy) |\n| Native Kindle support | ❌ No (except latest Send-to-Kindle) | ✅ Yes (older Kindles) |\n| Kobo / Apple Books / Nook | ✅ Yes | ❌ No |\n| Embedded fonts | ✅ Yes | ❌ Limited / no |\n| Advanced CSS styling | ✅ Yes | ❌ No |\n| Image handling | ✅ Good (SVG + raster) | ⚠️ Fair (often downgraded) |\n| Library / bookstore compatible | ✅ Broad | ❌ Amazon-only |\n| File size | ⚠️ Larger (richer features) | ✅ Smaller (simpler structure) |\n\n**Bottom line:** EPUB is the better format for quality and compatibility across most devices. MOBI is only necessary if you have an older Kindle that cannot read AZW3.`,
    },
    {
      heading: 'Which format should you use?',
      body: `Use this decision tree to pick the right format:\n\n**1. What device are you reading on?**\n- **Kindle (any model)** → Convert to AZW3 (preferred) or MOBI (if your Kindle is very old, pre-2016)\n- **Kobo** → EPUB is native; no conversion needed\n- **Apple Books / iPhone / iPad** → EPUB is native; no conversion needed\n- **Nook / Google Play Books** → EPUB is native; no conversion needed\n- **Multiple devices** → Stick with EPUB and convert to device-specific formats only when needed\n\n**2. Do you need to convert?**\n- If your source is EPUB and your target device is Kindle → use a converter like [BookConv's EPUB to AZW3](/convert/epub-to-azw3) or [EPUB to MOBI](/convert/epub-to-mobi)\n- If your source is MOBI and you want to move to a non-Kindle device → convert to EPUB with [BookConv's MOBI to EPUB](/convert/mobi-to-epub)\n\n**3. What matters more: convenience or quality?**\n- Convenience first (one-off file, don't want to install anything) → online converter\n- Quality and privacy first (batch work, sensitive manuscript) → Calibre on your computer`,
    },
    {
      heading: 'Converting between EPUB and MOBI',
      body: `If you need to switch between EPUB and MOBI, [BookConv](https://www.bookconv.com) offers free online converters for both directions:\n\n- **EPUB → MOBI**: [/convert/epub-to-mobi](/convert/epub-to-mobi) — for older Kindles\n- **EPUB → AZW3**: [/convert/epub-to-azw3](/convert/epub-to-azw3) — for modern Kindles (recommended)\n- **MOBI → EPUB**: [/convert/mobi-to-epub](/convert/mobi-to-epub) — to escape the Kindle ecosystem\n\nAll conversions run in your browser. Files are deleted automatically after the conversion completes. No software installation required.`,
    },
    {
      heading: 'Should you bother converting at all?',
      body: `Not always. If you already have an EPUB and your device reads EPUB natively (Kobo, Apple Books, etc.), leave it as EPUB. Converting only adds risk — each conversion can degrade images, lose fonts, or mishandle chapter structure.\n\nConvert only when your device requires a different format. For Kindle users, that means converting EPUB to AZW3 (or MOBI for very old devices). For everyone else, stick with EPUB and avoid the extra step. For device-specific setup tips on Kobo and other non-Kindle readers, see [Read EPUB on Any Device](/blog/read-epub-on-any-device). And if you have FB2 or Lit files in your library, [FB2 vs EPUB](/blog/fb2-vs-epub) and [Lit format conversion guide](/blog/lit-format-conversion-and) explain those ecosystems.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Can Kindle read EPUB files?', answer: 'Most Kindle devices cannot read EPUB natively. Amazon\'s latest Send-to-Kindle pipeline accepts EPUB but the automatic conversion is unreliable — formatting often breaks. The recommended approach is to convert EPUB to AZW3 or MOBI yourself before sending to Kindle.' },
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
    'Si tienes un Kindle, convierte a MOBI o AZW3; los modelos antiguos no abren EPUB de forma nativa.',
    'EPUB conserva más formato y fuentes incrustadas; MOBI es más simple y más tolerante con archivos de origen dañados.',
  ],
  content: {
    intro: `Tienes un libro electrónico —quizás un EPUB descargado de tu biblioteca o un MOBI de una compra antigua en Kindle— y necesitas saber cuál puede leer tu dispositivo. La confusión es real: algunos dispositivos prefieren un formato, otros el contrario, y unos cuantos no soportan ninguno sin un paso de conversión.

Esta guía desglosa EPUB vs MOBI en términos sencillos para que dejes de adivinar y elijas el archivo correcto para tu lector.

Respuesta rápida: si tienes un Kindle de antes de 2016 aproximadamente, convierte tu EPUB a MOBI. Si tienes un Kindle más nuevo, convierte a AZW3. Para Kobo, Apple Books, Google Play o cualquier lector que no sea de Amazon, EPUB es el formato correcto.`,
    sections: [
      {
        heading: 'EPUB de un vistazo',
        body: `**EPUB** (de Electronic Publication) es el formato de libro electrónico abierto y estándar de la industria, mantenido por el International Digital Publishing Forum (IDPF). Es compatible de forma nativa con:\n\n- **Kobo** (todos los modelos)\n- **Apple Books** (iPhone, iPad, Mac)\n- **Google Play Books**\n- **Barnes & Noble Nook**\n- **La mayoría de los demás lectores**, excepto Kindle\n\nEPUB admite texto reflowable, fuentes incrustadas, estilos CSS, libros de maquetación fija e imágenes. Es el formato que usan prácticamente todas las bibliotecas públicas (vía OverDrive/Libby) y las grandes librerías fuera de Amazon.\n\nLa pega: **Kindle no lee EPUB de forma nativa** en la mayoría de modelos lanzados antes de 2024. Amazon introdujo soporte limitado de EPUB en su última cadena de Send to Kindle, pero la conversión es poco fiable y pierdes el control sobre el formato.`,
      },
      {
        heading: 'MOBI de un vistazo',
        body: `**MOBI** (originalmente formato Mobipocket) es un formato propietario antiguo que Amazon adoptó y usó como predeterminado de Kindle durante muchos años. Es compatible de forma nativa con:\n\n- **Dispositivos Kindle de aproximadamente 2007 a 2015** (era previa a AZW3)\n- **Apps de Kindle en algunos smartphones antiguos**\n\nMOBI es un formato más simple: admite texto básico, imágenes y estilos limitados. **No** admite fuentes personalizadas incrustadas, CSS avanzado ni funciones complejas de maquetación. Eso significa:\n\n- Las opciones de fuente se limitan a las que ofrece Kindle.\n- Las imágenes pueden degradarse o perderse durante la conversión.\n- Los saltos de capítulo pueden colapsarse si el conversor no lee los estilos de encabezado.\n\nAmazon sustituyó efectivamente MOBI por **AZW3 (Kindle Format 8)** a partir de 2011, y los Kindle nuevos ya no recomiendan MOBI.`,
      },
      {
        heading: 'Comparación lado a lado',
        body: `| Característica | EPUB | MOBI |\n|---|---|---|\n| Estándar abierto | ✅ Sí (IDPF) | ❌ Propietario (legacy de Amazon) |\n| Soporte nativo en Kindle | ❌ No (excepto el último Send to Kindle) | ✅ Sí (Kindles antiguos) |\n| Kobo / Apple Books / Nook | ✅ Sí | ❌ No |\n| Fuentes incrustadas | ✅ Sí | ❌ Limitado / no |\n| Estilos CSS avanzados | ✅ Sí | ❌ No |\n| Manejo de imágenes | ✅ Bueno (SVG + raster) | ⚠️ Regular (suele degradarse) |\n| Compatible con bibliotecas / librerías | ✅ Amplio | ❌ Solo Amazon |\n| Tamaño de archivo | ⚠️ Mayor (más funciones) | ✅ Menor (estructura simple) |\n\n**En resumen:** EPUB es el mejor formato en calidad y compatibilidad con la mayoría de dispositivos. MOBI solo es necesario si tienes un Kindle antiguo que no puede leer AZW3.`,
      },
      {
        heading: '¿Qué formato deberías usar?',
        body: `Usa este árbol de decisión para elegir el formato correcto:\n\n**1. ¿En qué dispositivo lees?**\n- **Kindle (cualquier modelo)** → convierte a AZW3 (preferido) o MOBI (si tu Kindle es muy antiguo, anterior a 2016)\n- **Kobo** → EPUB es nativo; no hace falta convertir\n- **Apple Books / iPhone / iPad** → EPUB es nativo; no hace falta convertir\n- **Nook / Google Play Books** → EPUB es nativo; no hace falta convertir\n- **Varios dispositivos** → quédate con EPUB y convierte a formatos específicos solo cuando lo necesites\n\n**2. ¿Necesitas convertir?**\n- Si tu origen es EPUB y tu destino es Kindle → usa un conversor como [el EPUB a AZW3 de BookConv](/convert/epub-to-azw3) o [EPUB a MOBI](/convert/epub-to-mobi)\n- Si tu origen es MOBI y quieres pasar a un dispositivo que no es Kindle → convierte a EPUB con [MOBI a EPUB de BookConv](/convert/mobi-to-epub)\n\n**3. ¿Qué importa más: comodidad o calidad?**\n- Comodidad primero (un archivo suelto, sin instalar nada) → conversor online\n- Calidad y privacidad primero (trabajo por lotes, manuscrito sensible) → Calibre en tu ordenador`,
      },
      {
        heading: 'Convertir entre EPUB y MOBI',
        body: `Si necesitas pasar de EPUB a MOBI o al revés, [BookConv](https://www.bookconv.com) ofrece conversores online gratuitos en ambas direcciones:\n\n- **EPUB → MOBI**: [/convert/epub-to-mobi](/convert/epub-to-mobi) — para Kindles antiguos\n- **EPUB → AZW3**: [/convert/epub-to-azw3](/convert/epub-to-azw3) — para Kindle modernos (recomendado)\n- **MOBI → EPUB**: [/convert/mobi-to-epub](/convert/mobi-to-epub) — para salir del ecosistema Kindle\n\nTodas las conversiones se ejecutan en tu navegador. Los archivos se eliminan automáticamente en menos de una hora. Sin instalación de software.`,
      },
      {
        heading: '¿Merece la pena convertir?',
        body: `No siempre. Si ya tienes un EPUB y tu dispositivo lo lee de forma nativa (Kobo, Apple Books, etc.), déjalo en EPUB. Convertir solo añade riesgo: cada conversión puede degradar imágenes, perder fuentes o estropear la estructura de capítulos.\n\nConvierte solo cuando tu dispositivo exija otro formato. Para usuarios de Kindle, eso significa convertir EPUB a AZW3 (o MOBI en dispositivos muy antiguos). Para todos los demás, quédate con EPUB y evita el paso extra. Para consejos de configuración específicos de Kobo y otros lectores que no son Kindle, consulta [Leer EPUB en cualquier dispositivo](/blog/read-epub-on-any-device). Y si tienes archivos FB2 o Lit en tu biblioteca, [FB2 vs EPUB](/blog/fb2-vs-epub) y [guía de conversión del formato Lit](/blog/lit-format-conversion-and) explican esos ecosistemas.`,
      },
    ],
  },
  faqs: [
    { question: '¿Puede Kindle leer archivos EPUB?', answer: 'La mayoría de los dispositivos Kindle no pueden leer EPUB de forma nativa. La última cadena de Send to Kindle de Amazon acepta EPUB, pero la conversión automática es poco fiable y el formato suele romperse. Lo recomendable es convertir tú mismo el EPUB a AZW3 o MOBI antes de enviarlo al Kindle.' },
    { question: '¿Es MOBI mejor que EPUB para Kindle?', answer: 'No. MOBI es un formato legacy con soporte de estilos limitado. Para los Kindle desde 2016 en adelante, AZW3 es la mejor opción porque conserva más maquetación, fuentes e imágenes. Usa MOBI solo si tu Kindle es demasiado antiguo para soportar AZW3.' },
    { question: '¿Qué formato es mejor en general, EPUB o MOBI?', answer: 'EPUB es el mejor formato en casi todos los sentidos: es abierto, está ampliamante soportado y conserva el formato enriquecido. MOBI solo es útil si tienes un Kindle antiguo que no puede leer AZW3 ni EPUB.' },
    { question: '¿Necesito convertir mi EPUB si tengo un Kobo?', answer: 'No. Los lectores Kobo soportan EPUB de forma nativa. Convertir solo arriesgaría degradar el archivo. Conserva tu EPUB y cárgalo directamente en el Kobo.' },
    { question: '¿Cómo convierto EPUB a MOBI gratis?', answer: 'Usa un conversor online gratuito como BookConv en [/convert/epub-to-mobi](/convert/epub-to-mobi). Sube tu EPUB, elige MOBI y descarga el archivo convertido. Sin instalación.' },
    { question: '¿Puedo convertir MOBI de vuelta a EPUB?', answer: 'Sí. Si quieres pasar tus archivos MOBI a un dispositivo que no es Kindle, usa [el conversor de MOBI a EPUB de BookConv](/convert/mobi-to-epub). Ten en cuenta que el formato puede simplificarse, ya que MOBI contiene menos información que EPUB.' },
    { question: '¿Y otros formatos como FB2 o Lit?', answer: 'FB2 es común en las bibliotecas de libros electrónicos rusas; consulta [FB2 vs EPUB](/blog/fb2-vs-epub). Los archivos Lit son formatos legacy de Microsoft; nuestra [guía de conversión del formato Lit](/blog/lit-format-conversion-and) explica cómo pasarlos a EPUB.' },
  ],
} satisfies import('./types').GuideEs
