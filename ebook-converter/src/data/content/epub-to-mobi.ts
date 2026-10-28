export const slug = 'epub-to-mobi';
export const title = 'Convert EPUB to MOBI Online — Free, No Sign-up';
export const metaDescription = 'Convert EPUB to MOBI free — no sign-up, no watermarks. Get a classic MOBI for older Kindle devices in seconds. No account needed.';
export const level = 'S' as const;
export const wordCount = 2500;

export const content = {
  hero: {
    title: 'EPUB to MOBI — Convert EPUB Files for Kindle',
    subtitle: 'Free EPUB to MOBI converter, online. No sign-up — send EPUB books to older Kindle devices as classic MOBI in seconds.'
  },

  sections: [
    {
      heading: 'Converting in Reverse: MOBI to EPUB',
      body: `Most people search this page going EPUB-first, but the reverse trip is just as common - and this converter handles both directions of the pairing.

Going MOBI to EPUB makes sense when you are leaving the Kindle ecosystem. EPUB opens in Apple Books, Google Play Books, Kobo, Nook, and every mainstream Android reader, while MOBI stays locked to Kindle hardware. If you are migrating a personal library off old Kindle backups, EPUB is the destination format.

The dedicated [MOBI to EPUB converter](/convert/mobi-to-epub) runs the same Calibre engine in the opposite direction: it unpacks the MOBI record structure, rebuilds the HTML/CSS skeleton, and repackages everything as a standards-compliant EPUB 3 file with chapters, images, and metadata intact.

One orientation tip: whichever direction you convert, keep the original file. EPUB to MOBI sheds typography, and MOBI to EPUB cannot recover styling that MOBI never stored - so the richer format is always the one worth archiving.

BookConv runs every conversion through the open-source Calibre engine and supports 28+ eBook formats — free for personal use, no account required.`
    },
    {
      heading: 'About EPUB: What MOBI Conversion Gains and Loses',
      body: `EPUB (Electronic Publication) is an open ebook standard maintained by the W3C, currently at version 3.3 (released 2023-05). It is a reflowable format based on XHTML/CSS.

Converting EPUB to MOBI moves an open-standard file into the format Amazon built the original Kindle around. MOBI is less capable than EPUB, and the reason to convert is compatibility rather than quality.

**What you gain:** reach. A MOBI file opens on every Kindle ever made, including the 2007 original, plus old third-party readers and most free reading apps. If a file needs to open on a device you do not control, MOBI is the format least likely to fail.

**What you lose:** presentation. MOBI supports only a small subset of HTML and CSS, so no embedded fonts, minimal styling, and no fixed-layout rendering. Complex chapter layouts and fine typography get simplified, and any interactive EPUB 3 feature is dropped entirely.

**That trade-off runs in one direction:** the EPUB stays the better master file. Convert to MOBI only for a specific device that requires it, and keep the EPUB for everything else.

**Official resources:**
- [W3C EPUB 3.3 Specification](https://www.w3.org/publishing/epub3/)
- [IDPF Official Site](https://idpf.org/)`
    },
    {
      heading: 'What MOBI Is and Why E-readers Still Expect It',
      body: `MOBI (Mobipocket) is one of the earliest ebook formats supported by Amazon Kindle devices, and a free online EPUB to MOBI converter remains the fastest way to get a modern EPUB onto one of those older readers. While modern Kindles prefer AZW3 or EPUB formats, many older Kindle models (pre-2012) still rely on MOBI for file compatibility.

**Key characteristics of MOBI:**
- **Wide device support**: Works on virtually all Kindle e-readers, including older models
- **Simple structure**: Basic text formatting with limited CSS support
- **Small file size**: Efficient compression for text-heavy content
- **Limited features**: No support for complex layouts, embedded fonts, or advanced typography

Despite its age, MOBI remains relevant for users with legacy Kindle devices or those who prefer the simplicity of this proven format.`
    },
    {
      heading: 'Why Convert EPUB to MOBI?',
      body: `Converting EPUB to MOBI is essential for several scenarios:

**1. Legacy Kindle Compatibility**
If you own a Kindle Paperwhite (1st-3rd generation), Kindle Keyboard, or Kindle DX, these devices may not support EPUB natively. Converting to MOBI ensures your books work seamlessly.

**2. Email Delivery to Kindle**
Amazon's "Send to Kindle" email service accepts MOBI files for older devices. This makes MOBI an ideal format for wirelessly transferring books from your computer to your Kindle.

**3. Simple Text Conversion**
For straightforward novels and text-based books without complex formatting, MOBI provides reliable performance with minimal file bloat.

**4. Backup and Archival**
Maintaining MOBI copies of your EPUB library ensures you have compatible formats for any device, past or present.

Comparing the two formats before you commit? See our [EPUB vs MOBI comparison](/blog/epub-vs-mobi). And if a book is already a MOBI and you want it everywhere, [convert MOBI to EPUB](/convert/mobi-to-epub) instead.`
    },
    {
      heading: 'Conversion Quality & Considerations',
      body: `Our converter uses Calibre's battle-tested engine to ensure high-quality EPUB to MOBI conversion:

**What's Preserved:**
- ✓ All text content and paragraph structure
- ✓ Basic formatting (bold, italic, underline)
- ✓ Chapter headings and section breaks
- ✓ Embedded images (with size optimization)
- ✓ Table of contents navigation

**What May Change:**
- ⚠ Complex CSS styling simplified to basic formatting
- ⚠ Custom fonts replaced with standard Kindle fonts
- ⚠ Advanced layout elements may be reflowed
- ⚠ Interactive features removed (MOBI is static)

**Best Practices:**
- For best results, use EPUB files with clean, semantic markup
- Check that your source EPUB has a proper table of contents
- Test converted files on your specific Kindle model when possible`
    },
    {
      heading: 'MOBI vs EPUB vs AZW3: Which Should You Use?',
      body: `| Feature | EPUB | MOBI | AZW3 |
|---------|------|------|------|
| Device Support | Most e-readers | Older Kindles | Modern Kindles |
| Reflowable Text | ✓ Yes | ✓ Yes | ✓ Yes |
| Font Embedding | ✓ Advanced | ✗ Limited | ✓ Advanced |
| CSS Styling | ✓ Full | ✗ Basic | ✓ Enhanced |
| File Size | Small | Smallest | Medium |
| Open Standard | ✓ Yes | ✗ No | ✗ No |
| Best For | Universal reading | Legacy Kindle | Modern Kindle |

**Recommendation:**
- Use **EPUB** for universal compatibility across all platforms
- Use **MOBI** only if you have an older Kindle device
- Use **AZW3** for the best experience on modern Kindle devices`
    },
    {
      heading: 'EPUB vs MOBI Format Comparison',
      body: `| Feature | EPUB 3.3 | MOBI (Mobipocket) |
|---------|----------|-------------------|
| **Developer** | W3C (Open Standard) | Mobipocket/Amazon |
| **Initial Release** | 2007 | 1998 |
| **Last Updated** | 2023-05 (v3.3) | 2011 (legacy) |
| **Reflowable Text** | ✓ Full CSS support | ✓ Basic reflow |
| **Font Embedding** | ✓ Advanced (WOFF2) | ✗ Limited |
| **Custom Styling** | ✓ CSS3 | ✗ Minimal |
| **Image Support** | ✓ JPEG, PNG, WebP, SVG | ✓ JPEG, PNG |
| **Table of Contents** | ✓ Native NAV | ✓ NCX (older standard) |
| **Device Support** | All e-readers | Kindle only |
| **File Size** | Small (ZIP compressed) | Smallest |
| **Open Standard** | ✓ ISO 32000-like | ✗ Proprietary |
| **Best For** | Universal reading | Legacy Kindle |

**Why this matters**: EPUB is the future-proof standard maintained by W3C. MOBI is a legacy format that still works on older Kindle devices but lacks modern features like font embedding and advanced typography.`
    },
    {
      heading: 'When to Convert EPUB to MOBI',
      body: `You should convert EPUB to MOBI when:

**1. You Have an Older Kindle**
Kindle Paperwhite (1st-3rd generation), Kindle Keyboard, Kindle DX, and other pre-2012 models don't support EPUB natively. Converting to MOBI ensures your books work seamlessly.

**2. You're Using Send to Kindle Email**
Amazon's "Send to Kindle" email service accepts MOBI files for older devices. This is the easiest way to wirelessly transfer books from your computer to your Kindle.

**3. You Need Maximum Compatibility**
MOBI files are universally recognized by all Kindle devices, including the oldest models. If you're sharing books with multiple Kindle owners, MOBI is the safest choice.

**4. You Want Smaller File Sizes**
MOBI compression is more aggressive than EPUB, making it ideal for:
- Books with many images (reduces file size)
- Slow internet connections (faster transfers)
- Limited storage devices (older Kindles have smaller storage)

**Don't convert if:**
- You have a **modern Kindle** (2022+) → use AZW3 instead (better typography)
- You need **advanced formatting** → keep EPUB (MOBI simplifies complex layouts)
- You want **interactive features** → MOBI doesn't support video/audio

Comparing formats before committing? See our [EPUB vs MOBI comparison](/blog/epub-vs-mobi). And if a book is already MOBI and you want it everywhere, [convert MOBI to EPUB](/convert/mobi-to-epub) instead.`
    },
    {
      heading: 'How BookConv Handles EPUB to MOBI Conversion',
      body: `Our converter uses Calibre's battle-tested MOBI output engine with these optimizations:

**What We Preserve:**
- ✓ All text content and paragraph structure
- ✓ Chapter headings and section breaks
- ✓ Embedded images (optimized for e-ink displays)
- ✓ Table of contents navigation (converted to MOBI NCX format)
- ✓ Basic formatting (bold, italic, underline)

**What We Optimize:**
- ✨ Images resized for e-ink screens (no need for high-resolution)
- ✨ Font fallback chains for maximum compatibility
- ✨ Margin adjustments to prevent text overflow
- ✨ TOC structure simplified for Kindle navigation

**Technical Details:**
- Engine: Calibre 7.x MOBI output plugin
- Supported conversions: 31 format pairs across the platform
- Max file size: 4MB
- Conversion time: 10-30 seconds for typical books
- DRM: We don't bypass DRM — only convert files you own`
    },
    {
      heading: 'How to Convert EPUB to MOBI: Step by Step',
      body: `**Step 1 — Upload your EPUB.** Drag your .epub file into the upload area or click to browse. No account or email is required, and there is no file-size warning step to clear first. Conversions accept files up to 4 MB, on every plan.

**Step 2 — Wait for processing.** The Calibre engine rebuilds the book into the classic MOBI container and shows live status. Most novels finish in 10-30 seconds; illustrated books take longer because every image is re-encoded.

**Step 3 — Download the MOBI.** Click Download to save the file, then copy it to your Kindle's documents folder over USB, or email it to your Kindle address. Converted files are purged from our servers on a short rolling window.

**What the interface looks like:** one upload area, a live progress indicator, and one download button — no format toggles or quality sliders to guess at. MOBI output is tuned for older Kindle firmware by default, so if your device is a 2012-or-earlier model you can use the file straight away without further conversion.`
    },
    {
      heading: 'Common MOBI Issues and How to Fix Them',
      body: `Based on real user support tickets, here are the top problems and how to fix them:

**Issue 1: Missing Chapters After Conversion**
- *Symptom*: Table of contents is incomplete or chapters jump to wrong positions
- *Cause*: Source EPUB uses non-standard heading hierarchy
- *Fix*: Verify your EPUB has a proper heading hierarchy (h1 and h2 levels). Open in Calibre to check chapter markers before converting.

**Issue 2: Images Look Blurry in MOBI**
- *Symptom*: Photos appear pixelated or low quality
- *Cause*: MOBI compresses images aggressively for e-ink displays
- *Fix*: Use images under 100KB each. For better quality, convert to AZW3 instead (supports higher resolution).

**Issue 3: Custom Fonts Don't Appear**
- *Symptom*: Special fonts from EPUB are replaced with default fonts
- *Cause*: MOBI format doesn't support font embedding — this is a hard limitation
- *Fix*: Use standard fonts in your EPUB (Arial, Times New Roman, Georgia). Or switch to AZW3/EPUB format.

**Issue 4: Navigation/Broken TOC Links**
- *Symptom*: Chapter links don't work or jump to wrong sections
- *Cause*: Malformed navigation in source EPUB
- *Fix*: Run EPUBCheck or Calibre's "Test Book" feature before converting. Ensure href links are relative, not absolute URLs.

**Issue 5: Conversion Fails Completely**
- *Symptom*: Error message or spinner never completes
- *Cause*: File corrupted, DRM-protected, or exceeds size limit
- *Fix*: Check file size (4 MB limit). Remove any DRM first. Verify EPUB validity in Calibre.`
    },
    {
      heading: 'Which Devices Read MOBI',
      body: `**MOBI Format Support by Device**

| Device | Native Support | Notes |
|--------|---------------|-------|
| Kindle Paperwhite (1st-3rd gen) | ✅ Yes | MOBI works perfectly |
| Kindle Keyboard/DX | ✅ Yes | Full compatibility |
| Kindle Fire tablets | ✅ Yes | Also supports AZW3/EPUB |
| Kindle Oasis/Voyage (2016+) | ⚠️ Limited | Prefer AZW3 for better typography |
| Kindle (2022+) | ❌ No | Use EPUB via Send to Kindle instead |
| Kobo e-readers | ❌ No | Kobo doesn't read MOBI |
| Apple Books/iBooks | ❌ No | Use EPUB format |
| Nook | ❌ No | Use EPUB format |

**Known MOBI Limitations:**
- No font embedding (uses device default fonts)
- Basic formatting only (bold, italic — no CSS)
- No video/audio support
- No fixed-layout capability
- Max recommended image width: 600px

**When to Use MOBI vs Alternatives:**
- Use **MOBI** if: You have an older Kindle (pre-2022) and want maximum compatibility
- Use **AZW3** if: You have a modern Kindle and want better typography
- Use **EPUB** if: You read across multiple devices or want future-proof format

*Source: Amazon Kindle format documentation + Calibre compatibility tables*`
    },
    {
      heading: 'MOBI Conversion Best Practices',
      body: `For best results when converting EPUB to MOBI:

**Source File Tips:**
- Use EPUB files with clean, semantic markup (well-structured HTML)
- Ensure your EPUB has a proper table of contents (NCX or NAV)
- Check that embedded images are under 5MB each
- Remove any DRM before converting (we can't bypass it)

**Post-Conversion Checks:**
- Test the converted MOBI on your specific Kindle model
- Verify chapter navigation works correctly
- Check image quality (some loss is expected due to compression)
- Confirm text flow is readable at your preferred font size

**Troubleshooting:**
- If conversion fails, check your EPUB for corrupted images
- If text is missing, your EPUB may have non-standard markup
- If navigation breaks, ensure your TOC has hierarchical structure`
    },
    {
      heading: 'BookConv vs Other EPUB to MOBI Converters',
      body: `When converting EPUB to MOBI, you have several options. Here's how BookConv compares to other popular converters:

| Feature | BookConv | CloudConvert | Convertio | Zamzar |
|---------|----------|--------------|-----------|--------|
| **Browser-based** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **No registration** | ✅ Yes | ❌ Requires account | ❌ Requires account | ❌ Requires account |
| **Auto-delete files** | ✅ 1 hour | ⚠️ Varies | ❌ 24 hours | ❌ 2 hours |
| **Calibre engine** | ✅ Yes | ⚠️ Proprietary | ⚠️ Proprietary | ⚠️ Proprietary |
| **File size limit (free)** | ✅ 4MB | ⚠️ 100MB | ⚠️ 100MB | ⚠️ 50MB |
| **Batch conversion** | ✅ Pro plan | ✅ Paid | ✅ Paid | ✅ Paid |
| **Open source backend** | ✅ Calibre | ❌ Closed | ❌ Closed | ❌ Closed |

**Key advantage:** BookConv uses the same Calibre engine as the desktop application, ensuring high-quality output. Combined with our privacy-first approach (delete files after the conversion completes), it's the best choice for personal ebook conversion.

For more on choosing between online and desktop tools, see our [Calibre vs Online Converter guide](/guide/calibre-vs-online-converter).`,
    }
  ],

  faq: [
    { q: 'Do you also support converting MOBI back to EPUB?', a: 'Yes. The same engine runs both directions: the MOBI to EPUB converter rebuilds Kindle files as standards-compliant EPUB 3 with chapters, images, and metadata. Keep your richer original - neither direction recovers styling the source format never stored.' },
    { q: 'Will my EPUB convert perfectly to MOBI?', a: 'Most EPUB files convert successfully. Text content, basic formatting, and chapter structure are preserved. However, complex layouts and custom fonts may be simplified due to MOBI format limitations.' },
    { q: 'Can I read MOBI files on my Kindle?', a: 'Yes! MOBI is natively supported by all Kindle devices, especially older models (pre-2012). If you have a modern Kindle (2022+), consider using AZW3 or EPUB for better features.' },
    { q: 'Is there a file size limit?', a: 'Files up to 4 MB are accepted, on every plan. Larger illustrated books need compression or splitting first.' },
    { q: 'How long does conversion take?', a: 'Most EPUB to MOBI conversions complete in 10-30 seconds for typical books. Larger files with many images may take 1-2 minutes depending on complexity.' },
    { q: 'Will images be preserved in conversion?', a: 'Yes, embedded images are extracted and included in the MOBI file. However, image quality may be optimized for e-reader screens, and very large images might be resized.' },
    { q: 'Does conversion preserve the table of contents?', a: 'Absolutely! Your EPUB table of contents is converted to MOBI navigation (NCX format), allowing you to jump between chapters in your Kindle reader.' },
    { q: 'Can I convert EPUB to MOBI for Send to Kindle?', a: 'Yes! MOBI is the recommended format for Amazon\'s "Send to Kindle" email service on older devices. Simply upload your EPUB, convert to MOBI, and email the file to your Kindle address.' },
    { q: 'Why would I choose MOBI over AZW3?', a: 'MOBI has broader compatibility with older Kindle models (pre-2012). If you have a Kindle Paperwhite 1st-3rd gen or Kindle Keyboard, MOBI is your best option. Modern Kindles prefer AZW3 for better typography.' },
    { q: 'Is BookConv the best free EPUB to MOBI converter?', a: 'For a quick, no-install conversion it\'s among the fastest: runs the same Calibre engine as desktop software, keeps your chapters and images, deletes the file after processing, and adds no watermark.' },
    { q: 'Why is my converted MOBI file smaller than the original EPUB?', a: 'MOBI compresses more aggressively than EPUB, especially for images. This is intentional — older Kindles have limited storage and slower processors. If you need better image quality, try AZW3 instead.' },
    { q: 'Can I convert EPUB to MOBI and then back to EPUB?', a: 'Yes, but you\'ll lose some quality. MOBI strips advanced formatting and fonts. For lossless round-trip conversion, keep the original EPUB and use AZW3 for Kindle devices.' },
    { q: 'Does BookConv store my converted files?', a: 'No. Your file is processed in a single request and deleted immediately after download. We don\'t store, share, or use your files for anything else.' }
  ],

  authorship: {
    author: 'BookConv Team',
    lastVerified: '2026-09-16',
    credentials: 'Based on Calibre engine maintenance and 10,000+ monthly conversions. Reviewed by ebook format specialists.',
    estimatedConversions: '10,000+ monthly',
    sources: ['https://www.w3.org/publishing/epub3/', 'https://www.mobipocket.com/', 'https://manual.calibre-ebook.com/']
  }
};

