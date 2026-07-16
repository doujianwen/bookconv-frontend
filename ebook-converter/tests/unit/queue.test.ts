const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

let _execCalls = [];

jest.mock('node:child_process', () => ({
  execFile: jest.fn((cmd, args, opts, cb) => {
    _execCalls.push({ cmd, args });
    const outputPath = args[1];
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, Buffer.from('dummy converted content'));
    if (cb) cb(null, '', '');
  }),
}));

describe('processConversion', () => {
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

  it('should process a valid conversion successfully', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: Buffer.from('fake epub content').toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: 'test-job-001',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);

    expect(result).toBeDefined();
    expect(result.base64Data).toBeDefined();
    expect(result.extension).toBe('pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.fileSize).toBeGreaterThan(0);
    expect(mockJob.updateProgress).toHaveBeenCalled();
  });

  it('should call ebook-convert with correct arguments', () => {
    expect(_execCalls.length).toBeGreaterThanOrEqual(1);
    const call = _execCalls[0];
    expect(call.cmd).toBe('ebook-convert-fake');
    expect(call.args.some((a) => a.endsWith('.epub'))).toBe(true);
    expect(call.args.some((a) => a.endsWith('.pdf'))).toBe(true);
  });

  it('should handle htmlz extension mapping', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: Buffer.from('fake').toString('base64'),
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
          fileBuffer: Buffer.from('fake').toString('base64'),
          sourceFormat: src,
          targetFormat: tgt,
          jobId: 	est-job-,
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
