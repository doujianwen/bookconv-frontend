// src/lib/rate-limit.ts
import IORedis from 'ioredis';
import { getRedisClient } from './redis';
import { loggers as log } from './logger';

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
  /** Payment webhook: 10 requests per IP per 60s */
  paymentWebhook: { windowMs: 60_000, maxRequests: 10 },
  /** Health check: not rate-limited */
  health: { windowMs: 1_000, maxRequests: 999_999 },
  /** Download API: 50 requests per IP per 3600s */
  downloadApi: { windowMs: 3600_000, maxRequests: 50 },
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
    const redis = getRedisClient();
    if (!redis.connected) {
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
    const currentCount = await redis.eval(luaScript, {
      keys: [key],
      arguments: [String(Math.ceil(windowMs / 1000))],
    });

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
  } catch (err: any) {
    log.rateLimit.error('Redis error, falling back to in-memory limiter', { error: err.message });
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
 * Internal helper: parse the first (leftmost) IP from an x-forwarded-for header.
 * Only used within getClientIp() when TRUST_PROXY is enabled.
 * External callers should use getClientIp() directly.
 */
function extractFirstIp(headerValue: string | null): string {
  if (!headerValue) return '';
  return headerValue.split(',')[0].trim();
}

/**
 * Determine the real client IP from a request, respecting trust-proxy config.
 *
 * Priority:
 * 1. ``request.ip`` — Next.js built-in (most reliable when available)
 * 2. ``x-forwarded-for`` — only trusted when behind a known proxy
 * 3. Socket address (`request.socket.remoteAddress`)
 * 4. ``"unknown"`` as last resort
 */
function getClientIp(request: any): string {
  // 1. Next.js built-in IP — already resolved by framework
  if (request.ip) {
    return String(request.ip);
  }

  // 2. Trusted reverse-proxy path
  if (TRUST_PROXY) {
    const xff = request.headers?.get?.('x-forwarded-for');
    if (xff) {
      const firstIp = extractFirstIp(xff);
      // Validate that the immediate peer (last hop in XFF chain) is trusted
      // or belongs to a known CDN range.
      if (isTrustedSource(firstIp)) {
        return firstIp;
      }
    }
  }

  // 3. Fall back to socket address
  const socketAddr = request.socket?.remoteAddress;
  if (socketAddr && socketAddr !== '::1' && socketAddr !== '127.0.0.1') {
    return socketAddr;
  }

  // 4. Last resort
  return 'unknown';
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
  request: any,
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
  request: any,
  strategyName: keyof typeof RATE_LIMIT_STRATEGIES,
  userId?: string
): Promise<RateLimitResult> {
  const strategy = RATE_LIMIT_STRATEGIES[strategyName];
  const identifier = getRateLimitIdentifier(request, userId);
  return checkRateLimit(identifier, strategy);
}
