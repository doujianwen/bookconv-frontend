// Global mock setup for ioredis and BullMQ
const mockRedis = {
  connected: true,
  connect: () => Promise.resolve(),
  quit: () => Promise.resolve(),
  incr: () => Promise.resolve(1),
  expire: () => Promise.resolve(1),
  ttl: () => Promise.resolve(60),
  on: () => {},
};

jest.mock('@/lib/redis', () => ({
  getRedisClient: () => mockRedis,
  closeRedis: () => Promise.resolve(),
}));

jest.mock('bullmq', () => {
  const mockQueue = {
    add: () => Promise.resolve({ id: 'job-123', timestamp: Date.now(), attemptsMade: 0 }),
    getJob: () => Promise.resolve(null),
    trim: () => Promise.resolve(),
  };
  return {
    Queue: jest.fn(() => mockQueue),
    Worker: jest.fn(() => ({ on: () => {}, close: () => Promise.resolve() })),
    Job: jest.fn(),
    QueueEvents: jest.fn(() => ({ on: () => {}, close: () => Promise.resolve() })),
  };
});

process.env.UPLOAD_DIR = require('node:path').join(require('node:os').tmpdir(), 'ebook-test-uploads');
process.env.CALIBRE_PATH = 'ebook-convert-fake';
process.env.MAX_CONVERSION_RETRIES = '3';
process.env.WORKER_CONCURRENCY = '4';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.MAX_FILE_SIZE_MB = '10';
