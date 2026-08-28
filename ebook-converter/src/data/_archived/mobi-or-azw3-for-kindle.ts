export const slug = `mobi-or-azw3-for-kindle`;
export const title = `MOBI or AZW3 for Kindle: Which Should You Send to Your Device?`;
export const date = `2026-08-08`;
export const author = "BookConv Team";
export const tags = ["AZW3", "MOBI", "Kindle", "Ebook Formats", "BookConv", "Calibre"];

export const content = {
  intro: `If you're holding an EPUB and wondering whether to turn it into MOBI or AZW3 before it hits your Kindle, the answer depends almost entirely on which Kindle you own. Both formats are Amazon's, both sideload fine, but they behave very differently on a 2024 Paperwhite versus a 2011 Keyboard. This is the practical decision guide: match the format to the device, not the other way around.`,
  sections: [
    {
      heading: `The 10-Second Answer`,
      body: `Send **AZW3** unless your Kindle predates 2015. AZW3 (Amazon's name for KF8) keeps your fonts, tables, and CSS, and every Kindle made in the last decade reads it natively. Reach for **MOBI** only when you're loading onto a genuinely old device that chokes on AZW3 over USB, or you're handing someone a file with no Amazon account and no Wi-Fi.

If you're not sure which model you have, AZW3 is the safe bet. It's what Amazon's own publishing pipeline produces, and it's what Send to Kindle builds behind the scenes when you email an EPUB.`
    },
    {
      heading: `Match the Format to Your Kindle`,
      body: `Here's the device-by-device call. When in doubt, the right column is your default.

| Your Kindle | Best format | Why |
|-------------|-------------|-----|
| Paperwhite 3 or later (2015+) | AZW3 | Full styling engine, embedded fonts |
| Oasis, Voyage, any current model | AZW3 | Designed around KF8 |
| Kindle Basic (2019, 2022, 2024) | AZW3 | Modern firmware expects it |
| Kindle Scribe | AZW3 | Handles typography and layouts |
| Kindle Keyboard / 4 / Touch | MOBI | Cleanest sideload over USB |
| First-gen Paperwhite (2012) | MOBI | Limited AZW3 styling support |
| Kindle DX / DXG | MOBI | Pre-KF8 hardware |

The pattern is simple: anything from 2015 onward wants AZW3, anything older wants MOBI.`
    },
    {
      heading: `Why AZW3 Is the Default for Modern Kindles`,
      body: `AZW3 is a KF8 package with Amazon's extensions — effectively an EPUB with extras. On a current Kindle that means:

- **Embedded fonts** so the book looks identical on every device, not just the system default
- **Real CSS** — margins, media queries, and floats that actually render
- **Tables and complex layouts** that MOBI would silently flatten
- **Enhanced typesetting** — hyphenation and kerning applied automatically

Most books you'll convert start life as EPUB, so the natural bridge is [convert EPUB to AZW3](/convert/epub-to-azw3). If you need the raw parts instead, [convert EPUB to ZIP](/convert/epub-to-zip) pulls the XHTML, CSS, and images out in one click.`
    },
    {
      heading: `When MOBI Is the Only Option`,
      body: `A few situations still call for MOBI:

- **Ancient hardware** — Kindle Keyboard, Kindle 4, Kindle Touch, and first-gen Paperwhites often only sideload MOBI cleanly over USB
- **No account, no Wi-Fi** — a stick drive with a .mobi is the lowest-common-denominator target for a device with no Amazon login
- **Legacy libraries** — if your existing shelf is all MOBI and you don't want to re-process it

Amazon dropped MOBI from Send to Kindle in August 2022, so the email path won't take it anymore. For those old devices, [convert EPUB to MOBI](/convert/epub-to-mobi) or [convert AZW3 to MOBI](/convert/azw3-to-mobi) is the move. If your reading has moved off Kindle entirely, [convert MOBI to EPUB](/convert/mobi-to-epub) frees the book.`
    },
    {
      heading: `Converting to the Right Format`,
      body: `Both AZW3 and MOBI run through the same Calibre engine, so the output is consistent whether you use the web converter or desktop Calibre.

- **EPUB to AZW3** — [do it on BookConv](/convert/epub-to-azw3) for a single file, no install
- **EPUB to MOBI** — [same converter](/convert/epub-to-mobi), choose MOBI as the target
- **AZW3 to MOBI** — expect to lose styling; MOBI can't represent what AZW3 carries

Desktop Calibre only earns its keep when you're batch-converting a whole shelf. For one or two books, the browser is faster. For the broader comparison across formats, our [AZW3 vs MOBI breakdown](/blog/azw3-vs-mobi) lays it out feature by feature, and [Kindle Formats Explained](/guide/kindle-formats) covers KFX and the rest.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Default to AZW3** for any Kindle from 2015 or later — it preserves fonts, tables, and CSS.
- **Reserve MOBI** for pre-2015 hardware that sideloads it more cleanly over USB.
- **Send to Kindle dropped MOBI** in August 2022, so use AZW3 or EPUB for the email path.
- **Converting drops quality one way** — AZW3 to MOBI loses styling, not text, and it can't be recovered.
- **One engine does it all** — Calibre powers both BookConv and the desktop app, so the result is the same either way.`
    }
  ]
};

