// src/lib/client/csp-violation.ts
//
// R-2 (2026-11-06): split the coarse `PUT:NETWORK` diagnostic bucket into
// `PUT:CSP` vs `PUT:NETWORK` so a Content-Security-Policy block can never again
// hide inside "network failure" for weeks.
//
// WHY THIS EXISTS
//   The 2026-10-27→11-06 P0 (100% of >4MB uploads failing) was invisible for
//   ~10 days because `conversion_failed.error_code` was DIRECT_UPLOAD_PUT_FAILED
//   and the F20 diagnostic prefix said `PUT:NETWORK:on=1:<1s:` — a bucket that
//   mixes THREE unrelated causes:
//     (a) CSP connect-src blocking the fetch before any request is sent,
//     (b) R2/CORS rejecting the request (deterministic, shows up as (a) too
//         when the preflight is refused),
//     (c) a genuine transient network drop.
//   (a) is a permanent configuration defect; (c) is transient. Treating them as
//   one bucket is why a deterministic 100% failure was repeatedly re-read as
//   "flaky client network".
//
// HOW THE DISCRIMINATOR WORKS
//   A fetch blocked by CSP fires `securitypolicyviolation` on `document`. Real
//   network drops do not. That event is the only in-page signal that separates
//   the two — the thrown error is `TypeError: Failed to fetch` in both cases.
//
//   ⚠️ MEASURED, NOT ASSUMED (real Chromium, 2026-11-06):
//     - CSP-blocked fetch → event fires with effectiveDirective="connect-src",
//       blockedURI = the presigned URL, disposition="enforce".
//     - genuine network drop (dead port) → 0 events (no false positive).
//     - allowed CSP → PUT 200, 0 events.
//     - **the event arrives ~1.7ms AFTER the fetch promise rejects**
//       (reject@16.1ms, event@17.8ms). A SYNCHRONOUS read inside `catch`
//       therefore ALWAYS sees nothing and would silently emit NETWORK forever —
//       a green-looking feature that never fires. Hence the mandatory
//       one-macrotask wait in detectCspBlock().
//     - one `setTimeout(0)` is sufficient: 8/8 trials saw the event after the
//       tick (0.0–5.8ms, median 0.2ms).
//
// DISCIPLINE
//   - Never throw. Any failure degrades to "no CSP signal" (i.e. the previous
//     NETWORK classification), so this can only add information, never break
//     the upload path.
//   - Attribute strictly: same connect-type directive AND same host as the
//     upload target. An unrelated blocked beacon must not be blamed on the PUT.
//   - Bounded buffer — a page that violates CSP in a loop must not grow memory.

/** A recorded `securitypolicyviolation` event. */
export interface CspViolationRecord {
  /** Directive actually enforced (e.g. "connect-src", or "default-src" when connect-src falls back). */
  effectiveDirective: string;
  /** Directive as authored in the policy. */
  violatedDirective: string;
  /** URL the browser refused to load (the presigned R2 URL for our case). */
  blockedURI: string;
  /** "enforce" | "report". */
  disposition: string;
  /**
   * Wall-clock timestamp in the SAME base as the callers' `since`
   * (`Date.now()`), i.e. epoch milliseconds.
   *
   * ⚠️ MUST be Date.now(), NOT performance.now(). performance.now() counts from
   * page load (order of thousands) while putStart/presignStart use Date.now()
   * (order of 1.7e12), so every comparison `at < since` would be true and the
   * discriminator would silently never match — a green-looking feature that
   * always emits NETWORK. Pinned by a regression test.
   */
  at: number;
}

/** Hard cap so a pathological page cannot grow the buffer without bound. */
const MAX_RECORDS = 16;

const records: CspViolationRecord[] = [];
let installed = false;

/**
 * connect-type directives: `connect-src` governs fetch()/XHR/WebSocket.
 * When a policy omits `connect-src`, the browser falls back to `default-src`,
 * which then reports as the effective directive — still relevant to us.
 */
