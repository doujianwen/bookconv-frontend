// src/lib/rate-limit.ts
import IORedis from 'ioredis';
import { getRedisClient } from './redis';

/**
 * 分层限流策略配置
 *
 * 使用 Redis 滑动窗口计数器实现，支持多实例部署、按 IP/用户/端点区分限流。
 * Redis 不可用时自动降级为内存限流（per-instance，但总比没有好）。
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number; // seconds
}

export interface RateLimitOptions {
  /** 窗口大小（毫秒），默认 60 秒 */
  windowMs?: number;
  /** 窗口内最大请求数，默认 100 */
  maxRequests?: number;
}

/** 预定义的分层限流策略 */
export const RATE_LIMIT_STRATEGIES = {
  /** 未认证用户：每 IP 60 秒 60 次 */
  anonymous: { windowMs: 60_000, maxRequests: 60 },
  /** 已认证用户：每用户 60 秒 300 次 */
  authenticated: { windowMs: 60_000, maxRequests: 300 },
  /** 转换接口：每 IP 60 秒 20 次（ heavier operation ）*/
  convertApi: { windowMs: 60_000, maxRequests: 20 },
  /** 支付回调：每 IP 60 秒 10 次 */
  paymentWebhook: { windowMs: 60_000, maxRequests: 10 },
  /** 健康检查：不限流 */
  health: { windowMs: 1_000, maxRequests: 999_999 },
} as const;

const REDIS_KEY_PREFIX = "ratelimit:";

// ── In-memory fallback store ──────────────────────────────────
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
 * 基于 Redis 的滑动窗口计数器限流
 *
 * 算法：在每个时间窗口开始时重置计数器，窗口内累加请求。
 * 使用 Redis INCR + EXPIRE 保证原子性和自动过期。
 *
 * Redis 不可用时自动降级为内存限流（per-instance）。
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

    // 原子递增计数器
    const currentCount = await redis.incr(key);

    // 如果是第一条请求（currentCount === 1），设置过期时间
    if (currentCount === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }

    const remaining = Math.max(0, maxRequests - currentCount);
    const allowed = currentCount <= maxRequests;

    // 计算重试等待时间
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
    console.error("[rate-limit] Redis error, falling back to in-memory limiter:", err.message);
    // Fallback to in-memory rate limiting instead of allowing all requests
    return memCheck(identifier, windowMs, maxRequests);
  }
}

/**
 * 构建限流响应头
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
 * 从 NextRequest 中提取标识符（IP 或用户 ID）
 */
export function getRateLimitIdentifier(
  request: any,
  userId?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
  return `ip:${ip}`;
}

/**
 * 便捷函数：使用预定义策略进行限流
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
