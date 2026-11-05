// scripts/lib/ga-error-codes.mjs
//
// GA4 conversion_failed.error_code 分类的单一事实源（scripts 侧三道门禁共用）。
//
// ⚠️ 门禁同步铁律（改能力必须同步改门禁基线）：
//   新增 error_code 时，先判定它属于哪一类（客户端拦截 / 配额 / 直传基础设施 / 引擎），
//   再同步本文件与三道消费门禁：
//     G1  ga4-redteam.mjs          B6 preUploadFailures 剥离
//     G2  ga-inspection.mjs        INFRA_CODES（否则掉 else 被算成引擎失败 → 飞书误报红卡）
//     G3  ga4-redteam-analysis.mjs NON_ENGINE + D2 infra 求和（否则 D2 漏报检查误判）
//   2026-11-02 红队实证：DIRECT_UPLOAD_FAILED 一码被三处各自硬编码，拆分时漏改
//   G3 会让每日巡检 Part D 对自己的新码自相矛盾判定
//   （详见 红队审计_直传失败三码拆分方案_2026-11-02.md）。
//
// TS 侧对应定义：src/lib/error-handler.ts ErrorCode 联合 + ERROR_MESSAGES
// （isErrorCode 单一真相）；直传错误类与映射在 src/lib/direct-upload-error.ts。

// 直传族 = 直传链路基础设施失败（presign / R2 PUT / 网络），均未发 file_upload。
// 语义归类：巡检按 INFRA（灰）展示，不计入引擎失败、不算客户端拦截。
export const DIRECT_UPLOAD_INFRA_CODES = [
  // 2026-10-31 聚合码：2026-11-02 拆分后仅作「阶段未知」兜底 + 历史数据兼容，
  // 新数据不再常态产生（但过渡期内 T-1 数据仍可能出现，三道门禁必须继续剥离）。
  "DIRECT_UPLOAD_FAILED",
  // 2026-11-02 三码拆分（GA4 维度 error_code 已注册，新增码值无需重注册）：
  "DIRECT_UPLOAD_PRESIGN_UNAVAILABLE", // presign 503：R2 env 未达运行时 / createPresignedPut 抛错
  "DIRECT_UPLOAD_PRESIGN_ERROR",       // presign 非 503 失败：400/429 限流/网络（413 已保留 FILE_TOO_LARGE）
  "DIRECT_UPLOAD_PUT_FAILED",          // R2 PUT 阶段：CORS 预检拒绝 / 网络 / 非 2xx
];

export function sumDirectUploadInfra(failedByErrorCode) {
  const fec = failedByErrorCode || {};
  return DIRECT_UPLOAD_INFRA_CODES.reduce((s, c) => s + (Number(fec[c]) || 0), 0);
}

// 用户输入类 = 请求已发出，但在**进入任何转换引擎之前**就被判定为无效输入。
//
// 2026-11-02 起因：UPLOAD_EMPTY 此前只会从 R2 路径返回 400，multipart 路径遇到
// 空文件反而抛深层错误 → 500 + INTERNAL_ERROR → 经 G2 fallthrough 计成引擎失败
// → 日报假报警。现在 multipart 也前置 400，故纳入本集合。
//
// ⚠️ INPUT_TOO_SMALL **故意不在此集合**：2026-11-02 服务器实测显示后端能把 13 字节
// txt 转成 52KB epub（200），这类请求在 CC 回退路径失败的真实原因是「后端并发锁忙
// （BACKEND_BUSY 429）→ 回退 → CC 体积守卫拒绝」，属容量/降级链问题。把它算成
// 「未进入引擎」会掩盖容量故障，因此仍按引擎侧统计。
//
// ⚠️ 新码归类纪律（同 DIRECT_UPLOAD_INFRA_CODES）：新增码若要进本集合，必须同时
// 确认 G2/G3 消费处经本文件引用，禁在门禁里再硬编码字面量。
//
// 注：不进 G1（B6 preUploadFailures 剥离）——客户端在收到 400 前已发 file_upload，
// 「完成+失败 ≤ 上传 + TOL」天然成立，不需要剥离。
export const USER_INPUT_CODES = [
  "UPLOAD_EMPTY", // 空文件：R2 路径既有码；2026-11-02 起 multipart 路径同样返回
];

// ── 告警分级（用户侧灰卡 / 系统侧红卡）────────────────────────────────
//
// 权威源 = src/lib/alerts.ts:105 USER_SIDE_ERROR_CODES（生产飞书告警卡的判据）。
// 2026-11-04 起因：GA4 巡检此前把「未进入引擎」与「告警判灰」两套语义复用同一个
// USER_INPUT_CODES，导致 CORRUPT_INPUT 被 classifyFailureSides 算进「系统侧(引擎类)/红」，
// 与生产告警卡实测的灰卡（诊断_epub转azw3_Invalid_zip_file_2026-11-03.md §4 A4）
// 直接矛盾，并在 11-03 数据上凑满 3 次触发假「🚨 引擎硬告警」。
//
// ⚠️ 语义边界（不要合并回 USER_INPUT_CODES）：
//   USER_INPUT_CODES      = 未进入任何引擎，用于 splitFailures / B6 / D2 的 engineFailed 剥离。
//   USER_SIDE_ALERT_CODES = 告警卡判用户侧，只用于展示层健康裁定与硬告警。
//   两者不是一回事：CORRUPT_INPUT / VERIFICATION_FAILED 可能已经过 Calibre 尝试
//   （后端 500 → 回退 → 本地校验才报错），若拿去剥离 engineFailed 会虚高引擎侧
//   成功率并让 Part A 与 D2 的比对口径失配。故本集合**禁止**进入 splitFailures、
//   B6 或 ga4-redteam-analysis.mjs 的 NON_ENGINE。
//
// ⚠️ 同步纪律：改 alerts.ts 的 USER_SIDE_ERROR_CODES 必须同步本集合；
//   ga-inspection.mjs 只准 import，不准再硬编码字面量。
export const USER_SIDE_ALERT_CODES = [
  "DRM_PROTECTED",
  "CORRUPT_INPUT",
  "FILE_TOO_LARGE",
  "VERIFICATION_FAILED",
  "UPLOAD_EMPTY",
];
