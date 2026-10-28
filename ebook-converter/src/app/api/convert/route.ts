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
import { downloadFromR2 } from "@/lib/storage/r2";
import { fileNameFromUploadKey } from "@/lib/upload-presign";
import {
  backendConfigured,
  delegateToBackend,
  isCalibreTarget,
  shouldUseBackend,
} from "@/lib/conversion-backend-client";

export const maxDuration = 300; // Vercel Pro 支持 300s；大文件（50+页EPUB→PDF经Calibre引擎）需 60-120s 处理时间

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

      const canDelegate =
        sourceFormat && targetFormat && isCalibreTarget(targetFormat) && shouldUseBackend();

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
        const backendResp = await delegateToBackend(formData, rateHeaders, { prebuiltFile });
        if (backendResp) {
          // Backend succeeded (200 + file bytes). Returned as-is. The R2 upload
          // object is no longer needed on the happy path (the client only reuses
          // the key across retries of a FAILED conversion), so schedule the same
          // best-effort cleanup the CloudConvert path performs.
          scheduleUploadCleanup(uploadKey);
          return backendResp;
        }
        // Backend down / unsupported / timeout -> fall through to CloudConvert below.
      }

      // CloudConvert path: formats the backend can't emit, the upload_key (R2) path,
      // backend-down, or circuit-open. X-Conversion-Backend header is for MON-style
      // observability (hit vs miss).
      const ccHeaders = { ...rateHeaders, "X-Conversion-Backend": "miss-cloudconvert" };
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
