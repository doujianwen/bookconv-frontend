// src/lib/error-handler.ts
import { MAX_FILE_SIZE_MB, MIN_INPUT_BYTES } from "@/lib/file-size-limit";

export type ErrorCode =
  | "FILE_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "CONVERSION_TIMEOUT"
  | "TOO_MANY_OPEN_FILES"
  | "DRM_PROTECTED"
  | "CONVERSION_FAILED"
  | "CONVERSION_UNAVAILABLE"
  | "CONVERSION_QUOTA_EXCEEDED"
  | "CLOUD_CONVERT_ERROR"
  | "INTERNAL_ERROR"
  | "CORRUPT_INPUT"
  | "MEMORY_LIMIT"
  | "VERIFICATION_FAILED"
  | "FILE_TOO_LARGE"
  | "DIRECT_UPLOAD_FAILED"
  // 2026-11-02 三码拆分（红队审计 GO-WITH-CONDITIONS）：原聚合码把 presign-503 /
  // presign-4xx / R2-PUT 三种根因坍缩为一个，GA4 无法定位失败阶段。
  // DIRECT_UPLOAD_FAILED 保留作「阶段未知」兜底 + 历史数据兼容。
  // ⚠️ 门禁同步铁律：新码必须同时进 scripts/lib/ga-error-codes.mjs 的
  // DIRECT_UPLOAD_INFRA_CODES（喂 B6 / INFRA_CODES / NON_ENGINE 三道门禁）。
  | "DIRECT_UPLOAD_PRESIGN_UNAVAILABLE"
  | "DIRECT_UPLOAD_PRESIGN_ERROR"
  | "DIRECT_UPLOAD_PUT_FAILED"
  | "UNSUPPORTED_CONVERSION"
  | "UPLOAD_NOT_FOUND"
  | "UPLOAD_EMPTY"
  // 2026-11-02：输入体积过小（1–29 字节）。此前该情形以自由文本错误串抛出，
  // 不匹配 ERROR_CODE_MAP 任何键 ⇒ 塌缩为 INTERNAL_ERROR（系统侧）⇒ 用户误传
  // 空/极小文件被当作系统故障红卡值班，GA4 也计成引擎失败。独立成码后
  // ① 告警走 alerts.ts USER_SIDE_ERROR_CODES 判灰；② GA4 走 ga-error-codes.mjs
  // USER_INPUT_CODES 剥离。阈值单一事实源 = file-size-limit.ts MIN_INPUT_BYTES。
  | "INPUT_TOO_SMALL"
  | "INVALID_UPLOAD_KEY";

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  status: number;
  retryable?: boolean;
}

const ERROR_CODE_MAP: Record<string, ErrorCode> = {
  // Calibre / ebook-convert errors
  'ENOENT': 'FILE_NOT_FOUND',
  'EACCES': 'PERMISSION_DENIED',
  'ETIMEDOUT': 'CONVERSION_TIMEOUT',
  'EMFILE': 'TOO_MANY_OPEN_FILES',
  'Error converting book': 'CONVERSION_FAILED',
  'output not generated': 'CONVERSION_FAILED',
  'not a valid eBook format': 'CORRUPT_INPUT',
  'corrupt epub': 'CORRUPT_INPUT',
  'Zip error': 'CORRUPT_INPUT',
  'Invalid zip file': 'CORRUPT_INPUT',
  'Invalid or missing opf': 'CORRUPT_INPUT',
  // 2026-11-02：conversion.ts:1213 的体积守卫。必须在此独立映射，否则该串不匹配
  // 任何键 ⇒ INTERNAL_ERROR ⇒ 告警红卡 + GA4 算引擎失败（Job 729f7eae 实证）。
  // 语义上是「文件小到不可能是有效文档」，与 CORRUPT_INPUT 的区别在于可操作性：
  // 提示用户上传真实文件，而不是让用户去「重新下载原文件」。
  'invalid input file: too small': 'INPUT_TOO_SMALL',
  'DRM': 'DRM_PROTECTED',
  'failed verification': 'VERIFICATION_FAILED',
  // M8-13（2026-10-31）：§3.5 漏检、却溜到 CloudConvert 报 "Input task has failed" 的
  // CC-import 级损坏（语义/CRC 级，10-26 复发 Job 9dba318b 实证）。这类签名与 DRM 一样
  // 属用户侧损坏，必须映射为 CORRUPT_INPUT（而非被下方 'cloudconvert' 兜底吞成
  // CLOUD_CONVERT_ERROR 红卡）。须排在 'cloudconvert' 兜底之前，否则后者先命中。
  'input task has failed': 'CORRUPT_INPUT',
  // EPUB to TXT errors
  'no text content could be extracted': 'CONVERSION_FAILED',
  'cannot extract text': 'CONVERSION_FAILED',
  // Calibre not available errors
  'Calibre is not available': 'CONVERSION_UNAVAILABLE',
  'Calibre not found': 'CONVERSION_UNAVAILABLE',
  // CloudConvert quota exhausted — MUST stay above the 'cloudconvert' catch-all
  // below, otherwise the generic key swallows it. A 402 that survives the
  // client's internal backoff means the monthly allowance is gone, not a
  // transient concurrency bump, so callers should stop rather than retry.
  'cloudconvert client error 402': 'CONVERSION_QUOTA_EXCEEDED',
  // CloudConvert polling timeout — 大文件（50+页）Calibre渲染超过轮询窗口
  // MUST stay ABOVE the 'cloudconvert' catch-all below: mapErrorCode matches by
  // object insertion order and every CloudConvert message contains "cloudconvert",
  // so a timeout would otherwise always be swallowed by the catch-all.
  'did not finish in time': 'CONVERSION_TIMEOUT',
  // CloudConvert errors (catch-all covers all "CloudConvert ..." messages)
  'cloudconvert': 'CLOUD_CONVERT_ERROR',
  // Node.js errors
  'signal SIGKILL': 'MEMORY_LIMIT',
  'signal SIGTERM': 'MEMORY_LIMIT',
  'JavaScript heap out of memory': 'MEMORY_LIMIT',
};

