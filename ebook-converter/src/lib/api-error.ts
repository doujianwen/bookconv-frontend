import type { ErrorCode } from "./error-handler"

const KNOWN_CODES = new Set<ErrorCode>([
  "FILE_NOT_FOUND",
  "PERMISSION_DENIED",
  "CONVERSION_TIMEOUT",
  "TOO_MANY_OPEN_FILES",
  "DRM_PROTECTED",
  "CONVERSION_FAILED",
  "CONVERSION_UNAVAILABLE",
  "CONVERSION_QUOTA_EXCEEDED",
  "CLOUD_CONVERT_ERROR",
  "INTERNAL_ERROR",
  "CORRUPT_INPUT",
  "MEMORY_LIMIT",
  "VERIFICATION_FAILED",
])

export interface ApiError {
  message: string
  code?: ErrorCode
  status: number
}

/**
 * Robustly extract an error from a non-OK fetch Response.
 *
 * The conversion API normally returns `{ error, code }` JSON, but the edge can
 * also forward raw bytes from an upstream backend (VPS / Calibre) that may
 * reply with a non-JSON body — an HTML 502 page, an empty body, or Calibre's
 * stderr text. In those cases `response.json()` throws and a naive handler
 * falls back to a useless "Server error". This helper:
 *   1. parses JSON when present and pulls `.error` / `.code`;
 *   2. otherwise reads the raw text body and uses a truncated slice as the
 *      message (so the user sees the real cause, not "Server error");
 *   3. falls back to an HTTP-status-aware message only when there is nothing
 *      else to show.
 */
export async function extractApiError(res: Response): Promise<ApiError> {
  const status = res.status
  let message = ""
  let code: string | undefined

  try {
    const data = (await res.json()) as unknown
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>
      if (typeof obj.error === "string") message = obj.error
      if (typeof obj.code === "string") code = obj.code
      if (!message && typeof obj.message === "string") message = obj.message
    }
  } catch {
    // Response was not JSON (HTML / empty / text). Try to read the raw body.
    try {
      const text = (await res.text()).trim()
      if (text) message = text.slice(0, 300)
    } catch {
      /* ignore — fall through to the status-based message */
    }
  }

  if (!message) {
    message =
      status >= 500
        ? "The conversion service returned an error. Please try again or use a different file."
        : `Request failed (HTTP ${status}). Please try again.`
  }

  const normalizedCode = code && KNOWN_CODES.has(code as ErrorCode) ? (code as ErrorCode) : undefined

  return { message, code: normalizedCode, status }
}
