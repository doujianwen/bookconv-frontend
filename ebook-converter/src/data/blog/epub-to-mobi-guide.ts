export const slug = `epub-to-mobi-guide`;
export const title = `How to Convert EPUB to MOBI Online: The BookConv Guide`;
export const date = `2026-07-30`;
export const author = "BookConv Team";
export const tags = ["EPUB", "MOBI", "Kindle", "BookConv", "conversion", "guide"];

export const content = {
  intro: `Upload your EPUB and convert it to MOBI on BookConv in seconds — no Calibre install, no account, no settings to guess at. This guide shows you how to run the conversion cleanly, whether you even need MOBI in 2026, and how to fix the cover, metadata, and table-of-contents problems that quietly ruin most attempts.`,
  sections: [
    {
      heading: `Convert EPUB to MOBI on BookConv in Three Steps`,
      body: `Start here. Most people are done in under a minute.

1. Open the [EPUB to MOBI converter](/convert/epub-to-mobi) and drop your file onto the upload area.
2. Check the metadata preview. BookConv reads the title, author, and cover out of the EPUB and shows them to you *before* anything is converted, so you catch a wrong author or a missing cover while it's still cheap to fix.
3. Hit convert and watch the progress bar. When it finishes, your MOBI download link appears.

That's the whole flow. There's nothing to install, and it runs the same server-side Calibre engine that desktop users run locally — you just don't have to manage it.

### What the free tier gives you

- **10 MB per file** — comfortably more than a text-heavy novel, which usually lands between 300 KB and 3 MB
- **5 conversions per hour** — enough for a small batch in one sitting
- **No account** — no email, no signup wall, no confirmation link

If you're converting a big illustrated book or a photography-heavy title, Pro raises the per-file ceiling to 50 MB and the API to 100 MB.

### Two things to know before you upload

Download links are **temporary**. Files get deleted after a period, so save the MOBI to your device or your Kindle right away rather than bookmarking the link and coming back tomorrow. If a link has already expired, our [download troubleshooting notes](/blog/download-troubleshooting) cover what to do.

**DRM-protected files are rejected at upload.** That's not a limitation we can tune around — DRM encrypts the book's contents, and no converter can read encrypted text. Library loans and most retail purchases fall into this category. Books you own DRM-free convert fine.`
    },
    {
      heading: `Do You Actually Still Need MOBI?`,
      body: `Worth two minutes of thought, because the answer saves some readers a step entirely.

MOBI came out of Mobipocket, a French company Amazon bought in 2007. Amazon built the early Kindle ecosystem on it, then moved on. KF8 — the format inside AZW3 files — replaced plain MOBI for anything with real styling, and in August 2022 Amazon stopped accepting MOBI through Send to Kindle. EPUB is what Amazon takes now.

So MOBI is a legacy target. It's still the right one in these cases:

- **Pre-2015 Kindle hardware** like the Kindle Keyboard, Kindle 4, Kindle Touch, and early Paperwhite units you sideload over USB
- **Offline sideloading** where there's no Wi-Fi and no email path to the device
- **Archival consistency** if your existing library is already MOBI and you want it to stay that way
- **Old third-party readers** built around Mobipocket that never added EPUB support

If your Kindle is newer than that and you're sideloading anyway, [convert to AZW3 instead](/convert/epub-to-azw3). AZW3 carries KF8, which means current CSS, embedded fonts, and real tables. MOBI drops most of that.

Still deciding what to standardise your library on? [Ebook formats explained](/blog/ebook-formats-explained) walks through the trade-offs without the marketing.`
    },
    {
      heading: `Send to Kindle Takes EPUB Now — Here's When to Use It Instead`,
      body: `Amazon's Send to Kindle service accepts EPUB files directly and converts them on Amazon's servers into KF8, using the same pipeline that handles Kindle Store books. Three ways in: email the file to your device's kindle.com address from an approved sender, drag it into the Send to Kindle web page, or use the desktop or mobile app.

The upside is real. You get Whispersync position tracking across devices, correct chapter breaks, and the same rendering commercial titles get. A sideloaded MOBI usually won't sync at all.

The catch is also real. You need an Amazon account, an internet connection, and a registered device, and the file lands in your Amazon library rather than staying local. Some people specifically don't want that. Amazon's [Send to Kindle help page](https://www.amazon.com/sendtokindle) lists the current size limits and accepted types.

Simple rule: modern Kindle and you're fine with Amazon holding the file, use Send to Kindle. Old hardware, no account, or you want the file to stay yours — convert on BookConv and sideload over USB.`
    },
    {
      heading: `Keeping Covers, Metadata, and the Table of Contents Intact`,
      body: `Conversions rarely fail loudly. They fail quietly, and you notice three weeks later when your library is a wall of grey placeholder tiles.

### Covers

MOBI stores the cover as a specially flagged image inside the file, not as a separate asset. If the source EPUB points at its cover only through an OPF manifest entry with no guide reference, converters can drop it. This is exactly why BookConv shows you a metadata preview before converting — if no cover thumbnail appears there, the EPUB itself is missing a proper cover reference, and the MOBI will inherit that gap. Fix the source, then re-upload.

### Metadata

Title and author are what your Kindle sorts by, so they matter more than they look. Series information is trickier: MOBI has no native series field, and converters fake it by folding the series name into the title. Fine for a personal shelf, confusing if you share files with anyone.

### Table of contents

Kindles use two separate navigation systems — the inline contents page you tap into, and the NCX index behind the Go To menu. An EPUB carrying only an HTML contents page, with no proper nav document, converts into a MOBI with a dead Go To menu.

The structure comes from the source file. A well-built EPUB converts well and a sloppy one doesn't, which is less satisfying than a magic setting but it's the truth. The [W3C EPUB 3 specification](https://www.w3.org/TR/epub-33/) defines what that nav document should contain, and it's a useful reference if you're checking why a file is broken.`
    },
    {
      heading: `Fixing the Errors That Ruin Most Conversions`,
      body: `Four problems account for nearly every bad EPUB to MOBI result.

### Garbled or boxed-out text

Almost always encoding. The source EPUB declares one character set and actually uses another, so accented characters and smart quotes come out as question marks or black diamonds. Non-Latin scripts have a second problem: old Kindle firmware ships with limited glyph coverage and needs an embedded font. No conversion setting invents characters a device can't draw.

### Missing cover on the device

If the cover looked right in the metadata preview but not on the Kindle, the device cached the old thumbnail. Delete the book from the Kindle, clear the matching folder in the hidden system thumbnail cache, then re-sideload. It's a caching bug, not a conversion bug.

### Broken or empty table of contents

If chapters run together into one endless page, your EPUB is probably a single XHTML file with no split points. There's nothing on the output side to fix — the source has no chapter boundaries to find.

### Wildly wrong formatting

Justified text collapsing, images overflowing, stray indents. Old MOBI supports a small slice of CSS and drops the rest. This is the clearest signal to stop fighting MOBI and use [EPUB to AZW3](/convert/epub-to-azw3) instead, assuming your device can read it.

### When to fall back to desktop Calibre

BookConv covers the normal path. Desktop Calibre is still worth installing for genuine edge cases: rewriting a broken NCX with a custom XPath rule, running search-and-replace across a file, filtering style information selectively, or batch-converting a few hundred books at once. The [Calibre conversion documentation](https://manual.calibre-ebook.com/conversion.html) is genuinely well written if you get there.

One more note on speed: large or slow files go through a background worker queue rather than blocking your browser. The progress bar keeps updating, so a slow conversion looks slow rather than looking broken. There's more on how that works in our [background workers write-up](/blog/background-workers).

Migrating an old library the other direction? [MOBI to EPUB](/convert/mobi-to-epub) handles DRM-free MOBI files.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **BookConv is the fast path.** Upload, check the metadata preview, convert, download — no install, no account, 10 MB and 5 conversions an hour on the free tier.
- **Save your file immediately.** Download links are temporary and converted files are deleted after a period, so don't treat a link as storage.
- **Check your Kindle first.** Anything made after roughly 2015 reads EPUB through Send to Kindle, which makes MOBI conversion unnecessary for a lot of people.
- **MOBI is legacy.** Amazon stopped accepting it through Send to Kindle in August 2022, and AZW3 is the better sideload target for any modern device.
- **Fix problems at the source.** Bad encoding, missing nav documents, and absent covers live in the EPUB, and no output setting repairs them after the fact.`
    }
  ]
};

