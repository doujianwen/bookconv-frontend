// src/lib/convert-handler.ts
//
// Shared conversion request handler used by both:
//   - /api/convert            (public edge on Vercel)
//   - /api/convert-internal   (Calibre-capable backend, e.g. the VPS)
//
// Validates the upload, runs the conversion synchronously via runConversion(),
// and streams the resulting file bytes back as the HTTP response. No queue,
// no Redis, no worker — suitable for a single in-request execution.
//
// CloudConvert 免费档缓解（路线 A，2026-10-25，红队审计 v2 约束）：
//   - A1 结果缓存（conversion-cache）：同文件+同格式重复请求 0 credit；
//   - A2 每日预算闸门（conversion-budget）：全站共享池耗尽前拦截，替代硬 402；
//   - A3 优雅降级：配额类失败返回友好文案 + 本地可用格式推荐 + 重置时间。
//   三层全部 fail-open：任一依赖（R2/Redis）异常 ⇒ 行为回落到本文件加路线 A
//   之前的状态，绝不新增故障面。仅作用于会消耗 CloudConvert credit 的格式对
//   （isPureJsConversion=false）；纯 JS 路径本来就免费，不过闸门不缓存。

import { NextResponse, after } from "next/server";
import { createHash } from "node:crypto";
import { SUPPORTED_FORMATS, normalizeFormat } from "@/lib/conversion-map";
import { mapErrorCode, getFriendlyMessage, sanitizeError } from "@/lib/error-handler";
import { runConversion, isPureJsConversion, type ConversionJobResult } from "@/lib/conversion";
import { notifyConversionFailure, inferLocalValidation } from "@/lib/alerts";
import { MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES, MAX_UPLOAD_FILE_SIZE_BYTES, MAX_UPLOAD_FILE_SIZE_MB } from "@/lib/file-size-limit";
import { checkConversionBudget, recordCreditSpend } from "@/lib/conversion-budget";
import { getCachedConversion, storeConversion } from "@/lib/conversion-cache";
import { downloadFromR2, deleteFromR2 } from "@/lib/storage/r2";
import { isValidUploadKey, fileNameFromUploadKey } from "@/lib/upload-presign";
import { unsupportedConversionInfo } from "@/lib/unsupported-conversions";

const MAX_FILE_SIZE = MAX_FILE_SIZE_BYTES;

/** Options for the direct-to-R2 upload path. */
export interface ConvertOptions {
  /**
   * R2 object key minted by /api/upload/presign. When present the input bytes
   * are read back from R2 instead of from the multipart body, which is what
   * lets files larger than the Vercel 4.5MB edge limit work at all.
   */
  uploadKey?: string;
  /**
   * 本次请求 delegation 到自建后端失败的原因（2026-11-02）。
   * 由 route.ts 从 delegateToBackend 的诊断回调捕获后传入，仅用于告警卡归因：
   * 没有它，卡片只会显示降级链末端引擎的错误（如 "too small"），把值班人
   * 引向「用户传错文件」，而真实原因是后端 busy / 熔断 / 5xx。
   */
  delegationFallback?: string;
}

/**
 * Best-effort removal of a presigned upload object.
 *
 * Deliberately NOT registered on error paths: the client reuses one key across
 * retries of the same file selection, so deleting after a transient failure
 * would break the retry. Orphans on error paths are swept by an R2 lifecycle
 * rule on the `uploads/` prefix (see docs/DIRECT_UPLOAD.md).
 */
export function scheduleUploadCleanup(uploadKey?: string): void {
  if (!uploadKey) return;
  after(async () => {
    try {
      await deleteFromR2(uploadKey);
    } catch (err) {
      console.warn(
        "[convert] R2 upload cleanup failed (non-fatal):",
        err instanceof Error ? err.message : String(err),
      );
    }
  });
}

/**
 * 构造文件下载响应（Content-Disposition 的 RFC 5987 处理见下方注释）。
 * 缓存命中与真实转换共用，保证两条路径的响应字节完全一致。
 */
