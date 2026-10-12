// 反向验证：2026-10-12 的 3 个 CloudConvert/校验修复（#1 import 重试、#2 轮询预算、#3 魔数文案）
// 纪律：凡修复必须反向验证真能救回，而非只报 PASS。
//   #1a → 注入 import/upload 任务失败，断言会换全新 job 重试一次并成功
//   #1b → 注入 convert 任务失败（引擎降级），断言仍重试一次并成功（原行为未破坏）
//   #1c → 注入「非 convert/非 import」任务错误（与超时同走 retryable=false 分支），
//         断言不重试（只建 1 个 job）。避开 270s 真实轮询，等价验证超时分支。
//   #2  → 直接读源码常量 MAX_POLL_ATTEMPTS，断言已被改成 135（270s），防静默回退
//   #3  → 注入非 ZIP 的伪 EPUB，断言报错带前 4 字节魔数 0x74686973（"this"）
//
// 注意：cloudconvert.ts 在模块顶层捕获 process.env.CLOUD_CONVERT_API_KEY，必须在设置 env
// 之后再加载该模块（故用 beforeAll 里 require，而非顶层静态 import）。
let convertWithCloudConvert: (...args: any[]) => Promise<any>;

const ORIGINAL_KEY = process.env.CLOUD_CONVERT_API_KEY;

function makeJson(body: unknown, status = 200): any {
  return {
    ok: status >= 200 && status < 400,
    status,
    async json() {
      return body;
    },
    async text() {
      return JSON.stringify(body);
    },
    headers: { get: () => null },
  };
}

function makeUpload(): any {
  return {
    ok: true,
    status: 201,
    async json() {
      return {};
    },
    async text() {
      return '';
    },
    headers: { get: () => null },
  };
}

function makeFile(bytes: Buffer): any {
  return {
    ok: true,
    status: 200,
    async json() {
      throw new Error('no json on file response');
    },
    async text() {
      return '';
    },
    async arrayBuffer() {
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    },
    headers: {
      get: (k: string) =>
        k === 'content-type'
          ? 'application/pdf'
          : k === 'content-disposition'
            ? 'attachment; filename="out.pdf"'
            : null,
    },
  };
}

// firstJobFailMode: 控制首个 job 在首次轮询时的失败形态
//   'import'  → import/upload 任务失败（B 类瞬态，应重试）
//   'convert' → convert 任务失败（引擎降级，应重试）
//   'export'  → export/url 任务失败（与超时同走 false/false 分支，不重试）
//   'none'    → 首个 job 直接成功
function buildFetch(firstJobFailMode: 'import' | 'convert' | 'export' | 'none') {
  let jobCounter = 0;
  return jest.fn(async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input?.url;
    if (url.includes('/v2/jobs') && init?.method === 'POST') {
      const id = 'job-' + ++jobCounter;
      return makeJson({
        data: {
          id,
          status: 'waiting',
          tasks: [
            {
              id: 't1',
              name: 'import-file',
              operation: 'import/upload',
              status: 'waiting',
              result: {
                form: {
                  url: 'https://s3.upload.example/put-' + id,
                  parameters: { key: 'k', 'x-amz-signature': 's' },
                },
              },
            },
            { id: 't2', name: 'convert-file', operation: 'convert', status: 'waiting' },
            { id: 't3', name: 'export-file', operation: 'export/url', status: 'waiting' },
          ],
        },
      });
    }
    if (url.startsWith('https://s3.upload.example/')) return makeUpload();
    if (url.includes('/v2/jobs/') && init?.method !== 'POST') {
      const id = url.split('/v2/jobs/')[1];
      const idx = parseInt(String(id).replace('job-', ''), 10);
      if (idx === 1 && firstJobFailMode !== 'none') {
        if (firstJobFailMode === 'import') {
          return makeJson({
            data: {
              id,
              status: 'error',
              tasks: [
                { id: 't1', name: 'import-file', operation: 'import/upload', status: 'error', result: { message: 'Input task has failed', code: 'input_failed' } },
                { id: 't2', name: 'convert-file', operation: 'convert', status: 'pending' },
                { id: 't3', name: 'export-file', operation: 'export/url', status: 'pending' },
              ],
            },
          });
        }
        if (firstJobFailMode === 'convert') {
          return makeJson({
            data: {
              id,
              status: 'error',
              tasks: [
                { id: 't1', name: 'import-file', operation: 'import/upload', status: 'finished', result: {} },
                { id: 't2', name: 'convert-file', operation: 'convert', status: 'error', result: { message: 'Conversion failed: unsupported output', code: 'convert_failed' } },
                { id: 't3', name: 'export-file', operation: 'export/url', status: 'pending' },
              ],
            },
          });
        }
        if (firstJobFailMode === 'export') {
          return makeJson({
            data: {
              id,
              status: 'error',
              tasks: [
                { id: 't1', name: 'import-file', operation: 'import/upload', status: 'finished', result: {} },
                { id: 't2', name: 'convert-file', operation: 'convert', status: 'finished', result: {} },
                { id: 't3', name: 'export-file', operation: 'export/url', status: 'error', result: { message: 'export failed', code: 'export_failed' } },
              ],
            },
          });
        }
      }
      // 非首个 job，或 none 模式 → 成功
      return makeJson({
        data: {
          id,
          status: 'finished',
          tasks: [
            { id: 't1', name: 'import-file', operation: 'import/upload', status: 'finished', result: {} },
            { id: 't2', name: 'convert-file', operation: 'convert', status: 'finished', result: {} },
            {
              id: 't3',
              name: 'export-file',
              operation: 'export/url',
              status: 'finished',
              result: { files: [{ filename: 'out.pdf', url: 'https://download.example/out.pdf' }] },
            },
          ],
        },
      });
    }
    if (url.startsWith('https://download.example/')) {
      return makeFile(Buffer.from('%PDF-1.4 fake converted content'));
    }
    throw new Error('unexpected fetch: ' + url);
  });
}

