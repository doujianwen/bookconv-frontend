export const slug = 'html-to-epub';
export const title = 'Free HTML to EPUB Converter — No Sign-up';
export const metaDescription = 'Package web pages and saved articles into EPUB — free converter, no sign-up. Read your online reading list offline on any e-reader or phone.';
export const level = 'A' as const;
export const wordCount = 760;

export const content = {
  hero: {
    title: 'HTML to EPUB - Turn Web Content into a Real Ebook',
    subtitle: 'Free HTML to EPUB converter. No sign-up — package web pages and saved articles into ebooks you can read offline anywhere.'
  },

  sections: [
    {
      heading: 'Converting in Reverse: EPUB to HTML',
      body: `This page packages web content into an ebook. Plenty of people need the opposite, and it is the more common job of the two.

Going EPUB to HTML makes sense when you want to put a book back on the web, migrate an EPUB site to a CMS, or feed chapters into a documentation pipeline. An EPUB is a ZIP of XHTML and CSS, so extracting readable HTML out of one is mostly unpacking rather than rebuilding — but the navigation document has to be turned into something a browser understands, and images have to be repointed at real paths instead of living inside the archive.

The dedicated [EPUB to HTML converter](/convert/epub-to-html) runs the same Calibre engine in the opposite direction: it unpacks the container, writes each chapter out as a standalone page with a linked stylesheet, rebuilds the table of contents as an index page, and extracts the images into a folder you can host.

One direction caveat worth knowing: HTML to EPUB adds reading affordances the web does not have — reflow, saved position, bookmarks. Going back to HTML gives you portable content, not those features. If you only need the text, EPUB to TXT is the lighter option.
`
    },
    {
      heading: 'What is HTML Format?',
      body: `HTML is the markup that every web page is made of. Headings, paragraphs, lists, tables, images, links — each one is a tag that says what a piece of content is, while CSS handles how it looks.

It is brilliant for the web and mildly awful for long reading. A browser tab has no memory of where you stopped, no font controls worth using, no night mode that respects the page, and no offline guarantee once the site goes down.

**HTML also comes in a lot of shapes:**

- A single hand-written .html file
- A "Save Page As" dump from your browser, with a sidecar folder of assets
- Exported documentation from a static site generator
- Output from a writing tool like Scrivener, Pandoc, or Google Docs

All of those can become an ebook. The cleaner your markup, the better the result — but you do not need perfect HTML to get something readable. When the chapters only have to open in a browser, skip the ebook step and use [EPUB to HTML](/convert/epub-to-html) instead.`
    },
    {
      heading: 'What EPUB Is and Why Readers Speak It Natively',
      body: `EPUB is the open ebook standard, and it is what nearly every reading device speaks natively — Apple Books, Kobo, Nook, Google Play Books, PocketBook, and Kindle via Send to Kindle.

Under the hood it is a ZIP archive of XHTML, CSS, and images, which is exactly why HTML converts into it so naturally. The difference is everything EPUB wraps around that content:

- **Reflowable text** that reshapes itself for a phone, a tablet, or a 6-inch e-ink screen
- **Reader-controlled typography** — font, size, line spacing, margins, all adjustable
- **A real table of contents** built from your heading structure
- **Offline by default** — the whole thing is one self-contained file
- **Reading position, bookmarks, and highlights** that your app remembers between sessions

In short, HTML is built for browsing. EPUB is built for sitting down and reading for two hours.`
    },
    {
      heading: 'HTML vs EPUB: Quick Comparison',
      body: `The two formats share DNA — EPUB is literally a packaged, styled form of HTML — but they are built for different moments. Here is the short version:

| | HTML | EPUB |
|---|---|---|
| Purpose | Display content in a browser | Read content as a book |
| Layout | Fluid or fixed by CSS, bound to a screen | Reflowable, controlled by the reader |
| Reading tools | Browser tabs, no position memory | Bookmarks, highlights, saved reading position |
| Offline use | Depends on the host staying up | Self-contained file that always works |
| Table of contents | None unless you code one | Built automatically from your headings |
| Best for | Browsing the web and reading on a screen | Sitting down to read for a long stretch |

If you want someone to read your writing like a book — on a commute, on an e-reader, offline — EPUB is the upgrade from raw HTML. If you just need the page to render in a browser, HTML is already enough.`
    },
    {
      heading: 'Turning a Web Page into an EPUB',
      body: `**1. Upload your file.** Drop in a .html or .htm file. Free accounts cover files up to 4MB, which is far more than any realistic text document needs — that ceiling only matters if your page is stuffed with large images.

**2. We parse and restructure.** The converter reads your heading hierarchy to work out chapters, pulls the title and author from the document head where they exist, downloads any externally linked images so the book works offline, and rewrites inline styles into EPUB-safe CSS.

**3. Download the EPUB.** Send it to your reader, email it to your Kindle, or drop it into Apple Books.

Typical conversions finish in five to fifteen seconds. Image-heavy pages can take a minute or two while the linked assets are fetched and repackaged. Converting a set of pages? Batch conversion is free during public beta, with Pro planned after beta; each file is limited to 4 MB, with up to 20 EPUB-to-ZIP/TXT files or currently 3 files using the third-party service.`
    },
    {
      heading: 'When Reading Long Web Articles Offline',
      body: `**Reading long articles properly.** Save a 12,000-word essay or a multi-part investigative piece, convert it, and read it on e-ink without the ads, popups, and newsletter overlays.

**Self-publishing from a web-first draft.** Plenty of writers draft in Markdown, export to HTML, and need an EPUB for distribution. This is the last step of that chain.

**Turning documentation into a manual.** Export your docs site to HTML, bundle it as an EPUB, and hand it to a client or a field team who might not have connectivity.

**Archiving your own writing.** A blog can vanish overnight when a host shuts down. An EPUB on your own drive does not.

**Course and training material.** Reflowable text with a working table of contents beats a stack of printed pages or a folder of loose web files.`
    },
    {
      heading: 'What Converts Cleanly - and What Does Not',
      body: `**Handled well:**

- Heading tags become chapter entries in the navigation
- Paragraphs, bold, italic, underline, and blockquotes keep their meaning
- Ordered and unordered lists, including nesting
- Images, whether embedded or linked from a URL — they get downloaded and packaged inside the file
- Tables, converted to layouts that will not run off the edge of a small screen
- Metadata from the document head, written into the EPUB properties

**Simplified or dropped:**

- **JavaScript.** EPUB is a reading format, not an app platform. Interactive widgets become static content or disappear.
- **Fixed-position CSS layouts.** Absolute positioning and multi-column grids get flattened, because reflowable text has no fixed canvas.
- **Video and audio embeds.** EPUB 3 technically supports media, but most readers ignore it, so embeds usually reduce to a link.
- **Web fonts** may be swapped for reader defaults depending on licensing.

One practical tip: if your HTML uses styled div elements instead of real heading tags, the converter has nothing to build a table of contents from. Proper headings make a dramatically better ebook.`
    },
    {
      heading: 'Before You Convert: Prepare Your HTML',
      body: `Ten minutes of prep turns a rough conversion into a book you are proud to send someone.

**Use real heading tags.** h1, h2, h3 are what become the table of contents. If your page fakes headings with styled div or span elements, the converter cannot see them and you get a flat, single-entry TOC.

**Inline your critical CSS.** The converter rewrites styles into EPUB-safe form, but deeply nested or external stylesheets may lose nuance. Simpler markup converts more predictably.

**Make images absolute or embedded.** Linked images from https:// URLs are fetched during conversion; if the original site is gone, those images will not make it into the book. Save them locally first if the page is at risk.

**Strip the chrome.** Navigation bars, sidebars, comment sections, and share buttons are not part of the reading experience. Delete them from the HTML before converting, or they become clutter in the ebook.

**Set a title and author.** If the document head carries a title element and author meta, the converter picks them up automatically. Otherwise you will be editing metadata by hand afterward.`
    },
    {
      heading: 'Quality Checklist for a Web Article EPUB',
      body: `After download, confirm the ebook is actually good before you send it to a reader:

| Check item | Expected result | How to verify |
|-----------|-----------------|---------------|
| Table of contents | One entry per real heading | Open the TOC / navigation pane |
| Images | All present and offline | Flip through, toggle airplane mode |
| Reading position | Saved between sessions | Close and reopen mid-chapter |
| Fonts | Adjustable in the reader | Increase text size |
| No leftover UI | No nav bars or ads | Skim the first and last pages |
| Metadata | Title and author correct | View book info |

**Known limitations:** JavaScript, embedded video and audio, and fixed-position CSS layouts do not survive the move into a reflowable reading format. If your source depends on any of those, keep it as HTML or accept that they flatten into static content.`
    }
  ],

  faq: [
    { q: 'Can I convert a single HTML file into an EPUB?', a: 'Yes, and that is the most common case. A single page becomes a single-chapter ebook. For a multi-page site, either merge the pages into one HTML file first or convert section by section.' },
    { q: 'Will images hosted on the web still show up?', a: 'Yes. Externally linked images are downloaded during conversion and packaged inside the EPUB, so your book keeps working offline even if the original site goes down.' },
    { q: 'What happens to buttons, forms, and JavaScript?', a: 'They do not survive as interactive elements. EPUB readers deliberately restrict scripting, so dynamic content is flattened into its static equivalent or removed.' },
    { q: 'How does the table of contents get built?', a: 'From your heading hierarchy. If your document uses real heading tags in a sensible order, you will get clean chapter navigation. Pages that fake headings with styled text will produce a flat, single-entry TOC.' },
    { q: 'How long does conversion take, and is there a size limit?', a: 'Most pages finish in five to fifteen seconds. Single-file direct uploads support up to 100 MB when enabled; batch and fallback uploads are limited to 4 MB per file. Batch conversion is free during public beta, with Pro planned after beta; each file is limited to 4 MB, with up to 20 EPUB-to-ZIP/TXT files or currently 3 files using the third-party service.' },
    { q: 'Should I keep my content as HTML or convert it to EPUB?', a: 'Keep HTML if the content only needs to render in a browser. Convert to EPUB when you want it read like a book — on a phone, an e-reader, or offline — because EPUB adds reflow, a real table of contents, and saved reading position that raw HTML pages lack.' },
    { q: 'Can you also convert EPUB back to HTML?', a: 'Yes. The [EPUB to HTML converter](/convert/epub-to-html) unpacks the book into standalone chapter pages with a linked stylesheet, rebuilds the table of contents as an index, and extracts images into a hostable folder.' }
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
  "title": "Convertir HTML a EPUB online",
  "metaDescription": "Convierte un archivo HTML local a EPUB. Revisa texto, acentos y orden de lectura; no se garantiza conservar imágenes, estilos ni enlaces.",
  "content": {
    "hero": {
      "title": "Convertir HTML a EPUB",
      "subtitle": "Sube un archivo HTML local para obtener un EPUB. La ruta alternativa extrae texto; no se garantiza conservar imágenes, estilos, enlaces ni capítulos."
    },
    "sections": [
      {
        "heading": "Cómo convertir un archivo HTML",
        "body": "1. Guarda el documento con codificación UTF-8.\n2. Sube el archivo .html o .htm en el formulario. Esta herramienta recibe archivos; no ofrece un campo para descargar una página mediante su URL.\n3. Descarga el EPUB y comprueba el texto con un lector compatible. Guarda el original y sus recursos."
      },
      {
        "heading": "Qué puede cambiar durante la conversión",
        "body": "BookConv puede utilizar un motor de conversión o una ruta alternativa de texto. En la prueba de la ruta alternativa se conservaron las palabras y los acentos, pero no la imagen, el color CSS ni el destino del enlace. El texto del enlace permaneció. El script de la muestra no apareció en el EPUB. Estos resultados no garantizan el comportamiento de cualquier HTML o del otro motor. No dependas de formularios, JavaScript o recursos externos."
      },
      {
        "heading": "Imágenes, enlaces relativos y estilos",
        "body": "Un archivo HTML suelto no incluye necesariamente sus imágenes ni hojas de estilo. Los recursos relativos pueden faltar al subir solo el documento. No se garantiza que BookConv descargue esos recursos, conserve enlaces navegables o reproduzca la maquetación. Si necesitas fidelidad visual, compara el resultado antes de elegir este flujo. El EPUB no debe sustituir el sitio original."
      },
      {
        "heading": "Tamaño, lotes y precio",
        "body": "Sigue el límite mostrado por el formulario: hasta 100 MB para la subida directa de un archivo cuando está habilitada; 4 MB en la ruta alternativa y por archivo en los lotes. Para este par, el lote admite hasta 3 archivos. Los lotes son gratuitos durante la beta pública; Pro está previsto para después. Los archivos complejos pueden fallar aun dentro del límite."
      },
      {
        "heading": "Comparación entre HTML y EPUB",
        "body": "| Formato | Uso | Comprobación |\n| --- | --- | --- |\n| HTML | Documento para navegador con recursos externos posibles | Codificación, enlaces y archivos asociados |\n| EPUB | Libro empaquetado para lectura | Orden del texto, navegación y recursos incluidos |\n\nCambiar la extensión no convierte el documento. La ruta alternativa crea un libro sencillo con texto y navegación básica, sin reconstruir automáticamente los capítulos."
      },
      {
        "heading": "Cuándo utilizar esta herramienta",
        "body": "Puede servir para leer offline una copia de texto de un artículo propio o de un documento que tengas derecho a convertir. No es una herramienta para capturar sitios completos ni para ejecutar páginas dinámicas. Para preparar un libro de varios capítulos con portada y metadatos precisos, utiliza un editor EPUB y revisa el paquete final."
      },
      {
        "heading": "Lista de comprobación de calidad",
        "body": "Busca una frase del inicio y otra del final. Revisa ñ, tildes, símbolos, párrafos y orden. Comprueba por separado las imágenes y los enlaces que necesites. La ruta alternativa puede utilizar el título Converted Document y metadatos de idioma en inglés aun cuando el texto sea español; corrígelos en un editor EPUB si son importantes para tu lector."
      },
      {
        "heading": "Si el archivo falla",
        "body": "Utiliza un archivo no vacío con texto legible y codificación UTF-8. Un documento aceptado no demuestra que todas sus etiquetas y recursos sean compatibles. No renombres un PDF u otro formato como HTML. Si el resultado es texto simplificado, puede haberse utilizado la ruta alternativa. Para otras opciones consulta el [directorio en español](/es/convert)."
      }
    ],
    "faq": [
      {
        "q": "¿Puedo pegar una URL?",
        "a": "No en esta herramienta. El formulario recibe un archivo local; no promete descargar una página mediante su URL."
      },
      {
        "q": "¿Se conservan las imágenes y CSS?",
        "a": "No se garantiza. La ruta alternativa extrae texto y no incluye las imágenes ni el estilo original."
      },
      {
        "q": "¿El HTML puede contener JavaScript?",
        "a": "No dependas de su ejecución. El EPUB generado no reproduce una página dinámica; comprueba siempre el resultado."
      },
      {
        "q": "¿Se crean capítulos automáticamente?",
        "a": "No se garantiza. La ruta alternativa produce un documento de texto con navegación básica, no un capítulo por cada encabezado."
      },
      {
        "q": "¿Cuál es el límite por archivo?",
        "a": "Consulta el formulario: subida directa hasta 100 MB cuando está habilitada; ruta alternativa y cada archivo por lotes hasta 4 MB."
      },
      {
        "q": "¿Se conservan los acentos?",
        "a": "La muestra UTF-8 conservó ñ y tildes. Comprueba tu archivo; otras codificaciones o documentos complejos pueden fallar."
      }
    ]
  }
};
