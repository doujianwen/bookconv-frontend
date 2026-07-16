describe('RATE_LIMIT_STRATEGIES', () => {
  it('should define all expected strategies', () => {
    const { RATE_LIMIT_STRATEGIES } = require('@/lib/rate-limit');
    expect(RATE_LIMIT_STRATEGIES.anonymous).toBeDefined();
    expect(RATE_LIMIT_STRATEGIES.authenticated).toBeDefined();
    expect(RATE_LIMIT_STRATEGIES.convertApi).toBeDefined();
    expect(RATE_LIMIT_STRATEGIES.paymentWebhook).toBeDefined();
    expect(RATE_LIMIT_STRATEGIES.health).toBeDefined();
  });

  it('should have reasonable limits per strategy', () => {
    const { RATE_LIMIT_STRATEGIES } = require('@/lib/rate-limit');
    expect(RATE_LIMIT_STRATEGIES.anonymous.maxRequests).toBe(60);
    expect(RATE_LIMIT_STRATEGIES.authenticated.maxRequests).toBe(300);
    expect(RATE_LIMIT_STRATEGIES.convertApi.maxRequests).toBe(20);
    expect(RATE_LIMIT_STRATEGIES.paymentWebhook.maxRequests).toBe(10);
    expect(RATE_LIMIT_STRATEGIES.health.maxRequests).toBe(999_999);
  });

  it('should use consistent 60s window for most strategies', () => {
    const { RATE_LIMIT_STRATEGIES } = require('@/lib/rate-limit');
    for (const [name, strategy] of Object.entries(RATE_LIMIT_STRATEGIES)) {
      if (name !== 'health') {
        expect(strategy.windowMs).toBe(60_000);
      }
    }
  });
});

describe('checkRateLimit', () => {
  it('should allow requests within the limit', async () => {
    const { checkRateLimit } = require('@/lib/rate-limit');
    const result = await checkRateLimit('test-user-limits', { maxRequests: 100, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  it('should skip rate limiting when Redis is down', async () => {
    const { checkRateLimit } = require('@/lib/rate-limit');
    const result = await checkRateLimit('test-skip-redis', {
      maxRequests: 10,
      windowMs: 1_000,
      skipIfRedisDown: true,
    });
    expect(result.allowed).toBe(true);
  });
});

describe('getRateLimitHeaders', () => {
  it('should include standard rate limit headers', () => {
    const { getRateLimitHeaders } = require('@/lib/rate-limit');
    const result = { allowed: true, remaining: 5, resetAt: Date.now() + 60_000 };
    const headers = getRateLimitHeaders(result, 100);
    expect(headers['X-RateLimit-Limit']).toBe('100');
    expect(headers['X-RateLimit-Remaining']).toBe('5');
    expect(headers['X-RateLimit-Reset']).toBeDefined();
  });

  it('should include Retry-After when rate limited', () => {
    const { getRateLimitHeaders } = require('@/lib/rate-limit');
    const result = { allowed: false, remaining: 0, resetAt: Date.now() + 30_000, retryAfter: 30 };
    const headers = getRateLimitHeaders(result, 100);
    expect(headers['Retry-After']).toBe('30');
  });
});
