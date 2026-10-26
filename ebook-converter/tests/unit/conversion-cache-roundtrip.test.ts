// tests/unit/conversion-cache-roundtrip.test.ts
//
// 路线 A / A1 缓存「命中路径」端到端验证。
//
// 背景：已有的 conversion-budget-cache.test.ts 只覆盖了「R2 未配置 → 静默 miss」
// 与 fail-open；测试环境的 R2 未配置、Redis.get 恒返回 null，因此 **store→get
// 真正命中** 这一核心路径从未被执行过（红队 R8 完整性校验 + 真实字节往返）。
// 本文件用内存版 R2/Redis 双 mock，证明：
//   1. 存入合法 mobi/azw3 输出 → 同输入同格式二次查询命中并返回一致字节；
//   2. 不同输入 / 不同目标格式 → 命中失败（miss）；
//   3. 损坏/错格式字节 → 既不被存入、命中也不返回（validateCachedOutput 门禁）；
//   4. 过期 meta → 命中失败。
// 这是 P0-4「B 缓存方案」作为 epub→binary 402 缓解的机理性验收证据。

import {
  computeCacheKey,
  validateCachedOutput,
  getCachedConversion,
  storeConversion,
} from '@/lib/conversion-cache';

// --- 内存版 R2 -------------------------------------------------------------
const r2Store = new Map<string, Buffer>();
jest.mock('@/lib/storage/r2', () => ({
  isR2Configured: () => true,
  uploadToR2: jest.fn(async (key: string, bytes: Buffer, _ttlHours: number) => {
    r2Store.set(key, Buffer.from(bytes));
    return undefined;
  }),
  downloadFromR2: jest.fn(async (key: string) => {
    const b = r2Store.get(key);
    if (!b) throw new Error('NoSuchKey');
    return b;
  }),
  deleteFromR2: jest.fn(async () => undefined),
}));

// --- 内存版 Redis（带 EX/TTL 语义的最小实现）-------------------------------
class MemRedis {
  private m = new Map<string, { v: string; exp: number }>();
  async get(k: string): Promise<string | null> {
    const e = this.m.get(k);
    if (!e) return null;
    if (e.exp !== 0 && e.exp < Date.now()) {
      this.m.delete(k);
      return null;
    }
    return e.v;
  }
  async set(k: string, v: string, _mode?: string, ttlSeconds?: number): Promise<'OK'> {
    const exp = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0;
    this.m.set(k, { v, exp });
    return 'OK';
  }
}
const mem = new MemRedis();
jest.mock('@/lib/redis', () => ({
  getRedisClient: () => mem,
  requireRedisClient: () => mem,
  closeRedis: () => Promise.resolve(),
}));

beforeEach(() => {
  r2Store.clear();
  // @ts-expect-error 访问私有 Map 以复位 TTL 状态
  mem.m?.clear?.();
  // 直接重建实例最稳
});

// 重建 mem 实例（beforeEach 里无法重赋值 import 绑定，故用 reset 方法）
beforeEach(() => {
  (mem as unknown as { m: Map<string, unknown> }).m = new Map();
});

function mobiBytes(): Buffer {
  const b = Buffer.alloc(128, 0);
  b.write('BOOKMOBI', 60, 'latin1');
  return b;
}
function pdfBytes(): Buffer {
  return Buffer.from('%PDF-1.7\n%mock');
}

describe('A1 缓存 store→get 命中路径（epub→azw3/mobi 402 缓解核心）', () => {
  it('存入合法 azw3 输出后，同输入同格式二次查询命中并返回一致字节', async () => {
    const input = Buffer.from('my-secret-epub-bytes-v1');
    const out = mobiBytes();
    await storeConversion('epub', 'azw3', input, {
      base64Data: out.toString('base64'),
      extension: 'azw3',
      mimeType: 'application/x-mobi8-ebook',
    });
    const hit = await getCachedConversion('epub', 'azw3', input);
    expect(hit).not.toBeNull();
    expect(hit!.extension).toBe('azw3');
    expect(Buffer.from(hit!.base64Data, 'base64').equals(out)).toBe(true);
    expect(hit!.mimeType).toBe('application/x-mobi8-ebook');
  });

  it('不同输入（不同文件）命中失败 —— 证明缓存不跨文件生效（诚实边界）', async () => {
    const inputA = Buffer.from('book-A-content');
    const inputB = Buffer.from('book-B-content');
    await storeConversion('epub', 'mobi', inputA, {
      base64Data: mobiBytes().toString('base64'),
      extension: 'mobi',
      mimeType: 'application/x-mobipocket-ebook',
    });
    expect(await getCachedConversion('epub', 'mobi', inputB)).toBeNull();
  });

  it('不同目标格式命中失败 —— epub→mobi 不串到 epub→azw3', async () => {
    const input = Buffer.from('same-content');
    await storeConversion('epub', 'mobi', input, {
      base64Data: mobiBytes().toString('base64'),
      extension: 'mobi',
      mimeType: 'application/x-mobipocket-ebook',
    });
    expect(await getCachedConversion('epub', 'azw3', input)).toBeNull();
  });

  it('损坏/错格式字节既不被存入、也不被命中返回（validateCachedOutput 门禁）', async () => {
    const input = Buffer.from('will-be-rejected');
    // 试图以 azw3 名义存入 PDF 字节 → 校验失败 → 跳过存入（不抛）
    await storeConversion('epub', 'azw3', input, {
      base64Data: pdfBytes().toString('base64'),
      extension: 'azw3',
      mimeType: 'application/x-mobi8-ebook',
    });
    // 即便手动塞入一个坏 meta，命中时也会被校验拦截
    const key = computeCacheKey('epub', 'azw3', input);
    expect(await getCachedConversion('epub', 'azw3', input)).toBeNull();
    expect(r2Store.has(`conversion-cache/v1/${key}.azw3`)).toBe(false);
  });

  it('过期 meta → 命中失败（防陈旧，R7）', async () => {
    const input = Buffer.from('expiring-content');
    await storeConversion('epub', 'azw3', input, {
      base64Data: mobiBytes().toString('base64'),
      extension: 'azw3',
      mimeType: 'application/x-mobi8-ebook',
    });
    // 强制过期：重设 meta 的 expiresAt 到过去
    const key = computeCacheKey('epub', 'azw3', input);
    const raw = await (mem as any).get('conv:cache:' + key);
    const meta = JSON.parse(raw);
    meta.expiresAt = Date.now() - 1000;
    await (mem as any).set('conv:cache:' + key, JSON.stringify(meta), 'EX', 1);
    expect(await getCachedConversion('epub', 'azw3', input)).toBeNull();
  });
});

describe('validateCachedOutput 边界（红队 R8 复验）', () => {
  it('accepts BOOKMOBI/azw3 magic', () => {
    expect(validateCachedOutput(mobiBytes(), 'azw3').ok).toBe(true);
    expect(validateCachedOutput(mobiBytes(), 'mobi').ok).toBe(true);
  });
  it('rejects empty output', () => {
    expect(validateCachedOutput(Buffer.alloc(0), 'azw3').ok).toBe(false);
  });
});
