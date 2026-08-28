import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

let _execCalls: { cmd: string; args: string[] }[] = [];

const TEST_UPLOAD_DIR = path.join(os.tmpdir(), 'ebook-test-uploads');
// 合法 EPUB 输入（满足 validateInputFile 的 ZIP+container.xml 校验），让转换在离线/mock 环境下通过
const MINIMAL_FAKE_CONTENT = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'valid.epub'));

jest.mock('node:child_process', () => ({
  execFile: jest.fn((_cmd, args, optsOrCb, cb) => {
    const callback = typeof optsOrCb === 'function' ? optsOrCb : cb;
    _execCalls.push({ cmd: _cmd, args });
    const outputPath = args[1];
    try {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, Buffer.from('dummy converted content'));
    } catch {
      // Ignore mock file system errors
    }
    if (callback) {
      callback(null, '', '');
    }
  }),
}));

describe('processConversion', () => {
  beforeEach(() => {
    _execCalls = [];
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
  });

  afterEach(async () => {
    if (fs.existsSync(TEST_UPLOAD_DIR)) {
      fs.rmSync(TEST_UPLOAD_DIR, { recursive: true, force: true });
    }
  });

  it('should process a valid conversion successfully', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: MINIMAL_FAKE_CONTENT.toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: 'test-job-001',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);

    expect(result).toBeDefined();
    expect(result.outputFilePath).toBeDefined();
    expect(result.extension).toBe('pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(mockJob.updateProgress).toHaveBeenCalled();
  });

  it('should handle htmlz extension mapping', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: MINIMAL_FAKE_CONTENT.toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'html',
        jobId: 'test-job-html',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);
    expect(result.extension).toBe('htmlz');
  });

  it('should respect MAX_RETRIES setting', () => {
    const { MAX_RETRIES } = require('@/lib/queue');
    expect(MAX_RETRIES).toBe(3);
  });

  it('should return proper mimeType for common formats', async () => {
    const { processConversion } = require('@/lib/queue');
    const formats = [
      ['epub', 'epub', 'application/epub+zip'],
      ['epub', 'pdf', 'application/pdf'],
      ['epub', 'txt', 'text/plain'],
      ['epub', 'docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      ['epub', 'mobi', 'application/x-mobipocket-ebook'],
      ['epub', 'jpg', 'image/jpeg'],
      ['epub', 'png', 'image/png'],
    ];

    for (const [src, tgt, expectedMime] of formats) {
      const mockJob = {
        data: {
          fileBuffer: MINIMAL_FAKE_CONTENT.toString('base64'),
          sourceFormat: src,
          targetFormat: tgt,
          jobId: `test-job-${src}-${tgt}`,
        },
        updateProgress: jest.fn(),
      };

      const result = await processConversion(mockJob);
      expect(result.mimeType).toBe(expectedMime);
    }
  });
});

describe('getJobStatus', () => {
  it('should return null for non-existent jobs', async () => {
    const { getJobStatus } = require('@/lib/queue');
    const status = await getJobStatus('nonexistent-job-id');
    expect(status).toBeNull();
  });
});