export function isConnectDirective(directive?: string | null): boolean {
  if (!directive) return false;
  // A directive list can be space-separated in `violatedDirective`.
  const base = directive.trim().split(/\s+/)[0];
  return base === "connect-src" || base === "default-src";
}

/** Host of an absolute URL, or null when it is relative / unparsable. */
export function hostOf(url?: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).host || null;
  } catch {
    return null;
  }
}

/**
 * Pick the first recorded violation that can be attributed to our upload.
 *
 * Attribution rules (all must hold):
 *   1. recorded at/after `since` (the start of this upload attempt),
 *   2. a connect-type directive,
 *   3. its blockedURI host matches `expectedHost` — unless the browser omitted
 *      the URI (some engines blank it), in which case we cannot attribute and
 *      therefore do NOT claim a CSP block.
 *
 * Pure — no DOM, no globals — so the whole decision is unit-testable.
 */
export function matchViolation(
  list: readonly CspViolationRecord[],
  opts: { since: number; expectedHost?: string | null },
): CspViolationRecord | null {
  const expected = opts.expectedHost ?? null;
  for (const v of list) {
    if (!v || typeof v.at !== "number" || v.at < opts.since) continue;
    if (!isConnectDirective(v.effectiveDirective)) continue;
    const host = hostOf(v.blockedURI);
    if (expected && host && host !== expected) continue; // someone else's violation
    if (expected && !host) continue; // un-attributable → stay NETWORK
    return v;
  }
  return null;
}

/** Append with a hard cap (oldest evicted). Exported for tests. */
export function pushViolation(v: CspViolationRecord): void {
  records.push(v);
  while (records.length > MAX_RECORDS) records.shift();
}

/** Current buffer snapshot (copy). Exported for tests. */
export function recordedViolations(): CspViolationRecord[] {
  return records.slice();
}

/**
 * Remove a matched record so it cannot be attributed to a later attempt.
 * Exported for tests.
 */
export function consumeViolation(target: CspViolationRecord): void {
  const i = records.indexOf(target);
  if (i >= 0) records.splice(i, 1);
}

/**
 * Install the document-level listener once per page. Idempotent and safe to
 * call before every upload attempt (SSR / jsdom without the API → no-op).
 */
export function installCspViolationRecorder(): void {
  if (installed) return;
  if (typeof document === "undefined" || typeof document.addEventListener !== "function") return;
  installed = true;
  document.addEventListener("securitypolicyviolation", (e) => {
    try {
      const ev = e as unknown as Partial<SecurityPolicyViolationEvent>;
      pushViolation({
        effectiveDirective: String(ev.effectiveDirective ?? ""),
        violatedDirective: String(ev.violatedDirective ?? ""),
        blockedURI: String(ev.blockedURI ?? ""),
        disposition: String(ev.disposition ?? ""),
        // Date.now() — see CspViolationRecord.at: must share the caller's
        // time base or every comparison silently fails.
        at: Date.now(),
      });
    } catch {
      // A malformed event must never break the caller's error path.
    }
  });
}

function tick(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (typeof setTimeout === "function") setTimeout(resolve, 0);
    else resolve();
  });
}

/**
 * Decide whether the just-failed upload attempt was blocked by CSP.
 *
 * MUST be awaited from the failure path (never the success path, so a healthy
 * upload pays nothing). Costs ~0.2ms (one macrotask) on failure.
 *
 * Returns the attributed violation, or null when this is a genuine
 * network-layer failure — i.e. the caller keeps the existing NETWORK token.
 */
export async function detectCspBlock(opts: {
  since: number;
  expectedHost?: string | null;
}): Promise<CspViolationRecord | null> {
  try {
    // The violation event is dispatched AFTER the fetch rejection (measured
    // 1.7ms later) — without this wait the read is always empty.
    await tick();
    const hit = matchViolation(records, opts);
    if (hit) consumeViolation(hit);
    return hit;
  } catch {
    return null;
  }
}

/** Test-only: reset module state between cases. */
export function __resetCspViolationForTest(): void {
  records.length = 0;
  installed = false;
}
