// src/lib/redis.ts
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: IORedis | null = null;

export function getRedisClient(): any {
  if (!redisClient) {
    redisClient = new IORedis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    redisClient.on('error', (err) => console.error('Redis error:', err));
    redisClient.connect().catch(() => {});
  }
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
