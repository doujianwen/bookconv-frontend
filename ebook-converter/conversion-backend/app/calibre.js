// app/calibre.js
// Pure-Node wrapper around the `ebook-convert` (Calibre) CLI.
// Ported from worker/src/converters/calibre.ts — kept dependency-free on purpose
// so the backend runs as a plain Node service with no TS build step.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { unlink } from "node:fs/promises";

const execFileAsync = promisify(execFile);

// Calibre binary (override with CALIBRE_BIN if not on PATH, e.g. tests)
const CALIBRE_BIN = process.env.CALIBRE_BIN || "ebook-convert";

// ---------------------------------------------------------------------------
// 错误摘要提取（2026-11-03，Job f547b469 复盘）
//
// 原实现直接 `String(stderr).slice(0, 200)`，而 Calibre 的 stderr **首行几乎固定
// 是 dpkg 噪声**：
//   dpkg: warning: failed to open configuration file '/home/bookconv-backend/.dpkg.cfg'
// 200 字符预算一半被它吃掉，真正的根因（Traceback 末尾的
// `calibre.utils.zipfile.BadZipfile: File is not a zip file`）被砍掉。后果：
// conversion.log、后端 500 响应体、飞书告警卡三处都只看到 dpkg + "Traceback"，
// 值班人无法区分「输入损坏 / DRM / 编码失败」，只能靠失败耗时反推（本次即如此）。
//
// 策略：过滤已知噪声前缀 → 优先取含异常签名的最后 3 行（Calibre 把根因写在
// Traceback 底部）→ 压平单行 → 按 200 字符预算截断。
// 导出以便用 node -e 直接验证，无需跑真实 Calibre。
// ---------------------------------------------------------------------------
const STDERR_NOISE =
  /^(dpkg:|debconf:|update-alternatives:|Selecting previously|Preparing to unpack|Unpacking )/i;
const STDERR_SIGNATURE =
  /(badzip|badgzip|traceback|exception|error:|cannot|unable|not a zip|corrupt|unsupported|drm|no such file)/i;
// Calibre 的根因行形如 `calibre.utils.zipfile.BadZipfile: File is not a zip file`
// 或 `ValueError: Invalid ZIP file, local header is damaged`。当 stderr 里出现
// 「During handling of the above exception」的链式异常时，**最后一条**才是真正
// 让进程退出的那个，前面的都只是中间态（实测 2026-11-03）。
const STDERR_EXCEPTION_LINE =
  /^[\w.]*(?:Error|Exception|BadZipfile|BadZipFile|BadGzipfile|Interrupt)\s*:\s*\S/;

export function pickErrorDetail(raw, budget = 200) {
  const text = String(raw ?? "").replace(/\r\n?/g, "\n");
  if (!text.trim()) return "Unknown conversion error";

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const clean = lines.filter((l) => !STDERR_NOISE.test(l));
  const pool = clean.length ? clean : lines;

  // 第一优先：最后一条「异常类型: 消息」——它就是进程的实际退出原因。
  const exceptionLine = [...pool].reverse().find((l) => STDERR_EXCEPTION_LINE.test(l));
  if (exceptionLine) {
    return exceptionLine.length > budget
      ? `${exceptionLine.slice(0, budget - 1)}…`
      : exceptionLine;
  }

  // 第二优先：含错误签名的最后 3 行（保留一点上下文，避免只剩一句无来由的话）
  const hits = pool.filter((l) => STDERR_SIGNATURE.test(l));
  const picked = (hits.length ? hits : pool).slice(-3);
  const detail = picked.join(" / ");
  return detail.length > budget ? `${detail.slice(0, budget - 1)}…` : detail;
}

/**
 * Run Calibre to convert inputPath -> outputPath.
 * @returns {{success:boolean, outputPath?:string, error?:string, rawStderr?:string}}
 */
export async function convertWithCalibre(inputPath, outputPath, opts = {}) {
  const { targetFormat, quality, extraArgs, timeout = 120_000, maxBuffer = 10 * 1024 * 1024 } = opts;
  const args = [inputPath, outputPath];

  if (quality === "high") {
    if (targetFormat === "pdf") {
      args.push("--pdf-page-numbers", "--pretty-print");
    }
    if (targetFormat === "epub") {
      args.push("--pretty-print");
    }
  }
  // Plain-text output: skip cover image / chapter TOC noise
  if (targetFormat === "txt" || targetFormat === "text") {
    args.push("--dont-add-chapters-to-toc");
  }
  if (extraArgs && Array.isArray(extraArgs)) {
    args.push(...extraArgs);
  }

  try {
    // Windows batch wrappers (.cmd/.bat) need a shell to execute; on Linux the
    // real binary is `ebook-convert` so this branch is a no-op in production.
    const useShell = /\.(cmd|bat)$/i.test(CALIBRE_BIN);
    await execFileAsync(CALIBRE_BIN, args, { timeout, maxBuffer, shell: useShell });
    return { success: true, outputPath };
  } catch (err) {
    const rawStderr = err && err.stderr ? String(err.stderr) : "";
    const fallbackMsg = (err && err.message) || "";
    const haystack = rawStderr || fallbackMsg;
    const detail = pickErrorDetail(haystack);
    // Clean up a possibly-partial output so we never stream a corrupt file
    try {
      await unlink(outputPath);
    } catch {
      /* ignore */
    }
    // DRM 判定改为扫**完整** stderr（原实现只看前 200 字符）：CloudConvert 侧的
    // 历史审计（2026-10-12）已证实 DRM 字样可能落在消息靠后位置，同样的漏判在
    // Calibre 的 Traceback 结构下更严重——根因在最后一行，前 200 字符必然看不到。
    // 2026-11-07 修复：原 /\bDRM\b/i 匹配不到 calibre.ebooks.DRMError —— DRM 紧贴
    // Error，其后紧跟单词字符 E，无词边界，\bDRM\b 在 DRMError 中不成立，导致 DRM
    // 分支从未触发、被兜底成 CONVERSION_FAILED（本罪证 job cf2904e2 的 stderr 即
    // `calibre.ebooks.DRMError: …epub`）。增补 DRMError 分支。
    if (/\bDRM\b|DRMError/i.test(haystack)) {
      return {
        success: false,
        error: "This file is protected by DRM and cannot be converted.",
        code: "DRM_PROTECTED",
        rawStderr: rawStderr.slice(0, 6000),
      };
    }
    return {
      success: false,
      error: `Conversion failed: ${detail}`,
      // 完整 stderr 交给调用方落日志（内存上限 6000 字符，避免 10MB maxBuffer 的整串搬运）
      rawStderr: rawStderr.slice(0, 6000),
    };
  }
}
