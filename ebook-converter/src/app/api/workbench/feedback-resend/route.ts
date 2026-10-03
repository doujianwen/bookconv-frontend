// src/app/api/workbench/feedback-resend/route.ts
//
// 补发「落库但飞书未送达」的反馈记录。
//
// 为什么需要：反馈投递是**尽力而为**的。webhook 未配置、机器人开了关键词
// 校验（code=19024）、网络抖动——任一环节失败都会让一条反馈写进
// user_feedback 却没进飞书群。这些记录在运营台上永远是红点，且**不会自愈**。
//
// 鉴权：复用 workbench 的 allowlist 闸门（checkWorkbenchAccess）。这不是可选的
// 装饰——端点会读取用户留言内容并向外发送，无鉴权等于把反馈数据暴露给任何
// 猜到路径的人，且可被用来向飞书群灌水。
//
// 关键纪律：只有 notifyUserFeedback 返回 true（飞书**真正**接收）才置
// delivered=true。绝不因为「已尝试」就标记成功——那正是本仓库头号失败模式
// 「静默假成功」，会让红点消失而通知从未送达。
import { NextRequest, NextResponse } from 'next/server';
import { checkWorkbenchAccess } from '@/lib/workbench/admin-guard';
import { notifyUserFeedback } from '@/lib/alerts';
import {
  getUndeliveredFeedback,
  markFeedbackDelivered,
  isFeedbackStoreConfigured,
} from '@/lib/feedback/store';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** 单次补发上限。防止 webhook 大面积失效时一次灌爆飞书群。 */
const MAX_BATCH = 20;

function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function POST(request: NextRequest) {
  const access = await checkWorkbenchAccess();
  if (!access.allowed) {
    console.warn('[workbench/feedback-resend] denied:', access.reason);
    return notFound();
  }

  if (!isFeedbackStoreConfigured()) {
    return NextResponse.json(
      { error: 'Feedback store not configured (DATABASE_URL missing)' },
      { status: 503 }
    );
  }

  let limit = MAX_BATCH;
  try {
    const body = await request.json();
    if (body && typeof body.limit === 'number') {
      limit = Math.max(1, Math.min(MAX_BATCH, Math.floor(body.limit)));
    }
  } catch {
    // body 可选：空 body = 用默认批量
  }

  const rows = await getUndeliveredFeedback(limit);
  if (rows === null) {
    return NextResponse.json({ error: 'Failed to read feedback store' }, { status: 502 });
  }

  const results: Array<{
    id: string;
    createdAt: string;
    delivered: boolean;
    preview: string;
  }> = [];
  const succeededIds: string[] = [];

  for (const row of rows) {
    const delivered = await notifyUserFeedback({
      message: row.message,
      email: row.email ?? undefined,
      sourceFormat: row.sourceFormat ?? undefined,
      targetFormat: row.targetFormat ?? undefined,
      errorCode: row.errorCode ?? undefined,
      path: row.pagePath ?? undefined,
    });
    if (delivered) succeededIds.push(row.id);
    results.push({
      id: row.id,
      createdAt: row.createdAt,
      delivered,
      preview: (row.message || '').slice(0, 60),
    });
  }

  const marked = await markFeedbackDelivered(succeededIds);

  return NextResponse.json(
    {
      attempted: results.length,
      delivered: succeededIds.length,
      failed: results.length - succeededIds.length,
      markedInDb: marked,
      results,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
