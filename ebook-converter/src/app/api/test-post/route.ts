import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const src = formData.get("source_format");
    const tgt = formData.get("target_format");
    console.log("[TEST] file:", file?.name, "src:", typeof src, src, "tgt:", typeof tgt, tgt);
    return NextResponse.json({ ok: true, fileName: file?.name, source: src, target: tgt });
  } catch (err: any) {
    console.error("[TEST] Error:", err?.message, err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
