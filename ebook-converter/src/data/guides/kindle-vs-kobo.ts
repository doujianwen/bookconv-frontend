import { BlogFaq } from '../blog/types'

export const slug = 'kindle-vs-kobo'
export const title = 'Kindle vs Kobo: Which E-Reader Fits Your Book Library?'
export const metaTitle = 'Kindle vs Kobo: Which E-Reader Fits Your Books'
export const problem = 'Kindle and Kobo disagree on the one thing that decides everything: which files they open. Here is the format difference, the library and DRM mechanics, and the exact conversion bridges if you ever switch sides.'
export const date = '2026-10-22'
export const updatedAt = '2026-10-22'
export const tags = ['kindle vs kobo', 'kindle', 'kobo', 'epub', 'ereader comparison', 'ebook conversion']
export const formats = { source: 'epub', target: 'azw3' }
export const keyTakeaways = [
  'The single biggest difference is file format: Kobo opens EPUB natively, while a Kindle only accepts EPUB through Amazon Send to Kindle, which converts the file on Amazon servers before delivery.',
  'Sideloading is simpler on Kobo: copy a DRM-free EPUB over USB and it opens exactly as-is. On Kindle, the dependable sideload target is AZW3, which you produce by converting the EPUB yourself.',
  'Purchased books are locked to their store: Kindle Store titles (AZW3/KFX with Amazon DRM) do not open on Kobo, and Kobo store titles (EPUB with Adobe DRM) do not open on Kindle.',
  'Both handle library loans, but differently: Kobo has OverDrive/Libby built into the device (supported regions), while Kindle receives library loans through the Libby app where supported (mainly US/UK).',
  'Switching ecosystems is a one-time conversion job for DRM-free files: AZW3 or MOBI to EPUB for a Kobo, EPUB to AZW3 for a Kindle sideload.',
]
export const content = {
  intro: `Kindle or Kobo is not really a hardware question — screens from both camps are pleasant to read on, and neither brand has a meaningful display monopoly. The decision is made by your files. The two ecosystems disagree on which ebook formats they open natively, how purchases are protected, and how library loans arrive, and those three differences decide your daily routine more than any spec sheet. This guide walks through the format landscape first, then the practical routes for getting your existing library onto each device, and finally the conversion bridges that make switching between the two far less painful than it sounds.`,
  sections: [
    {
      heading: 'The core difference in one sentence',
      body: `Kobo opens EPUB natively. Kindle does not.

That is the whole split in one line. EPUB is the open standard used by almost every ebook store outside Amazon, so a Kobo treats the most common ebook file as its home format: you copy one over USB and it simply opens. A Kindle has no EPUB reader at all. The only way EPUB reaches a Kindle is through Amazon Send to Kindle, where the file is uploaded and converted on Amazon servers before delivery — or you convert it yourself to AZW3, the Kindle-native format, and copy it over.

Neither approach is wrong, but they create very different habits. On Kobo, your library stays in one universal format. On Kindle, your files either pass through Amazon conversion pipeline or you maintain AZW3 copies. What the Kindle formats actually are — AZW3, KFX, and the retired MOBI — is laid out in [our Kindle formats guide](/guide/kindle-formats).`,
    },
    {
      heading: 'Format support compared',
      body: `Here is how the two ecosystems handle the formats you are likely to own:

| Format | Kindle | Kobo |
|---|---|---|
| EPUB | Only via Send to Kindle (server-side conversion) | Native, opens as-is |
| AZW3 | Native (the sideload target) | Not supported |
| KFX | Store purchases only, Amazon-generated | Not supported |
| MOBI | Legacy sideload (existing files still open) | Supported natively |
| PDF | Native | Native |
| CBZ / CBR (comics) | Not supported (convert to EPUB/PDF) | Supported on most current models |
| FB2 | Not supported | Not supported |

Two rows deserve emphasis. The EPUB row is the reason comparison shoppers land on Kobo: an EPUB-heavy library from non-Amazon stores works there with zero conversion. The AZW3 row is the mirror image: Kindle styling features (embedded fonts, tables, drop caps) live in AZW3, and no Kobo will ever open one. The practical bridge in both directions is a one-step conversion, covered in the switching section below.`,
    },
    {
      heading: 'Sideloading: getting your own files onto each device',
      body: `Sideloading means moving files you already own onto the reader over USB, without a store in the middle.

**On Kobo:** connect over USB and drag DRM-free EPUB or PDF files into the device storage. The file you copied is the file that opens — no conversion step, no server round-trip. This is the most direct sideload experience of the two.

**On Kindle:** you have two routes. Send to Kindle accepts the EPUB directly, but Amazon converts it on their servers and the result sometimes flattens complex layouts, tables, and embedded fonts. The full-control route is to convert the EPUB to AZW3 yourself, verify the output, then copy it to the device: the walkthrough is in [EPUB to AZW3 for Kindle](/guide/epub-to-azw3-for-kindle), and the delivery-route trade-offs are compared in [How to Send EPUB to Kindle](/guide/how-to-send-epub-to-kindle).

The summary: Kobo sideloading is drag-and-drop; Kindle sideloading is drag-and-drop **after one conversion step**. For plain novels the difference is negligible. For cookbooks, textbooks, and styled books, the self-managed AZW3 conversion is actually the higher-fidelity option on either device.`,
    },
    {
      heading: 'Library books and DRM',
      body: `Both ecosystems support borrowing library ebooks, but the mechanics differ enough to matter for heavy borrowers.

**Kobo** has OverDrive/Libby integrated into the device itself (in supported regions: US, UK, Canada, Australia, New Zealand and several others): you browse your library collection, sign in, and borrow straight from the reader. The loan arrives as an Adobe-DRM EPUB that the device is authorized to open.

**Kindle** receives library loans through the Libby app on your phone (where supported — primarily the US and UK): borrow in Libby, choose Kindle as the delivery target, and Amazon delivers a Kindle-format copy to your device. The protected EPUB itself never touches the Kindle — Amazon handles the conversion of the loan through its own channel. The mechanics are described in [How to Read EPUB on Kindle](/guide/how-to-read-epub-on-kindle).

One more thing to be honest about: DRM cuts in both directions. Books bought from the Kobo store carry Adobe DRM and open only on Kobo-authorized devices or apps, just as Kindle Store books open only within the Amazon world. The freedom to move between devices belongs to DRM-free files — which is also what conversion tools can legally process.`,
    },
    {
      heading: 'Ecosystem: what each store locks in',
      body: `**Kindle** is built around the Amazon store: the largest ebook catalog, Kindle Unlimited subscription reading, Whispersync for position syncing, and X-Ray. Books you buy there arrive as AZW3/KFX with Amazon DRM. That library is a real asset — and a real commitment. It lives comfortably on Kindles, the Kindle app on phones and tablets, and nowhere else.

**Kobo** is owned by Rakuten and runs its own store with a comparable catalog in most regions, plus Kobo Plus, a subscription for ebooks and audiobooks. Kobo store purchases are EPUB files under Adobe DRM — the more portable protection scheme, but a lock nonetheless.

The decision rule that survives contact with reality: look at where your money already went. If your library is mostly Kindle purchases, a Kobo does not read any of it. If your library is mostly EPUB from non-Amazon stores, a Kindle cannot open any of it natively. Hardware preferences rarely outweigh several hundred already-purchased books.`,
    },
    {
      heading: 'Switching between Kindle and Kobo: the conversion bridges',
      body: `Switching sides — or keeping a device from each camp — is a one-time job for DRM-free files. The bridges:

**Kindle to Kobo.** Your AZW3 and MOBI files need to become EPUB. [AZW3 to EPUB](/convert/azw3-to-epub) converts with formatting preserved — chapters, cover, embedded fonts, and styles carry over, and the guide [AZW3 to EPUB: Remove Kindle Lock-in](/guide/azw3-to-epub-keep-formatting) walks the full path. Old MOBI files modernize the same way through [MOBI to EPUB](/convert/mobi-to-epub). Kobo store purchases themselves cannot be converted — Adobe DRM.

**Kobo to Kindle.** An EPUB has two destinations. Send to Kindle takes it directly and converts server-side — fine for text-first books. For styled books, convert [EPUB to AZW3](/convert/epub-to-azw3) first and copy over USB; the file you verified is what the device opens. For legacy Kindle hardware that predates AZW3, the target is MOBI instead.

**Which Kindle books can be converted?** Only DRM-free ones. Amazon purchases are DRM-wrapped by default and stay in the Kindle world; your own files and DRM-free purchases travel freely. A pre-flight checklist for spotting the difference is in [the DRM-free checklist](/blog/which-kindle-books-can-you-convert-drm-free-checklist).`,
    },
    {
      heading: 'Which one should you pick?',
      body: `| Your situation | Better fit |
|---|---|
| Library is mostly Kindle Store purchases | Kindle |
| Library is mostly EPUB from non-Amazon stores | Kobo |
| Heavy library borrower who wants borrowing on-device | Kobo (OverDrive built in) |
| Want one file format everywhere, forever | Kobo (EPUB native) |
| Want Amazon catalog depth and Kindle Unlimited | Kindle |
| Styled books (cookbooks, textbooks) you sideload yourself | Either — convert to AZW3 for Kindle, EPUB as-is on Kobo |
| Households with one of each | Keep libraries DRM-free where you can, convert as needed |

If the choice ends with devices from both camps, nothing is broken: EPUB is the shared currency of your DRM-free files, and the conversion bridges above take care of the Kindle side. BookConv converts between EPUB, AZW3, and MOBI free in the browser — no install, no account — which makes the switch an afternoon errand rather than a project.`,
    },
  ],
}
export const es = {
  title: 'Kindle vs Kobo: qué lector encaja con tu biblioteca',
  problem: 'Kindle y Kobo no se ponen de acuerdo en lo que decide todo: qué archivos abren. Aquí tienes la diferencia de formatos, la mecánica de bibliotecas y DRM, y los puentes de conversión exactos si cambias de bando.',
  keyTakeaways: [
    'La gran diferencia es el formato: Kobo abre EPUB de forma nativa; un Kindle solo acepta EPUB por Amazon Send to Kindle, que convierte el archivo en los servidores de Amazon antes de entregarlo.',
    'Cargar archivos es más simple en Kobo: copias un EPUB sin DRM por USB y se abre tal cual. En Kindle, el destino fiable por USB es AZW3, que produces convirtiendo tú mismo el EPUB.',
    'Los libros comprados están atados a su tienda: los títulos de Kindle Store (AZW3/KFX con DRM de Amazon) no abren en Kobo, y los de Kobo Store (EPUB con DRM de Adobe) no abren en Kindle.',
    'Ambos gestionan préstamos de biblioteca, pero distinto: Kobo trae OverDrive/Libby integrado en el dispositivo; Kindle recibe los préstamos por la app Libby donde esté disponible.',
    'Cambiar de ecosistema es una conversión única para archivos sin DRM: AZW3 o MOBI a EPUB para un Kobo, EPUB a AZW3 para un Kindle por USB.',
  ],
  content: {
    intro: `Kindle o Kobo no es realmente una pregunta de hardware: las pantallas de ambos son agradables para leer, y ninguna marca tiene el monopolio de la imagen. La decisión la marcan tus archivos. Los dos ecosistemas no coinciden en qué formatos de libro electrónico abren de forma nativa, cómo se protegen las compras y cómo llegan los préstamos de biblioteca, y esas tres diferencias deciden tu rutina diaria más que cualquier ficha técnica. Esta guía recorre primero el panorama de formatos, luego las rutas prácticas para llevar tu biblioteca actual a cada dispositivo, y al final los puentes de conversión que hacen cambiar de uno a otro mucho menos doloroso de lo que suena.`,
    sections: [
      {
        heading: 'La diferencia central en una frase',
        body: `Kobo abre EPUB de forma nativa. Kindle no.

Esa es toda la división en una línea. EPUB es el estándar abierto que usan casi todas las tiendas de libros electrónicos fuera de Amazon, así que un Kobo trata el archivo más común como su formato nativo: lo copias por USB y se abre tal cual. Un Kindle no tiene lector de EPUB. La única forma en que EPUB llega a un Kindle es por Amazon Send to Kindle, donde el archivo se sube y se convierte en los servidores de Amazon antes de entregarse —o lo conviertes tú mismo a AZW3, el formato nativo de Kindle, y lo copias por USB.

Ningún enfoque está mal, pero crean hábitos muy distintos. En Kobo, tu biblioteca se queda en un formato universal. En Kindle, tus archivos pasan por la conversión de Amazon o mantienes copias AZW3. Lo que realmente son los formatos de Kindle —AZW3, KFX y el ya retirado MOBI— se detalla en [nuestra guía de formatos Kindle](/guide/kindle-formats).`,
      },
      {
        heading: 'Soporte de formatos comparado',
        body: `Así gestionan los dos ecosistemas los formatos que probablemente tengas:

| Formato | Kindle | Kobo |
|---|---|---|
| EPUB | Solo por Send to Kindle (conversión en servidor) | Nativo, se abre tal cual |
| AZW3 | Nativo (destino por USB) | No compatible |
| KFX | Solo compras en tienda, generado por Amazon | No compatible |
| MOBI | Sideload legacy (los archivos existentes aún abren) | Compatible de forma nativa |
| PDF | Nativo | Nativo |
| CBZ / CBR (cómics) | No compatible (convierte a EPUB/PDF) | Compatible en la mayoría de modelos actuales |
| FB2 | No compatible | No compatible |

Dos filas merecen énfasis. La fila EPUB es la razón por la que los comparadores caen en Kobo: una biblioteca cargada de EPUB de tiendas fuera de Amazon funciona allí sin conversión. La fila AZW3 es el espejo: las funciones de estilo de Kindle (fuentes incrustadas, tablas, capitulares) viven en AZW3, y ningún Kobo lo abrirá jamás. El puente práctico en ambas direcciones es una conversión de un paso, que cubre la sección de cambio más abajo.`,
      },
      {
        heading: 'Cargar archivos: llevar tus propios libros a cada dispositivo',
        body: `Cargar archivos significa mover los que ya tienes al lector por USB, sin una tienda en medio.

**En Kobo:** conectas por USB y arrastras archivos EPUB o PDF sin DRM al almacenamiento del dispositivo. El archivo que copiaste es el que se abre —sin paso de conversión, sin ida y vuelta al servidor. Esta es la experiencia de carga más directa de las dos.

**En Kindle:** tienes dos rutas. Send to Kindle acepta el EPUB directamente, pero Amazon lo convierte en sus servidores y a veces aplana las maquetaciones complejas, las tablas y las fuentes incrustadas. La ruta de control total es convertir tú mismo el EPUB a AZW3, verificar la salida y luego copiarlo al dispositivo: el paso a paso está en [EPUB a AZW3 para Kindle](/guide/epub-to-azw3-for-kindle), y el contraste de rutas de entrega se compara en [Cómo enviar EPUB a Kindle](/guide/how-to-send-epub-to-kindle).

El resumen: cargar en Kobo es arrastrar y soltar; cargar en Kindle es arrastrar y soltar **tras un paso de conversión**. Para novelas sencillas la diferencia es despreciable. Para recetarios, libros de texto y libros con estilo, la conversión AZW3 que gestionas tú es en realidad la opción de mayor fidelidad en cualquiera de los dos dispositivos.`,
      },
      {
        heading: 'Libros de biblioteca y DRM',
        body: `Ambos ecosistemas admiten pedir prestado libros de biblioteca, pero la mecánica difiere lo bastante para importar a quienes leen mucho.

**Kobo** tiene OverDrive/Libby integrado en el propio dispositivo (en regiones admitidas: EE. UU., Reino Unido, Canadá, Australia, Nueva Zelanda y varias más): navegas tu colección, inicias sesión y pides prestado directamente desde el lector. El préstamo llega como EPUB con DRM de Adobe, que el dispositivo está autorizado para abrir.

**Kindle** recibe los préstamos de biblioteca por la app Libby en el móvil (donde esté disponible —principalmente EE. UU. y Reino Unido—): pides prestado en Libby, eliges Kindle como destino y Amazon entrega una copia en formato Kindle a tu dispositivo. El EPUB protegido en sí nunca toca el Kindle —Amazon gestiona la conversión del préstamo por su propio canal. La mecánica se describe en [Cómo leer EPUB en Kindle](/guide/how-to-read-epub-on-kindle).

Una cosa más, con honestidad: el DRM corta en ambas direcciones. Los libros comprados en la tienda Kobo llevan DRM de Adobe y abren solo en dispositivos o apps autorizados por Kobo, igual que los de Kindle Store abren solo dentro del mundo Amazon. La libertad de moverte entre dispositivos pertenece a los archivos sin DRM —que además son lo que las herramientas de conversión pueden procesar legalmente.`,
      },
      {
        heading: 'Ecosistema: qué encierra cada tienda',
        body: `**Kindle** se construye en torno a la tienda Amazon: el catálogo de libros electrónicos más grande, la suscripción de lectura Kindle Unlimited, Whispersync para sincronizar posición y X-Ray. Los libros que compras allí llegan como AZW3/KFX con DRM de Amazon. Esa biblioteca es un activo real —y un compromiso real—. Vive cómoda en los Kindles, en la app de Kindle para móviles y tabletas, y en ningún otro lado.

**Kobo** pertenece a Rakuten y gestiona su propia tienda con un catálogo comparable en la mayoría de regiones, más Kobo Plus, una suscripción de libros electrónicos y audiolibros. Las compras en la tienda Kobo son archivos EPUB con DRM de Adobe —el esquema de protección más portátil, pero un candado al fin y al cabo—.

La regla de decisión que sobrevive al contacto con la realidad: mira dónde ya se fue tu dinero. Si tu biblioteca es sobre todo compras en Kindle Store, un Kobo no lee ninguna. Si es sobre todo EPUB de tiendas fuera de Amazon, un Kindle no abre ninguna de forma nativa. Las preferencias de hardware rara vez superan varios cientos de libros ya comprados.`,
      },
      {
        heading: 'Cambiar entre Kindle y Kobo: los puentes de conversión',
        body: `Cambiar de bando —o mantener un dispositivo de cada— es un trabajo único para archivos sin DRM. Los puentes:

**Kindle a Kobo.** Tus archivos AZW3 y MOBI tienen que pasar a EPUB. [AZW3 a EPUB](/convert/azw3-to-epub) convierte conservando el formato —capítulos, portada, fuentes incrustadas y estilos se mantienen—, y la guía [AZW3 a EPUB: quita el candado Kindle](/guide/azw3-to-epub-keep-formatting) recorre el camino completo. Los MOBI antiguos se modernizan igual por [MOBI a EPUB](/convert/mobi-to-epub). Las compras en la tienda Kobo en sí no se pueden convertir —DRM de Adobe.

**Kobo a Kindle.** Un EPUB tiene dos destinos. Send to Kindle lo toma directamente y convierte en servidor —bien para libros de texto plano. Para libros con estilo, convierte [EPUB a AZW3](/convert/epub-to-azw3) primero y cópialo por USB; el archivo que verificaste es el que abre el dispositivo. Para hardware Kindle legacy anterior a AZW3, el destino es MOBI.

**¿Qué libros de Kindle se pueden convertir?** Solo los sin DRM. Las compras de Amazon llevan DRM por defecto y se quedan en el mundo Kindle; tus propios archivos y las compras sin DRM viajan libres. Una lista de comprobación previa para distinguirlos está en [la lista DRM-free](/blog/which-kindle-books-can-you-convert-drm-free-checklist).`,
      },
      {
        heading: '¿Cuál deberías elegir?',
        body: `| Tu situación | Mejor opción |
|---|---|
| Tu biblioteca es sobre todo compras en Kindle Store | Kindle |
| Tu biblioteca es sobre todo EPUB de tiendas fuera de Amazon | Kobo |
| Lee mucho de biblioteca y quiere pedir prestado en el dispositivo | Kobo (OverDrive integrado) |
| Quiere un formato de archivo único en todas partes, para siempre | Kobo (EPUB nativo) |
| Quiere catálogo profundo de Amazon y Kindle Unlimited | Kindle |
| Libros con estilo (recetarios, textos) que cargas tú | Cualquiera —convierte a AZW3 para Kindle, EPUB tal cual en Kobo |
| Hogares con uno de cada | Mantén bibliotecas sin DRM donde puedas, convierte según necesites |

Si la elección acaba con dispositivos de ambos bandos, no pasa nada: EPUB es la moneda compartida de tus archivos sin DRM, y los puentes de conversión de arriba se encargan del lado Kindle. BookConv convierte entre EPUB, AZW3 y MOBI gratis en el navegador —sin instalar, sin cuenta—, lo que convierte el cambio en un trámite de una tarde en lugar de un proyecto.`,
      },
    ],
  },
  faqs: [
    { question: '¿Kobo lee archivos EPUB de forma nativa?', answer: 'Sí. EPUB es el formato nativo de Kobo: copias un EPUB sin DRM por USB y se abre exactamente tal cual, sin conversión ni procesado en servidor. Esta es la gran diferencia práctica frente a Kindle, que no tiene lector de EPUB y solo acepta EPUB por la conversión Send to Kindle de Amazon.' },
    { question: '¿Puedo leer mis libros de Kindle en un Kobo?', answer: 'Solo los que no tienen DRM. Las compras en Kindle Store son archivos AZW3/KFX con DRM que no abren en Kobo. Tus propios archivos AZW3 o MOBI se convierten a EPUB —por ejemplo con la herramienta gratuita AZW3 a EPUB de BookConv— y luego funcionan en cualquier Kobo.' },
    { question: '¿Puedo leer libros EPUB de Kobo en mi Kindle?', answer: 'Los EPUB sin DRM, sí: envíalos por Amazon Send to Kindle, o convierte EPUB a AZW3 primero y cópialos por USB para control total del formato. Las compras en la tienda Kobo llevan DRM de Adobe y se quedan en el ecosistema Kobo.' },
    { question: '¿Cuál es mejor para libros de biblioteca, Kindle o Kobo?', answer: 'Ambos funcionan, distinto. Kobo trae OverDrive integrado en el dispositivo, así que navegas y pides prestado directamente en el lector. Kindle recibe los préstamos por la app Libby donde esté disponible, y Amazon los entrega en formato Kindle. Quien lee mucho suele preferir tener el préstamo en el dispositivo.' },
    { question: '¿Cargar archivos es más fácil en Kindle o en Kobo?', answer: 'En Kobo —arrastras un EPUB sin DRM por USB y se abre tal cual. En Kindle, el destino fiable por USB es AZW3, así que los EPUB necesitan primero un paso de conversión que gestionas tú. Para libros con estilo, ese paso de conversión produce justo el resultado más fiel en el dispositivo.' },
    { question: '¿Los libros de Kindle Unlimited funcionan en Kobo?', answer: 'No. Los títulos de Kindle Unlimited llevan DRM y están atados a la suscripción Amazon, así que solo abren en Kindles y en la app de Kindle. El equivalente en Kobo es Kobo Plus, que igualmente está bloqueado a dispositivos y apps Kobo.' },
    { question: '¿Qué formatos admite cada uno, Kindle y Kobo?', answer: 'Kindle: AZW3 de forma nativa, KFX para compras en tienda, MOBI para sideload legacy (solo archivos existentes), PDF, y EPUB solo por Send to Kindle. Kobo: EPUB y PDF de forma nativa, más cómics CBZ/CBR y MOBI en la mayoría de modelos actuales.' },
    { question: '¿BookConv convierte entre formatos Kindle y Kobo?', answer: 'Sí. BookConv convierte AZW3 y MOBI a EPUB para Kobo, y EPUB a AZW3 para cargar en Kindle —gratis en el navegador, sin cuenta ni instalación, con archivos eliminados automáticamente en menos de una hora. Las compras en tienda con DRM no se pueden procesar.' },
  ],
} satisfies import('./types').GuideEs
export const faqs: BlogFaq[] = [
  { question: 'Does Kobo read EPUB files natively?', answer: 'Yes. EPUB is Kobo\'s native format: copy a DRM-free EPUB over USB and it opens exactly as-is, no conversion or server-side processing. This is the single biggest practical difference from Kindle, which has no EPUB reader and only accepts EPUB through Amazon\'s Send to Kindle conversion.' },
  { question: 'Can I read my Kindle books on a Kobo?', answer: 'Only the DRM-free ones. Kindle Store purchases are DRM-protected AZW3/KFX files that will not open on Kobo. Your own AZW3 or MOBI files convert to EPUB — for example with BookConv\'s free AZW3 to EPUB tool — and then work on any Kobo.' },
  { question: 'Can I read Kobo EPUB books on my Kindle?', answer: 'DRM-free EPUBs, yes: send them through Amazon Send to Kindle, or convert EPUB to AZW3 first and copy over USB for full control over formatting. Kobo store purchases carry Adobe DRM and stay within the Kobo ecosystem.' },
  { question: 'Which is better for library ebooks, Kindle or Kobo?', answer: 'Both work, differently. Kobo has OverDrive built into the device, so you browse and borrow directly on the reader. Kindle receives library loans through the Libby app, where supported, and Amazon delivers them in a Kindle format. Heavy borrowers usually prefer having borrowing on-device.' },
  { question: 'Is sideloading easier on Kindle or Kobo?', answer: 'On Kobo — drag a DRM-free EPUB over USB and it opens as-is. On Kindle, the dependable sideload target is AZW3, so EPUB files need one self-managed conversion step first. For styled books, that conversion step actually produces the more faithful result on the device.' },
  { question: 'Do Kindle Unlimited books work on Kobo?', answer: 'No. Kindle Unlimited titles are DRM-protected and tied to the Amazon subscription, so they open only on Kindles and in the Kindle app. The equivalent on the Kobo side is Kobo Plus, which is likewise locked to Kobo devices and apps.' },
  { question: 'What formats do Kindle and Kobo each support?', answer: 'Kindle: AZW3 natively, KFX for store purchases, MOBI for legacy sideloading (existing files only), PDF, and EPUB only via Send to Kindle. Kobo: EPUB and PDF natively, plus CBZ/CBR comics and MOBI on most current models.' },
  { question: 'Does BookConv convert between Kindle and Kobo formats?', answer: 'Yes. BookConv converts AZW3 and MOBI to EPUB for Kobo, and EPUB to AZW3 for Kindle sideloading — free in your browser, no account or install, with files deleted automatically within an hour. DRM-protected store purchases cannot be processed.' },
]
// E-E-A-T authorship block
export const authorship = {
  author: 'BookConv Team',
  lastVerified: '2026-10-22',
  credentials: 'Based on Calibre engine maintenance and 10,000+ monthly conversions; format and DRM claims cross-checked against Kobo Help Center and Amazon Send to Kindle documentation',
  estimatedConversions: '10,000+ monthly',
}
