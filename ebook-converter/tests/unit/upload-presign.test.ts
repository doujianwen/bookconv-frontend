// tests/unit/upload-presign.test.ts
//
// Direct-to-R2 upload path (2026-10-25).
//
// What this protects:
//   1. The upload key is accepted back from the client and used as an R2 object
//      key. If validation is too loose, a caller could read an object they did
//      not create (e.g. the conversion cache) or traverse the bucket.
//   2. The capability gate must fail CLOSED (no R2 → no presign) but never
//      break the existing multipart path.
//   3. The two size caps must stay distinct — collapsing them would either
//      re-impose the 4.5MB edge limit or remove the multipart guard.

import {
  buildUploadKey,
  isValidUploadKey,
  fileNameFromUploadKey,
  isDirectUploadEnabled,
  PRESIGN_EXPIRES_SECONDS,
} from '@/lib/upload-presign';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILE_SIZE_MB,
} from '@/lib/file-size-limit';

const MINTED = 'uploads/2026-10-25/2f1c9a3b-4d5e-4f6a-8b7c-9d0e1f2a3b4c.epub';

describe('isValidUploadKey', () => {
  it('accepts a key produced by buildUploadKey', () => {
    const key = buildUploadKey('epub');
    expect(isValidUploadKey(key)).toBe(true);
  });

  it('accepts the canonical minted shape', () => {
    expect(isValidUploadKey(MINTED)).toBe(true);
  });

  it('rejects path traversal', () => {
    expect(isValidUploadKey('uploads/2026-10-25/../../../etc/passwd')).toBe(false);
    expect(isValidUploadKey('uploads/../cache/2026-10-25/2f1c9a3b-4d5e-4f6a-8b7c-9d0e1f2a3b4c.epub')).toBe(false);
  });

  it('rejects absolute paths', () => {
    expect(isValidUploadKey('/uploads/2026-10-25/2f1c9a3b-4d5e-4f6a-8b7c-9d0e1f2a3b4c.epub')).toBe(false);
    expect(isValidUploadKey('C:/uploads/x.epub')).toBe(false);
  });

  it('rejects keys outside the uploads/ prefix (e.g. conversion cache objects)', () => {
    expect(isValidUploadKey('cache/2026-10-25/2f1c9a3b-4d5e-4f6a-8b7c-9d0e1f2a3b4c.epub')).toBe(false);
    expect(isValidUploadKey('results/2f1c9a3b-4d5e-4f6a-8b7c-9d0e1f2a3b4c.epub')).toBe(false);
  });

  it('rejects malformed dates and ids', () => {
    expect(isValidUploadKey('uploads/26-10-25/2f1c9a3b-4d5e-4f6a-8b7c-9d0e1f2a3b4c.epub')).toBe(false);
    expect(isValidUploadKey('uploads/2026-10-25/not-a-uuid.epub')).toBe(false);
    expect(isValidUploadKey('uploads/2026-10-25/2f1c9a3b4d5e4f6a8b7c9d0e1f2a3b4c.epub')).toBe(false);
  });

  it('rejects a missing extension', () => {
    expect(isValidUploadKey('uploads/2026-10-25/2f1c9a3b-4d5e-4f6a-8b7c-9d0e1f2a3b4c')).toBe(false);
  });

  it('rejects non-strings and over-long input', () => {
    expect(isValidUploadKey(undefined)).toBe(false);
    expect(isValidUploadKey(null)).toBe(false);
    expect(isValidUploadKey(42)).toBe(false);
    expect(isValidUploadKey({ key: MINTED })).toBe(false);
    expect(isValidUploadKey('uploads/2026-10-25/' + 'a'.repeat(300) + '.epub')).toBe(false);
  });
});

