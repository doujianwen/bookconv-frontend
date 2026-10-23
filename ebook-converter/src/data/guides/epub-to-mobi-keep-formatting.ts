import { BlogFaq } from '../blog/types'

export const slug = 'epub-to-mobi-keep-formatting'
export const title = 'EPUB to MOBI: Keep Formatting and Read on Any Kindle (Free)'
export const metaTitle = 'EPUB to MOBI: Keep Format, Read on Any Kindle'
export const problem = 'Kindle won\'t open EPUB natively, and a careless EPUB to MOBI conversion scrambles your chapter breaks and drops your images. Here\'s how to convert cleanly with BookConv — free, in your browser, no software to install — and keep your layout.'
export const date = '2026-08-02'
export const updatedAt = '2026-10-23'
export const tags = ['epub', 'mobi', 'kindle', 'formatting', 'ebook conversion']
export const formats = { source: 'epub', target: 'mobi' }
export const keyTakeaways = [
  'Older Kindles read MOBI or AZW3, not EPUB — converting is required, not optional.',
  'MOBI is a legacy format; if your Kindle supports it, AZW3 (via EPUB to AZW3) preserves more of your layout.',
  'Image-heavy EPUBs need a converter that embeds images properly, or they arrive blank.',
  'BookConv converts EPUB to MOBI in the browser and keeps images and chapter structure intact.',
]
export const content = {
  intro: 'You finished your EPUB, you send it to your Kindle, and nothing happens — or it opens as one unbroken wall of text with no cover. The problem is not your file. It is that Kindle and EPUB do not speak the same language. This guide shows how to convert EPUB to MOBI the right way so your chapters, images, and cover survive.',
  sections: [
    {
      heading: 'EPUB to MOBI: the short answer',
      body: `**EPUB** is the open ebook standard, but Kindle devices read **MOBI** and **AZW3**, not EPUB. Converting EPUB to MOBI turns your book into a file older Kindles open natively — and a clean conversion keeps your chapter breaks, images, and cover intact.

Three steps:

1. Open the free [BookConv EPUB to MOBI converter](/convert/epub-to-mobi).
2. Upload your .epub file and choose **MOBI**.
3. Download the result and send it to your Kindle.

One tip: if your Kindle is from roughly 2016 or later, convert to **AZW3** instead — it preserves more of your layout than legacy MOBI.`,
    },
    {
      heading: 'Why Kindle needs MOBI (and not EPUB)',
      body: `Amazon\'s Kindle ecosystem was built around Mobipocket formats long before EPUB became the open standard. Older Kindle models, and the original Send-to-Kindle pipeline, understand **MOBI** and **AZW3** — not EPUB.\n\nIf you email an EPUB to your Kindle address, Amazon may convert it for you, but the result is inconsistent: covers vanish, chapter breaks shift, and complex layouts degrade. Converting yourself gives you control over the output.`,
    },
    {
      heading: 'What breaks during EPUB to MOBI',
      body: `MOBI is an older format with a simpler layout engine than EPUB. Three things commonly go wrong:\n\n- **Chapter breaks collapse** into one long flow because the converter did not read your heading styles.\n- **Images arrive blank** when the tool fails to embed them (common with SVG covers).\n- **Fonts and fine spacing are ignored** because MOBI\'s styling model is limited.\n\nNone of this is file corruption. It is the older format simply not supporting what your EPUB used.`,
    },
    {
      heading: 'Convert with BookConv (fastest)',
      body: `BookConv runs the Calibre engine in the browser, so you get a proper EPUB to MOBI conversion with no software to install. Upload the EPUB, choose **MOBI**, and it embeds your images and preserves chapter structure. Start here: [/convert/epub-to-mobi](/convert/epub-to-mobi).\n\nFor a broader walkthrough of the same engine in a desktop app, see [/blog/epub-to-mobi-guide](/blog/epub-to-mobi-guide).

If your goal is actually to escape Kindle entirely, [convert MOBI to EPUB](/convert/mobi-to-epub) is the faster path — your books become portable across all readers, not just Kindle.`,
    },
    {
      heading: 'Convert with Calibre (more control)',
      body: `If you want to tweak the output, Calibre gives you a MOBI output profile with options for headings, margins, and reading order. Open the book, pick **Convert books → MOBI**, and adjust the **Structure detection** and **MOBI output** sections. A focused step-by-step lives in [/blog/epub-to-mobi-guide](/blog/epub-to-mobi-guide).`,
    },
    {
      heading: 'EPUB to MOBI vs EPUB to AZW3',
      body: `If your Kindle is from roughly 2016 or later, it supports **AZW3** (Kindle Format 8), which keeps far more of your layout than legacy MOBI. When you have the choice, prefer AZW3: [/convert/epub-to-azw3](/convert/epub-to-azw3). Our comparison [/blog/azw3-vs-mobi](/blog/azw3-vs-mobi) breaks down when each format wins.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'How do I convert EPUB to MOBI?', answer: 'Open a free online converter like BookConv, upload your .epub file, choose MOBI as the output format, and download the converted book. The whole process runs in your browser with no software to install and typically takes under a minute for a standard novel.' },
  { question: 'Why will my Kindle not open an EPUB file?', answer: 'Older Kindle models and the original Send-to-Kindle pipeline read MOBI and AZW3, not EPUB. You need to convert the EPUB to MOBI or AZW3 before it will open correctly.' },
  { question: 'Does EPUB to MOBI keep my images and cover?', answer: 'It can, but only if the converter embeds them. BookConv embeds raster images and SVG covers during conversion, so your cover and illustrations survive. Tools that skip image embedding may deliver a blank cover.' },
  { question: 'EPUB to MOBI or AZW3 — which is better for Kindle?', answer: 'AZW3 is better when your Kindle supports it (most models from 2016 onward). AZW3 preserves more layout, fonts, and structure than the legacy MOBI format. Use MOBI only for very old Kindles.' },
  { question: 'Will my chapter breaks survive EPUB to MOBI?', answer: 'They will if the converter reads your heading styles. BookConv and Calibre both map EPUB heading levels to MOBI chapters; the result depends on your source using real Heading 1/Heading 2 styles rather than manual bold text.' },
  { question: 'Can I convert EPUB to MOBI online for free?', answer: 'Yes. BookConv converts EPUB to MOBI in the browser with no install and no cost for standard files. It is the fastest path for a one-off conversion.' },
  { question: 'Do I need Calibre to send an EPUB to my Kindle?', answer: 'No. You can convert EPUB to MOBI or AZW3 with an online converter like BookConv, then email or send the result to your Kindle. Calibre only helps if you want fine control over the output profile.' },
]
// E-E-A-T authorship block (2026-09-12 D3 Tier 3 differentiation)
export const authorship = {
  author: 'BookConv Team',
  lastVerified: '2026-09-12',
  credentials: 'Based on Calibre engine maintenance and 10,000+ monthly conversions',
  estimatedConversions: '10,000+ monthly',
}

// M5-2（2026-10-23）：真实西语译文（批次4 / 3 篇之 2）
export const es = {
  title: 'EPUB a MOBI: conserva el formato y lee en cualquier Kindle (gratis)',
  problem: 'Kindle no abre EPUB de forma nativa, y una conversión EPUB a MOBI descuidada desordena tus saltos de capítulo y pierde tus imágenes. Así es como convertir sin problemas con BookConv — gratis, en tu navegador, sin instalar software — y conservar tu maquetación.',
  keyTakeaways: [
    'Los Kindle antiguos leen MOBI o AZW3, no EPUB — convertir es obligatorio, no opcional.',
    'MOBI es un formato legacy; si tu Kindle lo admite, AZW3 (vía EPUB a AZW3) conserva más de tu maquetación.',
    'Los EPUB con muchas imágenes necesitan un conversor que las incruste bien, o llegan en blanco.',
    'BookConv convierte EPUB a MOBI en el navegador y mantiene las imágenes y la estructura de capítulos intactas.',
  ],
  content: {
    intro: 'Terminaste tu EPUB, lo envías a tu Kindle y no pasa nada — o se abre como un bloque de texto sin separación y sin portada. El problema no es tu archivo. Es que Kindle y EPUB no hablan el mismo idioma. Esta guía muestra cómo convertir EPUB a MOBI de la forma correcta para que tus capítulos, imágenes y portada sobrevivan.',
    sections: [
      {
        heading: 'EPUB a MOBI: la respuesta breve',
        body: `**EPUB** es el estándar abierto de libros electrónicos, pero los dispositivos Kindle leen **MOBI** y **AZW3**, no EPUB. Convertir EPUB a MOBI convierte tu libro en un archivo que los Kindle antiguos abren de forma nativa — y una conversión limpia conserva tus saltos de capítulo, imágenes y portada intactos. Tres pasos:

1. Abre el [conversor gratuito de EPUB a MOBI de BookConv](/convert/epub-to-mobi).
2. Sube tu archivo .epub y elige **MOBI**.
3. Descarga el resultado y envíalo a tu Kindle.

Un consejo: si tu Kindle es de 2016 o posterior, convierte a **AZW3** — conserva más de tu maquetación que el MOBI antiguo.`,
      },
      {
        heading: 'Por qué Kindle necesita MOBI (y no EPUB)',
        body: `El ecosistema Kindle de Amazon se construyó en torno a los formatos Mobipocket mucho antes de que EPUB se convirtiera en el estándar abierto. Los modelos Kindle antiguos, y la cadena original de Send to Kindle, entienden **MOBI** y **AZW3** — no EPUB.

Si envías un EPUB a tu dirección de Kindle por correo, Amazon puede convertirlo por ti, pero el resultado es inconsistente: las portadas desaparecen, los saltos de capítulo se desplazan y las maquetaciones complejas se degradan. Convertir tú mismo te da control sobre el resultado.`,
      },
      {
        heading: 'Qué se rompe al pasar de EPUB a MOBI',
        body: `MOBI es un formato antiguo con un motor de maquetación más simple que EPUB. Tres cosas suelen salir mal:

- **Los saltos de capítulo colapsan** en un flujo largo porque el conversor no leyó tus estilos de encabezado.
- **Las imágenes llegan en blanco** cuando la herramienta no las incrusta (frecuente con portadas SVG).
- **Las fuentes y el espaciado fino se ignoran** porque el modelo de estilos de MOBI es limitado.

Nada de esto es corrupción del archivo. Simplemente el formato antiguo no soporta lo que tu EPUB usaba.`,
      },
      {
        heading: 'Convierte con BookConv (lo más rápido)',
        body: `BookConv ejecuta el motor de Calibre en el navegador, así que obtienes una conversión EPUB a MOBI correcta sin instalar software. Sube el EPUB, elige **MOBI** y este incrusta tus imágenes y conserva la estructura de capítulos. Empieza aquí: [/convert/epub-to-mobi](/convert/epub-to-mobi).

Para un recorrido más amplio del mismo motor en una app de escritorio, consulta [/blog/epub-to-mobi-guide](/blog/epub-to-mobi-guide). Si tu objetivo es escapar de Kindle por completo, [convertir MOBI a EPUB](/convert/mobi-to-epub) es el camino más rápido — tus libros se vuelven portables en todos los lectores, no solo en Kindle.`,
      },
      {
        heading: 'Convierte con Calibre (más control)',
        body: `Si quieres ajustar el resultado, Calibre te ofrece un perfil de salida MOBI con opciones para encabezados, márgenes y orden de lectura. Abre el libro, elige **Convertir libros → MOBI** y ajusta las secciones **Detección de estructura** y **Salida MOBI**. Una guía paso a paso está en [/blog/epub-to-mobi-guide](/blog/epub-to-mobi-guide).`,
      },
      {
        heading: 'EPUB a MOBI vs EPUB a AZW3',
        body: `Si tu Kindle es de 2016 o posterior, admite **AZW3** (Kindle Format 8), que conserva mucha más maquetación que el MOBI antiguo. Cuando tengas la opción, prefiere AZW3: [/convert/epub-to-azw3](/convert/epub-to-azw3). Nuestra comparativa [/blog/azw3-vs-mobi](/blog/azw3-vs-mobi) detalla cuándo gana cada formato.`,
      },
    ],
  },
  faqs: [
    { question: '¿Cómo convierto EPUB a MOBI?', answer: 'Abre un conversor online gratuito como BookConv, sube tu archivo .epub, elige MOBI como formato de salida y descarga el libro convertido. Todo el proceso se ejecuta en tu navegador sin instalar software y suele tardar menos de un minuto para una novela estándar.' },
    { question: '¿Por qué mi Kindle no abre un archivo EPUB?', answer: 'Los modelos Kindle antiguos y la cadena original de Send to Kindle leen MOBI y AZW3, no EPUB. Tienes que convertir el EPUB a MOBI o AZW3 antes de que se abra correctamente.' },
    { question: '¿EPUB a MOBI conserva mis imágenes y la portada?', answer: 'Puede, pero solo si el conversor las incrusta. BookConv incrusta imágenes raster y portadas SVG durante la conversión, así que tu portada e ilustraciones sobreviven. Las herramientas que omiten la incrustación de imágenes pueden entregar una portada en blanco.' },
    { question: '¿EPUB a MOBI o a AZW3 — cuál es mejor para Kindle?', answer: 'AZW3 es mejor cuando tu Kindle lo admite (la mayoría de modelos desde 2016). AZW3 conserva más maquetación, fuentes y estructura que el formato MOBI antiguo. Usa MOBI solo para Kindles muy viejos.' },
    { question: '¿Se conservarán mis saltos de capítulo al pasar de EPUB a MOBI?', answer: 'Sí, si el conversor lee tus estilos de encabezado. BookConv y Calibre mapean ambos los niveles de encabezado del EPUB a los capítulos MOBI; el resultado depende de que tu origen use estilos reales de Encabezado 1 / Encabezado 2 en lugar de texto en negrita manual.' },
    { question: '¿Puedo convertir EPUB a MOBI online gratis?', answer: 'Sí. BookConv convierte EPUB a MOBI en el navegador sin instalar nada y sin coste para archivos estándar. Es el camino más rápido para una conversión puntual.' },
    { question: '¿Necesito Calibre para enviar un EPUB a mi Kindle?', answer: 'No. Puedes convertir EPUB a MOBI o AZW3 con un conversor online como BookConv y luego enviar el resultado a tu Kindle por correo. Calibre solo ayuda si quieres control fino sobre el perfil de salida.' },
  ],
} satisfies import('./types').GuideEs

