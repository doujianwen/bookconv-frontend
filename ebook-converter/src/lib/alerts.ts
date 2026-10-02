// src/lib/alerts.ts
//
// 转换失败实时告警（同步转换路径专用，独立于队列模块）。
//
// 背景：文档（src/data/blog/env-variables-setup.ts、DEPLOYMENT.md）承诺
// FEISHU_WEBHOOK_URL 在「conversion job 失败」时收到告警，但该行为此前只挂在
// BullMQ worker 的失败回调（queue.ts notifyFailedJob）——而生产（Vercel
// Serverless）走的是 /api/convert 的请求内同步路径，worker 不存在，告警从未
// 发出。2026-10-01 转换 100% 失败的故障直到 T+1 才被 GA4 日报发现，根因即
// 此「声明 ≠ 实现」缺口。本模块把告警补到同步路径上。
//
// 约束：本文件严禁 import queue.ts / redis.ts / bullmq（模块加载副作用，
// 见 src/lib/conversion.ts 头部说明）。卡片格式与 queue.ts 保持一致。

import { loggers as log } from './logger';

/** 同类告警节流窗口：10 分钟内同一错误签名只发一次，防 webhook 风暴 */
const ALERT_COOLDOWN_MS = 10 * 60 * 1000;

// Serverless 实例级内存节流表（实例重启即清零，可接受——节流是防暴软措施）
const lastSentAt = new Map<string, number>();

export type ConversionFailureKind =
  | 'conversion-error' // /api/convert 同步执行层抛错（Calibre/CloudConvert/校验/输出验证）
  | 'backend-unavailable'; // Vercel → VPS 转发失败（503）

export interface ConversionFailureAlert {
  kind: ConversionFailureKind;
  jobId?: string;
  sourceFormat?: string;
  targetFormat?: string;
  error: string;
}

/**
 * 发送转换失败 Feishu 告警。未配置 FEISHU_WEBHOOK_URL 时静默跳过；
 * 内部带 10 分钟同类节流与 3 秒超时，调用方 await 它不会拖垮错误响应，
 * 告警自身失败也绝不影响转换主流程（所有异常内部消化）。
 */
export async function notifyConversionFailure(payload: ConversionFailureAlert): Promise<void> {
  try {
    const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
    if (!webhookUrl) return;

    // 节流：同一 kind + 错误签名（前 80 字符）在冷却窗口内只发一次
    const signature = payload.kind + ':' + (payload.error || '').slice(0, 80);
    const now = Date.now();
    if (now - (lastSentAt.get(signature) ?? 0) < ALERT_COOLDOWN_MS) return;
    lastSentAt.set(signature, now);

    const title =
      payload.kind === 'backend-unavailable'
        ? '🚨 Conversion Backend Unavailable'
        : '🚨 Conversion Failed';
    const pathLabel =
      payload.kind === 'backend-unavailable'
        ? '/api/convert → backend forward (503)'
        : '/api/convert (sync path)';
    const body = [
      '**Path:**', pathLabel, '\n',
      '**Job:**', payload.jobId || 'n/a', '\n',
      '**Format:**', `${payload.sourceFormat || '?'} → ${payload.targetFormat || '?'}`, '\n',
      '**Error:**', (payload.error || 'unknown').slice(0, 200), '\n',
      '**Time:**', new Date().toISOString(), '\n',
    ].join('');

    const msg = JSON.stringify({
      msg_type: 'interactive',
      card: {
        config: { wide_screen_mode: true },
        header: {
          title: { tag: 'plain_text', content: title },
          template: 'red' as const,
        },
        elements: [
          { tag: 'div', text: { tag: 'lark_md', content: body } },
          {
            tag: 'note',
            elements: [
              { tag: 'plain_text', content: 'Sent from sync conversion path (src/lib/alerts.ts)' },
            ],
          },
        ],
      },
    });

    // 3s 上限：告警再慢也不能拖住转换错误响应
    await Promise.race([
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: msg,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('feishu alert timeout')), 3000)),
    ]);
    log.conversion.info('Conversion failure alert sent', { kind: payload.kind });
  } catch (err) {
    log.conversion.warn('Failed to send conversion failure alert', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * 发送用户反馈到飞书（复用 FEISHU_WEBHOOK_URL 通道）。
 *
 * 与转换失败告警共用同一 webhook，但用蓝色卡片区分；每条反馈独立发送
 * （不做同类节流——反馈是用户主动提交、量级低，由路由层每 IP 限流兜底）。
 * 未配置 webhook 时静默跳过；所有异常内部消化，绝不拖垮反馈主流程。
 */
export interface UserFeedbackPayload {
  message: string;
  email?: string;
  sourceFormat?: string;
  targetFormat?: string;
  errorCode?: string;
  path?: string;
}

export async function notifyUserFeedback(payload: UserFeedbackPayload): Promise<void> {
  try {
    const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
    if (!webhookUrl) return;

    const contextLines = [
      payload.sourceFormat && payload.targetFormat
        ? `**Format:** ${payload.sourceFormat} → ${payload.targetFormat}`
        : null,
      payload.errorCode ? `**Error code:** ${payload.errorCode}` : null,
      payload.path ? `**Page:** ${payload.path}` : null,
      payload.email ? `**Reply-to:** ${payload.email}` : null,
      `**Time:** ${new Date().toISOString()}`,
    ].filter((line): line is string => Boolean(line));

    const body = [
      '**Message:**',
      (payload.message || '(empty)').slice(0, 1000),
      '',
      ...contextLines,
    ].join('\n');

    const msg = JSON.stringify({
      msg_type: 'interactive',
      card: {
        config: { wide_screen_mode: true },
        header: {
          title: { tag: 'plain_text', content: '💬 User Feedback' },
          template: 'blue' as const,
        },
        elements: [
          { tag: 'div', text: { tag: 'lark_md', content: body } },
          {
            tag: 'note',
            elements: [
              { tag: 'plain_text', content: 'Sent from feedback widget (src/lib/alerts.ts)' },
            ],
          },
        ],
      },
    });

    await Promise.race([
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: msg,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('feishu feedback timeout')), 3000),
      ),
    ]);
    log.conversion.info('User feedback alert sent');
  } catch (err) {
    log.conversion.warn('Failed to send user feedback alert', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
