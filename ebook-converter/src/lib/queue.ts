// src/lib/queue.ts
import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from './redis';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/ebook-uploads';
const CALIBRE_PATH = process.env.CALIBRE_PATH || 'ebook-convert';

// Lazy-loaded queue instance -- created on first access so static export
// doesn't try to connect to Redis or start a worker at import time.
let _queue: ReturnType<typeof makeQueue> | null = null;

function makeQueue() {
  return new Queue('ebook-conversions', { connection: getRedisClient() as any });
}

export function getConversionQueue() {
  if (!_queue) {
    _queue = makeQueue();
  }
  return _queue;
}
export type ConversionJobData = {
  fileBuffer: string;
  sourceFormat: string;
  targetFormat: string;
  jobId: string;
};

const execFileAsync = promisify(execFile);

async function cleanupDir(dir: string): Promise<void> {
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
}

export async function processConversion(job: Job<ConversionJobData>): Promise<any> {
  const { fileBuffer, sourceFormat, targetFormat, jobId } = job.data;
  job.updateProgress(10);

  const jobDir = path.join(UPLOAD_DIR, jobId);
  mkdirSync(jobDir, { recursive: true });

  const inputPath = path.join(jobDir, jobId + '.' + sourceFormat);
  const buffer = Buffer.from(fileBuffer, 'base64');
  writeFileSync(inputPath, buffer);

  job.updateProgress(30);

  let ext = targetFormat === 'html' ? 'htmlz' : targetFormat;
  let outputPath = path.join(jobDir, 'output.' + ext);

  try {
    await execFileAsync(CALIBRE_PATH, [inputPath, outputPath], {
      timeout: 120_000,
      maxBuffer: 50 * 1024 * 1024,
    });

    job.updateProgress(80);

    if (!existsSync(outputPath)) {
      throw new Error('Conversion failed: output not generated');
    }

    const outputData = readFileSync(outputPath);
    await cleanupDir(jobDir);

    job.updateProgress(100);

    return {
      base64Data: outputData.toString('base64'),
      extension: ext,
      mimeType: getMimeType(ext),
    };
  } catch (err: any) {
    await cleanupDir(jobDir);
    throw err;
  }
}

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    epub: 'application/epub+zip', azw3: 'application/x-mobipocket-ebook',
    pdf: 'application/pdf', txt: 'text/plain', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    htmlz: 'application/zip', mobi: 'application/x-mobipocket-ebook', rtf: 'application/rtf',
    jpg: 'image/jpeg', png: 'image/png',
  };
  return map[ext] || 'application/octet-stream';
}

export async function startWorker(): Promise<Worker> {
  const worker = new Worker('ebook-conversions', processConversion, {
    connection: getRedisClient(),
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '4', 10),
  });

  worker.on('completed', (job) => console.log('Job ' + job.id + ' completed'));
  worker.on('failed', (job, err) => console.error('Job ' + (job?.id || '?') + ' failed:', err.message));

  return worker;
}
