export const slug = `how-to-convert-epub-to-mobi`;
export const title = `How to Convert EPUB to MOBI on BookConv (Step-by-Step)`;
export const date = `2026-07-12`;
export const author = "BookConv Team";
export const tags = ["EPUB", "MOBI", "Kindle", "BookConv", "step-by-step"];

export const content = {
  intro: `Want to convert EPUB to MOBI without installing anything? On BookConv the whole job takes under a minute: upload your EPUB, pick MOBI, let the Calibre engine run server-side, then download the file. This walkthrough covers the exact clicks, the checks that catch bad conversions early, and when MOBI is even the right target.`,
  sections: [
    {
      heading: `Do You Actually Need MOBI?`,
      body: `Probably only if you're sideloading to an older Kindle. It's worth confirming before you convert anything.

Kindles from 2012 onward handle AZW3, and current Kindle software reads EPUB directly. Amazon also stopped accepting MOBI through its Send to Kindle service in late 2022, so email delivery is no longer a reason to convert to MOBI.

MOBI still earns its place in three situations:

- **Older hardware** — Kindle Keyboard, Kindle 4 and Kindle Touch era devices that predate AZW3 support
- **USB sideloading** — MOBI files copied into the documents folder still open on most Kindles
- **Mixed libraries** — one format that works across a decade of Kindle hardware without thinking about it

If your device is a recent Paperwhite, Oasis, Scribe or base Kindle, [convert to AZW3 instead](/convert/epub-to-azw3). AZW3 supports real CSS, embedded fonts and better hyphenation, so the same book simply looks nicer.

Worth knowing why EPUB is the safer archive format: it's an open standard maintained by the [W3C](https://www.w3.org/TR/epub-33/), while MOBI is a retired Amazon format. Keep the EPUB, convert copies. For a wider comparison of the two, see our [EPUB to MOBI format guide](/blog/epub-to-mobi-guide).`
    },
    {
      heading: `Step 1: Prepare the EPUB Before Uploading`,
      body: `Ten minutes of prep saves an hour of re-converting. Four things to check.

**Open the EPUB first.** If it won't open in a reader app, converting won't fix it — you'll just get a broken MOBI. Track down a fresh copy of the source instead.

**Check for DRM.** Books bought from most stores carry DRM, and no converter can read them. BookConv flags a DRM-protected file rather than producing a scrambled result. Titles from Project Gutenberg, Standard Ebooks and your own exports are DRM-free and convert without complaint.

**Look at the file size.** Free conversions handle files up to 10MB, which covers nearly every text-only novel. Illustrated books — comics, cookbooks, textbooks — run much larger and need a paid plan, where the ceiling rises to 50MB on Pro and 100MB on the API tier.

**Fix the metadata now.** The title and author fields inside the EPUB become what your Kindle shows on its home screen. If the file says "Unknown Author", your library will too. Calibre's metadata editor sorts this out in a couple of clicks, and it's far less annoying than renaming books on a six-inch screen later.`
    },
    {
      heading: `Step 2: Convert on BookConv`,
      body: `BookConv runs the same [Calibre](https://calibre-ebook.com/) ebook-convert engine you'd use on a desktop, but on our servers, so nothing installs and nothing times out your laptop.

### Upload the EPUB
Open the [EPUB to MOBI converter](/convert/epub-to-mobi). Drag the file onto the upload area, or click to browse. The uploader checks the size immediately and rejects anything over your plan limit with a clear message, so you don't waste time waiting for a job that was never going to run.

### Check the preview
BookConv reads the EPUB metadata and shows you the detected title, author and cover before conversion starts. If the metadata is wrong, stop and fix it in Calibre first — the output can only be as clean as the input.

### Start the conversion
Click **Convert**. Your file joins a server-side job queue, and the page shows a progress bar while the Calibre engine unpacks the EPUB, rewrites the markup for MOBI, re-encodes images and repackages everything. Most novels finish in seconds; image-heavy books take longer.

### Download the result
When the bar completes, the download button appears. Click it immediately — the generated file is served from a temporary link and is removed from the server once the link expires. If the download doesn't start, the [download troubleshooting guide](/blog/download-troubleshooting) walks through the usual browser blockers.

The free tier gives you five conversions per hour with no account required, which is plenty for a small library migration.`
    },
    {
      heading: `Step 3: Verify the MOBI Before You Trust It`,
      body: `A file appearing in your Downloads folder isn't proof the conversion worked. Two minutes of checking is worth it.

**Open it on a computer first.** Calibre's built-in viewer or Amazon's Kindle Previewer renders MOBI much the way a device does, and it's far quicker than copying to hardware and back.

**Then check these four things:**

- **Table of contents** — chapters listed and clickable, not one long blob
- **Chapter breaks** — each chapter starts on a fresh page rather than mid-screen
- **Images** — cover and inline figures render properly, not as grey boxes
- **Special characters** — em dashes, accents and curly quotes look right, not like question marks

**Now sideload it.** Connect the Kindle by USB, copy the MOBI into the documents folder, and eject the device safely rather than pulling the cable. The book should appear on the home screen; if it doesn't, restart the Kindle so it re-indexes, and rename the file to plain letters and numbers if it contains unusual characters.

When formatting looks wrong, the cause is nearly always in the source EPUB rather than the converter. Tidy the EPUB in Calibre, then convert again — same input, same output, every time.`
    },
    {
      heading: `When to Use Desktop Calibre Instead`,
      body: `BookConv is fastest for one-off conversions and jobs on computers where you can't install software. Desktop Calibre wins when you need more control.

Use Calibre directly for:

- **Hundreds of books at once** — batch conversion with custom output profiles
- **Fine styling control** — CSS overrides, custom fonts and per-device profiles
- **Broken sources** — structure detection, XPath-based TOC fixing and metadata repair
- **Offline work** — no upload, no queue, no network dependency

Both tools use the same conversion engine, so the output quality is identical. The difference is convenience versus control.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Legacy only** — convert to MOBI for pre-2012 Kindles you sideload to; otherwise AZW3 or EPUB is the better target
- **Prep pays** — a clean, DRM-free EPUB with correct metadata converts cleanly on the first attempt
- **BookConv is the fastest path** — upload, click Convert, download; the Calibre engine runs server-side with nothing to install
- **Watch the limits** — 10MB free, 50MB Pro, 100MB API; five conversions per hour on the free tier
- **Verify every file** — table of contents, chapter breaks, images and special characters, before deleting the original
- **Save promptly** — download links expire and converted files are deleted from the server afterwards`
    }
  ]
};

