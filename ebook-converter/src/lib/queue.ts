// src/lib/queue.ts
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { getRedisClient } from './redis';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { loggers as log } from './logger';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/ebook-uploads';
const CALIBRE_PATH = process.env.CALIBRE_PATH || 'ebook-convert';
export const MAX_RETRIES = parseInt(process.env.MAX_CONVERSION_RETRIES || '3', 10);

let _queue: any = null;
let _worker: any = null;
let _queueEvents: any = null;

function makeQueue() {
  const client = getRedisClient();
  // Connect eagerly so we fail fast with a clear error
  client.connect().catch(() => {});
  return new Queue('ebook-conversions', { connection: client });
}

export function getConversionQueue() {
  if (!_queue) _queue = makeQueue();
  return _queue;
}

export type ConversionJobData = {
  fileBuffer?: string;
  inputFilePath?: string;
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

/** Safely remove a directory, logging errors instead of swallowing them silently */
async function cleanupDir(dir: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      rmSync(dir, { recursive: true, force: true });
      return;
    } catch (err: any) {
      if (attempt === maxRetries) {
        log.storage.error(`Failed to cleanup ${dir} after ${maxRetries} attempts`, { error: err.message });
      } else {
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)));
      }
    }
  }
}

export async function cleanupOrphanedTempDirs(maxAgeMs = 24*60*60*1000) {
  const fs = require('node:fs/promises');
  try {
    const entries = await fs.readdir(UPLOAD_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const dirPath = path.join(UPLOAD_DIR, entry.name);
      const stats = await fs.stat(dirPath);
      if (Date.now() - stats.mtimeMs > maxAgeMs) {
        await fs.rm(dirPath, { recursive: true, force: true });
        log.storage.info('Cleaned orphaned temp dir', { dir: dirPath });
      }
    }
  } catch (err: any) {
    log.storage.error('Periodic cleanup error', { error: err.message });
  }
}

