// src/lib/unsupported-conversions.ts
//
// 「两头堵」组合登记：这些转换既不在自建 Calibre 后端白名单（20 格式），
// CloudConvert 也根本没有对应的转换路径（2026-10-28 实证：官网三个转换页
// cloudconvert.com/epub-to-{doc,jpg,png} 全部 404 "This conversion type is
// not supported"，线上实测 100% CLOUD_CONVERT_ERROR 500）。
//
// 处置（用户拍板方案 A）：API 层 422 前置拦截 + 前端选择/落地页提示替代路径，
// 避免用户上传后才发现失败（省一次上传 + 一次 500 + 一次飞书告警）。
// 注意：这三个组合都有 SEO 落地页在引流，页面保留但必须诚实展示。

export interface UnsupportedConversionInfo {
  /** 推荐替代转换的站内路径（/convert/ 前缀路由） */
  alternativeHref: string;
  /** 替代格式的显示名 */
  alternativeLabel: string;
  /** EN 提示（API error 与前端共用语义，前端展示走 noticeEn/noticeEs） */
  noticeEn: string;
  /** ES 提示 */
  noticeEs: string;
}

/**
 * Key = `${source}-${target}`（与 CONVERSION_MAP 键一致）。
 * 仅登记确认不可行的组合；未来若后端补齐 ImageMagick 链（方案 B），
 * 从这里删除对应条目即可同时解除 API 与前端拦截。
 */
export const UNSUPPORTED_CONVERSIONS: Record<string, UnsupportedConversionInfo> = {
  "epub-doc": {
    alternativeHref: "/convert/epub-to-docx",
    alternativeLabel: "DOCX",
    noticeEn:
      "Direct EPUB-to-DOC conversion is not supported: no conversion engine can emit the legacy Word .doc format (modern Word opens .docx natively). Please convert to DOCX instead — same content, better compatibility.",
    noticeEs:
      "La conversión directa de EPUB a DOC no está disponible: ningún motor puede generar el formato .doc antiguo de Word (las versiones modernas de Word abren .docx). Convierte a DOCX en su lugar: el mismo contenido y mejor compatibilidad.",
  },
  "epub-jpg": {
    alternativeHref: "/convert/epub-to-pdf",
    alternativeLabel: "PDF",
    noticeEn:
      "Direct EPUB-to-JPG image conversion is not supported. Convert to PDF instead — it preserves the full layout and can be exported to JPG images with any PDF tool.",
    noticeEs:
      "La conversión directa de EPUB a imágenes JPG no está disponible. Convierte a PDF en su lugar: conserva todo el diseño y puede exportarse a imágenes JPG con cualquier herramienta PDF.",
  },
  "epub-png": {
    alternativeHref: "/convert/epub-to-pdf",
    alternativeLabel: "PDF",
    noticeEn:
      "Direct EPUB-to-PNG image conversion is not supported. Convert to PDF instead — it preserves the full layout and can be exported to PNG images with any PDF tool.",
    noticeEs:
      "La conversión directa de EPUB a imágenes PNG no está disponible. Convierte a PDF en su lugar: conserva todo el diseño y puede exportarse a imágenes PNG con cualquier herramienta PDF.",
  },
};

/** 查询某组合是否为登记的不可行转换；是则返回提示信息，否则 undefined */
export function unsupportedConversionInfo(
  sourceFormat: string,
  targetFormat: string,
): UnsupportedConversionInfo | undefined {
  return UNSUPPORTED_CONVERSIONS[`${sourceFormat}-${targetFormat}`];
}
