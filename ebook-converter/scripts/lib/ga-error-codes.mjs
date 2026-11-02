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
