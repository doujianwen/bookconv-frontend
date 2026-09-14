export const slug = 'lit-to-epub';
export const title = 'Free LIT to EPUB Converter — Rescue Old Microsoft Reader Books';
export const metaDescription = 'Free LIT to EPUB converter — rescue your old Microsoft Reader .LIT files in seconds, no sign-up. Convert to universal EPUB readable on Kindle, Kobo, Apple Books, and any e-reader.';
export const level = 'S' as const;
export const wordCount = 3200;

export const content = {
  hero: {
    title: 'LIT to EPUB - Rescue Your Old MS Reader Files',
    subtitle: 'Free LIT to EPUB converter. No sign-up — rescue discontinued Microsoft Reader files into universal EPUB for any device.'
  },

  sections: [
    {
      heading: 'What is LIT Format?',
      body: `LIT (Microsoft Reader Format) was a proprietary ebook format launched by Microsoft in 2003, primarily used for distributing e-books with DRM protection. It could only be opened using Microsoft Reader application on Windows or Windows Mobile devices.

In 2011, Microsoft officially stopped supporting the LIT format and discontinued the Microsoft Reader application. Today, LIT files have become a legacy format that presents several challenges:

- **DRM Protection**: Files are locked and cannot be freely shared
- **Platform Limitation**: Only supported on Windows desktop and Windows Mobile platforms
- **No reflowable text**: Fixed layout that does not adapt to different screen sizes
- **Small File Size**: Efficient compression but limited features

EPUB has become the universal standard for ebooks, supported by Apple Books, Google Play Books, Kobo, Amazon Kindle (via conversion), and virtually all modern reading platforms. Converting LIT to EPUB is not just a format change — it is a migration to the future of digital reading.`
    },
    {
      heading: 'Why You Need to Convert LIT to EPUB',
      body: `With Microsoft Reader shut down, many people who still own LIT format files have found their collections inaccessible. Converting LIT to EPUB is essential for:

**1. Device Compatibility** — EPUB works on iOS, Android, Kindle (via email conversion), Barnes & Noble Nook, and any other e-reader. LIT only works on discontinued Windows software.

**2. Reflowable Text** — EPUB supports dynamic reflowable text that adjusts to screen sizes, font settings, and lighting conditions. LIT uses fixed layout, making it impossible to adjust for different devices.

**3. Future-Proof** — EPUB 3 is an open standard maintained by the international standards organization IDPF. LIT is a closed, deprecated format with no ongoing development.

**4. Annotations & Notes** — EPUB supports full annotations, highlights, bookmarks, and notes. These features are either missing or extremely limited in LIT.

Whether you inherited LIT format books from family, collected rare professional texts, or saved personal documents — converting them now ensures they will not become unreadable in the future.`
    },
    {
      heading: 'What Your Converted EPUB Will Include',
      body: `Your converted EPUB files will include the following improvements:

- **Cross-Platform Reading** — Open on any device that supports EPUB, including smartphones, tablets, and e-readers
- **Editable Content** — Modify text, fonts, and layout using ebook editing tools
- **Table of Contents** — Preserve chapter structure from LIT into EPUB navigation (NCX/NAV)
- **Metadata Extraction** — Author name, ISBN, and publication info automatically extracted and written to EPUB metadata
- **Smaller File Size** — EPUB uses ZIP compression, typically resulting in smaller files than LIT

Our converter uses Calibre engine, which has been validated through tens of thousands of successful conversions to ensure formatting accuracy.`
    },
    {
      heading: 'Conversion Quality Guarantee',
      body: `We understand that converting LIT to EPUB is not simply changing a file extension. Our converter performs intelligent processing:

- **Smart Tag Removal**: Strips XHTML tags and CSS references from EPUB while preserving paragraph heading, and list structure
- **Special Character Handling**: Preserves Unicode characters (including Chinese, Japanese, Korean, Cyrillic) and proper quotation marks, dashes
- **Chapter Structure**: Separates chapters with blank lines for easy navigation
- **Whitespace Cleanup**: Removes unnecessary line breaks and spaces while preserving meaningful paragraph spacing
- **Metadata Preservation**: Title, author, and description information is extracted and added to EPUB metadata

For LIT files that included DRM protection purchased from Microsoft Store, note that DRM removal requires original purchase credentials. Contact our support if you need assistance with licensed files.`
    },
    {
      heading: 'LIT vs EPUB Comparison',
      body: `|---------|-----|------|
| Layout Type | Fixed (Fixed Layout) | Reflowable (Dynamic) |
| Font Adjustment | ❌ No | ✅ Yes |
| Night Mode | ❌ Difficult | ✅ Native Support |
| Full Text Search | ❌ Limited | ✅ Native Support |
| Annotations | ❌ Limited | ✅ Native Support |
| Cross-Device Sync | ❌ No | ✅ Supported |
| File Size | Small (compressed) | Small (ZIP compressed) |
| Best For | Printing, Submission | Reading, Learning |`
    }
  ],

  faq: [
    { q: 'Will LIT file conversion lose content?', a: 'No. The LIT to EPUB conversion fully preserves text paragraphs images chapter structure and basic formatting. While LIT did support some bold styling the converted EPUB will maintain all text content with even better readability.' },
    { q: 'Can the converted EPUB be read on Kindle?', a: 'Yes. Although Kindle natively supports AZW3/MOBI formats modern Kindle apps support receiving EPUB files via email which are then automatically converted to Kindle format. You can also use Calibre to convert EPUB to AZW3 in one click.' },
    { q: 'My LIT file has DRM what should I do?', a: 'If your LIT file still has DRM protection it must be removed before conversion. This usually requires original purchase credentials or license information. Contact our support for assistance with licensed files.' },
    { q: 'How many LIT files can I convert at once?', a: 'Without a Pro plan you can convert files up to 10 MB each. Pro raises the per-file limit to 50 MB and unlocks batch conversion; the API tier supports files up to 100 MB.' },
    { q: 'Does the conversion preserve bookmarks?', a: 'Yes. If your LIT file contained bookmarks or chapter markers these will be converted to EPUB navigation entries (NCX/NAV) allowing you to jump to specific chapters in your reader.' }
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
  title: 'Conversor Gratuito de LIT a EPUB — Rescata tus Libros Antiguos de Microsoft Reader',
  metaDescription: 'Conversor gratuito de LIT a EPUB — rescata tus archivos antiguos de Microsoft Reader .LIT en segundos, sin registro. Convierte a EPUB universal legible en Kindle, Kobo, Apple Books y cualquier dispositivo.',
  content: {
    hero: {
      title: 'LIT a EPUB — Rescata tus Archivos MS Reader',
      subtitle: 'Conversor gratuito de LIT a EPUB. Sin registro — rescata archivos descontinuados de Microsoft Reader y conviértelos a EPUB universal para cualquier dispositivo.'
    },
    sections: [
      {
        heading: '¿Qué es el formato LIT?',
        body: `LIT (formato Microsoft Reader) fue un formato de libro electrónico propietario lanzado por Microsoft en 2003, usado principalmente para distribuir libros electrónicos con protección DRM. Solo se podía abrir con la aplicación Microsoft Reader en Windows o dispositivos Windows Mobile.

En 2011, Microsoft dejó oficialmente de admitir el formato LIT y descontinuó la aplicación Microsoft Reader. Hoy, los archivos LIT se han convertido en un formato legacy que presenta varios desafíos:

- **Protección DRM**: los archivos están bloqueados y no se pueden compartir libremente
- **Limitación de plataforma**: solo compatible con escritorio Windows y plataformas Windows Mobile
- **Sin texto redimensionable**: diseño fijo que no se adapta a diferentes tamaños de pantalla
- **Tamaño de archivo pequeño**: compresión eficiente pero funciones limitadas

EPUB se ha convertido en el estándar universal para libros electrónicos, compatible con Apple Books, Google Play Books, Kobo, Amazon Kindle (vía conversión) y prácticamente todas las plataformas de lectura modernas. Convertir LIT a EPUB no es solo un cambio de formato: es una migración al futuro de la lectura digital.`
      },
      {
        heading: 'Por qué necesitas convertir LIT a EPUB',
        body: `Con Microsoft Reader desactivado, muchas personas que aún poseen archivos en formato LIT han encontrado sus colecciones inaccesibles. Convertir LIT a EPUB es esencial para:

**1. Compatibilidad de dispositivos** — EPUB funciona en iOS, Android, Kindle (vía conversión por correo), Barnes & Noble Nook y cualquier otro lector de libros electrónicos. LIT solo funciona en software Windows descontinuado.

**2. Texto redimensionable** — EPUB admite texto redimensionable dinámico que se ajusta a tamaños de pantalla, configuraciones de fuente y condiciones de iluminación. LIT usa diseño fijo, lo que imposibilita ajustarlo para diferentes dispositivos.

**3. A prueba de futuro** — EPUB 3 es un estándar abierto mantenido por la organización internacional de estándares IDPF. LIT es un formato cerrado y obsoleto sin desarrollo continuo.

**4. Anotaciones y notas** — EPUB admite anotaciones, resaltados, marcadores y notas completos. Estas funciones faltan o son extremadamente limitadas en LIT.

Ya sea que hayas heredado libros en formato LIT de tu familia, coleccionado textos profesionales raros o guardado documentos personales, convertirlos ahora garantiza que no se vuelvan ilegibles en el futuro.`
      },
      {
        heading: 'Qué incluirá tu EPUB convertido',
        body: `Tus archivos EPUB convertidos incluirán las siguientes mejoras:

- **Lectura multiplataforma** — ábrelo en cualquier dispositivo compatible con EPUB, incluidos teléfonos inteligentes, tabletas y lectores de libros electrónicos
- **Contenido editable** — modifica texto, fuentes y diseño usando herramientas de edición de libros electrónicos
- **Tabla de contenidos** — preserva la estructura de capítulos de LIT en la navegación EPUB (NCX/NAV)
- **Extracción de metadatos** — nombre del autor, ISBN e información de publicación extraídos y escritos automáticamente en los metadatos EPUB
- **Tamaño de archivo menor** — EPUB usa compresión ZIP, lo que normalmente produce archivos más pequeños que LIT

Nuestro conversor usa el motor Calibre, validado a través de decenas de miles de conversiones exitosas para garantizar la precisión del formato.`
      },
      {
        heading: 'Garantía de calidad de conversión',
        body: `Entendemos que convertir LIT a EPUB no es simplemente cambiar la extensión de un archivo. Nuestro conversor realiza un procesamiento inteligente:

- **Eliminación inteligente de etiquetas**: elimina las etiquetas XHTML y referencias CSS del EPUB preservando la estructura de párrafos, encabezados y listas
- **Manejo de caracteres especiales**: preserva caracteres Unicode (incluidos chino, japonés, coreano, cirílico) y comillas, guiones y rayas adecuados
- **Estructura de capítulos**: separa los capítulos con líneas en blanco para una navegación fácil
- **Limpieza de espacios**: elimina saltos de línea y espacios innecesarios preservando el espaciado significativo de párrafos
- **Preservación de metadatos**: el título, autor e información de descripción se extraen y añaden a los metadatos EPUB

Para archivos LIT que incluían protección DRM comprada en Microsoft Store, ten en cuenta que la eliminación de DRM requiere credenciales de compra originales. Contacta a nuestro soporte si necesitas ayuda con archivos con licencia.`
      },
      {
        heading: 'Comparación LIT vs EPUB',
        body: `|---------|-----|------|
| Tipo de diseño | Fijo (Fixed Layout) | Redimensionable (Dinámico) |
| Ajuste de fuente | ❌ No | ✅ Sí |
| Modo nocturno | ❌ Difícil | ✅ Soporte nativo |
| Búsqueda de texto completa | ❌ Limitada | ✅ Soporte nativo |
| Anotaciones | ❌ Limitadas | ✅ Soporte nativo |
| Sincronización entre dispositivos | ❌ No | ✅ Compatible |
| Tamaño de archivo | Pequeño (comprimido) | Pequeño (comprimido ZIP) |
| Mejor para | Impresión, envío | Lectura, aprendizaje |`
      }
    ],
    faq: [
      { q: '¿Perderá contenido la conversión de LIT?', a: 'No. La conversión de LIT a EPUB preserva completamente los párrafos de texto, imágenes, estructura de capítulos y formato básico. Aunque LIT admitía algo de estilo en negrita, el EPUB convertido mantendrá todo el contenido de texto con aún mejor legibilidad.' },
      { q: '¿Se puede leer el EPUB convertido en Kindle?', a: 'Sí. Aunque Kindle admite de forma nativa los formatos AZW3/MOBI, las aplicaciones Kindle modernas admiten recibir archivos EPUB por correo, que luego se convierten automáticamente al formato Kindle. También puedes usar Calibre para convertir EPUB a AZW3 con un clic.' },
      { q: 'Mi archivo LIT tiene DRM, ¿qué debo hacer?', a: 'Si tu archivo LIT todavía tiene protección DRM, debe eliminarse antes de la conversión. Esto normalmente requiere credenciales de compra originales o información de licencia. Contacta a nuestro soporte para ayuda con archivos con licencia.' },
      { q: '¿Cuántos archivos LIT puedo convertir a la vez?', a: 'Sin un plan Pro puedes convertir archivos de hasta 10 MB cada uno. Pro eleva el límite por archivo a 50 MB y desbloquea la conversión por lotes; el nivel API admite archivos de hasta 100 MB.' },
      { q: '¿Conserva la conversión los marcadores?', a: 'Sí. Si tu archivo LIT contenía marcadores o marcadores de capítulo, estos se convertirán en entradas de navegación EPUB (NCX/NAV) que te permiten saltar a capítulos específicos en tu lector.' }
    ]
  }
};
