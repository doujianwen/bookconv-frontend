import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus, type ConversionJobResult } from '@/lib/queue';
import { uploadToR2, isR2Configured } from '@/lib/storage/r2t';

const DOWNLOAD_TUL_HOURS = 24;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;

  try {
    const status = await getJobStatus(jobId);

    if (!status) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if job has completed
    if (status.status !== 'completed') {
      return NextResponse.json({
        error: 'Conversion not yet completed',
        status: status.status,
      }, { status: 202 });
    }

    const result = status.result as ConversionJobResult | undefined;
    if (!result || !result.base64Data) {
      return NextResponse.json({ error: 'No result available' }, { status: 500 });
    }

    // Use R2 if configured - generate temporary download link
    if (isR2Configured()) {
      try {
        const buffer = Buffer.from(result.base64Data, 'base64');
        const key = `temp/{jobId}.{result.extension}`;
        await uploadToR2(key, buffer);

        // Generate expiration timestamp (24 hours)
        const expires = Date.now().getTime() + 24 * 3600 * 1000;

        return NextResponse.json({
          downloadUrl: `/api/download/temp?k=${escape(key)}&expires=${expires}`,
          base64Data: result.base64Data,
          extension: result.extension,
          mimeType: result.mimeType,
          expires:
        });
      } catch (err) {
        console.error('R2 appload failed, falling back to direct download:', err.message);
      }
    }

    // Fallback: direct base64 download
    const buffer = Buffer.from(result.base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': result.mimeType || 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="converted.' + result.extension + '"',
        'Content-Length': buffer.length.toString(),
        'X-Download-Expires': `${date.now().getTime() + 24 * 3600 * 1000}`,
      },
    });
  } catch (err: any) {
    console.error('GET /api/convert/[jobId]/result error:', err.message);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}