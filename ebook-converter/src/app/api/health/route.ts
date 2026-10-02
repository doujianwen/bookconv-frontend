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
    let stdout: string;
    try {
      ({ stdout } = await execAsync2('df', ['-kP', dir]));
    } catch {
      // 上传目录可能尚未创建（Serverless 冷启动首次调用），df 对不存在的路径
      // 会报错。回退探测 /tmp —— 与 UPLOAD_DIR 默认值同属一个文件系统，剩余
      // 空间等价（VPS 自定义挂载卷场景下仍优先返回真实挂载点数据）。
      ({ stdout } = await execAsync2('df', ['-kP', '/tmp']));
    }
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

/**
 * 飞书告警通道配置检查（不参与 overall status——通知是可选项，未配置不应让站点报 degraded）。
 * 2026-10-02：反馈卡片与转换失败告警「静默空转」的根因之一即通道未配置/被拒，
 * 这里把配置状态暴露出来，便于从线上直接判定。
 */
function checkFeishu(): { ok: boolean; configured: boolean; keywordConfigured: boolean } {
  const configured = Boolean(process.env.FEISHU_WEBHOOK_URL);
  return {
    ok: configured,
    configured,
    keywordConfigured: Boolean(process.env.FEISHU_WEBHOOK_KEYWORD),
  };
}

/**
 * Postgres 连通性检查（不参与 overall status——DB 未配置时 auth 退回内存存储，站点仍可用）。
 * 用于判定线上 DATABASE_URL 是否可达（反馈落库 / 趋势看板依赖它）。
 */
async function checkDatabase(): Promise<{ ok: boolean; error?: string }> {
  return safeCheck(async () => {
    const url = process.env.DATABASE_URL;
    if (!url) return { ok: false, error: "DATABASE_URL not configured" };
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: url,
      max: 1,
      ssl: /supabase|neon|render|amazonaws/i.test(url)
        ? { rejectUnauthorized: false }
        : undefined,
      connectionTimeoutMillis: 5000,
    });
    try {
      await pool.query("SELECT 1");
      return { ok: true };
    } finally {
      await pool.end().catch(() => {});
    }
  });
}

export async function GET(req: NextRequest) {
  const verbose = req.nextUrl.searchParams.get('verbose') === 'true';
  const apiKey = req.headers.get('x-api-key') || '';
  const allowed = apiKey === (process.env.VERIFICATION_API_KEY || '');

  const [redisResult, calibreResult, diskResult, queueResult, feishuResult, dbResult] =
    await Promise.all([
      checkRedis(),
      checkCalibre(),
      checkDiskSpace(),
      checkQueueStuckJobs(),
      Promise.resolve(checkFeishu()),
      checkDatabase(),
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
    feishu: {
      ok: feishuResult.ok,
      configured: feishuResult.configured,
      keywordConfigured: feishuResult.keywordConfigured,
    },
    database: { ok: dbResult.ok },
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

  if (dbResult.error && (verbose || !allowed)) {
    (checks.database as Record<string, unknown>).error = dbResult.error;
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
