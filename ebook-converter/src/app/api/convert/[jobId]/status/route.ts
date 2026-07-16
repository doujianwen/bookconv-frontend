// src/app/api/convert/[jobId]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus } from '@/lib/queue';

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

    let etaSeconds: number | undefined;
    if (status.eta) {
      etaSeconds = Math.round(status.eta / 1000);
    }

    return NextResponse.json({
      jobId,
      status: status.status,
      progress: status.progress,
      attempt: status.attempt,
      maxRetries: status.maxRetries,
      eta: etaSeconds,
      error: status.error,
      createdAt: new Date(status.createdAt).toISOString(),
      updatedAt: new Date(status.updatedAt).toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('GET /api/convert/[jobId]/status error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
