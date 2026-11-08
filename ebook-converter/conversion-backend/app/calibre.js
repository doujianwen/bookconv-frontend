// app/calibre.js
// Pure-Node wrapper around the `ebook-convert` (Calibre) CLI.
// Ported from worker/src/converters/calibre.ts — kept dependency-free on purpose
// so the backend runs as a plain Node service with no TS build step.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { unlink } from "node:fs/promises";

const execFileAsync = promisify(execFile);

// Calibre binary (override with CALIBRE_BIN if not on PATH, e.g. tests)
// 2026-11-08：改为**调用时**读取 env（与 src/lib/conversion-backend-client.ts 的
// env 约定一致）——使单测可在同一进程内切换 CALIBRE_BIN 覆盖不同失败形态
// （ENOENT / 超时 / 正常失败），也允许运行时改 env 无需重启。
const calibreBin = () => process.env.CALIBRE_BIN || "ebook-convert";

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
  // 2026-11-08（告警 1 根因修复）：删除 `--dont-add-chapters-to-toc`。
  // 该选项在部署的 Calibre 7.6.0 中**不存在**（`ebook-convert --help` 无此项、
  // /usr/lib/calibre 源码 grep 无匹配，服务器实测），导致**所有 X→txt 后端转换
  // 100% 返回 500 CONVERSION_FAILED**；每 3 次连续失败即熔断开闸，误报
  // 「🚨 Conversion Backend Unavailable」红卡并让全站绕过后端 60s。
  // 实测证据：conversion.log 2026-11-07T18:09 / 11-08T00:59 / 01:00 / 02:18 /
  // 02:21 / 02:23 六次 `no such option` 失败；告警 1 (02:23:22.476Z) 与
  // 02:23:22.364Z 的 FAIL 相差 112ms。
  // 取舍：txt 输出会带 Calibre 的章节 TOC 噪声；epub→txt 已改由前端纯 JS 路径
  // 承接（route.ts canDelegate 排除），后端 txt 仅服务其余来源格式。
  if (extraArgs && Array.isArray(extraArgs)) {
    args.push(...extraArgs);
  }

  try {
    // Windows batch wrappers (.cmd/.bat) need a shell to execute; on Linux the
    // real binary is `ebook-convert` so this branch is a no-op in production.
    const CALIBRE_BIN = calibreBin();
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
    // 2026-11-08（红队审计 #3）：区分「基础设施失败」与「确定性转换失败」。
    // index.js 的 `result.code || "CONVERSION_FAILED"` 是兜底码——若不区分，
    // spawn ENOENT（Calibre 二进制丢失/损坏）、execFile 超时、SIGKILL/OOM 都会被
    // 归入 CONVERSION_FAILED；而前端对该码跳过熔断计数（确定性转换失败不是健康
    // 证据）⇒ 后端真死时熔断永不开启、红卡永不发（后端静默死亡）。
    // 基础设施失败必须独立成码 BACKEND_UNAVAILABLE + HTTP 503（见 index.js），
    // 让前端按「健康失败」计数并触发熔断。
    // 判据：execFile 的 err.code 在正常转换失败时是**数字**退出码（如 1），只有
    // spawn 失败才是字符串（ENOENT/EACCES/ETIMEDOUT）；timeout 选项超时则
    // killed=true 且 signal=SIGTERM；OOM kill 通常是 signal=SIGKILL。
    const INFRA_ERR_CODES = new Set(["ENOENT", "EACCES", "ETIMEDOUT", "EMFILE"]);
    const isInfraFailure =
      !!err &&
      (err.killed === true ||
        err.signal === "SIGKILL" ||
        err.signal === "SIGTERM" ||
        INFRA_ERR_CODES.has(err.code));
    if (isInfraFailure) {
      return {
        success: false,
        error: `Conversion backend unavailable: ${(fallbackMsg || "calibre process failed to run").slice(0, 160)}`,
        code: "BACKEND_UNAVAILABLE",
        rawStderr: rawStderr.slice(0, 6000),
      };
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
