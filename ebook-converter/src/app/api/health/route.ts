// src/app/api/health/route.ts — Enhanced health check with Redis, Calibre, disk space.
import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { isCloudConvertConfigured } from '@/lib/cloudconvert';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

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
    if (process.platform === 'win32') {
      const { execFile: ef } = await import('node:child_process');
      const execAsync = promisify(ef);
      const { stdout } = await execAsync('wmic_logicaldisk get Size,FreeSpace /format:list');
      const freeMatch = stdout.match(/FreeSpace=(\d+)/);
      const sizeMatch = stdout.match(/Size=(\d+)/);
      const freeMb = freeMatch ? Math.round(parseInt(freeMatch[1]) / (1024 * 1024)) : undefined;
      const totalMb = sizeMatch ? Math.round(parseInt(sizeMatch[1]) / (1024 * 1024)) : undefined;
      return { ok: !freeMb || freeMb > 50, totalMb, freeMb };
    }

    // POSIX: df -kP 保证 6 列（Filesystem 1024-blocks Used Available Capacity Mounted）。
    // 修复记录：此前把 shell 管道命令传给 execFile（'df -k "<dir>" | tail -1'），
    // execFile 不经 shell 解析 → 恒 ENOENT → disk.ok 永远 false，/api/health 永久
    // 误报 degraded（2026-10-02 诊断确认）。且旧解析取倒数第二列实为 Capacity%，
    // 即使管道可用也会把容量百分比当剩余空间。现改为 -P 格式直接取第 4 列 Available。
    const dir = process.env.UPLOAD_DIR || '/tmp';
    const { execFile: ef2 } = await import('node:child_process');
    const execAsync2 = promisify(ef2);
    const { stdout } = await execAsync2('df', ['-kP', dir]);
    const lines = stdout.trim().split('\n');
    const dataLine = lines[lines.length - 1].trim().split(/\s+/);
    // -P 格式固定 6 列，Available 是第 4 列（index 3）
    const freeKb = parseInt(dataLine[3] || '0', 10);
    const totalKb = parseInt(dataLine[1] || '0', 10);
    const freeMb = Math.round(freeKb / 1024);
    const totalMb = Math.round(totalKb / 1024);
    return { ok: freeMb > 50, freeMb, totalMb };
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

  // 转换能力 = Calibre 本地可用 或 CloudConvert 兜底已配置。
  // Vercel Serverless 无 Calibre 二进制是已知常态（走 CloudConvert），此前把
  // calibre.ok=false 直接计入 overall → 转换完全正常时仍报 degraded，误导排障。
  const cloudConvertConfigured = isCloudConvertConfigured();
  const conversionCapable = calibreResult.ok || cloudConvertConfigured;

  const allOk = redisResult.ok && diskResult.ok && conversionCapable;
  const status = allOk ? 'ok' : 'degraded';
  const statusCode = allOk ? 200 : 503;

  const checks: Record<string, unknown> = {
    redis: { ok: redisResult.ok },
    calibre: { ok: calibreResult.ok },
    disk: { ok: diskResult.ok },
    conversionBackend: {
      active: calibreResult.ok ? 'calibre' : cloudConvertConfigured ? 'cloudconvert' : 'none',
      cloudConvertConfigured,
    },
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
