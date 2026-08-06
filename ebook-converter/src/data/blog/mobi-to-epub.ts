export const slug = `mobi-to-epub`;
export const title = `How to Convert MOBI to EPUB (And Why You'd Want To)`;
export const date = `2026-08-02`;
export const author = "BookConv Team";
export const tags = ["MOBI", "EPUB", "Kindle", "Kobo", "BookConv", "conversion", "guide"];

export const content = {
  intro: `Sitting on a pile of old .mobi files that only open on a Kindle? MOBI is Amazon's legacy format, and most non-Kindle readers — Kobo, Apple Books, Google Play Books — won't touch it. Converting MOBI to EPUB frees your books to read anywhere, because EPUB is the open standard nearly every device supports. This guide covers the quick conversion and what actually moves across.`,
  sections: [
    {
      heading: `Why Move MOBI to EPUB`,
      body: `MOBI came out of Mobipocket, which Amazon bought in 2007 and then moved past. The practical consequences today:

- **EPUB reads everywhere.** Kobo, Apple Books, Google Play Books, and most phone apps use EPUB. MOBI doesn't.
- **EPUB is the open standard.** No single company controls it, so your file isn't tied to one ecosystem.
- **Amazon itself moved on.** Send to Kindle stopped accepting MOBI uploads in August 2022. EPUB is what Amazon takes now.

So a MOBI you converted to EPUB is simply more useful — the same book, readable on more devices, and future-proofed against the next format sunset.`
    },
    {
      heading: `Convert MOBI to EPUB on BookConv in Three Steps`,
      body: `1. Open the [MOBI to EPUB converter](/convert/mobi-to-epub) and drop your .mobi onto the upload area.
2. BookConv reads the MOBI, extracts the text, images, and structure, and re-packages them as a standards-compliant EPUB.
3. Download the .epub and open it anywhere.

The free tier handles files up to 10 MB. Older MOBI files are usually small, so most convert without hitting a limit.

### Two things to know before you upload

- **Download links are temporary.** Converted files are deleted after a period, so save the .epub to your device right after the progress bar finishes.
- **DRM-protected MOBI is rejected.** If the file came from a retailer with encryption, no converter can read it. DRM-free personal MOBI files convert fine.`
    },
    {
      heading: `What Transfers and What Doesn't`,
      body: `MOBI is a stripped-down format, so a converted EPUB is usually an upgrade:

**Comes across**
- Body text and paragraphs
- Embedded images, placed near their original position
- Chapter structure, when the source MOBI carried a proper navigation record
- Basic bold and italic styling

**May need attention**
- MOBI's styling was limited, so there's often little formatting to preserve in the first place — the EPUB will look cleaner, not worse
- Some very old Mobipocket files lack a real table of contents; the converter builds one from headings when it can
- Series metadata MOBI faked by folding the series name into the title stays folded unless you clean it up

Because EPUB supports far more CSS than MOBI, the destination is the more capable format. The constraint is whatever the source MOBI held.`
    },
    {
      heading: `MOBI to EPUB vs Just Using Send to Kindle`,
      body: `If your only goal is reading on a Kindle, Send to Kindle accepts EPUB directly and converts it in the cloud. But that keeps you inside Amazon's ecosystem and uploads your file to their servers.

Convert to EPUB on BookConv when you want the book to:
- **Read on a Kobo, iPhone, or Android** app, not just a Kindle
- **Stay local** — no Amazon account, no cloud upload
- **Live in an open format** you can re-convert later (for example onward to [EPUB to AZW3](/convert/epub-to-azw3) for native Kindle sideloading)

If you're deciding which Kindle format to standardize on, [AZW3 vs MOBI](/blog/azw3-vs-mobi) breaks down the trade-offs, and [Ebook formats explained](/blog/ebook-formats-explained) covers the full landscape.`
    },
    {
      heading: `Dealing With Old or Locked MOBI Files`,
      body: `Two edge cases come up:

- **DRM-locked MOBI.** Retail purchases and library loans are encrypted. They're rejected at upload because no converter can read encrypted content. You'd need to read them in the app they were licensed for.
- **Very old Mobipocket files.** Some predate modern Kindle features and carry minimal metadata. The text converts fine; you may just want to fix the title and author in the EPUB afterward.

Neither is a blocker for the typical personal library of DRM-free MOBI books.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **EPUB reads everywhere; MOBI mostly reads only on Kindle.** Converting frees your books.
- **Three steps on BookConv.** Upload, convert, download — no install, no account, 10 MB free tier.
- **The destination is the better format.** EPUB supports more than MOBI, so output is rarely worse.
- **DRM is rejected.** Owned, DRM-free MOBI files convert; locked retail or library files don't.
- **Save immediately.** Download links are temporary and files are deleted after a period.`
    }
  ]
};