export const faqs = [
  {
    question: `Does BookConv really use the same engine as Calibre?`,
    answer: `Yes. The conversion is powered by Calibre's ebook-convert binary running on our servers. The output matches what desktop Calibre would produce for the same input.`,
  },
  {
    question: `Does converting EPUB to MOBI lose any content?`,
    answer: `No text is lost. Words, paragraphs, bold and italic all survive the trip. What does get simplified is complex styling — multi-column layouts, custom fonts and fancy CSS, because MOBI's rendering engine predates most of that.`,
  },
  {
    question: `Why won't my Kindle show the MOBI I just copied over?`,
    answer: `Three usual suspects: the file landed in the root of the drive instead of the documents folder, the device needs a restart to re-index, or the source EPUB was damaged. Open the file in Kindle Previewer on a computer to work out which one it is.`,
  },
  {
    question: `Can I convert a book I bought from a store?`,
    answer: `Not if it carries DRM, and most store purchases do. Converters can't read those files at all. Buying DRM-free where possible — many indie publishers offer it — avoids the problem entirely.`,
  },
  {
    question: `What's the biggest EPUB I can convert for free?`,
    answer: `10MB, which covers virtually every novel. Pro handles up to 50MB and the API plan up to 100MB, which is where illustrated books and textbooks usually land.`,
  },
  {
    question: `MOBI or AZW3 for my Kindle?`,
    answer: `AZW3 for anything made since 2012. It supports proper CSS, embedded fonts and better line breaking, so the reading experience is noticeably better. Save MOBI for genuinely old hardware.`,
  },
  {
    question: `How long does a conversion take on BookConv?`,
    answer: `Seconds for a typical novel. Larger or image-heavy books take longer, and jobs that exceed the server's two-minute limit fail rather than stall, so you'll know quickly either way.`,
  },
  {
    question: `How do I convert a whole shelf of books at once?`,
    answer: `For large libraries, desktop Calibre is the better tool — it does unlimited batches for free. For five or ten books, running them one at a time through the [EPUB to MOBI tool](/convert/epub-to-mobi) is honestly faster than setting up anything else.`,
  }
];

