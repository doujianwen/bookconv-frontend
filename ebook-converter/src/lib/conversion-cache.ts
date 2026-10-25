// src/lib/conversion-cache.ts
//
// 转换结果缓存（路线 A / A1，2026-10-25）。
//
// 目的：「同一输入字节 + 同一来源/目标格式」的重复请求命中缓存，0 credit 消耗，
// 把免费档 10 credits/天的有效吞吐放大（重试、热门公版书、样本文件）。
// 注意：缓存只命中**完全相同**的文件——10 个不同用户各转不同的书时命中为 0，
// 因此本模块是"缓解"而非"修复"（根治 = 自托管 Calibre 或付费，见路线 B）。
//
// 存储布局（红队 v2 R5/R7/R11）：
//   - R2 存字节，Redis 存元数据（r2Key/size/ext/mime/expiresAt，TTL 30 天）。
//     为什么不纯 R2：R2 无原生对象 TTL；Redis 元数据控过期，R2 孤儿对象由
//     Cloudflare lifecycle rule（P2 运维项）或后续定期清理回收。
//   - 禁落 Vercel 本地 FS（临时盘，实例冻结即丢）。
//   - key = sha256(source|target|schemaVersion|inputBytes)：不可逆、不可枚举，
//     用户文件不出现在任何可预测路径（隐私/版权考量，TTL 30 天）。
//
// 校验（红队 R8）：入缓存前做轻量完整性校验（非空 + 目标格式魔数/文本签名）。
// CloudConvert 输出的完整质量门（verifyConversion）在 conversion.ts 已跑过，
// 缓存层只防"残缺/错格式字节被缓存并反复分发"。
//
// fail-open：R2/Redis 任一环节异常 ⇒ 视为未命中/不缓存，绝不阻断转换。
// Redis 不可用时连 R2 都不写（避免产生永远无法命中的孤儿对象）。

import { createHash } from 'node:crypto';
import { isR2Configured, uploadToR2, downloadFromR2 } from './storage/r2';
import { getRedisClient } from './redis';
import { loggers as log } from './logger';

/** 缓存结构版本：变更 key 派生规则或 meta 格式时提升，旧缓存自然失效（R7） */
export const CACHE_SCHEMA_VERSION = 'v1';
const R2_KEY_PREFIX = `conversion-cache/${CACHE_SCHEMA_VERSION}`;
const REDIS_META_PREFIX = 'conv:cache:';
const DEFAULT_TTL_DAYS = 30;

/** 缓存 TTL（天，env 可调）。隐私/版权：用户上传内容不做长期留存。 */
export function getCacheTtlDays(): number {
  const raw = process.env.CONVERSION_CACHE_TTL_DAYS;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_DAYS;
}

/** 缓存键：sha256(来源格式|目标格式|schemaVersion|输入字节) → 64 hex */
export function computeCacheKey(sourceFormat: string, targetFormat: string, input: Buffer): string {
  const hash = createHash('sha256');
  hash.update(`${String(sourceFormat).toLowerCase()}|${String(targetFormat).toLowerCase()}|${CACHE_SCHEMA_VERSION}`);
  hash.update(input);
  return hash.digest('hex');
}

/** ZIP 容器族（EPUB/DOCX/HTMLZ/CBZ/Kepub 都是 PK 开头） */
const ZIP_FORMATS = new Set(['epub', 'zip', 'docx', 'htmlz', 'cbz', 'kepub', 'oeb']);
const MOBI_FORMATS = new Set(['mobi', 'azw3', 'azw', 'lit', 'pdb', 'lrf', 'rb']);
const TEXT_FORMATS = new Set(['txt', 'rtf', 'fb2', 'html', 'xml', 'shtml', 'txtz']);

/**
 * 轻量输出校验：防残缺/错格式字节进缓存（R8）。
 * 已知格式查魔数；未知格式只查非空。校验失败 ⇒ 不缓存（不抛错）。
 */
export function validateCachedOutput(
  buffer: Buffer,
  targetFormat: string,
): { ok: boolean; reason?: string } {
  const fmt = String(targetFormat).toLowerCase();
  if (!buffer || buffer.length === 0) {
    return { ok: false, reason: 'empty output' };
  }

  if (TEXT_FORMATS.has(fmt)) {
    if (fmt === 'rtf' && !buffer.subarray(0, 5).toString('latin1').startsWith('{\\rtf')) {
      return { ok: false, reason: 'not an RTF document' };
    }
    if (fmt === 'fb2' && !buffer.subarray(0, 256).toString('latin1').includes('FictionBook')) {
      return { ok: false, reason: 'not a FictionBook document' };
    }
    if (fmt === 'txtz' && !(buffer[0] === 0x1f && buffer[1] === 0x8b)) {
      return { ok: false, reason: 'not a gzip container' };
    }
    return { ok: true };
  }

  if (ZIP_FORMATS.has(fmt)) {
    const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b;
    return isZip ? { ok: true } : { ok: false, reason: 'not a ZIP container' };
  }

  if (fmt === 'pdf') {
    return buffer.subarray(0, 4).toString('latin1') === '%PDF'
      ? { ok: true }
      : { ok: false, reason: 'not a PDF' };
  }

  if (MOBI_FORMATS.has(fmt)) {
    // PalmDB 标识在偏移 60（BOOKMOBI / TEXtREPLACE / TPZ3），极少数变体在开头
    const at60 = buffer.length > 71 ? buffer.subarray(60, 72).toString('latin1') : '';
    const front = buffer.subarray(0, 4).toString('latin1');
    const ok =
      at60.startsWith('BOOKMOBI') ||
      at60.startsWith('TEXtREPLACE') ||
      at60.startsWith('TPZ3') ||
      front === 'BOOK' ||
      front === 'TEXt';
    return ok ? { ok: true } : { ok: false, reason: 'not a PalmDB/MOBI container' };
  }

  if (fmt === 'cbr') {
    const head = buffer.subarray(0, 8).toString('latin1');
    return head.startsWith('Rar!') || head.startsWith('RE\x7f\x7e')
      ? { ok: true }
      : { ok: false, reason: 'not a RAR container' };
  }

  if (fmt === 'djvu') {
    return buffer.subarray(0, 4).toString('latin1') === 'AT&T'
      ? { ok: true }
      : { ok: false, reason: 'not a DjVu document' };
  }

  if (fmt === 'chm') {
    return buffer.subarray(0, 4).toString('latin1') === 'ITSF'
      ? { ok: true }
      : { ok: false, reason: 'not a CHM archive' };
  }

  if (fmt === 'doc') {
    // OLE2 复合文档
    const ole2 = buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0;
    return ole2 ? { ok: true } : { ok: false, reason: 'not an OLE2 document' };
  }

  if (fmt === 'jpg' || fmt === 'jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8
      ? { ok: true }
      : { ok: false, reason: 'not a JPEG' };
  }

  if (fmt === 'png') {
    const png = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    return png ? { ok: true } : { ok: false, reason: 'not a PNG' };
  }

  // 未知目标格式：只查非空（fail-open 方向——漏校验的后果是不缓存，不是坏缓存）
  return { ok: true };
}

