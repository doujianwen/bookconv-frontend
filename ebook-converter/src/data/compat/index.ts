// src/data/compat/index.ts
//
// 兼容性报告注册表。镜像 content/index.ts 的"单源数据 + index 注册"模式，
// 但用显式类型 `Record<string, CompatReport>`（对照 CONTENT_MAP 的 `any` 反面）。
// 新增报告由 scripts/generate-compat.ts 自动补 import + 条目。

import type { CompatReport } from "@/lib/compat/schema";
import * as epub_to_mobi_on_kindle_paperwhite from "./epub-to-mobi-on-kindle-paperwhite";

export const COMPAT_MAP: Record<string, CompatReport> = {
  "epub-to-mobi-on-kindle-paperwhite": epub_to_mobi_on_kindle_paperwhite.report,
};

export function getCompatReport(slug: string): CompatReport | null {
  return COMPAT_MAP[slug] ?? null;
}
