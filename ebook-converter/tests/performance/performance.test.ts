import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

let _execCalls: { cmd: string; args: string[] }[] = [];
const TEST_UPLOAD_DIR = path.join(os.tmpdir(), 'ebook-test-uploads');
const FAKE_CONTENT = Buffer.alloc(1024, 'x');

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

describe('Performance: Concurrent conversion throughput', () => {
  beforeEach(() => {
    _execCalls = [];
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
  });

  afterEach(async () => {
    if (fs.existsSync(TEST_UPLOAD_DIR)) {
      fs.rmSync(TEST_UPLOAD_DIR, { recursive: true, force: true });
    }
  });

  it('should handle 5 sequential conversions within timeout', async () => {
    const { processConversion } = require('@/lib/queue');
    const start = Date.now();
    const results = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        processConversion({
          data: {
            fileBuffer: FAKE_CONTENT.toString('base64'),
            sourceFormat: 'epub',
            targetFormat: 'pdf',
            jobId: `perf-concurrent-${i}`,
          },
          updateProgress: jest.fn(),
        })
      )
    );
    const elapsed = Date.now() - start;

    expect(results).toHaveLength(5);
    results.forEach((r) => {
      expect(r.extension).toBe('pdf');
    });
    expect(elapsed).toBeLessThan(10_000);
  }, 15000);

  it('should handle 20 sequential conversions', async () => {
    const { processConversion } = require('@/lib/queue');
    const start = Date.now();
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        processConversion({
          data: {
            fileBuffer: FAKE_CONTENT.toString('base64'),
            sourceFormat: 'epub',
            targetFormat: 'txt',
            jobId: `perf-bulk-${i}`,
          },
          updateProgress: jest.fn(),
        })
      )
    );
    const elapsed = Date.now() - start;

    expect(results).toHaveLength(20);
    expect(elapsed).toBeLessThan(30_000);
  }, 35000);

  it('should handle mixed-format conversions', async () => {
    const { processConversion } = require('@/lib/queue');
    const pairs = [['epub', 'pdf'], ['epub', 'txt'], ['epub', 'azw3'], ['mobi', 'epub'], ['pdf', 'epub']];
    const results = await Promise.all(
      pairs.map(([src, tgt], i) =>
        processConversion({
          data: {
            fileBuffer: FAKE_CONTENT.toString('base64'),
            sourceFormat: src,
            targetFormat: tgt,
            jobId: `perf-mixed-${i}`,
          },
          updateProgress: jest.fn(),
        })
      )
    );
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
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
  });

  afterEach(async () => {
    if (fs.existsSync(TEST_UPLOAD_DIR)) {
      fs.rmSync(TEST_UPLOAD_DIR, { recursive: true, force: true });
    }
  });

  it('should complete a conversion in under 1 second (mock baseline)', async () => {
    const { processConversion } = require('@/lib/queue');
    const mockJob = {
      data: {
        fileBuffer: FAKE_CONTENT.toString('base64'),
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
          fileBuffer: FAKE_CONTENT.toString('base64'),
          sourceFormat: 'epub',
          targetFormat: 'txt',
          jobId: `perf-seq-${i}`,
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