/** Map an error message to a user-friendly error code */
export function mapErrorCode(message: string): ErrorCode {
  const lower = message.toLowerCase();
  for (const [key, code] of Object.entries(ERROR_CODE_MAP)) {
    if (lower.includes(key.toLowerCase())) return code;
  }
  return "INTERNAL_ERROR";
}

/** Return a safe, user-friendly message for each error code */
const ERROR_MESSAGES: Record<ErrorCode, { message: string; retryable: boolean }> = {
  'FILE_NOT_FOUND': { message: 'Input file not found. Please try uploading again.', retryable: true },
  'PERMISSION_DENIED': { message: 'Permission denied when accessing the file. Please try a different file.', retryable: false },
  'CONVERSION_TIMEOUT': { message: '转换超时（免费版服务器 60 秒硬限）。请尝试：① 改用纯 JS 格式（EPUB→TXT/DOCX/RTF/FB2）；② 使用更小的文件；③ 稍后重试。', retryable: true },
  'TOO_MANY_OPEN_FILES': { message: 'Server is busy. Please wait a moment and try again.', retryable: true },
  'DRM_PROTECTED': { message: 'This file appears to be DRM-protected. Please remove DRM before converting.', retryable: false },
  'CONVERSION_FAILED': { message: 'Conversion failed. The file may be empty, damaged, or have no extractable text content. Try a different file.', retryable: true },
  'CONVERSION_UNAVAILABLE': { message: 'This conversion requires a Calibre-powered backend that is currently unavailable. Please use EPUB to TXT or EPUB to ZIP conversions, which work without Calibre.', retryable: false },
  'CONVERSION_QUOTA_EXCEEDED': { message: 'This format is temporarily at capacity for today. EPUB to TXT and EPUB to ZIP still work right now — for other formats, please try again later.', retryable: false },
  'CLOUD_CONVERT_ERROR': { message: 'Conversion service error. Please try again later or use a different format combination.', retryable: true },
  'INTERNAL_ERROR': { message: 'An unexpected error occurred. Please try again later.', retryable: true },
  'CORRUPT_INPUT': { message: 'The input file cannot be opened — it may be corrupted or not a valid ebook. Try re-downloading the original file.', retryable: false },
  'MEMORY_LIMIT': { message: 'Conversion used too much memory. The file may be too large or complex.', retryable: true },
  'VERIFICATION_FAILED': { message: 'The converted file failed our automated quality check. The original may be damaged, DRM-protected, or use an unsupported layout — try a different file or format.', retryable: false },
  'FILE_TOO_LARGE': { message: `文件超过 ${MAX_FILE_SIZE_MB}MB 限制。免费版服务器有 60 秒硬时限，大文件会超时失败。建议：① 改用纯 JS 格式（EPUB→TXT/DOCX/RTF/FB2 无大小限制）；② 压缩或拆分文件后重试。`, retryable: false },
  // 2026-10-31：直传失败是基础设施故障（presign/R2 CORS/网络），不是用户文件问题。
  // 之前借用 FILE_TOO_LARGE 被 GA 巡检误分类为「客户端拦截」，掩盖根因（10-29/10-30 R2 CORS 实锤）。
  'DIRECT_UPLOAD_FAILED': { message: 'Large-file upload is temporarily unavailable. Please try a smaller file (under the multipart limit) or retry later.', retryable: true },
  // 2026-11-02 三码拆分：直传失败按阶段定位（presign 能力关 / presign 请求关 / R2 PUT 关）。
  // 与 scripts/lib/ga-error-codes.mjs DIRECT_UPLOAD_INFRA_CODES 保持同步（门禁单一事实源）。
  'DIRECT_UPLOAD_PRESIGN_UNAVAILABLE': { message: 'Large-file upload is temporarily unavailable. Please try a smaller file (under the multipart limit) or retry later.', retryable: true },
  'DIRECT_UPLOAD_PRESIGN_ERROR': { message: 'Large-file upload could not be started. Please try a smaller file (under the multipart limit) or retry later.', retryable: true },
  'DIRECT_UPLOAD_PUT_FAILED': { message: 'Large-file upload to storage failed. Please retry in a moment or try a smaller file.', retryable: true },
  'UNSUPPORTED_CONVERSION': { message: 'This format combination is not supported by any available conversion engine. Please try the suggested alternative format.', retryable: false },
  // 2026-11-01：convert-handler 自造码（R2 直传取回失败族）纳入全集——此前不在
  // ERROR_MESSAGES，isErrorCode 判 unknown → GA4 conversion_failed 塌缩 UNKNOWN。
  'UPLOAD_NOT_FOUND': { message: 'Uploaded file could not be retrieved. Please upload it again.', retryable: true },
  'UPLOAD_EMPTY': { message: 'The uploaded file is empty. Please upload a valid file.', retryable: true },
  // 2026-11-02：与 UPLOAD_EMPTY 分开——空文件多半是上传中断（可重试），
  // 而 1–29 字节几乎总是选错了文件/发了占位符（重试同一个文件不会变好）。
  'INPUT_TOO_SMALL': { message: `The uploaded file is too small to be a valid document (under ${MIN_INPUT_BYTES} bytes). Please upload the real file.`, retryable: false },
  'INVALID_UPLOAD_KEY': { message: 'Upload session expired or invalid. Please upload the file again.', retryable: true },
};

