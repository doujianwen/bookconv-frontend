// src/app/api/convert/route.ts
//
// Synchronous (in-request) conversion endpoint.
//
// Why synchronous? The original design used BullMQ + Redis + a long-lived worker,
// which cannot work on Vercel Serverless: the function is frozen after it returns,
// so no worker ever consumes the queue and every conversion hangs (504). We now run
// the conversion directly inside the request and stream the result bytes back.
// This makes the endpoint self-contained — no Redis, no worker, no external state.
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { SUPPORTED_FORMATS, normalizeFormat } from "@/lib/conversion-map";
import {
  checkRateLimitWithStrategy,
  getRateLimitHeaders,
  RATE_LIMIT_STRATEGIES,
} from "@/lib/rate-limit";
import { mapErrorCode, getFriendlyMessage, sanitizeError } from "@/lib/error-handler";
import { runConversion } from "@/lib/conversion";

// Vercel Serverless function timeout (hobby plan caps at 60s). Calibre conversions
// of typical ebooks finish in a few seconds; this leaves headroom for larger files.
export const maxDuration = 60;

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10) * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // --- Rate Limiting (per-IP, convertApi strategy: 20 req / 60s) ---
    const rateResult = await checkRateLimitWithStrategy(request, "convertApi");
    const rateHeaders = getRateLimitHeaders(
      rateResult,
      RATE_LIMIT_STRATEGIES.convertApi.maxRequests
    );

    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: rateHeaders }
      );
    }

    // --- Request Validation ---
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const sourceFormat = normalizeFormat(formData.get("source_format") as string);
    const targetFormat = normalizeFormat(formData.get("target_format") as string);

    if (!file || !sourceFormat || !targetFormat) {
      return NextResponse.json(
        { error: "Missing required fields: file, source_format, target_format" },
        { status: 400, headers: rateHeaders }
      );
    }

    if (!SUPPORTED_FORMATS.includes(sourceFormat)) {
      return NextResponse.json(
        { error: `Unsupported source format: ${sourceFormat}` },
        { status: 400, headers: rateHeaders }
      );
    }
    if (!SUPPORTED_FORMATS.includes(targetFormat)) {
      return NextResponse.json(
        { error: `Unsupported target format: ${targetFormat}` },
        { status: 400, headers: rateHeaders }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max ${process.env.MAX_FILE_SIZE_MB || "10"}MB` },
        { status: 413, headers: rateHeaders }
      );
    }

    // Validate file extension matches declared source format (warn only; Calibre rejects mismatches)
    const fileExt = file.name.split('.').pop()?.toLowerCase().replace('.', '') || '';
    if (fileExt && fileExt !== sourceFormat) {
      console.warn(`File extension '${fileExt}' doesn't match declared source_format '${sourceFormat}' for file: ${file.name}`);
    }

    // --- Synchronous conversion (no queue / no Redis) ---
    const jobId = randomUUID();
    const buffer = Buffer.from(await file.arrayBuffer());

    let result;
    try {
      result = await runConversion(
        buffer.toString("base64"),
        null,
        sourceFormat,
        targetFormat,
        jobId
      );
    } catch (convErr: any) {
      const message = sanitizeError(convErr);
      const errorCode = mapErrorCode(message);
      return NextResponse.json(
        { error: getFriendlyMessage(errorCode), code: errorCode },
        { status: 500, headers: rateHeaders }
      );
    }

    const outBuffer = Buffer.from(result.base64Data, "base64");
    const ext = result.extension || "bin";
    const mimeType = result.mimeType || "application/octet-stream";
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const disposition = `attachment; filename="${baseName}.${ext}"`;

    // Stream the converted file bytes directly. The client (ToolPageClient) reads
    // response.blob() and surfaces a download link — no polling, no jobId needed.
    return new NextResponse(new Uint8Array(outBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": disposition,
        "Cache-Control": "no-store",
        ...rateHeaders,
      },
    });
  } catch (err: any) {
    const message = sanitizeError(err);
    console.error("POST /api/convert error:", message);
    const errorCode = mapErrorCode(message);
    return NextResponse.json(
      { error: getFriendlyMessage(errorCode), code: errorCode },
      { status: 500 }
    );
  }
}
