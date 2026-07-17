import { NextRequest, NextResponse } from 'next/server';
import { isR2Configured, downloadFromR2 } from '@/lib/storage/r2';

const MAX_DOWNLOADS_PER_IP = 50;
const DOWNLOAD_WINDOW_MS = 60 * 60 * 1000; // 1 hour window

// Simple in-memory rate limiter (production should use Redis)
const ipDownloads = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipDownloads.get(ip);

  if (!record || now - record.windowStart > DOWNLOAD_WINDOW_MS) {
    ipDownloads.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (record.count >= MAX_DOWNLOADS_PER_IP) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('k');
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

  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many downloads. Please try again later.' },
      { status: 429 },
    );
  }

  // Fetch file from R2
  if (!isR2Configured()) {
    return NextResponse.json(
      { error: 'Download service unavailable' },
      { status: 503 },
    );
  }

  try {
    const fileBuffer = await downloadFromR2(key);
    if (!fileBuffer) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 },
      );
    }

    // Extract file extension from key
    const ext = key.split('.').pop() || 'bin';
    const mimeTypes: Record<string, string> = {
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

    return new NextResponse(new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength).buffer as ArrayBuffer, {
      headers: {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${key.split('/').pop()}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Expires': '0',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Download failed';
    console.error('Download error:', message);
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 },
    );
  }
}
