import { S3Client } from '@aws-sdk/client-s3';
import type { Readable } from 'node:stream';

// Env is read at call time (see getClient / isR2Configured). Only the bucket
// name keeps a module-level default, because it must stay stable for the
// lifetime of the process and has a safe fallback.
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'ebook-temp';

let s3Client: S3Client | null = null;

function getClient(): S3Client {
  // Read env at call time, not module-load time. Next.js inlines server env at
  // boot so behaviour is identical in production, but late-injected env (tests,
  // edge runtimes that hydrate per-request) previously produced a configured
  // endpoint with a null client — a silent "R2 not configured" for a caller
  // that had just checked isR2Configured().
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) return null!;

  if (!s3Client) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return s3Client;
}

export function isR2Configured(): boolean {
  return !!(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
  );
}

/**
 * Expose the shared S3 client so presigning (upload-presign.ts) signs against
 * the exact same endpoint/credentials instead of building a second client.
 * Callers must check isR2Configured() first — getClient() returns null when
 * credentials are missing.
 */
export function getR2Client(): S3Client | null {
  return getClient();
}

export function getR2Bucket(): string {
  return R2_BUCKET;
}

export async function uploadToR2(key: string, buffer: Buffer, ttlHours?: number): Promise<{ url: string; expiresAt: number }> {
  const client = getClient();
  const { PutObjectCommand } = await import('@aws-sdk/client-s3');
  await client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: buffer, Metadata: ttlHours ? { uploadedAt: String(Date.now()), ttlHours: String(ttlHours) } : undefined }));
  const expiresAt = ttlHours ? Date.now() + ttlHours * 3600 * 1000 : Date.now() + 24 * 3600 * 1000;
  return { url: `${process.env.R2_ENDPOINT || ''}/${R2_BUCKET}/${key}`, expiresAt };
}

export async function downloadFromR2(key: string): Promise<Buffer> {
  const client = getClient();
  const { GetObjectCommand } = await import('@aws-sdk/client-s3');
  const response = await client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  const chunks: Buffer[] = [];
  for await (const chunk of response.Body as Readable) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getClient();
  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
  await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

export async function checkR2Health(): Promise<{ healthy: boolean; error?: string }> {
  try {
    if (!isR2Configured()) return { healthy: false, error: "R2 not configured" };
    const client = getClient();
    await client.send(new (await import("@aws-sdk/client-s3")).HeadBucketCommand({ Bucket: R2_BUCKET }));
    return { healthy: true };
  } catch (err) {
    return { healthy: false, error: err instanceof Error ? err.message : "Unknown R2 error" };
  }
}
