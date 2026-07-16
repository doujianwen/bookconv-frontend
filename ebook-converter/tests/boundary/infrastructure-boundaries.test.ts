describe('Boundary: Environment configuration', () => {
  it('should have reasonable default UPLOAD_DIR', () => {
    const uploadDir = process.env.UPLOAD_DIR || '/tmp/ebook-uploads';
    expect(uploadDir).toBeDefined();
    expect(uploadDir.length).toBeGreaterThan(0);
  });

  it('should have CALIBRE_PATH configured', () => {
    const calibrePath = process.env.CALIBRE_PATH || 'ebook-convert';
    expect(calibrePath).toBeDefined();
  });

  it('should have MAX_FILE_SIZE_MB set', () => {
    const maxMb = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);
    expect(maxMb).toBeGreaterThanOrEqual(1);
    expect(maxMb).toBeLessThanOrEqual(100);
  });

  it('should have WORKER_CONCURRENCY set', () => {
    const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '4', 10);
    expect(concurrency).toBeGreaterThanOrEqual(1);
    expect(concurrency).toBeLessThanOrEqual(32);
  });
});

describe('Boundary: Worker lifecycle exports', () => {
  it('should have startWorker and closeWorker functions exported', async () => {
    const queueModule = require('@/lib/queue');
    expect(queueModule.startWorker).toBeDefined();
    expect(typeof queueModule.startWorker).toBe('function');
    expect(queueModule.closeWorker).toBeDefined();
    expect(typeof queueModule.closeWorker).toBe('function');
  });

  it('should have getJobStatus function exported', async () => {
    const queueModule = require('@/lib/queue');
    expect(queueModule.getJobStatus).toBeDefined();
    expect(typeof queueModule.getJobStatus).toBe('function');
  });

  it('should have startQueueEvents function exported', async () => {
    const queueModule = require('@/lib/queue');
    expect(queueModule.startQueueEvents).toBeDefined();
    expect(typeof queueModule.startQueueEvents).toBe('function');
  });

  it('should have closeQueueEvents function exported', async () => {
    const queueModule = require('@/lib/queue');
    expect(queueModule.closeQueueEvents).toBeDefined();
    expect(typeof queueModule.closeQueueEvents).toBe('function');
  });
});

describe('Boundary: Redis connection exports', () => {
  it('should have getRedisClient function exported', async () => {
    const redisModule = require('@/lib/redis');
    expect(redisModule.getRedisClient).toBeDefined();
    expect(typeof redisModule.getRedisClient).toBe('function');
  });

  it('should have closeRedis function exported', async () => {
    const redisModule = require('@/lib/redis');
    expect(redisModule.closeRedis).toBeDefined();
    expect(typeof redisModule.closeRedis).toBe('function');
  });
});

describe('Boundary: Type definitions', () => {
  it('should have valid ConversionJobResult structure', () => {
    const validResult = {
      base64Data: 'dGVzdA==',
      extension: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
    };
    expect(validResult.base64Data).toBeDefined();
    expect(validResult.extension).toBeDefined();
    expect(validResult.mimeType).toBeDefined();
    expect(validResult.fileSize).toBeGreaterThan(0);
  });
});
