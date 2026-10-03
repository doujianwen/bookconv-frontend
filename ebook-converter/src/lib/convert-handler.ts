// src/lib/convert-handler.ts
//
// Shared conversion request handler used by both:
//   - /api/convert            (public edge on Vercel)
//   - /api/convert-internal   (Calibre-capable backend, e.g. the VPS)
//
// Validates the upload, runs the conversion synchronously via runConversion(),
// and streams the resulting file bytes back as the HTTP response. No queue,
// no Redis, no worker — suitable for a single in-request execution.

import { NextResponse } from "next/server";
import { SUPPORTED_FORMATS, normalizeFormat } from "@/lib/conversion-map";
import { mapErrorCode, getFriendlyMessage, sanitizeError } from "@/lib/error-handler";
import { runConversion } from "@/lib/conversion";
import { notifyConversionFailure } from "@/lib/alerts";

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10) * 1024 * 1024;

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
      { error: `File too large. Max ${process.env.MAX_FILE_SIZE_MB || "10"}MB` },
      { status: 413, headers: rateHeaders },
    );
  }

  const jobId = crypto.randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());

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
    console.error('[DEBUG] Conversion error:', convMsg);
    const errorCode = mapErrorCode(sanitizeError(convErr));
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
    return NextResponse.json(
      { error: getFriendlyMessage(errorCode), code: errorCode, ...debugRaw },
      { status: 500, headers: rateHeaders },
    );
  }

  const outBuffer = Buffer.from(result.base64Data, "base64");
  const ext = result.extension || "bin";
  const mimeType = result.mimeType || "application/octet-stream";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "converted";
  // RFC 5987: HTTP header values are Latin1 (ByteString). A non-ASCII file name
  // (e.g. Chinese "全集.epub") crashes Header construction with "Cannot convert
  // argument to a ByteString" — this was the silent 100% conversion-failure root
  // cause (conversion succeeded, the response header step threw). Encode the real
  // name in filename*=UTF-8'' (percent-encoded, Latin1-safe) and keep an ASCII-only
  // legacy filename fallback.
  const asciiBase = baseName.replace(/[^\x20-\x7E]/g, "_");
  const dispositionValue =
    `attachment; filename="${asciiBase}.${ext}"; filename*=UTF-8''${encodeURIComponent(`${baseName}.${ext}`)}`;

  return new NextResponse(new Uint8Array(outBuffer), {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": dispositionValue,
      "Cache-Control": "no-store",
      ...rateHeaders,
    },
  });
}
