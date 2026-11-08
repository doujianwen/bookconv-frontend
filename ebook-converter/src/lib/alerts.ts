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
// 2026-10-02 二次根因：告警虽已补上，但**从未真正送达**——飞书自定义机器人
// 开启了「自定义关键词」安全设置，卡片内容不含关键词时飞书返回
// code=19024 (Key Words Not Found) 拒收；而旧实现只发不读响应体，把拒收也记成
// "sent"，形成「静默假成功」。反馈卡片与转换失败告警**双双空转**却无人察觉。
// 修复：① 统一 postFeishuCard() 解析并校验飞书响应体，非 0 记 error 并返回
// false；② withKeyword() 支持 FEISHU_WEBHOOK_KEYWORD 注入关键词；
// ③ applySignature() 支持 FEISHU_WEBHOOK_SECRET 签名校验模式。
//
// 约束：本文件严禁 import queue.ts / redis.ts / bullmq（模块加载副作用，
// 见 src/lib/conversion.ts 头部说明）。卡片格式与 queue.ts 保持一致。

import { createHmac } from 'node:crypto';
import { loggers as log } from './logger';
import { mapErrorCode, type ErrorCode } from './error-handler';

/** 同类告警节流窗口：10 分钟内同一错误签名只发一次，防 webhook 风暴 */
const ALERT_COOLDOWN_MS = 10 * 60 * 1000;

// Serverless 实例级内存节流表（实例重启即清零，可接受——节流是防暴软措施）
const lastSentAt = new Map<string, number>();

/** 飞书 webhook 请求超时——告警再慢也不能拖住主流程 */
const FEISHU_TIMEOUT_MS = 3000;

/** 飞书自定义机器人返回体（新老两套字段名都兼容） */
interface FeishuBotResponse {
  code?: number;
  msg?: string;
  StatusCode?: number;
  StatusMessage?: string;
}

export type ConversionFailureKind =
  | 'conversion-error' // /api/convert 同步执行层抛错（Calibre/CloudConvert/校验/输出验证）
  | 'backend-unavailable'; // Vercel → VPS 转发失败（503）

export interface ConversionFailureAlert {
  kind: ConversionFailureKind;
  jobId?: string;
  sourceFormat?: string;
  targetFormat?: string;
  error: string;
  /**
   * 诊断字段（M8-10 Task 3，2026-10-27）：堵 Vercel Hobby 1h 日志留存导致的
   * 事后归因盲点。Vercel Hobby 运行时日志仅保留 1h，复发后无法取回 failedTask
   * JSON，故把关键诊断上下文直接写进告警卡，让每张失败卡自带归因信息。
   * 全部可选——历史调用方与 backend-unavailable 路径不传也无妨。
   */
  /** 输入文件 sha256 前 12 位（稳定指纹，用于跨复发去重/定位同一坏文件） */
  inputHash?: string;
  /** 输入文件字节数 */
  inputSize?: number;
  /**
   * 本地校验 §3.5 是否拦截了该文件的判定结果。
   * 2026-11-08 修正：不再按 errorCode===CORRUPT_INPUT 反推——那会把 CC import
   * 级拒收「Input task has failed」（文件其实**已通过** §3.5，是在引擎侧被拒）
   * 误标成 failed，值班人会误读成「本地校验拦下了它」（2026-11-07 告警
   * Job 38ac1f26 的卡片即此误标）。改为按 convMsg 是否命中 §3.5 的真实错误
   * 签名判定，见 inferLocalValidation()。2026-11-01 红队复核(F6)将标签由
   * "§3.5 pre-check" 改名为 localValidationInferred；本次修的是反推方向本身。
   * ⚠️ 历史可比性：2026-11-08 之前的卡片该字段语义是「errorCode 是否
   * CORRUPT_INPUT」，与新语义（§3.5 签名命中）在 CC-import 拒收这一子类上不同，
   * 跨日期统计时不可直接混用。
   */
  localValidationInferred?: 'passed' | 'failed' | 'unknown';
  /** 首个失败引擎（解析自错误串 trail 的首个 engine=XXX），n/a 表示无 */
  firstFailingEngine?: string;
  /**
   * 本次请求「为什么没走后端」。2026-11-02 新增——此前该原因在
   * delegateToBackend 返回时被丢弃（只剩一行 console.warn，而 Vercel Hobby
   * 日志仅留 1h），导致告警卡只显示降级链末端的错误。
   *
   * 实证代价：Job 729f7eae 的卡片写「too small (14 bytes)」，值班人据此判定
   * 「用户传错文件」；真实链路是 backend busy 429 → 回退 CloudConvert →
   * CC 体积守卫拒收。归因方向完全相反（用户错误 vs 容量问题）。
   * 取值示例："backend busy (429) BACKEND_BUSY" / "circuit open (delegation
   * skipped)" / "backend HTTP 500" / "backend error: ..."。
   */
  delegationFallback?: string;
}