/** Validate that a format string contains only safe characters */
function isValidFormat(format: string): boolean {
  return /^[a-z0-9]+$/.test(format);
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

async function executeConversion(
  fileBuffer: string | null,
  inputFilePath: string | null,
  sourceFormat: string,
  targetFormat: string,
  jobId: string,
) {
  // Validate format strings to prevent path traversal
  if (!isValidFormat(sourceFormat)) {
    throw new Error(`Invalid source format: ${sourceFormat}`);
  }
  if (!isValidFormat(targetFormat)) {
    throw new Error(`Invalid target format: ${targetFormat}`);
  }

  const jobDir = path.join(UPLOAD_DIR, jobId);
  mkdirSync(jobDir, { recursive: true });

  let inputPath: string;
  
  // Use provided input file path directly (new mode - avoids base64 memory bloat)
  if (inputFilePath && existsSync(inputFilePath)) {
    inputPath = inputFilePath;
  } else {
    // Legacy base64 mode — decode and write to temp file
    if (!fileBuffer) {
      throw new Error('Either fileBuffer or inputFilePath must be provided');
    }
    inputPath = path.join(jobDir, jobId + '.' + sourceFormat);
    writeFileSync(inputPath, Buffer.from(fileBuffer, 'base64'));
    
    // Validate decoded buffer size matches expectations
    const expectedMinSize = 30; // At least 30 bytes to be a valid file
    if (Buffer.byteLength(fileBuffer, 'base64') < expectedMinSize) {
      throw new Error(`Invalid input file: too small (${Buffer.byteLength(fileBuffer, 'base64')} bytes)`);
    }
  }

  let ext = targetFormat === 'html' ? 'htmlz' : targetFormat;
  let outputPath = path.join(jobDir, 'output.' + ext);
  try {
    await execFileAsync(CALIBRE_PATH, [inputPath, outputPath], { timeout: 120_000, maxBuffer: 50 * 1024 * 1024 });
    if (!existsSync(outputPath)) throw new Error('Conversion failed: output not generated');
    
    // Return the output file path instead of encoding to base64
    // Caller can stream-read it as needed
    await cleanupDir(jobDir);
    return { outputFilePath: outputPath, extension: ext, mimeType: getMimeType(ext) };
  } catch (err: any) {
    await cleanupDir(jobDir);
    throw err;
  }
}

/**
 * Process a single conversion attempt.
 * BullMQ handles retries via the `retries` option + `backoff` strategy.
 * This function should only execute ONE conversion attempt; failures are
 * thrown so BullMQ can retry with exponential backoff.
 */
export async function processConversion(job: any) {
  const { fileBuffer, inputFilePath, sourceFormat, targetFormat, jobId } = job.data;
  const attempt = job.attemptsMade + 1;
  const maxRetryCount = MAX_RETRIES;

  job.updateProgress({ percentage: 10 + (attempt - 1) * 5, attempt, maxRetries: maxRetryCount });

  try {
    const result = await executeConversion(
      fileBuffer ?? null,
      inputFilePath ?? null,
      sourceFormat,
      targetFormat,
      jobId,
    );
    job.updateProgress(100);
    return result;
  } catch (err: any) {
    const errMsg = (err instanceof Error ? err.message : 'Unknown conversion error');
    log.conversion.error(`Conversion attempt ${attempt}/${maxRetryCount} failed`, { jobId, attempt, maxRetries: maxRetryCount, error: errMsg });
    job.updateProgress({ percentage: 10 + (attempt - 1) * 5, attempt, maxRetries: maxRetryCount, error: errMsg });
    throw err; // BullMQ will retry with backoff
  }
}

export async function getJobStatus(jobId: string) {
  const queue = getConversionQueue();
  // BullMQ 5.x getJob() uses internal numeric ID, not custom jobId.
  // We need to find the job by scanning or using the numeric ID from Redis.
  const redis = getRedisClient();
  if (!redis.connected) {
    await redis.connect().catch(() => {});
  }

  // Find the BullMQ internal job ID by searching Redis keys
  // BullMQ stores jobs as "bull:<queueName>:<id>"
  const keys = await redis.keys(`bull:ebook-conversions:*`);
  let bullJobId: string | null = null;
  for (const key of keys) {
    const parts = key.split(':');
    // Key format: "bull:ebook-conversions:<id>"
    // parts[0]="bull", parts[1]="ebook-conversions", parts[2]=id
    if (parts.length < 3) continue;
    const id = parts[2];
    if (isNaN(Number(id))) continue; // skip meta keys like "id", "meta", "prioritized"
    const jobData = await redis.hget(key, 'data');
    if (jobData) {
      try {
        const data = JSON.parse(jobData);
        if (data.jobId === jobId) {
          bullJobId = id;
          break;
        }
      } catch { /* skip */ }
    }
  }

  if (!bullJobId) return null;

  const job = await queue.getJob(bullJobId);
  if (!job) return null;
  const progress = job.progress;
  let progressValue = 0;
  if (typeof progress === 'number') progressValue = progress;
  else if (progress && typeof progress === 'object' && 'percentage' in progress) progressValue = progress.percentage || 0;

  let eta: number | undefined;
  if (job.state === 'active' && progressValue > 0 && progressValue < 100) {
    const elapsed = Date.now() - job.timestamp;
    if (elapsed > 100) { // Guard against near-zero elapsed times
      const rate = progressValue / elapsed;
      if (rate > 0) eta = Math.ceil((100 - progressValue) / rate);
    }
  }

  return {
    jobId,
    status: job.state || (job.finishedOn ? 'completed' : 'waiting'),
    progress: progressValue,
    attempt: job.attemptsMade + 1,
    maxRetries: MAX_RETRIES,
    eta,
    error: job.failedReason || undefined,
    result: job.state === 'completed' || job.finishedOn ? job.returnvalue : undefined,
    createdAt: job.timestamp,
    updatedAt: job.updatedAt || job.timestamp,
  };
}


// Clean orphaned temp dirs on startup
cleanupOrphanedTempDirs().catch(() => {});

export async function startWorker() {
  if (_worker) return _worker;
  // Rate limit: max 5 jobs per minute (Calibre is CPU-intensive)
  const RATE_LIMIT_MAX = 5;
  const RATE_LIMIT_DURATION = 60_000; // 1 minute
  _worker = new Worker('ebook-conversions', processConversion, {
    connection: getRedisClient(),
    concurrency: RATE_LIMIT_MAX,
    limiter: { max: RATE_LIMIT_MAX, duration: RATE_LIMIT_DURATION },
    settings: {
      // Custom backoff strategy: exponential with 2s base delay
      // Replaces the dead delay code from the old for-loop retry logic
      backoffStrategy: (attemptsMade: number) => Math.pow(2, attemptsMade) * 2000,
    },
  });
  _worker.on('completed', (job: any) => {
    log.queue.info('Job completed', { jobId: job.id });
    // Keep jobs for 7 days instead of removing immediately
    getConversionQueue().trim(1000, false);
  });
  _worker.on('failed', async (job: any, err: any) => {
    const jobIdStr = job?.id || '?';
    log.queue.error('Job failed', { jobId: jobIdStr, attempts: job?.attemptsMade, error: err.message });

    // Send alert notification for failed jobs
    await notifyFailedJob(jobIdStr, job?.data, err.message);
  });
  _worker.on('error', (err: any) => { log.queue.error('Worker error', { error: err.message }); });
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
    log.conversion.error(`Conversion job ${jobId} failed`, {
      jobId,
      sourceFormat: jobData?.sourceFormat,
      targetFormat: jobData?.targetFormat,
      userId: jobData?.userId,
      error,
    });

    // TODO: Integrate with real notification service (Slack, email, etc.)
    // Example: await sendSlackAlert(message);
    // Example: await sendEmailNotification(userId, message);
  } catch (alertErr: any) {
    log.conversion.error('Failed to send alert notification', { error: alertErr.message });
  }
}

export function startQueueEvents() {
  if (_queueEvents) return _queueEvents;
  _queueEvents = new QueueEvents('ebook-conversions', { connection: getRedisClient() });
  _queueEvents.on('completed', (data: any) => log.queue.info('QueueEvent: job completed', { jobId: data.jobId }));
  _queueEvents.on('failed', (data: any) => log.queue.error('QueueEvent: job failed', { jobId: data.jobId, reason: data.failedReason }));
  return _queueEvents;
}

export async function closeWorker() { if (_worker) { await _worker.close(); _worker = null; } }
export async function closeQueueEvents() { if (_queueEvents) { await _queueEvents.close(); _queueEvents = null; } }

// Graceful shutdown hooks
process.on('SIGTERM', async () => {
  log.redis.info('SIGTERM received, closing worker...');
  await closeWorker();
  await closeQueueEvents();
  process.exit(0);
});
process.on('SIGINT', async () => {
  log.redis.info('SIGINT received, closing worker...');
  await closeWorker();
  await closeQueueEvents();
  process.exit(0);
});

// Auto-start worker in development ONLY (not on Vercel/serverless)
if (typeof window === 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
  startWorker().catch((err) => {
    console.error('[queue] Failed to auto-start worker:', err.message);
  });
}

