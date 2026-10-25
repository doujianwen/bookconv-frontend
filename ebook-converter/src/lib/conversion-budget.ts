// src/lib/conversion-budget.ts
//
// CloudConvert 每日 credit 预算闸门（路线 A / A2，2026-10-25）。
//
// 背景：CloudConvert 免费档 = 10 credits/天（UTC 日重置），且是**全站共享池**。
// 2026-10-25 CC 控制台实测：近 6 天中 5 天全额耗尽（Remaining=0）⇒ 402 复发是
// 结构性的，单一重度用户/脚本可在数秒内耗尽全天配额，让真实用户全部撞 402。
//
// credits ≠ 转换次数（官方计费模型，已核实）：每种转换有基础 credit 成本
// （General=1，Office→PDF=2，PDF→Office=4…），超过 1 分钟的转换按分钟追加，
// 仅成功转换计费。因此本模块记账按**调用方传入的真实消耗**（CloudConvert
// 任务返回的 credits 字段），绝不可按 "+1 次" 估算。
//
// 设计约束（红队审计 v2）：
//   - 记账用 Redis INCRBY 原子累加，key 按 UTC 日隔离，TTL 到当日结束；
//   - fail-open：Redis 未配置 / 连接失败 / 命令异常 ⇒ 一律视为"无预算数据"，
//     允许转换（降级为直连 CC 的现状行为）——闸门本身绝不能搞挂转换；
//   - 阈值可 env 覆盖（CONVERSION_DAILY_CREDIT_LIMIT），默认 10 = 免费档上限；
//   - 拦截是**设计内预防行为**（非故障）⇒ 调用方不应发故障告警，避免每日
//     触顶日告警刷屏；真实 402 的 T+0 告警仍由 alerts.ts 负责。

import { getRedisClient } from './redis';
import { loggers as log } from './logger';

const REDIS_KEY_PREFIX = 'conv:budget:';
const DEFAULT_DAILY_CREDIT_LIMIT = 10; // CloudConvert Free plan: 10 credits/day, UTC reset

/** 每日 credit 上限（env 可调；非法值回落默认 10） */
export function getDailyCreditLimit(): number {
  const raw = process.env.CONVERSION_DAILY_CREDIT_LIMIT;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_CREDIT_LIMIT;
}

/** 当日预算计数器的 Redis key（UTC 日隔离，与 CC 的每日重置对齐） */
export function utcDayKey(): string {
  return `${REDIS_KEY_PREFIX}${new Date().toISOString().slice(0, 10)}`;
}

/** 距下一个 UTC 0 点的秒数（Retry-After / TTL 用） */
export function secondsUntilUtcMidnight(): number {
  return 86400 - Math.floor((Date.now() % 86_400_000) / 1000);
}

/**
 * 今日已消耗的 credits。任何异常按 0 返回（fail-open：无数据不拦截）。
 */
export async function getCreditsUsedToday(): Promise<number> {
  try {
    const redis = getRedisClient();
    if (!redis) return 0;
    const raw = await redis.get(utcDayKey());
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

/**
 * 记录一次成功转换的真实 credit 消耗（CC 任务返回的 credits，缺省 1）。
 * 失败只记日志，绝不抛出（fail-open）。
 */
export async function recordCreditSpend(credits: number): Promise<void> {
  if (!Number.isFinite(credits) || credits <= 0) return;
  try {
    const redis = getRedisClient();
    if (!redis) return;
    const key = utcDayKey();
    const total = await redis.incrby(key, Math.round(credits));
    // 每次刷新 TTL 到当日结束（幂等；首日由 incrby 后第一次 expire 生效）
    await redis.expire(key, secondsUntilUtcMidnight());
    log.conversion.info('CloudConvert credit spend recorded', {
      day: key,
      credits: Math.round(credits),
      dayTotal: total,
    });
  } catch (err) {
    log.conversion.warn('credit spend recording failed (fail-open, conversion unaffected)', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export interface ConversionBudgetStatus {
  /** false = 今日预算已耗尽，调用方应走优雅降级，不再发 CC 请求 */
  allowed: boolean;
  /** 今日已记账 credits（degraded 时为 0，不代表真实值） */
  used: number;
  limit: number;
  /** true = 预算数据不可用（Redis 故障），闸门未生效，行为等同现状 */
  degraded: boolean;
  /** 被拦截时 = 距 UTC 重置的秒数 */
  retryAfterSeconds?: number;
}

/**
 * 转换前检查：今日已用 credits 是否达到上限。
 * fail-open：Redis 不可用 ⇒ allowed: true, degraded: true。
 */
export async function checkConversionBudget(): Promise<ConversionBudgetStatus> {
  const limit = getDailyCreditLimit();
  try {
    const redis = getRedisClient();
    if (!redis) {
      return { allowed: true, used: 0, limit, degraded: true };
    }
    const used = await getCreditsUsedToday();
    if (used >= limit) {
      return {
        allowed: false,
        used,
        limit,
        degraded: false,
        retryAfterSeconds: secondsUntilUtcMidnight(),
      };
    }
    return { allowed: true, used, limit, degraded: false };
  } catch (err) {
    log.conversion.warn('budget check failed (fail-open, conversion allowed)', {
      error: err instanceof Error ? err.message : String(err),
    });
    return { allowed: true, used: 0, limit, degraded: true };
  }
}
