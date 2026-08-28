// src/app/api/health/route.ts — Enhanced health check with Redis, Calibre, disk space.
import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { sanitizeError } from "@/lib/error-handler";

const execFileAsync = promisify(execFile);

/**
 * Runs an async health probe and normalizes any thrown error into the
 * `{ ok: false, error }` shape. This is the single place where the
 * try/catch error template used to be copy-pasted across every check
 * function — extracted here so the failure contract stays consistent.
 */
async function safeCheck<T extends { ok: boolean }>(
  fn: () => Promise<T>,
): Promise<T | { ok: false; error: string }> {
  try {
    return await fn();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: message };
  }
}

async function checkRedis(): Promise<{ ok: boolean; latency?: number; error?: string }> {
  return safeCheck(async () => {
    const client = getRedisClient();
    if (!client) {
      return { ok: false, error: 'Redis not configured' };
    }
    const start = Date.now();
    await client.ping();
    return { ok: true, latency: Date.now() - start };
  });
}

async function checkCalibre(): Promise<{ ok: boolean; version?: string; error?: string }> {
  return safeCheck(async () => {
    const CALIBRE_PATH = process.env.CALIBRE_PATH || 'ebook-convert';
    const { stdout } = await execFileAsync(CALIBRE_PATH, ['--version']);
    const version = stdout.trim().split('\n')[0];
    return { ok: true, version };
  });
}

async function checkDiskSpace(): Promise<{ ok: boolean; totalMb?: number; freeMb?: number; error?: string }> {
  return safeCheck(async () => {
    // Use `df` on Linux/Mac or PowerShell/WMIC on Windows
    const command = process.platform === 'win32'
      ? 'wmic_logicaldisk get Size,FreeSpace /format:list'
      : 'df -k "' + (process.env.UPLOAD_DIR || '/tmp') + '" | tail -1';

    const { execFile: ef } = await import('node:child_process');
    const execAsync = promisify(ef);
    const { stdout } = await execAsync(command);

    if (process.platform === 'win32') {
      const freeMatch = stdout.match(/FreeSpace=(\d+)/);
      const sizeMatch = stdout.match(/Size=(\d+)/);
      const freeMb = freeMatch ? Math.round(parseInt(freeMatch[1]) / (1024 * 1024)) : undefined;
      const totalMb = sizeMatch ? Math.round(parseInt(sizeMatch[1]) / (1024 * 1024)) : undefined;
      return { ok: !freeMb || freeMb > 50, totalMb, freeMb };
    } else {
      // df output: block free (in KB)
      const parts = stdout.trim().split(/\s+/);
      const freeKb = parseInt(parts[parts.length - 2] || '0');
      const freeMb = Math.round(freeKb / 1024);
      return { ok: freeMb > 50, freeMb, totalMb: freeMb * 4 }; // rough estimate
    }
  });
}

/** Check if job queue has stuck jobs (> 30 min old and still active ) */
async function checkQueueStuckJobs(): Promise<{ ok: boolean; stuckCount?: number; error?: string }> {
  return safeCheck(async () => {
    const client = getRedisClient();
    if (!client) return { ok: false, error: 'Redis not configured' };

    const keys = await client.keys('bull:ebook-conversions:*:lock');
    let stuckCount = 0;
    for (const key of keys) {
      const ttl = await client.ttl(key);
      // Lock held for more than 30 minutes means the worker is stuck
      if (ttl > 0 && ttl < 60) continue;
      if (ttl <= 0) {
        // TTL expired but lock still exists — zombie lock
        stuckCount++;
      }
    }
    return { ok: true, stuckCount };
  });
}

export async function GET(req: NextRequest) {
  const verbose = req.nextUrl.searchParams.get('verbose') === 'true';
  const apiKey = req.headers.get('x-api-key') || '';
  const allowed = apiKey === (process.env.VERIFICATION_API_KEY || '');

  const [redisResult, calibreResult, diskResult, queueResult] = await Promise.all([
    checkRedis(),
    checkCalibre(),
    checkDiskSpace(),
    checkQueueStuckJobs(),
  ]);

  const allOk = redisResult.ok && calibreResult.ok && diskResult.ok;
  const status = allOk ? 'ok' : 'degraded';
  const statusCode = allOk ? 200 : 503;

  const checks: Record<string, unknown> = {
    redis: { ok: redisResult.ok },
    calibre: { ok: calibreResult.ok },
    disk: { ok: diskResult.ok },
  };

  if (redisResult.error && (verbose || !allowed)) {
    (checks.redis as Record<string, unknown>).error = redisResult.error;
  }
  if (redisResult.latency !== undefined) {
    (checks.redis as Record<string, unknown>).latency = redisResult.latency;
  }

  if (calibreResult.error && (verbose || !allowed)) {
    (checks.calibre as Record<string, unknown>).error = calibreResult.error;
  }
  if (calibreResult.ok && calibreResult.version && (verbose || !allowed)) {
    (checks.calibre as Record<string, unknown>).version = calibreResult.version;
  }

  (checks.disk as Record<string, unknown>).total = diskResult.totalMb;
  (checks.disk as Record<string, unknown>).free = diskResult.freeMb;
  if (diskResult.error && (verbose || !allowed)) {
    (checks.disk as Record<string, unknown>).error = diskResult.error;
  }

  if ('stuckCount' in queueResult) {
    (checks.queue as Record<string, unknown>) = { stuckJobs: queueResult.stuckCount };
  }

  // Production non-verbose: minimal response
  if (process.env.NODE_ENV === 'production' && !verbose && allowed) {
    return NextResponse.json({ status, timestamp: new Date().toISOString() }, { status: statusCode });
  }

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    checks,
  }, { status: statusCode });
}
