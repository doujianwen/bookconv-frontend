// src/app/api/feedback/route.ts
//
// 用户反馈收集端点（情境化反馈组件的后端）。
// 仅接收元数据：留言 + 可选邮箱 + 格式对 + 结构化错误码 + 页面路径。
// 绝不接收文件内容或文件名（隐私红线）。
// 通知走飞书告警通道（复用 FEISHU_WEBHOOK_URL），零新依赖。

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  checkRateLimitWithStrategy,
  getRateLimitHeaders,
  RATE_LIMIT_STRATEGIES,
} from '@/lib/rate-limit';
import { notifyUserFeedback } from '@/lib/alerts';

export const maxDuration = 10;

const feedbackSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  email: z.string().trim().max(200).optional().or(z.literal('')),
  sourceFormat: z.string().trim().max(20).optional().or(z.literal('')),
  targetFormat: z.string().trim().max(20).optional().or(z.literal('')),
  errorCode: z.string().trim().max(40).optional().or(z.literal('')),
  path: z.string().trim().max(200).optional().or(z.literal('')),
  // Honeypot: real users never fill this hidden field.
  company: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rateResult = await checkRateLimitWithStrategy(request, 'feedback');
    const rateHeaders = getRateLimitHeaders(
      rateResult,
      RATE_LIMIT_STRATEGIES.feedback.maxRequests,
    );

    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: rateHeaders },
      );
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400, headers: rateHeaders },
      );
    }

    const parsed = feedbackSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid feedback payload.' },
        { status: 400, headers: rateHeaders },
      );
    }

    const data = parsed.data;

    // Honeypot tripped — pretend success, drop silently (don't tip off bots).
    if (data.company) {
      return NextResponse.json({ ok: true }, { status: 200, headers: rateHeaders });
    }

    await notifyUserFeedback({
      message: data.message,
      email: data.email || undefined,
      sourceFormat: data.sourceFormat || undefined,
      targetFormat: data.targetFormat || undefined,
      errorCode: data.errorCode || undefined,
      path: data.path || undefined,
    });

    return NextResponse.json({ ok: true }, { status: 200, headers: rateHeaders });
  } catch (err) {
    // 反馈通道自身故障绝不影响用户；静默返回成功，避免表单报错困扰用户。
    console.error('POST /api/feedback error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
