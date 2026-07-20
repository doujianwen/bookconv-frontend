export type ErrorCode =
  | "FILE_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "CONVERSION_TIMEOUT"
  | "TOO_MANY_OPEN_FILES"
  | "DRM_PROTECTED"
  | "CONVERSION_FAILED"
  | "INTERNAL_ERROR";

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  status: number;
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

/** Map error messages to safe, user-friendly error codes */
export function mapErrorCode(message: string): ErrorCode {
  const checks: [string, ErrorCode][] = [
    ["ENOENT", "FILE_NOT_FOUND"],
    ["EACCES", "PERMISSION_DENIED"],
    ["ETIMEDOUT", "CONVERSION_TIMEOUT"],
    ["EMFILE", "TOO_MANY_OPEN_FILES"],
    ["DRM", "DRM_PROTECTED"],
    ["output not generated", "CONVERSION_FAILED"],
  ];

  for (const [key, code] of checks) {
    if (message.includes(key)) {
      return code;
    }
  }
  return "INTERNAL_ERROR";
}

/** Build a standardized error response object */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  status: number
): ErrorResponse {
  return { code, message, status };
}
