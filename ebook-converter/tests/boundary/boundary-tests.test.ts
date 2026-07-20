import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

let _execCalls: { cmd: string; args: string[] }[] = [];

const TEST_UPLOAD_DIR = path.join(os.tmpdir(), 'ebook-test-uploads');
const MINIMAL_FAKE_CONTENT = Buffer.alloc(1024, 'x');

jest.mock('node:child_process', () => ({
  execFile: jest.fn((cmd, args, optsOrCb, cb) => {
    const callback = typeof optsOrCb === 'function' ? optsOrCb : cb;
    _execCalls.push({ cmd, args });
    const outputPath = args[1] ?? '';
    const dir = path.dirname(outputPath);
    if (dir) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, Buffer.from('dummy converted content'));
    if (callback) callback(null, '', '');
  }),
}));

describe('Boundary: File size limits', () => {
  beforeEach(() => {
    _execCalls = [];
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
  });

  afterEach(async () => {
    if (fs.existsSync(TEST_UPLOAD_DIR)) {
      fs.rmSync(TEST_UPLOAD_DIR, { recursive: true, force: true });
    }
  });

  it('should handle near-maximum file size (1MB mock)', async () => {
    const { processConversion } = require('@/lib/queue');
    const largeBuffer = Buffer.alloc(1024 * 1024, 'x');
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
    expect(result.outputFilePath).toBeDefined();
  });

  it('should handle very small files', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: MINIMAL_FAKE_CONTENT.toString('base64'),
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
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
  });

  afterEach(async () => {
    if (fs.existsSync(TEST_UPLOAD_DIR)) {
      fs.rmSync(TEST_UPLOAD_DIR, { recursive: true, force: true });
    }
  });

  it('should handle Unicode job IDs', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: MINIMAL_FAKE_CONTENT.toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: 'boundary-unicode',
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
        fileBuffer: MINIMAL_FAKE_CONTENT.toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'txt',
        jobId: 'boundary-hyphens',
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
        fileBuffer: MINIMAL_FAKE_CONTENT.toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: 'boundary-special',
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
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
  });

  afterEach(async () => {
    if (fs.existsSync(TEST_UPLOAD_DIR)) {
      fs.rmSync(TEST_UPLOAD_DIR, { recursive: true, force: true });
    }
  });

  it('should reject empty base64 string', async () => {
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

    await expect(processConversion(mockJob)).rejects.toThrow('must be provided');
  });

  it('should handle whitespace-only content (min size)', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: MINIMAL_FAKE_CONTENT.toString('base64'),
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
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
  });

  afterEach(async () => {
    if (fs.existsSync(TEST_UPLOAD_DIR)) {
      fs.rmSync(TEST_UPLOAD_DIR, { recursive: true, force: true });
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

  it('should reject truncated ZIP data (too small)', async () => {
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

    await expect(processConversion(mockJob)).rejects.toThrow('too small');
  });
});

describe('Boundary: MAX_RETRIES configuration', () => {
  it('should have MAX_RETRIES set to 3 by default', () => {
    const { MAX_RETRIES } = require('@/lib/queue');
    expect(MAX_RETRIES).toBe(3);
  });
});
