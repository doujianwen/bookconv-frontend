// src/app/api/convert/batch/[batchId]/download/route.ts
import { NextResponse } from "next/server";
import JSZip from "jszip";
import { getBatch } from "@/lib/batch-store";
import { canAccessBatch } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const { batchId } = await params;
    const batch = await getBatch(batchId);

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Ownership check
    const hasAccess = await canAccessBatch(batch.userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const completedFiles = batch.files.filter((f: any) => f.status === "completed" && f.result);
    if (completedFiles.length === 0) {
      return NextResponse.json({ error: "No completed files to download" }, { status: 404 });
    }

    if ((batch as any).zipBlob) {
      const blob: Blob = (batch as any).zipBlob;
      const fileName = (batch as any).zipFileName || `converted-${batchId}.zip`;

      return new NextResponse(blob, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "X-Batch-Id": batchId,
          "X-Completed-Files": String(completedFiles.length),
        },
      });
    }

    // Regenerate ZIP on-the-fly from stored results
    const zip = new JSZip();
    for (const item of completedFiles) {
      if (item.result?.base64Data) {
        const safeName = item.name.replace(/^.*[/\\]/, "").replace(/\.[^.]+$/, "") + "." + item.result.extension;
        zip.file(safeName, item.result.base64Data, { base64: true });
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const fileName = `converted-${batchId.slice(0, 8)}.zip`;

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-Batch-Id": batchId,
        "X-Completed-Files": String(completedFiles.length),
      },
    });
  } catch (err: any) {
    console.error("GET /api/convert/batch/:id/download error:", err.message);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
