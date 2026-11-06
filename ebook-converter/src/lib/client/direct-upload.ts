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
import { detectCspBlock, hostOf, installCspViolationRecorder } from "./csp-violation";

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
 * R-2 (2026-11-06): a CSP block also surfaces as a TypeError, but it is
 * DETERMINISTIC — retrying can never succeed. Checking the CSP recorder inside
 * the loop does two things:
 *   1. stops immediately instead of burning ~1.2s of backoff on a blocked
 *      request (and avoids 3 stacked violation events),
 *   2. keeps `elapsedMs` in the historical `<1s` bucket. The 10-day P0's
 *      signature was exactly `PUT:NETWORK:on=1:<1s:`; letting retries stretch a
 *      CSP block to `1-5s` would break comparability with that baseline.
 * The outcome is written to `state` rather than thrown, so the caller keeps its
 * existing error wrapping.
 *
 * The File/Blob body is re-readable, so replaying the same `body` across
 * attempts is safe.
 */
const PUT_RETRY_MAX = 2; // total attempts = 3
const PUT_RETRY_BACKOFF_MS = 400;

async function putToR2WithRetry(
  presigned: { uploadUrl: string; method?: string; contentType?: string },
  file: File,
  signal: AbortSignal | undefined,
  state: { cspBlocked?: boolean },
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= PUT_RETRY_MAX; attempt++) {
    if (attempt > 0) {
      if (signal?.aborted) throw new DOMException("Upload aborted", "AbortError");
      await new Promise((r) => setTimeout(r, PUT_RETRY_BACKOFF_MS * attempt));
    }
    const attemptStart = Date.now();
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
      // CSP block? Deterministic → no retry, record it and surface immediately.
      const csp = await detectCspBlock({
        since: attemptStart,
        expectedHost: hostOf(presigned.uploadUrl),
      });
      if (csp) {
        state.cspBlocked = true;
        throw err;
      }
      // else: genuine network drop — loop and retry after backoff
    }
  }
  throw lastErr;
}

export interface DirectUploadResult {
  key: string;
}

/**
 * Host the same-origin presign request targets (e.g. "www.bookconv.com").
 * Used to attribute a CSP violation to the presign fetch instead of blaming it
 * on whatever else the page happens to be loading. Returns null outside a
 * browser, which makes attribution fall back to "no CSP signal" (NETWORK).
 */
function sameOriginHost(): string | null {
  if (typeof location === "undefined" || !location.host) return null;
  return location.host;
}

export async function uploadFileDirect(
  file: File,
  sourceFormat: string,
  signal?: AbortSignal,
): Promise<DirectUploadResult> {
  let presignRes: Response;
  const presignStart = Date.now();
  // R-2: the listener must exist BEFORE the request, otherwise a CSP block on
  // the very first attempt is unattributable.
  installCspViolationRecorder();
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
    // from an offline client. R-2: a CSP block surfaces as the same TypeError,
    // so ask the recorder which one it actually was.
    const csp = await detectCspBlock({
      since: presignStart,
      expectedHost: sameOriginHost(),
    });
    throw new DirectUploadPresignError(
      `Could not start upload (${err instanceof Error ? err.message : "network error"}).`,
      {
        elapsedMs: Date.now() - presignStart,
        online: typeof navigator !== "undefined" ? navigator.onLine : undefined,
        cspBlocked: !!csp,
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
  installCspViolationRecorder(); // idempotent — defensive for direct calls
  const putState: { cspBlocked?: boolean } = {};
  try {
    putRes = await putToR2WithRetry(presigned, file, signal, putState);
  } catch (err) {
    // CORS preflight rejection and network drops both surface here as a
    // TypeError — stage: R2 PUT (the classic 2026-10-29/30 CORS failure).
    // F20: capture elapsed + onLine.
    // R-2 (2026-11-06): onLine is NOT the discriminant — the 10-day P0 was
    // CSP-blocked with onLine=1 for every user. `putState.cspBlocked` is set by
    // the retry loop when a violation was attributed to THIS upload host.
    throw new DirectUploadPutError(
      `Upload to storage failed (${err instanceof Error ? err.message : "network error"}).`,
      {
        elapsedMs: Date.now() - putStart,
        online: typeof navigator !== "undefined" ? navigator.onLine : undefined,
        cspBlocked: !!putState.cspBlocked,
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
