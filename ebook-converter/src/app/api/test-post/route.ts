import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const src = formData.get("source_format");
    const tgt = formData.get("target_format");
    console.log("[TEST] file:", file?.name, "src:", typeof src, src, "tgt:", typeof tgt, tgt);
    return NextResponse.json({ ok: true, fileName: file?.name, source: src, target: tgt });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[TEST] Error:", msg, err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