export const faqs = [
  {
    question: `Why would I convert MOBI to EPUB instead of keeping MOBI?`,
    answer: `Because EPUB is the open standard that Kobo, Apple Books, Google Play Books, and most apps support, while MOBI is Amazon's legacy format. Converting makes the same book readable on far more devices.`,
  },
  {
    question: `Will I lose quality converting from MOBI to EPUB?`,
    answer: `Almost never. MOBI is the more limited format, so the EPUB destination usually looks cleaner. Text, images, and chapter structure carry over; only DRM-locked files are rejected.`,
  },
  {
    question: `Can I open the EPUB on my Kindle after this?`,
    answer: `Yes. Send to Kindle accepts EPUB directly, or you can convert the EPUB onward to AZW3 for native sideloading. Either way the book stays readable on Kindle.`,
  },
  {
    question: `Why was my MOBI file rejected?`,
    answer: `Two usual causes: it's DRM-protected (encrypted retail or library files no converter can read), or it exceeds your tier's size limit — 10 MB on the free tier. Most old MOBI files are well under that.`,
  },
  {
    question: `Does Amazon still accept MOBI through Send to Kindle?`,
    answer: `No. Amazon stopped accepting MOBI uploads through Send to Kindle in August 2022. It takes EPUB now, which is one more reason to keep your library in EPUB.`,
  }
];

