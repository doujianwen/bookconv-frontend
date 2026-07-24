import { NextRequest, NextResponse } from 'next/server';
import { sanitizeError, mapErrorCode } from "@/lib/error-handler";
import { getJobStatus } from '@/lib/queue';
import { uploadToR2, isR2Configured } from '@/lib/storage/r2';
import { canAccessResult } from '@/lib/auth';
import { saveToLocal } from '@/lib/storage/local';
import { sanitizeError, mapErrorCode } from "@/lib/error-handler";

const DOWNLOAD_TTL_HOURS = 24;
const INLINE_MAX_SIZE = 5 * 1024 * 1024; // 5MB threshold for inline vs R2

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

    // Ownership check
    const resultUserId = status.result?.userId;
    const hasAccess = await canAccessResult(resultUserId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const result = status.result as { base64Data?: string; extension?: string; mimeType?: string; fileSize?: number; userId?: string } | undefined;
    if (!result || !result.base64Data) {
      return NextResponse.json({ error: 'No result available' }, { status: 500 });
    }

    const buffer = Buffer.from(result.base64Data, 'base64');
    const fileSize = buffer.length;
    const ext = result.extension || 'bin';
    const mimeType = result.mimeType || 'application/octet-stream';

    // Case 1: Small file — always return inline (works without R2)
    if (fileSize <= INLINE_MAX_SIZE) {
      return NextResponse.json({
        downloadUrl: 'data:' + mimeType + ';base64,' + result.base64Data,
        extension: ext,
        mimeType,
        fileSize,
        expires: Date.now() + DOWNLOAD_TTL_HOURS * 3600 * 1000,
      });
    }

    // Case 2: Large file — try R2 first, fall back to local storage
    if (isR2Configured()) {
      try {
        const key = 'temp/' + jobId + '.' + ext;
        await uploadToR2(key, buffer);
        const expires = Date.now() + DOWNLOAD_TTL_HOURS * 3600 * 1000;

        return NextResponse.json({
          downloadUrl: '/api/download/temp?k=' + encodeURIComponent(key) + '&expires=' + expires,
          extension: ext,
          mimeType,
          fileSize,
          expires,
        });
      } catch (uploadErr: unknown) {
        const msg = uploadErr instanceof Error ? uploadErr.message : 'Unknown error';
        console.error('R2 upload failed for large file, falling back to local storage:', msg);
        // Fall through to local storage below
      }
    }

    // Fallback: save to local storage and serve directly
    try {
      const localKey = 'result/' + jobId + '.' + ext;
      saveToLocal(localKey, buffer);

      const expires = Date.now() + DOWNLOAD_TTL_HOURS * 3600 * 1000;
      return NextResponse.json({
        downloadUrl: '/api/download/local?k=' + encodeURIComponent(localKey) + '&expires=' + expires,
        extension: ext,
        mimeType,
        fileSize,
        expires,
      });
    } catch (localErr: unknown) {
      const msg = localErr instanceof Error ? localErr.message : 'Unknown error';
      console.error('Local storage fallback also failed:', msg);
      return NextResponse.json(
        { error: 'Download service temporarily unavailable' },
        { status: 503 },
      );
    }
  } catch (err: unknown) {
    console.error('GET /api/convert/[jobId]/result error:', err);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}