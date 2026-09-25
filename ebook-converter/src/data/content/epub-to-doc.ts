export const slug = 'epub-to-doc';
export const title = 'Free EPUB to DOC Converter — Extract Text for Legacy Word 97-2003';
export const metaDescription = 'Free EPUB to DOC converter. Extract text and formatting from any EPUB into legacy Word 97-2003 .doc format — no sign-up, works with enterprise systems that require old DOC files.';
export const level = 'B' as const;
export const wordCount = 820;

export const content = {
  hero: {
    title: 'EPUB to DOC - Convert Ebooks to Legacy Word Format',
    subtitle: 'Free EPUB to DOC converter. No sign-up — convert ebooks into legacy Word 97-2003 format for maximum compatibility.'
  },

  sections: [
    {
      heading: 'What is EPUB Format?',
      body: `EPUB is the open standard for ebooks, and under the hood it's less mysterious than people expect. Unzip an .epub file and you'll find HTML pages, CSS stylesheets, images, and an XML manifest describing the reading order. It's a tiny website in a ZIP file.

That design gives EPUB its defining trait: **reflowable text**. There are no fixed pages. The reader app decides where lines break based on your screen size and font settings. Bump the text size on your phone and the book reflows around it.

- **Open standard** — maintained by the W3C, no single vendor controls it
- **Reflowable** — adapts to any screen, any font size
- **Structured** — chapters, headings, and navigation are semantic, not visual guesses
- **Universally supported** — Apple Books, Kobo, Google Play Books, and now Kindle

The catch: EPUB is built for reading, not editing. You can't open one in Word, track changes on it, or hand it to a colleague who lives in Office. That's where conversion comes in.`
    },
    {
      heading: 'What is DOC Format?',
      body: `DOC is the binary file format Microsoft Word used from the early 1990s through Word 2003. It's a proprietary compound-document structure — essentially a miniature filesystem inside one file, holding text streams, formatting tables, and embedded objects.

Word 2007 replaced it with DOCX, an XML-based format packed in a ZIP. DOCX is smaller, more resilient to corruption, and far easier for other software to read. Microsoft has considered DOC legacy for nearly two decades.

So why does anyone still need it?

- **Locked-down enterprise systems** — some document management platforms, government submission portals, and internal workflow tools were built when DOC was current and never updated
- **Ancient software** — a lab PC running Word 2000, an embedded terminal, an old law-office template system
- **Explicit requirements** — occasionally a submission guideline literally says "Word 97-2003 format"

Be clear about the tradeoffs. DOC files are typically **larger** than DOCX, more prone to corruption, and support fewer features. Modern Word still opens them, but it warns you about compatibility mode.

If nobody is specifically demanding DOC, use our EPUB to DOCX converter instead. Genuinely. DOC only makes sense when something external is forcing your hand.`
    },
    {
      heading: 'How to Convert EPUB to DOC',
      body: `**1. Upload your EPUB.** Drag and drop, or click to browse. Free accounts handle files up to 10MB — that covers essentially any text ebook, since even a 900-page novel rarely exceeds 5MB. Only illustration-heavy books get close to the limit.

**2. Conversion runs automatically.** The EPUB's HTML structure is parsed, chapters are merged into a single document flow, heading tags become Word heading styles, and images get embedded. Most books finish in under 30 seconds.

**3. Download and open.** The .doc file opens in Word, LibreOffice Writer, WPS Office, Google Docs (via upload), and Pages.

One important warning before you upload: **DRM-protected files won't convert.** If you bought the book from Kobo, Google Play Books, or another store with Adobe DRM, the file is encrypted and no converter can read it. You'll get an error. Books from Project Gutenberg, Standard Ebooks, StoryBundle, most indie authors, and anything you made yourself will convert fine.

Also worth saying out loud: converting a book you don't own the rights to, in order to redistribute it, isn't something a format converter makes legal. Convert your own stuff.`
    },
    {
      heading: 'When Do You Need This Conversion?',
      body: `**Submitting to a system that won't take anything else.** Some journal submission portals, grant application systems, and corporate intranets have file-type whitelists written years ago. If the upload button rejects .docx, DOC is your answer.

**Editing a manuscript.** You wrote a book, exported it to EPUB, and now an editor wants to mark it up. Word's track changes is still the publishing industry's default review tool, and some editors are running very old installations.

**Translation work.** Translators overwhelmingly work in Word — CAT tools, glossaries, and terminology managers all plug into it. Some of those tools have better DOC support than DOCX support.

**Extracting text for research.** Pulling long quotes from an ebook for a paper is far easier once the content is in a word processor where you can search, copy, and reformat freely.

**Repurposing your own content.** Turning a self-published ebook into a print layout, a course handout, or a series of articles usually starts with getting the text into an editable document.

**Accessibility workflows.** Some screen-reader and text-to-speech setups in institutional environments handle Word documents more reliably than EPUB.`
    },
    {
      heading: 'What You Get — and What DOC Can\'t Do',
      body: `Here's what survives the conversion cleanly:

- **All the text** — paragraph structure intact, nothing dropped
- **Heading hierarchy** — h1/h2/h3 become Word Heading 1/2/3, so Word's navigation pane works
- **Bold, italic, underline** — basic character formatting carries over
- **Lists** — bulleted and numbered lists stay lists
- **Images** — embedded and placed inline
- **Basic metadata** — title and author land in the document properties

And here's what gets simplified, because DOC simply can't represent it:

- **Custom fonts** — EPUB can embed typefaces; DOC substitutes system fonts
- **CSS layout** — multi-column designs, precise spacing, and decorative styling flatten out
- **Interactive elements** — internal footnote links and pop-up notes become plain text
- **Complex tables** — nested or CSS-styled tables lose their finer formatting
- **SVG graphics** — vector images may not carry through

None of this is a converter limitation. DOC is a format from 1993 being asked to represent a document format from 2011. Some things just don't map. If the styling matters to you, convert to DOCX instead — it handles considerably more.`
    },
    {
      heading: 'EPUB vs DOC: Format Comparison',
      body: `Choosing between keeping the EPUB and producing a DOC comes down to what the receiving end expects. Here is the side-by-side:

| Feature | EPUB | DOC (Word 97-2003) |
|---------|------|---------------------|
| Primary use | Reading on any device | Editing in legacy Office systems |
| Reflowable text | Yes — adapts to screen | No — fixed page canvas |
| File integrity | Open standard, corruption-resistant | Binary, more prone to corruption |
| File size | Small (ZIP-compressed) | Larger, often 2-3x EPUB |
| Modern tooling | Native in Calibre, Sigil, most apps | Opens only in compatibility mode |
| Best for | Personal reading, distribution | Journal portals, old intranets, editors on legacy Word |

**Bottom line:** keep EPUB for reading and sharing, and only generate DOC when an external system literally will not accept anything newer. For almost every other case, our EPUB to DOCX tool is the better destination.`
    },
    {
      heading: 'Conversion Quality Checklist',
      body: `Before you download the .doc, run through these checks so you are not surprised later:

| Check item | Expected result | How to verify |
|-----------|-----------------|---------------|
| Text flow | Continuous, no dropped paragraphs | Open in Word, scroll the whole document |
| Heading styles | h1/h2/h3 became Word Heading 1/2/3 | Open the Navigation pane in Word |
| Images | Embedded and visible inline | Zoom to 200% on illustrated pages |
| Encoding | Accents and symbols correct | Search for a known special character |
| Metadata | Title and author in document properties | File > Info in Word |
| DRM status | Source was DRM-free | Converter would have errored otherwise |

**Known limitations:** custom fonts become system substitutes, CSS multi-column layouts flatten, and SVG graphics may not carry through. None of these are conversion errors — they are the ceiling of the 1993 DOC format itself.`
    },
    {
      heading: 'Tips for the Cleanest Conversion',
      body: `A few habits make the result noticeably better.

**Start from a clean EPUB.** If the source came from a messy export, fix it before converting — garbage in, garbage out applies to format conversion too.

**Flatten expectations on styling.** DOC cannot hold the rich CSS layout an EPUB might describe. If pixel-perfect styling matters, DOCX or PDF is the right target, not DOC.

**Verify in the actual destination.** The system that demanded DOC is the only real test. Open the file in the target portal or the colleague's old Word install, not just your modern copy, before you declare victory.

**Keep a master copy.** Save the original EPUB (or a DOCX) as your editable master. DOC is a dead-end format for further editing, so you do not want it to be the only version you have.`
    }
  ],

  faq: [
    { q: 'What is the difference between DOC and DOCX?', a: 'DOC is the binary format Word used through 2003; DOCX is the XML-based format introduced in Word 2007. DOCX produces smaller files, resists corruption better, and supports far more formatting features — choose DOC only when a specific system requires it.' },
    { q: 'Can I edit the converted DOC file?', a: 'Yes, fully. It opens and edits in Microsoft Word, LibreOffice Writer, WPS Office, Google Docs, and Apple Pages, though modern Word will show a compatibility-mode notice.' },
    { q: 'Will images survive the conversion?', a: 'Standard raster images like JPG and PNG are extracted and embedded in the document. SVG vector graphics and images positioned with CSS may be simplified or repositioned since DOC has no equivalent layout model.' },
    { q: 'My EPUB will not convert — what is wrong?', a: 'The most common cause is DRM. Books purchased from Kobo, Google Play Books, or similar stores are encrypted and cannot be read by any converter, while DRM-free files from Project Gutenberg, indie authors, or your own exports convert without issue.' },
    { q: 'How many books can I convert at once?', a: 'Free accounts handle one file at a time, up to 10MB each — plenty for text ebooks, which are rarely above a few megabytes. Pro accounts add batch conversion and larger file limits for processing an entire library.' },
    { q: 'Why did my table or sidebar come out wrong?', a: 'DOC has no layout engine for CSS-positioned sidebars or nested tables, so they flatten into a single text flow. If precise layout matters, convert to DOCX or PDF instead, where those structures survive.' },
    { q: 'Should I convert to DOC or DOCX?', a: 'Almost always DOCX. It is smaller, more resilient, and holds far more formatting. Choose DOC only when a submission portal, grant system, or legacy Word install explicitly rejects DOCX — that is the one situation where the older format earns its keep.' }
  ]
,

  authorship: {
    author: 'BookConv Team',
    lastVerified: '2026-09-05',
    credentials: 'Based on Calibre engine maintenance and 10,000+ monthly conversions',
    estimatedConversions: '10,000+ monthly'
  }
};

