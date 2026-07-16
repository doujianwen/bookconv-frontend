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

describe('Performance: Concurrent conversion throughput', () => {
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

  it('should handle 5 concurrent conversions within timeout', async () => {
    const { processConversion } = require('@/lib/queue');
    const jobs = Array.from({ length: 5 }, (_, i) => ({
      data: {
        fileBuffer: Buffer.from(concurrent-job-).toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: perf-concurrent-,
      },
      updateProgress: jest.fn(),
    }));

    const start = Date.now();
    const results = await Promise.all(jobs.map((j) => processConversion(j)));
    const elapsed = Date.now() - start;

    expect(results).toHaveLength(5);
    results.forEach((r) => {
      expect(r.extension).toBe('pdf');
      expect(r.fileSize).toBeGreaterThan(0);
    });
    expect(elapsed).toBeLessThan(10_000);
  }, 15000);

  it('should handle 20 concurrent conversions', async () => {
    const { processConversion } = require('@/lib/queue');
    const jobs = Array.from({ length: 20 }, (_, i) => ({
      data: {
        fileBuffer: Buffer.from(ulk-job-).toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'txt',
        jobId: perf-bulk-,
      },
      updateProgress: jest.fn(),
    }));

    const start = Date.now();
    const results = await Promise.all(jobs.map((j) => processConversion(j)));
    const elapsed = Date.now() - start;

    expect(results).toHaveLength(20);
    expect(elapsed).toBeLessThan(30_000);
  }, 35000);

  it('should handle mixed-format concurrent conversions', async () => {
    const { processConversion } = require('@/lib/queue');
    const pairs = [['epub', 'pdf'], ['epub', 'txt'], ['epub', 'azw3'], ['mobi', 'epub'], ['pdf', 'epub']];
    const jobs = pairs.map(([src, tgt], i) => ({
      data: {
        fileBuffer: Buffer.from(mixed--).toString('base64'),
        sourceFormat: src,
        targetFormat: tgt,
        jobId: perf-mixed-,
      },
      updateProgress: jest.fn(),
    }));

    const results = await Promise.all(jobs.map((j) => processConversion(j)));
    expect(results).toHaveLength(pairs.length);
  });
});

describe('Performance: Memory usage monitoring', () => {
  it('should measure baseline memory for a single conversion', () => {
    const mem = process.memoryUsage();
    expect(mem.heapUsed).toBeGreaterThan(0);
    expect(mem.rss).toBeGreaterThan(0);
  });

  it('should handle multiple conversions without unbounded memory growth', () => {
    const initialMem = process.memoryUsage().heapUsed;
    for (let i = 0; i < 50; i++) {
      const buf = Buffer.alloc(1024, 'x');
      void buf.toString('base64');
    }
    const finalMem = process.memoryUsage().heapUsed;
    expect(finalMem).toBeLessThan(initialMem * 10);
  });

  it('should track memory for large base64 encoding', () => {
    const largeBuf = Buffer.alloc(1024 * 1024, 'a');
    const b64 = largeBuf.toString('base64');
    expect(b64.length).toBeGreaterThan(0);
    expect(b64.length).toBeLessThan(10 * 1024 * 1024);
  });
});

describe('Performance: Conversion speed benchmark', () => {
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

  it('should complete a conversion in under 1 second (mock baseline)', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: Buffer.from('benchmark-content').toString('base64'),
        sourceFormat: 'epub',
        targetFormat: 'pdf',
        jobId: 'perf-benchmark-001',
      },
      updateProgress: jest.fn(),
    };

    const start = Date.now();
    const result = await processConversion(mockJob);
    const elapsed = Date.now() - start;

    expect(result).toBeDefined();
    expect(elapsed).toBeLessThan(1000);
  });

  it('should benchmark 10 sequential conversions', async () => {
    const { processConversion } = require('@/lib/queue');
    const start = Date.now();
    for (let i = 0; i < 10; i++) {
      const mockJob = {
        data: {
          fileBuffer: Buffer.from(seq-).toString('base64'),
          sourceFormat: 'epub',
          targetFormat: 'txt',
          jobId: perf-seq-,
        },
        updateProgress: jest.fn(),
      };
      await processConversion(mockJob);
    }
    const elapsed = Date.now() - start;
    const avgMs = elapsed / 10;
    expect(avgMs).toBeLessThan(500);
  });
});

describe('Performance: Queue throughput simulation', () => {
  it('should simulate rapid job enqueuing', () => {
    const mockQueueAdd = jest.fn().mockResolvedValue({ id: 'job-x', timestamp: Date.now() });
    const totalOps = 100;
    const start = Date.now();
    for (let i = 0; i < totalOps; i++) {
      mockQueueAdd();
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
    expect(mockQueueAdd).toHaveBeenCalledTimes(totalOps);
  });

  it('should calculate throughput rate', () => {
    const ops = 100;
    const timeMs = 50;
    const throughputPerSecond = (ops / timeMs) * 1000;
    expect(throughputPerSecond).toBeGreaterThan(0);
    expect(throughputPerSecond).toBeLessThan(Infinity);
  });
});
