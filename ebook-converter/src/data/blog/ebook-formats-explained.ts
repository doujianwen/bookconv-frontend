export const slug = `ebook-formats-explained`;
export const title = `EPUB vs AZW3 vs MOBI: Which Ebook Format Should You Use?`;
export const date = `2026-07-12`;
export const author = `BookConv Team`;
export const tags = [`Ebook Formats`, `EPUB`, `AZW3`, `MOBI`, `Kindle`, `Convert Ebook`];

export const content = {
  intro: `EPUB, AZW3, and MOBI all hold the same book — they just answer to different devices. A modern Kindle wants AZW3, everything else wants EPUB, and MOBI only earns its place on pre-2012 hardware. Here's the reasoning, plus how to switch formats in a browser without installing anything.`,
  sections: [
    {
      heading: `At a Glance`,
      body: `If you remember one table, make it this one.

| | EPUB | AZW3 | MOBI |
|---|---|---|---|
| Backed by | Open standard (IDPF) | Amazon (KF8) | Amazon (legacy) |
| Best on | Kobo, Apple Books, most e-readers | All modern Kindles | Pre-2015 Kindles |
| Styling | Full CSS, embedded fonts | Full CSS, embedded fonts | Limited; flattens layout |
| Open or locked | Open, portable | Amazon-centric | Amazon-centric |
| Future | Actively developed | Amazon's current standard | Frozen; deprecated |

The short version: EPUB for everything non-Kindle, AZW3 for any current Kindle, MOBI only for ancient hardware.`
    },
    {
      heading: `The Short Answer: Match the Format to Your Device`,
      body: `Skip the theory if you like. The decision fits in three lines.

- **Modern Kindle** (Paperwhite, Oasis, Scribe, basically anything from 2012 onward): use **AZW3**. It's Kindle-native, so typography and page layout survive intact.
- **iPad, Android phone, Kobo, Nook, laptop, or some mix of all four**: use **EPUB**. It's the open standard, and nearly every reader app outside Amazon speaks it fluently.
- **A pre-KF8 Kindle** that can't take a firmware update: use **MOBI**. It's dated, but it opens.

Everything below is the reasoning behind those three lines, plus the trade-offs nobody mentions until a book renders wrong.

Already know what you need? [Convert EPUB to AZW3](/convert/epub-to-azw3) runs in your browser and usually finishes in under a minute. No account, no installer. For a detailed walkthrough on converting EPUB to AZW3 while preserving your book's formatting, see our [EPUB to AZW3 for Kindle guide](/guide/epub-to-azw3-for-kindle).`
    },
    {
      heading: `EPUB: The Open Standard That Goes Almost Everywhere`,
      body: `EPUB started at the International Digital Publishing Forum and is now maintained by the W3C. Underneath, it's a zipped bundle of HTML, CSS, and images, which is why it behaves like a very small website.

That structure is what gives you **reflowable text**. Bump the font size and the words rewrap to fit the screen instead of shrinking a fixed page. On a phone, that single behavior is the entire reading experience.

**Where EPUB shines:**
- Opens in Apple Books, Kobo, Nook, Google Play Books, and dozens of desktop and mobile apps
- Reflows cleanly across screen sizes, orientations, and font settings
- Supports embedded fonts, real CSS styling, and proper chapter navigation
- Compresses well, so most text-only novels land far under 10 MB

**Where it falls short:**
- Kindle hardware won't display EPUB directly. Amazon converts one you send in, but you don't control the result.
- Heavily styled books can render slightly differently from app to app

Public libraries lend EPUB by default, so if you borrow books, this is the format you'll meet most often. The [EPUB 3 specification](https://www.w3.org/TR/epub-33/) has the technical detail if you want it.`
    },
    {
      heading: `AZW3: What Modern Kindles Actually Want`,
      body: `AZW3 is Amazon's KF8 format, introduced in 2011 and rolled out across the Kindle line afterward. It replaced the aging Mobipocket engine with something much closer to modern HTML and CSS.

In practice that means AZW3 handles everything MOBI never could: embedded fonts, tables, drop caps, fixed-layout pages for illustrated titles, and real control over margins and spacing.

**Where AZW3 shines:**
- Native on modern Kindle hardware, so nothing gets re-processed on the way in
- The best typography you'll get on an e-ink screen
- Copes with textbooks, reference works, and image-heavy books

**Where it falls short:**
- It's an Amazon format. Kobo, Nook, and most third-party apps ignore it.
- Kindles from before KF8 support can't read it at all

If you're building an archive rather than reading tonight, keep EPUB as your master copy and generate AZW3 on demand. Switching platforms later? [Convert AZW3 to EPUB](/convert/azw3-to-epub) goes the other direction just as cleanly. Amazon's [Send to Kindle page](https://www.amazon.com/sendtokindle) lists which file types your account accepts right now.`
    },
    {
      heading: `MOBI: Legacy Format, Narrow Use Case`,
      body: `MOBI came from Mobipocket, a company Amazon bought in 2005. It powered the first Kindles and stuck around for well over a decade.

It's simple, which is both the appeal and the ceiling. MOBI supports plain text, images, and limited HTML markup. No embedded fonts, no real tables, no fine layout control.

Amazon has been retiring it steadily. Send to Kindle stopped accepting MOBI uploads in 2022, and new titles arrive in newer formats. Even so, MOBI files exist by the million in personal archives, and old Kindle hardware reads them without complaint.

**Pick MOBI when:**
- Your Kindle predates KF8 and can't be updated
- Some very old reader app is the only thing that has to open the file

**Skip MOBI when:**
- The device handles AZW3 or EPUB, because there's no upside
- The book has tables, footnotes, or careful typography

Sitting on a folder of old MOBI files? [Convert MOBI to EPUB](/convert/mobi-to-epub) turns them into something future readers can actually use, and our [EPUB to MOBI walkthrough](/blog/epub-to-mobi-guide) covers the return trip if you still need it.`
    },
    {
      heading: `Convert Between Formats with BookConv`,
      body: `Format choice only matters if switching is painless. That's the part BookConv handles.

Upload the file, pick the target format, watch the progress bar, download the result. Conversion runs server-side on a Calibre engine, so you get desktop-grade output without maintaining a desktop app or waiting on an installer.

**What the free tier gives you:**
- Up to **10 MB per file**, which covers nearly every text-only novel
- **5 conversions per hour**, with no account and no sign-up
- A **metadata preview** before you commit, so you can check the title and author were read correctly
- A **live progress bar** — heavy files hand off to a background worker queue instead of stalling your tab

**When you need more room:** Pro raises the ceiling to **50 MB per file**, and the API plan goes to **100 MB**. That's the range where illustrated books, scanned PDFs, and bulk jobs live.

Two things worth knowing before you upload. **DRM-protected files are rejected on upload** — we don't strip protection, so there's nothing to work around. And **download links are temporary**: converted files are deleted after a while, so save the result when it's ready instead of bookmarking the page.

The routes people take most:
- [EPUB to AZW3](/convert/epub-to-azw3) for a modern Kindle
- [MOBI to EPUB](/convert/mobi-to-epub) to rescue an old archive
- [PDF to EPUB](/convert/pdf-to-epub) when a fixed-layout file needs to reflow

Desktop Calibre is still worth having if you manage thousands of books, edit metadata in bulk, or need to process files past 100 MB. For one or two books, a browser tab is faster than a library manager.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Device decides** — the right format is whatever your main reader opens natively. Everything else is one conversion away.
- **EPUB is your master copy** — open standard, reflowable, and both other formats can be generated from it.
- **AZW3 wins on Kindle** — better fonts, tables, and layout than MOBI, with no compatibility cost inside Amazon's ecosystem.
- **MOBI is a fallback** — keep it for pre-KF8 hardware, don't choose it otherwise.
- **Convert on demand** — one clean source plus a browser beats three half-maintained copies of every book.`
    }
  ]
};

