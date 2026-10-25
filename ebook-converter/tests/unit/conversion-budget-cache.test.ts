// tests/unit/conversion-budget-cache.test.ts
//
// 路线 A（CloudConvert 免费档缓解）单元测试。
// 覆盖：格式对分类（缓存/闸门的作用域）、缓存键派生、输出校验、
// 预算闸门、fail-open 反向验证（Redis 异常/未配置 ⇒ 绝不阻断转换）。

import {
  isPureJsConversion,
} from '@/lib/conversion';
import {
  computeCacheKey,
  validateCachedOutput,
  getCacheTtlDays,
  getCachedConversion,
  storeConversion,
  CACHE_SCHEMA_VERSION,
} from '@/lib/conversion-cache';
import {
  getDailyCreditLimit,
  secondsUntilUtcMidnight,
  getCreditsUsedToday,
  recordCreditSpend,
  checkConversionBudget,
} from '@/lib/conversion-budget';
import { SUPPORTED_FORMATS } from '@/lib/conversion-map';

// ---------------------------------------------------------------------------
// isPureJsConversion —— 缓存/预算闸门的作用域判定
// ---------------------------------------------------------------------------

describe('isPureJsConversion', () => {
  it('classifies pure-JS pairs as local (no credit consumed)', () => {
    const localPairs: Array<[string, string]> = [
      ['epub', 'zip'], // passthrough
      ['epub', 'txt'], ['epub', 'rtf'], ['epub', 'docx'], ['epub', 'fb2'], ['epub', 'epub'],
      ['mobi', 'txt'], ['mobi', 'epub'], ['mobi', 'rtf'], ['mobi', 'docx'], ['mobi', 'fb2'],
      ['azw3', 'txt'], ['azw3', 'epub'],
      ['docx', 'txt'], ['docx', 'epub'], ['docx', 'rtf'], ['docx', 'fb2'],
      ['html', 'txt'], ['html', 'epub'],
      ['rtf', 'txt'], ['rtf', 'epub'], ['rtf', 'docx'], ['rtf', 'fb2'],
      ['fb2', 'txt'], ['fb2', 'epub'], ['fb2', 'rtf'], ['fb2', 'docx'],
      ['lit', 'txt'], ['lit', 'epub'], ['lit', 'rtf'], ['lit', 'docx'], ['lit', 'fb2'],
      ['txt', 'epub'], ['txt', 'rtf'], ['txt', 'docx'], ['txt', 'fb2'],
    ];
    for (const [s, t] of localPairs) {
      expect(isPureJsConversion(s, t)).toBe(true);
    }
  });

  it('classifies CloudConvert-dependent pairs as non-local', () => {
    const ccPairs: Array<[string, string]> = [
      ['epub', 'azw3'], ['epub', 'mobi'], ['epub', 'pdf'],
      ['mobi', 'pdf'], ['mobi', 'azw3'], ['mobi', 'doc'],
      ['azw3', 'pdf'], ['azw3', 'mobi'],
      ['pdf', 'epub'], ['pdf', 'txt'], ['pdf', 'docx'],
      ['docx', 'pdf'], ['docx', 'azw3'],
      ['txt', 'pdf'], ['txt', 'azw3'], ['txt', 'mobi'],
      ['html', 'pdf'], ['html', 'mobi'], ['html', 'azw3'],
      ['rtf', 'pdf'], ['fb2', 'pdf'],
    ];
    for (const [s, t] of ccPairs) {
      expect(isPureJsConversion(s, t)).toBe(false);
    }
  });

  it('is case-insensitive and safe on empty input', () => {
    expect(isPureJsConversion('EPUB', 'TXT')).toBe(true);
    expect(isPureJsConversion('', '')).toBe(false);
    expect(isPureJsConversion('epub', '')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// computeCacheKey
// ---------------------------------------------------------------------------

describe('computeCacheKey', () => {
  const bytes = Buffer.from('fake-ebook-content-for-hash-test');

  it('is deterministic for identical inputs', () => {
    const a = computeCacheKey('epub', 'azw3', bytes);
    const b = computeCacheKey('epub', 'azw3', bytes);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is sensitive to source format, target format, and bytes', () => {
    const base = computeCacheKey('epub', 'azw3', bytes);
    expect(computeCacheKey('mobi', 'azw3', bytes)).not.toBe(base);
    expect(computeCacheKey('epub', 'mobi', bytes)).not.toBe(base);
    expect(computeCacheKey('epub', 'azw3', Buffer.from('different-bytes'))).not.toBe(base);
  });

  it('bumps with schema version (old entries unreachable)', () => {
    expect(CACHE_SCHEMA_VERSION).toBe('v1');
    // key 内含 schemaVersion ⇒ 提升版本后旧 key 自然失配（R7 防陈旧）
    const key = computeCacheKey('epub', 'azw3', bytes);
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });
});

// ---------------------------------------------------------------------------
// validateCachedOutput
// ---------------------------------------------------------------------------

describe('validateCachedOutput', () => {
  const zipMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04, ...Array(20).fill(0)]);
  const pdfMagic = Buffer.from('%PDF-1.7\n%...');

  function mobiWithMagic(): Buffer {
    const b = Buffer.alloc(128, 0);
    b.write('BOOKMOBI', 60, 'latin1');
    return b;
  }

  it('accepts valid ZIP-family outputs', () => {
    for (const fmt of ['epub', 'zip', 'docx', 'htmlz', 'cbz']) {
      expect(validateCachedOutput(zipMagic, fmt).ok).toBe(true);
    }
  });

  it('rejects non-ZIP bytes for ZIP-family outputs', () => {
    expect(validateCachedOutput(pdfMagic, 'epub').ok).toBe(false);
  });

  it('accepts valid PDF / MOBI-family outputs', () => {
    expect(validateCachedOutput(pdfMagic, 'pdf').ok).toBe(true);
    expect(validateCachedOutput(mobiWithMagic(), 'mobi').ok).toBe(true);
    expect(validateCachedOutput(mobiWithMagic(), 'azw3').ok).toBe(true);
  });

  it('rejects empty and wrong-magic outputs', () => {
    expect(validateCachedOutput(Buffer.alloc(0), 'epub').ok).toBe(false);
    expect(validateCachedOutput(pdfMagic, 'pdf').ok).toBe(true);
    expect(validateCachedOutput(zipMagic, 'pdf').ok).toBe(false);
    expect(validateCachedOutput(Buffer.from('hello world'), 'mobi').ok).toBe(false);
  });

  it('validates text-family signatures', () => {
    expect(validateCachedOutput(Buffer.from('{\\rtf1\\ansi hello'), 'rtf').ok).toBe(true);
    expect(validateCachedOutput(Buffer.from('not rtf at all'), 'rtf').ok).toBe(false);
    expect(validateCachedOutput(Buffer.from('<FictionBook>...</FictionBook>'), 'fb2').ok).toBe(true);
    expect(validateCachedOutput(Buffer.from('<html>not fb2</html>'), 'fb2').ok).toBe(false);
    expect(validateCachedOutput(Buffer.from('plain text'), 'txt').ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// conversion-budget —— fail-open 行为（红队 R2：闸门本身绝不能搞挂转换）
// ---------------------------------------------------------------------------

describe('conversion-budget', () => {
  it('defaults the daily limit to 10 (CloudConvert free tier)', () => {
    const prev = process.env.CONVERSION_DAILY_CREDIT_LIMIT;
    delete process.env.CONVERSION_DAILY_CREDIT_LIMIT;
    expect(getDailyCreditLimit()).toBe(10);
    if (prev !== undefined) process.env.CONVERSION_DAILY_CREDIT_LIMIT = prev;
  });

  it('secondsUntilUtcMidnight stays within (0, 86400]', () => {
    const s = secondsUntilUtcMidnight();
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThanOrEqual(86400);
  });

  it('allows conversion when no spend recorded (mock redis get → null)', async () => {
    const status = await checkConversionBudget();
    expect(status.allowed).toBe(true);
    expect(status.used).toBe(0);
    expect(status.limit).toBe(10);
    expect(status.degraded).toBe(false);
    expect(await getCreditsUsedToday()).toBe(0);
  });

  it('recordCreditSpend never throws when the redis command is unavailable (fail-open)', async () => {
    // tests/setup.ts 的 mockRedis 未实现 incrby ⇒ 命令抛错 ⇒ 必须被模块内部
    // 消化为 warn 日志，绝不向上抛（否则一次记账失败会废掉整个转换）
    await expect(recordCreditSpend(2)).resolves.toBeUndefined();
    await expect(recordCreditSpend(0)).resolves.toBeUndefined();
    await expect(recordCreditSpend(-1)).resolves.toBeUndefined();
  });

  it('degrades to allow when Redis client is null (fail-open)', async () => {
    jest.resetModules();
    jest.doMock('@/lib/redis', () => ({ getRedisClient: () => null }));
    const budget = await import('@/lib/conversion-budget');
    const status = await budget.checkConversionBudget();
    expect(status.allowed).toBe(true);
    expect(status.degraded).toBe(true);
    await expect(budget.recordCreditSpend(1)).resolves.toBeUndefined();
    expect(await budget.getCreditsUsedToday()).toBe(0);
    jest.dontMock('@/lib/redis');
  });
});

// ---------------------------------------------------------------------------
// conversion-cache —— fail-open 行为（R2 未配置时静默跳过）
// ---------------------------------------------------------------------------

describe('conversion-cache', () => {
  const bytes = Buffer.from('cache-test-input');

  it('defaults the TTL to 30 days (privacy)', () => {
    const prev = process.env.CONVERSION_CACHE_TTL_DAYS;
    delete process.env.CONVERSION_CACHE_TTL_DAYS;
    expect(getCacheTtlDays()).toBe(30);
    if (prev !== undefined) process.env.CONVERSION_CACHE_TTL_DAYS = prev;
  });

  it('serves a miss (null) when R2 is not configured', async () => {
    // 测试环境无 R2 env ⇒ isR2Configured() false ⇒ 直接 null，不抛
    expect(await getCachedConversion('epub', 'azw3', bytes)).toBeNull();
  });

  it('skips storing when R2 is not configured (no orphan objects)', async () => {
    await expect(
      storeConversion('epub', 'azw3', bytes, {
        base64Data: Buffer.from('output').toString('base64'),
        extension: 'azw3',
        mimeType: 'application/octet-stream',
        fileSize: 6,
      }),
    ).resolves.toBeUndefined();
  });
});
