import { NextRequest, NextResponse } from 'next/server';

import { isR2Configured, downloadFromR2 } from '@/lib/storage/r2';

import { readFromLocal, deleteLocal } from '@/lib/storage/local';

import { loggers as log } from '@/lib/logger';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMIT_STRATEGIES } from '@/lib/rate-limit';

const MIME_TYPES: Record<string, string> = {
  epub: 'application/epub+zip',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  mobi: 'application/x-mobipocket-ebook',
  azw3: 'application/x-mobipocket-ebook',
  jpg: 'image/jpeg',
  png: 'image/png',
  htmlz: 'application/zip',
  rtf: 'application/rtf',
  fb2: 'application/x-fb2+zip',
  cbr: 'application/vnd.comicbook-rar',
  cbz: 'application/vnd.comicbook+zip',
  djvu: 'image/vnd.djvu',
  doc: 'application/msword',
  lit: 'application/x-ms-reader',
};

/** Extract the real client IP from x-forwarded-for header */
function extractClientIp(headerValue: string | null): string {
  if (!headerValue) return 'unknown';
  return headerValue.split(',')[0].trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('k');
  const source = searchParams.get('source') || 'r2'; // 'r2' or 'local'
  const expires = searchParams.get('expires');

  // Validate required params
  if (!key || !expires) {
    return NextResponse.json(
      { error: 'Missing required parameters: k, expires' },
      { status: 400 },
    );
  }

  // Validate expiration
  const expiryTime = parseInt(expires, 10);
  if (isNaN(expiryTime) || expiryTime < Date.now()) {
    return NextResponse.json(
      { error: 'Download link has expired' },
      { status: 410 },
    );
  }

  // Rate limit by IP (Redis-backed, multi-instance safe)
  const rawIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
  const clientIp = extractClientIp(rawIp);
  const rateResult = await checkRateLimit(`download:${clientIp}`, {
    windowMs: RATE_LIMIT_STRATEGIES.downloadApi.windowMs,
    maxRequests: RATE_LIMIT_STRATEGIES.downloadApi.maxRequests,
  });
  const rateHeaders = getRateLimitHeaders(rateResult, RATE_LIMIT_STRATEGIES.downloadApi.maxRequests);

  if (!rateResult.allowed) {
    log.download.warn('Download rate limited', { ip: clientIp, retryAfter: rateResult.retryAfter });
    return NextResponse.json(
      { error: 'Too many downloads. Please try again later.' },
      { status: 429, headers: rateHeaders },
    );
  }

  // Extract file extension from key
  const ext = key.split('.').pop()?.toLowerCase() || 'bin';
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
  const filename = key.split('/').pop() || 'download';

  try {
    let fileBuffer: Buffer;

    if (source === 'local') {
      // Try local storage first
      const _buf = readFromLocal(key);
      if (!_buf) {
        log.download.error('Local file not found', { key });
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      fileBuffer = _buf;

      if (!fileBuffer) {
        return NextResponse.json(
          { error: 'File not found or expired' },
          { status: 404 },
        );
      }
    } else {
      // Try R2 first, fall back to local
      if (isR2Configured()) {
        fileBuffer = await downloadFromR2(key);
      } else {
        // No R2 configured, fall back to local
        const _buf = readFromLocal(key);
        if (!_buf) {
          log.download.error('Local file not found', { key });
          return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        fileBuffer = _buf;

        if (!fileBuffer) {
          return NextResponse.json(
            { error: 'Download service unavailable' },
            { status: 503 },
          );
        }
      }
    }

    // Clean up the downloaded file to free space
    if (source === 'local') {
      deleteLocal(key);
    }

    return new NextResponse(new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength).buffer as ArrayBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `'attachment; filename='${filename}'`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Expires': '0',
        ...rateHeaders,
      },
    });
  } catch (_err: unknown) {
    log.download.error('Download error', { key });
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 },
    );
  }
}
