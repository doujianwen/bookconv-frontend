// src/lib/rate-limit.ts
import { requireRedisClient } from './redis';
import { errorMessage } from './error-handler';
import { loggers as log } from './logger';
import { readClientIp, type HeaderSource } from './client-ip';

/**
 * Minimal structural view of the request fields the IP helpers actually read.
 *
 * Deliberately narrow instead of `any`: NextRequest (and plain test doubles)
 * satisfy it structurally, while a typo such as `request.headres` is caught.
 */
export interface IpRequestLike {
  /** Next.js built-in client IP. Removed in newer Next versions; optional. */
  ip?: string;
  headers?: { get?(name: string): string | null };
  socket?: { remoteAddress?: string };
}

/**
 * Layered rate-limit strategy configuration.
 *
 * Implemented with a Redis sliding-window counter, supporting multi-instance
 * deployments and per-IP / per-user / per-endpoint limits.
 * When Redis is unavailable it gracefully degrades to an in-memory limiter
 * (per-instance, but better than nothing).
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number; // seconds
}

export interface RateLimitOptions {
  /** Window size in milliseconds (default 60s) */
  windowMs?: number;
  /** Maximum requests allowed within the window (default 100) */
  maxRequests?: number;
}

/** Pre-defined layered rate-limit strategies */
export const RATE_LIMIT_STRATEGIES = {
  /** Anonymous users: 60 requests per IP per 60s */
  anonymous: { windowMs: 60_000, maxRequests: 60 },
  /** Authenticated users: 300 requests per user per 60s */
  authenticated: { windowMs: 60_000, maxRequests: 300 },
  /** Convert API: 20 requests per IP per 60s (heavier operation) */
  convertApi: { windowMs: 60_000, maxRequests: 20 },
  /**
   * Presign API: 30 requests per IP per 60s.
   * Higher than convertApi because a single conversion can legitimately retry a
   * presign (expired URL, network drop) without the user doing anything twice.
   * Still low enough that minting keys is not a free R2-write primitive.
   */
  presignApi: { windowMs: 60_000, maxRequests: 30 },
  /** Payment webhook: 10 requests per IP per 60s */
  paymentWebhook: { windowMs: 60_000, maxRequests: 10 },
  /** Health check: not rate-limited */
  health: { windowMs: 1_000, maxRequests: 999_999 },
  /** Download API: 50 requests per IP per 3600s */
  downloadApi: { windowMs: 3600_000, maxRequests: 50 },
  /** Feedback API: 5 requests per IP per 10min (anti-abuse, honeypot-backed) */
  feedback: { windowMs: 600_000, maxRequests: 5 },
} as const;

const REDIS_KEY_PREFIX = "ratelimit:";

// --- Trust-proxy configuration ---------------------------------------------------
const TRUST_PROXY = process.env.TRUST_PROXY === 'true';

const TRUSTED_PROXY_IPS = (process.env.TRUSTED_PROXIES || '127.0.0.1,::1')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Well-known Cloudflare IP ranges (top 4 CIDRs).
 * Full list: https://www.cloudflare.com/ips/
 */
const CLOUDFLARE_CIDRS = [
  '103.21.244.0/15',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '104.16.0.0/13',
] as const;

// ---- In-memory fallback store ----
interface MemRecord {
  count: number;
  windowStart: number;
}
const memStore = new Map<string, MemRecord>();

function memCheck(identifier: string, windowMs: number, maxRequests: number): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  let record = memStore.get(key);

  if (!record || now - record.windowStart > windowMs) {
    record = { count: 1, windowStart: now };
    memStore.set(key, record);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  record.count += 1;
  const remaining = Math.max(0, maxRequests - record.count);
  const allowed = record.count <= maxRequests;
  const retryAfter = allowed ? undefined : Math.ceil((record.windowStart + windowMs - now) / 1000);

  return {
    allowed,
    remaining,
    resetAt: record.windowStart + windowMs,
    ...(retryAfter !== undefined && { retryAfter }),
  };
}

