export const slug = `azw3-vs-mobi`;
export const title = `MOBI vs AZW3 & AZW3 vs MOBI — Which Kindle Format Wins in 2026`;
export const date = `2026-08-01`;
export const author = "BookConv Team";
export const tags = ["AZW3", "MOBI", "Kindle", "Ebook Formats", "BookConv", "Calibre"];

export const content = {
  intro: `MOBI vs AZW3 and AZW3 vs MOBI — the answer depends on your Kindle's year. AZW3 wins for any Kindle from 2015 onward; MOBI only matters for pre-2015 hardware. Get the clear pick — plus a one-click, no-install way to convert either direction without losing your formatting.`,
  sections: [
    {
      heading: `The Short Version`,
      body: `Use **AZW3** for any Kindle made in the last ten years. It renders modern CSS, keeps your embedded fonts, and handles tables and complex layouts. Reach for **MOBI** only when you're feeding a Kindle old enough to predate decent styling, or when you're stuck with software that never learned anything newer.

      If you're not sure which device you own, AZW3 is the safe default. It's the format Amazon's own publishing pipeline produces, and it's what Send to Kindle builds behind the scenes.`
    },
    {
      heading: `AZW3 vs MOBI for Kindle: The 10-Second Decision`,
      body: `Not sure which format your Kindle needs? It comes down to one thing: the age of the device.

- **Kindle from 2015 or later** (Paperwhite 3, Oasis, Voyage, any current model) — use **AZW3**. It's what Amazon's own pipeline produces, and it keeps your fonts, tables, and CSS.
- **Kindle older than 2015** (Keyboard, 4, Touch, first-gen Paperwhite) — use **MOBI** only if AZW3 won't sideload cleanly over USB.
- **Not sure which you own?** AZW3 is the safe default; fall back to MOBI only if it fails.

| Your Kindle | Use | Why |
|-------------|-----|-----|
| Paperwhite 3 or later (2015+) | AZW3 | Full styling engine, embedded fonts |
| Oasis, Voyage, any current model | AZW3 | Designed around KF8 |
| Kindle Basic (2019, 2022, 2024) | AZW3 | Modern firmware expects it |
| Kindle Scribe | AZW3 | Handles typography and layouts |
| Kindle Keyboard / 4 / Touch | MOBI | Cleanest sideload over USB |
| First-gen Paperwhite (2012) | MOBI | Limited AZW3 styling support |
| Kindle DX / DXG | MOBI | Pre-KF8 hardware |

The pattern is simple: anything from 2015 onward wants AZW3, anything older wants MOBI. That settles the whole "mobi vs azw3 for kindle" question.`
    },
    {
      heading: `What AZW3 Actually Is`,
      body: `AZW3 is Amazon's consumer name for **KF8 (Kindle Format 8)**, the format that replaced plain MOBI around 2011. Under the hood it's an EPUB-like package with Amazon's extensions bolted on.

What that buys you:
- **Real CSS support** — margins, padding, floats, and media queries that actually work
- **Embedded fonts** — the book looks identical on every device, not just the system default
- **Enhanced typesetting** — hyphenation, kerning, and word spacing that newer Kindles apply automatically
- **Fixed layout** — picture books and comics render as the designer intended

In short, AZW3 is what a modern ebook is supposed to be on Amazon's hardware.`
    },
    {
      heading: `What MOBI Actually Is`,
      body: `MOBI comes from Mobipocket, a French company Amazon bought in 2005 and quietly retired. The format dates to an era when e-readers had monochrome screens and almost no styling horsepower.

It carries a small slice of CSS and drops most of it. No embedded fonts. No real tables. No fancy layouts. A MOBI file is closer to a plain text document with light formatting than to a designed book.

Amazon stopped accepting MOBI through **Send to Kindle in August 2022**, which tells you everything about where the format sits today.`
    },
    {
      heading: `AZW3 vs MOBI, Feature by Feature`,
      body: `Here's the honest comparison, not the marketing version.

| Feature | AZW3 (KF8) | MOBI |
|---------|------------|------|
| Styling | Modern CSS, floats, media queries | Bare minimum CSS |
| Fonts | Embedded, device-independent | Device default only |
| Tables & images | Handled well | Chokes on complex ones |
| File size | Slightly larger | Leaner |
| Device support | Every Kindle from the last decade | Every Kindle ever made |
| Future-proofing | Amazon's active format | Frozen since 2022 |

There's no category where MOBI beats AZW3 on quality. The only places MOBI still wins are compatibility with ancient hardware and a few stubborn legacy tools.`
    },
    {
      heading: `When AZW3 Is the Right Call`,
      body: `Pick AZW3 whenever any of these are true:
- Your Kindle is from 2015 or later (Paperwhite 3, Oasis, any current model)
- The book has illustrations, tables, or custom typography you care about
- You want it to look the same across every device
- You're building a library you expect to keep for years

AZW3 is also the format to aim for if you ever use Send to Kindle, because that service converts your upload into KF8 on Amazon's side anyway. If your reading happens off Kindle, [convert EPUB to AZW3](/convert/epub-to-azw3) is the bridge from the open standard most books start as. Need the raw files instead? [Convert EPUB to ZIP](/convert/epub-to-zip) to pull the XHTML, CSS, and images out of any e-book in one click.`
    },
    {
      heading: `When MOBI Still Makes Sense`,
      body: `MOBI isn't completely dead. A few situations still call for it:
- **Old hardware** — Kindle Keyboard, Kindle 4, Kindle Touch, and first-gen Paperwhites often only sideload MOBI cleanly over USB
- **No account, no Wi-Fi** — if you're handing someone a file on a stick with no Amazon login, MOBI is the lowest-common-denominator target
- **Legacy libraries** — if your existing collection is all MOBI and you don't want to re-process it

If none of those describe you, MOBI is just a worse AZW3.`
    },
    {
      heading: `Converting Between the Two`,
      body: `Moving from one to the other is straightforward because both run through Calibre's engine.

- **AZW3 to MOBI** — [convert on BookConv](/convert/azw3-to-mobi) for a single file, no install required. Expect MOBI to drop the fancy styling AZW3 carried.
- **MOBI to EPUB** — [use the BookConv converter](/convert/mobi-to-epub) if your reading has moved off Kindle entirely.
- **EPUB to AZW3** — the best target for a modern Kindle; [BookConv handles it](/convert/epub-to-azw3) in the browser. For a complete walkthrough on converting EPUB to AZW3 while preserving your book's formatting, see our [EPUB to AZW3 for Kindle guide](/guide/epub-to-azw3-for-kindle).

For a desktop workflow with full output-profile control, Calibre's **Convert books** dialog lets you pick the exact format and tweak margins, headings, and reading order. Already have a MOBI and need a different output? You can also turn it into a printable document ([MOBI to PDF](/convert/mobi-to-pdf)) or pull just the words ([MOBI to TXT](/convert/mobi-to-txt)). For the full Kindle format picture including KFX, see [Kindle Formats Explained](/guide/kindle-formats).

Desktop Calibre is worth installing only if you're batch-converting a whole shelf at once. For one or two books, the web converter is faster.       For the bigger picture across formats, our [ebook formats comparison](/blog/ebook-formats-explained) lays it out side by side.`
    },
    {
      heading: `AZW3 vs MOBI: File Size, Sideloading, and Send to Kindle`,
      body: `Two practical questions decide the format long before you compare styling: how big is the file, and how are you getting it onto the device?

**File size.** AZW3 is a little larger because it carries embedded fonts and richer layout data; MOBI is leaner. For a typical novel the gap is under a megabyte, so size almost never decides the choice — quality does.

**Sideloading vs Send to Kindle.** Amazon removed MOBI from Send to Kindle in August 2022, so if you email a book or use the app, AZW3 (or EPUB, which Amazon converts to KF8) is the path that works. Direct USB sideloading still accepts MOBI on every Kindle ever made, which is why MOBI survives for old hardware.

- **Emailing or using Send to Kindle** — send AZW3 or EPUB; MOBI will be rejected.
- **USB to a 2015+ Kindle** — AZW3 loads with full styling.
- **USB to a pre-2015 Kindle** — MOBI is the clean sideload target.

When you already have one format and need the other, [convert AZW3 to MOBI](/convert/azw3-to-mobi) for an old device. To move a legacy MOBI toward AZW3, [convert MOBI to EPUB](/convert/mobi-to-epub) first — but note you only recover the container, never the styling MOBI discarded in the first place.`
    },
    {
      heading: `Which File Should You Download or Buy?`,
      body: `When a retailer or library offers the same book as both AZW3 and MOBI, the choice is almost always AZW3.

- **Pick AZW3** when the device is from 2015 or later, when you care about fonts and layout, or when you want the file to still look right in five years.
- **Pick MOBI only** for a specific old Kindle (Keyboard, 4, Touch, first-gen Paperwhite) or a legacy e-reader that can't open AZW3 cleanly over USB.
- **Already hold MOBI and want AZW3 quality?** You can convert, but the embedded fonts and advanced CSS MOBI discarded won't return — start from the original EPUB if you still have it.

If your reading has moved off Kindle entirely, [convert MOBI to EPUB](/convert/mobi-to-epub) to get back into the open standard most apps and e-readers share.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **AZW3 is the modern format** — KF8 with real CSS, embedded fonts, and tables; the right target for any Kindle from the last decade.
- **MOBI is legacy** — limited styling, no embedded fonts, and dropped from Send to Kindle in August 2022.
- **MOBI only wins on old hardware** — pre-2015 Kindles and a few legacy tools are the sole holdouts.
- **Converting drops quality one way** — AZW3 to MOBI loses styling, not text; it can't be recovered going back.
- **One engine does it all** — Calibre powers both BookConv and the desktop app, so the output is the same either way.`
    }
  ]
};

