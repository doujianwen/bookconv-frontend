import { NextRequest, NextResponse } from "next/server";
import { checkConversionBudget } from "@/lib/conversion-budget";
import { classifyCloudConvertBudget } from "@/lib/conversion-availability";
import { isPureJsConversion } from "@/lib/conversion";
import { normalizeFormat, SUPPORTED_FORMATS } from "@/lib/conversion-map";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const source = normalizeFormat(params.get("source") || "");
  const target = normalizeFormat(params.get("target") || "");

  if (!SUPPORTED_FORMATS.includes(source) || !SUPPORTED_FORMATS.includes(target)) {
    return NextResponse.json(
      { error: "Unsupported source or target format." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const checkedAt = new Date().toISOString();
  if (isPureJsConversion(source, target)) {
    return NextResponse.json(
      { status: "available", scope: "local", checkedAt, ttlSeconds: 0 },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const budget = await checkConversionBudget();
  const result = classifyCloudConvertBudget(budget);
  return NextResponse.json({ ...result, checkedAt, ttlSeconds: 0 }, {
    headers: { "Cache-Control": "no-store" },
  });
}