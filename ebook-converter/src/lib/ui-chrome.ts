/**
 * UI chrome 文案（面包屑 / 小标题 / 按钮）西语化字典 —— M5-6
 *
 * 背景：M5-2 已把 guide/blog 正文与相关卡片西语化，但页面固定 chrome
 * （面包屑、Key Takeaways 小标题、Back to… 等）仍是硬编码英文，西语页读起来
 * 中英混杂。本模块提供单一文案源，页面按 isEs 取值，英文页行为完全不变。
 *
 * 纪律：只加 es 分支，不改英文既有文案（治理「最小改动」）。
 * 日期格式不在此字典——它需要 toLocaleDateString 的 locale 参数，页面直接传。
 *
 * 覆盖范围（两批落地）：
 * - 批次 1（2026-10-22 上半场）：guide/blog 详情页 chrome（面包屑/Key Takeaways/FAQ/
 *   相关区块/Back to…/Updated/Older/Newer）
 * - 批次 2（2026-10-22 下半场）：guide/blog/convert 索引页 + convert 工具页
 *   （ToolPageClient 及其子组件）固定文案
 */

/** 面包屑与固定标签 */
export const UI_CHROME = {
  home: { en: 'Home', es: 'Inicio' },
  guides: { en: 'Guides', es: 'Guías' },
  blog: { en: 'Blog', es: 'Blog' },
  keyTakeaways: { en: 'Key Takeaways', es: 'Conclusiones clave' },
  faq: { en: 'Frequently Asked Questions', es: 'Preguntas frecuentes' },
  backToAllGuides: { en: 'Back to all guides', es: 'Volver a todas las guías' },
  backToAllPosts: { en: 'Back to all posts', es: 'Volver a todos los artículos' },
  browseAllConverters: { en: 'Browse All Converters', es: 'Ver todos los conversores' },
  relatedPosts: { en: 'Related posts', es: 'Artículos relacionados' },
  relatedGuides: { en: 'Related Guides', es: 'Guías relacionadas' },
  moreGuides: { en: 'More guides', es: 'Más guías' },
  relatedBlogPosts: { en: 'Related blog posts', es: 'Artículos relacionados' },
  updated: { en: 'Updated', es: 'Actualizado' },
  older: { en: '← Older', es: '← Anterior' },
  newer: { en: 'Newer →', es: 'Siguiente →' },
  allGuidesTitle: { en: 'Guides', es: 'Guías' },
  // —— M5-6 第二批（guide/blog/convert 索引页 + convert 工具页 chrome）——
  breadcrumbLabel: { en: 'Breadcrumb', es: 'Migas de pan' },
  primaryNavLabel: { en: 'Primary navigation', es: 'Navegación principal' },
  footerNavLabel: { en: 'Footer navigation', es: 'Navegación del pie de página' },
  readTheBlog: { en: 'Read the blog →', es: 'Lee el blog →' },
  guidesIndexLead: { en: 'Practical fixes and how-tos for the ebook conversion problems people actually hit.', es: 'Soluciones prácticas y tutoriales para los problemas reales de conversión de ebooks.' },
  paginationLabel: { en: 'Blog pagination', es: 'Paginación del blog' },
  tryItYourself: { en: 'Try It Yourself', es: 'Pruébalo tú mismo' },
  pickFormatFree: { en: 'Pick a format pair and convert it free:', es: 'Elige un par de formatos y conviértelo gratis:' },
  converters: { en: 'Converters', es: 'Conversores' },
  allConversions: { en: 'All Ebook Conversions', es: 'Todas las conversiones de libros electrónicos' },
  backToHome: { en: 'Back to home', es: 'Volver al inicio' },
  quickAnswer: { en: 'Quick Answer', es: 'Respuesta rápida' },
  calibreEngine: { en: 'Powered by the Calibre engine', es: 'Funciona con el motor de Calibre' },
  formatFacts: { en: 'Format facts', es: 'Datos del formato' },
  keyTakeawaysTool: { en: 'Key takeaways', es: 'Conclusiones clave' },
  makeTheMost: { en: 'Make the most of your converted file:', es: 'Aprovecha al máximo tu archivo convertido:' },
  relatedArticles: { en: 'Related Articles', es: 'Artículos relacionados' },
  deepenUnderstanding: { en: 'Deepen your understanding with expert conversion guides:', es: 'Profundiza en el tema con guías de conversión de expertos:' },
  formatExplainers: { en: 'Format explainers and in-depth comparisons:', es: 'Explicativos de formato y comparaciones detalladas:' },
  videoTutorial: { en: 'Video Tutorial', es: 'Tutorial en vídeo' },
  stepsLabel: { en: 'Steps', es: 'Pasos' },
  trustedBy: { en: 'Trusted by thousands of readers worldwide', es: 'Con la confianza de miles de lectores en todo el mundo' },
  otherUsefulConversions: { en: 'Other Useful Conversions', es: 'Otras conversiones útiles' },
  batchUpTo20: { en: 'Up to 20 files per batch', es: 'Hasta 20 archivos por lote' },
  zipDownload: { en: 'ZIP download', es: 'Descarga en ZIP' },
  progressTracking: { en: 'Progress tracking', es: 'Seguimiento del progreso' },
  upgradePro: { en: 'Upgrade to Pro — $5/mo', es: 'Mejorar a Pro — 5 $/mes' },
  startFree: { en: 'Start free · No credit card required', es: 'Empieza gratis · Sin tarjeta de crédito' },
  // —— M5-7：convert 工具页交互 UI（上传/转换/下载 流程 + 静态文案）——
  // 说明：含格式名的动态文案（hero / How-to 步骤 / Why 描述 / 对比表标题）走
  // ToolPageClient 内联 isEs 分支；此处仅放无格式名的纯静态标签。
  cmpFeature: { en: 'Feature', es: 'Característica' },
  cmpDrm: { en: 'DRM Support', es: 'Soporte DRM' },
  cmpImage: { en: 'Image Support', es: 'Soporte de imágenes' },
  cmpReflow: { en: 'Reflowable Text', es: 'Texto refluible' },
  cmpOpen: { en: 'Open Standard', es: 'Estándar abierto' },
  cmpYes: { en: 'Yes', es: 'Sí' },
  cmpVaries: { en: 'Varies', es: 'Varía' },
  whyCompatibility: { en: 'Device Compatibility', es: 'Compatibilidad de dispositivos' },
  whyPreserve: { en: 'Preserve Your Library', es: 'Protege tu biblioteca' },
  whyInstant: { en: 'Instant & Free', es: 'Instantáneo y gratuito' },
  errFileTooLarge: { en: 'File too large', es: 'Archivo demasiado grande' },
  errConversionFailed: { en: 'Conversion failed', es: 'La conversión falló' },
  // 子组件：ConversionProgress
  cpUploading: { en: 'Uploading file...', es: 'Subiendo archivo...' },
  cpConverting: { en: 'Converting', es: 'Convirtiendo' },
  // 子组件：BeforeAfterComparison
  bacComplete: { en: 'Conversion complete! Your file is ready.', es: '¡Conversión completada! Tu archivo está listo.' },
  bacDoneShort: { en: 'Conversion complete!', es: '¡Conversión completada!' },
  bacDownload: { en: 'Download', es: 'Descargar' },
  bacStartOver: { en: 'Convert another file', es: 'Convertir otro archivo' },
  bacBefore: { en: 'BEFORE', es: 'ANTES' },
  bacAfter: { en: 'AFTER', es: 'DESPUÉS' },
  bacSizeChange: { en: 'Size change:', es: 'Cambio de tamaño:' },
  bacGrew: { en: '↑ File grew', es: '↑ El archivo creció' },
  bacShrunk: { en: '↓ File shrunk', es: '↓ El archivo se redujo' },
  bacLinkExpires: { en: 'Link expires in 5 minutes. Files are automatically deleted after download.', es: 'El enlace caduca en 5 minutos. Los archivos se eliminan automáticamente tras la descarga.' },
  // 子组件：FileDropZone（其余已在组件内 en/es 表，这里补缺失静态标签）
  fdzDropPrompt: { en: 'Drag & drop your file here', es: 'Arrastra y suelta tu archivo aquí' },
  fdzOrBrowse: { en: 'or click to browse', es: 'o haz clic para buscar' },
  fdzReading: { en: 'Reading file info...', es: 'Leyendo información del archivo...' },
  fdzMetadataUnavailable: { en: 'Metadata unavailable', es: 'Metadatos no disponibles' },
  fdzNoMetadata: { en: 'No metadata found', es: 'No se encontraron metadatos' },
  fdzDetailed: { en: 'Detailed File Information', es: 'Información detallada del archivo' },
  fdzTitle: { en: 'Title', es: 'Título' },
  fdzAuthor: { en: 'Author', es: 'Autor' },
  fdzPublisher: { en: 'Publisher', es: 'Editorial' },
  fdzLanguage: { en: 'Language', es: 'Idioma' },
  fdzIsbn: { en: 'ISBN', es: 'ISBN' },
  fdzPublished: { en: 'Published', es: 'Publicado' },
  fdzSubject: { en: 'Subject', es: 'Materia' },
  fdzDescription: { en: 'Description', es: 'Descripción' },
  fdzPages: { en: 'pages', es: 'páginas' },
  fdzUnsupported: { en: 'Unsupported format', es: 'Formato no compatible' },
  fdzFileTooLarge: { en: 'File too large — the free plan accepts files up to {mb}MB per upload.', es: 'Archivo demasiado grande: el plan gratuito acepta archivos de hasta {mb} MB por subida.' },
  // —— M5-7：FeedbackWidget（转换错误页 + 全站浮窗）——
  fwReportIssue: { en: 'Report this conversion issue', es: 'Reportar este problema de conversión' },
  fwSendFeedback: { en: 'Send us feedback', es: 'Envíanos tus comentarios' },
  fwInlineSubtitle: { en: 'Something went wrong? Tell us what happened and we will look into it.', es: '¿Algo salió mal? Cuéntanos qué pasó y lo revisaremos.' },
  fwFloatingSubtitle: { en: 'Questions, bugs, or ideas? We read every message.', es: '¿Preguntas, errores o ideas? Leemos cada mensaje.' },
  fwClose: { en: 'Close', es: 'Cerrar' },
  fwPlaceholder: { en: 'Describe what happened or share your idea…', es: 'Describe qué pasó o comparte tu idea…' },
  fwEmailPlaceholder: { en: 'Your email (optional, so we can reply)', es: 'Tu correo (opcional, para responderte)' },
  fwPrivacy: { en: 'We only collect this message and your optional email. Your files never leave your device.', es: 'Solo recopilamos este mensaje y tu correo opcional. Tus archivos nunca salen de tu dispositivo.' },
  fwError: { en: 'Something went wrong. Please email hello@bookconv.com instead.', es: 'Algo salió mal. Escríbenos a hello@bookconv.com.' },
  fwThanks: { en: "Thanks! We'll look into it.", es: '¡Gracias! Lo revisaremos.' },
  fwSending: { en: 'Sending…', es: 'Enviando…' },
  fwSend: { en: 'Send feedback', es: 'Enviar comentarios' },
  fwDidntWork: { en: "Conversion didn't work?", es: '¿La conversión no funcionó?' },
  fwTellUs: { en: 'Tell us what happened so we can fix it.', es: 'Cuéntanos qué pasó para poder arreglarlo.' },
  fwReportBtn: { en: 'Report this issue', es: 'Reportar este problema' },
  fwFeedbackLabel: { en: 'Feedback', es: 'Comentarios' },
} as const;

/** 按 locale 取 chrome 文案（es 缺项回退 en，禁抛错） */
export function chrome(key: keyof typeof UI_CHROME, isEs: boolean): string {
  const entry = UI_CHROME[key];
  return isEs ? entry.es : entry.en;
}

/** 日期 locale 标识：西语页用 es-ES，格式串与英文页保持一致的「long」形式 */
export const dateLocale = (isEs: boolean): string => (isEs ? 'es-ES' : 'en-US');