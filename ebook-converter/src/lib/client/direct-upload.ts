// src/lib/client/direct-upload.ts
//
// Browser-side half of the direct-to-R2 upload path.
//
// Why it exists: files above the Vercel 4.5MB edge limit cannot be POSTed as
// multipart — the edge rejects the body before our code runs. Instead we ask
// /api/upload/presign for a signed PUT URL and send the bytes straight to R2,
// then hand the object key to /api/convert.
//
// Requires an R2 bucket CORS rule allowing PUT from the site origin — see
// docs/DIRECT_UPLOAD.md. Without it the PUT fails and the caller falls back.
//
// Error taxonomy (2026-11-02): every failure is thrown as a STAGE-TYPED error
// from src/lib/direct-upload-error.ts so GA4 can localize the failed stage —
// the old flat throws collapsed presign-503 / presign-4xx / R2-PUT failures
// into one code (2026-11-01: 8 failures, root cause unknowable). Use
// mapDirectUploadError() in the caller to derive the GA4 error_code.

import {
  DirectUploadUnavailableError,
  DirectUploadPresignError,
  DirectUploadPutError,
} from "../direct-upload-error";

// Re-export for backward compatibility with existing importers.
export { DirectUploadUnavailableError };

/**
 * Whether an R2 PUT attempt error is worth retrying.
 *
 * Pure decision — unit-testable, no browser APIs.
 *
 * Retryable: a network-layer drop with no HTTP response — a TypeError
 * (CORS preflight rejection OR an instantaneous connection/DNS failure) or a
 * non-abort DOMException. These are often transient and recover on an immediate
 * retry.
 *
 * Not retryable:
 *   - An HTTP non-2xx from R2 (already unwrapped by putToR2WithRetry before
 *     this is reached for the *final* error, but kept here for safety).
 *   - AbortError — the user cancelled; retrying would be wrong and could mask
 *     the abort from the caller.
 * 2026-11-06: the 3 diagnostic-tagged PUT failures on 11-05 were all
 * PUT:NETWORK:on=1:<1s — instant network-layer drops while online. This retry
 * targets exactly that signature. Production effect is UNKNOWN pending
 * real-traffic confirmation (cannot be verified locally).
 */
export function isRetryablePutError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  if (err instanceof DOMException) return err.name !== "AbortError";
  return false;
}

/**
 * PUT the file straight to R2, retrying transient network failures only.
 *
 * HTTP non-2xx responses are returned as-is (deterministic R2 rejection — must
 * NOT be retried, or it would just fail again and waste time). Network failures
 * (TypeError / non-abort DOMException) are retried up to PUT_RETRY_MAX extra
 * times with a linear backoff. Aborts propagate immediately.
 *
 * The File/Blob body is re-readable, so replaying the same `body` across
 * attempts is safe.
 */
const PUT_RETRY_MAX = 2; // total attempts = 3
const PUT_RETRY_BACKOFF_MS = 400;

async function putToR2WithRetry(
  presigned: { uploadUrl: string; method?: string; contentType?: string },
  file: File,
  signal?: AbortSignal,
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= PUT_RETRY_MAX; attempt++) {
    if (attempt > 0) {
      if (signal?.aborted) throw new DOMException("Upload aborted", "AbortError");
      await new Promise((r) => setTimeout(r, PUT_RETRY_BACKOFF_MS * attempt));
    }
    try {
      const res = await fetch(presigned.uploadUrl, {
        method: presigned.method || "PUT",
        // Must match the Content-Type that was signed, or R2 rejects the signature.
        headers: { "Content-Type": presigned.contentType || "application/octet-stream" },
        body: file,
        signal,
      });
      if (!res.ok) return res; // deterministic R2 rejection — caller handles, no retry
      return res;
    } catch (err) {
      lastErr = err;
      if (!isRetryablePutError(err)) throw err; // HTTP/abort/unknown — surface now
      // else: network drop — loop and retry after backoff
    }
  }
  throw lastErr;
}

export interface DirectUploadResult {
  key: string;
}

export async function uploadFileDirect(
  file: File,
  sourceFormat: string,
  signal?: AbortSignal,
): Promise<DirectUploadResult> {
  let presignRes: Response;
  const presignStart = Date.now();
  try {
    presignRes = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceFormat,
        size: file.size,
        fileName: file.name,
      }),
      signal,
    });
  } catch (err) {
    // Network failure before any response arrived — stage: presign.
    // F20: capture elapsed + onLine so a CORS preflight drop is distinguishable
    // from an offline client.
    throw new DirectUploadPresignError(
      `Could not start upload (${err instanceof Error ? err.message : "network error"}).`,
      {
        elapsedMs: Date.now() - presignStart,
        online: typeof navigator !== "undefined" ? navigator.onLine : undefined,
      },
    );
  }

  if (presignRes.status === 503) {
    throw new DirectUploadUnavailableError();
  }
  if (!presignRes.ok) {
    const payload = (await presignRes.json().catch(() => null)) as
      | { error?: string; code?: string }
      | null;
    // Preserve the presign contract's own code (route returns e.g.
    // "FILE_TOO_LARGE" for a 413). It was previously discarded, so >100MB
    // files were mis-reported as direct-upload infra failures (R-B).
    throw new DirectUploadPresignError(
      payload?.error || `Could not start upload (${presignRes.status}).`,
      {
        status: presignRes.status,
        code: payload?.code,
        elapsedMs: Date.now() - presignStart,
        online: typeof navigator !== "undefined" ? navigator.onLine : undefined,
      },
    );
  }

  const presigned = (await presignRes.json()) as {
    key: string;
    uploadUrl: string;
    method?: string;
    contentType?: string;
  };

  let putRes: Response;
  const putStart = Date.now();
  try {
    putRes = await putToR2WithRetry(presigned, file, signal);
  } catch (err) {
    // CORS preflight rejection and network drops both surface here as a
    // TypeError — stage: R2 PUT (the classic 2026-10-29/30 CORS failure).
    // F20: capture elapsed + onLine; a CORS preflight rejection and an offline
    // client both land here with no `status`, so onLine is the only discriminant.
    // 2026-11-06 retry: network-type failures are retried inside
    // putToR2WithRetry; a non-retryable error (HTTP non-2xx, abort) surfaces here.
    throw new DirectUploadPutError(
      `Upload to storage failed (${err instanceof Error ? err.message : "network error"}).`,
      {
        elapsedMs: Date.now() - putStart,
        online: typeof navigator !== "undefined" ? navigator.onLine : undefined,
      },
    );
  }

  if (!putRes.ok) {
    throw new DirectUploadPutError(`Upload to storage failed (${putRes.status}).`, {
      status: putRes.status,
      elapsedMs: Date.now() - putStart,
      online: typeof navigator !== "undefined" ? navigator.onLine : undefined,
    });
  }

  return { key: presigned.key };
}
