export const slug = "why-convert-lit-to-epub"
export const title = 'Why Convert LIT to EPUB (And How to Do It on BookConv)';
export const date = '2026-07-12';
export const author = 'BookConv Team';
export const tags = ['LIT', 'EPUB', 'Microsoft Reader', 'BookConv', 'Ebook Conversion', 'Archiving'];

export const content = {
  intro: `LIT is Microsoft Reader's ebook format, and Microsoft shut that app down more than a decade ago. Converting LIT to EPUB is the only practical way to keep those books readable. You can do it online with BookConv in under a minute, or use Calibre if you need to batch hundreds of files at once.`,
  sections: [
    {
      heading: `What LIT Is, and Why It Stopped Working`,
      body: `LIT arrived with Microsoft Reader in 2000, back when reading a novel on a Pocket PC felt like the future. The format is essentially a compressed bundle of HTML and images wrapped in Microsoft's own container, frequently with DRM attached.

Microsoft announced the end of Microsoft Reader in 2011 and retired it for good in 2012. There was no successor app, no migration tool, and no official reader for modern Windows.

So a LIT file today is a book you own and can't open. It isn't corrupted or deleted. It's just locked inside a format nothing supports anymore.

**What you're dealing with technically:**
- A proprietary container holding HTML, CSS, and images
- Optional DRM tied to an account system that no longer authorizes anything
- Reader-specific extras like ClearType rendering that don't exist elsewhere
- Windows-only playback through software you can't legitimately install today

Before you plan anything, check whether your files came from a store. Purchased LIT books often carry DRM, and that changes what's possible.`
    },
    {
      heading: `What You Gain by Moving to EPUB`,
      body: `EPUB is the open standard that replaced formats like LIT across publishing. It's documented publicly, maintained publicly, and supported by nearly every reader that isn't a Kindle.

**Compatibility** — Apple Books, Kobo, Nook, Google Play Books, Thorium, Calibre's viewer, and plenty of phone apps open EPUB with no setup at all.

**Reflowable text** — raise the font size and the text re-wraps. LIT used its own pagination model built for small monochrome screens, and on a modern phone it shows.

**Longevity** — EPUB is a published [open specification](https://www.w3.org/TR/epub-33/), so the files stay readable even if a specific app dies. That's precisely the failure LIT taught everyone to avoid.

**Real navigation** — a well-built EPUB carries a navigation document, so chapter jumps, progress tracking, and search behave the way you'd expect.

And once a book is EPUB, it can become anything else. [Convert EPUB to AZW3](/convert/epub-to-azw3) if your actual reading happens on a Kindle. Or go the other direction and [convert MOBI to EPUB](/convert/mobi-to-epub) to free old Kindle files from Amazon's ecosystem entirely.`
    },
    {
      heading: `Convert LIT to EPUB on BookConv`,
      body: `If you have a handful of LIT files and don't want to install anything, BookConv is the fastest route. The conversion uses the same Calibre engine as the desktop app, but runs in your browser.

### Upload the LIT file
Go to the [LIT to EPUB converter](/convert/lit-to-epub). Drag the file onto the upload area or click to browse. The uploader checks the file size immediately — free conversions accept up to 10MB, which covers almost every LIT novel.

### Check the preview
BookConv reads the metadata and shows the detected title and author before you start. LIT files often have messy metadata, so this is your chance to spot problems before they land in your library.

### Convert and download
Click **Convert**. The Calibre engine runs server-side, unpacks the LIT container, rebuilds the markup as EPUB, and packages the result. When the progress bar finishes, click the download button right away — the link is temporary and the file is removed from the server after it expires.

For a single book or a small rescue job, this is far less work than installing and learning Calibre.`
    },
    {
      heading: `Convert LIT to EPUB with Calibre (Batch Option)`,
      body: `Calibre is the standard desktop tool for this job, and it's free. It shines when you have dozens or hundreds of LIT files to rescue.

1. Install Calibre from the [official download page](https://calibre-ebook.com/download) and open it.
2. Click **Add books** and select your LIT files. A whole folder at once is fine.
3. Highlight the imported titles, then click **Convert books**.
4. Set the output format to **EPUB** using the dropdown in the top-right corner.
5. Open the **Metadata** panel and fix the title and author while you're in there. Old LIT metadata is usually a mess.
6. Click **OK** and wait. A typical novel finishes in seconds.

The converted file lands in Calibre's library folder, so use **Save to disk** to pull it out where you want it. The [Calibre conversion manual](https://manual.calibre-ebook.com/conversion.html) covers structure detection and styling options if a particular book comes out wrong.`
    },
    {
      heading: `What Survives the Conversion, and What Doesn't`,
      body: `Conversion isn't lossless. But LIT was never a rich format, so you lose less than you might fear.

**Usually preserved:**
- Full text and paragraph structure
- Chapter breaks and the table of contents
- Embedded images
- Basic italics, bold, and headings
- Core metadata such as title and author

**Often lost or changed:**
- Fine spacing and indentation, which sometimes needs a cleanup pass
- Footnote links, especially in older or sloppily built files
- Anything DRM-protected, which simply won't convert
- Bookmarks and highlights made inside Microsoft Reader

That last one catches people out. Annotations lived in the Reader app, not in the file, so there's nothing there to carry across.

Open the finished EPUB and skim the first chapter, the table of contents, and one image-heavy page. Two minutes of checking beats finding a broken book six months later.`
    },
    {
      heading: `When It's Worth Doing, and When to Skip It`,
      body: `Convert when the book matters and isn't easy to replace: out-of-print titles, old technical manuals, self-published work, family projects, anything you paid for once and can't buy again.

Skip it when the title is still sold as a clean commercial EPUB for pocket change. A properly produced modern file beats a converted one from 2004 every time.

If you do commit, batch the work. Calibre will chew through hundreds of files in a single job, and doing the whole folder once is far smarter than rediscovering the problem every couple of years.

Then back the results up somewhere sensible. The entire point of this exercise is not having to repeat it. If you're weighing EPUB against Kindle-native formats for your library, our [ebook formats comparison](/blog/ebook-formats-explained) lays out the differences.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **LIT is a dead format** — Microsoft retired the Reader app in 2012, and no current platform opens it.
- **EPUB is the replacement** — open standard, reflowable, and supported by nearly every non-Kindle reader.
- **BookConv handles small jobs fast** — upload, convert, download; no install, no account, powered by Calibre.
- **Calibre handles big libraries** — free, batch-capable, and it lets you fix broken metadata along the way.
- **DRM blocks conversion** — protected LIT files won't convert, and there's no legitimate workaround.
- **Always check the output** — skim a chapter and the table of contents before deleting the originals.`
    }
  ]
};

