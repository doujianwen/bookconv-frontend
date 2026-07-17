// src/app/api/convert/[jobId]/result/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus } from '@/lib/queue';
import { uploadToR2, isR2Configured } from '@/lib/storage/r2';
import { canAccessResult } from '@/lib/auth';

const DOWNLOAD_TTL_HOURS = 24;
const MAX_INLINE_FILE_SIZE = 5 * 1024 * 1024; // 5MB — above this, require R2 upload

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;

  try {
    const status = await getJobStatus(jobId);

    if (!status) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (status.status !== 'completed') {
      return NextResponse.json(
        { error: 'Conversion not yet completed', status: status.status },
        { status: 202 },
      );
    }

    // Ownership check: only the job creator (or anonymous users) can download
    const resultUserId = status.result?.userId;
    const hasAccess = await canAccessResult(resultUserId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const result = status.result as { base64Data?: string; extension?: string; mimeType?: string; fileSize?: number; userId?: string } | undefined;
    if (!result || !result.base64Data) {
      return NextResponse.json({ error: 'No result available' }, { status: 500 });
    }

    // Decode once to check file size
    const buffer = Buffer.from(result.base64Data, 'base64');
    const fileSize = buffer.length;
    const ext = result.extension || 'bin';

    // If file is too large, R2 upload is mandatory
    if (fileSize > MAX_INLINE_FILE_SIZE) {
      if (!isR2Configured()) {
        return NextResponse.json(
          { error: 'Download service unavailable for large files' },
          { status: 503 },
        );
      }

      try {
        const key = 'temp/' + jobId + '.' + ext;
        await uploadToR2(key, buffer);
        const expires = Date.now() + DOWNLOAD_TTL_HOURS * 3600 * 1000;

        return NextResponse.json({
          downloadUrl: '/api/download/temp?k=' + encodeURIComponent(key) + '&expires=' + expires,
          extension: ext,
          mimeType: result.mimeType || 'application/octet-stream',
          fileSize,
          expires,
        });
      } catch (uploadErr: unknown) {
        const msg = uploadErr instanceof Error ? uploadErr.message : 'Unknown error';
        console.error('R2 upload failed for large file:', msg);
        return NextResponse.json(
          { error: 'Download service temporarily unavailable' },
          { status: 503 },
        );
      }
    }

    // Small files: inline data URL is acceptable
    return NextResponse.json({
      downloadUrl: 'data:' + (result.mimeType || 'application/octet-stream') + ';base64,' + result.base64Data,
      extension: ext,
      mimeType: result.mimeType || 'application/octet-stream',
      fileSize,
      expires: Date.now() + DOWNLOAD_TTL_HOURS * 3600 * 1000,
    });
  } catch (err: unknown) {
    console.error('GET /api/convert/[jobId]/result error:', err);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
