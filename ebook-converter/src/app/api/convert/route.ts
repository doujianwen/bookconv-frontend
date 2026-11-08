// src/app/api/convert/route.ts
//
// Synchronous (in-request) conversion endpoint — the public edge.
//
// Two execution modes, selected by env:
//   1. Default (no CONVERSION_BACKEND_URL): run the conversion locally via
//      convertAndStream(). Works for engine-free conversions (e.g. epub→zip
//      passthrough). Calibre-backed formats require a Calibre binary, which is
//      NOT present in Vercel's Serverless runtime.
//   2. CONVERSION_BACKEND_URL set: forward the raw upload to that Calibre-capable
//      backend's /api/convert-internal endpoint and stream its response back. This
//      lets Vercel stay the front door while the heavy lifting runs where Calibre
//      lives (the Docker/VPS image). Secret-protected via CONVERSION_INTERNAL_SECRET.
import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimitWithStrategy,
  getRateLimitHeaders,
  RATE_LIMIT_STRATEGIES,
} from "@/lib/rate-limit";
import { convertAndStream, scheduleUploadCleanup } from "@/lib/convert-handler";
import { normalizeFormat } from "@/lib/conversion-map";
import { isPureJsConversion } from "@/lib/conversion";
import { downloadFromR2 } from "@/lib/storage/r2";
import { fileNameFromUploadKey } from "@/lib/upload-presign";
import {
  backendConfigured,
  delegateToBackend,
  isCalibreTarget,
  shouldUseBackend,
} from "@/lib/conversion-backend-client";
import { readClientIp } from "@/lib/client-ip";

export const maxDuration = 300; // Vercel Pro 支持 300s；大文件（50+页EPUB→PDF经Calibre引擎）需 60-120s 处理时间

// 客户端 IP 解析已收敛到 `@/lib/client-ip`（唯一事实源，2026-11-02）。
// 为什么必须共用：这里要转发给自建后端做取证，`rate-limit.ts` 用它做限流键。
// 历史上是两份实现，限流那份退化成常量，导致全站共用一个 20 req/60s 的桶
// （实测两个不同客户端递减同一计数器）。取证与限流若各写一套，必然再次分叉。

