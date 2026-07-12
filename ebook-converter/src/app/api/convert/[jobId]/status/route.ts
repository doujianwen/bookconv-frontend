import { NextRequest, NextResponse } from 'next/server';
import { conversionQueue } from '@/lib/queue';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  
  try {
    const job = await conversionQueue.getJob(jobId);
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    const status = job.state || 'unknown';
    const progress = job.progress() || 0;
    
    let result = undefined;
    if (job.returnvalue) {
      result = job.returnvalue;
    }
    
    return NextResponse.json({
      jobId,
      status: status === 'waiting' ? 'pending' : status === 'active' ? 'processing' : status === 'completed' ? 'completed' : status === 'failed' ? 'failed' : status,
      progress: typeof progress === 'number' ? progress : 0,
      error: job.failedReason,
      result,
    });
  } catch (err: any) {
    console.error('GET /api/convert/[jobId]/status error:', err.message);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
