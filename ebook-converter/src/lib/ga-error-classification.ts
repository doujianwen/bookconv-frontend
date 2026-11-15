import { isErrorCode, type ErrorCode } from "./error-handler";

/** Attribution fallback, not a confirmed backend root cause. */
export function classifyGAError(err: unknown): ErrorCode | "UNKNOWN" {
  if (!err || typeof err !== "object") return "UNKNOWN";
  const e = err as { code?: unknown; errorCode?: unknown; cause?: { code?: unknown; errorCode?: unknown; status?: unknown }; message?: unknown; status?: unknown };
  const code = e.cause?.errorCode ?? e.cause?.code ?? e.errorCode ?? e.code;
  if (isErrorCode(code)) return code;
  const status = Number(e.cause?.status ?? e.status);
  if (status === 403) return "PERMISSION_DENIED";
  if (status >= 500 && status <= 599) return "CONVERSION_UNAVAILABLE";
  const message = typeof e.message === "string" ? e.message : "";
  // Safari/WebKit 的 fetch 网络失败文案是 "Load failed"（Chrome="Failed to fetch"、
  // Firefox="NetworkError…"）。缺它 → Safari 用户网络失败在 GA4 塌缩为 UNKNOWN
  // （2026-11-14 实测：11-02/11-14 的 "Load failed" 均落 UNKNOWN）。用 \b 锚定，
  // 避免误吃 "download failed" 这类无关串。
  if (/failed to fetch|networkerror|network request failed|\bload failed\b/i.test(message)) return "CONVERSION_UNAVAILABLE";
  if (/HTTP 403/i.test(message)) return "PERMISSION_DENIED";
  if (/conversion service returned an error/i.test(message)) return "CONVERSION_UNAVAILABLE";
  return "UNKNOWN";
}

/** Preserve specific mapped codes; replace only generic INTERNAL_ERROR with evidence-based attribution. */
export function resolveGAErrorCode(mappedCode: ErrorCode | undefined, err: unknown): ErrorCode | "UNKNOWN" {
  return mappedCode && mappedCode !== "INTERNAL_ERROR" ? mappedCode : classifyGAError(err);
}