/**
 * Redis-based sliding-window counter rate limiter.
 *
 * Algorithm: reset the counter at the start of each time window and accumulate
 * requests within the window. Uses Redis INCR + EXPIRE for atomicity and auto-expiry.
 *
 * Gracefully degrades to an in-memory limiter when Redis is unavailable.
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const {
    windowMs = 60_000,
    maxRequests = 100,
  } = options;

  const key = `${REDIS_KEY_PREFIX}${identifier}`;
  const now = Date.now();
  const resetAt = now + windowMs;

  try {
    const redis = requireRedisClient();
    // ioredis exposes connection state through `status`, NOT `connected` — the
    // latter is undefined at runtime, so `!redis.connected` was always true and
    // issued a redundant connect() before every command. 'wait' is the
    // lazyConnect initial state, i.e. the only state that needs a connect().
    if (redis.status === 'wait') {
      await redis.connect();
    }

    // Use Lua script to atomically INCR + set expiry on first request.
    // This prevents the race condition where incr succeeds but expire
    // is never called (e.g., if the server crashes between the two commands).
    const luaScript = `
      local count = redis.call('INCR', KEYS[1])
      if tonumber(count) == 1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
      end
      return count
    `;
    // ioredis takes numKeys positionally: eval(script, numKeys, ...keysAndArgs).
    // The `{ keys, arguments }` object form belongs to node-redis — passed here
    // it serialised to the literal string "[object Object]", Redis rejected the
    // command, and every call silently fell through to the in-memory fallback
    // (per-instance, so the documented per-IP limits were never enforced).
    const evalReply = await redis.eval(luaScript, 1, key, String(Math.ceil(windowMs / 1000)));
    const currentCount = Number(evalReply);
    if (!Number.isFinite(currentCount)) {
      throw new Error(`Unexpected EVAL reply: ${String(evalReply)}`);
    }

    const remaining = Math.max(0, maxRequests - currentCount);
    const allowed = currentCount <= maxRequests;

    // Compute retry-after wait time
    let retryAfter: number | undefined;
    if (!allowed) {
      const ttl = await redis.ttl(key);
      retryAfter = ttl > 0 ? ttl : Math.ceil(windowMs / 1000);
    }

    return {
      allowed,
      remaining,
      resetAt,
      ...(retryAfter !== undefined && { retryAfter }),
    };
  } catch (err) {
    log.rateLimit.error('Redis error, falling back to in-memory limiter', { error: errorMessage(err) });
    // Fallback to in-memory rate limiting instead of allowing all requests
    return memCheck(identifier, windowMs, maxRequests);
  }
}

/**
 * Build rate-limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult, maxRequests: number) {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(maxRequests),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };

  if (result.retryAfter) {
    headers["Retry-After"] = String(result.retryAfter);
  }

  return headers;
}

/**
 * Determine the real client IP from a request, respecting trust-proxy config.
 *
 * 2026-11-02 重写。原实现有两个缺陷，二者叠加导致**全站共用一个限流桶**：
 *
 *   ① 生产环境三个分支全部落空：Next 16 已移除 `request.ip`（类型层无此字段），
 *      `TRUST_PROXY` 未配置（默认 false ⇒ 跳过 XFF），App Router 的
 *      `NextRequest` 也没有 `socket`；于是恒返回 `'unknown'`，
 *      Redis 键固定为 `ratelimit:ip:unknown`。
 *   ② 即使设了 `TRUST_PROXY=true` 也修不好：原代码用 `isTrustedSource(firstIp)`
 *      校验**链首**（那是客户端 IP），而注释要校验的是「立即对端（链尾）」。
 *      客户端 IP 永远不在可信代理名单里 ⇒ 分支被跳过 ⇒ 仍旧 `'unknown'`。
 *
 * 实测证据（诊断报告 §12）：两个完全不同的客户端（HK IPv4 与 本机 IPv6）
 * 连续递减同一个计数器（19 → 18 → 17 → 16）。即任何人 20 次请求即可让
 * 全站转换在窗口剩余时间内全部 429。
 *
 * 现顺序：
 *   1. Vercel 运行时：采信平台规范化后的转发头（伪造测试见 client-ip.ts 注释）
 *   2. 自托管 + `TRUST_PROXY=true`：多跳时校验链尾为已知代理，单跳时按声明采信
 *   3. `request.ip` / socket 地址（非 Vercel 环境的兜底）
 *   4. `'unknown'`：保留原语义，但改为**首次出现时告警**——这种降级必须可见，
 *      否则限流会静默退化成全站共享桶（正是本次故障的形态）。
 */
