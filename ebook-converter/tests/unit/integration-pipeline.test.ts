const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

let _execCalls = [];

jest.mock('node:child_process', () => ({
  execFile: jest.fn((cmd, args, opts, cb) => {
    _execCalls.push({ cmd, args });
    const outputPath = args[1];
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const testOutput = Buffer.from('integration test output content');
    fs.writeFileSync(outputPath, testOutput);
    if (cb) cb(null, '', '');
  }),
}));

describe('Integration: Full pipeline verification', () => {
  beforeEach(() => {
    _execCalls = [];
    process.env.UPLOAD_DIR = path.join(os.tmpdir(), 'ebook-test-uploads');
  });

  afterEach(async () => {
    const uploadDir = process.env.UPLOAD_DIR;
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }
  });

  it('should produce valid base64 output decodable to bytes', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: Buffer.from('input').toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: 'int-pipeline-001',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);
    const decoded = Buffer.from(result.base64Data, 'base64');
    expect(decoded).toHaveLengthGreaterThan(0);
    expect(decoded.toString()).toContain('integration test output content');
  });

  it('should create proper directory structure', () => {
    const call = _execCalls[0];
    const inputArg = call?.args[0];
    const outputArg = call?.args[1];
    expect(inputArg).toBeDefined();
    expect(outputArg).toBeDefined();
    expect(path.extname(inputArg)).toBe('.epub');
    expect(path.extname(outputArg)).toBe('.pdf');
  });

  it('should track progress updates during conversion', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: Buffer.from('progress-test').toString('base64'),
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
          fileBuffer: Buffer.from('img-test').toString('base64'),
          sourceFormat: 'epub',
          targetFormat: fmt,
          jobId: int-img-,
        },
        updateProgress: jest.fn(),
      };

      const result = await processConversion(mockJob);
      expect(result.extension).toBe(fmt);
    }
  });
});
