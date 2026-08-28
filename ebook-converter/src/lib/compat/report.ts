// src/lib/compat/report.ts
//
// 把 verifyConversion 的 VerificationResult 映射成课程展示用的 CompatReport
// （视图模型）。纯函数、无副作用、不调用 Calibre。

import type { VerificationResult, Verdict } from "@/lib/conversion-verifier";
import type { CompatReport, CompatCheck, CompatSample, VerdictStatus } from "./schema";

const LABEL_MAP: Record<string, string> = {
  "no-output": "Output file produced",
  "empty-output": "Output is non-empty",
  "format-unverified": "Output format verified",
  "format-mismatch": "Output matches target format",
  "content-loss": "Text content preserved",
  mojibake: "No encoding corruption",
  "image-loss": "Images preserved",
};

interface CoreCheck {
  id: string;
  severity: "critical" | "warn";
  applies: (ctx: {
    sourceFormat: string;
    targetFormat: string;
    textExtractable: boolean;
  }) => boolean;
}

// 核心检查项：即使通过也要展示（证明"测了哪些、全部通过"才是独有数据的价值）。
// 仅当适用于该转换对时才出现，避免冗余（如 epub→mobi 不会同时出现两条格式检查）。
const CORE_CHECKS: CoreCheck[] = [
  { id: "no-output", severity: "critical", applies: () => true },
  { id: "empty-output", severity: "critical", applies: () => true },
  { id: "format-mismatch", severity: "critical", applies: () => true },
  { id: "content-loss", severity: "critical", applies: (c) => c.textExtractable },
  { id: "mojibake", severity: "critical", applies: (c) => c.textExtractable },
  {
    id: "image-loss",
    severity: "warn",
    applies: (c) => c.sourceFormat === "epub" && c.targetFormat === "epub",
  },
];

function deriveVerdict(pass: boolean, findings: Verdict[]): VerdictStatus {
  if (pass) return "pass";
  return findings.some((f) => f.severity === "critical") ? "critical" : "warn";
}

export function toCompatReport(params: {
  slug: string;
  sourceFormat: string;
  targetFormat: string;
  result: VerificationResult;
  sample: CompatSample;
  engineVersion: string;
  testedAt: string;
  outputSizeBytes: number;
}): CompatReport {
  const {
    slug,
    sourceFormat,
    targetFormat,
    result,
    sample,
    engineVersion,
    testedAt,
    outputSizeBytes,
  } = params;

  // 文本可抽取 = 任一端为 epub（归档抽取）或 txt（纯文本读取）
  const textExtractable =
    sourceFormat === "txt" ||
    targetFormat === "txt" ||
    sourceFormat === "epub" ||
    targetFormat === "epub";

  const checks: CompatCheck[] = [];

  // 1) 失败发现优先（保持原始顺序）
  for (const f of result.findings) {
    checks.push({
      id: f.id,
      label: LABEL_MAP[f.id] ?? f.id,
      severity: f.severity,
      passed: false,
      detail: f.message,
    });
  }

  // 2) 适用的核心检查项，若未被失败覆盖则补为"通过"
  const reported = new Set(checks.map((c) => c.id));
  for (const core of CORE_CHECKS) {
    if (reported.has(core.id)) continue;
    if (!core.applies({ sourceFormat, targetFormat, textExtractable })) continue;
    checks.push({
      id: core.id,
      label: LABEL_MAP[core.id] ?? core.id,
      severity: core.severity,
      passed: true,
      detail: null,
    });
  }

  return {
    slug,
    sourceFormat,
    targetFormat,
    verdict: deriveVerdict(result.pass, result.findings),
    testedAt,
    engineVersion,
    sample,
    outputSizeBytes,
    checks,
  };
}