/** Get a friendly, user-facing message from an error code */
export function getFriendlyMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code]?.message ?? ERROR_MESSAGES['INTERNAL_ERROR'].message;
}

/**
 * Runtime guard: is this value one of our ErrorCode strings?
 *
 * Single source of truth = ERROR_MESSAGES keys. Clients previously hand-maintained
 * a whitelist regex of "acceptable" codes, which silently drifted (quota /
 * CloudConvert errors fell out and were reported as UNKNOWN in GA4). Any new
 * code added to ERROR_MESSAGES is automatically accepted here.
 */
export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(ERROR_MESSAGES, value);
}

/** Check if an error is retriable (server-side/transient vs permanent) */
export function isRetryable(code: ErrorCode): boolean {
  return ERROR_MESSAGES[code]?.retryable ?? true;
}

/**
 * Narrow an unknown thrown value to a message string.
 *
 * `catch` bindings are `unknown` under `strict`, so `err.message` is not
 * directly accessible. This is a pure narrowing helper: it performs no
 * sanitisation, truncation or path stripping (use `sanitizeError` for that),
 * so call sites keep logging exactly what they logged before.
 */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return String(err);
}

/** Strip stack traces, internal paths, and technical details from error messages */
export function sanitizeError(err: unknown): string {
  if (typeof err === "string") {
    return cleanMessage(err);
  }
  if (err instanceof Error) {
    return cleanMessage(err.message);
  }
  const str = String(err);
  return cleanMessage(str);
}

function cleanMessage(raw: string): string {
  let msg = raw;

  // Strip stack traces (at ... line/col patterns)
  msg = msg.replace(/at .+/g, "");

  // Remove internal file paths
  msg = msg.replace(/\/tmp\/[^\s,)}"']*/gi, "");
  msg = msg.replace(/C:\\[^\s,)}"']*/gi, "");
  msg = msg.replace(/node_modules\/[^\s,)}"']*/gi, "");

  // Strip "Error:" prefix
  msg = msg.replace(/^Error:\s*/i, "");

  msg = msg.trim();

  // Limit to 200 characters
  if (msg.length > 200) {
    msg = msg.slice(0, 200).trimEnd();
  }

  // Default fallback
  if (!msg || msg.length < 3) {
    return "An unexpected error occurred";
  }

  return msg;
}

