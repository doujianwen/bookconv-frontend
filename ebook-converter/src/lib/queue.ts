// src/lib/queue.ts
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { getRedisClient } from './redis';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { loggers as log } from './logger';
import { mapErrorCode, getFriendlyMessage } from './error-handler';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/ebook-uploads';
const CALIBRE_PATH = process.env.CALIBRE_PATH || 'ebook-convert';
export const MAX_RETRIES = parseInt(process.env.MAX_CONVERSION_RETRIES || '3', 10);

// 结构化转换审计日志（供 ai-audit.js 统计真实成功率，格式匹配其正则 /job id:/、/succeeded/、/failed/）
// 路径与 ai-audit.js 的 logs/conversion.log 一致（仓库根 logs/，容器内 /logs/）
const CONVERSION_AUDIT_LOG = path.join(__dirname, "..", "..", "..", "logs", "conversion.log");
function appendConversionAuditLog(
  jobId: string,
  status: "succeeded" | "failed",
  meta?: { sourceFormat?: string; targetFormat?: string; durationMs?: number; error?: string },
) {
  try {
    const dir = path.dirname(CONVERSION_AUDIT_LOG);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const parts = [
      `job id: ${jobId}`,
      `status: ${status}`,
      `ts: ${new Date().toISOString()}`,
      meta?.sourceFormat && meta?.targetFormat ? `format: ${meta.sourceFormat}->${meta.targetFormat}` : "",
      meta?.durationMs != null ? `duration: ${meta.durationMs}ms` : "",
      meta?.error ? `error: ${meta.error}` : "",
    ].filter(Boolean);
    appendFileSync(CONVERSION_AUDIT_LOG, parts.join(" ") + "\n");
  } catch {
    // 审计日志写入失败不应影响转换主流程
  }
}

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