export const es = {
  title: `Cómo convertir EPUB a MOBI en BookConv (paso a paso)`,
  content: {
    intro: `¿Quieres convertir EPUB a MOBI sin instalar nada? En BookConv todo el trabajo lleva menos de un minuto: subes tu EPUB, eliges MOBI, dejas que el motor de Calibre corra en el servidor y descargas el archivo. Este tutorial cubre los clics exactos, las comprobaciones que detectan conversiones fallidas a tiempo y cuándo MOBI es realmente el objetivo correcto.`,
    sections: [
      {
        heading: `¿Realmente necesitas MOBI?`,
        body: `Probablemente solo si vas a cargar el archivo en un Kindle antiguo. Vale la pena confirmarlo antes de convertir nada.

Los Kindle fabricados desde 2012 soportan AZW3, y el software actual de Kindle lee EPUB directamente. Amazon además dejó de aceptar MOBI en su servicio Send to Kindle a finales de 2022, así que el envío por correo ya no es una razón para convertir a MOBI.

MOBI todavía tiene su sitio en tres situaciones:

- **Hardware antiguo** — Kindle Keyboard, Kindle 4 y los Kindle Touch de la era previa al soporte AZW3
- **Carga por USB** — los archivos MOBI copiados en la carpeta documents siguen abriéndose en la mayoría de los Kindle
- **Bibliotecas mezcladas** — un formato que funciona en una década de hardware Kindle sin pensarlo

Si tu dispositivo es un Paperwhite, Oasis, Scribe o Kindle reciente, [convierte a AZW3 en su lugar](/convert/epub-to-azw3). AZW3 soporta CSS real, fuentes embebidas y mejor guionado, así que el mismo libro simplemente se ve mejor.

Vale la pena saber por qué EPUB es el formato de archivo más seguro: es un estándar abierto mantenido por la [W3C](https://www.w3.org/TR/epub-33/), mientras que MOBI es un formato retirado de Amazon. Guarda el EPUB y convierte copias. Para una comparación más amplia de ambos, consulta nuestra [guía de formato EPUB a MOBI](/blog/epub-to-mobi-guide).`,
      },
      {
        heading: `Paso 1: Prepara el EPUB antes de subirlo`,
        body: `Diez minutos de preparación ahorran una hora de reconversiones. Cuatro cosas que comprobar.

**Abre el EPUB primero.** Si no se abre en una app de lectura, convertir no lo arreglará: solo obtendrás un MOBI roto. Busca una copia nueva de la fuente.

**Comprueba si tiene DRM.** Los libros comprados en la mayoría de las tiendas llevan DRM, y ningún conversor puede leerlos. BookConv marca un archivo protegido con DRM en lugar de producir un resultado ilegible. Los títulos de Project Gutenberg, Standard Ebooks y tus propias exportaciones no tienen DRM y convierten sin problemas.

**Mira el tamaño del archivo.** Las conversiones gratuitas manejan archivos de hasta 10 MB, lo que cubre casi todas las novelas solo texto. Los libros ilustrados —cómics, recetarios, libros de texto— son mucho más grandes y necesitan un plan de pago, donde el límite sube a 50 MB en Pro y 100 MB en el nivel de API.

**Arregla los metadatos ahora.** Los campos de título y autor dentro del EPUB se convierten en lo que tu Kindle muestra en su pantalla de inicio. Si el archivo dice "Autor desconocido", tu biblioteca también. El editor de metadatos de Calibre lo soluciona en un par de clics, y es mucho menos molesto que renombrar libros en una pantalla de quince centímetros más tarde.`,
      },
      {
        heading: `Paso 2: Convierte en BookConv`,
        body: `BookConv usa el mismo motor [Calibre](https://calibre-ebook.com/) ebook-convert que usarías en el escritorio, pero en nuestros servidores, así que no instalas nada y nada agota el tiempo de tu portátil.

### Sube el EPUB
Abre el [conversor de EPUB a MOBI](/convert/epub-to-mobi). Arrastra el archivo al área de subida, o haz clic para buscarlo. El cargador comprueba el tamaño de inmediato y rechaza cualquier cosa por encima de tu límite de plan con un mensaje claro, así no pierdes tiempo esperando un trabajo que nunca iba a ejecutarse.

### Revisa la vista previa
BookConv lee los metadatos del EPUB y te muestra el título, autor y portada detectados antes de que empiece la conversión. Si los metadatos están mal, detente y arréglalos primero en Calibre: la salida solo puede ser tan limpia como la entrada.

### Inicia la conversión
Haz clic en **Convertir**. Tu archivo entra en una cola de trabajos del lado del servidor, y la página muestra una barra de progreso mientras el motor de Calibre desempaqueta el EPUB, reescribe el marcado para MOBI, recodifica las imágenes y reempaqueta todo. La mayoría de las novelas terminan en segundos; los libros con muchas imágenes tardan más.

### Descarga el resultado
Cuando la barra se completa, aparece el botón de descarga. Haz clic de inmediato: el archivo generado se sirve desde un enlace temporal y se elimina del servidor cuando el enlace caduca. Si la descarga no empieza, la [guía de solución de problemas de descarga](/blog/download-troubleshooting) repasa los bloqueos habituales del navegador.

El nivel gratuito te da cinco conversiones por hora sin necesidad de cuenta, más que suficiente para migrar una pequeña biblioteca.`,
      },
      {
        heading: `Paso 3: Verifica el MOBI antes de confiar en él`,
        body: `Que un archivo aparezca en tu carpeta de Descargas no prueba que la conversión funcionó. Dos minutos de comprobación valen la pena.

**Ábrelo primero en un ordenador.** El visor integrado de Calibre o el Kindle Previewer de Amazon renderizan el MOBI casi igual que un dispositivo, y es mucho más rápido que copiarlo al hardware y de vuelta.

**Luego comprueba estas cuatro cosas:**

- **Tabla de contenidos** — capítulos listados y clicables, no un bloque largo
- **Saltos de capítulo** — cada capítulo empieza en una página nueva, no a mitad de pantalla
- **Imágenes** — la portada y las figuras en línea se renderizan bien, no como cajas grises
- **Caracteres especiales** — los guiones largos, los acentos y las comillas tipográficas se ven bien, no como signos de interrogación

**Ahora cárgalo.** Conecta el Kindle por USB, copia el MOBI en la carpeta documents y expulsa el dispositivo con seguridad en lugar de tirar del cable. El libro debería aparecer en la pantalla de inicio; si no, reinicia el Kindle para que reindexe, y renombra el archivo con letras y números simples si contiene caracteres poco habituales.

Cuando el formato se ve mal, la causa casi siempre está en el EPUB de origen, no en el conversor. Ordena el EPUB en Calibre y convierte de nuevo: misma entrada, misma salida, siempre.`,
      },
      {
        heading: `Cuándo usar Calibre de escritorio en su lugar`,
        body: `BookConv es lo más rápido para conversiones puntuales y trabajos en ordenadores donde no puedes instalar software. Calibre de escritorio gana cuando necesitas más control.

Usa Calibre directamente para:

- **Cientos de libros a la vez** — conversión por lotes con perfiles de salida personalizados
- **Control fino del estilo** — anulaciones de CSS, fuentes personalizadas y perfiles por dispositivo
- **Fuentes rotas** — detección de estructura, arreglo de TOC basado en XPath y reparación de metadatos
- **Trabajo sin conexión** — sin subida, sin cola, sin dependencia de red

Ambas herramientas usan el mismo motor de conversión, así que la calidad de salida es idéntica. La diferencia es comodidad frente a control.`,
      },
      {
        heading: `Puntos clave`,
        body: `- **Solo legado** — convierte a MOBI para Kindle previos a 2012 a los que cargas por USB; si no, AZW3 o EPUB son el objetivo mejor
- **La preparación paga** — un EPUB limpio, sin DRM y con metadatos correctos convierte limpio al primer intento
- **BookConv es el camino más rápido** — sube, haz clic en Convertir, descarga; el motor de Calibre corre en el servidor sin nada que instalar
- **Ojo con los límites** — 10 MB gratis, 50 MB Pro, 100 MB API; cinco conversiones por hora en el nivel gratuito
- **Verifica cada archivo** — tabla de contenidos, saltos de capítulo, imágenes y caracteres especiales, antes de borrar el original
- **Descarga pronto** — los enlaces de descarga caducan y los archivos convertidos se eliminan del servidor después`,
      },
    ],
  },
  faqs: [
    {
      question: `¿BookConv usa realmente el mismo motor que Calibre?`,
      answer: `Sí. La conversión funciona con el binario ebook-convert de Calibre corriendo en nuestros servidores. La salida coincide con lo que produciría Calibre de escritorio para la misma entrada.`,
    },
    {
      question: `¿Convertir EPUB a MOBI pierde contenido?`,
      answer: `No se pierde texto. Palabras, párrafos, negritas y cursivas sobreviven al viaje. Lo que sí se simplifica es el estilo complejo —diseños de varias columnas, fuentes personalizadas y CSS elaborado— porque el motor de renderizado de MOBI es anterior a casi todo eso.`,
    },
    {
      question: `¿Por qué mi Kindle no muestra el MOBI que acabo de copiar?`,
      answer: `Tres sospechosos habituales: el archivo cayó en la raíz de la unidad en lugar de en la carpeta documents, el dispositivo necesita un reinicio para reindexar, o el EPUB de origen estaba dañado. Abre el archivo en Kindle Previewer en un ordenador para averiguar cuál es.`,
    },
    {
      question: `¿Puedo convertir un libro comprado en una tienda?`,
      answer: `No si lleva DRM, y la mayoría de las compras en tiendas lo llevan. Los conversores no pueden leer esos archivos. Comprar sin DRM cuando sea posible —muchos editores independientes lo ofrecen— evita el problema por completo.`,
    },
    {
      question: `¿Cuál es el EPUB más grande que puedo convertir gratis?`,
      answer: `10 MB, lo que cubre prácticamente cualquier novela. Pro llega hasta 50 MB y el plan API hasta 100 MB, que es donde suelen caer los libros ilustrados y los libros de texto.`,
    },
    {
      question: `¿MOBI o AZW3 para mi Kindle?`,
      answer: `AZW3 para cualquier dispositivo fabricado desde 2012. Soporta CSS propio, fuentes embebidas y mejor corte de línea, así que la experiencia de lectura es notablemente mejor. Guarda MOBI para hardware realmente viejo.`,
    },
    {
      question: `¿Cuánto tarda una conversión en BookConv?`,
      answer: `Segundos para una novela típica. Los libros grandes o con muchas imágenes tardan más, y los trabajos que superan el límite de dos minutos del servidor fallan en lugar de quedarse colgados, así lo sabes rápido en cualquier caso.`,
    },
    {
      question: `¿Cómo convierto toda una estantería de libros de una vez?`,
      answer: `Para bibliotecas grandes, Calibre de escritorio es la mejor herramienta: hace lotes ilimitados de forma gratuita. Para cinco o diez libros, pasarlos uno a uno por la [herramienta EPUB a MOBI](/convert/epub-to-mobi) es sinceramente más rápido que configurar cualquier otra cosa.`,
    },
  ],
};
