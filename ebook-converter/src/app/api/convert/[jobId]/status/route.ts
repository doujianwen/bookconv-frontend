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

    // Determine status from job attributes and progress
    const isCompleted = !!job.returnvalue;
    const isFailed = !!job.failedReason;
    const progress = (job.progress as any) || 0;

    let status: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';
    if (isCompleted) status = 'completed';
    else if (isFailed) status = 'failed';
    else if (progress > 0) status = 'processing';

    return NextResponse.json({
      jobId,
      status,
      progress: typeof progress === 'number' ? progress : 0,
      error: job.failedReason,
      result: isCompleted ? job.returnvalue : undefined,
    });
  } catch (err: any) {
    console.error('GET /api/convert/[jobId]/status error:', err.message);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}