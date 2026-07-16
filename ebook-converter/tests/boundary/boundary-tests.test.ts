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

describe('Boundary: File size limits', () => {
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

  it('should handle near-maximum file size (10MB)', async () => {
    const { processConversion } = require('@/lib/queue');
    const largeBuffer = Buffer.alloc(10 * 1024 * 1024, 'x');
    const mockJob = {
      data: {
        fileBuffer: largeBuffer.toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: 'boundary-large-file',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);
    expect(result).toBeDefined();
    expect(result.extension).toBe('pdf');
  });

  it('should handle exactly 1MB file', async () => {
    const { processConversion } = require('@/lib/queue');
    const buffer = Buffer.alloc(1024 * 1024, 'y');
    const mockJob = {
      data: {
        fileBuffer: buffer.toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'txt',
        jobId: 'boundary-1mb',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);
    expect(result.fileSize).toBeGreaterThan(0);
  });

  it('should handle very small files (1 byte)', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: Buffer.from('X').toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: 'boundary-tiny',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);
    expect(result).toBeDefined();
  });
});

describe('Boundary: Special character filenames', () => {
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

  it('should handle Unicode job IDs', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: Buffer.from('content').toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: '边界测试-文件-名称',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);
    expect(result).toBeDefined();
  });

  it('should handle job IDs with spaces and hyphens', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: Buffer.from('content').toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'txt',
        jobId: 'my-ebook-file-name',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);
    expect(result).toBeDefined();
  });

  it('should handle job IDs with special symbols', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: Buffer.from('content').toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: 'test_file@#$%^&*()',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);
    expect(result).toBeDefined();
  });
});

describe('Boundary: Empty and zero-byte files', () => {
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

  it('should handle empty base64 string', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: '',
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: 'boundary-empty-b64',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);
    expect(result).toBeDefined();
  });

  it('should handle whitespace-only content', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: Buffer.from('   \n\n  ').toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'txt',
        jobId: 'boundary-whitespace',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);
    expect(result).toBeDefined();
  });
});

describe('Boundary: Corrupted input handling', () => {
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

  it('should handle completely random binary data', async () => {
    const { processConversion } = require('@/lib/queue');
    const randomBuffer = Buffer.from(Array.from({ length: 1024 }, () => Math.floor(Math.random() * 256)));
    const mockJob = {
      data: {
        fileBuffer: randomBuffer.toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: 'boundary-corrupted',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);
    expect(result).toBeDefined();
  });

  it('should handle truncated ZIP data', async () => {
    const { processConversion } = require('@/lib/queue');
    const truncated = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    const mockJob = {
      data: {
        fileBuffer: truncated.toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: 'boundary-truncated-zip',
      },
      updateProgress: jest.fn(),
    };

    const result = await processConversion(mockJob);
    expect(result).toBeDefined();
  });
});

describe('Boundary: MAX_RETRIES configuration', () => {
  it('should have MAX_RETRIES set to 3 by default', () => {
    const { MAX_RETRIES } = require('@/lib/queue');
    expect(MAX_RETRIES).toBe(3);
  });
});
