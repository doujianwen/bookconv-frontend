export const slug = "epub-to-doc";
export const title = "EPUB to DOC: Limits and DOCX Alternative";
export const metaDescription = "BookConv does not export legacy DOC. Learn how to create a text-based DOCX for Word instead, and what formatting is lost.";
export const level = "B";
export const wordCount = 447;
export const content = {
  hero: {"title": "EPUB to DOC: Legacy Word Limits and the DOCX Alternative", "subtitle": "BookConv does not export legacy .doc files. For an editable Word document, use the EPUB to Word tool to create a text-based .docx."},
  sections: [
    { heading: 'Can BookConv convert EPUB to DOC?', body: 'No. Legacy DOC (Word 97–2003) export is unavailable in BookConv. This page explains the format difference and the supported alternative; it does not provide a DOC uploader. Use [EPUB to Word (DOCX)](/convert/epub-to-word) if the receiving application accepts modern Word documents.' },
    { heading: 'DOC and DOCX are different formats', body: 'DOC is the older binary Word format. DOCX is an Office Open XML document. Renaming a .docx file to .doc does not convert it. If a submission portal specifically requires Word 97–2003, check its requirements before proceeding.' },
    { heading: 'How to get an editable Word document', body: '1. Open the [EPUB to Word converter](/convert/epub-to-word).\n2. Upload a DRM-free EPUB within the limit displayed by the uploader.\n3. Download the .docx and open it in Word or another compatible editor.\n4. Check the text, accents, paragraph order and missing elements against the original EPUB.\n\nA conversion backend may retain some formatting. The text-only DOCX fallback extracts chapter text into paragraphs and discards images, CSS layout and Word heading styles. Preservation is not guaranteed. Keep your original file.' },
    { heading: 'If a system requires legacy .doc', body: 'Create the DOCX first, then use a word processor that supports saving to Word 97–2003 .doc. This second step happens outside BookConv. Inspect the saved document and test it in the receiving system. BookConv does not guarantee that external conversion or compatibility.' },
    { heading: 'Choose an alternative for your task', body: 'For editable text use [EPUB to Word](/convert/epub-to-word). For plain text use [EPUB to TXT](/convert/epub-to-txt). For a fixed reading copy, see [EPUB to PDF](/convert/epub-to-pdf). In the reverse direction use [DOCX to EPUB](/convert/docx-to-epub); legacy DOC input must first be saved as DOCX outside BookConv. DRM is not removed.' },
    { heading: 'When to use the DOCX alternative', body: 'Use DOCX when the recipient needs editable text and accepts modern Word files. If a legacy upload portal requires .doc specifically, ask whether it also accepts DOCX before converting. For reading on an ebook device, keeping the original EPUB is usually more useful than creating a Word document. The alternative is intended for text editing, not for reproducing the original page design.' },
    { heading: 'EPUB vs DOC vs DOCX: comparison', body: '| Format | Purpose | BookConv output |\n| --- | --- | --- |\n| EPUB | Reflowable ebook for reading | Keep your original source |\n| DOC | Legacy Word binary document | Not available |\n| DOCX | Editable modern Word document | Available through EPUB to Word; preservation varies |\n\nDOCX and DOC are different containers. A receiving system that validates file contents may reject a renamed file even if its filename ends in .doc.' },
    { heading: 'Quality checklist for a Word editing copy', body: 'Compare the first, middle and final chapters with the original. Check accents and special characters, missing paragraphs, repeated headings and chapter order. If images matter, inspect every figure: the text-only fallback does not include them. Do not assume footnotes, links or a table of contents survived. Keep the EPUB and manually repair the editing copy before sending it to someone else.' },
  ],
  faq: [
    { q: 'Is there a free EPUB to DOC converter here?', a: 'BookConv does not create .doc files. The EPUB to Word tool creates a text-based .docx without requiring an account.' },
    { q: 'Will the DOCX keep images and heading styles?', a: 'Not guaranteed. A conversion backend may retain some elements; the text-only fallback rebuilds chapter text as paragraphs without images, CSS layout or Word heading styles.' },
    { q: 'Can I rename DOCX to DOC?', a: 'No. Use a word processor that can save to the required legacy format and check its output.' },
    { q: 'What are the upload limits for the alternative?', a: 'Use the limit shown by the Word uploader. Direct single-file upload supports up to 100 MB when enabled; fallback uploads are limited to 4 MB. A size limit is not a guarantee of conversion success.' },
    { q: 'When should I keep EPUB instead?', a: 'Keep EPUB for ebook reading and as your original source. DOCX is an editing copy whose formatting and images need inspection.' },
    { q: 'Does BookConv remove DRM for Word conversion?', a: 'No. Use files you have the right to convert and retain the original EPUB. Protected content may fail to convert.' },
  ]
};
export const es = {
  "title": "EPUB a DOC: límites y alternativa DOCX",
  "metaDescription": "BookConv no genera DOC antiguo. Convierte EPUB a Word con la alternativa DOCX de texto y consulta sus límites antes de subir el archivo.",
  "content": {
    "hero": {
      "title": "EPUB a DOC: límites y alternativa DOCX para Word",
      "subtitle": "BookConv no exporta archivos .doc antiguos. Para obtener texto editable en Word, utiliza la alternativa EPUB a Word (DOCX)."
    },
    "sections": [
      {
        "heading": "¿Necesitas un documento Word editable?",
        "body": "DOC y DOCX son formatos distintos. BookConv no genera DOC de Word 97–2003. Si necesitas editar el texto y aceptas DOCX, usa [EPUB a Word](/es/convert/epub-to-word). Esta página explica la alternativa disponible; no ofrece una conversión a DOC."
      },
      {
        "heading": "Cómo obtener un documento editable",
        "body": "1. Abre [EPUB a Word (DOCX)](/es/convert/epub-to-word).\n2. Sube un EPUB sin DRM dentro del límite mostrado.\n3. Descarga el .docx y ábrelo en un editor compatible.\n4. Compara los capítulos, los acentos y el orden del texto con el original.\n\nPuede utilizarse un motor de conversión o una alternativa de solo texto. Esta última crea párrafos sin imágenes, maquetación CSS ni estilos de título de Word. Revisa el resultado; su conservación no está garantizada. Guarda el EPUB original."
      },
      {
        "heading": "Si necesitas específicamente .doc",
        "body": "Guarda primero el DOCX y utiliza después un procesador de textos que permita guardar como Word 97–2003 .doc. Este paso se realiza fuera de BookConv. Cambiar la extensión del archivo no convierte el formato. Comprueba el resultado en el sistema de destino."
      },
      {
        "heading": "Otras opciones",
        "body": "Para texto sin formato utiliza [EPUB a TXT](/es/convert/epub-to-txt). Para la conversión inversa usa [DOCX a EPUB (en inglés)](/convert/docx-to-epub). Un DOC antiguo debe guardarse como DOCX antes de utilizar esa herramienta. BookConv no elimina DRM."
      }
    ],
    "faq": [
      {
        "q": "¿BookConv convierte EPUB a DOC?",
        "a": "No. La alternativa disponible genera un documento .docx con texto editable, no un archivo .doc antiguo."
      },
      {
        "q": "¿Se conservan las imágenes y los estilos?",
        "a": "No está garantizado. La alternativa de solo texto crea párrafos sin imágenes, maquetación CSS ni estilos de título. El resultado del motor puede ser distinto; revísalo."
      },
      {
        "q": "¿Puedo cambiar la extensión a .doc?",
        "a": "No. Utiliza un editor compatible para guardar en el formato antiguo y revisa el resultado."
      },
      {
        "q": "¿Cuál es el límite de subida?",
        "a": "Consulta el límite del conversor Word. La subida directa admite hasta 100 MB cuando está habilitada; la subida alternativa admite 4 MB. El tamaño permitido no garantiza el éxito de la conversión."
      }
    ]
  }
};
