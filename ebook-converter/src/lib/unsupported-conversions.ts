// src/lib/unsupported-conversions.ts
//
// 「两头堵」组合登记：这些转换既不在自建 Calibre 后端白名单（20 格式），
// CloudConvert 也根本没有对应的转换路径（2026-10-28 实证：官网三个转换页
// cloudconvert.com/epub-to-{doc,jpg,png} 全部 404 "This conversion type is
// not supported"，线上实测 100% CLOUD_CONVERT_ERROR 500）。
//
// 2026-11-01 第三例（doc-epub，反方向）：CC 官网 doc-to-epub 页同样 404，
// 且 Calibre 手册/官方 FAQ 输入格式清单无 DOC 仅 DOCX（自建后端亦无
// LibreOffice）⇒ 三源互证 100% 必败（Job 1f80d108 生产实证）。教训：
// 两头堵审计必须双向枚举，不能只沿单一源格式方向扫。
//
// 处置（用户拍板方案 A）：API 层 422 前置拦截 + 前端选择/落地页提示替代路径，
// 避免用户上传后才发现失败（省一次上传 + 一次 500 + 一次飞书告警）。
// 注意：这些组合都有 SEO 落地页在引流，页面保留但必须诚实展示。

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
    alternativeHref: "/convert/epub-to-word",
    alternativeLabel: "DOCX",
    noticeEn:
      "BookConv does not currently export legacy Word .doc files. Use DOCX for Word instead and inspect the downloaded document before replacing your source.",
    noticeEs:
      "BookConv no exporta actualmente archivos .doc antiguos de Word. Usa DOCX y comprueba el documento descargado antes de sustituir el original.",
  },
  "epub-jpg": {
    alternativeHref: "/convert/epub-to-pdf",
    alternativeLabel: "PDF",
    noticeEn:
      "BookConv does not currently render EPUB chapters as JPG images. Convert to PDF, inspect its layout, then export pages with a PDF tool that supports JPG.",
    noticeEs:
      "BookConv no convierte actualmente capítulos EPUB en imágenes JPG. Convierte a PDF, revisa el diseño y exporta las páginas con una herramienta compatible con JPG.",
  },
  "epub-png": {
    alternativeHref: "/convert/epub-to-pdf",
    alternativeLabel: "PDF",
    noticeEn:
      "BookConv does not currently render EPUB chapters as PNG images. Convert to PDF, inspect its layout, then export pages with a PDF tool that supports PNG.",
    noticeEs:
      "BookConv no convierte actualmente capítulos EPUB en imágenes PNG. Convierte a PDF, revisa el diseño y exporta las páginas con una herramienta compatible con PNG.",
  },
  // 2026-11-01 两头堵第三例（反方向）：DOC（Word 97-2003 二进制）作为输入在本服务当前配置中无可用
  // 转换引擎——Calibre 输入白名单仅 DOCX（官方 FAQ 明确建议先转 .docx），CC 官网
  // doc-to-epub 页 404。站内替代=DOCX→EPUB 纯 JS 路径。
  "doc-epub": {
    alternativeHref: "/convert/docx-to-epub",
    alternativeLabel: "DOCX",
    noticeEn:
      "BookConv does not currently support legacy Word .doc input for EPUB conversion. Open the file in Word or LibreOffice, save as .docx, then use DOCX to EPUB and check the output formatting.",
    noticeEs:
      "BookConv no admite actualmente archivos .doc antiguos para convertir a EPUB. Abre el archivo en Word o LibreOffice, guárdalo como .docx y usa DOCX a EPUB. Comprueba el formato del resultado.",
  },
};

/** 查询某组合是否为登记的不可行转换；是则返回提示信息，否则 undefined */
export function unsupportedConversionInfo(
  sourceFormat: string,
  targetFormat: string,
): UnsupportedConversionInfo | undefined {
  return UNSUPPORTED_CONVERSIONS[`${sourceFormat}-${targetFormat}`];
}
