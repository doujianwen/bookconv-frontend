// src/app/api/convert/[jobId]/result/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus } from '@/lib/queue';
import { uploadToR2, isR2Configured } from '@/lib/storage/r2';

const DOWNLOAD_TTL_HOURS = 24;

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

    const result = status.result as { base64Data?: string; extension?: string; mimeType?: string } | undefined;
    if (!result || !result.base64Data) {
      return NextResponse.json({ error: 'No result available' }, { status: 500 });
    }

    const buffer = Buffer.from(result.base64Data, 'base64');
    const ext = result.extension || 'bin';

    if (isR2Configured()) {
      try {
        const key = 'temp/' + jobId + '.' + ext;
        await uploadToR2(key, buffer);
        const expires = Date.now() + DOWNLOAD_TTL_HOURS * 3600 * 1000;

        return NextResponse.json({
          downloadUrl: '/api/download/temp?k=' + encodeURIComponent(key) + '&expires=' + expires,
          extension: ext,
          mimeType: result.mimeType || 'application/octet-stream',
          expires,
        });
      } catch (uploadErr: unknown) {
        const msg = uploadErr instanceof Error ? uploadErr.message : 'Unknown error';
        console.error('R2 upload failed, falling back to direct download:', msg);
      }
    }

    return NextResponse.json({
      downloadUrl: 'data:' + (result.mimeType || 'application/octet-stream') + ';base64,' + result.base64Data,
      extension: ext,
      mimeType: result.mimeType || 'application/octet-stream',
      expires: Date.now() + DOWNLOAD_TTL_HOURS * 3600 * 1000,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('GET /api/convert/[jobId]/result error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
