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
import { SUPPORTED_FORMATS, normalizeFormat } from "@/lib/conversion-map";
import { mapErrorCode, getFriendlyMessage, sanitizeError } from "@/lib/error-handler";
import { runConversion, isPureJsConversion, type ConversionJobResult } from "@/lib/conversion";
import { notifyConversionFailure } from "@/lib/alerts";
import { MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES } from "@/lib/file-size-limit";
import { checkConversionBudget, recordCreditSpend } from "@/lib/conversion-budget";
import { getCachedConversion, storeConversion } from "@/lib/conversion-cache";

const MAX_FILE_SIZE = MAX_FILE_SIZE_BYTES;

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

export async function convertAndStream(
  formData: FormData,
  rateHeaders: Record<string, string> = {},
): Promise<NextResponse> {
  const file = formData.get("file") as File | null;
  const sourceFormat = normalizeFormat(formData.get("source_format") as string);
  const targetFormat = normalizeFormat(formData.get("target_format") as string);

  if (!file || !sourceFormat || !targetFormat) {
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

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large. Max ${MAX_FILE_SIZE_MB}MB per upload.`, code: "FILE_TOO_LARGE" },
      { status: 413, headers: rateHeaders },
    );
  }

  const jobId = crypto.randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());

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
      return buildFileResponse(cached, file.name, rateHeaders, {
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
    // 实时 Feishu 告警（节流 + 3s 超时，内部消化异常）：生产同步路径此前无任何
    // 失败告警，2026-10-01 转换 100% 失败直到 T+1 才被 GA4 日报发现。
    await notifyConversionFailure({
      kind: 'conversion-error',
      jobId,
      sourceFormat,
      targetFormat,
      error: convMsg,
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

  return buildFileResponse(result, file.name, rateHeaders, {
    "X-Conversion-Cache": usesCloudConvert ? "miss" : "bypass",
  });
}
