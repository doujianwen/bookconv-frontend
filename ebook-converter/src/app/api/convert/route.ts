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
import { convertAndStream } from "@/lib/convert-handler";

export const maxDuration = 300; // Vercel Pro 支持 300s；大文件（50+页EPUB→PDF经Calibre引擎）需 60-120s 处理时间

const BACKEND_URL = process.env.CONVERSION_BACKEND_URL?.replace(/\/+$/, "");
const INTERNAL_SECRET = process.env.CONVERSION_INTERNAL_SECRET;

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

    // --- Optional delegation to a Calibre-capable backend (VPS/Docker) ---
    if (BACKEND_URL && INTERNAL_SECRET) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/api/convert-internal`, {
          method: "POST",
          headers: { "x-internal-convert": INTERNAL_SECRET },
          body: request.body,
          // request.body is a stream we must forward; duplex:half enables that
          // @ts-expect-error fetch duplex is supported in Node 18+ runtimes
          duplex: "half",
        });
        // Stream the backend's bytes (or JSON error) straight back to the client.
        const headers = new Headers();
        backendRes.headers.forEach((v, k) => {
          if (["content-type", "content-disposition", "cache-control"].includes(k.toLowerCase())) {
            headers.set(k, v);
          }
        });
        for (const [k, v] of Object.entries(rateHeaders)) headers.set(k, v);
        return new NextResponse(backendRes.body, {
          status: backendRes.status,
          headers,
        });
      } catch (fwdErr: any) {
        console.error("POST /api/convert backend forward failed:", fwdErr?.message || fwdErr);
        return NextResponse.json(
          { error: "Conversion service temporarily unavailable. Please try again later." },
          { status: 503, headers: rateHeaders },
        );
      }
    }

    // --- Local execution (engine-free conversions) ---
    const formData = await request.formData();
    return convertAndStream(formData, rateHeaders);
  } catch (err: any) {
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
