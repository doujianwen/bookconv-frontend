// src/lib/storage/strategy.ts
import path from 'node:path';
import * as fs from 'node:fs';
import { isR2Configured, uploadToR2 as r2Upload, checkR2Health, downloadFromR2, deleteFromR2 } from './r2';
import { saveToLocal as localStore, readFromLocal as localGet, deleteLocal as localDelete } from './local';
import type { StoreResult, StorageStrategy } from './types';

/** Unified storage strategy: tries R2 first, falls back to local */
export const storageStrategy: StorageStrategy = {
  async store(key: string, buffer: Buffer, ttlHours: number = 24): Promise<StoreResult> {
    // Prefer R2 if configured and healthy
    if (isR2Configured()) {
      try {
        const health = await checkR2Health();
        if (health.healthy) {
          const result = await r2Upload(key, buffer, ttlHours);
          return { ...result, backend: 'r2', key };
        }
        console.warn('R2 unhealthy, falling back to local storage:', health.error);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('R2 upload failed, falling back to local storage:', msg);
      }
    }

    // Fallback to local storage
    try {
      localStore(key, buffer);
      // Local files have no public URL — the key is what callers resolve
      // through the download route. expiresAt mirrors the 24h that
      // cleanupExpired() enforces on local-results; nothing reads it today,
      // but omitting it made the declared StoreResult type a lie.
      return { url: '', backend: 'local', key, expiresAt: Date.now() + 24 * 3600 * 1000 };
    } catch (storeErr: unknown) {
      const msg = storeErr instanceof Error ? storeErr.message : String(storeErr);
      throw new Error('No storage backend available: ' + msg);
    }
  },

  async retrieve(key: string): Promise<Buffer | null> {
    // Try R2 first
    if (isR2Configured()) {
      try {
        const health = await checkR2Health();
        if (health.healthy) {
          return await downloadFromR2(key);
        }
      } catch {
        // fall through to local
      }
    }

    // Fallback to local
    return localGet(key);
  },

  async remove(key: string): Promise<void> {
    // Remove from both backends (best-effort)
    if (isR2Configured()) {
      try { await deleteFromR2(key); } catch { /* ignore */ }
    }
    localDelete(key);
  },

  async cleanupExpired(): Promise<{ r2: number; local: number }> {
    let localCleaned = 0;
    // R2 expiry is owned by prefix-scoped bucket lifecycle rules.
    // Never scan/delete the whole bucket with the local 24h TTL: cached
    // outputs have a separate 30-day retention policy.
    // Local cleanup: scan and remove expired files
    try {
      const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/ebook-uploads';
      const localPath = path.join(UPLOAD_DIR, 'local-results');
      if (fs.existsSync(localPath)) {
        const files = fs.readdirSync(localPath);
        let cleaned = 0;
        for (const file of files) {
          const filePath = path.join(localPath, file);
          const stats = fs.statSync(filePath);
          if (Date.now() - stats.mtimeMs > 24 * 60 * 60 * 1000) {
            fs.rmSync(filePath, { force: true });
            cleaned++;
          }
        }
        localCleaned = cleaned;
      }
    } catch { /* ignore */ }
    return { r2: 0, local: localCleaned };
  },
};