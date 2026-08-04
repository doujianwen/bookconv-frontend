// src/app/api/convert-internal/route.ts
//
// Internal conversion endpoint — runs ONLY on the Calibre-capable backend
// (the Docker/VPS image that installs Calibre). The public /api/convert route
// (on Vercel) forwards uploads here when CONVERSION_BACKEND_URL is configured.
//
// Protected by a shared secret (CONVERSION_INTERNAL_SECRET). Never expose this
// route publicly without the secret set — it would be an open conversion proxy.
import { NextRequest, NextResponse } from "next/server";
import { convertAndStream } from "@/lib/convert-handler";

// The backend is not Serverless-constrained the same way; allow more headroom for
// large Calibre jobs. (Ignored where the platform caps it lower.)
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const secret = process.env.CONVERSION_INTERNAL_SECRET;
  const provided = request.headers.get("x-internal-convert");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  return convertAndStream(formData);
}
