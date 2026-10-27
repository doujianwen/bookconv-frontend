// In-memory circuit breaker for the self-hosted Calibre conversion backend (WP4).
//
// Why in-memory (not Redis/shared state): the breaker's ONLY job is to stop
// hammering a dead backend with 30-90s timeouts on every request. State is
// per serverless instance and resets on cold start — that is acceptable, because
// at worst a fresh warm-up instance retries the backend once before falling back
// to CloudConvert. The hard guarantee (failover to CloudConvert) does NOT depend
// on the breaker; the breaker only trims latency while the backend is known-down.
//
// Fail-open: callers must treat shouldUseBackend() as true if this module ever
// throws, so we never accidentally disable the self-hosted path.

const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 60_000;

let failures = 0;
let openUntil = 0; // epoch ms; 0 = closed

export type BreakerState = "closed" | "open" | "half-open";

export function breakerState(now: number = Date.now()): BreakerState {
  if (openUntil === 0) return "closed";
  return now < openUntil ? "open" : "half-open";
}

export function shouldUseBackend(now: number = Date.now()): boolean {
  return breakerState(now) !== "open";
}

export function recordBackendSuccess(): void {
  failures = 0;
  openUntil = 0;
}

export interface FailureOutcome {
  /** True only on the transition into OPEN (Nth consecutive failure or a failed half-open trial). */
  transitionedToOpen: boolean;
}

export function recordBackendFailure(now: number = Date.now()): FailureOutcome {
  const wasHalfOpen = openUntil !== 0 && now >= openUntil;
  failures += 1;
  if (failures >= FAILURE_THRESHOLD) {
    const alreadyOpen = openUntil !== 0 && now < openUntil;
    openUntil = now + COOLDOWN_MS;
    return { transitionedToOpen: !alreadyOpen || wasHalfOpen };
  }
  return { transitionedToOpen: false };
}

/** Observability snapshot for logs/health checks. */
export function breakerSnapshot(now: number = Date.now()) {
  return {
    state: breakerState(now),
    failures,
    cooldownRemainingMs: Math.max(0, openUntil - now),
  };
}
