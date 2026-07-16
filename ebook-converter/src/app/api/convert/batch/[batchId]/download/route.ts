// src/app/api/convert/batch/[batchId]/download/route.ts
import { NextResponse } from "next/server";
import JSZip from "jszip";

interface BatchFileItem {
  index: number;
  name: string;
  size: number;
  sourceFormat: string;
  targetFormat: string;
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  error?: string;
  result?: { base64Data: string; extension: string; mimeType: string; fileSize?: number };
}

interface BatchJobData {
  batchId: string;
  files: BatchFileItem[];
  targetFormat: string;
  userId?: string;
  createdAt: number;
  zipBlob?: Blob;
  zipFileName?: string;
}

const batchStore = new Map<string, BatchJobData>();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const { batchId } = await params;
    const batch = batchStore.get(batchId);

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const completedFiles = batch.files.filter((f) => f.status === "completed" && f.result);
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

    const zip = new JSZip();
    for (const item of completedFiles) {
      if (item.result?.base64Data) {
        const outName = item.name.replace(/\.[^.]+$/, "") + "." + item.result.extension;
        zip.file(outName, item.result.base64Data, { base64: true });
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}