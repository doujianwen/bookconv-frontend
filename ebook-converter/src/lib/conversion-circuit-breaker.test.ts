// Unit tests for the in-memory circuit breaker guarding the self-hosted
// Calibre backend (WP4 failover). See src/lib/conversion-circuit-breaker.ts.
import {
  breakerState,
  breakerSnapshot,
  recordBackendFailure,
  recordBackendSuccess,
  shouldUseBackend,
} from "@/lib/conversion-circuit-breaker";

describe("conversion circuit breaker", () => {
  beforeEach(() => {
    recordBackendSuccess(); // reset module state between tests
  });

  it("starts closed and allows backend attempts", () => {
    expect(breakerState()).toBe("closed");
    expect(shouldUseBackend()).toBe(true);
  });

  it("does not open before the failure threshold", () => {
    expect(recordBackendFailure().transitionedToOpen).toBe(false);
    expect(recordBackendFailure().transitionedToOpen).toBe(false);
    expect(breakerState()).toBe("closed");
    expect(shouldUseBackend()).toBe(true);
  });

  it("opens on the 3rd consecutive failure and blocks the backend", () => {
    recordBackendFailure();
    recordBackendFailure();
    const third = recordBackendFailure();
    expect(third.transitionedToOpen).toBe(true);
    expect(breakerState()).toBe("open");
    expect(shouldUseBackend()).toBe(false);
    expect(breakerSnapshot().cooldownRemainingMs).toBeGreaterThan(0);
  });

  it("a success resets the failure count (closed again)", () => {
    recordBackendFailure();
    recordBackendFailure();
    recordBackendSuccess();
    expect(breakerState()).toBe("closed");
    expect(shouldUseBackend()).toBe(true);
    // and one more failure does NOT open the circuit (count restarted)
    expect(recordBackendFailure().transitionedToOpen).toBe(false);
  });

  it("re-opens immediately when a half-open trial fails", () => {
    const t0 = 1_000_000;
    recordBackendFailure(t0);
    recordBackendFailure(t0);
    const openOutcome = recordBackendFailure(t0);
    expect(openOutcome.transitionedToOpen).toBe(true);

    const afterCooldown = t0 + 60_001; // past the 60s cooldown
    expect(breakerState(afterCooldown)).toBe("half-open");
    expect(shouldUseBackend(afterCooldown)).toBe(true); // trial allowed

    const failedTrial = recordBackendFailure(afterCooldown);
    expect(failedTrial.transitionedToOpen).toBe(true); // re-opened
    expect(shouldUseBackend(afterCooldown)).toBe(false);
  });

  it("closes again when the half-open trial succeeds", () => {
    const t0 = 2_000_000;
    recordBackendFailure(t0);
    recordBackendFailure(t0);
    recordBackendFailure(t0); // open
    const afterCooldown = t0 + 60_001;
    expect(breakerState(afterCooldown)).toBe("half-open");
    recordBackendSuccess();
    expect(breakerState()).toBe("closed");
    expect(shouldUseBackend()).toBe(true);
  });
});
