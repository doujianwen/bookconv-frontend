// src/lib/file-size-limit.ts
//
// Single source of truth for the client-side upload size cap.
//
// WHY 4MB (not 10MB):
//   Vercel Hobby serverless functions reject request bodies > 4.5MB at the
//   edge with a 413 (FUNCTION_PAYLOAD_TOO_LARGE) BEFORE our code runs. A file
//   uploaded as multipart/form-data carries ~tens of KB of overhead on top of
//   the raw bytes, so we cap the client at 4MB to leave safe headroom. Files
//   in the 4.5–10MB band used to slip past the old 10MB check and die silently
//   at the edge — that was the root cause of the 2026-10-05/07/08 conversion
//   failure spikes (conversion_failed fired, CloudConvert dashboard showed 0).
//
// This constant is read by:
//   - FileDropZone (single-file UI size check + hint)
//   - BatchUpload  (batch pre-screen + hint)
//   - ToolPageClient (defense-in-depth guard before fetch)
//   - convert-handler (server-side backstop + clear 413 message)
//
// Raise it only after upgrading the Vercel plan (or self-hosting with a higher
// body limit). The value is env-overridable so Pro/self-host can set a higher cap.

export const MAX_FILE_SIZE_MB = parseInt(
  process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "4",
  10,
)

export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