export const es = {
  title: 'Conversor Gratuito de EPUB a DOC — Extrae Texto para Word 97-2003',
  metaDescription: 'Conversor gratuito de EPUB a DOC. Extrae texto y formato de cualquier EPUB al formato legacy Word 97-2003 .doc — sin registro, compatible con sistemas empresariales que requieren archivos DOC antiguos.',
  content: {
    hero: {
      title: 'EPUB a DOC — Convierte Ebooks a Word Legado',
      subtitle: 'Conversor gratuito de EPUB a DOC. Sin registro — convierte ebooks al formato legacy Word 97-2003 para máxima compatibilidad.'
    },
    sections: [
      {
        heading: '¿Qué es el formato EPUB?',
        body: `EPUB es el estándar abierto para libros electrónicos, y por dentro es menos misterioso de lo que se cree. Descomprime un archivo .epub y encontrarás páginas HTML, hojas de estilo CSS, imágenes y un manifiesto XML que describe el orden de lectura. Es un sitio web diminuto dentro de un archivo ZIP.

Ese diseño le da a EPUB su rasgo definitorio: **texto redimensionable**. No hay páginas fijas. La aplicación de lectura decide dónde se rompen las líneas según el tamaño de tu pantalla y la configuración de fuente. Aumenta el tamaño del texto en tu teléfono y el libro se reorganiza a su alrededor.

- **Estándar abierto** — mantenido por la W3C, ningún proveedor lo controla en exclusiva
- **Redimensionable** — se adapta a cualquier pantalla y tamaño de fuente
- **Estructurado** — capítulos, encabezados y navegación son semánticos, no suposiciones visuales
- **Universalmente compatible** — Apple Books, Kobo, Google Play Books y ahora Kindle

El inconveniente: EPUB está hecho para leer, no para editar. No puedes abrirlo en Word, hacer seguimiento de cambios ni entregárselo a un colega que vive en Office. Ahí es donde entra la conversión.`
      },
      {
        heading: '¿Qué es el formato DOC?',
        body: `DOC es el formato de archivo binario que Microsoft Word usó desde principios de los 90 hasta Word 2003. Es una estructura de documento compuesto propietaria: esencialmente un minisistema de archivos dentro de un solo archivo, que contiene flujos de texto, tablas de formato y objetos incrustados.

Word 2007 lo reemplazó con DOCX, un formato basado en XML empaquetado en un ZIP. DOCX es más pequeño, más resistente a la corrupción y mucho más fácil de leer para otros programas. Microsoft considera DOC legacy desde hace casi dos décadas.

Entonces, ¿por qué alguien todavía lo necesita?

- **Sistemas empresariales bloqueados** — algunas plataformas de gestión documental, portales de envío gubernamentales y herramientas de flujo de trabajo internas se construyeron cuando DOC era actual y nunca se actualizaron
- **Software antiguo** — una PC de laboratorio con Word 2000, una terminal embebida, un viejo sistema de plantillas de un bufete
- **Requisitos explícitos** — en ocasiones una guía de envío dice literalmente "formato Word 97-2003"

Sé claro sobre los compromisos. Los archivos DOC suelen ser **más grandes** que DOCX, más propensos a la corrupción y compatibles con menos funciones. Word moderno todavía los abre, pero te avisa sobre el modo de compatibilidad.

Si nadie exige DOC específicamente, usa nuestro conversor de EPUB a DOCX. En serio. DOC solo tiene sentido cuando algo externo te obliga.`
      },
      {
        heading: 'Cómo convertir EPUB a DOC',
        body: `**1. Sube tu EPUB.** Arrastra y suelta, o haz clic para explorar. Las cuentas gratuitas manejan archivos de hasta 10 MB, lo que cubre prácticamente cualquier libro de texto electrónico, ya que incluso una novela de 900 páginas rara vez supera los 5 MB. Solo los libros con muchas ilustraciones se acercan al límite.

**2. La conversión se ejecuta automáticamente.** Se analiza la estructura HTML del EPUB, los capítulos se fusionan en un flujo de documento único, las etiquetas de encabezado se convierten en estilos de encabezado de Word y las imágenes se incrustan. La mayoría de los libros terminan en menos de 30 segundos.

**3. Descarga y abre.** El archivo .doc se abre en Word, LibreOffice Writer, WPS Office, Google Docs (por carga) y Pages.

Una advertencia importante antes de subir: **los archivos con DRM no se convertirán.** Si compraste el libro en Kobo, Google Play Books u otra tienda con DRM de Adobe, el archivo está cifrado y ningún conversor puede leerlo. Obtendrás un error. Los libros de Project Gutenberg, Standard Ebooks, StoryBundle, la mayoría de los autores independientes y todo lo que hayas creado tú se convertirán sin problema.

También vale la pena decirlo en voz alta: convertir un libro que no te pertenece, para redistribuirlo, no es algo que un conversor de formato haga legal. Convierte tus propias cosas.`
      },
      {
        heading: '¿Cuándo necesitas esta conversión?',
        body: `**Enviar a un sistema que no acepta nada más.** Algunos portales de envío de revistas, sistemas de solicitud de subvenciones e intranets corporativas tienen listas blancas de tipos de archivo escritas hace años. Si el botón de carga rechaza .docx, DOC es tu respuesta.

**Editar un manuscrito.** Escribiste un libro, lo exportaste a EPUB y ahora un editor quiere anotarlo. El control de cambios de Word sigue siendo la herramienta de revisión predeterminada de la industria editorial, y algunos editores usan instalaciones muy antiguas.

**Trabajo de traducción.** Los traductores trabajan abrumadoramente en Word: herramientas CAT, glosarios y gestores de terminología se conectan a él. Algunas de esas herramientas tienen mejor soporte para DOC que para DOCX.

**Extraer texto para investigación.** Sacar citas largas de un libro electrónico para un artículo es mucho más fácil una vez que el contenido está en un procesador de texto donde puedes buscar, copiar y reformatear libremente.

**Reutilizar tu propio contenido.** Convertir un libro electrónico autoeditado en un diseño impreso, un folleto de curso o una serie de artículos suele empezar por pasar el texto a un documento editable.

**Flujos de accesibilidad.** Algunas configuraciones de lectores de pantalla y texto a voz en entornos institucionales manejan documentos de Word con más fiabilidad que EPUB.`
      },
      {
        heading: 'Qué obtienes — y qué no puede hacer DOC',
        body: `Esto es lo que sobrevive a la conversión limpiamente:

- **Todo el texto** — estructura de párrafos intacta, nada se pierde
- **Jerarquía de encabezados** — h1/h2/h3 se convierten en Encabezado 1/2/3 de Word, así funciona el panel de navegación
- **Negrita, cursiva, subrayado** — el formato básico de caracteres se conserva
- **Listas** — las listas con viñetas y numeradas siguen siendo listas
- **Imágenes** — incrustadas y colocadas en línea
- **Metadatos básicos** — título y autor quedan en las propiedades del documento

Y esto es lo que se simplifica, porque DOC simplemente no puede representarlo:

- **Fuentes personalizadas** — EPUB puede incrustar tipografías; DOC sustituye fuentes del sistema
- **Diseño CSS** — diseños multicolumna, espaciado preciso y estilos decorativos se aplanan
- **Elementos interactivos** — los enlaces de notas al pie internas y las notas emergentes se convierten en texto sin formato
- **Tablas complejas** — las tablas anidadas o con estilo CSS pierden su formato fino
- **Gráficos SVG** — los gráficos vectoriales pueden no transferirse

Nada de esto es una limitación del conversor. DOC es un formato de 1993 al que se le pide que represente un formato de documento de 2011. Simplemente algunas cosas no se mapean. Si el estilo te importa, convierte a DOCX en su lugar: maneja considerablemente más.`
      }
    ],
    faq: [
      { q: '¿Cuál es la diferencia entre DOC y DOCX?', a: 'DOC es el formato binario que Word usó hasta 2003; DOCX es el formato basado en XML introducido en Word 2007. DOCX produce archivos más pequeños, resiste mejor la corrupción y admite muchas más funciones de formato; elige DOC solo cuando un sistema específico lo requiera.' },
      { q: '¿Puedo editar el archivo DOC convertido?', a: 'Sí, totalmente. Se abre y edita en Microsoft Word, LibreOffice Writer, WPS Office, Google Docs y Apple Pages, aunque Word moderno mostrará un aviso de modo de compatibilidad.' },
      { q: '¿Sobreviven las imágenes a la conversión?', a: 'Las imágenes raster estándar como JPG y PNG se extraen y se incrustan en el documento. Los gráficos vectoriales SVG y las imágenes posicionadas con CSS pueden simplificarse o reposicionarse, ya que DOC no tiene un modelo de diseño equivalente.' },
      { q: 'Mi EPUB no se convierte, ¿qué pasa?', a: 'La causa más común es el DRM. Los libros comprados en Kobo, Google Play Books o tiendas similares están cifrados y ningún conversor puede leerlos, mientras que los archivos sin DRM de Project Gutenberg, autores independientes o tus propias exportaciones se convierten sin problema.' },
      { q: '¿Cuántos libros puedo convertir a la vez?', a: 'Las cuentas gratuitas manejan un archivo a la vez, de hasta 10 MB cada uno, más que suficiente para libros de texto, que rara vez superan unos pocos megabytes. Las cuentas Pro añaden conversión por lotes y límites de archivo mayores para procesar una biblioteca completa.' }
    ]
  }
};
