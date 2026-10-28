// tests/unit/convert-route-cleanup.test.ts
//
// What this protects (2026-10-28):
//   The backend-delegation happy path in POST /api/convert MUST schedule the
//   R2 upload-object cleanup, exactly like the CloudConvert path does.
//   Regression: the WP4 backend branch returned delegateToBackend()'s response
//   directly, so uploads/YYYY-MM-DD/*.epub objects were never deleted and the
//   bucket grew on every successful large-file conversion.
//
//   Invariants:
//   1. backend hit  + upload_key  -> cleanup scheduled (with the key)
//   2. backend miss + upload_key  -> cleanup NOT scheduled here (convertAndStream
//      owns it; scheduling twice would double-delete, harmless but wrong signal)
//   3. backend hit  + no upload_key -> no cleanup call (nothing to clean)

// NOTE: use the GLOBAL jest/describe/it — importing jest from '@jest/globals'
// breaks @swc/jest's mock hoisting (jest.mock then applies too late and the
// real modules get imported instead).

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimitWithStrategy: jest.fn(async () => ({ allowed: true })),
  getRateLimitHeaders: jest.fn(() => ({})),
  RATE_LIMIT_STRATEGIES: { convertApi: { maxRequests: 20 } },
}));

jest.mock('@/lib/conversion-map', () => ({
  normalizeFormat: (v: unknown) => (typeof v === 'string' ? v.toLowerCase().replace('.', '') : ''),
}));

jest.mock('@/lib/storage/r2', () => ({
  downloadFromR2: jest.fn(async () => Buffer.from('fake-epub-bytes')),
}));

jest.mock('@/lib/upload-presign', () => ({
  fileNameFromUploadKey: jest.fn(() => 'book.epub'),
}));

jest.mock('@/lib/convert-handler', () => ({
  convertAndStream: jest.fn(),
  scheduleUploadCleanup: jest.fn(),
}));

jest.mock('@/lib/conversion-backend-client', () => ({
  backendConfigured: jest.fn(() => true),
  shouldUseBackend: jest.fn(() => true),
  isCalibreTarget: jest.fn(() => true),
  delegateToBackend: jest.fn(),
}));

import { POST } from '@/app/api/convert/route';
import { NextRequest } from 'next/server';
import { convertAndStream, scheduleUploadCleanup } from '@/lib/convert-handler';
import { delegateToBackend } from '@/lib/conversion-backend-client';

const cleanup = jest.mocked(scheduleUploadCleanup);
const delegate = jest.mocked(delegateToBackend);
const stream = jest.mocked(convertAndStream);

function makeRequest(withKey: boolean): NextRequest {
  const form = new FormData();
  form.set('source_format', 'epub');
  form.set('target_format', 'mobi');
  if (withKey) form.set('upload_key', 'uploads/2026-10-28/it-does-not-matter.epub');
  return new NextRequest('http://localhost/api/convert', {
    method: 'POST',
    body: form,
  } as unknown as ConstructorParameters<typeof NextRequest>[1]);
}

describe('POST /api/convert: R2 upload cleanup on the backend path', () => {
  beforeEach(() => {
    cleanup.mockClear();
    delegate.mockReset();
    stream.mockReset();
  });

  it('schedules cleanup when the backend delegation succeeds', async () => {
    delegate.mockResolvedValue(new Response('mobi-bytes') as never);
    const res = await POST(makeRequest(true));
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledWith('uploads/2026-10-28/it-does-not-matter.epub');
    expect(stream).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('does NOT schedule cleanup when falling back to CloudConvert (convertAndStream owns it)', async () => {
    delegate.mockResolvedValue(undefined as never);
    await POST(makeRequest(true));
    expect(cleanup).not.toHaveBeenCalled();
    expect(stream).toHaveBeenCalledTimes(1);
    // the fallback must carry the observability header
    const opts = stream.mock.calls[0][1] as Record<string, string>;
    expect(opts['X-Conversion-Backend']).toBe('miss-cloudconvert');
  });

  it('does not schedule cleanup when there is no upload_key', async () => {
    delegate.mockResolvedValue(new Response('mobi-bytes') as never);
    await POST(makeRequest(false));
    // the route passes uploadKey straight through; the REAL scheduleUploadCleanup
    // no-ops on undefined. The mock records the raw call, so assert no key ever
    // reaches the cleanup (anything() does not match undefined).
    expect(cleanup).not.toHaveBeenCalledWith(expect.anything());
  });
});
