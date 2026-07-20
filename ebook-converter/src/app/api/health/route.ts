import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { sanitizeError, mapErrorCode } from "@/lib/error-handler";

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

function isVerboseAllowed(req: NextRequest): boolean {
  const apiKey = process.env.VERIFICATION_API_KEY || '';
  const requestApiKey = req.headers.get('x-api-key') || '';
  if (apiKey && requestApiKey === apiKey) {
    return true;
  }
  const ip = req.headers.get('x-forwarded-for') || '';
  const cleanedIp = ip.includes(',') ? ip.split(',')[0].trim() : ip.trim();
  return cleanedIp === '127.0.0.1';
}

export async function GET(req: NextRequest) {
  const verbose = req.nextUrl.searchParams.get('verbose') === 'true';
  const verboseAllowed = !verbose || isVerboseAllowed(req);

  const redisResult = await checkRedis();
  const calibreResult = await checkCalibre();

  const allOk = redisResult.ok && calibreResult.ok;
  const status = allOk ? 'ok' : 'degraded';

  // Build internal checks object (always computed, but may be stripped for output)
  const checks: Record<string, unknown> = {
    redis: { ok: redisResult.ok },
    calibre: { ok: calibreResult.ok },
  };

  if (verboseAllowed) {
    // In verbose mode, always include latency for redis
    if (redisResult.latency !== undefined) {
      (checks.redis as Record<string, unknown>).latency = redisResult.latency;
    }
    // Only include version if everything is ok (never leak version on degraded)
    if (calibreResult.ok && calibreResult.version) {
      (checks.calibre as Record<string, unknown>).version = calibreResult.version;
    }
  }

  // In production, never expose detailed error messages
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && !verboseAllowed) {
    // Strip everything — return minimal response
    return NextResponse.json(
      {
        status,
        timestamp: new Date().toISOString(),
      },
      { status: allOk ? 200 : 503 },
    );
  }

  if (isProduction && verboseAllowed) {
    // Production + verbose: include checks but strip error details
    const sanitizedChecks: Record<string, unknown> = {
      redis: { ok: redisResult.ok },
      calibre: { ok: calibreResult.ok },
    };
    if (redisResult.latency !== undefined) {
      (sanitizedChecks.redis as Record<string, unknown>).latency = redisResult.latency;
    }
    if (calibreResult.ok && calibreResult.version) {
      (sanitizedChecks.calibre as Record<string, unknown>).version = calibreResult.version;
    }
    return NextResponse.json(
      {
        status,
        timestamp: new Date().toISOString(),
        checks: sanitizedChecks,
      },
      { status: allOk ? 200 : 503 },
    );
  }

  // Development mode: include full checks with errors
  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 },
  );
}