export const faqs = [
  {
    question: `Do I need an account to convert EPUB to MOBI on BookConv?`,
    answer: `No. The free tier needs no signup at all — 10 MB per file and 5 conversions per hour. Pro raises the per-file limit to 50 MB and the API to 100 MB if you're working with bigger illustrated books.`,
  },
  {
    question: `How long does the download link stay active?`,
    answer: `Not indefinitely. Links are temporary and converted files are deleted after a period, so download the MOBI as soon as the progress bar completes rather than saving the link for later.`,
  },
  {
    question: `Why was my file rejected on upload?`,
    answer: `Two usual causes. Either it's DRM-protected, which we detect and reject because encrypted content can't be read by any converter, or it's over your tier's size limit — 10 MB free, 50 MB Pro.`,
  },
  {
    question: `Does my Kindle still support MOBI files?`,
    answer: `On physical Kindles, yes — sideloading a MOBI over USB still works on virtually every model. What changed is Send to Kindle, which stopped accepting MOBI uploads in August 2022. You can cable it across, you just can't email it.`,
  },
  {
    question: `What's the difference between MOBI and AZW3?`,
    answer: `AZW3 contains KF8, the newer Kindle format, with modern CSS, embedded fonts, proper tables, and fixed-layout support. Plain MOBI handles a much smaller subset and dates back to Mobipocket. For any Kindle from the last decade, AZW3 looks noticeably better.`,
  },
  {
    question: `Will converting EPUB to MOBI lose my highlights and notes?`,
    answer: `Yes. Annotations live in the device's own database and are tied to a specific file, so a converted copy counts as a new book. Export your notes before replacing anything.`,
  },
  {
    question: `Why does my converted MOBI have no page numbers?`,
    answer: `MOBI uses location markers instead, because reflowable text has no fixed page boundaries. Real page numbers only appear on Kindle Store books where Amazon has mapped them to a print edition, and no conversion can add that mapping.`,
  }
];

