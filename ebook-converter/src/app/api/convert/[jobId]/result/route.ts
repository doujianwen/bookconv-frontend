import { NextRequest, NextResponse } from 'next/server';
import { getConversionQueue } from '@/lib/queue';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  try {
    const job = await getConversionQueue().getJob(jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if job has completed and has a return value
    if (!job.returnvalue) {
      return NextResponse.json({ error: 'Conversion not yet completed' }, { status: 202 });
    }

    const result = job.returnvalue as any;
    if (!result.base64Data) {
      return NextResponse.json({ error: 'No result available' }, { status: 500 });
    }

    const buffer = Buffer.from(result.base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': result.mimeType || 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="converted.' + result.extension + '"',
      },
    });
  } catch (err: any) {
    console.error('GET /api/convert/[jobId]/result error:', err.message);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}