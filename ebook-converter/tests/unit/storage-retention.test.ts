import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { S3Client } from '@aws-sdk/client-s3';

jest.mock('@/lib/storage/r2', () => ({ isR2Configured: () => true }));
jest.mock('@aws-sdk/client-s3', () => ({ S3Client: jest.fn() }));

it('cleans expired local results without scanning or deleting the R2 bucket', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bookconv-retention-'));
  const oldDir = process.env.UPLOAD_DIR;
  process.env.UPLOAD_DIR = root;
  const results = path.join(root, 'local-results');
  fs.mkdirSync(results);
  const expired = path.join(results, 'expired.txt');
  const fresh = path.join(results, 'fresh.txt');
  fs.writeFileSync(expired, 'expired');
  fs.writeFileSync(fresh, 'fresh');
  const old = new Date(Date.now() - 25 * 3600000);
  fs.utimesSync(expired, old, old);
  try {
    const { storageStrategy } = await import('@/lib/storage/strategy');
    await expect(storageStrategy.cleanupExpired()).resolves.toEqual({ r2: 0, local: 1 });
    expect(S3Client).not.toHaveBeenCalled();
    expect(fs.existsSync(expired)).toBe(false);
    expect(fs.readFileSync(fresh, 'utf8')).toBe('fresh');
  } finally {
    process.env.UPLOAD_DIR = oldDir;
    fs.rmSync(root, { recursive: true, force: true });
  }
});
