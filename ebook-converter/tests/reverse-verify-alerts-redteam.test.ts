// 反向验证：2026-10-31 / 2026-11-01 红队修复的告警分级（src/lib/alerts.ts）
// 纪律：凡修复必须反向验证真能救回，而非只报 PASS。
//   核心修复：把 CloudConvert「Input task has failed」（§3.5 漏检的 CC-import 级坏文件）
//   从 🚨 System 红卡降级为 ℹ️ User 灰卡，避免稀释系统告警通道（原 10-31 告警 2 误分类）。
// 验证方式：用真实告警卡原文喂 classifyAlertSeverity，断言返回 'user' 而非 'system'。
import { classifyAlertSeverity, inferLocalValidation } from '@/lib/alerts';

// 真实告警 2（2026-10-31T12:26Z，epub→azw3，曾被误判 🚨 System-side fault）：
// "CloudConvert job failed after 2 attempt(s) | engine=calibre: CloudConvert job failed:
//  Input task has failed || engine=auto: CloudConvert job failed: Input task has failed"
const REAL_ALERT2_ERROR =
  'CloudConvert job failed after 2 attempt(s) | engine=calibre: CloudConvert job failed: Input task has failed || engine=auto: CloudConvert job failed: Input task has failed';

// 真实告警 1（2026-10-31T00:39Z，epub→azw3，"Invalid zip file"，CORRUPT_INPUT）
const REAL_ALERT1_ERROR = 'CORRUPT_INPUT: Invalid zip file';

describe('alerts 分级红队反向验证 (M8-13 / M8-14)', () => {
  it('真实告警2（Input task has failed）降级灰卡 user，而非系统红卡 system', () => {
    // kind 取真实值 'conversion-error'（非 backend-unavailable）
    const sev = classifyAlertSeverity('conversion-error', REAL_ALERT2_ERROR);
    expect(sev).toBe('user');
  });

  it('双层保险：USER_SIDE_PATTERNS 命中 或 mapErrorCode→CORRUPT_INPUT 任一降级', () => {
    // 直接用原始错误消息（含大写 I/h 的 "Input task has failed"），验证大小写不敏感链路
    const sev = classifyAlertSeverity('conversion-error', REAL_ALERT2_ERROR);
    expect(sev).toBe('user');
  });

  it('对比项：真实告警1（Invalid zip file）仍灰卡 user', () => {
    const sev = classifyAlertSeverity('conversion-error', REAL_ALERT1_ERROR);
    expect(sev).toBe('user');
  });

  it('契约锁：新串（带诊断后缀仍前缀 Invalid zip file）仍被正确分级为灰卡 user', () => {
    // 2026-11-04：validateInputFile 改为 `Invalid zip file (no central directory; N bytes)`。
    // 前缀保留是硬契约——error-handler.ts 映射键与两道 includes 守卫均为子串匹配。
    // 若有人删掉前缀，本用例变红，防止静默错分为系统故障。
    const sev = classifyAlertSeverity(
      'conversion-error',
      'CORRUPT_INPUT: Invalid zip file (no central directory; 17462 bytes)',
    );
    expect(sev).toBe('user');
  });

  it('对比项：真系统故障（backend-unavailable 503）仍红卡 system', () => {
    const sev = classifyAlertSeverity('backend-unavailable', 'VPS 503 forwarding failed');
    expect(sev).toBe('system');
  });

  it('反向否定：不含用户侧签名的引擎故障仍 system（防止双层保险误伤）', () => {
    const sev = classifyAlertSeverity(
      'conversion-error',
      'CloudConvert job failed: Process terminated with non-zero exit code (convert task crashed)',
    );
    expect(sev).toBe('system');
  });
});

// ---------------------------------------------------------------------------
// 2026-11-02：告警卡必须带上「为什么没走后端」（delegation 归因）
//
// 动机（真实误诊）：Job 729f7eae 的卡片只写 `Invalid input file: too small
// (14 bytes)`，据此判断是「用户传错文件」；真实链路是 backend busy 429 →
// 回退 CloudConvert → CC 体积守卫拒收。归因方向完全相反（容量 vs 用户）。
// 反向约束：若有人删掉 delegationFallback 的渲染，本组用例变红。
// ---------------------------------------------------------------------------
import { notifyConversionFailure } from '@/lib/alerts';

