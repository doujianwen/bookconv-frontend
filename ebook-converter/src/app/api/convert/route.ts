// src/app/api/convert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getConversionQueue, ConversionJobData } from "@/lib/queue";
import { SUPPORTED_FORMATS } from "@/lib/conversion-map";
import {
  checkRateLimitWithStrategy,
  getRateLimitHeaders,
  RATE_LIMIT_STRATEGIES,
} from "@/lib/rate-limit";

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
    const sourceFormat = (formData.get("source_format") as string)?.toLowerCase().replace(".", "");
    const targetFormat = (formData.get("target_format") as string)?.toLowerCase().replace(".", "");

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

    // --- Queue Job ---
    const jobId = randomUUID();
    const buffer = Buffer.from(await file.arrayBuffer());

    const jobData: ConversionJobData = {
      fileBuffer: buffer.toString("base64"),
      sourceFormat,
      targetFormat,
      jobId,
    };

    const job = await getConversionQueue().add("conversion", jobData, {
      removeOnComplete: true,
      removeOnFail: true,
    });

    return NextResponse.json(
      { jobId, status: "queued", message: "Conversion started" },
      { status: 202, headers: rateHeaders }
    );
  } catch (err: any) {
    console.error("POST /api/convert error:", err.message);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
