// src/lib/storage/strategy.ts
import path from 'node:path';
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
      return { url: '', backend: 'local', key } as any;
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
        do {
          const resp = await client.send(new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET_NAME || 'ebook-temp',
            ContinuationToken: cursor,
          }));
          const objects = resp.Contents ?? [];
          for (const obj of objects as any) {
            if (!obj.Key || !obj.Metadata?.uploadedAt) continue;
            const uploadedAt = parseInt(obj.Metadata.uploadedAt, 10);
            const ttlHours = parseInt(obj.Metadata.ttlHours ?? '24', 10);
            if (Date.now() - uploadedAt > ttlHours * 3600 * 1000) {
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
      const fs = require('node:fs');
      const fsPromises = require('node:fs/promises');
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
    } catch (e) { /* ignore */ }
    return { r2: 0, local: localCleaned };
  },
};