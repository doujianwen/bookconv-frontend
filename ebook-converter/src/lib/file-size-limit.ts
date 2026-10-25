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

// ---------------------------------------------------------------------------
// Direct-to-R2 upload cap (2026-10-25)
//
// WHY: MAX_FILE_SIZE_MB above is not a product decision — it is the Vercel
// Hobby edge body limit (4.5MB, 413 FUNCTION_PAYLOAD_TOO_LARGE) leaking into
// the UI. That cap structurally blocks the formats whose real-world files are
// large by nature: DJVU scans (10–100MB), CBR/CBZ comics (50–200MB) and
// scanned PDFs (10–50MB). Those are exactly the pages with the best keyword
// opportunity (djvu→pdf 5.9K/mo KD8, pdf→epub 6.8K/mo KD8).
//
// FIX: when R2 is configured, the browser PUTs the file straight to R2 with a
// presigned URL (see src/lib/upload-presign.ts), so the bytes never traverse a
// serverless function and the edge limit stops applying. /api/convert then
// receives only the R2 object key.
//
// This cap therefore applies ONLY to the presigned path. The multipart path
// keeps MAX_FILE_SIZE_MB as a hard floor — the two caps must never be mixed.
// ---------------------------------------------------------------------------

export const MAX_UPLOAD_FILE_SIZE_MB = parseInt(
  process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || "100",
  10,
)

export const MAX_UPLOAD_FILE_SIZE_BYTES = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024
