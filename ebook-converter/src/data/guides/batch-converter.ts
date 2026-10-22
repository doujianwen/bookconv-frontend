import { BlogFaq } from '../blog/types'

export const slug = 'batch-converter'
export const title = 'BookConv Batch Converter: Convert Many Files at Once in Your Browser'
export const metaTitle = 'BookConv Batch Converter: Convert Files in Browser'
export const problem = 'Need to convert a stack of ebooks at once? Here is the honest split — BookConv now handles batches in the browser, and Calibre CLI is still the stronger fit for hundreds of files.'
export const date = '2026-08-07'
export const updatedAt = '2026-10-22'
export const tags = ['batch ebook converter', 'bulk convert', 'calibre cli', 'automate']
export const keyTakeaways = [
  'BookConv batch conversion is free during open beta — upload several files (up to 20 for local formats) and download a ZIP of results.',
  'Batch conversion is free while BookConv is in open beta; the single-file converter stays free for occasional jobs.',
  'For hundreds of files or recurring bulk work, Calibre’s command line is still the stronger fit.',
  'Every batch file converts to the target format you pick, with no software install.',
]
export const formats = { source: 'epub', target: 'pdf' }
export const content = {
  intro: 'A “batch ebook converter” turns a pile of files into a pile of converted files in one run. BookConv now does this in the browser: upload several ebooks, pick one target format, and download everything as a single ZIP. During open beta, batch is free — local formats (EPUB → ZIP, EPUB → TXT) accept up to 20 files, while other formats are limited to a few per batch because they use a metered conversion service. This page shows how BookConv batch works, where it fits, and when a local tool like Calibre is still the better call.',
  sections: [
    {
      heading: 'How batch conversion works in BookConv',
      body: `BookConv’s batch tool runs in your browser:\n\n- **Upload several files** of a supported format (up to 20 for local formats; a few for metered ones).\n- **Pick one target format** — every file converts to it.\n- **Download a ZIP** of the converted ebooks when the run finishes.\n\nEach file is sent through BookConv’s conversion API and packaged locally, so there is no separate batch server to wait on. Open it here: [BookConv Batch Converter](/batch).`,
    },
    {
      heading: 'When BookConv batch is the right call',
      body: `BookConv batch fits when:\n\n- You have **a stack of files** to convert in one go (up to 20 for local formats).\n- You want **no install** and a result in minutes.\n- You are **prepping files** for Kindle or AI ingestion.\n\nFor those jobs, scripting a local tool is overkill. Try a single conversion first: [Mobi to EPUB](/convert/mobi-to-epub).`,
    },
    {
      heading: 'When Calibre’s command line is stronger',
      body: `For real bulk work, Calibre’s ebook-convert command (part of the desktop install) still wins:\n\n- It processes **folders of hundreds** of files.\n- It **automates** recurring jobs with a script or folder watch.\n- The work stays **fully offline**.\n\nFor large volumes, a local tool gives you scale and offline control that a browser upload cannot match.`,
    },
    {
      heading: 'A practical decision rule',
      body: `**A few files (up to 20 for local formats):** use [BookConv Batch](/batch), no setup.\n\n**Hundreds of files, recurring:** script Calibre’s command line.\n\n**Sensitive manuscripts in bulk:** Calibre offline — keep the files on your machine.\n\nMatch the tool to the volume; BookConv batch covers the everyday pile, Calibre covers the warehouse.`,
    },
    {
      heading: 'How the options compare',
      body: `When you are converting more than one file, three tools come up. Here is the honest split:

| | BookConv batch | Calibre CLI | CloudConvert |
|---|---|---|---|
| Install | None — runs in the browser | Desktop app required | None — web app |
| Cost | Free during open beta | Free, open source | Metered; free tier has tight limits |
| Files per run | Up to 20 for local formats | Folders of hundreds | Varies by plan |
| Offline | No (server-side) | Yes, fully offline | No (server-side) |
| Best for | The everyday pile | Recurring bulk and privacy | Mixed-format work beyond ebooks |

For most people, BookConv batch covers the pile of files you actually have today, and Calibre covers the warehouse of hundreds. CloudConvert is worth a look when your batch also includes non-ebook formats. For a deeper look at Calibre-based workflows, see our [Calibre free batch conversion guide](/blog/calibre-free-batch).`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Does BookConv support batch conversion?', answer: 'Yes. BookConv’s batch converter lets you upload several ebooks, choose one target format, and download the converted files as a single ZIP. It is free while BookConv is in open beta.' },
  { question: 'How many files can I convert in a batch?', answer: 'It depends on the format: local formats (EPUB → ZIP, EPUB → TXT) accept up to 20 files, while other formats are limited to a few per batch during the free beta. Every file can be up to 4 MB.' },
  { question: 'How do I batch convert ebooks for free?', answer: 'BookConv batch conversion is free during open beta. For very large free bulk work beyond the per-batch limits, Calibre’s command-line tools on your machine are a strong alternative.' },
  { question: 'Can I automate ebook conversion?', answer: 'BookConv batch handles a one-time pile of up to 20 files in the browser. For recurring automation over many files, Calibre’s command-line tools let you script conversions.' },
  { question: 'What formats can I batch convert?', answer: 'The same formats as the single-file converter — EPUB, PDF, MOBI, AZW3, TXT, DOCX, RTF, FB2, DJVU and more — with every file in the batch converting to the target format you choose.' },
  { question: 'Is there a free CloudConvert alternative for batch ebook conversion?', answer: 'Yes. BookConv batch conversion is free during open beta and handles up to 20 files per run for local formats, with no account needed. CloudConvert also batches files but is metered with tighter free-tier limits, so BookConv is the lighter choice for everyday ebook batches.' },
]
// E-E-A-T authorship block (2026-09-12 D3 Tier 3 differentiation)
export const authorship = {
  author: 'BookConv Team',
  lastVerified: '2026-09-12',
  credentials: 'Based on Calibre engine maintenance and 10,000+ monthly conversions',
  estimatedConversions: '10,000+ monthly',
}

// M5-2 批次3（2026-10-22）：真实西语译文（人工审稿批次 3/10）
export const es = {
  title: 'Conversor por lotes de BookConv: convierte muchos archivos a la vez en tu navegador',
  problem: '¿Necesitas convertir una pila de ebooks de una vez? Este es el reparto honesto: BookConv ya gestiona lotes en el navegador, y la línea de comandos de Calibre sigue siendo la mejor opción para cientos de archivos.',
  keyTakeaways: [
    'La conversión por lotes de BookConv es gratuita durante la beta abierta: sube varios archivos (hasta 20 para formatos locales) y descarga un ZIP con los resultados.',
    'La conversión por lotes es gratuita mientras BookConv esté en beta abierta; el conversor de un solo archivo sigue siendo gratuito para trabajos puntuales.',
    'Para cientos de archivos o trabajo masivo recurrente, la línea de comandos de Calibre sigue siendo la mejor opción.',
    'Cada archivo del lote se convierte al formato de destino que elijas, sin instalar software.',
  ],
  content: {
    intro: 'Un "conversor de ebooks por lotes" convierte un montón de archivos en un montón de archivos convertidos en una sola pasada. BookConv ya lo hace en el navegador: sube varios ebooks, elige un formato de destino y descarga todo como un único ZIP. Durante la beta abierta, los lotes son gratuitos: los formatos locales (EPUB → ZIP, EPUB → TXT) admiten hasta 20 archivos, mientras que otros formatos se limitan a unos pocos por lote porque usan un servicio de conversión de consumo medido. Esta página muestra cómo funciona el lote de BookConv, dónde encaja y cuándo una herramienta local como Calibre sigue siendo la mejor opción.',
    sections: [
      {
        heading: 'Cómo funciona la conversión por lotes en BookConv',
        body: `La herramienta de lotes de BookConv funciona en tu navegador:\n\n- **Sube varios archivos** de un formato admitido (hasta 20 para formatos locales; unos pocos para los de consumo medido).\n- **Elige un formato de destino**: todos los archivos se convierten a él.\n- **Descarga un ZIP** con los ebooks convertidos al terminar la pasada.\n\nCada archivo pasa por la API de conversión de BookConv y se empaqueta localmente, así que no hay un servidor de lotes independiente al que esperar. Ábrelo aquí: [Conversor por lotes de BookConv](/batch).`,
      },
      {
        heading: 'Cuándo el lote de BookConv es la opción correcta',
        body: `El lote de BookConv encaja cuando:\n\n- Tienes **una pila de archivos** que convertir de una vez (hasta 20 para formatos locales).\n- Quieres **sin instalación** y un resultado en minutos.\n- Estás **preparando archivos** para Kindle o para su ingestión por IA.\n\nPara esos trabajos, scriptear una herramienta local es excesivo. Prueba primero una conversión individual: [MOBI a EPUB](/convert/mobi-to-epub).`,
      },
      {
        heading: 'Cuándo la línea de comandos de Calibre es más fuerte',
        body: `Para trabajo masivo de verdad, el comando ebook-convert de Calibre (parte de la instalación de escritorio) sigue ganando:\n\n- Procesa **carpetas con cientos** de archivos.\n- **Automatiza** trabajos recurrentes con un script o una carpeta vigilada.\n- El trabajo permanece **completamente sin conexión**.\n\nPara grandes volúmenes, una herramienta local te da escala y control sin conexión que una subida desde el navegador no puede igualar.`,
      },
      {
        heading: 'Una regla de decisión práctica',
        body: `**Unos pocos archivos (hasta 20 para formatos locales):** usa [el lote de BookConv](/batch), sin configuración.\n\n**Cientos de archivos, recurrentes:** scriptea la línea de comandos de Calibre.\n\n**Manuscritos sensibles en masa:** Calibre sin conexión: mantén los archivos en tu máquina.\n\nAjusta la herramienta al volumen: el lote de BookConv cubre la pila del día a día y Calibre cubre el almacén.`,
      },
      {
        heading: 'Cómo se comparan las opciones',
        body: `Cuando conviertes más de un archivo, aparecen tres herramientas. Este es el reparto honesto:\n\n| | Lote de BookConv | CLI de Calibre | CloudConvert |\n|---|---|---|---|\n| Instalación | Ninguna: va en el navegador | Requiere app de escritorio | Ninguna: app web |\n| Coste | Gratis durante la beta abierta | Gratis, código abierto | Consumo medido; el plan gratuito tiene límites ajustados |\n| Archivos por pasada | Hasta 20 para formatos locales | Carpetas de cientos | Varía según el plan |\n| Sin conexión | No (lado servidor) | Sí, completamente | No (lado servidor) |\n| Mejor para | La pila del día a día | Masa recurrente y privacidad | Trabajo de formatos mixtos más allá de los ebooks |\n\nPara la mayoría, el lote de BookConv cubre la pila de archivos que realmente tienes hoy, y Calibre cubre el almacén de cientos. CloudConvert merece una mirada cuando tu lote también incluye formatos que no son de ebooks. Para un análisis más profundo de los flujos basados en Calibre, consulta nuestra [guía de conversión por lotes gratuita con Calibre](/blog/calibre-free-batch).`,
      },
    ],
  },
  faqs: [
    { question: '¿BookConv admite la conversión por lotes?', answer: 'Sí. El conversor por lotes de BookConv te permite subir varios ebooks, elegir un formato de destino y descargar los archivos convertidos como un único ZIP. Es gratuito mientras BookConv esté en beta abierta.' },
    { question: '¿Cuántos archivos puedo convertir en un lote?', answer: 'Depende del formato: los formatos locales (EPUB → ZIP, EPUB → TXT) admiten hasta 20 archivos, mientras que otros formatos se limitan a unos pocos por lote durante la beta gratuita. Cada archivo puede pesar hasta 4 MB.' },
    { question: '¿Cómo convierto ebooks por lotes gratis?', answer: 'La conversión por lotes de BookConv es gratuita durante la beta abierta. Para trabajo masivo gratuito muy grande, más allá de los límites por lote, las herramientas de línea de comandos de Calibre en tu máquina son una buena alternativa.' },
    { question: '¿Puedo automatizar la conversión de ebooks?', answer: 'El lote de BookConv gestiona una pila puntual de hasta 20 archivos en el navegador. Para una automatización recurrente sobre muchos archivos, las herramientas de línea de comandos de Calibre te permiten scriptear las conversiones.' },
    { question: '¿Qué formatos puedo convertir por lotes?', answer: 'Los mismos que el conversor de un solo archivo: EPUB, PDF, MOBI, AZW3, TXT, DOCX, RTF, FB2, DJVU y más, con cada archivo del lote convirtiéndose al formato de destino que elijas.' },
    { question: '¿Hay una alternativa gratuita a CloudConvert para la conversión de ebooks por lotes?', answer: 'Sí. La conversión por lotes de BookConv es gratuita durante la beta abierta y gestiona hasta 20 archivos por pasada para formatos locales, sin necesidad de cuenta. CloudConvert también procesa lotes, pero con consumo medido y límites más ajustados en el plan gratuito, así que BookConv es la opción más ligera para lotes de ebooks del día a día.' },
  ],
} satisfies import('./types').GuideEs

