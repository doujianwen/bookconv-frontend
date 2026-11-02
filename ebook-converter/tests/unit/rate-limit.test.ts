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

// ---------------------------------------------------------------------------
// 限流标识必须按客户端区分（2026-11-02 实测事故回归）
//
// 事故形态：生产上 Next 16 已无 `request.ip`、TRUST_PROXY 未配、App Router
// 无 socket ⇒ 三个分支全部落空 ⇒ 标识恒为 `ip:unknown` ⇒ 全站共用一个桶。
// 现场证据：两个完全不同的客户端（HK IPv4 / 本机 IPv6）连续递减同一计数器
// （remaining 19 → 18 → 17 → 16）。任何人 20 次请求即可让全站转换 429。
//
// 反向约束：把 getClientIp 改回「只读 request.ip / socket」，本组立即变红。
// ---------------------------------------------------------------------------
import { getRateLimitIdentifier } from '@/lib/rate-limit';

describe('getRateLimitIdentifier（按客户端区分，2026-11-02）', () => {
  const ENV = process.env;

  beforeEach(() => {
    process.env = { ...ENV };
  });

  afterAll(() => {
    process.env = ENV;
  });

  function reqWith(map: Record<string, string>) {
    return {
      headers: {
        get(name: string): string | null {
          const key = Object.keys(map).find((k) => k.toLowerCase() === name.toLowerCase());
          return key ? map[key] : null;
        },
      },
    };
  }

  it('Vercel 运行时：不同客户端得到不同标识（共享桶的直接反例）', () => {
    process.env.VERCEL = '1';
    const hk = getRateLimitIdentifier(reqWith({ 'x-forwarded-for': '43.129.176.38' }));
    const cn = getRateLimitIdentifier(reqWith({ 'x-forwarded-for': '2401:ce20:7::7' }));
    expect(hk).toBe('ip:43.129.176.38');
    expect(cn).toBe('ip:2401:ce20:7::7');
    expect(hk).not.toBe(cn);
  });

  it('Vercel 运行时：同一个客户端得到稳定标识（不能每次请求都变，否则限流形同虚设）', () => {
    process.env.VERCEL = '1';
    const a = getRateLimitIdentifier(reqWith({ 'x-forwarded-for': '43.129.176.38' }));
    const b = getRateLimitIdentifier(reqWith({ 'x-forwarded-for': '43.129.176.38' }));
    expect(a).toBe(b);
  });

  it('Vercel 运行时：XFF 多段时取链尾（平台追加值），不受链首伪造影响', () => {
    process.env.VERCEL = '1';
    expect(
      getRateLimitIdentifier(reqWith({ 'x-forwarded-for': '1.2.3.4, 43.129.176.38' })),
    ).toBe('ip:43.129.176.38');
  });

  it('非 Vercel 且无任何 IP 来源：退化为 unknown（保持原语义，但不再是唯一可达分支）', () => {
    delete process.env.VERCEL;
    delete process.env.TRUST_PROXY;
    expect(getRateLimitIdentifier(reqWith({}))).toBe('ip:unknown');
  });

  it('已登录用户走 userId，不依赖 IP', () => {
    process.env.VERCEL = '1';
    expect(getRateLimitIdentifier(reqWith({}), 'user-123')).toBe('user:user-123');
  });
});
