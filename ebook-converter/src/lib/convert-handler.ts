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

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10) * 1024 * 1024;
// 诊断标记：部署后 curl -I /api/convert 看此头是否存在，以确认本次代码是否真的上线
const CONV_BUILD = "v94a3003-poll55-dur300";

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
      { status: 400, headers: { ...rateHeaders, "X-Conv-Build": CONV_BUILD } },
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
      { status: 413, headers: { ...rateHeaders, "X-Conv-Build": CONV_BUILD } },
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
  } catch (convErr: any) {
    // DEBUG: Log the actual error for diagnosis
    console.error('[DEBUG] Conversion error:', convErr?.message || String(convErr));
    const errorCode = mapErrorCode(sanitizeError(convErr));
    // Surface raw error only when CC_DEBUG is explicitly enabled (prod-safe)
    const debugRaw = process.env.CC_DEBUG === '1' ? { _raw: convErr?.message || String(convErr) } : {};
    return NextResponse.json(
      { error: getFriendlyMessage(errorCode), code: errorCode, ...debugRaw },
      { status: 500, headers: { ...rateHeaders, "X-Conv-Build": CONV_BUILD } },
    );
  }

  const outBuffer = Buffer.from(result.base64Data, "base64");
  const ext = result.extension || "bin";
  const mimeType = result.mimeType || "application/octet-stream";
  const baseName = file.name.replace(/\.[^.]+$/, "");

  return new NextResponse(new Uint8Array(outBuffer), {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${baseName}.${ext}"`,
      "Cache-Control": "no-store",
      "X-Conv-Build": CONV_BUILD,
      ...rateHeaders,
    },
  });
}
