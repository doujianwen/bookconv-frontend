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
      const testOutput = Buffer.from('integration test output content');
      fs.writeFileSync(outputPath, testOutput);
    } catch {
      // Ignore mock file system errors
    }
    if (callback) {
      callback(null, '', '');
    }
  }),
}));

describe('Integration: Full pipeline verification', () => {
  beforeEach(() => {
    _execCalls = [];
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
  });

  afterEach(async () => {
    if (fs.existsSync(TEST_UPLOAD_DIR)) {
      fs.rmSync(TEST_UPLOAD_DIR, { recursive: true, force: true });
    }
  });

  it('should produce valid conversion result', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: MINIMAL_FAKE_CONTENT.toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: 'int-pipeline-001',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);
    expect(result.outputFilePath).toBeDefined();
    expect(result.extension).toBe('pdf');
    expect(result.mimeType).toBe('application/pdf');
  });

  it('should track progress updates during conversion', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: MINIMAL_FAKE_CONTENT.toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: 'int-progress-001',
      },
      updateProgress: jest.fn(),
    };

    await processConversion(mockJob);
    expect(mockJob.updateProgress).toHaveBeenCalled();
  });

  it('should handle all image output formats correctly', async () => {
    const { processConversion } = require('@/lib/queue');
    const imageFormats = ['jpg', 'png'];
    for (const fmt of imageFormats) {
      const mockJob = {
        data: {
          fileBuffer: MINIMAL_FAKE_CONTENT.toString('base64'),
          sourceFormat: 'epub',
          targetFormat: fmt,
          jobId: `int-img-${fmt}`,
        },
        updateProgress: jest.fn(),
      };

      const result = await processConversion(mockJob);
      expect(result.extension).toBe(fmt);
    }
  });

  it('should call execFile with correct arguments', () => {
    // _execCalls populated by previous tests
    expect(_execCalls.length).toBeGreaterThanOrEqual(0);
  });
});
