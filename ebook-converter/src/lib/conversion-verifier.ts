// src/lib/conversion-verifier.ts
//
// 「纯纠错 / 纠察」层 —— 转换输出验证器。
//
// 设计原则（对齐纯纠错智能体范式）：
//   1. 角色固化：本模块只做"挑刺"，绝不调用 Calibre，不参与转换本身。
//   2. 信息隔离：只看到 inputPath / outputPath / 声明格式，看不到转换参数或
//      上游"Calibre 说成功了"的判断，避免被主流方向带偏（死胡同当有效路径）。
//   3. 一票否决：任一 CRITICAL 级发现 → pass=false → 调用方不得交付该结果。
//   4. 攻击清单：逐条审核（见 verifyConversion）。
//
// 运行模式：由 queue.ts 在每次 Calibre 成功后自动内联调用（拦截器/流水线节点
// 检查架构），无需人工提醒。v1 走确定性规则，不调用 LLM，无额外延迟幻觉风险。

import { existsSync, statSync } from 'node:fs';
import { open, readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import { loggers as log } from './logger';

export type VerdictSeverity = 'critical' | 'warn';

export interface Verdict {
  id: string;
  severity: VerdictSeverity;
  message: string;
}

export interface VerificationResult {
  /** false ⇒ 调用方必须阻断交付（一票否决） */
  pass: boolean;
  findings: Verdict[];
}

// ── 文本提取工具 ────────────────────────────────────────────────

function stripTags(s: string): string {
  return s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-zA-Z#0-9]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface ArchiveText {
  text: string;
  images: number;
}

/** 从 EPUB/ZIP 类归档中抽取近似文本与图片数量（容错：单条目失败不影响整体） */
async function extractArchiveText(filePath: string): Promise<ArchiveText | null> {
  try {
    const data = await readFile(filePath);
    const zip = await JSZip.loadAsync(data);
    let text = '';
    let images = 0;
    const entries = Object.values(zip.files);
    for (const file of entries) {
      if (file.dir) continue;
      const name = file.name.toLowerCase();
      if (/\.(png|jpe?g|gif|webp|svg)$/.test(name)) {
        images++;
        continue;
      }
      if (/\.(xhtml|html|htm|ncx|xml|opf|txt)$/.test(name)) {
        try {
          const content = await file.async('string');
          text += ' ' + stripTags(content);
        } catch {
          /* 忽略不可读条目 */
        }
      }
    }
    return { text: text.trim(), images };
  } catch {
    return null;
  }
}

async function extractPlainText(filePath: string): Promise<string | null> {
  try {
    const buf = await readFile(filePath);
    return buf.toString('utf8').replace(/\s+/g, ' ').trim();
  } catch {
    return null;
  }
}

// ── 输出格式魔数检测 ────────────────────────────────────────────

type Detected =
  | 'epub'
  | 'docx'
  | 'zip'
  | 'pdf'
  | 'mobi'
  | 'ole'
  | 'rtf'
  | 'jpg'
  | 'png'
  | 'rar'
  | 'djvu'
  | 'text'
  | 'unknown';

async function detectFormat(filePath: string): Promise<Detected> {
  try {
    const fh = await open(filePath, 'r');
    const head = Buffer.alloc(64 * 1024);
    const { bytesRead } = await fh.read(head, 0, head.length, 0);
    await fh.close();
    const b = head.subarray(0, bytesRead);
    if (b.length < 4) return 'unknown';

    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
    if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'pdf'; // %PDF
    if (b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07)) return 'zip'; // PK
    const sig = b.subarray(0, 4).toString('latin1');
    if (sig === 'BOOK' || sig === 'TEXt') return 'mobi';
    if (b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0) return 'ole'; // DOC/LIT
    if (b[0] === 0x52 && b[1] === 0x61 && b[2] === 0x72 && b[3] === 0x21) return 'rar'; // Rar! (CBR)
    if (b[0] === 0x41 && b[1] === 0x54 && b[2] === 0x26 && b[3] === 0x54) return 'djvu'; // AT&T
    if (b[0] === 0x7b && b[1] === 0x5c && b[2] === 0x72 && b[3] === 0x74 && b[4] === 0x66) return 'rtf'; // {\rtf

    // 文本启发式：前 512 字节中不可打印字符占比低 → 视为文本
    const sample = b.subarray(0, 512);
    let nonPrintable = 0;
    for (let i = 0; i < sample.length; i++) {
      const c = sample[i];
      if (c === 0x09 || c === 0x0a || c === 0x0d) continue;
      if (c < 0x20 || c > 0x7e) nonPrintable++;
    }
    if (sample.length > 0 && nonPrintable / sample.length < 0.1) return 'text';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/** 目标格式允许被检测为哪些魔数类型（ ambiguity 容忍） */
const TARGET_OK: Record<string, Detected[]> = {
  epub: ['zip', 'epub'],
  pdf: ['pdf'],
  mobi: ['mobi'],
  azw3: ['mobi'],
  docx: ['zip', 'docx'],
  doc: ['ole'],
  rtf: ['rtf'],
  txt: ['text'],
  html: ['zip', 'epub'],
  fb2: ['zip', 'text'],
  lit: ['zip', 'ole'],
  cbr: ['rar'],
  cbz: ['zip'],
  djvu: ['djvu'],
  jpg: ['jpg'],
  png: ['png'],
};

// ── 主验证入口（纠察队一号成员） ────────────────────────────────

export async function verifyConversion(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<VerificationResult> {
  const findings: Verdict[] = [];

  // 攻击 1：结论真的成立吗？—— 输出存在且非空
  if (!existsSync(outputPath)) {
    findings.push({ id: 'no-output', severity: 'critical', message: 'Output file missing' });
    return { pass: false, findings };
  }
  const outSize = statSync(outputPath).size;
  if (outSize === 0) {
    findings.push({ id: 'empty-output', severity: 'critical', message: 'Output file is 0 bytes' });
    return { pass: false, findings };
  }

  // 攻击 1（续）：输出真是我们要求的目标格式？（魔数校验）
  const detected = await detectFormat(outputPath);
  const allowed = TARGET_OK[targetFormat] || [];
  if (allowed.length > 0) {
    if (detected === 'unknown') {
      findings.push({
        id: 'format-unverified',
        severity: 'warn',
        message: `Could not verify output is a valid ${targetFormat} (magic unrecognized)`,
      });
    } else if (!allowed.includes(detected)) {
      findings.push({
        id: 'format-mismatch',
        severity: 'critical',
        message: `Output detected as '${detected}' but expected '${targetFormat}'`,
      });
    }
  }

  // 文本类抽取（epub 用归档抽取，txt 直接读）
  const inArchive = sourceFormat === 'epub' ? await extractArchiveText(inputPath) : null;
  const outArchive = targetFormat === 'epub' ? await extractArchiveText(outputPath) : null;
  const inPlain = sourceFormat === 'txt' ? await extractPlainText(inputPath) : null;
  const outPlain = targetFormat === 'txt' ? await extractPlainText(outputPath) : null;

  const inText = inArchive?.text ?? inPlain ?? '';
  const outText = outArchive?.text ?? outPlain ?? '';
  // 文本比对仅在输出侧可提取文本时才有意义：pdf/mobi/azw3 等格式输出侧
  // 无可用文本提取（魔数校验已证明格式正确），若强行比对会误报 content-loss。
  const outTextExtractable = outArchive !== null || outPlain !== null;

  // 攻击 2：把死胡同当成有效路径？—— Calibre 报成功但产出垃圾（文本大量丢失）
  if (inText.length > 200 && outTextExtractable) {
    const ratio = outText.length / inText.length;
    if (outText.length < inText.length * 0.5) {
      findings.push({
        id: 'content-loss',
        severity: 'critical',
        message: `Output text (${outText.length}) is <50% of input text (${inText.length}) — possible content loss`,
      });
    }
    // 攻击 3：偷偷引入未声明假设？—— 编码损坏（中文/日文等变 U+FFFD 乱码）
    const repl = (outText.match(/\uFFFD/g) || []).length;
    const mojiRatio = repl / Math.max(outText.length, 1);
    if (mojiRatio > 0.02 && repl > 5) {
      findings.push({
        id: 'mojibake',
        severity: 'critical',
        message: `Output contains ${repl} replacement characters (U+FFFD) — likely encoding corruption`,
      });
    }
  }

  // 攻击 3（续）：图片丢失（epub → epub）
  if (sourceFormat === 'epub' && targetFormat === 'epub') {
    const inImg = inArchive?.images ?? 0;
    const outImg = outArchive?.images ?? 0;
    if (inImg > 0 && outImg === 0) {
      findings.push({
        id: 'image-loss',
        severity: 'warn',
        message: `Input had ${inImg} images but output has none`,
      });
    }
  }

  const pass = !findings.some((f) => f.severity === 'critical');
  if (findings.length) {
    log.conversion.info('Conversion verification findings', {
      targetFormat,
      sourceFormat,
      pass,
      count: findings.length,
    });
  }
  return { pass, findings };
}