function buildFileResponse(
  result: ConversionJobResult,
  fileName: string,
  rateHeaders: Record<string, string>,
  extraHeaders: Record<string, string> = {},
): NextResponse {
  const outBuffer = Buffer.from(result.base64Data, "base64");
  const ext = result.extension || "bin";
  const mimeType = result.mimeType || "application/octet-stream";
  const baseName = fileName.replace(/\.[^.]+$/, "") || "converted";
  // RFC 5987: HTTP header values are Latin1 (ByteString). A non-ASCII file name
  // (e.g. Chinese "全集.epub") crashes Header construction with "Cannot convert
  // argument to a ByteString" — this was the silent 100% conversion-failure root
  // cause (conversion succeeded, the response header step threw). Encode the real
  // name in filename*=UTF-8'' (percent-encoded, Latin1-safe) and keep an ASCII-only
  // legacy filename fallback.
  //
  // The legacy fallback must also drop the HTTP header delimiters `"` `;` `\`.
  // Filtering only non-printable-ASCII is not enough: a name like `a"b.epub`
  // yields `filename="a"b.epub"`, which closes the field early and corrupts the
  // disposition for clients that read the legacy parameter.
  const asciiBase = baseName.replace(/[^\x20-\x7E]/g, "_").replace(/["\\;]/g, "_");
  const dispositionValue =
    `attachment; filename="${asciiBase}.${ext}"; filename*=UTF-8''${encodeURIComponent(`${baseName}.${ext}`)}`;

  return new NextResponse(new Uint8Array(outBuffer), {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": dispositionValue,
      "Cache-Control": "no-store",
      ...rateHeaders,
      ...extraHeaders,
    },
  });
}

/** 当前来源格式可用的「本地免费格式」（纯 JS 路径目标集），用于配额降级推荐 */
function getLocalAlternatives(sourceFormat: string): string[] {
  return SUPPORTED_FORMATS.filter((t) => isPureJsConversion(sourceFormat, t));
}

/**
 * 输入体积守卫（2026-11-02，第二稿）。
 *
 * ⚠️ 只拦「空文件」，**不再按体积大小拒绝**。第一稿曾用 `<MIN_INPUT_BYTES`
 * 拦截 1–29 字节，2026-11-02 服务器实测证伪了该前提：
 *   - 13 字节 txt → epub：后端返回 200 + 52,555 字节合法 epub；
 *   - 0 字节 txt → epub：后端返回 200 + 75,128 字节（空书，但确实成功）。
 * 同一个文件「后端空闲时 200、后端忙时被我 400 判为无效输入」——同样输入两种
 * 裁定不自洽，且会把容量故障（后端并发锁 429）伪装成用户输入错误，掩盖真实故障。
 * 故体积阈值仅保留在 conversion.ts 深层（那条路径确实过不了引擎），不在此处前置。
 *
 * 保留 0 字节拦截的理由是**产品策略**而非「有效性判据」：空上传在任何真实场景
 * 下都意味着客户端没带上文件；返回明确 400 比让引擎产出一本空书更有用。
 * 已知取舍：0 字节 txt 在后端空闲时本可产出空 epub，此处会提前拒绝——按当前
 * 产品判断，空书没有交付价值。
 */
export function inputSizeRejection(
  bytes: number,
): { code: "UPLOAD_EMPTY"; error: string } | null {
  if (bytes === 0) {
    return { code: "UPLOAD_EMPTY", error: "Uploaded file is empty." };
  }
  return null;
}

export async function convertAndStream(
  formData: FormData,
  rateHeaders: Record<string, string> = {},
  options: ConvertOptions = {},
): Promise<NextResponse> {
  const sourceFormat = normalizeFormat(formData.get("source_format") as string);
  const targetFormat = normalizeFormat(formData.get("target_format") as string);
  const uploadKey = options.uploadKey;
  const delegationFallback = options.delegationFallback;

  if (!sourceFormat || !targetFormat) {
    return NextResponse.json(
      { error: "Missing required fields: file, source_format, target_format" },
      { status: 400, headers: rateHeaders },
    );
  }

  if (!SUPPORTED_FORMATS.includes(sourceFormat)) {
    return NextResponse.json(
      { error: `Unsupported source format: ${sourceFormat}` },
      { status: 400, headers: rateHeaders },
    );
  }
  if (!SUPPORTED_FORMATS.includes(targetFormat)) {
    return NextResponse.json(
      { error: `Unsupported target format: ${targetFormat}` },
      { status: 400, headers: rateHeaders },
    );
  }

  // 「两头堵」组合前置拦截（2026-10-28 方案 A）：自建后端白名单外 + CloudConvert
  // 无对应转换路径（官网转换页 404 实证）⇒ 不上传到 CC 白烧一次 job + 500 +
  // 一次飞书告警，直接 422 并给出替代推荐。所有路径（multipart / R2 upload_key /
  // 后端委托回退）都汇聚于此，一处拦截全覆盖。
  const unsupported = unsupportedConversionInfo(sourceFormat, targetFormat);
  if (unsupported) {
    return NextResponse.json(
      {
        error: unsupported.noticeEn,
        code: "UNSUPPORTED_CONVERSION",
        alternative: unsupported.alternativeHref,
      },
      { status: 422, headers: rateHeaders },
    );
  }

  // --- Acquire input bytes: presigned R2 object, or multipart file ---------
  // The two paths have DIFFERENT caps on purpose. Multipart is bounded by the
  // Vercel 4.5MB edge limit (MAX_FILE_SIZE_BYTES); the R2 path never touches a
  // serverless body limit, so it is bounded by MAX_UPLOAD_FILE_SIZE_BYTES.
  let buffer: Buffer;
  let fileName: string;

  if (uploadKey) {
    if (!isValidUploadKey(uploadKey)) {
      return NextResponse.json(
        { error: "Invalid upload key.", code: "INVALID_UPLOAD_KEY" },
        { status: 400, headers: rateHeaders },
      );
    }
    try {
      buffer = await downloadFromR2(uploadKey);
    } catch (r2Err) {
      console.error(
        "[convert] R2 upload download failed:",
        r2Err instanceof Error ? r2Err.message : String(r2Err),
      );
      return NextResponse.json(
        {
          error: "Uploaded file could not be retrieved. Please upload it again.",
          code: "UPLOAD_NOT_FOUND",
        },
        { status: 400, headers: rateHeaders },
      );
    }
    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "Uploaded file is empty.", code: "UPLOAD_EMPTY" },
        { status: 400, headers: rateHeaders },
      );
    }
    if (buffer.length > MAX_UPLOAD_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_UPLOAD_FILE_SIZE_MB}MB per upload.`, code: "FILE_TOO_LARGE" },
        { status: 413, headers: rateHeaders },
      );
    }
    fileName = fileNameFromUploadKey(uploadKey, sourceFormat);
  } else {
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "Missing required fields: file, source_format, target_format" },
        { status: 400, headers: rateHeaders },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_FILE_SIZE_MB}MB per upload.`, code: "FILE_TOO_LARGE" },
        { status: 413, headers: rateHeaders },
      );
    }
    buffer = Buffer.from(await file.arrayBuffer());
    fileName = file.name;
  }

  // --- 空文件守卫（2026-11-02，第二稿：只拦 0 字节）---
  // 位置论证：
  //   * 必须在 R2 / multipart 两路汇合之后——否则只堵其中一路；
  //   * 必须在缓存查询与预算闸门之前——省掉一次无意义的上游调用。
  // 不再按体积（1–29 字节）拒绝：2026-11-02 服务器实测显示后端能正常转换
  // 13 字节 txt（200 + 52KB epub），按体积拒绝会把「后端忙」伪装成「文件无效」。
  const rejected = inputSizeRejection(buffer.length);
  if (rejected) {
    return NextResponse.json(
      { error: rejected.error, code: rejected.code },
      { status: 400, headers: rateHeaders },
    );
  }

  const jobId = crypto.randomUUID();

  // 只有会消耗 CloudConvert credit 的格式对才需要缓存/记账/闸门
  const usesCloudConvert = !isPureJsConversion(sourceFormat, targetFormat);

  // --- A1: 结果缓存查询（命中 = 0 credit 消耗）---
  if (usesCloudConvert) {
    let cached: ConversionJobResult | null = null;
    try {
      cached = await getCachedConversion(sourceFormat, targetFormat, buffer);
    } catch (cacheErr) {
      // fail-open：缓存故障绝不影响转换
      console.warn(
        "[convert] cache lookup failed (fail-open):",
        cacheErr instanceof Error ? cacheErr.message : String(cacheErr),
      );
    }
    if (cached) {
      scheduleUploadCleanup(uploadKey);
      return buildFileResponse(cached, fileName, rateHeaders, {
        "X-Conversion-Cache": "hit",
      });
    }

    // --- A2: 每日额度预算闸门（全站共享池；预防性拦截，替代硬 402）---
    const budget = await checkConversionBudget();
    if (!budget.allowed) {
      // 设计内预防行为（非故障）⇒ 不发 Feishu 告警（避免每日触顶日告警刷屏，
      // 稀释真实故障的告警价值）；真实 402 的 T+0 告警仍由下方 catch 负责。
      console.warn("[convert] daily CloudConvert budget exhausted; serving graceful degradation", {
        jobId,
        sourceFormat,
        targetFormat,
        used: budget.used,
        limit: budget.limit,
      });
      return NextResponse.json(
        {
          error: getFriendlyMessage("CONVERSION_QUOTA_EXCEEDED"),
          code: "CONVERSION_QUOTA_EXCEEDED",
          retryAfterSeconds: budget.retryAfterSeconds,
          localAlternatives: getLocalAlternatives(sourceFormat),
        },
        {
          status: 429,
          headers: {
            ...rateHeaders,
            ...(budget.retryAfterSeconds
              ? { "Retry-After": String(budget.retryAfterSeconds) }
              : {}),
          },
        },
      );
    }
  }

  let result;
  try {
    result = await runConversion(
      buffer.toString("base64"),
      null,
      sourceFormat,
      targetFormat,
      jobId,
    );
  } catch (convErr) {
    // DEBUG: Log the actual error for diagnosis
    const convMsg = convErr instanceof Error ? convErr.message : String(convErr);
    console.error('[DEBUG] Conversion error:', sanitizeError(convErr));
    // 映射必须吃**原始**消息：sanitizeError 会截断到 200 字符，而 CloudConvert
    // 的失败签名（如 "This ebook is DRM encrypted"）可能落在更后面——
    // 2026-10-12 审计发现该错误串恰好 200 字符、'DRM' 在第 100 位纯属运气；
    // 若 DRM 字样被截掉，错误码会静默降级为 CLOUD_CONVERT_ERROR（"请重试"），
    // 用户会对一个永久失败的文件反复重试。
    const errorCode = mapErrorCode(convMsg);
    // 诊断字段（M8-10 Task 3，2026-10-27）：Vercel Hobby 1h 日志留存使 failedTask
    // JSON 事后不可取，故把关键归因信息直接写进告警卡。inputHash/inputSize 来自
    // 输入字节；localValidationInferred 判定 §3.5 是否真拦截了该文件——签名见
    // alerts.ts inferLocalValidation（2026-11-08 修正：旧逻辑按
    // errorCode===CORRUPT_INPUT 反推，把 CC import 拒收「Input task has failed」
    // ——文件其实已过 §3.5——也误标成 failed）。firstFailingEngine 解析自错误串
    // trail 首个 engine=XXX。
    const inputHash =
      buffer && buffer.length > 0
        ? createHash('sha256').update(buffer).digest('hex').slice(0, 12)
        : undefined;
    const inputSize = buffer ? buffer.length : undefined;
    const localValidationInferred = inferLocalValidation(convMsg);
    const engineMatch = convMsg.match(/engine=(\w+)/i);
    const firstFailingEngine = engineMatch ? engineMatch[1] : 'n/a';
    // 实时 Feishu 告警（节流 + 3s 超时，内部消化异常）：生产同步路径此前无任何
    // 失败告警，2026-10-01 转换 100% 失败直到 T+1 才被 GA4 日报发现。
    await notifyConversionFailure({
      kind: 'conversion-error',
      jobId,
      sourceFormat,
      targetFormat,
      error: convMsg,
      inputHash,
      inputSize,
      localValidationInferred,
      firstFailingEngine,
      delegationFallback,
    });
    // Surface raw error only when CC_DEBUG is explicitly enabled (prod-safe)
    const debugRaw = process.env.CC_DEBUG === '1' ? { _raw: convMsg } : {};
    // A3: 配额类失败（CloudConvert 402）⇒ 富 body：本地免费格式推荐 + 重置时间。
    // HTTP 状态码保持 500（与历史行为一致，前端既有处理不变）。
    if (errorCode === 'CONVERSION_QUOTA_EXCEEDED') {
      return NextResponse.json(
        {
          error: getFriendlyMessage(errorCode),
          code: errorCode,
          ...debugRaw,
          localAlternatives: getLocalAlternatives(sourceFormat),
        },
        { status: 500, headers: rateHeaders },
      );
    }
    return NextResponse.json(
      { error: getFriendlyMessage(errorCode), code: errorCode, ...debugRaw },
      { status: 500, headers: rateHeaders },
    );
  }

  // --- A2 记账 + A1 写缓存（仅 CloudConvert 路径）---
  // after() 保证 Serverless 实例冻结前执行完；记账/缓存失败仅日志（fail-open），
  // 已在各自模块内部消化，此处再包一层防未预期异常。
  if (usesCloudConvert) {
    const creditsUsed = result.creditsUsed ?? 1;
    after(async () => {
      try {
        await recordCreditSpend(creditsUsed);
        await storeConversion(sourceFormat, targetFormat, buffer, result);
      } catch (err) {
        console.warn(
          "[convert] post-conversion bookkeeping failed (fail-open):",
          err instanceof Error ? err.message : String(err),
        );
      }
    });
  }

  scheduleUploadCleanup(uploadKey);

  return buildFileResponse(result, fileName, rateHeaders, {
    "X-Conversion-Cache": usesCloudConvert ? "miss" : "bypass",
  });
}
