// src/lib/redis.ts
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: IORedis | null = null;

/**
 * Redis client singleton with production-ready defaults.
 *
 * Tuning rationale:
 * - connectTimeout: Fail fast on network issues instead of hanging indefinitely
 * - commandTimeout: Prevent long-running commands from blocking the connection
 * - keepAlive: TCP keepalive to detect dead connections early
 * - connectionName: Identify this client in Redis CLIENT LIST output
 * - maxRetriesPerRequest: Retry transient failures automatically
 * - retryStrategy: Exponential backoff with jitter to avoid thundering herd
 * - lazyConnect: Defer connection until first command (safer for serverless)
 */
function createClient(): IORedis {
  return new IORedis(redisUrl, {
    // Connection
    connectTimeout: 5_000,
    lazyConnect: true,
    connectionName: 'ebook-converter',

    // Retry behavior
    // BullMQ requires maxRetriesPerRequest to be null (not a number)
    // When null, BullMQ handles retries itself
    maxRetriesPerRequest: null,

    // TCP keepalive
    keepAlive: 3_000,

    // Custom retry strategy: 100ms → 200ms → 400ms → 800ms → 1.6s → cap at 2s
    retryStrategy: (times: number) => {
      const delay = Math.min(100 * Math.pow(2, times), 2_000);
      if (times > 5) {
        // After 5 retries, pause 5s before reconnecting
        setTimeout(() => {
          redisClient?.connect();
        }, 5_000);
        return null; // stop retrying, connection will be retried manually
      }
      return delay;
    },

    // Reconnect automatically on disconnect
    reconnectOnError: (err: Error) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        // Only reconnect if we are connecting to a cluster and got a READONLY error
        return true;
      }
      return false;
    },
  });
}

export function getRedisClient(): any {
  if (!redisClient) {
    redisClient = createClient();
    redisClient.on('error', (err: Error) => {
      console.error('[redis] Connection error:', err.message);
    });
    redisClient.on('connect', () => {
      console.log('[redis] Connected');
    });
    // Fire-and-forget initial connection
    redisClient.connect().catch((err: Error) => {
      console.error('[redis] Initial connect failed:', err.message);
    });
  }
  return redisClient;
}

/**
 * Check if Redis is reachable. Useful for health checks.
 */
export async function isRedisHealthy(): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client.connected) {
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
