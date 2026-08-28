// Global mock setup for ioredis and BullMQ
const mockRedis = {
  connected: true,
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  quit: () => Promise.resolve(),
  close: () => Promise.resolve(),
  on: () => {},
  once: () => {},
  // Return values calibrated for unit tests (no live Redis required):
  keys: () => Promise.resolve([]),
  get: () => Promise.resolve(null),
  set: () => Promise.resolve('OK'),
  del: () => Promise.resolve(1),
  exists: () => Promise.resolve(0),
  incr: () => Promise.resolve(1),
  decr: () => Promise.resolve(1),
  expire: () => Promise.resolve(1),
  ttl: () => Promise.resolve(60),
  hget: () => Promise.resolve(null),
  hgetall: () => Promise.resolve({}),
  hset: () => Promise.resolve(1),
  sadd: () => Promise.resolve(1),
  smembers: () => Promise.resolve([]),
  lpush: () => Promise.resolve(1),
  rpush: () => Promise.resolve(1),
  lrange: () => Promise.resolve([]),
  llen: () => Promise.resolve(0),
  flushall: () => Promise.resolve('OK'),
  duplicate: () => mockRedis,
  pipeline: () => ({ exec: () => Promise.resolve([]) }),
  multi: () => ({ exec: () => Promise.resolve([]) }),
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
