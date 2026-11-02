export const slug = "epub-to-word";
export const title = "EPUB to Word Converter — Text-based DOCX";
export const metaDescription = "Convert EPUB chapter text to an editable Word DOCX online. No account required. Images, CSS layout and heading styles are not guaranteed.";
export const level = "B";
export const wordCount = 319;
export const content = {
  "hero": {
    "title": "EPUB to Word Converter — Text-based DOCX",
    "subtitle": "Create an editable .docx from EPUB chapter text. Images, CSS layout and Word heading styles are not guaranteed."
  },
  "sections": [
    {
      "heading": "How to convert EPUB to Word",
      "body": "1. Upload a DRM-free EPUB using the uploader above.\n2. Wait for processing, then download the DOCX.\n3. Open it in a compatible word processor and compare the text and chapter order with the original.\n\nNo account is required for single-file conversion. Keep the source EPUB."
    },
    {
      "heading": "What the current converter produces",
      "body": "BookConv may use a conversion backend or a text-only fallback. The fallback extracts chapter text and builds an Office Open XML document with paragraphs; it does not embed original images, retain CSS styling or create Word heading styles. It is useful for editing extracted text; it is not a faithful layout export. Legacy .doc output is unavailable. See [DOC format limits](/convert/epub-to-doc)."
    },
    {
      "heading": "Upload size, batch and pricing",
      "body": "Follow the limit displayed by the uploader. Direct single-file uploads support up to 100 MB when enabled; fallback uploads and every batch file are limited to 4 MB. Large or complex files may fail even within those limits. Batch conversion is free during public beta; Pro is planned after beta. BookConv does not remove DRM."
    },
    {
      "heading": "Related workflows",
      "body": "For plain text use [EPUB to TXT](/convert/epub-to-txt). To turn a modern Word document into an ebook, use [DOCX to EPUB](/convert/docx-to-epub). For background information see the [EPUB to Word guide](/blog/epub-to-word)."
    }
  ],
  "faq": [
    {
      "q": "Does EPUB to Word create DOC or DOCX?",
      "a": "It creates a .docx file. BookConv does not export legacy .doc."
    },
    {
      "q": "Are images and layout preserved?",
      "a": "Not guaranteed. The text-only fallback creates paragraphs without images, CSS layout or Word heading styles; backend output may differ. Check the downloaded document."
    },
    {
      "q": "Is EPUB to Word free?",
      "a": "Single-file conversion does not require an account. Batch conversion is free during public beta; Pro is planned after beta. Follow the upload limit shown by the tool."
    }
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
