// src/data/compat/epub-to-mobi-on-kindle-paperwhite.ts
//
// ⚠️ PLACEHOLDER DATA —— 仅用于打通构建/部署链路（Step A–C 验证）。
// 必须由 scripts/generate-compat.ts（Step D）对真实 Project Gutenberg 样本
// 跑 verifyConversion() 后生成的真实数据替换。
// 切勿把此占位数据部署到生产环境：它违反 R1（每个数字都要有真实来源），
// 且属于 Google 规模化内容政策红线范畴。

import type { CompatReport } from "@/lib/compat/schema";

export const report: CompatReport = {
  slug: "epub-to-mobi-on-kindle-paperwhite",
  sourceFormat: "epub",
  targetFormat: "mobi",
  verdict: "pass",
  testedAt: "2026-01-01T00:00:00Z", // placeholder
  engineVersion: "calibre 7.x", // placeholder
  device: "Kindle Paperwhite",
  sample: {
    title: "Alice's Adventures in Wonderland",
    source: "Project Gutenberg #11",
    sizeBytes: 512_000,
    bootstrapped: false,
  },
  outputSizeBytes: 480_000,
  checks: [
    { id: "no-output", label: "Output file produced", severity: "critical", passed: true, detail: null },
    { id: "empty-output", label: "Output is non-empty", severity: "critical", passed: true, detail: null },
    { id: "format-mismatch", label: "Output matches target format", severity: "critical", passed: true, detail: null },
    { id: "content-loss", label: "Text content preserved", severity: "critical", passed: true, detail: null },
    { id: "mojibake", label: "No encoding corruption", severity: "critical", passed: true, detail: null },
  ],
};
