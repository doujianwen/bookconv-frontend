// src/lib/conversion.ts
//
// 纯转换执行层（与队列/Redis/Worker 完全解耦）。
//
// 设计目的：在 Vercel Serverless 等「无常驻进程」环境里，BullMQ + Redis + Worker
// 的异步架构天然不成立（函数返回即冻结，没有 worker 消费队列）。本模块提供
// `executeConversion` 的「请求内同步执行」版本，供 API 路由直接调用，不触碰任何
// Redis/网络依赖，因此不会在冷启动或不可达的 Redis 上挂死。
//
// 注意：本文件严禁 import queue.ts / redis.ts / bullmq，避免模块加载时的副作用
// （queue.ts 会在加载时自动 startWorker 并尝试连接 Redis）。

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { loggers as log } from './logger';
import { mapErrorCode, getFriendlyMessage } from './error-handler';
import { verifyConversion } from './conversion-verifier';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/ebook-uploads';
const CALIBRE_PATH = process.env.CALIBRE_PATH || 'ebook-convert';
export const MAX_RETRIES = parseInt(process.env.MAX_CONVERSION_RETRIES || '3', 10);

// Structured conversion audit log (consumed by ai-audit.js for true success-rate stats).
const CONVERSION_AUDIT_LOG = path.join(__dirname, '..', '..', '..', 'logs', 'conversion.log');
function appendConversionAuditLog(
  jobId: string,
  status: 'succeeded' | 'failed',
  meta?: { sourceFormat?: string; targetFormat?: string; durationMs?: number; error?: string },
) {
  try {
    const dir = path.dirname(CONVERSION_AUDIT_LOG);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const parts = [
      `job id: ${jobId}`,
      `status: ${status}`,
      `ts: ${new Date().toISOString()}`,
      meta?.sourceFormat && meta?.targetFormat ? `format: ${meta.sourceFormat}->${meta.targetFormat}` : '',
      meta?.durationMs != null ? `duration: ${meta.durationMs}ms` : '',
      meta?.error ? `error: ${meta.error}` : '',
    ].filter(Boolean);
    appendFileSync(CONVERSION_AUDIT_LOG, parts.join(' ') + '\n');
  } catch {
    // Audit-log write failure must not break the conversion flow
  }
}

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
    zip: 'application/zip',
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
      } catch (_err) {
        await fd.close().catch(() => {});
        throw _err;
      }

      // More thorough check: verify ZIP central directory exists
      const data = await fs.readFile(inputPath);
      let cdOffset = -1;
      for (let i = data.length - 4; i >= 0; i--) {
        if (data[i] === 0x50 && data[i + 1] === 0x4b && data[i + 2] === 0x05 && data[i + 3] === 0x06) {
          cdOffset = i;
          break;
        }
      }
      if (cdOffset === -1) {
        throw new Error('Invalid zip file');
      }

      // Check for META-INF/container.xml presence in the ZIP
      let hasContainer = false;
      for (let i = 0; i < data.length - 4; i++) {
        if (data[i] === 0x50 && data[i + 1] === 0x4b && data[i + 2] === 0x03 && data[i + 3] === 0x04) {
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
    } else if (sourceFormat === 'mobi' || sourceFormat === 'azw3') {
      const head = await fs.readFile(inputPath);
      const sig = head.subarray(0, 4).toString('latin1');
      if (!(sig === 'BOOK' || sig === 'TEXt')) {
        throw new Error('not a valid eBook format');
      }
    } else if (sourceFormat === 'pdf') {
      const head = await fs.readFile(inputPath);
      if (head.subarray(0, 4).toString('latin1') !== '%PDF') {
        throw new Error('not a valid eBook format');
      }
    } else if (['txt', 'rtf', 'docx'].includes(sourceFormat)) {
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

export type ConversionJobResult = {
  base64Data: string;
  extension: string;
  mimeType: string;
  downloadUrl?: string;
  fileSize?: number;
};

// --- Pure-JS EPUB → TXT (no Calibre required) ---
//
// EPUB is a ZIP containing XHTML/HTML files. We parse container.xml → OPF
// to find the spine (reading order), extract each chapter's HTML, strip
// tags, and concatenate into plain text with chapter separators.

async function epubToTxt(inputPath: string): Promise<string> {
  const JSZip = (await import('jszip')).default;
  const data = readFileSync(inputPath);
  const zip = await JSZip.loadAsync(data);

  // 1. Parse META-INF/container.xml to find the OPF file path
  const containerFile = zip.file('META-INF/container.xml');
  if (!containerFile) throw new Error('Invalid EPUB: missing container.xml');
  const containerXml = await containerFile.async('text');
  const opfPathMatch = containerXml.match(/full-path="([^"]+)"/);
  if (!opfPathMatch) throw new Error('Invalid EPUB: cannot find OPF path in container.xml');
  const opfPath = opfPathMatch[1];
  const opfDir = opfPath.includes('/') ? opfPath.replace(/[^/]+$/, '') : '';

  // 2. Parse the OPF to get spine item order
  const opfFile = zip.file(opfPath);
  if (!opfFile) throw new Error(`Invalid EPUB: OPF file not found at ${opfPath}`);
  const opfXml = await opfFile.async('text');

  // Build manifest map: id → href
  const manifest: Record<string, string> = {};
  const manifestRegex = /<item[^>]+id="([^"]+)"[^>]+href="([^"]+)"/g;
  let m;
  while ((m = manifestRegex.exec(opfXml)) !== null) {
    manifest[m[1]] = decodeURIComponent(m[2]);
  }
  // Also try reversed attribute order (href before id)
  const manifestRegex2 = /<item[^>]+href="([^"]+)"[^>]+id="([^"]+)"/g;
  while ((m = manifestRegex2.exec(opfXml)) !== null) {
    if (!manifest[m[2]]) manifest[m[2]] = decodeURIComponent(m[1]);
  }

  // Get spine order
  const spineRegex = /<itemref[^>]+idref="([^"]+)"/g;
  const spineIds: string[] = [];
  while ((m = spineRegex.exec(opfXml)) !== null) {
    spineIds.push(m[1]);
  }

  if (spineIds.length === 0) {
    throw new Error('Invalid EPUB: no spine items found');
  }

  // 3. Extract text from each spine item in order
  const parts: string[] = [];
  for (const id of spineIds) {
    const href = manifest[id];
    if (!href) continue;

    const fullPath = opfDir + href;
    const chapterFile = zip.file(fullPath) || zip.file(href);
    if (!chapterFile) continue;

    let html = await chapterFile.async('text');

    // Strip HTML tags to plain text
    // Remove script/style blocks entirely
    html = html.replace(/<(script|style|head|nav|footer)[^>]*>[\s\S]*?<\/\1>/gi, '');
    // Convert <br> and </p> and </div> and </h*> to newlines
    html = html.replace(/<br\s*\/?>/gi, '\n');
    html = html.replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n');
    html = html.replace(/<li[^>]*>/gi, '  - ');
    // Remove all remaining tags
    html = html.replace(/<[^>]+>/g, '');
    // Decode common HTML entities
    html = html
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
    // Collapse excessive blank lines
    html = html.replace(/\n{3,}/g, '\n\n').trim();

    if (html) {
      parts.push(html);
    }
  }

  if (parts.length === 0) {
    throw new Error('Conversion failed: no text content could be extracted from EPUB');
  }

  return parts.join('\n\n---\n\n');
}

