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
 *  `code` (e.g. "FILE_TOO_LARGE" for a 413) so it can survive mapping.
 *
 *  F20 (2026-11-05): also carries `elapsedMs` (wall time of the presign
 *  request) and `online` (navigator.onLine at failure) so the failure can be
 *  root-caused after the fact — a raw TypeError from a CORS preflight rejection
 *  is otherwise indistinguishable from a network drop or a 5xx. */
export class DirectUploadPresignError extends Error {
  status?: number;
  /** Raw code from the presign response payload, if any. */
  code?: string;
  elapsedMs?: number;
  online?: boolean;

  constructor(
    message: string,
    opts?: { status?: number; code?: string; elapsedMs?: number; online?: boolean },
  ) {
    super(message);
    this.name = "DirectUploadPresignError";
    this.status = opts?.status;
    this.code = opts?.code;
    this.elapsedMs = opts?.elapsedMs;
    this.online = opts?.online;
  }
}

/** The R2 PUT itself failed: CORS preflight rejection, network error,
 *  or a non-2xx status from storage.
 *
 *  F20 (2026-11-05): carries `status` (when R2 answered with a non-2xx),
 *  `elapsedMs` (wall time of the PUT) and `online` (navigator.onLine at
 *  failure). This is the missing context that made 2026-11-04's 10 PUT
 *  failures forever unclassifiable — GA4 only recorded the stage code, never
 *  whether it was CORS/network (no status) vs an R2 403/5xx (status present). */
export class DirectUploadPutError extends Error {
  status?: number;
  elapsedMs?: number;
  online?: boolean;

  constructor(
    message: string,
    opts?: { status?: number; elapsedMs?: number; online?: boolean },
  ) {
    super(message);
    this.name = "DirectUploadPutError";
    this.status = opts?.status;
    this.elapsedMs = opts?.elapsedMs;
    this.online = opts?.online;
  }
}

/**
 * Stage-typed diagnostic context, carried from the thrown error through the
 * wrapping Error.cause and into the GA4 `error` field prefix (F20).
 */
export interface DiagnosticContext {
  stage: "presign" | "put";
  status?: number;
  elapsedMs?: number;
  online?: boolean;
}

/** Bucket elapsed ms into coarse ranges so the GA4 `error` prefix stays a
 *  finite, groupable value instead of a unique per-event number that would
 *  fragment the failed_by_error dimension. */
function bucketMs(ms?: number): string {
  if (typeof ms !== "number") return "?";
  if (ms < 1000) return "<1s";
  if (ms < 5000) return "1-5s";
  if (ms < 15000) return "5-15s";
  return ">15s";
}

/**
 * Build a compact, structured diagnostic prefix for the GA4 `error` field so
 * that direct-upload failures become root-cause classifiable after the fact
 * (F20). Pure function — unit-testable, no browser APIs.
 *
 * Format:  "<PUT|PRESIGN>:<HTTP<status>|NETWORK>:on=<0|1|?>:<ms-bucket>:"
 *   - HTTP<status>  → R2 answered with a non-2xx (e.g. 403 / 503) — server-side
 *   - NETWORK       → no response at all — CORS preflight rejection OR network drop
 *   - on=0          → browser reported navigator.onLine=false (client offline)
 *   - >15s bucket   → strong timeout signal
 * Example: "PUT:NETWORK:on=1:1-5s:"  (CORS/network failure, online, failed in 1-5s)
 *          "PUT:HTTP403:on=1:>15s:"   (R2 rejected with 403 after a 15s+ hang)
 * Returns "" when no diagnostic context is present (non-direct-upload failures).
 */
export function diagnosticPrefix(diag?: DiagnosticContext): string {
  if (!diag) return "";
  const kind = typeof diag.status === "number" ? `HTTP${diag.status}` : "NETWORK";
  const online = diag.online === undefined ? "?" : diag.online ? "1" : "0";
  const tag = diag.stage === "put" ? "PUT" : "PRESIGN";
  return `${tag}:${kind}:on=${online}:${bucketMs(diag.elapsedMs)}:`;
}

/**
 * Extract a stage-typed DiagnosticContext from a thrown direct-upload error.
 * Pure — unit-testable, no browser APIs. Returns undefined for non-direct
 * errors so callers can short-circuit.
 *
 * F20 P1 (2026-11-05 red-team audit): this moves the inline `instanceof`
 * extraction that lived inside ToolPageClient (15 lines) into a single
 * testable function, closing the component-level test gap — the extraction
 * logic is now verifiable without rendering React.
 */
export function extractDiagnosticContext(err: unknown): DiagnosticContext | undefined {
  if (err instanceof DirectUploadPutError) {
    return { stage: "put", status: err.status, elapsedMs: err.elapsedMs, online: err.online };
  }
  if (err instanceof DirectUploadPresignError) {
    return { stage: "presign", status: err.status, elapsedMs: err.elapsedMs, online: err.online };
  }
  return undefined;
}

/**
 * Build the GA4 `error` diagnostic prefix from ANY thrown error in the
 * conversion flow. Reads the DiagnosticContext either off `err.cause.duDiag`
 * (the shape ToolPageClient forwards through the wrapping Error) or directly
 * off a typed direct-upload error. Returns "" for non-direct-upload failures
 * so the GA4 error field is left unchanged (F20 P1).
 *
 * Pure — unit-testable without rendering React. This is the single seam the
 * outer catch in ToolPageClient calls, so the end-to-end prefix wiring
 * (thrown typed error → wrapped cause → GA4 prefix) is now covered by tests.
 */
export function buildDirectUploadErrorPrefix(err: unknown): string {
  if (err && typeof err === "object") {
    const fromCause = (err as { cause?: { duDiag?: DiagnosticContext } }).cause?.duDiag;
    if (fromCause) return diagnosticPrefix(fromCause);
  }
  return diagnosticPrefix(extractDiagnosticContext(err));
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