describe('告警卡 delegation 归因透传（2026-11-02）', () => {
  const ENV = process.env;

  beforeEach(() => {
    process.env = { ...ENV, FEISHU_WEBHOOK_URL: 'https://feishu.test/hook' };
  });

  afterAll(() => {
    process.env = ENV;
  });

  function captureCards(): Array<Record<string, unknown>> {
    const bodies: Array<Record<string, unknown>> = [];
    global.fetch = jest.fn(async (_url: unknown, init?: RequestInit) => {
      bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      return new Response(JSON.stringify({ code: 0 }), { status: 200 });
    }) as unknown as typeof global.fetch;
    return bodies;
  }

  it('渲染 Backend delegation 行，说明是后端忙而非文件坏', async () => {
    const bodies = captureCards();
    await notifyConversionFailure({
      kind: 'conversion-error',
      jobId: 'job-attrib-1',
      sourceFormat: 'txt',
      targetFormat: 'epub',
      // 与真实告警同款错误串；错误文本不同以避免 10 分钟节流命中
      error: 'Invalid input file: too small (14 bytes) [attrib-case-1]',
      delegationFallback: 'backend busy (429) BACKEND_BUSY',
    });

    expect(bodies).toHaveLength(1);
    const card = JSON.stringify(bodies[0]);
    expect(card).toContain('Backend delegation');
    expect(card).toContain('backend busy (429) BACKEND_BUSY');
  });

  it('未提供归因时不渲染该行（不给历史调用方凭空加噪声）', async () => {
    const bodies = captureCards();
    await notifyConversionFailure({
      kind: 'conversion-error',
      jobId: 'job-attrib-2',
      sourceFormat: 'txt',
      targetFormat: 'epub',
      error: 'Invalid input file: too small (14 bytes) [attrib-case-2]',
    });

    expect(bodies).toHaveLength(1);
    expect(JSON.stringify(bodies[0])).not.toContain('Backend delegation');
  });

  it('熔断跳过也可见（区分「后端忙」与「根本没请求」）', async () => {
    const bodies = captureCards();
    await notifyConversionFailure({
      kind: 'conversion-error',
      jobId: 'job-attrib-3',
      error: 'Invalid input file: too small (14 bytes) [attrib-case-3]',
      delegationFallback: 'circuit open (delegation skipped)',
    });

    expect(JSON.stringify(bodies[0])).toContain('circuit open (delegation skipped)');
  });
});

// ---------------------------------------------------------------------------
// 2026-11-08：localValidationInferred 反推方向修正（告警 2 卡片字段错误）
//
// 动机：Job 38ac1f26（2026-11-07，epub→azw3）的卡片写
//   `Local validation (inferred, NOT measured §3.5): failed`
// 但 §3.5 实际**通过了**——错误串是 CloudConvert 的 "Input task has failed"，
// 文件是在 CC import 侧被拒的。旧逻辑按 errorCode===CORRUPT_INPUT 反推，
// 把这一整类都误标成 failed，值班人会误读成「本地校验拦下了它」。
// 反向约束：若有人把 inferLocalValidation 改回「按错误码反推」，本组用例变红。
// ---------------------------------------------------------------------------
describe('inferLocalValidation：§3.5 签名命中才标 failed（2026-11-08）', () => {
  const LOCAL_FAILURES = [
    // conversion.ts validateInputFile 逐字核对的真实签名
    'corrupt epub: ZIP member OEBPS/Misc/content0001.opf (manifest reference missing) failed deep validation — the file is damaged',
    'Invalid zip file (no central directory; 17462 bytes)',
    'Invalid or missing opf',
    'not a valid eBook format: an EPUB is a ZIP archive whose first bytes are PK\\x03\\x04. The uploaded file starts with 0x25504446.',
    'Empty input file',
  ];

  it.each(LOCAL_FAILURES)('§3.5 签名命中 ⇒ failed：%s', (msg) => {
    expect(inferLocalValidation(msg)).toBe('failed');
  });

  it('真实告警 2（Job 38ac1f26 的 CC import 拒收）⇒ passed，不再误标 failed', () => {
    const REAL_ALERT_38AC1F26 =
      'CloudConvert job failed after 1 attempt(s) | engine=calibre: CloudConvert job failed: Input task has failed';
    expect(inferLocalValidation(REAL_ALERT_38AC1F26)).toBe('passed');
  });

  it('配额耗尽 / 引擎故障等非本地校验错误 ⇒ passed', () => {
    expect(
      inferLocalValidation('CloudConvert client error 402: account out of conversion credits'),
    ).toBe('passed');
    expect(
      inferLocalValidation(
        'CloudConvert job failed: Process terminated with non-zero exit code (convert task crashed)',
      ),
    ).toBe('passed');
  });

  it('引擎侧 zip 错误（CC 返回）⇒ passed，不再误标 failed（红队审计 #4 假阳性修正）', () => {
    // CC/Calibre 引擎侧的真实错误串（conversion-backend/app/calibre.js 注释记录的
    // stderr 形态）：'ValueError: Invalid ZIP file, local header is damaged' —— 字面量
    // 与 §3.5 的 'Invalid zip file' 重叠。但引擎侧报错 ⇒ 文件必然已通过 §3.5 并到达
    // 引擎 ⇒ 语义上必须 passed。旧实现判 failed 且被本文件断言固化（假阳性契约）。
    expect(
      inferLocalValidation('CloudConvert job failed: INVALID ZIP FILE, local header is damaged'),
    ).toBe('passed');
    expect(
      inferLocalValidation(
        'CloudConvert job failed after 1 attempt(s) | engine=calibre: CloudConvert job failed: ValueError: Invalid ZIP file, local header is damaged',
      ),
    ).toBe('passed');
  });

  it('§3.5 签名匹配本身仍大小写不敏感（无 cloudconvert 前缀时）', () => {
    expect(inferLocalValidation('CORRUPT_INPUT: INVALID ZIP FILE (no central directory)')).toBe('failed');
  });

  it('包装串 Input validation failed: ⇒ failed（红队审计 #4 假阴性修正）', () => {
    // conversion.ts:433：validateInputFile 的非预期异常被包装成该前缀 ——
    // §3.5 跑了但失败，必须标 failed（旧实现漏收录此签名）。
    expect(inferLocalValidation('Input validation failed: EACCES: permission denied, open')).toBe('failed');
  });

  it('空串 / 未知错误 ⇒ passed（不凭空判死本地校验）', () => {
    expect(inferLocalValidation('')).toBe('passed');
    expect(inferLocalValidation('An unexpected error occurred')).toBe('passed');
  });
});
