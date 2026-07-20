// src/lib/batch-store.ts
// Redis-backed batch store for serverless-safe persistence.
// Falls back to in-memory store when Redis is unavailable.

import { getRedisClient } from './redis';
import { loggers as log } from './logger';

export interface BatchFileItem {
  index: number;
  name: string;
  size: number;
  sourceFormat: string;
  targetFormat: string;
  bullJobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  error?: string;
  result?: { base64Data: string; extension: string; mimeType: string; fileSize?: number };
}

export interface BatchJobData {
  batchId: string;
  files: BatchFileItem[];
  targetFormat: string;
  userId?: string;
  createdAt: number;
  zipBlob?: Blob;
  zipFileName?: string;
  completedAt?: number;
}

const REDIS_PREFIX = "batch:";
const REDIS_TTL_SECONDS = 3600; // 1 hour

// ── In-memory fallback ──────────────────────────────────────
const memStore = new Map<string, BatchJobData>();

// ── Redis helpers ───────────────────────────────────────────
function redisKey(batchId: string): string {
  return `${REDIS_PREFIX}${batchId}`;
}

async function getRedis(): Promise<any> {
  const redis = getRedisClient();
  if (!redis.connected) {
    try { await redis.connect(); } catch { /* fall through to mem */ }
  }
  return redis;
}

async function redisGet(batchId: string): Promise<BatchJobData | null> {
  try {
    const redis = await getRedis();
    const raw = await redis.get(redisKey(batchId));
    if (!raw) return null;
    return JSON.parse(raw as string) as BatchJobData;
  } catch {
    return null;
  }
}

async function redisSet(batchId: string, data: BatchJobData): Promise<void> {
  try {
    const redis = await getRedis();
    await redis.setex(redisKey(batchId), REDIS_TTL_SECONDS, JSON.stringify(data));
  } catch {
    // Silently fall through to in-memory
  }
}

async function redisDel(batchId: string): Promise<void> {
  try {
    const redis = await getRedis();
    await redis.del(redisKey(batchId));
  } catch { /* ignore */ }
}

// ── Public API ──────────────────────────────────────────────
/** Save batch to both Redis and memory (dual-write for resilience) */
export async function saveBatch(batchId: string, data: BatchJobData): Promise<void> {
  await redisSet(batchId, data);
  memStore.set(batchId, data);
}

/** Load batch from Redis first, then memory */
export async function getBatch(batchId: string): Promise<BatchJobData | null> {
  // Try Redis first
  const redisData = await redisGet(batchId);
  if (redisData) {
    // Also update memory cache
    memStore.set(batchId, redisData);
    return redisData;
  }
  // Fall back to memory
  const memData = memStore.get(batchId);
  if (memData) {
    // Update Redis for consistency
    await redisSet(batchId, memData);
  }
  return memData ?? null;
}

/** Delete batch from both stores */
export async function deleteBatch(batchId: string): Promise<void> {
  await redisDel(batchId);
  memStore.delete(batchId);
}

/** Update batch in-place (read-modify-write via Redis) */
export async function updateBatch(
  batchId: string,
  updater: (batch: BatchJobData) => void
): Promise<boolean> {
  const batch = await getBatch(batchId);
  if (!batch) return false;
  updater(batch);
  await saveBatch(batchId, batch);
  return true;
}

/** Periodic cleanup of expired batches */
export async function cleanupExpiredBatches(): Promise<number> {
  const now = Date.now();
  const RETENTION_MS = 30 * 60 * 1000;
  let cleaned = 0;

  for (const [batchId, batch] of memStore.entries()) {
    const allDone = batch.files.every(
      (f) => f.status === "completed" || f.status === "failed"
    );
    if (allDone && now - (batch.completedAt || batch.createdAt) > RETENTION_MS) {
      await deleteBatch(batchId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    log.batch.info(`Cleaned ${cleaned} expired batch(es)`, { remaining: memStore.size });
  }
  return cleaned;
}