export const faqs = [
  {
    question: `Can I still install Microsoft Reader on Windows 11?`,
    answer: `No. Microsoft ended distribution in 2012 and the app doesn't run on current Windows. Even if you tracked down an installer, the activation service for DRM-protected books is long gone.`,
  },
  {
    question: `Is converting my own LIT books legal?`,
    answer: `Converting DRM-free files you own, for your own use, is generally fine. Removing DRM is a separate question and not something we support. Treat protected files as unreadable.`,
  },
  {
    question: `Can I convert LIT to EPUB without installing software?`,
    answer: `Yes. BookConv's [LIT to EPUB converter](/convert/lit-to-epub) runs the Calibre engine in the cloud, so you only need a browser.`,
  },
  {
    question: `Will the book look different after conversion?`,
    answer: `A little. Text, chapters, and images carry over cleanly, while exact spacing and page breaks may shift. EPUB reflows anyway, so fixed pagination was never going to survive the trip.`,
  },
  {
    question: `Can I convert an entire folder at once?`,
    answer: `Yes. Calibre's bulk conversion handles large batches in one run. Online tools generally work file by file, which is fine for a handful.`,
  },
  {
    question: `My converted EPUB has no table of contents. Now what?`,
    answer: `Run the conversion again with Calibre's structure detection pointed at your heading tags. The [Calibre documentation](https://manual.calibre-ebook.com/conversion.html) walks through the XPath settings involved.`,
  },
  {
    question: `Should I convert straight to a Kindle format instead?`,
    answer: `Go to EPUB first. It's the cleanest intermediate format and the better archival copy. Generate a Kindle file from it afterward if you need one.`,
  },
  {
    question: `How can I tell whether a LIT file has DRM?`,
    answer: `If conversion fails or produces an empty file, DRM is the usual culprit. Files shared freely by authors or public archives are typically clean.`,
  }
];