export const es = {
  title: 'Conversor de EPUB a MOBI — Gratis, Sin Registro',
  metaDescription: 'Convierte EPUB a MOBI gratis — sin registro, sin marcas de agua. Obtén un MOBI clásico para Kindle antiguo en segundos. No se necesita cuenta.',
  content: {
    hero: {
      title: 'EPUB a MOBI — Convierte Ebooks para Kindle',
      subtitle: 'Conversor gratuito de EPUB a MOBI. Sin registro — envía libros EPUB a dispositivos Kindle antiguos como MOBI clásico en segundos.'
    },
    sections: [
      {
        heading: 'Conversión en reverso: MOBI a EPUB',
        body: `La mayoría de las personas buscan esta página partiendo de EPUB, pero el viaje inverso es tan común como el original, y este conversor maneja ambas direcciones.

Ir de MOBI a EPUB tiene sentido cuando sales del ecosistema Kindle. EPUB se abre en Apple Books, Google Play Books, Kobo, Nook y todo lector Android mainstream, mientras que MOBI permanece limitado al hardware Kindle. Si estás migrando una biblioteca personal desde copias de seguridad antiguas de Kindle, EPUB es el formato de destino.

El [conversor de MOBI a EPUB](/convert/mobi-to-epub) dedicado usa el mismo motor Calibre en dirección opuesta: desempaqueta la estructura de registros MOBI, reconstruye el esqueleto HTML/CSS y empaqueta todo como un archivo EPUB 3 conforme al estándar con capítulos, imágenes y metadatos intactos.

Un consejo de orientación: sin importar la dirección de conversión, guarda el archivo original. EPUB a MOBI elimina tipografía, y MOBI a EPUB no puede recuperar estilos que MOBI nunca almacenó, así que el formato más rico es siempre el que vale la pena archivar.

BookConv ejecuta cada conversión a través del motor open-source Calibre y soporta 28+ formatos de libros electrónicos — gratuito para uso personal, sin requerir cuenta.`
      },
      {
        heading: 'Sobre EPUB: Qué gana y pierde la conversión a MOBI',
        body: `EPUB (Electronic Publication) es un estándar abierto de libros electrónicos mantenido por la W3C, actualmente en la versión 3.3 (publicada en 2023-05). Es un formato redimensionable basado en XHTML/CSS.

Convertir EPUB a MOBI mueve un archivo de estándar abierto al formato que Amazon construyó alrededor del Kindle original. MOBI es menos capaz que EPUB, y la razón para convertir es compatibilidad, no calidad.

**Lo que ganas:** alcance. Un archivo MOBI se abre en todo Kindle jamás fabricado, incluyendo el original de 2007, además de viejos lectores de terceros y la mayoría de aplicaciones de lectura gratuitas. Si un archivo necesita abrirse en un dispositivo que no controlas, MOBI es el formato menos propenso a fallar.

**Lo que pierdes:** presentación. MOBI soporta solo un pequeño subconjunto de HTML y CSS, así que no hay fuentes incrustadas, estilo mínimo y no hay renderizado de diseño fijo. Los diseños complejos de capítulos y la tipografía fina se simplifican, y cualquier función interactiva de EPUB 3 se elimina por completo.

**Ese intercambio corre en una sola dirección:** EPUB permanece como el mejor archivo maestro. Convierte a MOBI solo para un dispositivo específico que lo requiera, y guarda EPUB para todo lo demás.

**Recursos oficiales:**
- [Especificación W3C EPUB 3.3](https://www.w3.org/publishing/epub3/)
- [Sitio oficial IDPF](https://idpf.org/)`
      },
      {
        heading: 'Qué es MOBI y por qué los lectores siguen esperándolo',
        body: `MOBI (Mobipocket) es uno de los primeros formatos de libros electrónicos soportados por dispositivos Amazon Kindle, y un conversor online gratuito de EPUB a MOBI sigue siendo la forma más rápida de llevar un EPUB moderno a uno de esos lectores antiguos. Aunque los Kindles modernos prefieren formatos AZW3 o EPUB, muchos modelos de Kindle antiguos (previos a 2012) todavía confían en MOBI para compatibilidad de archivos.

**Características clave de MOBI:**
- **Amplio soporte de dispositivos**: Funciona en prácticamente todos los e-readers Kindle, incluyendo modelos antiguos
- **Estructura simple**: Formato básico de texto con soporte limitado de CSS
- **Tamaño de archivo pequeño**: Compresión eficiente para contenido pesado de texto
- **Funciones limitadas**: Sin soporte para diseños complejos, fuentes incrustadas o tipografía avanzada

A pesar de su edad, MOBI sigue siendo relevante para usuarios con dispositivos Kindle legacy o aquellos que prefieren la simplicidad de este formato probado.`
      },
      {
        heading: '¿Por qué convertir EPUB a MOBI?',
        body: `Convertir EPUB a MOBI es esencial para varios escenarios:

**1. Compatibilidad con Kindle legacy**
Si tienes un Kindle Paperwhite (1ª-3ª generación), Kindle Keyboard o Kindle DX, estos dispositivos pueden no soportar EPUB de forma nativa. Convertir a MOBI asegura que tus libros funcionen sin problemas.

**2. Entrega por email a Kindle**
El servicio de email "Send to Kindle" de Amazon acepta archivos MOBI para dispositivos antiguos. Esto hace que MOBI sea un formato ideal para transferir libros inalámbricamente desde tu computadora a tu Kindle.

**3. Conversión simple de texto**
Para novelas sencillas y libros basados en texto sin formato complejo, MOBI proporciona rendimiento confiable con hinchazón mínima de archivo.

**4. Respaldo y archivo**
Mantener copias MOBI de tu biblioteca EPUB asegura que tengas formatos compatibles para cualquier dispositivo, pasado o presente.

¿Comparando los dos formatos antes de decidirte? Mira nuestra [comparación EPUB vs MOBI](/blog/epub-vs-mobi). Y si un libro ya es MOBI y lo quieres en todas partes, [convierte MOBI a EPUB](/convert/mobi-to-epub) en cambio.`
      },
      {
        heading: 'Calidad de conversión y consideraciones',
        body: `Nuestro conversor usa el motor probado por batallas de Calibre para garantizar una alta calidad en la conversión de EPUB a MOBI:

**Lo que se preserva:**
- ✓ Todo el contenido de texto y estructura de párrafos
- ✓ Formato básico (negrita, cursiva, subrayado)
- ✓ Encabezados de capítulo y separadores de sección
- ✓ Imágenes incrustadas (con optimización de tamaño)
- ✓ Navegación de tabla de contenidos

**Lo que puede cambiar:**
- ⚠ Estilo CSS complejo simplificado a formato básico
- ⚠ Fuentes personalizadas reemplazadas por fuentes estándar de Kindle
- ⚠ Elementos de diseño avanzados pueden reorgarse
- ⚠ Funciones interactivas eliminadas (MOBI es estático)

**Mejores prácticas:**
- Para mejores resultados, usa archivos EPUB con marcado semántico limpio
- Verifica que tu EPUB fuente tenga una tabla de contenidos adecuada
- Prueba los archivos convertidos en tu modelo específico de Kindle cuando sea posible`
      },
      {
        heading: 'MOBI vs EPUB vs AZW3: ¿Cuál debes usar?',
        body: `| Característica | EPUB | MOBI | AZW3 |
|---------------|------|------|------|
| Soporte de dispositivo | La mayoría de e-readers | Kindles antiguos | Kindles modernos |
| Texto redimensionable | ✓ Sí | ✓ Sí | ✓ Sí |
| Incrustación de fuentes | ✓ Avanzado | ✗ Limitado | ✓ Avanzado |
| Estilo CSS | ✓ Completo | ✗ Básico | ✓ Mejorado |
| Tamaño de archivo | Pequeño | Más pequeño | Medio |
| Estándar abierto | ✓ Sí | ✗ No | ✗ No |
| Mejor para | Lectura universal | Kindle legacy | Kindle moderno |

**Recomendación:**
- Usa **EPUB** para compatibilidad universal en todas las plataformas
- Usa **MOBI** solo si tienes un dispositivo Kindle antiguo
- Usa **AZW3** para la mejor experiencia en Kindles modernos`
      },
      {
        heading: 'Comparación de formatos EPUB vs MOBI',
        body: `| Característica | EPUB 3.3 | MOBI (Mobipocket) |
|---------------|----------|-------------------|
| **Desarrollador** | W3C (Estándar abierto) | Mobipocket/Amazon |
| **Lanzamiento inicial** | 2007 | 1998 |
| **Última actualización** | 2023-05 (v3.3) | 2011 (legacy) |
| **Texto redimensionable** | ✓ Soporte completo CSS | ✓ Redimensionamiento básico |
| **Incrustación de fuentes** | ✓ Avanzado (WOFF2) | ✗ Limitado |
| **Estilo personalizado** | ✓ CSS3 | ✗ Mínimo |
| **Soporte de imágenes** | ✓ JPEG, PNG, WebP, SVG | ✓ JPEG, PNG |
| **Tabla de contenidos** | ✓ NAV nativo | ✓ NCX (estándar antiguo) |
| **Soporte de dispositivo** | Todos los e-readers | Solo Kindle |
| **Tamaño de archivo** | Pequeño (ZIP comprimido) | Más pequeño |
| **Estándar abierto** | ✓ Sí | ✗ Propietario |
| **Mejor para** | Lectura universal | Kindle legacy |

**Por qué esto importa:** EPUB es el estándar a prueba de futuro mantenido por W3C. MOBI es un formato legacy que todavía funciona en dispositivos Kindle antiguos pero carece de funciones modernas como incrustación de fuentes y tipografía avanzada.`
      },
      {
        heading: 'Cuándo convertir EPUB a MOBI',
        body: `Debes convertir EPUB a MOBI cuando:

**1. Tienes un Kindle antiguo**
Kindle Paperwhite (1ª-3ª generación), Kindle Keyboard, Kindle DX y otros modelos previos a 2012 no soportan EPUB de forma nativa. Convertir a MOBI asegura que tus libros funcionen sin problemas.

**2. Estás usando el email Send to Kindle**
El servicio de email "Send to Kindle" de Amazon acepta archivos MOBI para dispositivos antiguos. Esta es la forma más fácil de transferir libros inalámbricamente desde tu computadora a tu Kindle.

**3. Necesitas máxima compatibilidad**
Los archivos MOBI son universalmente reconocidos por todos los dispositivos Kindle, incluyendo los modelos más antiguos. Si estás compartiendo libros con múltiples propietarios de Kindle, MOBI es la opción más segura.

**4. Quieres archivos más pequeños**
La compresión MOBI es más agresiva que EPUB, haciéndolo ideal para:
- Libros con muchas imágenes (reduce tamaño de archivo)
- Conexiones de internet lentas (transferencias más rápidas)
- Dispositivos con almacenamiento limitado (Kindles antiguos tienen menor almacenamiento)

**No conviertas si:**
- Tienes un **Kindle moderno** (2022+) → usa AZW3 en cambio (mejor tipografía)
- Necesitas **formato avanzado** → guarda EPUB (MOBI simplifica diseños complejos)
- Quieres **funciones interactivas** → MOBI no soporta video/audio`
      },
      {
        heading: 'Cómo BookConv maneja la conversión EPUB a MOBI',
        body: `Nuestro conversor usa el motor de salida MOBI probado por batallas de Calibre con estas optimizaciones:

**Lo que preservamos:**
- ✓ Todo el contenido de texto y estructura de párrafos
- ✓ Encabezados de capítulo y separadores de sección
- ✓ Imágenes incrustadas (optimizadas para pantallas e-ink)
- ✓ Navegación de tabla de contenidos (convertida a formato MOBI NCX)
- ✓ Formato básico (negrita, cursiva, subrayado)

**Lo que optimizamos:**
- ✨ Imágenes redimensionadas para pantallas e-ink (no necesitan alta resolución)
- ✨ Cadenas de fallback de fuentes para máxima compatibilidad
- ✨ Ajustes de margen para prevenir desbordamiento de texto
- ✨ Estructura TOC simplificada para navegación Kindle

**Detalles técnicos:**
- Motor: Plugin de salida MOBI Calibre 7.x
- Conversiones soportadas: 31 pares de formatos en toda la plataforma
- Tamaño máximo de archivo: 4MB
- Tiempo de conversión: 10-30 segundos para libros típicos
- DRM: No saltamos DRM — solo convertimos archivos que posees`
      },
      {
        heading: 'Cómo convertir EPUB a MOBI: Paso a paso',
        body: `**Paso 1 — Sube tu EPUB.** Arrastra tu archivo .epub al área de carga o haz clic para explorar. No se requiere cuenta ni email, y no hay paso de advertencia de tamaño de archivo que limpiar primero. Las conversiones aceptan archivos de hasta 4 MB, en cada plan.

**Paso 2 — Espera el procesamiento.** El motor Calibre reconstruye el libro en el contenedor MOBI clásico y muestra estado en vivo. La mayoría de novelas terminan en 10-30 segundos; libros ilustrados toman más tiempo porque cada imagen se re-codifica.

**Paso 3 — Descarga el MOBI.** Haz clic en Descargar para guardar el archivo, luego cópialo a la carpeta documentos de tu Kindle por USB, o envíalo por email a tu dirección Kindle. Los archivos convertidos se eliminan de nuestros servidores en una ventana rodante corta.

**Cómo se ve la interfaz:** un área de carga, un indicador de progreso en vivo y un botón de descarga — sin alternancias de formato ni sliders de calidad que adivinar. La salida MOBI está ajustada para firmware Kindle antiguo por defecto, así que si tu dispositivo es un modelo 2012 o anterior puedes usar el archivo directamente sin conversión adicional.`
      },
      {
        heading: 'Problemas comunes de MOBI y cómo solucionarlos',
        body: `Basado en tickets reales de soporte de usuarios, aquí están los principales problemas y cómo solucionarlos:

**Problema 1: Capítulos faltantes después de la conversión**
- *Síntoma*: Tabla de contenidos incompleta o capítulos saltan a posiciones incorrectas
- *Causa*: EPUB fuente usa jerarquía de encabezados no estándar
- *Solución*: Verifica que tu EPUB tenga una jerarquía de encabezados adecuada (niveles h1 y h2). Abre en Calibre para verificar marcadores de capítulo antes de convertir.

**Problema 2: Imágenes se ven borrosas en MOBI**
- *Síntoma*: Fotos aparecen pixeladas o de baja calidad
- *Causa*: MOBI comprime imágenes agresivamente para pantallas e-ink
- *Solución*: Usa imágenes menores a 100KB cada una. Para mejor calidad, convierte a AZW3 en cambio (soporta mayor resolución).

**Problema 3: Fuentes personalizadas no aparecen**
- *Síntoma*: Fuentes especiales del EPUB se reemplazan con fuentes predeterminadas
- *Causa*: Formato MOBI no soporta incrustación de fuentes — esto es una limitación hard
- *Solución*: Usa fuentes estándar en tu EPUB (Arial, Times New Roman, Georgia). O cambia a formato AZW3/EPUB.

**Problema 4: Navegación/Enlaces TOC rotos**
- *Síntoma*: Enlaces de capítulo no funcionan o saltan a secciones incorrectas
- *Causa*: Navegación malformada en EPUB fuente
- *Solución*: Ejecuta EPUBCheck o la función "Test Book" de Calibre antes de convertir. Asegúrate que los enlaces href sean relativos, no URLs absolutas.

**Problema 5: Conversión falla completamente**
- *Síntoma*: Mensaje de error o spinner nunca completa
- *Causa*: Archivo corrupto, protegido con DRM, o excede límite de tamaño
- *Solución*: Verifica tamaño de archivo (límite 4 MB). Elimina cualquier DRM primero. Verifica validez EPUB en Calibre.`
      },
      {
        heading: '¿Qué dispositivos leen MOBI?',
        body: `**Soporte de formato MOBI por dispositivo**

| Dispositivo | Soporte nativo | Notas |
|-------------|---------------|-------|
| Kindle Paperwhite (1ª-3ª gen) | ✅ Sí | MOBI funciona perfectamente |
| Kindle Keyboard/DX | ✅ Sí | Compatibilidad completa |
| Kindle Fire tablets | ✅ Sí | También soporta AZW3/EPUB |
| Kindle Oasis/Voyage (2016+) | ⚠️ Limitado | Prefiere AZW3 para mejor tipografía |
| Kindle (2022+) | ❌ No | Usa EPUB via Send to Kindle en cambio |
| Lectores Kobo | ❌ No | Kobo no lee MOBI |
| Apple Books/iBooks | ❌ No | Usa formato EPUB |
| Nook | ❌ No | Usa formato EPUB |

**Limitaciones conocidas de MOBI:**
- Sin incrustación de fuentes (usa fuentes predeterminadas del dispositivo)
- Solo formato básico (negrita, cursiva — sin CSS)
- Sin soporte de video/audio
- Sin capacidad de diseño fijo
- Ancho máximo de imagen recomendado: 600px

**Cuándo usar MOBI vs alternativas:**
- Usa **MOBI** si: Tienes un Kindle antiguo (previo a 2022) y quieres máxima compatibilidad
- Usa **AZW3** si: Tienes un Kindle moderno y quieres mejor tipografía
- Usa **EPUB** si: Lees en múltiples dispositivos o quieres formato a prueba de futuro

*Fuente: Documentación de formatos Kindle Amazon + tablas de compatibilidad Calibre*`
      },
      {
        heading: 'Mejores prácticas de conversión MOBI',
        body: `Para mejores resultados al convertir EPUB a MOBI:

**Consejos de archivo fuente:**
- Usa archivos EPUB con marcado semántico limpio (HTML bien estructurado)
- Asegúrate que tu EPUB tenga una tabla de contenidos adecuada (NCX o NAV)
- Verifica que las imágenes incrustadas sean menores a 5MB cada una
- Elimina cualquier DRM antes de convertir (no podemos saltarlo)

**Verificaciones post-conversión:**
- Prueba el MOBI convertido en tu modelo específico de Kindle
- Verifica que la navegación de capítulos funcione correctamente
- Revisa la calidad de imágenes (alguna pérdida es esperada debido a compresión)
- Confirma que el flujo de texto sea legible en tu tamaño de fuente preferido

**Solución de problemas:**
- Si la conversión falla, verifica tu EPUB por imágenes corruptas
- Si el texto falta, tu EPUB puede tener marcado no estándar
- Si la navegación se rompe, asegura que tu TOC tenga estructura jerárquica`
      },
      {
        heading: 'BookConv vs otros conversores de EPUB a MOBI',
        body: `Al convertir EPUB a MOBI, tienes varias opciones. Aquí cómo se compara BookConv con otros conversores populares:

| Característica | BookConv | CloudConvert | Convertio | Zamzar |
|---------------|----------|--------------|-----------|--------|
| **Basado en navegador** | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |
| **Sin registro** | ✅ Sí | ❌ Requiere cuenta | ❌ Requiere cuenta | ❌ Requiere cuenta |
| **Eliminación automática** | ✅ 1 hora | ⚠️ Varía | ❌ 24 horas | ❌ 2 horas |
| **Motor Calibre** | ✅ Sí | ⚠️ Propietario | ⚠️ Propietario | ⚠️ Propietario |
| **Límite de tamaño (gratis)** | ✅ 4MB | ⚠️ 100MB | ⚠️ 100MB | ⚠️ 50MB |
| **Conversión por lotes** | ✅ Plan Pro | ✅ Pagado | ✅ Pagado | ✅ Pagado |
| **Backend open source** | ✅ Calibre | ❌ Cerrado | ❌ Cerrado | ❌ Cerrado |

**Ventaja clave:** BookConv usa el mismo motor Calibre que la aplicación de escritorio, garantizando salida de alta calidad. Combinado con nuestro enfoque privacy-first (eliminación automática después de 1 hora), es la mejor opción para conversión personal de ebooks.

Para más sobre elegir entre herramientas online y de escritorio, mira nuestra [guía Calibre vs Conversor Online](/guide/calibre-vs-online-converter).`
      }
    ],
    faq: [
      { q: '¿También soportan conversión de MOBI a EPUB?', a: 'Sí. El mismo motor ejecuta ambas direcciones: el conversor MOBI a EPUB reconstruye archivos Kindle como EPUB 3 conforme al estándar con capítulos, imágenes y metadatos. Guarda tu original más rico — ninguna dirección recupera estilo que el formato fuente nunca almacenó.' },
      { q: '¿Mi EPUB convertirá perfectamente a MOBI?', a: 'La mayoría de archivos EPUB convierten exitosamente. Contenido de texto, formato básico y estructura de capítulos se preservan. Sin embargo, diseños complejos y fuentes personalizadas pueden simplificarse debido a limitaciones del formato MOBI.' },
      { q: '¿Puedo leer archivos MOBI en mi Kindle?', a: '¡Sí! MOBI es soportado nativamente por todos los dispositivos Kindle, especialmente modelos antiguos (previos a 2012). Si tienes un Kindle moderno (2022+), considera usar AZW3 o EPUB para mejores funciones.' },
      { q: '¿Hay límite de tamaño de archivo?', a: 'Se aceptan archivos de hasta 4 MB, en cada plan. Libros ilustrados más grandes necesitan compresión o división primero.' },
      { q: '¿Cuánto tiempo toma la conversión?', a: 'La mayoría de conversiones de EPUB a MOBI completan en 10-30 segundos para libros típicos. Archivos más grandes con muchas imágenes pueden tomar 1-2 minutos dependiendo de la complejidad.' },
      { q: '¿Se preservarán las imágenes en la conversión?', a: 'Sí, las imágenes incrustadas se extraen e incluyen en el archivo MOBI. Sin embargo, la calidad de imagen puede optimizarse para pantallas de e-reader, y imágenes muy grandes pueden redimensionarse.' },
      { q: '¿La conversión preserva la tabla de contenidos?', a: '¡Absolutamente! Tu tabla de contenidos EPUB se convierte a navegación MOBI (formato NCX), permitiéndote saltar entre capítulos en tu lector Kindle.' },
      { q: '¿Puedo convertir EPUB a MOBI para Send to Kindle?', a: '¡Sí! MOBI es el formato recomendado para el servicio de email "Send to Kindle" de Amazon en dispositivos antiguos. Simplemente sube tu EPUB, conviértelo a MOBI, y envía el archivo a tu dirección Kindle.' },
      { q: '¿Por qué elegiría MOBI sobre AZW3?', a: 'MOBI tiene compatibilidad más amplia con modelos Kindle antiguos (previos a 2012). Si tienes un Kindle Paperwhite 1ª-3ª gen o Kindle Keyboard, MOBI es tu mejor opción. Kindles modernos prefieren AZW3 para mejor tipografía.' },
      { q: '¿Es BookConv el mejor conversor gratuito de EPUB a MOBI?', a: 'Para una conversión rápida sin instalación, está entre los más rápidos: ejecuta el mismo motor Calibre que software de escritorio, mantiene tus capítulos e imágenes, elimina el archivo después del procesamiento, y no añade marca de agua.' },
      { q: '¿Por qué mi archivo MOBI convertido es más pequeño que el EPUB original?', a: 'MOBI comprime más agresivamente que EPUB, especialmente para imágenes. Esto es intencional — Kindles antiguos tienen almacenamiento limitado y procesadores más lentos. Si necesitas mejor calidad de imagen, intenta AZW3 en cambio.' },
      { q: '¿Puedo convertir EPUB a MOBI y luego volver a EPUB?', a: 'Sí, pero perderás algo de calidad. MOBI elimina formato avanzado y fuentes. Para conversión round-trip sin pérdida, guarda el EPUB original y usa AZW3 para dispositivos Kindle.' },
      { q: '¿BookConv almacena mis archivos convertidos?', a: 'No. Tu archivo se procesa en una sola solicitud y se elimina inmediatamente después de la descarga. No almacenamos, compartimos ni usamos tus archivos para nada más.' }
    ]
  }
};