export const faqs = [
  {
    question: `Should I use MOBI or AZW3 for my Kindle Paperwhite?`,
    answer: `Use AZW3. Any Paperwhite from 2015 onward (Paperwhite 3 and later) has the styling engine to render AZW3 natively, keeping your embedded fonts and tables. MOBI only makes sense on the first-gen 2012 Paperwhite.`,
  },
  {
    question: `Can I send AZW3 to an old Kindle?`,
    answer: `It will open, but a pre-2015 Kindle lacks the engine to show AZW3's extra styling, so it falls back to a plainer look. On those devices MOBI sideloads more cleanly over USB, which is why MOBI remains the choice for very old hardware.`,
  },
  {
    question: `Does Send to Kindle accept MOBI?`,
    answer: `No. Amazon removed MOBI from Send to Kindle in August 2022. Send AZW3, or send EPUB and let Amazon convert it to KF8 on their side. MOBI still works for direct USB sideloading on older devices.`,
  },
  {
    question: `Which format keeps my book's fonts and layout?`,
    answer: `AZW3. It supports embedded fonts, real CSS, and tables; MOBI supports almost none of that. If preserving typography matters, AZW3 is the only one of the two that delivers it.`,
  },
  {
    question: `How do I convert EPUB to the right Kindle format?`,
    answer: `For a modern Kindle, [convert EPUB to AZW3](/convert/epub-to-azw3). For a pre-2015 device, [convert EPUB to MOBI](/convert/epub-to-mobi). Both run in the browser on BookConv with no install.`,
  },
  {
    question: `Is AZW3 the same as KF8?`,
    answer: `Yes. AZW3 is Amazon's consumer-facing name; KF8 (Kindle Format 8) is the technical spec. They refer to the same format that every recent Kindle reads natively.`,
  }
];