export const faqs = [
  {
    question: `Can a Kindle read EPUB files now?`,
    answer: `Not directly. Kindle hardware still won't display EPUB, though Send to Kindle converts one on the way in. Doing it yourself with [EPUB to AZW3](/convert/epub-to-azw3) gives you a predictable result instead of whatever Amazon's pipeline decides.`,
  },
  {
    question: `Is AZW3 actually better than MOBI?`,
    answer: `On any Kindle that supports it, yes. AZW3 renders fonts, tables, and layout that MOBI simply can't handle. MOBI only makes sense on hardware too old for KF8.`,
  },
  {
    question: `Which format should I archive in?`,
    answer: `EPUB. It's a published open standard, so the files stay readable long after today's apps disappear. Generate AZW3 or MOBI copies whenever a device asks for one.`,
  },
  {
    question: `Will converting wreck my formatting?`,
    answer: `Plain novels come through almost perfectly. Books with heavy CSS, tables, footnotes, or fixed layouts can shift, so check the first couple of chapters and the table of contents. The metadata preview catches title and author problems before you convert.`,
  },
  {
    question: `Do I have to install Calibre?`,
    answer: `No. BookConv runs a Calibre engine server-side, so the conversion quality is the same with nothing on your machine. Install the desktop app only if you want a full library manager — its [conversion documentation](https://manual.calibre-ebook.com/conversion.html) explains every setting.`,
  },
  {
    question: `My book is bigger than 10 MB. What now?`,
    answer: `The free tier rejects it up front rather than failing halfway through. Compress the images, split the book, or move to Pro for 50 MB per file. The API plan allows 100 MB.`,
  },
  {
    question: `What about DRM-protected purchases?`,
    answer: `They're rejected on upload, and we don't remove DRM. Conversion works on DRM-free files you already own, which includes public-domain titles and most indie store purchases.`,
  },
  {
    question: `How do I convert EPUB to AZW3?`,
    answer: `For one or two books, use a browser converter: upload the EPUB, choose AZW3, download. No Calibre install required.`,
  },
  {
    question: `What format does Send to Kindle expect?`,
    answer: `Send to Kindle accepts EPUB and PDF by email and converts them to AZW3 in the cloud. It no longer accepts MOBI. If you sideload over USB, pre-convert to AZW3 yourself.`,
  }
];

