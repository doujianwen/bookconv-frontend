// src/lib/queue.ts
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { getRedisClient } from './redis';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/ebook-uploads';
const CALIBRE_PATH = process.env.CALIBRE_PATH || 'ebook-convert';
const MAX_RETRIES = parseInt(process.env.MAX_CONVERSION_RETRIES || '3', 10);
let _queue = null;
let _worker = null;
let _queueEvents = null;
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
};
export type ConversionJobResult = {
  base64Data: string;
  extension: string;
  mimeType: string;
  downloadUrl?: string;
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
async function cleanupDir(dir) {
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
}
function getMimeType(ext) {
  const map = {
    epub: 'application/epub+zip', azw3: 'application/x-mobipocket-ebook',
    pdf: 'application/pdf', txt: 'text/plain', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    htmlz: 'application/zip', mobi: 'application/x-mobipocket-ebook', rtf: 'application/rtf',
    jpg: 'image/jpeg', png: 'image/png', fb2: 'application/x-fb2+zip',
    cbr: 'application/vnd.comicbook-rar', cbz: 'application/vnd.comicbook+zip',
    djvu: 'image/vnd.djvu', doc: 'application/msword', lit: 'application/x-ms-reader',
  };
  return map[ext] || 'application/octet-stream';
}
async function executeConversion(fileBuffer, sourceFormat, targetFormat, jobId) {
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
    return { base64Data: outputData.toString('base64'), extension: ext, mimeType: getMimeType(ext) };
  } catch (err) {
    await cleanupDir(jobDir);
    throw err;
  }
}
export async function processConversion(job) {
  const { fileBuffer, sourceFormat, targetFormat, jobId, userId } = job.data;
  const maxRetries = MAX_RETRIES;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    job.updateProgress({ percentage: 10 + (attempt - 1) * 5, attempt, maxRetries });
    try {
      const result = await executeConversion(fileBuffer, sourceFormat, targetFormat, jobId);
      job.updateProgress(100);
      return result;
    } catch (err) {
      const errMsg = err.message || 'Unknown conversion error';
      console.error('Conversion attempt ' + attempt + '/' + maxRetries + ' failed for job ' + jobId + ': ' + errMsg);
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000;
        job.updateProgress({ percentage: 10 + (attempt - 1) * 5, attempt, maxRetries, error: errMsg, retryInMs: delayMs });
        throw err;
      } else {
        job.updateProgress({ percentage: 0, attempt, maxRetries, error: errMsg });
        throw err;
      }
    }
  }
  throw new Error('Conversion failed after all retries');
}
export async function getJobStatus(jobId) {
  const queue = getConversionQueue();
  const job = await queue.getJob(jobId);
  if (!job) return null;
  const progress = job.progress;
  let progressValue = 0;
  if (typeof progress === 'number') progressValue = progress;
  else if (progress && typeof progress === 'object' && 'percentage' in progress) progressValue = progress.percentage || 0;
  let eta;
  if (job.state === 'active' && progressValue > 0 && progressValue < 100) {
    const elapsed = Date.now() - (job.processedAt || job.timestamp);
    const rate = progressValue / elapsed;
    if (rate > 0) eta = Math.ceil((100 - progressValue) / rate);
  }
  return {
    jobId, status: job.state || 'waiting', progress: progressValue,
    attempt: job.attemptsMade + 1, maxRetries, eta,
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
  _worker.on('completed', (job) => {
    console.log('Job ' + job.id + ' completed');
    getConversionQueue().trim(100, true);
    getConversionQueue().trim(50, false);
  });
  _worker.on('failed', (job, err) => {
    console.error('Job ' + (job?.id || '?') + ' failed after ' + (job?.attemptsMade || 0) + ' attempts: ' + err.message);
  });
  _worker.on('error', (err) => { console.error('Worker error:', err.message); });
  return _worker;
}
export function startQueueEvents() {
  if (_queueEvents) return _queueEvents;
  _queueEvents = new QueueEvents('ebook-conversions', { connection: getRedisClient() });
  _queueEvents.on('completed', (data) => console.log('QueueEvent: job ' + data.jobId + ' completed'));
  _queueEvents.on('failed', (data) => console.log('QueueEvent: job ' + data.jobId + ' failed: ' + data.reason));
  return _queueEvents;
}
export async function closeWorker() { if (_worker) { await _worker.close(); _worker = null; } }
export async function closeQueueEvents() { if (_queueEvents) { await _queueEvents.close(); _queueEvents = null; } }