export const es = {
  title: `MOBI o AZW3 para Kindle: ¿Cuál enviar a tu dispositivo?`,
  content: {
    intro: `Si tienes un EPUB y no sabes si convertirlo a MOBI o AZW3 antes de pasarlo a tu Kindle, la respuesta depende casi por completo de qué Kindle tienes. Ambos formatos son de Amazon, ambos se cargan bien, pero se comportan muy distinto en un Paperwhite de 2024 frente a un Keyboard de 2011. Esta es la guía práctica de decisión: empareja el formato con el dispositivo, no al revés.`,
    sections: [
      {
        heading: `La respuesta en 10 segundos`,
        body: `Envía **AZW3** a menos que tu Kindle sea anterior a 2015. AZW3 (el nombre de Amazon para KF8) conserva tus fuentes, tablas y CSS, y cualquier Kindle de la última década lo lee de forma nativa. Recurre a **MOBI** solo cuando cargas en un dispositivo verdaderamente viejo que falla con AZW3 por USB, o le pasas un archivo a alguien sin cuenta de Amazon ni Wi-Fi.

Si no estás seguro de qué modelo tienes, AZW3 es la apuesta segura. Es el formato que produce la propia cadena de publicación de Amazon, y es lo que Send to Kindle construye por detrás cuando envías un EPUB.`,
      },
      {
        heading: `Empareja el formato con tu Kindle`,
        body: `Esta es la decisión por dispositivo. Ante la duda, la columna derecha es tu valor por defecto.

| Tu Kindle | Mejor formato | Por qué |
|-------------|-------------|-----|
| Paperwhite 3 o posterior (2015+) | AZW3 | Motor de estilos completo, fuentes embebidas |
| Oasis, Voyage, cualquier modelo actual | AZW3 | Diseñado en torno a KF8 |
| Kindle Basic (2019, 2022, 2024) | AZW3 | El firmware moderno lo espera |
| Kindle Scribe | AZW3 | Maneja tipografía y diseños |
| Kindle Keyboard / 4 / Touch | MOBI | Carga más limpia por USB |
| Paperwhite de primera generación (2012) | MOBI | Soporte limitado de estilos AZW3 |
| Kindle DX / DXG | MOBI | Hardware previo a KF8 |

El patrón es simple: cualquier cosa de 2015 en adelante quiere AZW3, lo anterior quiere MOBI.`,
      },
      {
        heading: `Por qué AZW3 es el valor por defecto en Kindles modernos`,
        body: `AZW3 es un paquete KF8 con las extensiones de Amazon: básicamente un EPUB con extras. En un Kindle actual eso significa:

- **Fuentes embebidas** para que el libro se vea idéntico en cada dispositivo, no solo en la fuente del sistema
- **CSS real** — márgenes, media queries y floats que sí se renderizan
- **Tablas y diseños complejos** que MOBI aplanaría en silencio
- **Tipografía mejorada** — guionado y kerning aplicados automáticamente

La mayoría de los libros que convertirás nacen como EPUB, así que el puente natural es [convertir EPUB a AZW3](/convert/epub-to-azw3). Si necesitas las partes en bruto, [convierte EPUB a ZIP](/convert/epub-to-zip) para extraer el XHTML, CSS e imágenes en un clic.`,
      },
      {
        heading: `Cuándo MOBI es la única opción`,
        body: `Unas pocas situaciones todavía piden MOBI:

- **Hardware antiguo** — Kindle Keyboard, Kindle 4, Kindle Touch y las Paperwhite de primera generación a menudo solo cargan MOBI limpiamente por USB
- **Sin cuenta, sin Wi-Fi** — un pendrive con un .mobi es el objetivo de mínimo común denominador para un dispositivo sin login de Amazon
- **Bibliotecas heredadas** — si tu estantería existente es toda MOBI y no quieres reprocesarla

Amazon eliminó MOBI de Send to Kindle en agosto de 2022, así que la vía de correo ya no lo acepta. Para esos dispositivos viejos, [convierte EPUB a MOBI](/convert/epub-to-mobi) o [AZW3 a MOBI](/convert/azw3-to-mobi). Si tu lectura se alejó de Kindle, [convierte MOBI a EPUB](/convert/mobi-to-epub) para liberar el libro.`,
      },
      {
        heading: `Convertir al formato correcto`,
        body: `Tanto AZW3 como MOBI pasan por el mismo motor Calibre, así que el resultado es coherente sea el conversor web o Calibre de escritorio.

- **EPUB a AZW3** — [hazlo en BookConv](/convert/epub-to-azw3) para un solo archivo, sin instalar nada
- **EPUB a MOBI** — [el mismo conversor](/convert/epub-to-mobi), eligiendo MOBI como objetivo
- **AZW3 a MOBI** — espera perder estilos; MOBI no puede representar lo que AZW3 lleva

Calibre de escritorio solo merece la pena si conviertes de golpe toda una estantería. Para uno o dos libros, el navegador es más rápido. Para la comparación más amplia entre formatos, nuestra [comparativa AZW3 vs MOBI](/blog/azw3-vs-mobi) lo desglosa característica por característica, y [Kindle Formats Explained](/guide/kindle-formats) cubre KFX y el resto.`,
      },
      {
        heading: `Puntos clave`,
        body: `- **Usa AZW3 por defecto** para cualquier Kindle de 2015 o posterior: conserva fuentes, tablas y CSS.
- **Reserva MOBI** para hardware previo a 2015 que lo carga más limpiamente por USB.
- **Send to Kindle dejó caer MOBI** en agosto de 2022, así que usa AZW3 o EPUB para la vía de correo.
- **Convertir pierde calidad en un sentido** — AZW3 a MOBI pierde estilos, no texto, y no se puede recuperar.
- **Un mismo motor lo hace todo** — Calibre alimenta tanto a BookConv como a la app de escritorio, así el resultado es el mismo.`,
      },
    ],
  },
  faqs: [
    {
      question: `¿Debo usar MOBI o AZW3 para mi Kindle Paperwhite?`,
      answer: `Usa AZW3. Cualquier Paperwhite de 2015 en adelante (Paperwhite 3 y posteriores) tiene el motor de estilos para renderizar AZW3 de forma nativa, conservando tus fuentes e imágenes. MOBI solo tiene sentido en el Paperwhite de primera generación de 2012.`,
    },
    {
      question: `¿Puedo enviar AZW3 a un Kindle viejo?`,
      answer: `Se abrirá, pero un Kindle previo a 2015 carece del motor para mostrar los estilos extra de AZW3, así que cae a un aspecto más simple. En esos dispositivos MOBI se carga más limpiamente por USB, por eso MOBI sigue siendo la opción para hardware muy antiguo.`,
    },
    {
      question: `¿Acepta Send to Kindle el formato MOBI?`,
      answer: `No. Amazon eliminó MOBI de Send to Kindle en agosto de 2022. Envía AZW3, o envía EPUB y deja que Amazon lo convierta a KF8 de su lado. MOBI todavía funciona para carga directa por USB en dispositivos más viejos.`,
    },
    {
      question: `¿Qué formato conserva las fuentes y el diseño de mi libro?`,
      answer: `AZW3. Soporta fuentes embebidas, CSS real y tablas; MOBI casi no soporta nada de eso. Si conservar la tipografía importa, AZW3 es el único de los dos que lo logra.`,
    },
    {
      question: `¿Cómo convierto EPUB al formato Kindle correcto?`,
      answer: `Para un Kindle moderno, [convierte EPUB a AZW3](/convert/epub-to-azw3). Para un dispositivo previo a 2015, [convierte EPUB a MOBI](/convert/epub-to-mobi). Ambos funcionan en el navegador en BookConv sin instalar nada.`,
    },
    {
      question: `¿Es AZW3 lo mismo que KF8?`,
      answer: `Sí. AZW3 es el nombre que Amazon usa para el consumidor; KF8 (Kindle Format 8) es la especificación técnica. Se refieren al mismo formato que cualquier Kindle reciente lee de forma nativa.`,
    },
  ],
};
