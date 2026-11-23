// Single source of truth for conversion-layer timeout budgets (P0 G-C, 2026-11-21;
// budget inversion fixed in CEO red-team round2, 2026-11-21).
//
// Why centralized: before this file the same budget was spelled inline in three
// places — the Vercel edge route (maxDuration=300s), the backend delegation
// client (90s) and the Calibre engine. The browser had NO client-side abort at
// all: a stalled request could hang until the platform killed it at 300s with
// no GA4 attribution. Round2 additionally discovered a real BUDGET INVERSION:
// calibre(120s) > delegate(90s), so the Calibre child could still be running
// when the edge had already aborted and fallen back to CloudConvert → orphan
// job + double billing + duplicate request_id.
//
// BUDGET (must stay strictly monotonically increasing outer→inner):
//   calibre 60s < delegate 90s < client 300s == edge 300s
//   Rationale: the innermost subprocess must always finish before its caller
//   gives up, so no orphan job can outlive the request that spawned it.
//   `tests/unit/conversion-timeouts.test.ts` enforces this invariant AND guards
//   the literal values in the 3 source files that cannot import this module.
//   - edge 300s    = platform hard kill (src/app/api/convert/route.ts maxDuration;
//                    Next.js requires a static literal — guarded by test, not import)
//   - client 300s  = browser AbortController, aligned to edge so an abort is
//                    attributed by our code before the platform kills the socket
//   - delegate 90s = client → self-hosted backend fetch (env CONVERSION_BACKEND_TIMEOUT_MS)
//   - calibre 60s  = backend → ebook-convert subprocess (env CALIBRE_TIMEOUT;
//                    was 120s in round1 — inverted vs delegate. Rollback: set
//                    CALIBRE_TIMEOUT=120000, but that REINTRODUCES the inversion.)

/** Vercel serverless hard limit for POST /api/convert (seconds). */
export const CONVERSION_EDGE_MAX_SECONDS = 300;

/** Browser-side abort budget for the /api/convert fetch (milliseconds). */
export const CONVERSION_CLIENT_TIMEOUT_MS = CONVERSION_EDGE_MAX_SECONDS * 1000;

/** Default client→backend delegation timeout (milliseconds). */
export const CONVERSION_BACKEND_TIMEOUT_MS = 90_000;

/** Backend→Calibre subprocess timeout (milliseconds). Must be < delegate budget. */
export const CALIBRE_TIMEOUT_MS = 60_000;

/** Human-readable summary for audits/tests; not used at runtime. */
export const CONVERSION_TIMEOUT_BUDGET = {
  edgeMaxSeconds: CONVERSION_EDGE_MAX_SECONDS,
  clientTimeoutMs: CONVERSION_CLIENT_TIMEOUT_MS,
  backendDelegateMs: CONVERSION_BACKEND_TIMEOUT_MS,
  calibreMs: CALIBRE_TIMEOUT_MS,
} as const;

/**
 * Cancellation propagation contract (round2). Client abort does NOT propagate
 * into the serverless edge's outbound fetch — the edge owns its own 90s budget.
 * Edge delegate abort likewise does NOT kill the Calibre child directly; the
 * child is bounded by its own 60s timeout, which is why calibre < delegate is a
 * hard invariant (no orphan child outliving the edge request).
 */
export const CONVERSION_TIMEOUT_CANCEL_CONTRACT = {
  clientAbortPropagatesToEdge: false,
  edgeAbortPropagatesToCalibreChild: false,
  orphanPrevention: "calibre_timeout_lt_delegate_budget",
} as const;
