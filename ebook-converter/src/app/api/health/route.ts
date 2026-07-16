import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function checkRedis(): Promise<{ ok: boolean; latency?: number; error?: string }> {
  try {
    const client = getRedisClient();
    if (!client) {
      return { ok: false, error: 'Redis client not initialized' };
    }
    const start = Date.now();
    await client.ping();
    const latency = Date.now() - start;
    return { ok: true, latency };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: message };
  }
}

async function checkCalibre(): Promise<{ ok: boolean; version?: string; error?: string }> {
  try {
    const CALIBRE_PATH = process.env.CALIBRE_PATH || 'ebook-convert';
    const { stdout } = await execFileAsync(CALIBRE_PATH, ['--version']);
    const version = stdout.trim().split('\n')[0];
    return { ok: true, version };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: message };
  }
}

export async function GET() {
  const checks = {
    redis: await checkRedis(),
    calibre: await checkCalibre(),
  };

  const allOk = Object.values(checks).every((c) => c.ok);

  const status = allOk ? 'ok' : 'degraded';

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 },
  );
}
