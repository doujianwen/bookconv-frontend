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
  if (/failed to fetch|networkerror|network request failed/i.test(message)) return "CONVERSION_UNAVAILABLE";
  if (/HTTP 403/i.test(message)) return "PERMISSION_DENIED";
  if (/conversion service returned an error/i.test(message)) return "CONVERSION_UNAVAILABLE";
  return "UNKNOWN";
}

/** Preserve specific mapped codes; replace only generic INTERNAL_ERROR with evidence-based attribution. */
export function resolveGAErrorCode(mappedCode: ErrorCode | undefined, err: unknown): ErrorCode | "UNKNOWN" {
  return mappedCode && mappedCode !== "INTERNAL_ERROR" ? mappedCode : classifyGAError(err);
}