function getClientIp(request: IpRequestLike): string {
  // 1. Vercel：平台会覆盖客户端自带的转发头，可直接采信
  if (isVercelRuntime()) {
    const fromHeaders = readClientIp(request.headers as HeaderSource | undefined);
    if (fromHeaders) return fromHeaders;
  }

  // 2. Trusted reverse-proxy path（自托管场景，需显式声明 TRUST_PROXY=true）
  if (TRUST_PROXY) {
    const chain = parseForwardedChain(request.headers?.get?.('x-forwarded-for'));
    if (chain.length >= 2) {
      // 多跳：链尾是最近一跳代理，校验通过才采信链首（原始客户端）
      const peer = chain[chain.length - 1];
      if (isTrustedSource(peer)) return chain[0];
    } else if (chain.length === 1) {
      // 单跳：链上只有客户端本身，无从校验对端；采信由 TRUST_PROXY 声明兜底
      return chain[0];
    }
  }

  // 3. Framework-provided IP
  if (request.ip) {
    return String(request.ip);
  }

  const socketAddr = request.socket?.remoteAddress;
  if (socketAddr && socketAddr !== '::1' && socketAddr !== '127.0.0.1') {
    return socketAddr;
  }

  // 4. Last resort — 降级必须可见（2026-11-02）
  if (!warnedUnknownIdentifier) {
    warnedUnknownIdentifier = true;
    log.rateLimit.warn(
      'Client IP could not be determined; rate limiting degrades to a single shared bucket',
      { hint: 'Check TRUST_PROXY / platform forwarded headers if this is unexpected' },
    );
  }
  return 'unknown';
}

/** 读环境变量而非模块常量：便于测试按用例切换运行时，且不影响现有 TRUST_PROXY 语义。 */
function isVercelRuntime(): boolean {
  return process.env.VERCEL === '1';
}

/** 告警只打一次，避免每个请求刷屏。 */
let warnedUnknownIdentifier = false;

/** 拆 XFF 链并只保留合法 IP；链首→链尾 = 原始客户端→最近一跳代理。 */
function parseForwardedChain(headerValue: string | null | undefined): string[] {
  if (!headerValue) return [];
  return headerValue
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && /^[0-9a-fA-F:.]{2,45}$/.test(s));
}

/** Check whether an IP is trusted (explicit list or Cloudflare CIDR). */
function isTrustedSource(ip: string): boolean {
  // Direct match against explicit trusted proxies
  if (TRUSTED_PROXY_IPS.includes(ip)) {
    return true;
  }

  // Check against Cloudflare CIDR ranges
  if (ipInAnyCidr(ip, CLOUDFLARE_CIDRS)) {
    return true;
  }

  return false;
}

/**
 * Simple IPv4 CIDR containment check.
 * Only supports /8–/32 ranges; sufficient for our Cloudflare entries.
 */
function ipToNumber(ip: string): number {
  return (
    (parseInt(ip.split('.')[0], 10) << 24) |
    (parseInt(ip.split('.')[1], 10) << 16) |
    (parseInt(ip.split('.')[2], 10) << 8) |
    parseInt(ip.split('.')[3], 10)
  ) >>> 0;
}

function ipInAnyCidr(ip: string, cidrs: readonly string[]): boolean {
  const ipNum = ipToNumber(ip);
  return cidrs.some((cidr) => {
    const [net, prefixLenStr] = cidr.split('/');
    const prefixLen = parseInt(prefixLenStr, 10);
    const mask = prefixLen === 0 ? 0 : (~0 << (32 - prefixLen)) >>> 0;
    return (ipNum & mask) === (ipToNumber(net) & mask);
  });
}

/**
 * Build the rate-limit identifier (IP or user ID) from a NextRequest
 */
export function getRateLimitIdentifier(
  request: IpRequestLike,
  userId?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }
  const ip = getClientIp(request);
  return `ip:${ip}`;
}

/**
 * Convenience helper: rate-limit using a predefined strategy
 */
export async function checkRateLimitWithStrategy(
  request: IpRequestLike,
  strategyName: keyof typeof RATE_LIMIT_STRATEGIES,
  userId?: string
): Promise<RateLimitResult> {
  const strategy = RATE_LIMIT_STRATEGIES[strategyName];
  const identifier = getRateLimitIdentifier(request, userId);
  return checkRateLimit(identifier, strategy);
}