/** Validate input file before sending to Calibre. Throws if the file is clearly corrupted. */
async function validateInputFile(inputPath: string, sourceFormat: string): Promise<void> {
  const fs = require('node:fs/promises');

  try {
    const stat = await fs.stat(inputPath);
    if (stat.size === 0) {
      throw new Error('Empty input file');
    }

    if (sourceFormat === 'epub') {
      const buf = Buffer.alloc(4);
      const fd = await fs.open(inputPath, 'r');
      try {
        await fd.read(buf, 0, 4, 0);
        await fd.close();
        // ZIP magic: PK\x03\x04 or PK\x05\x06 (empty archive) or PK\x07\x08 (spanned)
        const validZip =
          buf[0] === 0x50 && buf[1] === 0x4b && (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07);
        if (!validZip) {
          throw new Error('not a valid eBook format');
        }

        // EPUB must contain mimetype and META-INF/container.xml
        // NOTE: thorough ZIP-level parsing deferred to Calibre itself
        // (we already validated ZIP magic + central directory above)
      } catch (_err) {
        await fd.close().catch(() => {});
        throw _err;
      }

      // More thorough check: verify ZIP central directory exists
      const data = await fs.readFile(inputPath);
      // Find central directory to confirm ZIP structure
      let cdOffset = -1;
      for (let i = data.length - 4; i >= 0; i--) {
        if (data[i] === 0x50 && data[i+1] === 0x4b && data[i+2] === 0x05 && data[i+3] === 0x06) {
          cdOffset = i;
          break;
        }
      }
      if (cdOffset === -1) {
        throw new Error('Invalid zip file');
      }

      // Check for META-INF/container.xml presence in the ZIP
      // The local file header signature is PK\x03\x04
      let hasContainer = false;
      for (let i = 0; i < data.length - 4; i++) {
        if (data[i] === 0x50 && data[i+1] === 0x4b && data[i+2] === 0x03 && data[i+3] === 0x04) {
          // Local file header — filename length is at offset 26-27 (LE uint16)
          const fnameLen = data[i + 26] | (data[i + 27] << 8);
          if (fnameLen > 0 && fnameLen < 256 && i + 30 + fnameLen <= data.length) {
            const fname = data.slice(i + 30, i + 30 + fnameLen).toString('utf8').toLowerCase();
            if (fname.includes('container.xml') || fname.includes('opf')) {
              hasContainer = true;
              break;
            }
          }
        }
      }
      if (!hasContainer) {
        throw new Error('Invalid or missing opf');
      }
    }
    // MOBI/AZW3 detection: header starts with 'BOOK' or 'TEXt'
    // NOTE: fs.readFile ignores {start,end}; read the whole file and compare the first 4 bytes.
    else if (sourceFormat === 'mobi' || sourceFormat === 'azw3') {
      const head = await fs.readFile(inputPath);
      const sig = head.subarray(0, 4).toString('latin1');
      if (!(sig === 'BOOK' || sig === 'TEXt')) {
        throw new Error('not a valid eBook format');
      }
    }
    // PDF: magic %PDF
    else if (sourceFormat === 'pdf') {
      const head = await fs.readFile(inputPath);
      if (head.subarray(0, 4).toString('latin1') !== '%PDF') {
        throw new Error('not a valid eBook format');
      }
    }
    // TXT/RTF: just verify it's text-starting or non-empty
    else if (['txt', 'rtf', 'docx'].includes(sourceFormat)) {
      // docx is ZIP-like, check already
      if (sourceFormat === 'txt' || sourceFormat === 'rtf') {
        const headBuf = Buffer.alloc(64);
        const fd = await fs.open(inputPath, 'r');
        try {
          await fd.read(headBuf, 0, 64, 0);
          const txt = headBuf.toString().trim();
          if (sourceFormat === 'rtf' && !txt.startsWith('{\\')) {
            throw new Error('not a valid eBook format');
          }
        } finally {
          await fd.close();
        }
      }
    }
  } catch (err: any) {
    // Wrap validation errors with category that mapErrorCode can detect
    const msg = err.message || String(err);
    if (!msg.includes('not a valid eBook format') &&
        !msg.includes('corrupt epub') &&
        !msg.includes('Invalid zip file') &&
        !msg.includes('Invalid or missing opf') &&
        !msg.includes('Empty input file')) {
      throw new Error(`Input validation failed: ${msg}`);
    }
    throw err;
  }
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

  const ext = targetFormat === 'html' ? 'htmlz' : targetFormat;
  const outputPath = path.join(jobDir, 'output.' + ext);
  try {
    // Pre-validation: catch clearly corrupted files before hitting Calibre
    await validateInputFile(inputPath, sourceFormat);

    await execFileAsync(CALIBRE_PATH, [inputPath, outputPath], { timeout: 120_000, maxBuffer: 50 * 1024 * 1024 });
    if (!existsSync(outputPath)) throw new Error('Conversion failed: output not generated');

    // Return the output file path instead of encoding to base64
    // Caller can stream-read it as needed
    await cleanupDir(jobDir);
    return { outputFilePath: outputPath, extension: ext, mimeType: getMimeType(ext) };
  } catch (err: any) {
    await cleanupDir(jobDir);
    // If the error doesn't already have a recognized category, enrich it with stderr
    const msg = err.message || String(err);
    if (!msg.includes('not a valid eBook format') && !msg.includes('corrupt') && !msg.includes('Invalid zip') &&
        !msg.includes('Timeout') && !msg.includes('timed out')) {
      const stderr = err.stderr || '';
      const combined = `${msg}\n${stderr}`;
      const errorCode = mapErrorCode(combined);
      if (errorCode !== 'CONVERSION_FAILED') {
        throw new Error(getFriendlyMessage(errorCode));
      }
    }
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
    const errorCode = mapErrorCode(errMsg);
    const friendlyMsg = getFriendlyMessage(errorCode);
    // Keep the real error available for debugging/tests via `cause`; the API/status
    // layer maps errorCode -> a user-friendly message, so we must NOT overwrite the
    // thrown message with a generic one here (that would hide the real cause).
    log.conversion.error(`Conversion attempt ${attempt}/${maxRetryCount} failed`, {
      jobId, attempt, maxRetries: maxRetryCount, error: friendlyMsg, rawError: errMsg, code: errorCode,
    });
    const wrapped: any = new Error(friendlyMsg);
    wrapped.code = errorCode;
    wrapped.cause = err instanceof Error ? err : new Error(errMsg);
    job.updateProgress({ percentage: 10 + (attempt - 1) * 5, attempt, maxRetries: maxRetryCount, error: friendlyMsg });
    throw wrapped; // BullMQ will retry with backoff; real cause retained on `.cause`
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
    appendConversionAuditLog(job.id, "succeeded", {
      sourceFormat: job.data?.sourceFormat,
      targetFormat: job.data?.targetFormat,
      durationMs: job.finishedOn ? job.finishedOn - job.timestamp : undefined,
    });
    // Keep jobs for 7 days instead of removing immediately
    getConversionQueue().trim(1000, false);
  });
  _worker.on('failed', async (job: any, err: any) => {
    const jobIdStr = job?.id || '?';
    log.queue.error('Job failed', { jobId: jobIdStr, attempts: job?.attemptsMade, error: err.message });
    appendConversionAuditLog(jobIdStr, "failed", {
      sourceFormat: job?.data?.sourceFormat,
      targetFormat: job?.data?.targetFormat,
      error: err.message,
    });

    // Send alert notification for failed jobs
    await notifyFailedJob(jobIdStr, job?.data, err.message);
  });
  _worker.on('error', (err: any) => { log.queue.error('Worker error', { error: err.message }); });
  return _worker;
}