function jobPostCount(fetchMock: jest.Mock): number {
  return fetchMock.mock.calls.filter(
    (c) => String(c[0]).includes('/v2/jobs') && (c[1] as any)?.method === 'POST',
  ).length;
}

describe('reverse-verify: CloudConvert fixes 2026-10-12', () => {
  beforeAll(() => {
    process.env.CLOUD_CONVERT_API_KEY = 'test-key';
    convertWithCloudConvert = require('@/lib/cloudconvert').convertWithCloudConvert;
  });
  afterAll(() => {
    process.env.CLOUD_CONVERT_API_KEY = ORIGINAL_KEY;
  });
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('#1a import/upload failure is retried with a fresh job and succeeds', async () => {
    const fetchMock = buildFetch('import');
    (global as any).fetch = fetchMock;
    const result = await convertWithCloudConvert(
      'epub',
      'html',
      Buffer.from('PK\x03\x04 fake epub zip content here for testing').toString('base64'),
      'book.epub',
    );
    expect(result.base64Data).toBeDefined();
    expect(result.filename).toContain('out');
    expect(jobPostCount(fetchMock)).toBe(2);
  });

  it('#1b convert-task failure (engine downgrade) is still retried and succeeds', async () => {
    const fetchMock = buildFetch('convert');
    (global as any).fetch = fetchMock;
    const result = await convertWithCloudConvert(
      'epub',
      'pdf',
      Buffer.from('PK\x03\x04 fake epub zip content here for testing').toString('base64'),
      'book.epub',
    );
    expect(result.base64Data).toBeDefined();
    expect(jobPostCount(fetchMock)).toBe(2);
  });

  it('#1c non-convert/non-import job error is NOT retried (covers the timeout branch, no 270s wait)', async () => {
    const fetchMock = buildFetch('export');
    (global as any).fetch = fetchMock;
    await expect(
      convertWithCloudConvert(
        'pdf',
        'epub',
        Buffer.from('%PDF-1.4 fake pdf content for testing the no-retry path here').toString('base64'),
        'book.pdf',
      ),
    ).rejects.toThrow(/CloudConvert job failed/);
    expect(jobPostCount(fetchMock)).toBe(1);
  });

  it('#2 poll budget constant is 135 (270s) — guard against silent revert', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.join(__dirname, '..', 'src', 'lib', 'cloudconvert.ts'),
      'utf8',
    );
    const m = src.match(/const MAX_POLL_ATTEMPTS = (\d+)/);
    expect(m).not.toBeNull();
    expect(Number(m![1])).toBe(135);
  });

  it('#3 invalid EPUB surfaces ZIP magic bytes in the error (actionable + traceable)', async () => {
    const { runConversion } = await import('@/lib/conversion');
    const fakeEpub = Buffer.from(
      'this is definitely not a zip file, it is plain ascii text content for testing the magic check thoroughly now',
    ).toString('base64');
    await expect(
      runConversion(fakeEpub, null, 'epub', 'pdf', 'test-magic-1'),
    ).rejects.toThrow(/0x74686973/);
  });
});