export const es = {
  title: `EPUB vs AZW3 vs MOBI: ¿qué formato de ebook elegir?`,
  content: {
    intro: `EPUB, AZW3 y MOBI contienen el mismo libro — solo que responden a distintos dispositivos. Un Kindle moderno quiere AZW3, todo lo demás quiere EPUB, y MOBI solo merece su sitio en hardware previo a 2012. Aquí está el razonamiento, más cómo cambiar de formato en un navegador sin instalar nada.`,
    sections: [
      {
        heading: `De un vistazo`,
        body: `Si solo recuerdas una tabla, que sea esta.

| | EPUB | AZW3 | MOBI |
|---|---|---|---|
| Respaldado por | Estándar abierto (IDPF) | Amazon (KF8) | Amazon (heredado) |
| Mejor en | Kobo, Apple Books, la mayoría de lectores | Todos los Kindle modernos | Kindle previos a 2015 |
| Estilo | CSS completo, fuentes embebidas | CSS completo, fuentes embebidas | Limitado; aplana el diseño |
| Abierto o cerrado | Abierto, portátil | Centrado en Amazon | Centrado en Amazon |
| Futuro | En desarrollo activo | Estándar actual de Amazon | Congelado; obsoleto |

En resumen: EPUB para todo lo que no es Kindle, AZW3 para cualquier Kindle actual, MOBI solo para hardware antiguo.`
      },
      {
        heading: `La respuesta corta: empareja el formato con tu dispositivo`,
        body: `Salta la teoría si quieres. La decisión cabe en tres líneas.

- **Kindle moderno** (Paperwhite, Oasis, Scribe, básicamente cualquiera desde 2012 en adelante): usa **AZW3**. Es nativo de Kindle, así que la tipografía y el diseño de página sobreviven intactos.
- **iPad, móvil Android, Kobo, Nook, portátil, o una mezcla de los cuatro**: usa **EPUB**. Es el estándar abierto, y casi cualquier app de lectura fuera de Amazon lo habla con fluidez.
- **Un Kindle previo a KF8** que no puede actualizarse: usa **MOBI**. Es viejo, pero abre.

Todo lo que sigue es el razonamiento detrás de esas tres líneas, más los compromisos que nadie menciona hasta que un libro se renderiza mal.

¿Ya sabes lo que necesitas? [Convert EPUB to AZW3](/convert/epub-to-azw3) corre en tu navegador y suele terminar en menos de un minuto. Sin cuenta, sin instalador.`,
      },
      {
        heading: `EPUB: el estándar abierto que va casi a todas partes`,
        body: `EPUB empezó en el International Digital Publishing Forum y ahora lo mantiene el W3C. Por dentro es un paquete comprimido de HTML, CSS e imágenes, por eso se comporta como un sitio web muy pequeño.

Esa estructura es lo que te da **texto refulible**. Sube el tamaño de fuente y las palabras se reacomodan para llenar la pantalla en vez de encoger una página fija. En un móvil, ese único comportamiento es toda la experiencia de lectura.

**Dónde brilla EPUB:**
- Abre en Apple Books, Kobo, Nook, Google Play Books y decenas de apps de escritorio y móvil
- Se reacomoda limpiamente entre tamaños de pantalla, orientaciones y ajustes de fuente
- Soporta fuentes embebidas, CSS real y navegación de capítulos adecuada
- Comprime bien, así que la mayoría de las novelas solo de texto quedan muy por debajo de 10 MB

**Dónde flojea:**
- El hardware Kindle no muestra EPUB directamente. Amazon convierte uno que envías, pero no controlas el resultado.
- Los libros con mucho estilo pueden renderizar ligeramente distinto de app a app

Las bibliotecas públicas prestan EPUB por defecto, así que si tomas libros prestados, este es el formato que más encontrarás. La [especificación EPUB 3](https://www.w3.org/TR/epub-33/) tiene el detalle técnico si lo quieres.`,
      },
      {
        heading: `AZW3: lo que los Kindles modernos realmente quieren`,
        body: `AZW3 es el formato KF8 de Amazon, introducido en 2011 y desplegado por toda la línea Kindle después. Reemplazó el viejo motor Mobipocket por algo mucho más cercano al HTML y CSS modernos.

En la práctica eso significa que AZW3 hace todo lo que MOBI nunca pudo: fuentes embebidas, tablas, capitulares, páginas de diseño fijo para títulos ilustrados y control real sobre márgenes y espaciado.

**Dónde brilla AZW3:**
- Nativo en hardware Kindle moderno, así nada se reprocesa al entrar
- La mejor tipografía que obtendrás en una pantalla de tinta electrónica
- Aguanta libros de texto, obras de consulta y libros cargados de imágenes

**Dónde flojea:**
- Es un formato de Amazon. Kobo, Nook y la mayoría de las apps de terceros lo ignoran.
- Los Kindle previos a soporte KF8 no pueden leerlo en absoluto

Si construyes un archivo en vez de leer esta noche, conserva EPUB como tu copia maestra y genera AZW3 bajo demanda. ¿Cambias de plataforma después? [Convert AZW3 to EPUB](/convert/azw3-to-epub) va en el otro sentido igual de limpio. La [página Send to Kindle de Amazon](https://www.amazon.com/sendtokindle) lista qué tipos de archivo acepta tu cuenta ahora mismo.`,
      },
      {
        heading: `MOBI: formato heredado, caso de uso estrecho`,
        body: `MOBI vino de Mobipocket, una empresa que Amazon compró en 2005. Impulsó los primeros Kindle y se quedó más de una década.

Es simple, lo cual es tanto el atractivo como el techo. MOBI soporta texto plano, imágenes y marcado HTML limitado. Sin fuentes embebidas, sin tablas reales, sin control fino del diseño.

Amazon lo ha venido retirando poco a poco. Send to Kindle dejó de aceptar subidas MOBI en 2022, y los títulos nuevos llegan en formatos más nuevos. Aun así, los archivos MOBI existen por millones en archivos personales, y el hardware Kindle viejo los lee sin quejarse.

**Elige MOBI cuando:**
- Tu Kindle es previo a KF8 y no se puede actualizar
- Alguna app de lectura muy vieja es lo único que debe abrir el archivo

**Salta MOBI cuando:**
- El dispositivo maneja AZW3 o EPUB, porque no hay ventaja
- El libro tiene tablas, notas al pie o tipografía cuidada

¿Tienes una carpeta de archivos MOBI viejos? [Convert MOBI to EPUB](/convert/mobi-to-epub) los convierte en algo que los lectores futuros puedan usar de verdad, y nuestra [guía EPUB to MOBI](/blog/epub-to-mobi-guide) cubre el viaje de vuelta si todavía lo necesitas.`,
      },
      {
        heading: `Convertir entre formatos con BookConv`,
        body: `La elección de formato solo importa si cambiar es indoloro. Eso es lo que BookConv maneja.

Sube el archivo, elige el formato destino, mira la barra de progreso, descarga el resultado. La conversión corre del lado del servidor en un motor Calibre, así obtienes salida de grado de escritorio sin mantener una app de escritorio ni esperar un instalador.

**Qué da la capa gratuita:**
- Hasta **10 MB por archivo**, lo que cubre casi todas las novelas solo de texto
- **5 conversiones por hora**, sin cuenta ni registro
- Una **vista previa de metadatos** antes de comprometerte, así compruebas que el título y el autor se leyeron bien
- Una **barra de progreso en vivo** — los archivos pesados pasan a una cola de trabajadores en segundo plano en vez de bloquear tu pestaña

**Cuando necesitas más espacio:** Pro sube el techo a **50 MB por archivo**, y el plan API va a **100 MB**. Ahí viven los libros ilustrados, los PDF escaneados y los trabajos por lotes.

Dos cosas que vale la pena saber antes de subir. **Los archivos con DRM se rechazan al subir** — no quitamos protección, así que no hay nada que rodear. Y **los enlaces de descarga son temporales**: los archivos convertidos se borran tras un rato, así que guarda el resultado cuando esté listo en vez de guardar la página en marcadores.

Las rutas que la gente toma más:
- [EPUB to AZW3](/convert/epub-to-azw3) para un Kindle moderno
- [MOBI to EPUB](/convert/mobi-to-epub) para rescatar un archivo viejo
- [PDF to EPUB](/convert/pdf-to-epub) cuando un archivo de diseño fijo necesita refulir

Calibre de escritorio sigue valiendo la pena si gestionas miles de libros, editas metadatos por lotes o necesitas procesar archivos de más de 100 MB. Para uno o dos libros, una pestaña del navegador es más rápida que un gestor de biblioteca.`,
      },
      {
        heading: `Puntos clave`,
        body: `- **El dispositivo decide** — el formato correcto es el que tu lector principal abre de forma nativa. Todo lo demás está a una conversión de distancia.
- **EPUB es tu copia maestra** — estándar abierto, refulible, y los otros dos formatos se pueden generar a partir de él.
- **AZW3 gana en Kindle** — mejores fuentes, tablas y diseño que MOBI, sin coste de compatibilidad dentro del ecosistema de Amazon.
- **MOBI es una red de seguridad** — consérvalo para hardware previo a KF8, no lo elijas en otro caso.
- **Convierte bajo demanda** — una fuente limpia más un navegador le ganan a tres copias a medias de cada libro.`,
      },
    ],
  },
  faqs: [
    {
      question: `¿Un Kindle puede leer EPUB ahora?`,
      answer: `No directamente. El hardware Kindle sigue sin mostrar EPUB, aunque Send to Kindle convierte uno al entrar. Hacerlo tú mismo con [EPUB to AZW3](/convert/epub-to-azw3) te da un resultado predecible en vez de lo que decida la cadena de Amazon.`,
    },
    {
      question: `¿AZW3 es realmente mejor que MOBI?`,
      answer: `En cualquier Kindle que lo soporte, sí. AZW3 renderiza fuentes, tablas y diseño que MOBI simplemente no puede manejar. MOBI solo tiene sentido en hardware demasiado viejo para KF8.`,
    },
    {
      question: `¿En qué formato debo archivar?`,
      answer: `EPUB. Es un estándar abierto publicado, así los archivos siguen siendo legibles mucho después de que desaparezcan las apps de hoy. Genera copias AZW3 o MOBI cuando un dispositivo lo pida.`,
    },
    {
      question: `¿Convertir arruinará mi formato?`,
      answer: `Las novelas simples pasan casi perfectas. Los libros con mucho CSS, tablas, notas al pie o diseño fijo pueden moverse, así que revisa los primeros capítulos y la tabla de contenidos. La vista previa de metadatos captura problemas de título y autor antes de convertir.`,
    },
    {
      question: `¿Tengo que instalar Calibre?`,
      answer: `No. BookConv corre un motor Calibre del lado del servidor, así la calidad de conversión es la misma sin nada en tu máquina. Instala la app de escritorio solo si quieres un gestor de biblioteca completo — su [documentación de conversión](https://manual.calibre-ebook.com/conversion.html) explica cada ajuste.`,
    },
    {
      question: `¿Mi libro es mayor de 10 MB. Qué ahora?`,
      answer: `La capa gratuita lo rechaza de entrada en vez de fallar a mitad. Comprime las imágenes, divide el libro o pasa a Pro para 50 MB por archivo. El plan API permite 100 MB.`,
    },
    {
      question: `¿Y las compras con DRM?`,
      answer: `Se rechazan al subir, y no quitamos DRM. La conversión funciona en archivos sin DRM que ya posees, lo que incluye títulos de dominio público y la mayoría de las compras en tiendas independientes.`,
    },
    {
      question: `¿Cómo convierto EPUB a AZW3?`,
      answer: `Para uno o dos libros, usa un conversor en el navegador: sube el EPUB, elige AZW3, descarga. Sin instalar Calibre.`,
    },
    {
      question: `¿Qué formato espera Send to Kindle?`,
      answer: `Send to Kindle acepta EPUB y PDF por correo y los convierte a AZW3 en la nube. Ya no acepta MOBI. Si cargas por USB, convierte a AZW3 tú mismo antes.`,
    },
  ],
};
