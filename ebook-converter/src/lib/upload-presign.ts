// src/lib/upload-presign.ts
//
// Direct-to-R2 uploads — the fix for the Vercel Hobby 4.5MB edge body limit.
//
// Problem this solves
// -------------------
// Every upload used to travel browser → /api/convert (a serverless function).
// Vercel Hobby rejects request bodies >4.5MB at the edge with a 413 that our
// code never observes, so the app capped the UI at 4MB (see file-size-limit.ts).
// That cap is not a product choice: it makes DJVU scans, CBR/CBZ comics and
// scanned PDFs — the formats whose real files are 10–200MB — structurally
// impossible to convert, while their pages stay indexed and rank.
//
// Flow after this module
// ----------------------
//   1. Browser asks POST /api/upload/presign for a key + signed PUT URL.
//   2. Browser PUTs the raw bytes straight to R2 (no serverless function, no
//      edge body limit).
//   3. Browser POSTs /api/convert with `upload_key` instead of the file.
//   4. Server streams the object back from R2, converts, then deletes it.
//
// Small files (<= MAX_FILE_SIZE_BYTES) keep using the original multipart path
// unchanged. That is deliberate: it keeps the proven 76.9% success path intact
// and limits the blast radius of this feature to files that could never have
// worked before.
import { isR2Configured, getR2Client, getR2Bucket } from '@/lib/storage/r2';

/** Presigned PUT lifetime. Long enough for a 100MB upload on a slow link. */
export const PRESIGN_EXPIRES_SECONDS = 900;

const UPLOAD_KEY_PREFIX = 'uploads/';

// Deliberately strict. This string is used as an R2 object key and is accepted
// back from the client, so an attacker must not be able to smuggle `../`,
// absolute paths, or a key pointing at someone else's object (e.g. the
// conversion cache). Only keys we mint can pass.
const UPLOAD_KEY_RE =
  /^uploads\/\d{4}-\d{2}-\d{2}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{1,5}$/;

/**
 * Presigning needs R2 credentials.
 *
 * History note (2026-10-28): this used to ALSO require that no Calibre backend
 * was configured, because the old backend delegation forwarded the raw
 * request.body stream — a JSON `upload_key` call would not have survived it.
 * The delegation was since redesigned to parse-once (see
 * conversion-backend-client.ts): upload_key requests are now offered to the
 * backend via an R2-fetched prebuilt File and fall back to CloudConvert here
 * when the backend is down/unsupported. The two modes are compatible again,
 * so the guard reduces to R2 presence. Large files (> the backend's own cap,
 * currently 50MB) still fall through to CloudConvert by design.
 */
export function isDirectUploadEnabled(): boolean {
  return isR2Configured();
}

export function buildUploadKey(sourceFormat: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const ext =
    (sourceFormat || 'bin')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 5) || 'bin';
  return `${UPLOAD_KEY_PREFIX}${day}/${crypto.randomUUID()}.${ext}`;
}

export function isValidUploadKey(key: unknown): key is string {
  return typeof key === 'string' && key.length <= 160 && UPLOAD_KEY_RE.test(key);
}

/** Best-effort filename reconstruction for the download header. */
export function fileNameFromUploadKey(key: string, sourceFormat: string): string {
  const ext = (sourceFormat || 'ebook').toLowerCase().replace(/[^a-z0-9]/g, '') || 'ebook';
  return `upload.${ext}`;
}

export async function createPresignedPut(
  key: string,
  contentType = 'application/octet-stream',
): Promise<string> {
  const client = getR2Client();
  if (!client) throw new Error('R2_NOT_CONFIGURED');

  const { PutObjectCommand } = await import('@aws-sdk/client-s3');
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: PRESIGN_EXPIRES_SECONDS },
  );
}
