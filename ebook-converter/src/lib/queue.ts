// src/lib/queue.ts
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { getRedisClient } from './redis';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/ebook-uploads';
const CALIBRE_PATH = process.env.CALIBRE_PATH || 'ebook-convert';
export const MAX_RETRIES = parseInt(process.env.MAX_CONVERSION_RETRIES || '3', 10);
let _queue: any = null;
let _worker: any = null;
let _queueEvents: any = null;
function makeQueue() {
  return new Queue('ebook-conversions', { connection: getRedisClient() });
}
export function getConversionQueue() {
  if (!_queue) _queue = makeQueue();
  return _queue;
}
export type ConversionJobData = {
  fileBuffer: string;
  sourceFormat: string;
  targetFormat: string;
  jobId: string;
  userId?: string;
  priority?: number; // 1 (high/Pro) - 3 (low/free)
};
export type ConversionJobResult = {
  base64Data: string;
  extension: string;
  mimeType: string;
  downloadUrl?: string;
  fileSize?: number;
};
export type JobStatusResponse = {
  jobId: string;
  status: string;
  progress: number;
  attempt: number;
  maxRetries: number;
  eta?: number;
  error?: string;
  result?: ConversionJobResult;
  createdAt: number;
  updatedAt: number;
};
const execFileAsync = promisify(execFile);
async function cleanupDir(dir: string) {
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
}
function getMimeType(ext: string): string {
  const map = {
    epub: 'application/epub+zip', azw3: 'application/x-mobipocket-ebook',
    pdf: 'application/pdf', txt: 'text/plain', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    htmlz: 'application/zip', mobi: 'application/x-mobipocket-ebook', rtf: 'application/rtf',
    jpg: 'image/jpeg', png: 'image/png', fb2: 'application/x-fb2+zip',
    cbr: 'application/vnd.comicbook-rar', cbz: 'application/vnd.comicbook+zip',
    djvu: 'image/vnd.djvu', doc: 'application/msword', lit: 'application/x-ms-reader',
  };
  return (map as Record<string, string>)[ext] || 'application/octet-stream';
}
async function executeConversion(fileBuffer: string, sourceFormat: string, targetFormat: string, jobId: string) {
  const jobDir = path.join(UPLOAD_DIR, jobId);
  mkdirSync(jobDir, { recursive: true });
  const inputPath = path.join(jobDir, jobId + '.' + sourceFormat);
  const buffer = Buffer.from(fileBuffer, 'base64');
  writeFileSync(inputPath, buffer);
  let ext = targetFormat === 'html' ? 'htmlz' : targetFormat;
  let outputPath = path.join(jobDir, 'output.' + ext);
  try {
    await execFileAsync(CALIBRE_PATH, [inputPath, outputPath], { timeout: 120_000, maxBuffer: 50 * 1024 * 1024 });
    if (!existsSync(outputPath)) throw new Error('Conversion failed: output not generated');
    const outputData = readFileSync(outputPath);
    await cleanupDir(jobDir);
    return { base64Data: outputData.toString('base64'), extension: ext, mimeType: getMimeType(ext), fileSize: outputData.length };
  } catch (err: any) {
    await cleanupDir(jobDir);
    throw err;
  }
}
export async function processConversion(job: any) {
  const { fileBuffer, sourceFormat, targetFormat, jobId, userId } = job.data;
  const maxRetryCount = MAX_RETRIES;
  for (let attempt = 1; attempt <= maxRetryCount; attempt++) {
    job.updateProgress({ percentage: 10 + (attempt - 1) * 5, attempt, maxRetries: maxRetryCount });
    try {
      const result = await executeConversion(fileBuffer, sourceFormat, targetFormat, jobId);
      job.updateProgress(100);
      return result;
    } catch (err) {
      const errMsg = (err instanceof Error ? err.message : 'Unknown conversion error');
      console.error('Conversion attempt ' + attempt + '/' + maxRetryCount + ' failed for job ' + jobId + ': ' + errMsg);
      if (attempt < maxRetryCount) {
        const delayMs = Math.pow(2, attempt) * 1000;
        job.updateProgress({ percentage: 10 + (attempt - 1) * 5, attempt, maxRetries: maxRetryCount, error: errMsg, retryInMs: delayMs });
        throw err;
      } else {
        job.updateProgress({ percentage: 0, attempt, maxRetries: maxRetryCount, error: errMsg });
        throw err;
      }
    }
  }
  throw new Error('Conversion failed after all retries');
}
export async function getJobStatus(jobId: string) {
  const queue = getConversionQueue();
  const job = await queue.getJob(jobId);
  if (!job) return null;
  const progress = job.progress;
  let progressValue = 0;
  if (typeof progress === 'number') progressValue = progress;
  else if (progress && typeof progress === 'object' && 'percentage' in progress) progressValue = progress.percentage || 0;
  let eta;
  if (job.state === 'active' && progressValue > 0 && progressValue < 100) {
      const elapsed = Date.now() - job.timestamp;
      if (elapsed > 0) {
        const rate = progressValue / elapsed;
    if (rate > 0) eta = Math.ceil((100 - progressValue) / rate);
      }
  }
  return {
    jobId, status: job.state || 'waiting', progress: progressValue,
    attempt: job.attemptsMade + 1, maxRetries: MAX_RETRIES, eta,
    error: job.failedReason || undefined,
    result: job.state === 'completed' ? job.returnvalue : undefined,
    createdAt: job.timestamp, updatedAt: job.updatedAt || job.timestamp,
  };
}
export async function startWorker() {
  if (_worker) return _worker;
  const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '4', 10);
  _worker = new Worker('ebook-conversions', processConversion, {
    connection: getRedisClient(), concurrency,
    limiter: { max: concurrency, duration: 1000 },
  });
  _worker.on('completed', (job: any) => {
    console.log('Job ' + job.id + ' completed');
      // Keep jobs for 7 days instead of removing immediately
      getConversionQueue().trim(1000, false);
  });
  _worker.on('failed', async (job: any, err: any) => {
    const jobIdStr = job?.id || "?";
    console.error('Job ' + jobIdStr + ' failed after ' + (job?.attemptsMade || 0) + ' attempts: ' + err.message);

    // Send alert notification for failed jobs
    await notifyFailedJob(jobIdStr, job?.data, err.message);
  });
  _worker.on('error', (err: any) => { console.error('Worker error:', err.message); });
  return _worker;
}

