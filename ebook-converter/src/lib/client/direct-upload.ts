// src/lib/client/direct-upload.ts
//
// Browser-side half of the direct-to-R2 upload path.
//
// Why it exists: files above the Vercel 4.5MB edge limit cannot be POSTed as
// multipart — the edge rejects the body before our code runs. Instead we ask
// /api/upload/presign for a signed PUT URL and send the bytes straight to R2,
// then hand the object key to /api/convert.
//
// Requires an R2 bucket CORS rule allowing PUT from the site origin — see
// docs/DIRECT_UPLOAD.md. Without it the PUT fails and the caller falls back.

export interface DirectUploadResult {
  key: string;
}

/** Thrown when the deployment has no direct-upload capability at all. */
export class DirectUploadUnavailableError extends Error {
  constructor(message = 'Direct upload is not available on this deployment.') {
    super(message);
    this.name = 'DirectUploadUnavailableError';
  }
}

export async function uploadFileDirect(
  file: File,
  sourceFormat: string,
  signal?: AbortSignal,
): Promise<DirectUploadResult> {
  const presignRes = await fetch('/api/upload/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceFormat,
      size: file.size,
      fileName: file.name,
    }),
    signal,
  });

  if (presignRes.status === 503) {
    throw new DirectUploadUnavailableError();
  }
  if (!presignRes.ok) {
    const payload = (await presignRes.json().catch(() => null)) as
      | { error?: string; code?: string }
      | null;
    throw new Error(payload?.error || `Could not start upload (${presignRes.status}).`);
  }

  const presigned = (await presignRes.json()) as {
    key: string;
    uploadUrl: string;
    method?: string;
    contentType?: string;
  };

  const putRes = await fetch(presigned.uploadUrl, {
    method: presigned.method || 'PUT',
    // Must match the Content-Type that was signed, or R2 rejects the signature.
    headers: { 'Content-Type': presigned.contentType || 'application/octet-stream' },
    body: file,
    signal,
  });

  if (!putRes.ok) {
    throw new Error(`Upload to storage failed (${putRes.status}).`);
  }

  return { key: presigned.key };
}