// ---------------------------------------------------------------------------
// M8-8 告警分级（2026-10-21）
//
// 背景 = 2026-10-12 DRM 告警审计 Layer 4：DRM/损坏/超限属用户侧可预期错误，
// 常见且与系统健康无关，若全部走红卡🚨会稀释 10-01 建立的告警通道信噪比
// （10 分钟节流只挡同签名，不同签名仍刷屏）。实测案例：2026-10-19 21:30
// Job 75c75593 (CORRUPT_INPUT) 仍走红色 🚨 卡片。
//
// 分级判据（单一来源 = error-handler 的 mapErrorCode，避免第二套模式漂移）：
//   系统侧 → 红卡 🚨：backend-unavailable / CONVERSION_QUOTA_EXCEEDED /
//           CONVERSION_TIMEOUT / CONVERSION_UNAVAILABLE
//   用户侧 → 灰卡 ℹ️：DRM_PROTECTED / CORRUPT_INPUT / FILE_TOO_LARGE /
//           VERIFICATION_FAILED
//   未识别 → 红卡（fail-closed：宁可多报，绝不漏报系统故障）
// ---------------------------------------------------------------------------

const USER_SIDE_ERROR_CODES: ReadonlySet<ErrorCode> = new Set<ErrorCode>([
  'DRM_PROTECTED',
  'CORRUPT_INPUT',
  'FILE_TOO_LARGE',
  'VERIFICATION_FAILED',
  // 2026-11-02 修订（第二稿）：只登记 UPLOAD_EMPTY。
  // 第一稿曾把 INPUT_TOO_SMALL（1–29 字节）也判为用户侧，2026-11-02 服务器实测
  // 证伪该前提：后端能正常把 13 字节 txt 转成 52KB epub（200）。这类请求失败
  // 的真实原因是「自建后端并发锁忙（BACKEND_BUSY 429）→ 回退 CloudConvert →
  // CC 的最小体积守卫拒绝」，属**容量/降级链**问题，不是用户传错文件。
  // 故 INPUT_TOO_SMALL 保持系统侧（红卡），避免把容量故障伪装成用户错误。
  // UPLOAD_EMPTY 不同：0 字节上传在任何场景都意味着客户端没带上文件，由
  // convert-handler 前置 400 拦截，属用户侧。
  'UPLOAD_EMPTY',
]);

/**
 * 显式用户侧模式兜底（在 mapErrorCode 之前匹配）。
 * mapErrorCode 的覆盖盲区：①原始消息可能直接含错误码字符串（如
 * "CORRUPT_INPUT: ..."）；②FILE_TOO_LARGE 在 ERROR_CODE_MAP 无任何映射模式
 * （该 code 只在文件大小预检时直接产生，实测 2026-10-21 反向测试抓出）。
 * 注意模式选词：「exceeds」不会误伤配额消息「exceeded」（子串不同）。
 *
 * 2026-10-31 红队复核：'input task has failed'（CloudConvert 导入级失败）属**输入级
 * 损坏**而非系统宕机（10-26 Job 9dba318b、10-31 Job 8de95590 实证）——文件过本地
 * jszip 校验、却过不了 CC 导入解析。原先 fail-closed 把它判成 🚨 系统故障，稀释告警
 * 通道信噪比。2026-11-01 红队审计修正：本签名判灰**不走本 pattern 列表**，而是走
 * error-handler.ts mapErrorCode → CORRUPT_INPUT → 下方 USER_SIDE_ERROR_CODES 的
 * error-code 路径（与 API 响应同源）；此前本列表曾冗余登记该签名，已移除。
 * 注：瞬态 import 抖动若重试后仍失败，同样走灰卡——频率升高时仍可经节流观测。
 */
const USER_SIDE_PATTERNS = [
  'drm_protected',
  'corrupt_input',
  'file_too_large',
  'verification_failed',
  'drm',
  'corrupt',
  'too large',
  'size limit',
  'exceeds',
  'failed verification',
];

export type AlertSeverity = 'system' | 'user';

/**
 * 按失败种类 + 原始错误消息判定告警级别。
 * 判据顺序：显式用户侧模式 → mapErrorCode 派生 code（与 API 响应同源）。
 * 两层都未命中 user 侧 ⇒ 红卡（fail-closed）。
 */
export function classifyAlertSeverity(
  kind: ConversionFailureKind,
  rawError: string,
): AlertSeverity {
  if (kind === 'backend-unavailable') return 'system';
  const text = (rawError || '').toLowerCase();
  if (USER_SIDE_PATTERNS.some((p) => text.includes(p))) return 'user';
  return USER_SIDE_ERROR_CODES.has(mapErrorCode(rawError || '')) ? 'user' : 'system';
}

