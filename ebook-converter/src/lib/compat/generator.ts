// src/lib/compat/generator.ts
//
// 生成器核心：调 verifyConversion 跑一组格式对，产出 CompatReport。
// 由 scripts/generate-compat.ts（Step D，本机一次性 CLI）调用。
// 注意：本文件只在"真跑样本"时执行，构建期不调用，故不依赖 Calibre 在线。

import { statSync } from "node:fs";
import { verifyConversion } from "@/lib/conversion-verifier";
import { toCompatReport } from "./report";
import type { CompatReport, CompatSample } from "./schema";

export interface GenerateInput {
  slug: string;
  sourceFormat: string;
  targetFormat: string;
  inputPath: string;
  outputPath: string;
  sample: CompatSample;
  engineVersion: string;
  testedAt: string;
}

export async function generateCompatReport(input: GenerateInput): Promise<CompatReport> {
  const result = await verifyConversion(
    input.inputPath,
    input.outputPath,
    input.sourceFormat,
    input.targetFormat,
  );
  const outputSizeBytes = statSync(input.outputPath).size;
  return toCompatReport({ ...input, result, outputSizeBytes });
}
