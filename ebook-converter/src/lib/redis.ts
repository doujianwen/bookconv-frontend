// src/lib/redis.ts
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || '';

let redisClient: IORedis | null = null;

/** Check if Redis is actually configured (skip lazy-connect in serverless envs) */
function isRedisConfigured(): boolean {
  return !!(process.env.REDIS_URL && process.env.REDIS_URL !== '');
}

/**
 * Create a Redis client with safe defaults for both local and serverless (Vercel).
 * - connectTimeout: 3s — fail fast instead of hanging forever
 * - lazyConnect: true — defer connection until first command is sent
 * - maxRetriesPerRequest: null — required by BullMQ
 */
function createClient(): IORedis {
  // Upstash and other serverless Redis providers expose a rediss:// (TLS) URL.
  // ioredis negotiates TLS automatically for rediss://, but we pin
  // rejectUnauthorized so the connection fails closed on a bad cert.
  const useTls = redisUrl.startsWith('rediss://');
  return new IORedis(redisUrl, {
    connectTimeout: 3_000,
    lazyConnect: true,
    maxRetriesPerRequest: null,
    ...(useTls ? { tls: { rejectUnauthorized: true } } : {}),
  });
}

export function getRedisClient(): IORedis | null {
  if (!isRedisConfigured()) {
    return null; // No Redis configured — caller must handle gracefully
  }
  if (!redisClient) {
    redisClient = createClient();
    // DON'T auto-connect on import — Vercel serverless may hang on this
  }
  return redisClient;
}

/**
 * Redis client for call paths that cannot proceed without Redis.
 *
 * Throws an explicit, greppable error instead of letting the caller fail with
 * an opaque "Cannot read properties of null". Callers that can degrade (rate
 * limiting, job-status polling) should keep using `getRedisClient()` and
 * handle the `null` case themselves.
 */
export function requireRedisClient(): IORedis {
  const client = getRedisClient();
  if (!client) {
    throw new Error('REDIS_URL is not configured');
  }
  return client;
}

/**
 * Check if Redis is reachable. Useful for health checks.
 */
export async function isRedisHealthy(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false; // Not configured, treat as not healthy
  try {
    // ioredis exposes connection state through `status`, not `connected`.
    if (client.status === 'wait') {
      await client.connect();
    }
    const pong = await client.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