// Failed job alert notification — sends to Feishu webhook if configured
async function notifyFailedJob(jobId: string, jobData: any, error: string) {
  try {
    const { sourceFormat, targetFormat, userId } = jobData || {};
    log.conversion.error(`Conversion job ${jobId} failed`, {
      jobId,
      sourceFormat: jobData?.sourceFormat,
      targetFormat: jobData?.targetFormat,
      userId: jobData?.userId,
      error,
    });

    // Send Feishu webhook alert if configured
    const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
    if (webhookUrl) {
      await sendFeishuAlert({
        webhookUrl,
        jobId,
        sourceFormat,
        targetFormat,
        userId,
        error,
      }).catch(() => {});
    }
  } catch (alertErr: any) {
    log.conversion.error('Failed to send alert notification', { error: alertErr.message });
  }
}

interface FeishuAlertPayload {
  jobId: string;
  webhookUrl: string;
  sourceFormat?: string;
  targetFormat?: string;
  userId?: string;
  error: string;
}

/** Send an alert message to a Feishu group webhook */
async function sendFeishuAlert(payload: FeishuAlertPayload): Promise<void> {
  const { webhookUrl, jobId, sourceFormat, targetFormat, error, userId } = payload;

  const errorCode = mapErrorCode(error);
  const friendlyMsg = getFriendlyMessage(errorCode);

  const msg = JSON.stringify({
    msg_type: 'interactive',
    card: {
      config: { wide_screen_mode: true },
      header: {
        title: { tag: 'plain_text', content: `🚨 Conversion Failed — ${jobId.slice(0, 8)}` },
        template: 'red' as const,
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: [
              '**Job:**', jobId, '\n',
              '**Format:**', `${sourceFormat || '?'} → ${targetFormat || '?'}`, '\n',
              '**Error Code:**', errorCode, '\n',
              '**User:**', userId || 'anonymous', '\n',
              '**Time:**', new Date().toISOString(), '\n',
            ].join(''),
          },
        },
        {
          tag: 'note',
          elements: [
            {
              tag: 'plain_text',
              content: friendlyMsg,
            },
          ],
        },
      ],
    },
  });

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: msg,
  }).catch(() => {
    log.conversion.warn('Feishu webhook request failed');
  });
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

