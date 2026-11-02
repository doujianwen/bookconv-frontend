/**
 * 空文件守卫 + 小文件归因的反向验证（2026-11-02，第二稿）。
 *
 * 事故现场（两条真实告警，Vercel Request Logs 已核验 UA=Python-urllib/3.12）：
 *   Job f3937005  html→epub   0 字节 → 500 "Either fileBuffer or inputFilePath must be provided"
 *   Job 729f7eae  txt→epub   14 字节 → 500 "Invalid input file: too small (14 bytes)"
 *
 * ⚠️ 第二稿修正了第一稿的错误前提。2026-11-02 在 HK 后端实测：
 *   - 13 字节 txt → epub：HTTP 200 + 52,555 字节合法 epub
 *   - 0 字节 txt  → epub：HTTP 200 + 75,128 字节（空书，但确实成功）
 *   - 0 字节 html → epub：HTTP 500 CONVERSION_FAILED
 * 即「小于 30 字节 = 无效输入」不成立。Job 729f7eae 的真实原因是后端并发锁忙
 * （BACKEND_BUSY 429 → 回退 CloudConvert → CC 体积守卫拒绝），属容量/降级链问题。
 * 因此**不再按体积前置拒绝**，只拦 0 字节（空上传 = 客户端没带上文件）。
 *
 * 验证纪律（项目铁律：凡修复必须反向验证真能救回，不能只报 PASS）：
 *   1) 判据真值 —— 只有 0 被拒；1/14/29/30 全部放行（防再次误伤可转换的小文件）；
 *   2) 全链路接线 —— 真喂 0 字节 File，断言 400 而非 500（旧行为是 500）；
 *   3) 归因真值 —— too small 必须保持系统侧（红卡），不得被伪装成用户输入错误。
 */
import { convertAndStream, inputSizeRejection } from '@/lib/convert-handler';
import { mapErrorCode } from '@/lib/error-handler';
import { classifyAlertSeverity } from '@/lib/alerts';
import { MIN_INPUT_BYTES } from '@/lib/file-size-limit';

/** 真实错误串（逐字取自 2026-11-02 两条告警，勿改写） */
const REAL_0B_ERROR = 'Either fileBuffer or inputFilePath must be provided';
const REAL_14B_ERROR = 'Invalid input file: too small (14 bytes)';

function formWithBytes(bytes: number, source = 'html', target = 'epub'): FormData {
  const form = new FormData();
  form.append('file', new File([new Uint8Array(bytes)], `sample.${source}`));
  form.append('source_format', source);
  form.append('target_format', target);
  return form;
}

describe('inputSizeRejection 判据真值（只拦空文件）', () => {
  it('0 字节 → UPLOAD_EMPTY', () => {
    expect(inputSizeRejection(0)).toEqual({
      code: 'UPLOAD_EMPTY',
      error: 'Uploaded file is empty.',
    });
  });

  it.each([1, 14, 29, MIN_INPUT_BYTES, 1024])(
    '%i 字节放行（后端可转换小文件，禁止前置误伤）',
    (bytes) => {
      expect(inputSizeRejection(bytes)).toBeNull();
    },
  );

  it('回归护栏：14 字节必须放行（第一稿曾错误拦截，实测后端返回 200）', () => {
    // 这条断言存在的意义：任何把体积阈值重新搬回边缘的改动，都必须先推翻
    // 「13 字节 txt → 52KB epub」的实测证据。
    expect(inputSizeRejection(14)).toBeNull();
  });
});

describe('convertAndStream 全链路接线（旧行为是 500 + 红卡）', () => {
  it('0 字节 → 400 UPLOAD_EMPTY，不再是 500', async () => {
    const res = await convertAndStream(formWithBytes(0));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('UPLOAD_EMPTY');
    expect(body.error).toBeTruthy();
  });

  it('缺 file 字段仍走原有 400（守卫未顶掉既有校验）', async () => {
    const form = new FormData();
    form.append('source_format', 'html');
    form.append('target_format', 'epub');
    const res = await convertAndStream(form);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Missing required fields/);
  });
});

describe('归因真值（too small 属容量/降级链，不是用户输入错误）', () => {
  it('真实 14B 错误串 → INPUT_TOO_SMALL（而非 INTERNAL_ERROR）', () => {
    expect(mapErrorCode(REAL_14B_ERROR)).toBe('INPUT_TOO_SMALL');
  });

  it('真实 14B 错误串仍判 system 红卡（后端忙 + 回退引擎拒绝 = 我方容量问题）', () => {
    // 反向约束：若把它判成 user 灰卡，后端并发锁打满时全站会被静默降级而无人察知。
    expect(classifyAlertSeverity('conversion-error', REAL_14B_ERROR)).toBe('system');
  });

  it('反向否定：0B 的深层错误串判 system（null buffer 属编程缺陷）', () => {
    // 2026-11-02 已把 conversion.ts 的 `!fileBuffer` 改成 null 判定：正常路径下
    // 空 buffer 会走「too small (0 bytes)」，此串只应出现在真的没传 buffer 时。
    expect(classifyAlertSeverity('conversion-error', REAL_0B_ERROR)).toBe('system');
  });

  it('真系统故障仍是红卡', () => {
    expect(classifyAlertSeverity('conversion-error', 'CloudConvert job failed: Process terminated'))
      .toBe('system');
  });
});