describe('buildUploadKey', () => {
  it('always produces a key that passes validation', () => {
    for (const fmt of ['epub', 'djvu', 'cbr', 'cbz', 'pdf', 'azw3', 'mobi']) {
      expect(isValidUploadKey(buildUploadKey(fmt))).toBe(true);
    }
  });

  it('uses the source format as the extension and never leaks unsafe characters', () => {
    expect(buildUploadKey('EPUB').endsWith('.epub')).toBe(true);
    // Sanitised: no slashes / dots / quotes can reach the key.
    const weird = buildUploadKey('../../etc/passwd');
    expect(isValidUploadKey(weird)).toBe(true);
    expect(weird).not.toContain('..');
  });

  it('falls back to .bin for an empty format', () => {
    expect(buildUploadKey('').endsWith('.bin')).toBe(true);
  });

  it('produces unique keys', () => {
    const a = buildUploadKey('epub');
    const b = buildUploadKey('epub');
    expect(a).not.toBe(b);
  });

  it('is date-partitioned (for the lifecycle rule that sweeps orphans)', () => {
    expect(buildUploadKey('epub')).toMatch(/^uploads\/\d{4}-\d{2}-\d{2}\//);
  });
});

describe('fileNameFromUploadKey', () => {
  it('derives a download name from the source format', () => {
    expect(fileNameFromUploadKey(MINTED, 'epub')).toBe('upload.epub');
    expect(fileNameFromUploadKey(MINTED, 'DJVU')).toBe('upload.djvu');
  });

  it('never returns an empty extension', () => {
    expect(fileNameFromUploadKey(MINTED, '')).toBe('upload.ebook');
  });
});

describe('isDirectUploadEnabled', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('is false when R2 credentials are absent (fail closed)', () => {
    delete process.env.R2_ENDPOINT;
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;
    delete process.env.CONVERSION_BACKEND_URL;
    expect(isDirectUploadEnabled()).toBe(false);
  });

  it('is TRUE in Calibre-backend (self-hosted) mode when R2 is present (2026-10-28)', () => {
    process.env.R2_ENDPOINT = 'https://example.r2.cloudflarestorage.com';
    process.env.R2_ACCESS_KEY_ID = 'id';
    process.env.R2_SECRET_ACCESS_KEY = 'secret';
    process.env.CONVERSION_BACKEND_URL = 'https://calibre.internal';
    // The old raw-stream forward made the two modes mutually exclusive. The
    // parse-once redesign (conversion-backend-client.ts) made upload_key +
    // backend coexist: upload_key requests are offered to the backend via an
    // R2-fetched prebuilt File and fall back to CloudConvert when the backend
    // is down/unsupported. Removing the exclusion is what restored the 100MB
    // cap after CONVERSION_BACKEND_URL went live.
    expect(isDirectUploadEnabled()).toBe(true);
  });

  it('is true when R2 is configured and no backend is set', () => {
    process.env.R2_ENDPOINT = 'https://example.r2.cloudflarestorage.com';
    process.env.R2_ACCESS_KEY_ID = 'id';
    process.env.R2_SECRET_ACCESS_KEY = 'secret';
    delete process.env.CONVERSION_BACKEND_URL;
    expect(isDirectUploadEnabled()).toBe(true);
  });
});

describe('size cap invariants', () => {
  it('the direct-upload cap is strictly larger than the multipart cap', () => {
    // If these ever converge, the feature is a no-op and the 4.5MB edge limit
    // is silently back in force.
    expect(MAX_UPLOAD_FILE_SIZE_BYTES).toBeGreaterThan(MAX_FILE_SIZE_BYTES);
  });

  it('the direct-upload cap is large enough for real DJVU / comic files', () => {
    // djvu-to-pdf and cbr-to-pdf are the two pages this feature exists for;
    // their real inputs routinely exceed 20MB.
    expect(MAX_UPLOAD_FILE_SIZE_MB).toBeGreaterThanOrEqual(50);
  });

  it('presigned URLs expire', () => {
    expect(PRESIGN_EXPIRES_SECONDS).toBeGreaterThan(0);
    expect(PRESIGN_EXPIRES_SECONDS).toBeLessThanOrEqual(3600);
  });
});
