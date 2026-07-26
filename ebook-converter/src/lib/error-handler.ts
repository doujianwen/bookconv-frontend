export type ErrorCode =
  | "FILE_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "CONVERSION_TIMEOUT"
  | "TOO_MANY_OPEN_FILES"
  | "DRM_PROTECTED"
  | "CONVERSION_FAILED"
  | "INTERNAL_ERROR"
  | "CORRUPT_INPUT"
  | "MEMORY_LIMIT";

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
  'DRM': 'DRM_PROTECTED',
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
  return "CONVERSION_FAILED";
}

/** Return a safe, user-friendly message for each error code */
const ERROR_MESSAGES: Record<ErrorCode, { message: string; retryable: boolean }> = {
  'FILE_NOT_FOUND': { message: 'Input file not found. Please try uploading again.', retryable: true },
  'PERMISSION_DENIED': { message: 'Permission denied when accessing the file. Please try a different file.', retryable: false },
  'CONVERSION_TIMEOUT': { message: 'Conversion timed out. The file may be too large — try a smaller file or different format.', retryable: true },
  'TOO_MANY_OPEN_FILES': { message: 'Server is busy. Please wait a moment and try again.', retryable: true },
  'DRM_PROTECTED': { message: 'This file appears to be DRM-protected. Please remove DRM before converting.', retryable: false },
  'CONVERSION_FAILED': { message: 'Conversion failed. This can happen with complex or damaged files — try a different file.', retryable: true },
  'INTERNAL_ERROR': { message: 'An unexpected error occurred. Please try again later.', retryable: true },
  'CORRUPT_INPUT': { message: 'The input file cannot be opened — it may be corrupted or not a valid ebook. Try re-downloading the original file.', retryable: false },
  'MEMORY_LIMIT': { message: 'Conversion used too much memory. The file may be too large or complex.', retryable: true },
};

/** Get a friendly, user-facing message from an error code */
export function getFriendlyMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code]?.message ?? ERROR_MESSAGES['INTERNAL_ERROR'].message;
}

/** Check if an error is retriable (server-side/transient vs permanent) */
export function isRetryable(code: ErrorCode): boolean {
  return ERROR_MESSAGES[code]?.retryable ?? true;
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