export const faqs = [
  {
    question: `Is AZW3 better than MOBI?`,
    answer: `Yes, for any modern Kindle. AZW3 (KF8) supports modern CSS, embedded fonts, and tables; MOBI supports almost none of that. MOBI only wins on compatibility with pre-2015 hardware.`,
  },
  {
    question: `Can my Kindle read both AZW3 and MOBI?`,
    answer: `Every Kindle ever made reads MOBI, and every model from the last decade reads AZW3. The difference is that older devices can't display AZW3's extra styling, so it falls back to a plainer look.`,
  },
  {
    question: `Which should I send to my Kindle?`,
    answer: `Send AZW3, or send EPUB through Send to Kindle (which becomes KF8 on Amazon's side). Use MOBI only for very old devices that don't handle AZW3 well over USB.`,
  },
  {
    question: `Does converting AZW3 to MOBI lose quality?`,
    answer: `It loses styling, not text. Embedded fonts, complex tables, and advanced CSS are dropped because MOBI can't represent them. The words and chapter structure survive.`,
  },
  {
    question: `What's the difference between AZW3 and KFX?`,
    answer: `KFX is Amazon's even newer format with enhanced typesetting and compliance features, used for Store purchases. AZW3/KF8 is the open-to-converters format you'll actually produce yourself.`,
  },
  {
    question: `Can I convert MOBI back to AZW3?`,
    answer: `You can, but you won't recover what MOBI threw away. Converting MOBI to AZW3 gives you the container; the lost fonts and layout don't come back. Start from the original EPUB if you still have it.`,
  },
  {
    question: `Is AZW3 the same as KF8?`,
    answer: `Yes. AZW3 is Amazon's consumer-facing name; KF8 (Kindle Format 8) is the technical specification. They refer to the same format.`,
  },
  {
    question: `Does AZW3 work on Kindle?`,
    answer: `Yes. Every Kindle released in the last decade reads AZW3 (KF8) natively — Paperwhite 3 and later, Oasis, Voyage, and every current model. Only pre-2015 devices lack the styling engine to show AZW3's extras, but they still open the file.`,
  },
  {
    question: `MOBI or AZW3 — which should I use for my Kindle?`,
    answer: `Use AZW3 for any Kindle made in 2015 or later; it keeps your embedded fonts, tables, and CSS. Reach for MOBI only if you're sideloading onto a very old Kindle (Keyboard, Touch, first-gen Paperwhite) that chokes on AZW3 over USB.`,
  },
  {
    question: `Can a Kindle read AZW3 files directly?`,
    answer: `Yes. Send the .azw3 file over USB, email it to your Send-to-Kindle address, or convert from EPUB first — any modern Kindle opens it. Amazon's own publishing pipeline outputs KF8, so AZW3 is the format the hardware expects.`,
  },
  {
    question: `Mobi vs AZW3 for Kindle — which one do I actually need?`,
    answer: `Match the format to your device. Any Kindle from 2015 or later (Paperwhite 3, Oasis, Voyage, current models) should use AZW3 — it preserves fonts, tables, and CSS. Only reach for MOBI on pre-2015 Kindles (Keyboard, Touch, first-gen Paperwhite) where AZW3 won't sideload cleanly over USB. If you're unsure which device you own, AZW3 is the safe default.`,
  },
  {
    question: `Does Send to Kindle accept MOBI?`,
    answer: `No. Amazon removed MOBI from Send to Kindle in August 2022. Send AZW3, or send EPUB and let Amazon convert it to KF8 on their side. MOBI still works for direct USB sideloading on older devices.`,
  }
];

