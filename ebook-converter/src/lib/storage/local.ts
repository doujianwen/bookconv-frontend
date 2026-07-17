// src/lib/storage/local.ts
import { existsSync, mkdirSync, readFileSync, rmSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const LOCAL_STORAGE_DIR = process.env.LOCAL_STORAGE_DIR || '/tmp/ebook-temp-storage';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface FileMeta {
  createdAt: number;
  ttlMs: number;
}

function metaPath(key: string): string {
  return key + '.meta.json';
}

function ensureDir(): void {
  if (!existsSync(LOCAL_STORAGE_DIR)) {
    mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
  }
}

/** Check if a stored file has expired */
function isExpired(key: string): boolean {
  const metaFile = path.join(LOCAL_STORAGE_DIR, metaPath(key));
  if (!existsSync(metaFile)) return true;
  try {
    const meta: FileMeta = JSON.parse(readFileSync(metaFile, 'utf8'));
    return Date.now() - meta.createdAt > meta.ttlMs;
  } catch {
    return true;
  }
}

/** Delete a stored file and its metadata */
export function deleteLocalFile(key: string): void {
  try {
    rmSync(path.join(LOCAL_STORAGE_DIR, key), { force: true });
    rmSync(path.join(LOCAL_STORAGE_DIR, metaPath(key)), { force: true });
  } catch {
    // ignore cleanup errors
  }
}

/** Store a file locally with TTL metadata */
export function storeLocalFile(key: string, buffer: Buffer, ttlHours: number = 24): { key: string; expiresAt: number } {
  ensureDir();
  const fullPath = path.join(LOCAL_STORAGE_DIR, key);
  writeFileSync(fullPath, buffer);

  const meta: FileMeta = {
    createdAt: Date.now(),
    ttlMs: ttlHours * 3600 * 1000,
  };
  writeFileSync(path.join(LOCAL_STORAGE_DIR, metaPath(key)), JSON.stringify(meta));

  return { key, expiresAt: meta.createdAt + meta.ttlMs };
}

/** Retrieve a file locally (returns null if expired or missing) */
export function getLocalFile(key: string): Buffer | null {
  if (isExpired(key)) {
    deleteLocalFile(key);
    return null;
  }
  const fullPath = path.join(LOCAL_STORAGE_DIR, key);
  if (!existsSync(fullPath)) return null;
  return readFileSync(fullPath);
}

/** Scan and remove all expired files in the local storage directory */
export function cleanupExpiredLocalFiles(): number {
  ensureDir();
  let cleanedCount = 0;
  try {
    const entries = readdirSync(LOCAL_STORAGE_DIR);
    for (const entry of entries) {
      if (entry.endsWith('.meta.json')) continue;
      if (isExpired(entry)) {
        deleteLocalFile(entry);
        cleanedCount++;
      }
    }
  } catch {
    // ignore scan errors
  }
  return cleanedCount;
}

/** Check if local storage is available */
export function isLocalStorageAvailable(): boolean {
  try {
    ensureDir();
    const testKey = '_health_' + Date.now();
    writeFileSync(path.join(LOCAL_STORAGE_DIR, testKey), Buffer.from('ok'));
    deleteLocalFile(testKey);
    return true;
  } catch {
    return false;
  }
}
