// src/lib/direct-upload-error.ts
//
// Stage-aware error taxonomy for the browser-side direct-to-R2 upload path.
//
// WHY THIS EXISTS (2026-11-02 red-team audit, GO-WITH-CONDITIONS):
//   A single DIRECT_UPLOAD_FAILED code collapsed FOUR distinct root causes —
//   presign 503 (R2 env dropped), presign 4xx/network, R2 PUT CORS failure,
//   R2 PUT network failure — so GA4 could never tell WHICH stage broke
//   (2026-11-01: 8 failures, root cause forever unknowable). This module
//   throws typed errors carrying the failed stage, and maps them to distinct
//   GA4 error codes so failedByErrorCode localizes the failure.
//
//   Also fixes R-B: presign's own contract code was discarded on non-200
//   (e.g. 413 FILE_TOO_LARGE for >100MB files), mis-reporting oversized
//   files as DIRECT_UPLOAD_FAILED.
//
// Gate-sync invariant (改能力必须同步改门禁基线):
//   Every code below must appear in scripts/lib/ga-error-codes.mjs
//   DIRECT_UPLOAD_INFRA_CODES, which feeds B6 (ga4-redteam.mjs),
//   INFRA_CODES (ga-inspection.mjs) and NON_ENGINE (ga4-redteam-analysis.mjs).
//   Adding a code here without updating that shared constant re-introduces
//   the exact false-FAIL this split was meant to fix.

import { isErrorCode, type ErrorCode } from "./error-handler";

/** presign returned 503: direct upload unavailable on this deployment
 *  (R2 env missing at runtime / createPresignedPut threw). */
export class DirectUploadUnavailableError extends Error {
  constructor(message = "Direct upload is not available on this deployment.") {
    super(message);
    this.name = "DirectUploadUnavailableError";
  }
}

/** presign returned a non-503 error (400/413/429/…) or the presign request
 *  itself failed at the network level. May carry the presign contract's own
 *  `code` (e.g. "FILE_TOO_LARGE" for a 413) so it can survive mapping. */
export class DirectUploadPresignError extends Error {
  status?: number;
  /** Raw code from the presign response payload, if any. */
  code?: string;

  constructor(message: string, opts?: { status?: number; code?: string }) {
    super(message);
    this.name = "DirectUploadPresignError";
    this.status = opts?.status;
    this.code = opts?.code;
  }
}

/** The R2 PUT itself failed: CORS preflight rejection, network error,
 *  or a non-2xx status from storage. */
export class DirectUploadPutError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "DirectUploadPutError";
    this.status = status;
  }
}

/**
 * Map a thrown direct-upload error to the GA4 error_code that best localizes
 * the failed stage. Pure function — no React, no network — unit-testable.
 *
 * Contract:
 *   DirectUploadUnavailableError            → DIRECT_UPLOAD_PRESIGN_UNAVAILABLE
 *   DirectUploadPresignError{FILE_TOO_LARGE} → FILE_TOO_LARGE        (R-B: 413 preserved)
 *   DirectUploadPresignError{other/none}     → DIRECT_UPLOAD_PRESIGN_ERROR
 *   DirectUploadPutError                     → DIRECT_UPLOAD_PUT_FAILED
 *   anything else                            → DIRECT_UPLOAD_FAILED  (stage unknown)
 */
export function mapDirectUploadError(err: unknown): ErrorCode {
  if (err instanceof DirectUploadUnavailableError) {
    return "DIRECT_UPLOAD_PRESIGN_UNAVAILABLE";
  }
  if (err instanceof DirectUploadPutError) {
    return "DIRECT_UPLOAD_PUT_FAILED";
  }
  if (err instanceof DirectUploadPresignError) {
    // Preserve the presign contract's own code when it is a known ErrorCode
    // (isErrorCode = single source of truth). A 413 for >100MB must stay
    // FILE_TOO_LARGE, not become a direct-upload infra code.
    if (err.code && isErrorCode(err.code)) return err.code;
    return "DIRECT_UPLOAD_PRESIGN_ERROR";
  }
  // Legacy/unknown throw (e.g. a raw bug): stage unknown. Keep the legacy
  // aggregate code — it remains valid in the union and in every gate's set.
  return "DIRECT_UPLOAD_FAILED";
}
