export const slug = "epub-to-word";
export const title = "EPUB to Word Converter — Text-based DOCX";
export const metaDescription = "Convert EPUB chapter text to an editable Word DOCX online. No account required. Images, CSS layout and heading styles are not guaranteed.";
export const level = "B";
export const wordCount = 471;
export const content = {
  hero: {"title": "EPUB to Word Converter — Text-based DOCX", "subtitle": "Create an editable .docx from EPUB chapter text. Images, CSS layout and Word heading styles are not guaranteed."},
  sections: [
    { heading: 'How to convert EPUB to Word', body: '1. Upload a DRM-free EPUB using the uploader above.\n2. Wait for processing, then download the DOCX.\n3. Open it in a compatible word processor and compare the text and chapter order with the original.\n\nNo account is required for single-file conversion. Keep the source EPUB.' },
    { heading: 'What the current converter produces', body: 'BookConv may use a conversion backend or a text-only fallback. The fallback extracts chapter text and builds an Office Open XML document with paragraphs; it does not embed original images, retain CSS styling or create Word heading styles. It is useful for editing extracted text; it is not a faithful layout export. Legacy .doc output is unavailable. See [DOC format limits](/convert/epub-to-doc).' },
    { heading: 'Upload size, batch and pricing', body: 'Follow the limit displayed by the uploader. Direct single-file uploads support up to 100 MB when enabled; fallback uploads and every batch file are limited to 4 MB. Large or complex files may fail even within those limits. Batch conversion is free during public beta; Pro is planned after beta. BookConv does not remove DRM.' },
    { heading: 'Related workflows', body: 'For plain text use [EPUB to TXT](/convert/epub-to-txt). To turn a modern Word document into an ebook, use [DOCX to EPUB](/convert/docx-to-epub). For background information see the [EPUB to Word guide](/blog/epub-to-word).' },
    { heading: 'When to convert EPUB to Word', body: 'Create a Word editing copy when you need to revise extracted text, prepare notes or review your own manuscript in a word processor. Keep EPUB for reading. If a document must match a specific print layout, compare another export route or the original authoring file before relying on this tool. Word output is an editable copy, not a replacement for your original EPUB.' },
    { heading: 'EPUB vs Word DOCX: format comparison', body: '| Format | Main use | What to check |\n| --- | --- | --- |\n| EPUB | Reading with adjustable text | Reading order, navigation and source images |\n| DOCX | Editing in a word processor | Paragraphs, special characters, images and styles |\n| Legacy DOC | Older Word workflows | BookConv does not export this format |\n\nChanging the filename extension does not convert one format into another. Use the downloaded DOCX in software that supports Office Open XML.' },
    { heading: 'Quality checklist before sharing the DOCX', body: 'Open the downloaded file and compare several chapters, including the last one. Search for a distinctive sentence and accented characters. Check missing text, duplicate content, paragraph order and any figures you need. A backend may retain some formatting, while the text-only fallback creates paragraphs without images or Word heading styles. Add a table of contents, links or illustrations manually if needed.' },
    { heading: 'Troubleshooting an EPUB to Word result', body: 'If a file fails, confirm it is a valid DRM-free EPUB rather than a different format with a renamed extension. Respect the limit shown by the uploader and try a smaller representative file. Complex files may fail even within the size limit. If the DOCX opens but layout is simplified, that may be the text fallback rather than an upload problem. Keep the source and compare results before making further edits.' },
  ],
  faq: [
    { q: 'Does EPUB to Word create DOC or DOCX?', a: 'It creates a .docx file. BookConv does not export legacy .doc.' },
    { q: 'Are images and layout preserved?', a: 'Not guaranteed. The text-only fallback creates paragraphs without images, CSS layout or Word heading styles; backend output may differ. Check the downloaded document.' },
    { q: 'Is EPUB to Word free?', a: 'Single-file conversion does not require an account. Batch conversion is free during public beta; Pro is planned after beta. Follow the upload limit shown by the tool.' },
    { q: 'Does changing .docx to .doc create a legacy Word file?', a: 'No. The formats are different. Use a compatible word processor to save to the required legacy format outside BookConv.' },
    { q: 'Can I convert an encrypted EPUB?', a: 'BookConv does not remove DRM. Use a valid file that you are allowed to convert; protected files may fail.' },
    { q: 'What should I check after conversion?', a: 'Compare chapter order, text, accents, images and links with the original. Preserve the source EPUB and repair missing layout in your word processor.' },
  ]
};
export const es = {
  "title": "Convertir EPUB a Word — DOCX de texto",
  "metaDescription": "Convierte el texto de EPUB a Word DOCX online. Sin cuenta. No se garantiza conservar imágenes, maquetación CSS ni estilos de título.",
  "content": {
    "hero": {
      "title": "Convertir EPUB a Word — DOCX de texto",
      "subtitle": "Obtén texto editable en un archivo .docx. No se garantiza conservar imágenes, maquetación CSS ni estilos de título de Word."
    },
    "sections": [
      {
        "heading": "Cómo convertir EPUB a Word",
        "body": "1. Sube un EPUB sin DRM con el formulario de esta página.\n2. Espera y descarga el DOCX.\n3. Ábrelo en un procesador de textos compatible y compara los capítulos y los caracteres con el original. No necesitas una cuenta para convertir un archivo."
      },
      {
        "heading": "Qué contiene el resultado",
        "body": "La herramienta extrae el texto de los capítulos y crea párrafos en un documento Office Open XML. No se garantiza conservar imágenes, maquetación CSS ni estilos de título. Guarda el EPUB original. El resultado es DOCX, no DOC antiguo. Consulta los [límites de DOC](/es/convert/epub-to-doc)."
      },
      {
        "heading": "Tamaño, lotes y precio",
        "body": "Consulta el límite mostrado por el formulario. La subida directa admite hasta 100 MB cuando está habilitada; la subida alternativa y cada archivo por lotes admiten 4 MB. Los archivos grandes o complejos pueden fallar aun dentro del límite. Los lotes son gratuitos durante la beta pública; Pro está previsto para después. No se elimina DRM."
      },
      {
        "heading": "Otras herramientas",
        "body": "Para obtener texto sin formato, utiliza [EPUB a TXT](/es/convert/epub-to-txt). Para la dirección inversa consulta [DOCX a EPUB (en inglés)](/convert/docx-to-epub)."
      }
    ],
    "faq": [
      {
        "q": "¿El resultado es DOC o DOCX?",
        "a": "Es un archivo .docx. BookConv no genera el formato .doc antiguo."
      },
      {
        "q": "¿Se conservan imágenes y maquetación?",
        "a": "No está garantizado. La alternativa de solo texto genera párrafos sin imágenes, maquetación CSS ni estilos de título; el resultado del motor puede ser distinto."
      },
      {
        "q": "¿Es gratis?",
        "a": "No necesitas una cuenta para convertir un archivo. Los lotes son gratuitos durante la beta pública; Pro está previsto para después. Respeta el límite mostrado por el formulario."
      }
    ]
  }
};