// Failed job alert notification
async function notifyFailedJob(jobId: string, jobData: any, error: string) {
  try {
    const { sourceFormat, targetFormat, userId } = jobData || {};
    const message = '[Alert] Conversion job ' + jobId + ' failed.\n' +
      'Source: ' + sourceFormat + ' -> Target: ' + targetFormat + '\n' +
      'Error: ' + error + '\n' +
      'User: ' + (userId || 'anonymous') + '\n' +
      'Timestamp: ' + new Date().toISOString();

    // Log to file or send to monitoring service
    console.error(message);

    // TODO: Integrate with real notification service (Slack, email, etc.)
    // Example: await sendSlackAlert(message);
    // Example: await sendEmailNotification(userId, message);
  } catch (alertErr: any) {
    console.error('Failed to send alert notification:', alertErr.message);
  }
}

export function startQueueEvents() {
  if (_queueEvents) return _queueEvents;
  _queueEvents = new QueueEvents('ebook-conversions', { connection: getRedisClient() });
  _queueEvents.on('completed', (data: any) => console.log('QueueEvent: job ' + data.jobId + ' completed'));
  _queueEvents.on('failed', (data: any) => console.log('QueueEvent: job ' + data.jobId + ' failed: ' + (data.failedReason || 'unknown')));
  return _queueEvents;
}
export async function closeWorker() { if (_worker) { await _worker.close(); _worker = null; } }
export async function closeQueueEvents() { if (_queueEvents) { await _queueEvents.close(); _queueEvents = null; } }
