import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus } from '@/lib/queue';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  try {
    const status = await getJobStatus(jobId);

    if (!status) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Calculate ETA remaining (seconds)
    let etaSeconds: number | undefined;
    if (status.eta) {
      etaSeconds = Math.round(status.eta / 1000);
    }

    // Return detailed progress info
    return NextResponse.json({
      jobId,
      status: status.status,
      progress: status.progress,
      attempt: status.attempt,
      maxRetries: status.maxRetries,
      eta: etaSeconds, // seconds remaining
      error: status.error,
      result: status.result || undefined,
      createdAt: new Date(status.createdAt).toISOString(),
      updatedAt: new Date(status.updatedAt).toISOString(),
    });
  } catch (err: any) {
    console.error('GET /api/convert/[jobId]/status error:', err.message);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