export const es = {
  title: `Cómo convertir EPUB a MOBI en línea: la guía de BookConv`,
  content: {
    intro: `Sube tu EPUB y conviértelo a MOBI en BookConv en segundos — sin instalar Calibre, sin cuenta, sin ajustes que adivinar. Esta guía te muestra cómo hacer la conversión limpia, si en 2026 sigues necesitando MOBI, y cómo arreglar la portada, los metadatos y la tabla de contenidos que en silencio arruinan la mayoría de los intentos.`,
    sections: [
      {
        heading: `Convertir EPUB a MOBI en BookConv en tres pasos`,
        body: `Empieza aquí. La mayoría termina en menos de un minuto.

1. Abre el [conversor de EPUB a MOBI](/convert/epub-to-mobi) y suelta tu archivo en el área de subida.
2. Revisa la vista previa de metadatos. BookConv lee el título, el autor y la portada del EPUB y te los muestra *antes* de convertir nada, así corriges un autor equivocado o una portada faltante mientras todavía es barato arreglarlo.
3. Pulsa convertir y mira la barra de progreso. Cuando termina, aparece tu enlace de descarga MOBI.

Ese es todo el flujo. No hay nada que instalar, y usa el mismo motor Calibre del lado del servidor que los usuarios de escritorio ejecutan localmente — solo que tú no tienes que gestionarlo.

### Qué da la capa gratuita

- **10 MB por archivo** — holgadamente más que una novela de texto, que suele estar entre 300 KB y 3 MB
- **5 conversiones por hora** — suficiente para un lote pequeño de una sentada
- **Sin cuenta** — sin correo, sin muro de registro, sin enlace de confirmación

Si conviertes un libro ilustrado grande o un título cargado de fotos, Pro sube el tope por archivo a 50 MB y la API a 100 MB.

### Dos cosas que saber antes de subir

Los enlaces de descarga son **temporales**. Los archivos se borran tras un tiempo, así que guarda el MOBI en tu dispositivo o en tu Kindle de inmediato en vez de guardar el enlace en marcadores y volver mañana. Si un enlace ya caducó, nuestras [notas de solución de descargas](/blog/download-troubleshooting) explican qué hacer.

**Los archivos con DRM se rechazan al subir.** No es una limitación que podamos rodear — el DRM cifra el contenido del libro, y ningún conversor puede leer texto cifrado. Los préstamos de biblioteca y la mayoría de las compras en tiendas entran en esta categoría. Los libros que posees sin DRM convierten bien.`,
      },
      {
        heading: `¿Realmente sigues necesitando MOBI?`,
        body: `Vale dos minutos de reflexión, porque la respuesta le ahorra un paso a algunos lectores.

MOBI salió de Mobipocket, una empresa francesa que Amazon compró en 2007. Amazon construyó los primeros Kindle sobre él y luego siguió adelante. KF8 — el formato dentro de los archivos AZW3 — reemplazó al MOBI plano para cualquier cosa con estilo real, y en agosto de 2022 Amazon dejó de aceptar MOBI por Send to Kindle. EPUB es lo que Amazon toma ahora.

Así que MOBI es un destino heredado. Sigue siendo el correcto en estos casos:

- **Hardware Kindle previo a 2015** como el Kindle Keyboard, Kindle 4, Kindle Touch y las primeras Paperwhite que cargas por USB
- **Carga sin conexión** donde no hay Wi-Fi ni correo al dispositivo
- **Coherencia de archivo** si tu biblioteca existente ya es MOBI y quieres que siga así
- **Lectores de terceros viejos** basados en Mobipocket que nunca añadieron soporte EPUB

Si tu Kindle es más nuevo y de todos modos cargas archivos, [convierte a AZW3 mejor](/convert/epub-to-azw3). AZW3 lleva KF8, lo que significa CSS actual, fuentes embebidas y tablas reales. MOBI pierde la mayor parte de eso.

¿Sigues decidiendo qué estandarizar en tu biblioteca? [Formatos de ebook explicados](/blog/ebook-formats-explained) recorre los pros y contras sin marketing.`,
      },
      {
        heading: `Send to Kindle ya acepta EPUB — cuándo usarlo en su lugar`,
        body: `El servicio Send to Kindle de Amazon acepta archivos EPUB directamente y los convierte en sus servidores a KF8, usando la misma cadena que maneja los libros de la Tienda Kindle. Tres formas de entrar: manda el archivo por correo a la dirección kindle.com de tu dispositivo desde un remitente aprobado, arrástralo a la página web de Send to Kindle, o usa la app de escritorio o móvil.

La ventaja es real. Obtienes seguimiento de posición Whispersync entre dispositivos, saltos de capítulo correctos y el mismo renderizado que los títulos comerciales. Un MOBI cargado a menudo no sincroniza en absoluto.

El inconveniente también es real. Necesitas una cuenta de Amazon, conexión a internet y un dispositivo registrado, y el archivo entra en tu biblioteca de Amazon en vez de quedarse local. Algunas personas específicamente no quieren eso. La [página de ayuda de Send to Kindle de Amazon](https://www.amazon.com/sendtokindle) lista los límites de tamaño y tipos aceptados actuales.

Regla simple: Kindle moderno y te basta con que Amazon guarde el archivo, usa Send to Kindle. Hardware viejo, sin cuenta o quieres que el archivo siga siendo tuyo — convierte en BookConv y cárgalo por USB.`,
      },
      {
        heading: `Conservar portadas, metadatos y la tabla de contenidos intactos`,
        body: `Las conversiones rara vez fallan a gritos. Fallan en silencio, y te das cuenta tres semanas después cuando tu biblioteca es un muro de mosaicos grises de marcador de posición.

### Portadas

MOBI guarda la portada como una imagen especialmente marcada dentro del archivo, no como un recurso separado. Si el EPUB de origen apunta a su portada solo por una entrada del manifiesto OPF sin referencia de guía, los conversores pueden soltarla. Por eso justo BookConv te muestra una vista previa de metadatos antes de convertir — si allí no aparece ninguna miniatura de portada, el propio EPUB carece de una referencia de portada adecuada, y el MOBI heredará esa brecha. Arregla el origen y vuelve a subir.

### Metadatos

El título y el autor son por lo que tu Kindle ordena, así que importan más de lo que parecen. La información de serie es más delicada: MOBI no tiene campo de serie nativo, y los conversores lo fingen doblando el nombre de la serie en el título. Bien para un estante personal, confuso si compartes archivos con alguien.

### Tabla de contenidos

Los Kindle usan dos sistemas de navegación separados — la página de contenidos en línea en la que pulsas, y el índice NCX detrás del menú Ir a. Un EPUB que solo lleva una página de contenidos HTML, sin un documento nav adecuado, se convierte en un MOBI con el menú Ir a muerto.

La estructura viene del archivo de origen. Un EPUB bien construido convierte bien y uno descuidado no, lo cual es menos satisfactorio que un ajuste mágico pero es la verdad. La [especificación EPUB 3 del W3C](https://www.w3.org/TR/epub-33/) define qué debe contener ese documento nav, y es una referencia útil si compruebas por qué un archivo está roto.`,
      },
      {
        heading: `Arreglar los errores que arruinan la mayoría de las conversiones`,
        body: `Cuatro problemas explican casi cada mal resultado de EPUB a MOBI.

### Texto garabateado o enmarcado

Casi siempre codificación. El EPUB de origen declara un juego de caracteres y usa otro, así que los acentos y las comillas tipográficas salen como signos de interrogación o diamantes negros. Las escrituras no latinas tienen un segundo problema: el firmware viejo del Kindle trae cobertura de glifos limitada y necesita una fuente embebida. Ningún ajuste de conversión inventa caracteres que un dispositivo no puede dibujar.

### Portada faltante en el dispositivo

Si la portada se veía bien en la vista previa pero no en el Kindle, el dispositivo guardó en caché la miniatura vieja. Borra el libro del Kindle, limpia la carpeta correspondiente en la caché oculta de miniaturas del sistema, y vuelve a cargarlo. Es un fallo de caché, no de conversión.

### Tabla de contenidos rota o vacía

Si los capítulos se funden en una página interminable, tu EPUB es probablemente un solo archivo XHTML sin puntos de corte. No hay nada que arreglar del lado de salida — el origen no tiene límites de capítulo que encontrar.

### Formato totalmente desatinado

Texto justificado que colapsa, imágenes desbordadas, sangrías sueltas. El MOBI viejo soporta una porción pequeña de CSS y descarta el resto. Esta es la señal más clara de que debes dejar de pelear con MOBI y usar [EPUB to AZW3](/convert/epub-to-azw3) en su lugar, si tu dispositivo puede leerlo.

### Cuándo recurrir a Calibre de escritorio

BookConv cubre el camino normal. Calibre de escritorio sigue valiendo la pena instalarlo para casos realmente límite: reescribir un NCX roto con una regla XPath personalizada, hacer buscar-y-reemplazar en un archivo, filtrar información de estilo selectivamente, o convertir por lotes unos pocos cientos de libros a la vez. La [documentación de conversión de Calibre](https://manual.calibre-ebook.com/conversion.html) está genuinamente bien escrita si llegas ahí.

Una nota más sobre velocidad: los archivos grandes o lentos pasan por una cola de trabajadores en segundo plano en vez de bloquear tu navegador. La barra de progreso sigue actualizándose, así que una conversión lenta se ve lenta en vez de rota. Hay más sobre cómo funciona en nuestra [entrada sobre trabajadores en segundo plano](/blog/background-workers).

¿Migras una biblioteca vieja en el otro sentido? [MOBI to EPUB](/convert/mobi-to-epub) maneja archivos MOBI sin DRM.`,
      },
      {
        heading: `Puntos clave`,
        body: `- **BookConv es el camino rápido.** Sube, revisa la vista previa de metadatos, convierte, descarga — sin instalar, sin cuenta, 10 MB y 5 conversiones por hora en la capa gratuita.
- **Guarda tu archivo de inmediato.** Los enlaces de descarga son temporales y los archivos convertidos se borran tras un tiempo, así que no trates un enlace como almacenamiento.
- **Revisa tu Kindle primero.** Cualquier cosa hecha después de 2015 lee EPUB por Send to Kindle, lo que hace innecesaria la conversión MOBI para mucha gente.
- **MOBI es heredado.** Amazon dejó de aceptarlo por Send to Kindle en agosto de 2022, y AZW3 es el mejor destino de carga para cualquier dispositivo moderno.
- **Arregla los problemas en el origen.** La mala codificación, los documentos nav ausentes y las portadas faltantes viven en el EPUB, y ningún ajuste de salida los repara después.`,
      },
    ],
  },
  faqs: [
    {
      question: `¿Necesito una cuenta para convertir EPUB a MOBI en BookConv?`,
      answer: `No. La capa gratuita no requiere registro alguno — 10 MB por archivo y 5 conversiones por hora. Pro sube el límite por archivo a 50 MB y la API a 100 MB si trabajas con libros ilustrados grandes.`,
    },
    {
      question: `¿Cuánto dura activo el enlace de descarga?`,
      answer: `No indefinidamente. Los enlaces son temporales y los archivos convertidos se borran tras un tiempo, así que descarga el MOBI en cuanto termine la barra de progreso en vez de guardar el enlace para luego.`,
    },
    {
      question: `¿Por qué se rechazó mi archivo al subir?`,
      answer: `Dos causas habituales. O tiene DRM, que detectamos y rechazamos porque ningún conversor puede leer contenido cifrado, o supera el límite de tamaño de tu nivel — 10 MB gratis, 50 MB Pro.`,
    },
    {
      question: `¿Mi Kindle sigue soportando archivos MOBI?`,
      answer: `En los Kindle físicos, sí — cargar un MOBI por USB sigue funcionando en casi todos los modelos. Lo que cambió es Send to Kindle, que dejó de aceptar subidas MOBI en agosto de 2022. Puedes pasarlo por cable, solo no por correo.`,
    },
    {
      question: `¿Cuál es la diferencia entre MOBI y AZW3?`,
      answer: `AZW3 contiene KF8, el formato Kindle más nuevo, con CSS moderno, fuentes embebidas, tablas adecuadas y soporte de diseño fijo. El MOBI plano maneja un subconjunto mucho menor y viene de Mobipocket. Para cualquier Kindle de la última década, AZW3 se ve notablemente mejor.`,
    },
    {
      question: `¿Convertir EPUB a MOBI perderá mis resaltados y notas?`,
      answer: `Sí. Las anotaciones viven en la base de datos propia del dispositivo y están atadas a un archivo específico, así que una copia convertida cuenta como un libro nuevo. Exporta tus notas antes de reemplazar nada.`,
    },
    {
      question: `¿Por qué mi MOBI convertido no tiene números de página?`,
      answer: `MOBI usa marcadores de ubicación en su lugar, porque el texto refulible no tiene límites de página fijos. Los números de página reales solo aparecen en los libros de la Tienda Kindle donde Amazon los ha mapeado a una edición impresa, y ninguna conversión puede añadir ese mapeo.`,
    },
  ],
};
