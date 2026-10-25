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
    // 声明式映射：每个策略必须在这里显式登记窗口，漏登记会让下面的覆盖率断言失败。
    //
    // 旧写法是 if/else 兜底 60s —— 兜底分支让「新增策略却忘了登记」静默通过：
    //   · feedback(600s, 反滥用) 被误判为失败，红了两周没人管 → 测试变噪声被忽略
    //   · presignApi 静默继承 60s，碰巧正确但没有任何断言保护它
    // 一个会静默接受未知输入的判据不是门禁（见 gate-discipline-audit）。
    const EXPECTED_WINDOW_MS: Record<string, number> = {
      anonymous: 60_000,
      authenticated: 60_000,
      convertApi: 60_000,
      presignApi: 60_000, // 单次转换可合法重试 presign，故与 convertApi 同窗不同额
      paymentWebhook: 60_000,
      health: 1_000,
      downloadApi: 3_600_000,
      feedback: 600_000, // 5 次/IP/10min，反滥用
    };

    // 覆盖率断言：策略集合必须与登记表完全一致（多一个、少一个都失败）
    expect(Object.keys(RATE_LIMIT_STRATEGIES).sort()).toEqual(
      Object.keys(EXPECTED_WINDOW_MS).sort()
    );

    for (const [name, expected] of Object.entries(EXPECTED_WINDOW_MS)) {
      const strategy = RATE_LIMIT_STRATEGIES[name as keyof typeof RATE_LIMIT_STRATEGIES];
      expect({ name, windowMs: strategy.windowMs }).toEqual({ name, windowMs: expected });
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