export const es = {
  title: `MOBI to EPUB: cómo convertir y por qué conviene`,
  content: {
    intro: `¿Tienes un montón de archivos .mobi viejos que solo abren en un Kindle? MOBI es el formato heredado de Amazon, y la mayoría de los lectores que no son Kindle — Kobo, Apple Books, Google Play Books — no lo tocan. Convertir MOBI a EPUB libera tus libros para leerlos en cualquier parte, porque EPUB es el estándar abierto que casi todos los dispositivos soportan. Esta guía cubre la conversión rápida y qué es lo que realmente se traslada.`,
    sections: [
      {
        heading: `Por qué pasar MOBI a EPUB`,
        body: `MOBI salió de Mobipocket, que Amazon compró en 2007 y luego dejó atrás. Las consecuencias prácticas hoy:

- **EPUB se lee en todas partes.** Kobo, Apple Books, Google Play Books y la mayoría de las apps de móvil usan EPUB. MOBI no.
- **EPUB es el estándar abierto.** Ninguna empresa lo controla, así que tu archivo no está atado a un ecosistema.
- **El propio Amazon lo dejó atrás.** Send to Kindle dejó de aceptar subidas MOBI en agosto de 2022. EPUB es lo que Amazon acepta ahora.

Así que un MOBI que convertiste a EPUB es simplemente más útil: el mismo libro, legible en más dispositivos y a salvo frente a la próxima desaparición de un formato.`,
      },
      {
        heading: `Convertir MOBI a EPUB en BookConv en tres pasos`,
        body: `1. Abre el [conversor de MOBI a EPUB](/convert/mobi-to-epub) y suelta tu .mobi en el área de subida.
2. BookConv lee el MOBI, extrae el texto, las imágenes y la estructura, y los reempaqueta como un EPUB conforme al estándar.
3. Descarga el .epub y ábrelo donde quieras.

La capa gratuita maneja archivos de hasta 10 MB. Los archivos MOBI viejos suelen ser pequeños, así que la mayoría convierten sin llegar al límite.

### Dos cosas que saber antes de subir

- **Los enlaces de descarga son temporales.** Los archivos convertidos se borran tras un tiempo, así que guarda el .epub en tu dispositivo en cuanto termine la barra de progreso.
- **El MOBI con DRM se rechaza.** Si el archivo viene de una tienda con cifrado, ningún conversor puede leerlo. Los archivos MOBI personales sin DRM convierten sin problema.`,
      },
      {
        heading: `Qué se traslada y qué no`,
        body: `MOBI es un formato recortado, así que un EPUB convertido suele ser una mejora:

**Se conserva**
- Texto y párrafos del cuerpo
- Imágenes embebidas, cerca de su posición original
- Estructura de capítulos, cuando el MOBI de origen llevaba un registro de navegación correcto
- Estilos básicos de negrita y cursiva

**Puede requerir atención**
- El estilo de MOBI era limitado, así que a menudo hay poco formato que preservar desde el principio — el EPUB se verá más limpio, no peor
- Algunos archivos Mobipocket muy viejos no tienen una tabla de contenidos real; el conversor construye una a partir de los encabezados cuando puede
- Los metadatos de serie que MOBI fingía doblando el nombre de la serie en el título siguen doblados salvo que los limpies

Como EPUB soporta mucho más CSS que MOBI, el destino es el formato más capaz. El límite es lo que el MOBI de origen trajera.`,
      },
      {
        heading: `MOBI a EPUB vs simplemente usar Send to Kindle`,
        body: `Si tu único objetivo es leer en un Kindle, Send to Kindle acepta EPUB directamente y lo convierte en la nube. Pero eso te mantiene dentro del ecosistema de Amazon y sube tu archivo a sus servidores.

Convierte a EPUB en BookConv cuando quieras que el libro:
- **Se lea en una app de Kobo, iPhone o Android**, no solo en un Kindle
- **Permanezca local** — sin cuenta de Amazon, sin subida a la nube
- **Viva en un formato abierto** que puedas volver a convertir luego (por ejemplo hacia [EPUB to AZW3](/convert/epub-to-azw3) para la carga nativa en Kindle)

Si estás decidiendo qué formato Kindle estandarizar, [AZW3 vs MOBI](/blog/azw3-vs-mobi) desglosa los pros y contras, y [Formatos de ebook explicados](/blog/ebook-formats-explained) cubre el panorama completo.`,
      },
      {
        heading: `Lidiar con archivos MOBI viejos o bloqueados`,
        body: `Aparecen dos casos límite:

- **MOBI con DRM.** Las compras en tiendas y los préstamos de biblioteca están cifrados. Se rechazan al subir porque ningún conversor puede leer contenido cifrado. Necesitarías leerlos en la app para la que se licenciaron.
- **Archivos Mobipocket muy viejos.** Algunos preceden a las funciones modernas de Kindle y llevan metadatos mínimos. El texto convierte bien; solo puede que quieras corregir el título y el autor en el EPUB después.

Ninguno de los dos bloquea la biblioteca personal típica de libros MOBI sin DRM.`,
      },
      {
        heading: `Puntos clave`,
        body: `- **EPUB se lee en todas partes; MOBI solo lee casi solo en Kindle.** Convertir libera tus libros.
- **Tres pasos en BookConv.** Sube, convierte, descarga — sin instalar, sin cuenta, 10 MB en la capa gratuita.
- **El destino es el mejor formato.** EPUB soporta más que MOBI, así que la salida rara vez es peor.
- **El DRM se rechaza.** Los archivos MOBI propios sin DRM convierten; los de tienda o biblioteca bloqueados no.
- **Guarda de inmediato.** Los enlaces de descarga son temporales y los archivos se borran tras un tiempo.`,
      },
    ],
  },
  faqs: [
    {
      question: `¿Por qué convertir MOBI a EPUB en vez de mantener MOBI?`,
      answer: `Porque EPUB es el estándar abierto que soportan Kobo, Apple Books, Google Play Books y la mayoría de las apps, mientras que MOBI es el formato heredado de Amazon. Convertir hace que el mismo libro sea legible en muchos más dispositivos.`,
    },
    {
      question: `¿Perderé calidad al convertir de MOBI a EPUB?`,
      answer: `Casi nunca. MOBI es el formato más limitado, así que el destino EPUB suele verse más limpio. El texto, las imágenes y la estructura de capítulos se conservan; solo se rechazan los archivos con DRM.`,
    },
    {
      question: `¿Puedo abrir el EPUB en mi Kindle después?`,
      answer: `Sí. Send to Kindle acepta EPUB directamente, o puedes convertir el EPUB hacia AZW3 para la carga nativa. En cualquier caso el libro sigue siendo legible en Kindle.`,
    },
    {
      question: `¿Por qué se rechazó mi archivo MOBI?`,
      answer: `Dos causas habituales: tiene DRM (archivos de tienda o biblioteca cifrados que ningún conversor puede leer), o supera el límite de tamaño de tu nivel — 10 MB en la capa gratuita. La mayoría de los MOBI viejos están muy por debajo.`,
    },
    {
      question: `¿Amazon sigue aceptando MOBI en Send to Kindle?`,
      answer: `No. Amazon dejó de aceptar subidas MOBI por Send to Kindle en agosto de 2022. Ahora toma EPUB, que es otra razón para mantener tu biblioteca en EPUB.`,
    },
  ],
};
