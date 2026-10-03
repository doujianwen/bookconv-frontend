// src/app/api/auth/change-password/route.ts
//
// 改密端点。此前系统只能注册、不能改密——密码只在注册那一刻写入
// auth_users，忘记密码或想轮换就只能改库。这是真实能力缺口。
//
// 鉴权模型：必须有**有效 session**（证明是账号本人）+ **校验旧密码**
// （防止 session cookie 被 XSS 窃取后就直接改密）。两道都要过。
//
// 限流：沿用 authenticated 策略（300/60s/用户），并额外加一道更严的
// 旧密码尝试限制——改密是密码喷洒（password spraying）的天然目标，
// 允许无限次猜旧密码等于把 8 位以上空间敞开。这里用 5 次/10 分钟。
import { NextRequest, NextResponse } from 'next/server';
import { authenticate, changePassword } from '@/lib/auth/storage';
import { getSession } from '@/lib/auth/session';
import {
  checkRateLimitWithStrategy,
  getRateLimitHeaders,
  RATE_LIMIT_STRATEGIES,
} from '@/lib/rate-limit';
import { z } from 'zod';

export const maxDuration = 10;

const bodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

/** 改密专用的严限流：5 次/10 分钟/用户。防密码喷洒。 */
const CHANGE_PASSWORD_MAX = 5;
const CHANGE_PASSWORD_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // ① 身份：必须是登录态
    const session = await getSession();
    if (!session?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // ② 通用限流（与全站一致的 per-user 桶）
    const rateResult = await checkRateLimitWithStrategy(request, 'authenticated', session.email);
    const rateHeaders = getRateLimitHeaders(
      rateResult,
      RATE_LIMIT_STRATEGIES.authenticated.maxRequests
    );

    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: rateHeaders }
      );
    }

    // ③ 严限流：旧密码尝试次数。这是本端点特有的防线——
    //    没有它，拿到 session 的人可以无限猜旧密码。
    const guard = await checkOldPasswordAttempts(session.email);
    if (!guard.allowed) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Try again later.' },
        { status: 429 }
      );
    }

    // ④ 入参校验
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400, headers: rateHeaders }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // ⑤ 校验旧密码——证明是账号本人，而非仅持有 session
    const auth = await authenticate(session.email, currentPassword);
    if (!auth.success) {
      recordFailedAttempt(session.email);
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401, headers: rateHeaders }
      );
    }

    // ⑥ 落库
    const result = await changePassword(session.email, newPassword);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to change password' },
        { status: 500, headers: rateHeaders }
      );
    }

    clearFailedAttempts(session.email);
    return NextResponse.json({ success: true }, { headers: rateHeaders });
  } catch (error) {
    console.error('[auth/change-password] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── 旧密码尝试计数 ─────────────────────────────────────────────────────────────
// 实例级内存计数。serverless 下不跨实例共享，但这是抬升攻击成本的软措施，
// 不是唯一防线——真正兜底的是「必须持有有效 session」+ 强密码要求。
// 与 alerts.ts 的节流表同一取舍：实例重启清零可接受。
const attempts = new Map<string, { count: number; resetAt: number }>();

async function checkOldPasswordAttempts(email: string): Promise<{ allowed: boolean }> {
  const rec = attempts.get(email);
  if (!rec || Date.now() > rec.resetAt) {
    attempts.delete(email);
    return { allowed: true };
  }
  return { allowed: rec.count < CHANGE_PASSWORD_MAX };
}

function recordFailedAttempt(email: string): void {
  const now = Date.now();
  const rec = attempts.get(email);
  if (!rec || now > rec.resetAt) {
    attempts.set(email, { count: 1, resetAt: now + CHANGE_PASSWORD_WINDOW_MS });
    return;
  }
  rec.count += 1;
}

function clearFailedAttempts(email: string): void {
  attempts.delete(email);
}
