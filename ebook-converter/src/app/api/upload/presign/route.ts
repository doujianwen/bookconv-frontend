// src/app/api/upload/presign/route.ts
//
// Mints a short-lived presigned PUT URL so the browser can send the file
// straight to R2, bypassing the Vercel Hobby 4.5MB edge body limit.
// See src/lib/upload-presign.ts for the full rationale.
//
// Contract
// --------
//   GET  → { enabled, maxBytes, maxMB }   capability probe, never throws
//   POST → { key, uploadUrl, method, contentType, maxBytes, expiresIn }
//          503 DIRECT_UPLOAD_UNAVAILABLE  when R2 is absent / self-hosted mode
//          400 INVALID_SOURCE_FORMAT      unknown source format
//          400 INVALID_SIZE               missing / non-positive size
//          413 FILE_TOO_LARGE             above MAX_UPLOAD_FILE_SIZE_BYTES
import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimitWithStrategy,
  getRateLimitHeaders,
  RATE_LIMIT_STRATEGIES,
} from "@/lib/rate-limit";
import { SUPPORTED_FORMATS, normalizeFormat } from "@/lib/conversion-map";
import {
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILE_SIZE_MB,
} from "@/lib/file-size-limit";
import {
  buildUploadKey,
  createPresignedPut,
  isDirectUploadEnabled,
  PRESIGN_EXPIRES_SECONDS,
} from "@/lib/upload-presign";

export const maxDuration = 15;

export async function GET() {
  // Capability probe. Returns enabled:false rather than an error so the client
  // can decide to fall back to multipart without treating it as a failure.
  return NextResponse.json({
    enabled: isDirectUploadEnabled(),
    maxBytes: MAX_UPLOAD_FILE_SIZE_BYTES,
    maxMB: MAX_UPLOAD_FILE_SIZE_MB,
  });
}

export async function POST(request: NextRequest) {
  if (!isDirectUploadEnabled()) {
    return NextResponse.json(
      {
        error: "Direct upload is not available on this deployment.",
        code: "DIRECT_UPLOAD_UNAVAILABLE",
      },
      { status: 503 },
    );
  }

  const rateResult = await checkRateLimitWithStrategy(request, "presignApi");
  const rateHeaders = getRateLimitHeaders(
    rateResult,
    RATE_LIMIT_STRATEGIES.presignApi.maxRequests,
  );

  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Too many upload requests. Please try again shortly." },
      { status: 429, headers: rateHeaders },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body.", code: "INVALID_BODY" },
      { status: 400, headers: rateHeaders },
    );
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const sourceFormat = normalizeFormat(
    typeof body.sourceFormat === "string" ? body.sourceFormat : "",
  );

  if (!sourceFormat || !SUPPORTED_FORMATS.includes(sourceFormat)) {
    return NextResponse.json(
      { error: `Unsupported source format: ${String(body.sourceFormat)}` },
      { status: 400, headers: rateHeaders },
    );
  }

  const size = Number(body.size);
  if (!Number.isFinite(size) || size <= 0) {
    return NextResponse.json(
      { error: "Missing or invalid file size.", code: "INVALID_SIZE" },
      { status: 400, headers: rateHeaders },
    );
  }

  if (size > MAX_UPLOAD_FILE_SIZE_BYTES) {
    return NextResponse.json(
      {
        error: `File too large. Max ${MAX_UPLOAD_FILE_SIZE_MB}MB per upload.`,
        code: "FILE_TOO_LARGE",
      },
      { status: 413, headers: rateHeaders },
    );
  }

  const key = buildUploadKey(sourceFormat);
  const contentType = "application/octet-stream";

  try {
    const uploadUrl = await createPresignedPut(key, contentType);
    return NextResponse.json(
      {
        key,
        uploadUrl,
        method: "PUT",
        contentType,
        maxBytes: MAX_UPLOAD_FILE_SIZE_BYTES,
        expiresIn: PRESIGN_EXPIRES_SECONDS,
      },
      { headers: rateHeaders },
    );
  } catch (err) {
    // R2 misconfiguration / transient signing failure. The client falls back to
    // the multipart path, so this is degraded service, not a user-facing error.
    console.error(
      "POST /api/upload/presign failed:",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json(
      {
        error: "Upload service temporarily unavailable.",
        code: "DIRECT_UPLOAD_UNAVAILABLE",
      },
      { status: 503, headers: rateHeaders },
    );
  }
}
