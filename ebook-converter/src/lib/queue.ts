// src/lib/queue.ts
import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from './redis';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { getConversionKey, getConversion, SUPPORTED_FORMATS } from '@/lib/conversion-map';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/ebook-uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10) * 1024 * 1024;
const CALIBRE_PATH = process.env.CALIBRE_PATH || 'ebook-convert';

export const conversionQueue = new Queue('conversion-queue', { connection: getRedisClient() });

export type ConversionJobData = {
  fileBuffer: string;
  sourceFormat: string;
  targetFormat: string;
  jobId: string;
};

export type ConversionJobResult = {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  outputUrl?: string;
  error?: string;
  jobId: string;
};

const execFileAsync = promisify(execFile);

async function cleanupDir(dir: string): Promise<void> {
  try { await rmSync(dir, { recursive: true, force: true }); } catch {}
}

export async function processConversion(job: Job<ConversionJobData>): Promise<any> {
  const { fileBuffer, sourceFormat, targetFormat, jobId } = job.data;
  
  job.updateProgress(10);
  
  const jobDir = path.join(UPLOAD_DIR, jobId);
  mkdirSync(jobDir, { recursive: true });
  
  const inputPath = path.join(jobDir, ${jobId}.);
  const buffer = Buffer.from(fileBuffer, 'base64');
  writeFileSync(inputPath, buffer);
  
  job.updateProgress(30);
  
  let ext = targetFormat === 'html' ? 'htmlz' : targetFormat;
  let outputPath = path.join(jobDir, output.);
  
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
  const worker = new Worker('conversion-queue', processConversion, {
    connection: getRedisClient(),
    concurrency: 2,
  });
  
  worker.on('completed', (job) => console.log(Job  completed));
  worker.on('failed', (job, err) => console.error(Job  failed:, err.message));
  
  return worker;
}
