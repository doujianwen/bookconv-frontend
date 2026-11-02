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
//
// --- 健康失败 vs 容量忙（2026-11-02 红队修正）---
// 本模块的语义是「后端是否还活着」。但 429 BACKEND_BUSY 表达的是「我活着，只是
// 排满了」——它是一个**容量信号**，不是健康信号：
//   * 响应极快（60 字节、毫秒级），不存在熔断要避免的「每次等 90s 超时」成本；
//   * 回退 CloudConvert 本就是预期降级路径，不需要熔断来加速。
// 把 429 计入 failures 会造成：连续 3 次并发争用 ⇒ 熔断打开 ⇒ 该实例 60s 内
// **所有**请求绕过后端、全部压给 CloudConvert（额度紧张 + 每次多 10–30s）。
// 即「后端有点忙」被放大成「后端不可用」。故 429 走独立的 recordBackendBusy()，
// 只计数供观测，不驱动熔断。5xx / 超时 / 网络错误仍计入 failures。

const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 60_000;

let failures = 0;
/** 自上次成功以来的连续「后端忙」次数。纯观测值，绝不参与熔断判定。 */
let busyCount = 0;
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
  busyCount = 0;
  openUntil = 0;
}

/**
 * 记录一次「后端忙」（HTTP 429，BACKEND_BUSY 或上游 limit_req）。
 *
 * 只递增观测计数，**不触碰 failures / openUntil**——这是红线：一旦让它参与
 * 熔断，容量争用就会升级成整段冷却期的全站降级（见文件头说明）。
 */
export function recordBackendBusy(): void {
  busyCount += 1;
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
    busyCount,
    cooldownRemainingMs: Math.max(0, openUntil - now),
  };
}
