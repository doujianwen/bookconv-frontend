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
    if (isR2Configured()) {
      try {
        const { S3Client } = await import('@aws-sdk/client-s3');
        const client = new S3Client({
          region: 'auto',
          endpoint: process.env.R2_ENDPOINT!,
          credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
        });
        const { ListObjectsV2Command, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
        let r2Cleaned = 0;
        let cursor: string | undefined;
        // uploadToR2 writes uploadedAt/ttlHours as S3 user metadata, but
        // ListObjectsV2 does NOT return user metadata (only HeadObject /
        // GetObject do), so per-object TTL is unavailable from a listing.
        // Fall back to the same 24h default that uploadToR2 and the local
        // sweep both apply.
        const DEFAULT_TTL_MS = 24 * 3600 * 1000;
        do {
          const resp = await client.send(new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET_NAME || 'ebook-temp',
            ContinuationToken: cursor,
          }));
          const objects = resp.Contents ?? [];
          for (const obj of objects) {
            if (!obj.Key) continue;
            // Age by LastModified. The previous check keyed off obj.Metadata
            // .uploadedAt, a field that does not exist on a ListObjectsV2
            // result — so the guard was always falsy and this sweep deleted
            // nothing.
            const lastModified = obj.LastModified?.getTime();
            if (!lastModified) continue;
            if (Date.now() - lastModified > DEFAULT_TTL_MS) {
              await client.send(new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME || 'ebook-temp',
                Key: obj.Key,
              }));
              r2Cleaned++;
            }
          }
          cursor = resp.IsTruncated ? resp.NextContinuationToken : undefined;
        } while (cursor);
        return { r2: r2Cleaned, local: 0 };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('R2 cleanup failed:', msg);
      }
    }
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