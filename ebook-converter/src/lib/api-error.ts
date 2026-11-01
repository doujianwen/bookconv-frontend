import { isErrorCode, type ErrorCode } from "./error-handler"

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

  // 单一事实源校验（isErrorCode 派生自 error-handler 的 ErrorCode 全集）。
  // 此前这里手维护 KNOWN_CODES 白名单，已静默漂移：FILE_TOO_LARGE /
  // DIRECT_UPLOAD_FAILED / UNSUPPORTED_CONVERSION 三个后端真实 code 被判
  // unknown → 前端 conversion_failed 的 error_code 塌缩为 UNKNOWN，GA4 根因
  // 分流失真。改用 isErrorCode 后新增 ErrorCode 自动被接受，不再漂移。
  const normalizedCode = code && isErrorCode(code) ? code : undefined

  return { message, code: normalizedCode, status }
}