// ---------------------------------------------------------------------------
// §3.5 本地校验错误签名（2026-11-08 新增）
//
// 来源 = conversion.ts validateInputFile() 实际抛出的错误串（逐字核对）：
//   'corrupt epub: …'            §3.5 深校验（CRC / 断链 / mimetype 错）
//   'Invalid zip file …'         EOCD 缺失（前缀契约，见 tests/reverse-verify）
//   'Invalid or missing opf'     container/OPF 检查
//   'not a valid eBook format …' 魔数 / 结构前置校验
//   'Empty input file'           0 字节（convert-handler 已前置拦截，防御性保留）
//
// convMsg 只可能来自本地校验或 CloudConvert：后端（自建 Calibre）的错误只进
// delegationFallback 运维字段，不进 convMsg（见 convert-handler.ts catch 块），
// 故后端 stderr 不会污染本判定。匹配为子串且大小写不敏感。
// ---------------------------------------------------------------------------
const LOCAL_VALIDATION_SIGNATURES = [
  'corrupt epub:',
  'invalid zip file',
  'invalid or missing opf',
  'not a valid ebook format',
  'empty input file',
];

/**
 * 判定 §3.5 本地校验是否拦截了该输入。
 * 命中签名 ⇒ 'failed'（§3.5 真的运行过且拦下）；否则 ⇒ 'passed'
 * （文件已通过 §3.5，失败发生在引擎侧）。
 * 导出以便单测直接锁定签名契约（tests/reverse-verify-alerts-redteam.test.ts）。
 */
export function inferLocalValidation(convMsg: string): 'passed' | 'failed' {
  const lower = (convMsg || '').toLowerCase();
  return LOCAL_VALIDATION_SIGNATURES.some((s) => lower.includes(s)) ? 'failed' : 'passed';
}

/**
 * 飞书「自定义关键词」安全设置兼容层。
 * 若机器人开启了关键词校验，消息全文必须包含该关键词，否则飞书拒收
 * （code=19024）。通过 FEISHU_WEBHOOK_KEYWORD 注入关键词，无需改代码；
 * 未配置时原样返回（对应机器人未开启该设置，或改用签名校验的情形）。
 */
function withKeyword(text: string): string {
  const kw = (process.env.FEISHU_WEBHOOK_KEYWORD || '').trim();
  return kw ? `${kw} ${text}` : text;
}

/**
 * 飞书「签名校验」安全设置兼容层。
 * 机器人若开启签名校验，请求体必须带 timestamp + sign，否则飞书返回
 * code=19021 拒收。签名算法：HMAC-SHA256(key = `${timestamp}\n${secret}`, data = '')
 * 的 base64。通过 FEISHU_WEBHOOK_SECRET 注入；未配置时原样返回。
 */
function applySignature(body: Record<string, unknown>): Record<string, unknown> {
  const secret = (process.env.FEISHU_WEBHOOK_SECRET || '').trim();
  if (!secret) return body;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const stringToSign = `${timestamp}\n${secret}`;
  const sign = createHmac('sha256', stringToSign).update('').digest('base64');
  return { ...body, timestamp, sign };
}

/**
 * 统一的飞书卡片投递 + **响应体校验**。
 *
 * 关键修复：此前实现 `await fetch(...)` 后直接 log "sent"，从不读响应体，
 * 因此飞书以 code=19024 / 19021 / 9499 拒收时依然报告成功——即「静默假成功」
 * （本仓库头号失败模式）。现在解析飞书 JSON，非 0 或 HTTP 非 2xx 一律
 * log.error 并返回 false，让空转可被观测。
 *
 * @returns 是否真正被飞书接收（未配置 webhook 时返回 false）。
 */