export const es = {
  title: `MOBI vs AZW3: qué formato de Kindle conviene en 2026`,
  content: {
    intro: `Usa AZW3 en cualquier Kindle de la última década; MOBI solo importa en hardware previo a 2015. Esta guía gratuita elige un ganador claro para AZW3 vs MOBI y muestra cómo convertir en cualquier sentido sin registro, en un clic.`,
    sections: [
      {
        heading: `La versión corta`,
        body: `Usa **AZW3** para cualquier Kindle fabricado en la última década. Renderiza CSS moderno, conserva las fuentes embebidas y maneja tablas y diseños complejos. Recurre a **MOBI** solo cuando alimentas un Kindle lo bastante viejo para no soportar estilos decentes, o cuando el software que usas nunca aprendió nada más nuevo.

Si no estás seguro de qué dispositivo tienes, AZW3 es el valor seguro por defecto. Es el formato que produce la propia cadena de publicación de Amazon, y es lo que Send to Kindle construye por detrás.`,
      },
      {
        heading: `AZW3 vs MOBI para Kindle: la decisión en 10 segundos`,
        body: `¿No sabes qué formato necesita tu Kindle? Todo se reduce a la antigüedad del dispositivo.

- **Kindle de 2015 o posterior** (Paperwhite 3, Oasis, Voyage, cualquier modelo actual) — usa **AZW3**. Es lo que produce la propia cadena de Amazon y conserva fuentes, tablas y CSS.
- **Kindle anterior a 2015** (Keyboard, 4, Touch, Paperwhite de primera generación) — usa **MOBI** solo si AZW3 falla por USB.
- **¿No estás seguro?** AZW3 es el valor seguro por defecto.

| Tu Kindle | Usa | Por qué |
|-----------|-----|---------|
| Paperwhite 3 o posterior (2015+) | AZW3 | Motor de estilos completo, fuentes embebidas |
| Oasis, Voyage, cualquier modelo actual | AZW3 | Diseñado en torno a KF8 |
| Kindle Basic (2019, 2022, 2024) | AZW3 | El firmware moderno lo espera |
| Kindle Scribe | AZW3 | Maneja tipografía y diseños |
| Kindle Keyboard / 4 / Touch | MOBI | Carga más limpia por USB |
| Paperwhite de primera generación (2012) | MOBI | Soporte limitado de estilos AZW3 |
| Kindle DX / DXG | MOBI | Hardware previo a KF8 |

El patrón es simple: cualquier cosa de 2015 en adelante quiere AZW3, lo anterior quiere MOBI. Así se resuelve la duda "mobi vs azw3 para kindle".`,
      },
      {
        heading: `Qué es AZW3 realmente`,
        body: `AZW3 es el nombre de consumo de **KF8 (Kindle Format 8)**, el formato que reemplazó al MOBI plano cerca de 2011. Por dentro es un paquete parecido a EPUB con las extensiones de Amazon añadidas.

Lo que eso te da:
- **Soporte real de CSS** — márgenes, padding, floats y media queries que sí funcionan
- **Fuentes embebidas** — el libro se ve idéntico en cada dispositivo, no solo en la fuente del sistema
- **Tipografía mejorada** — guionado, kerning y espaciado de palabras que los Kindles modernos aplican automáticamente
- **Diseño fijo** — los álbumes ilustrados y los cómics se renderizan como diseñó el autor

En resumen, AZW3 es lo que un ebook moderno debería ser en el hardware de Amazon.`,
      },
      {
        heading: `Qué es MOBI realmente`,
        body: `MOBI viene de Mobipocket, una empresa francesa que Amazon compró en 2005 y retiró en silencio. El formato data de una época en que los lectores tenían pantallas monocromas y casi ninguna capacidad de estilo.

Lleva una porción mínima de CSS y descarta la mayor parte. Sin fuentes embebidas. Sin tablas reales. Sin diseños elaborados. Un archivo MOBI se acerca más a un documento de texto plano con formato ligero que a un libro diseñado.

Amazon dejó de aceptar MOBI en **Send to Kindle en agosto de 2022**, lo que dice todo sobre dónde está el formato hoy.`,
      },
      {
        heading: `AZW3 vs MOBI, característica por característica`,
        body: `Esta es la comparación honesta, no la versión de marketing.

| Característica | AZW3 (KF8) | MOBI |
|---------|------------|------|
| Estilos | CSS moderno, floats, media queries | CSS mínimo |
| Fuentes | Embebidas, independientes del dispositivo | Solo la fuente del dispositivo |
| Tablas e imágenes | Las maneja bien | Se ahoga con las complejas |
| Tamaño de archivo | Algo mayor | Más ligero |
| Soporte de dispositivos | Cualquier Kindle de la última década | Cualquier Kindle hecho |
| A prueba de futuro | El formato activo de Amazon | Congelado desde 2022 |

No hay ninguna categoría donde MOBI supere a AZW3 en calidad. Los únicos sitios donde MOBI todavía gana son la compatibilidad con hardware antiguo y unas pocas herramientas heredadas tercos.`,
      },
      {
        heading: `Cuándo AZW3 es la elección correcta`,
        body: `Elige AZW3 siempre que se cumpla cualquiera de estas:
- Tu Kindle es de 2015 o posterior (Paperwhite 3, Oasis, cualquier modelo actual)
- El libro tiene ilustraciones, tablas o tipografía personalizada que te importa
- Quieres que se vea igual en todos los dispositivos
- Estás construyendo una biblioteca que esperas conservar años

AZW3 también es el formato al que apuntar si alguna vez usas Send to Kindle, porque ese servicio convierte tu subida a KF8 del lado de Amazon de todos modos. Si tu lectura ocurre fuera de Kindle, [convert EPUB to AZW3](/convert/epub-to-azw3) es el puente desde el estándar abierto con el que empiezan la mayoría de los libros. ¿Necesitas los archivos en bruto? [Convierte EPUB a ZIP](/convert/epub-to-zip) para extraer el XHTML, CSS e imágenes de cualquier libro en un clic.`,
      },
      {
        heading: `Cuándo MOBI todavía tiene sentido`,
        body: `MOBI no está del todo muerto. Unas pocas situaciones todavía lo piden:
- **Hardware viejo** — Kindle Keyboard, Kindle 4, Kindle Touch y las Paperwhite de primera generación a menudo solo cargan MOBI limpiamente por USB
- **Sin cuenta, sin Wi-Fi** — si le pasas a alguien un archivo en un pendrive sin login de Amazon, MOBI es el objetivo de mínimo común denominador
- **Bibliotecas heredadas** — si tu colección existente es toda MOBI y no quieres reprocesarla

Si nada de eso te describe, MOBI es simplemente un AZW3 peor.`,
      },
      {
        heading: `Convertir entre ambos`,
        body: `Pasar de uno a otro es sencillo porque ambos pasan por el motor de Calibre.

- **AZW3 to MOBI** — [convierte en BookConv](/convert/azw3-to-mobi) para un solo archivo, sin instalar nada. Espera que MOBI descarte los estilos elaborados que llevaba AZW3.
- **MOBI to EPUB** — [usa el conversor de BookConv](/convert/mobi-to-epub) si tu lectura se alejó por completo de Kindle.
- **EPUB to AZW3** — el mejor objetivo para un Kindle moderno; [BookConv lo hace](/convert/epub-to-azw3) en el navegador.

Para un flujo de trabajo de escritorio con control total del perfil de salida, el diálogo **Convertir libros** de Calibre te deja elegir el formato exacto y ajustar márgenes, encabezados y orden de lectura. ¿Ya tienes un MOBI y necesitas otra salida? También puedes convertirlo en un documento imprimible ([MOBI a PDF](/convert/mobi-to-pdf)) o extraer solo las palabras ([MOBI a TXT](/convert/mobi-to-txt)). Para el panorama completo de formatos Kindle, incluido KFX, ve [Kindle Formats Explained](/guide/kindle-formats).

Calibre de escritorio vale la pena instalarlo solo si conviertes de golpe toda una estantería. Para uno o dos libros, el conversor web es más rápido. Para el panorama general entre formatos, nuestra [comparación de formatos de ebook](/blog/ebook-formats-explained) lo pone uno al lado del otro.`,
      },
      {
        heading: `Puntos clave`,
        body: `- **AZW3 es el formato moderno** — KF8 con CSS real, fuentes embebidas y tablas; el objetivo correcto para cualquier Kindle de la última década.
- **MOBI es heredado** — estilos limitados, sin fuentes embebidas y retirado de Send to Kindle en agosto de 2022.
- **MOBI solo gana en hardware antiguo** — los Kindle previos a 2015 y unas pocas herramientas heredadas son los únicos holdouts.
- **Convertir pierde calidad en un sentido** — AZW3 a MOBI pierde estilos, no texto; no se puede recuperar al volver.
- **Un mismo motor lo hace todo** — Calibre alimenta tanto a BookConv como a la app de escritorio, así que el resultado es el mismo en cualquier caso.`,
      },
    ],
  },
  faqs: [
    {
      question: `¿Es AZW3 mejor que MOBI?`,
      answer: `Sí, para cualquier Kindle moderno. AZW3 (KF8) soporta CSS moderno, fuentes embebidas y tablas; MOBI casi no soporta nada de eso. MOBI solo gana en compatibilidad con hardware previo a 2015.`,
    },
    {
      question: `¿Puede mi Kindle leer tanto AZW3 como MOBI?`,
      answer: `Todos los Kindle fabricados leen MOBI, y todos los modelos de la última década leen AZW3. La diferencia es que los dispositivos más viejos no pueden mostrar los estilos extra de AZW3, así que caen a un aspecto más simple.`,
    },
    {
      question: `¿Cuál debo enviar a mi Kindle?`,
      answer: `Envía AZW3, o envía EPUB por Send to Kindle (que se convierte a KF8 del lado de Amazon). Usa MOBI solo para dispositivos muy viejos que no manejan bien AZW3 por USB.`,
    },
    {
      question: `¿Convertir AZW3 a MOBI pierde calidad?`,
      answer: `Pierde estilos, no texto. Las fuentes embebidas, las tablas complejas y el CSS avanzado se descartan porque MOBI no puede representarlos. Las palabras y la estructura de capítulos sobreviven.`,
    },
    {
      question: `¿Cuál es la diferencia entre AZW3 y KFX?`,
      answer: `KFX es el formato aún más nuevo de Amazon, con tipografía mejorada y funciones de cumplimiento, usado para compras de la Tienda. AZW3/KF8 es el formato abierto a los conversores que tú mismo producirás.`,
    },
    {
      question: `¿Puedo convertir MOBI de vuelta a AZW3?`,
      answer: `Puedes, pero no recuperarás lo que MOBI tiró a la basura. Convertir MOBI a AZW3 te da el contenedor; las fuentes y el diseño perdidos no vuelven. Parte del EPUB original si todavía lo tienes.`,
    },
    {
      question: `¿Es AZW3 lo mismo que KF8?`,
      answer: `Sí. AZW3 es el nombre que Amazon usa para el consumidor; KF8 (Kindle Format 8) es la especificación técnica. Se refieren al mismo formato.`,
    },
    {
      question: `¿Funciona AZW3 en Kindle?`,
      answer: `Sí. Cualquier Kindle de la última década lee AZW3 (KF8) de forma nativa: Paperwhite 3 y posteriores, Oasis, Voyage y todos los modelos actuales. Solo los dispositivos previos a 2015 carecen del motor de estilos para mostrar las ventajas de AZW3, pero igual abren el archivo.`,
    },
    {
      question: `¿MOBI o AZW3 — cuál debo usar para mi Kindle?`,
      answer: `Usa AZW3 para cualquier Kindle fabricado en 2015 o después; conserva tus fuentes, tablas y CSS. Recurre a MOBI solo si cargas un Kindle muy viejo (Keyboard, Touch, Paperwhite de primera generación) que falla con AZW3 por USB.`,
    },
    {
      question: `¿Puede un Kindle leer archivos AZW3 directamente?`,
      answer: `Sí. Envía el archivo .azw3 por USB, mándalo a tu dirección Send-to-Kindle o conviértelo desde EPUB primero: cualquier Kindle moderno lo abre. La propia cadena de publicación de Amazon produce KF8, así que AZW3 es el formato que el hardware espera.`,
    },
    {
    question: `Mobi vs AZW3 para Kindle: ¿cuál necesito realmente?`,
    answer: `Elígelo según el dispositivo. Cualquier Kindle de 2015 o posterior (Paperwhite 3, Oasis, Voyage, modelos actuales) debe usar AZW3: conserva fuentes, tablas y CSS. Recurre a MOBI solo en Kindle previos a 2015 (Keyboard, Touch, Paperwhite de primera generación) donde AZW3 no carga bien por USB. Si no sabes qué dispositivo tienes, AZW3 es el valor seguro.`,
    },
  {
    question: `¿Acepta Send to Kindle el formato MOBI?`,
    answer: `No. Amazon eliminó MOBI de Send to Kindle en agosto de 2022. Envía AZW3, o envía EPUB y deja que Amazon lo convierta a KF8 de su lado. MOBI todavía funciona para carga directa por USB en dispositivos más viejos.`,
  },
  ],
};
