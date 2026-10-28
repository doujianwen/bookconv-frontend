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
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
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

// 2026-10-28: this GET is a CAPABILITY PROBE and must never be cached. It was
// getting statically prerendered at build time, so the deployed answer froze at
// whatever isR2Configured() saw during the build — after a deploy, the CDN kept
// serving a stale enabled:false for minutes (X-Vercel-Cache: STALE, Date frozen
// at build end), making the client hide the 100MB path even when the new code
// and runtime env were correct. force-dynamic + no-store make every probe a
// live evaluation against runtime env.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // Capability probe. Returns enabled:false rather than an error so the client
  // can decide to fall back to multipart without treating it as a failure.
  //
  // maxBytes/maxMB describe the largest file that can ACTUALLY be accepted
  // right now — not the configured ceiling. When direct upload is unavailable
  // the only usable path is multipart, which is bounded by the edge limit, so
  // reporting 100MB here would make the UI advertise a limit it cannot honour.
  const enabled = isDirectUploadEnabled();
  const maxBytes = enabled ? MAX_UPLOAD_FILE_SIZE_BYTES : MAX_FILE_SIZE_BYTES;
  const maxMB = enabled ? MAX_UPLOAD_FILE_SIZE_MB : MAX_FILE_SIZE_MB;

  return NextResponse.json(
    { enabled, maxBytes, maxMB },
    { headers: { "Cache-Control": "no-store" } },
  );
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