async function postFeishuCard(card: Record<string, unknown>, label: string): Promise<boolean> {
  const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
  if (!webhookUrl) {
    log.conversion.warn(`Feishu ${label} skipped: FEISHU_WEBHOOK_URL not configured`);
    return false;
  }
  try {
    const body = applySignature({ msg_type: 'interactive', card });
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(FEISHU_TIMEOUT_MS),
    });
    const text = await res.text();
    let parsed: FeishuBotResponse | null = null;
    try {
      parsed = JSON.parse(text) as FeishuBotResponse;
    } catch {
      parsed = null; // 非 JSON 响应，按下方 httpStatus 判定
    }
    const code = parsed?.code ?? parsed?.StatusCode;
    if (!res.ok || (code !== undefined && code !== 0)) {
      log.conversion.error(`Feishu ${label} rejected by webhook`, {
        httpStatus: res.status,
        code,
        msg: parsed?.msg ?? parsed?.StatusMessage ?? text.slice(0, 200),
      });
      return false;
    }
    log.conversion.info(`Feishu ${label} sent`);
    return true;
  } catch (err) {
    log.conversion.warn(`Feishu ${label} failed`, {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * 发送转换失败 Feishu 告警。未配置 FEISHU_WEBHOOK_URL 时静默跳过；
 * 内部带 10 分钟同类节流与 3 秒超时，调用方 await 它不会拖垮错误响应，
 * 告警自身失败也绝不影响转换主流程（所有异常内部消化）。
 *
 * @returns 是否真正送达（供调用方决定是否落库标记 delivered）。
 */
export async function notifyConversionFailure(payload: ConversionFailureAlert): Promise<boolean> {
  // 未配置通道时直接返回（且不占用节流窗口，保持与旧行为一致）
  if (!process.env.FEISHU_WEBHOOK_URL) {
    log.conversion.warn('Conversion failure alert skipped: FEISHU_WEBHOOK_URL not configured');
    return false;
  }

  // 节流：同一 kind + 错误签名（前 80 字符）在冷却窗口内只发一次
  const signature = payload.kind + ':' + (payload.error || '').slice(0, 80);
  const now = Date.now();
  if (now - (lastSentAt.get(signature) ?? 0) < ALERT_COOLDOWN_MS) return false;
  lastSentAt.set(signature, now);

  const severity = classifyAlertSeverity(payload.kind, payload.error);
  const isUserSide = severity === 'user';
  const title =
    payload.kind === 'backend-unavailable'
      ? '🚨 Conversion Backend Unavailable'
      : isUserSide
        ? 'ℹ️ Conversion Failed (User Input)'
        : '🚨 Conversion Failed';
  const pathLabel =
    payload.kind === 'backend-unavailable'
      ? '/api/convert → backend forward (503)'
      : '/api/convert (sync path)';
  const severityLabel = isUserSide
    ? 'User input error (expected) — no action unless frequency spikes'
    : 'System-side fault — investigate now';
  const body = [
    '**Path:**', pathLabel, '\n',
    '**Severity:**', severityLabel, '\n',
    '**Job:**', payload.jobId || 'n/a', '\n',
    '**Format:**', `${payload.sourceFormat || '?'} → ${payload.targetFormat || '?'}`, '\n',
    '**Error:**', (payload.error || 'unknown').slice(0, 200), '\n',
    ...(payload.delegationFallback
      ? ['**Backend delegation:**', `fell back — ${payload.delegationFallback}`, '\n']
      : []),
    ...(payload.inputHash ? ['**Input hash:**', payload.inputHash, '\n'] : []),
    ...(payload.inputSize !== undefined
      ? ['**Input size:**', `${payload.inputSize} bytes`, '\n']
      : []),
    ...(payload.localValidationInferred
      ? ['**Local validation (inferred, NOT measured §3.5):**', payload.localValidationInferred, '\n']
      : []),
    ...(payload.firstFailingEngine
      ? ['**First engine:**', payload.firstFailingEngine, '\n']
      : []),
    '**Time:**', new Date().toISOString(), '\n',
  ].join('');

  return postFeishuCard(
    {
      config: { wide_screen_mode: true },
      header: {
        title: { tag: 'plain_text', content: withKeyword(title) },
        template: isUserSide ? 'grey' : 'red',
      },
      elements: [
        { tag: 'div', text: { tag: 'lark_md', content: withKeyword(body) } },
        {
          tag: 'note',
          elements: [
            { tag: 'plain_text', content: 'Sent from sync conversion path (src/lib/alerts.ts)' },
          ],
        },
      ],
    },
    'conversion failure alert',
  );
}

/**
 * 发送用户反馈到飞书（复用 FEISHU_WEBHOOK_URL 通道）。
 *
 * 与转换失败告警共用同一 webhook，但用蓝色卡片区分；每条反馈独立发送
 * （不做同类节流——反馈是用户主动提交、量级低，由路由层每 IP 限流兜底）。
 * 未配置 webhook 时静默跳过；所有异常内部消化，绝不拖垮反馈主流程。
 *
 * @returns 是否真正送达（路由层据此写入 delivered 标记）。
 */
export interface UserFeedbackPayload {
  message: string;
  email?: string;
  sourceFormat?: string;
  targetFormat?: string;
  errorCode?: string;
  path?: string;
}

export async function notifyUserFeedback(payload: UserFeedbackPayload): Promise<boolean> {
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

  return postFeishuCard(
    {
      config: { wide_screen_mode: true },
      header: {
        title: { tag: 'plain_text', content: withKeyword('💬 User Feedback') },
        template: 'blue',
      },
      elements: [
        { tag: 'div', text: { tag: 'lark_md', content: withKeyword(body) } },
        {
          tag: 'note',
          elements: [
            { tag: 'plain_text', content: 'Sent from feedback widget (src/lib/alerts.ts)' },
          ],
        },
      ],
    },
    'user feedback alert',
  );
}