export const es = {
  title: `Por qué convertir LIT a EPUB (y cómo hacerlo en BookConv)`,
  content: {
    intro: `LIT es el formato de ebook de Microsoft Reader, y Microsoft cerró esa app hace más de una década. Convertir LIT a EPUB es la única forma práctica de seguir leyendo esos libros. Puedes hacerlo en línea con BookConv en menos de un minuto, o usar Calibre si necesitas procesar cientos de archivos a la vez.`,
    sections: [
      {
        heading: `Qué es LIT y por qué dejó de funcionar`,
        body: `LIT llegó con Microsoft Reader en 2000, cuando leer una novela en un Pocket PC parecía el futuro. El formato es esencialmente un paquete comprimido de HTML e imágenes envuelto en el contenedor propio de Microsoft, frecuentemente con DRM adjunto.

Microsoft anunció el fin de Microsoft Reader en 2011 y lo retiró definitivamente en 2012. No hubo app sucesora, ni herramienta de migración, ni lector oficial para Windows moderno.

Así que un archivo LIT hoy es un libro que posees y no puedes abrir. No está corrupto ni borrado. Simplemente está encerrado en un formato que nada soporta ya.

**Técnicamente estás ante:**
- Un contenedor propietario que guarda HTML, CSS e imágenes
- DRM opcional atado a un sistema de cuentas que ya no autoriza nada
- Extras propios del lector como el renderizado ClearType que no existen en otro lado
- Reproducción solo en Windows mediante software que hoy no puedes instalar legítimamente

Antes de planear nada, comprueba si tus archivos venían de una tienda. Los libros LIT comprados a menudo llevan DRM, y eso cambia lo que es posible.`,
      },
      {
        heading: `Qué ganas al pasar a EPUB`,
        body: `EPUB es el estándar abierto que reemplazó a formatos como LIT en la edición. Está documentado públicamente, mantenido públicamente y soportado por casi cualquier lector que no sea Kindle.

**Compatibilidad** — Apple Books, Kobo, Nook, Google Play Books, Thorium, el visor de Calibre y muchas apps de teléfono abren EPUB sin configuración.

**Texto refulible** — subes el tamaño de letra y el texto se reformatea. LIT usaba su propio modelo de paginación hecho para pantallas monocromas pequeñas, y en un teléfono moderno se nota.

**Longevidad** — EPUB es una [especificación abierta](https://www.w3.org/TR/epub-33/) publicada, así que los archivos siguen legibles aunque una app concreta desaparezca. Precisamente ese fallo es el que LIT enseñó a todos a evitar.

**Navegación real** — un EPUB bien construido lleva un documento de navegación, así que los saltos de capítulo, el seguimiento de progreso y la búsqueda funcionan como esperas.

Y una vez que un libro es EPUB, puede volverse cualquier otra cosa. [Convierte EPUB a AZW3](/convert/epub-to-azw3) si tu lectura real pasa en un Kindle. O ve al otro sentido y [convierte MOBI a EPUB](/convert/mobi-to-epub) para liberar viejos archivos Kindle del ecosistema de Amazon por completo.`,
      },
      {
        heading: `Convertir LIT a EPUB en BookConv`,
        body: `Si tienes un puñado de archivos LIT y no quieres instalar nada, BookConv es la ruta más rápida. La conversión usa el mismo motor Calibre que la app de escritorio, pero corre en tu navegador.

### Sube el archivo LIT
Ve al [conversor de LIT a EPUB](/convert/lit-to-epub). Arrastra el archivo al área de subida o haz clic para buscarlo. El cargador comprueba el tamaño de inmediato: las conversiones gratis aceptan hasta 10 MB, lo que cubre casi cualquier novela LIT.

### Revisa la vista previa
BookConv lee los metadatos y muestra el título y autor detectados antes de empezar. Los archivos LIT suelen tener metadatos desordenados, así que esta es tu oportunidad de ver problemas antes de que lleguen a tu biblioteca.

### Convierte y descarga
Pulsa **Convertir**. El motor Calibre corre del lado del servidor, desempaqueta el contenedor LIT, reconstruye el marcado como EPUB y empaqueta el resultado. Cuando la barra de progreso termina, pulsa el botón de descarga de inmediato: el enlace es temporal y el archivo se elimina del servidor al caducar.

Para un libro suelto o un rescate pequeño, es mucho menos trabajo que instalar y aprender Calibre.`,
      },
      {
        heading: `Convertir LIT a EPUB con Calibre (lote)`,
        body: `Calibre es la herramienta de escritorio estándar para este trabajo, y es gratis. Brilla cuando tienes decenas o cientos de archivos LIT que rescatar.

1. Instala Calibre desde la [página oficial de descarga](https://calibre-ebook.com/download) y ábrelo.
2. Haz clic en **Añadir libros** y selecciona tus archivos LIT. Toda una carpeta a la vez es válida.
3. Resalta los títulos importados y luego haz clic en **Convertir libros**.
4. Define el formato de salida como **EPUB** con el menú desplegable de la esquina superior derecha.
5. Abre el panel de **Metadatos** y corrige título y autor mientras estás ahí. Los metadatos LIT viejos suelen ser un desastre.
6. Haz clic en **Aceptar** y espera. Una novela típica termina en segundos.

El archivo convertido cae en la carpeta de biblioteca de Calibre, así que usa **Guardar en disco** para sacarlo donde lo quieras. El [manual de conversión de Calibre](https://manual.calibre-ebook.com/conversion.html) cubre la detección de estructura y las opciones de estilo si un libro sale mal.`,
      },
      {
        heading: `Qué sobrevive a la conversión y qué no`,
        body: `La conversión no es sin pérdida. Pero LIT nunca fue un formato rico, así que pierdes menos de lo que temes.

**Normalmente preservado:**
- Texto completo y estructura de párrafos
- Saltos de capítulo y la tabla de contenidos
- Imágenes embebidas
- Cursivas, negritas y encabezados básicos
- Metadatos centrales como título y autor

**A menudo perdido o cambiado:**
- Espaciado e indentación fino, que a veces necesita una pasada de limpieza
- Enlaces de notas al pie, especialmente en archivos viejos o descuidados
- Cualquier cosa con DRM, que simplemente no convertirá
- Marcadores y resaltados hechos dentro de Microsoft Reader

Ese último despista a la gente. Las anotaciones vivían en la app del lector, no en el archivo, así que no hay nada que llevar.

Abre el EPUB terminado y hojea el primer capítulo, la tabla de contenidos y una página cargada de imágenes. Dos minutos de comprobación valen más que encontrar un libro roto seis meses después.`,
      },
      {
        heading: `Cuándo vale la pena y cuándo saltarlo`,
        body: `Convierte cuando el libro importa y no es fácil de reemplazar: títulos agotados, manuales técnicos viejos, obra autopublicada, proyectos familiares, cualquier cosa que pagaste una vez y no puedes comprar de nuevo.

Saltarlo cuando el título se vende todavía como un EPUB comercial limpio por una fracción. Un archivo moderno bien producido supera a uno convertido de 2004 siempre.

Si te decides, haz el lote. Calibre atraviesa cientos de archivos en un solo trabajo, y hacer toda la carpeta de una vez es mucho más inteligente que redescubrir el problema cada par de años.

Luego haz una copia de seguridad en un sitio sensato. Toda la lógica de este ejercicio es no tener que repetirlo. Si estás comparando EPUB con los formatos nativos de Kindle para tu biblioteca, nuestra [comparación de formatos de ebook](/blog/ebook-formats-explained) expone las diferencias.`,
      },
      {
        heading: `Puntos clave`,
        body: `- **LIT es un formato muerto** — Microsoft retiró la app Reader en 2012, y ninguna plataforma actual lo abre.
- **EPUB es el reemplazo** — estándar abierto, refulible y soportado por casi cualquier lector que no sea Kindle.
- **BookConv resuelve los trabajos pequeños rápido** — sube, convierte, descarga; sin instalar, sin cuenta, con Calibre detrás.
- **Calibre maneja grandes bibliotecas** — gratis, capaz de lotes, y te deja corregir metadatos rotos por el camino.
- **El DRM bloquea la conversión** — los archivos LIT protegidos no convertirán, y no hay solución legítima.
- **Siempre comprueba la salida** — hojea un capítulo y la tabla de contenidos antes de borrar los originales.`,
      },
    ],
  },
  faqs: [
    {
      question: `¿Puedo instalar Microsoft Reader en Windows 11?`,
      answer: `No. Microsoft terminó la distribución en 2012 y la app no corre en Windows actual. Aunque encontraras un instalador, el servicio de activación para libros con DRM desapareció hace mucho.`,
    },
    {
      question: `¿Es legal convertir mis propios libros LIT?`,
      answer: `Convertir archivos sin DRM que posees, para tu uso personal, generalmente está bien. Quitar el DRM es otra cuestión y no es algo que apoyemos. Trata los archivos protegidos como ilegibles.`,
    },
    {
      question: `¿Puedo convertir LIT a EPUB sin instalar software?`,
      answer: `Sí. El [conversor de LIT a EPUB](/convert/lit-to-epub) de BookConv corre el motor Calibre en la nube, así solo necesitas un navegador.`,
    },
    {
      question: `¿Se verá diferente el libro tras la conversión?`,
      answer: `Un poco. Texto, capítulos e imágenes pasan limpios, mientras que el espaciado exacto y los saltos de página pueden moverse. EPUB de todos modos refulye, así que la paginación fija nunca iba a sobrevivir al viaje.`,
    },
    {
      question: `¿Puedo convertir una carpeta entera de una vez?`,
      answer: `Sí. La conversión en lote de Calibre maneja grandes lotes en una sola corrida. Las herramientas en línea suelen funcionar archivo por archivo, lo que basta para un puñado.`,
    },
    {
      question: `Mi EPUB convertido no tiene tabla de contenidos. ¿Ahora qué?`,
      answer: `Corre la conversión de nuevo con la detección de estructura de Calibre apuntada a tus etiquetas de encabezado. La [documentación de Calibre](https://manual.calibre-ebook.com/conversion.html) explica los ajustes XPath involucrados.`,
    },
    {
      question: `¿Debo convertir directo a un formato Kindle?`,
      answer: `Ve a EPUB primero. Es el formato intermedio más limpio y la mejor copia de archivo. Genera un archivo Kindle a partir de él después si lo necesitas.`,
    },
    {
      question: `¿Cómo sé si un archivo LIT tiene DRM?`,
      answer: `Si la conversión falla o produce un archivo vacío, el DRM suele ser el culpable. Los archivos compartidos libremente por autores o archivos públicos normalmente están limpios.`,
    },
  ],
};