export async function POST(request: NextRequest) {
  try {
    // --- Rate Limiting (per-IP, convertApi strategy: 20 req / 60s) ---
    const rateResult = await checkRateLimitWithStrategy(request, "convertApi");
    const rateHeaders = getRateLimitHeaders(
      rateResult,
      RATE_LIMIT_STRATEGIES.convertApi.maxRequests,
    );

    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: rateHeaders },
      );
    }

    // --- Optional delegation to a Calibre-capable backend (self-hosted, WP4 failover) ---
    if (backendConfigured()) {
      // Parse the form ONCE so we can BOTH delegate to the backend AND fall back to
      // CloudConvert. The previous design forwarded request.body and could not retry;
      // parse-once lets a backend failure degrade to the CloudConvert path instead of
      // returning a hard 503. convertAndStream accepts the already-parsed FormData.
      const formData = await request.formData();
      const sourceFormat = normalizeFormat(formData.get("source_format") as string);
      const targetFormat = normalizeFormat(formData.get("target_format") as string);
      const uploadKeyRaw = formData.get("upload_key");
      const uploadKey =
        typeof uploadKeyRaw === "string" && uploadKeyRaw.length > 0 ? uploadKeyRaw : undefined;

      // 纯 JS 已覆盖的组合不委托后端（2026-11-08）：省一次后端往返。epub→html
      // 是既有例外；epub→txt 2026-11-08 加入——此前 calibre.js 传的
      // --dont-add-chapters-to-toc 选项在 Calibre 7.6.0 中不存在，所有 X→txt 后端
      // 转换 100% 500（告警 1 根因），生产实际一直由纯 JS 路径兜底承接；修复后
      // 保持该路由不变（行为连续）。⚠️ 红队审计 #1 修正：不要把理由写成「后端
      // txt 输出带章节 TOC 噪声」——Calibre TXT 输出插件的 inline_toc 默认 False，
      // 默认并不生成目录，该说法是对不存在选项的功能臆测。
      //
      // ⚠️ 已知不对称（红队审计 #2，登记为一致性债务，本次不改）：「纯 JS 对不
      // 委托」这一原则目前只实现 2 个特例；mobi/azw3/docx/html/rtf/fb2/lit→txt
      // 等 conversion-map 标 tool:'js'（UI 展示「Pure JS, no Calibre」）的组合仍
      // 先委托后端——展示与路由不一致。统一原则会改变这些组合的输出引擎，
      // 需单独评审，不捆绑在本修复内。
      const canDelegate =
        sourceFormat && targetFormat && isCalibreTarget(targetFormat) && shouldUseBackend()
        && !(sourceFormat === 'epub' && targetFormat === 'html')
        && !(sourceFormat === 'epub' && targetFormat === 'txt');

      // Large-file path (R2 direct upload, 2026-10-28): the bytes never traverse
      // the 4.5MB Vercel inbound edge limit, so for upload_key requests we fetch
      // the object here and hand the backend client a real File. Function→backend
      // fetches are OUTBOUND and have no inbound body limit; the backend enforces
      // its own cap (currently 50MB) and a non-200 there falls back to
      // CloudConvert below. Known trade-off: if the backend then fails,
      // convertAndStream re-downloads from R2 — a rare double fetch accepted
      // instead of complicating the happy path.
      let prebuiltFile: File | undefined;
      if (canDelegate && uploadKey) {
        try {
          const buffer = await downloadFromR2(uploadKey);
          if (buffer.length > 0) {
            prebuiltFile = new File([new Uint8Array(buffer)], fileNameFromUploadKey(uploadKey, sourceFormat));
          }
          // empty buffer: skip the backend; convertAndStream returns its
          // canonical UPLOAD_EMPTY 400.
        } catch (r2Err) {
          // R2 fetch failed: skip the backend; convertAndStream re-downloads and
          // produces its own actionable 400 (UPLOAD_NOT_FOUND).
          console.warn(
            "[convert] R2 prebuilt download failed (will fall back):",
            r2Err instanceof Error ? r2Err.message : String(r2Err),
          );
        }
      }

      if (canDelegate) {
        // 捕获「为什么没走后端」，随同 convertAndStream 传给告警卡（2026-11-02）。
        // 无此信息时，卡片只显示降级链末端的错误（如 "too small"），会把容量
        // 故障误判成用户传错文件。用请求作用域的局部变量，不做模块级缓存
        // （Serverless 同实例并发会串请求）。
        let delegationFallback: string | undefined;
        const backendResp = await delegateToBackend(formData, rateHeaders, {
          prebuiltFile,
          clientIp: readClientIp(request.headers),
          onFallback: (reason) => {
            delegationFallback = reason;
          },
        });
        if (backendResp) {
          // Backend succeeded (200 + file bytes). Returned as-is. The R2 upload
          // object is no longer needed on the happy path (the client only reuses
          // the key across retries of a FAILED conversion), so schedule the same
          // best-effort cleanup the CloudConvert path performs.
          scheduleUploadCleanup(uploadKey);
          return backendResp;
        }
        // Backend down / unsupported / timeout -> fall through to CloudConvert below.
        const ccHeaders = { ...rateHeaders, "X-Conversion-Backend": isPureJsConversion(sourceFormat, targetFormat) ? "local-js" : "miss-cloudconvert" };
        return convertAndStream(formData, ccHeaders, { uploadKey, delegationFallback });
      }

      // canDelegate 为 false（目标格式不属 Calibre 白名单 / 熔断打开 /
      // epub→html 例外）：delegation 从未发生，直接走 CloudConvert。
      // X-Conversion-Backend header is for MON-style observability (hit vs miss).
      const ccHeaders = { ...rateHeaders, "X-Conversion-Backend": isPureJsConversion(sourceFormat, targetFormat) ? "local-js" : "miss-cloudconvert" };
      return convertAndStream(formData, ccHeaders, { uploadKey });
    }

    // --- Local execution (engine-free conversions) ---
    // Two input modes share this endpoint:
    //   * multipart `file`      — capped at MAX_FILE_SIZE_BYTES (Vercel 4.5MB edge)
    //   * `upload_key` (string) — object already PUT to R2 by the browser, so the
    //     request body is tiny and the edge limit no longer applies (100MB cap).
    //     Enabled whenever R2 is configured (see upload-presign); with a backend
    //     configured, whitelisted formats are first offered to the backend via an
    //     R2-fetched prebuilt File and fall back here.
    const formData = await request.formData();
    const rawUploadKey = formData.get("upload_key");
    const uploadKey =
      typeof rawUploadKey === "string" && rawUploadKey.length > 0
        ? rawUploadKey
        : undefined;
    return convertAndStream(formData, rateHeaders, { uploadKey });
  } catch (err) {
    const { sanitizeError, mapErrorCode, getFriendlyMessage } = await import("@/lib/error-handler");
    const message = sanitizeError(err);
    console.error("POST /api/convert error:", message);
    const errorCode = mapErrorCode(message);
    return NextResponse.json(
      { error: getFriendlyMessage(errorCode), code: errorCode },
      { status: 500 },
    );
  }
}
