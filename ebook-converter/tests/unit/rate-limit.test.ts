import { RATE_LIMIT_STRATEGIES, checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

describe('RATE_LIMIT_STRATEGIES', () => {
  it('should define all expected strategies', () => {
    expect(RATE_LIMIT_STRATEGIES.anonymous).toBeDefined();
    expect(RATE_LIMIT_STRATEGIES.authenticated).toBeDefined();
    expect(RATE_LIMIT_STRATEGIES.convertApi).toBeDefined();
    expect(RATE_LIMIT_STRATEGIES.downloadApi).toBeDefined();
    expect(RATE_LIMIT_STRATEGIES.health).toBeDefined();
  });

  it('should have reasonable limits per strategy', () => {
    expect(RATE_LIMIT_STRATEGIES.anonymous.maxRequests).toBe(60);
    expect(RATE_LIMIT_STRATEGIES.authenticated.maxRequests).toBe(300);
    expect(RATE_LIMIT_STRATEGIES.convertApi.maxRequests).toBe(20);
    expect(RATE_LIMIT_STRATEGIES.paymentWebhook.maxRequests).toBe(10);
    expect(RATE_LIMIT_STRATEGIES.health.maxRequests).toBe(999_999);
  });

  it('should use 60s window for most strategies', () => {
    for (const [name, strategy] of Object.entries(RATE_LIMIT_STRATEGIES) as [string, any][]) {
      if (name === 'health') {
        expect(strategy.windowMs).toBe(1_000);
      } else if (name === 'downloadApi') {
        expect(strategy.windowMs).toBe(3_600_000);
      } else {
        expect(strategy.windowMs).toBe(60_000);
      }
    }
  });
});

describe('checkRateLimit', () => {
  it('should allow requests within the limit', async () => {
    const result = await checkRateLimit('test-user-limits', { maxRequests: 100, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });
});

describe('getRateLimitHeaders', () => {
  it('should include standard rate limit headers', () => {
    const result = { allowed: true, remaining: 5, resetAt: Date.now() + 60_000 };
    const headers = getRateLimitHeaders(result, 100);
    expect(headers['X-RateLimit-Limit']).toBe('100');
    expect(headers['X-RateLimit-Remaining']).toBe('5');
    expect(headers['X-RateLimit-Reset']).toBeDefined();
  });

  it('should include Retry-After when rate limited', () => {
    const result = { allowed: false, remaining: 0, resetAt: Date.now() + 30_000, retryAfter: 30 };
    const headers = getRateLimitHeaders(result, 100);
    expect(headers['Retry-After']).toBe('30');
  });
});
