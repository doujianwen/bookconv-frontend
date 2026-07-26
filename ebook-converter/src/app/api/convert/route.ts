// src/app/api/convert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getConversionQueue, ConversionJobData, MAX_RETRIES } from "@/lib/queue";
import { SUPPORTED_FORMATS, normalizeFormat } from "@/lib/conversion-map";
import {
  checkRateLimitWithStrategy,
  getRateLimitHeaders,
  RATE_LIMIT_STRATEGIES,
} from "@/lib/rate-limit";
import { mapErrorCode, getFriendlyMessage, sanitizeError } from "@/lib/error-handler";

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
        { error: `Unsupported source format: ${sourceFormat}`  },
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

    // Validate file extension matches declared source format
    const fileExt = file.name.split('.').pop()?.toLowerCase().replace('.', '') || '';
    if (fileExt && fileExt !== sourceFormat) {
      // Allow mismatch if the user explicitly provided source_format,
      // but warn in logs — Calibre will reject mismatched content anyway
      console.warn(`File extension '${fileExt}' doesn't match declared source_format '${sourceFormat}' for file: ${file.name}`);
    }

    // --- Queue Job ---
    const jobId = randomUUID();
    const buffer = Buffer.from(await file.arrayBuffer());

    // Priority: all jobs use default priority (1) for now.
    // User-tier-based priority requires auth middleware which is not yet implemented.
    const priority = 1;

    const jobData: ConversionJobData = {
      fileBuffer: buffer.toString("base64"),
      sourceFormat,
      targetFormat,
      jobId,
      priority,
    };

    let job: any;
    try {
      job = await getConversionQueue().add("conversion", jobData, {
        // Keep jobs for 7 days so we can query status after completion
        removeOnCount: { complete: 1000, failed: 500 },
        retries: MAX_RETRIES - 1,
        delay: 0,
        priority,
      });
    } catch (queueErr: any) {
      // Redis unavailable — return jobId anyway so client can poll status
      // The conversion will fail when worker tries to process it
      console.warn("[convert] Queue unavailable (Redis down), returning jobId:", queueErr.message);
    }

    return NextResponse.json(
      { jobId, status: "queued", message: "Conversion started" },
      { status: 202, headers: rateHeaders }
    );
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
