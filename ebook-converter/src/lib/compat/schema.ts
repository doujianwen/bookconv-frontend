// src/lib/compat/schema.ts
//
// 兼容性实测报告的数据模型。
// 显式类型、禁止 `any` —— 这是课程第 9 章要讲的 `CONTENT_MAP: Record<string, any>`
// 反面样板：同样的内容注册模式，这里用具体 interface 锁死形状。

export type VerdictStatus = "pass" | "warn" | "critical";

export interface CompatSample {
  /** 实测书目，如 "Alice's Adventures in Wonderland" */
  title: string;
  /** 样本来源，如 "Project Gutenberg #11" */
  source: string;
  sizeBytes: number;
  /** false = Gutenberg 原始格式样本；true = 经 Calibre 引导生成 */
  bootstrapped: boolean;
  /** bootstrapped=true 时记录引导路径，便于追溯 */
  bootstrapPath?: string;
}

export interface CompatCheck {
  /** 对应 verifyConversion 的 Verdict.id */
  id: string;
  /** 可读标签，如 "Table of contents preserved"（由 LABEL_MAP 映射） */
  label: string;
  severity: "critical" | "warn";
  passed: boolean;
  /** 来自 Verdict.message，如 "Output detected as 'pdf' but expected 'mobi'" */
  detail: string | null;
}

export interface CompatReport {
  /** 如 "epub-to-mobi-on-kindle-paperwhite" */
  slug: string;
  sourceFormat: string;
  targetFormat: string;
  /** 取自 verifyConversion 的整体判定 */
  verdict: VerdictStatus;
  /** ISO date-time */
  testedAt: string;
  /** 如 "calibre 7.21.0"，保证可复现 */
  engineVersion: string;
  /** 目标测试设备/环境（slug 中 on-* 的语义来源），如 "Kindle Paperwhite" */
  device?: string;
  sample: CompatSample;
  outputSizeBytes: number;
  checks: CompatCheck[];
}