interface CacheMeta {
  r2Key: string;
  size: number;
  ext: string;
  mime: string;
  expiresAt: number;
}

/** 读缓存元数据。Redis 不可用/异常/过期一律按未命中处理。 */
async function readMeta(hash: string): Promise<CacheMeta | null> {
  try {
    const redis = getRedisClient();
    if (!redis) return null;
    const raw = await redis.get(REDIS_META_PREFIX + hash);
    if (!raw) return null;
    const meta = JSON.parse(raw) as CacheMeta;
    if (!meta?.r2Key || typeof meta.expiresAt !== 'number' || meta.expiresAt < Date.now()) {
      return null;
    }
    return meta;
  } catch {
    return null;
  }
}

export interface CachedConversionResult {
  base64Data: string;
  extension: string;
  mimeType: string;
  fileSize: number;
}

/**
 * 查询缓存。命中返回可直出给客户端的结果；任何环节失败返回 null（fail-open）。
 */
export async function getCachedConversion(
  sourceFormat: string,
  targetFormat: string,
  input: Buffer,
): Promise<CachedConversionResult | null> {
  if (!isR2Configured()) return null;
  try {
    const hash = computeCacheKey(sourceFormat, targetFormat, input);
    const meta = await readMeta(hash);
    if (!meta) return null;
    const bytes = await downloadFromR2(meta.r2Key);
    const verdict = validateCachedOutput(bytes, targetFormat);
    if (!verdict.ok) {
      log.conversion.warn('cached output failed validation; serving as miss', {
        targetFormat,
        reason: verdict.reason,
      });
      return null;
    }
    log.conversion.info('conversion cache hit', { targetFormat, size: bytes.length });
    return {
      base64Data: bytes.toString('base64'),
      extension: meta.ext,
      mimeType: meta.mime,
      fileSize: bytes.length,
    };
  } catch (err) {
    log.conversion.warn('cache lookup failed (fail-open, serving as miss)', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * 写入缓存。R2 未配置 / Redis 不可用（无法建索引，会产孤儿）/ 校验失败 ⇒ 跳过。
 * 任何异常只记日志，绝不抛出（fail-open）。
 *
 * result 取 ConversionJobResult 结构（fileSize 可选）：字节数以实际 buffer
 * 长度重算，调用方不必保证该字段存在。
 */
export async function storeConversion(
  sourceFormat: string,
  targetFormat: string,
  input: Buffer,
  result: Pick<CachedConversionResult, 'base64Data' | 'extension' | 'mimeType'> & {
    fileSize?: number;
  },
): Promise<void> {
  if (!isR2Configured()) return;
  try {
    const redis = getRedisClient();
    // Redis 是缓存的索引：没有索引就不写 R2（避免永远命不中的孤儿对象）
    if (!redis) return;

    const bytes = Buffer.from(result.base64Data, 'base64');
    const verdict = validateCachedOutput(bytes, targetFormat);
    if (!verdict.ok) {
      log.conversion.warn('refusing to cache output that failed validation', {
        targetFormat,
        reason: verdict.reason,
      });
      return;
    }

    const hash = computeCacheKey(sourceFormat, targetFormat, input);
    const r2Key = `${R2_KEY_PREFIX}/${hash}.${result.extension}`;
    const ttlDays = getCacheTtlDays();
    const ttlSeconds = ttlDays * 86_400;
    const expiresAt = Date.now() + ttlSeconds * 1000;

    await uploadToR2(r2Key, bytes, ttlDays * 24);
    await redis.set(
      REDIS_META_PREFIX + hash,
      JSON.stringify({
        r2Key,
        size: bytes.length,
        ext: result.extension,
        mime: result.mimeType,
        expiresAt,
      } satisfies CacheMeta),
      'EX',
      ttlSeconds,
    );
    log.conversion.info('conversion cache stored', { targetFormat, size: bytes.length, ttlDays });
  } catch (err) {
    log.conversion.warn('cache store failed (fail-open, conversion unaffected)', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