/**
 * Execute a single conversion synchronously (no queue / no Redis).
 * Returns the output encoded as base64 so the calling API route can deliver it
 * inline (raw bytes) or via a storage URL.
 */
export async function executeConversion(
  fileBuffer: string | null,
  inputFilePath: string | null,
  sourceFormat: string,
  targetFormat: string,
  jobId: string,
): Promise<ConversionJobResult> {
  if (!isValidFormat(sourceFormat)) {
    throw new Error(`Invalid source format: ${sourceFormat}`);
  }
  if (!isValidFormat(targetFormat)) {
    throw new Error(`Invalid target format: ${targetFormat}`);
  }

  const jobDir = path.join(UPLOAD_DIR, jobId);
  mkdirSync(jobDir, { recursive: true });

  let inputPath: string;
  if (inputFilePath && existsSync(inputFilePath)) {
    inputPath = inputFilePath;
  } else {
    if (!fileBuffer) {
      throw new Error('Either fileBuffer or inputFilePath must be provided');
    }
    inputPath = path.join(jobDir, jobId + '.' + sourceFormat);
    writeFileSync(inputPath, Buffer.from(fileBuffer, 'base64'));
    if (Buffer.byteLength(fileBuffer, 'base64') < 30) {
      throw new Error(`Invalid input file: too small (${Buffer.byteLength(fileBuffer, 'base64')} bytes)`);
    }
  }

  const ext = targetFormat === 'html' ? 'htmlz' : targetFormat;
  const outputPath = path.join(jobDir, 'output.' + ext);

  // EPUB → ZIP is a direct passthrough: an EPUB file IS a ZIP archive.
  const isZipPassthrough = sourceFormat === 'epub' && targetFormat === 'zip';

  // EPUB → TXT can be done in pure JS (no Calibre): unzip the EPUB, extract
  // HTML/XHTML content files, strip tags → plain text. Works on Vercel.
  const isEpubToTxt = sourceFormat === 'epub' && targetFormat === 'txt';

  try {
    await validateInputFile(inputPath, sourceFormat);

    if (isZipPassthrough) {
      writeFileSync(outputPath, readFileSync(inputPath));
    } else if (isEpubToTxt) {
      const txt = await epubToTxt(inputPath);
      writeFileSync(outputPath, txt, 'utf8');
    } else {
      // Check if Calibre is available
      try {
        await execFileAsync(CALIBRE_PATH, ['--version'], { timeout: 5000 });
      } catch (calibreCheckErr: any) {
        // Calibre not available on this runtime (e.g., Vercel Serverless)
        throw new Error('Calibre is not available on this server. Please use EPUB to TXT or EPUB to ZIP conversions, or contact support for other formats.');
      }

      await execFileAsync(CALIBRE_PATH, [inputPath, outputPath], { timeout: 120_000, maxBuffer: 50 * 1024 * 1024 });
      if (!existsSync(outputPath)) throw new Error('Conversion failed: output not generated');

      const verdict = await verifyConversion(inputPath, outputPath, sourceFormat, targetFormat);
      if (!verdict.pass) {
        const detail = verdict.findings
          .filter((f) => f.severity === 'critical')
          .map((f) => `${f.id}: ${f.message}`)
          .join('; ');
        throw new Error(`Conversion output failed verification: ${detail}`);
      }
      for (const w of verdict.findings.filter((f) => f.severity === 'warn')) {
        log.conversion.warn('Conversion verification warning', { jobId, id: w.id, message: w.message });
      }
    }

    const outBuffer = readFileSync(outputPath);
    const base64Data = outBuffer.toString('base64');
    const fileSize = outBuffer.length;

    await cleanupDir(jobDir);
    return { base64Data, extension: ext, mimeType: getMimeType(ext), fileSize };
  } catch (err: any) {
    await cleanupDir(jobDir);
    const msg = err.message || String(err);
    if (msg.startsWith('Conversion output failed verification')) {
      throw err;
    }
    if (!msg.includes('not a valid eBook format') && !msg.includes('corrupt') && !msg.includes('Invalid zip') &&
        !msg.includes('Timeout') && !msg.includes('timed out')) {
      const stderr = err.stderr || '';
      const combined = `${msg}\n${stderr}`;
      const errorCode = mapErrorCode(combined);
      // Always throw friendly message for known error codes
      throw new Error(getFriendlyMessage(errorCode));
    }
    throw err;
  }
}

/**
 * Top-level entry used by API routes for synchronous (in-request) conversion.
 * Wraps `executeConversion` with structured audit logging so success-rate
 * stats keep flowing even without the BullMQ worker.
 */
export async function runConversion(
  fileBuffer: string | null,
  inputFilePath: string | null,
  sourceFormat: string,
  targetFormat: string,
  jobId: string,
): Promise<ConversionJobResult> {
  const start = Date.now();
  try {
    const result = await executeConversion(fileBuffer, inputFilePath, sourceFormat, targetFormat, jobId);
    appendConversionAuditLog(jobId, 'succeeded', {
      sourceFormat, targetFormat, durationMs: Date.now() - start,
    });
    return result;
  } catch (err: any) {
    appendConversionAuditLog(jobId, 'failed', {
      sourceFormat, targetFormat,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
