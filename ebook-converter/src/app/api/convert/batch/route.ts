// src/app/api/convert/batch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import JSZip from "jszip";
import { getConversionQueue, ConversionJobData, MAX_RETRIES } from "@/lib/queue";
import { SUPPORTED_FORMATS } from "@/lib/conversion-map";
import { checkRateLimitWithStrategy, getRateLimitHeaders, RATE_LIMIT_STRATEGIES } from "@/lib/rate-limit";

// ── Pro limits ────────────────────────────────────────────────
const BATCH_MAX_FILES = parseInt(process.env.BATCH_MAX_FILES || "50", 10);
const BATCH_MAX_FILE_SIZE = parseInt(process.env.BATCH_MAX_FILE_SIZE_MB || "50", 10) * 1024 * 1024;
const BATCH_CONCURRENCY = parseInt(process.env.BATCH_CONCURRENCY || "3", 10);
const JOB_RETENTION_DAYS = 7;

// ── Types ─────────────────────────────────────────────────────
export interface BatchFileItem {
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

export interface BatchJobData {
  batchId: string;
  files: BatchFileItem[];
  targetFormat: string;
  userId?: string;
  createdAt: number;
  zipBlob?: Blob;
  zipFileName?: string;
}

// ── Helpers ───────────────────────────────────────────────────
function mapErrorCode(message: string): string {
  const codes: Record<string, string> = {
    ENOENT: "FILE_NOT_FOUND",
    EACCES: "PERMISSION_DENIED",
    ETIMEDOUT: "CONVERSION_TIMEOUT",
    EMFILE: "FILE_TOO_LARGE",
    EBUSY: "CONVERSION_BUSY",
  };
  for (const [key, code] of Object.entries(codes)) {
    if (message.includes(key)) return code;
  }
  return "CONVERSION_FAILED";
}

/**
 * Run a single conversion with concurrency control.
 * Queues via BullMQ then polls until done.
 */
async function runSingleConversion(
  fileBuffer: Buffer,
  sourceFormat: string,
  targetFormat: string,
  jobId: string,
  priority: number
): Promise<{ success: boolean; result?: any; error?: string }> {
  const queue = getConversionQueue();
  await queue.add("conversion", {
    fileBuffer: fileBuffer.toString("base64"),
    sourceFormat,
    targetFormat,
    jobId,
    priority,
  }, {
    removeOnCount: { complete: 1000, failed: 500 },
    retries: MAX_RETRIES - 1,
    delay: 0,
    priority,
  });

  // Poll for completion (max 5 minutes)
  const maxWait = 5 * 60 * 1000;
  const pollInterval = 2000;
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    const job = await queue.getJob(jobId);
    if (!job) {
      return { success: false, error: "Job not found" };
    }
    if (job.state === "completed") {
      return { success: true, result: job.returnvalue };
    }
    if (job.state === "failed") {
      return { success: false, error: job.failedReason || "Unknown failure" };
    }
    await new Promise((r) => setTimeout(r, pollInterval));
  }

  return { success: false, error: "Conversion timed out" };
}

// ── In-memory store for batch jobs (replace with Redis in prod) ──
const batchStore = new Map<string, BatchJobData>();

/**
 * GET /api/convert/batch?batchId=xxx — get batch status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const batchId = searchParams.get("batchId");

  if (!batchId) {
    return NextResponse.json({ error: "Missing batchId query parameter" }, { status: 400 });
  }

  const batch = batchStore.get(batchId);
  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  const total = batch.files.length;
  const completed = batch.files.filter((f) => f.status === "completed").length;
  const failed = batch.files.filter((f) => f.status === "failed").length;
  const processing = batch.files.filter((f) => f.status === "processing").length;
  const queued = batch.files.filter((f) => f.status === "queued").length;
  const overallProgress = total > 0 ? Math.round(((completed + failed) / total) * 100) : 0;

  return NextResponse.json({
    batchId: batch.batchId,
    targetFormat: batch.targetFormat,
    total,
    completed,
    failed,
    processing,
    queued,
    overallProgress,
    files: batch.files.map(({ index, name, size, sourceFormat, status, error, result }) => ({
      index, name, size, sourceFormat, status, error,
      result: result
        ? { extension: result.extension, mimeType: result.mimeType, fileSize: result.fileSize }
        : undefined,
    })),
    createdAt: batch.createdAt,
  });
}

/**
 * POST /api/convert/batch — submit batch conversion
 */
export async function POST(request: NextRequest) {
  try {
    const rateResult = await checkRateLimitWithStrategy(request, "convertApi");
    const rateHeaders = getRateLimitHeaders(rateResult, RATE_LIMIT_STRATEGIES.convertApi.maxRequests);

    if (!rateResult.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateHeaders });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    let targetFormat = (formData.get("target_format") as string)?.toLowerCase().replace(".", "");
    if (!targetFormat) {
      targetFormat = (formData.get("target_format") as string)?.toLowerCase().replace(".", "") || "epub";
    }

    // Validate batch limits
    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400, headers: rateHeaders });
    }
    if (files.length > BATCH_MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${BATCH_MAX_FILES} files per batch (Pro limit)` },
        { status: 413, headers: rateHeaders }
      );
    }
    if (!SUPPORTED_FORMATS.includes(targetFormat)) {
      return NextResponse.json(
        { error: `Unsupported target format: ${targetFormat}` },
        { status: 400, headers: rateHeaders }
      );
    }

    // Parse files and validate each one
    const batchId = randomUUID();
    const items: BatchFileItem[] = [];
    const fileBuffers: { file: File; index: number }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      if (!SUPPORTED_FORMATS.includes(ext)) {
        items.push({
          index: i, name: file.name, size: file.size,
          sourceFormat: ext, targetFormat, jobId: randomUUID(),
          status: "failed", error: `Unsupported format: .${ext}`,
        });
        continue;
      }

      if (file.size > BATCH_MAX_FILE_SIZE) {
        items.push({
          index: i, name: file.name, size: file.size,
          sourceFormat: ext, targetFormat, jobId: randomUUID(),
          status: "failed",
          error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB > ${(BATCH_MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB)`,
        });
        continue;
      }

      const jobId = randomUUID();
      items.push({
        index: i, name: file.name, size: file.size,
        sourceFormat: ext, targetFormat, jobId, status: "queued",
      });
      fileBuffers.push({ file, index: i });
    }

    // Store batch info
    const batchData: BatchJobData = {
      batchId, files: items, targetFormat, createdAt: Date.now(),
    };
    batchStore.set(batchId, batchData);

    // Start parallel conversion with concurrency control
    if (fileBuffers.length > 0) {
      const pLimit = (await import("p-limit")).default;
      const limit = pLimit(BATCH_CONCURRENCY);

      const promises = fileBuffers.map(async ({ file, index }) => {
        const item = items[index];
        if (!item) return;

        const buffer = Buffer.from(await file.arrayBuffer());
        item.status = "processing";

        const result = await runSingleConversion(
          buffer, item.sourceFormat, item.targetFormat, item.jobId, 1
        );

        if (result.success && result.result) {
          item.status = "completed";
          item.result = result.result;
        } else {
          item.status = "failed";
          item.error = result.error || "Unknown error";
        }
      });

      await Promise.all(promises.map((p) => limit(() => p)));
    }

    // Build ZIP for completed files
    const completedFiles = items.filter((f) => f.status === "completed" && f.result);
    let zipUrl: string | undefined;

    if (completedFiles.length > 0) {
      const zip = new JSZip();
      for (const item of completedFiles) {
        if (item.result?.base64Data) {
          const outName = item.name.replace(/\.[^.]+$/, "") + "." + item.result.extension;
          zip.file(outName, item.result.base64Data, { base64: true });
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipFileName = `converted-${batchId.slice(0, 8)}.zip`;
      (batchData as any).zipBlob = zipBlob;
      (batchData as any).zipFileName = zipFileName;
      zipUrl = `/api/convert/batch/${batchId}/download`;
    }

    return NextResponse.json(
      {
        batchId,
        total: items.length,
        queued: items.filter((f) => f.status === "queued").length,
        processing: items.filter((f) => f.status === "processing").length,
        completed: items.filter((f) => f.status === "completed").length,
        failed: items.filter((f) => f.status === "failed").length,
        files: items.map(({ index, name, size, sourceFormat, status, error, result }) => ({
          index, name, size, sourceFormat, status, error,
          result: result
            ? { extension: result.extension, mimeType: result.mimeType, fileSize: result.fileSize }
            : undefined,
        })),
        zipUrl,
        message: completedFiles.length > 0
          ? `${completedFiles.length}/${items.length} files converted successfully`
          : "All files failed",
      },
      { status: completedFiles.length > 0 ? 200 : 207, headers: rateHeaders }
    );
  } catch (err: any) {
    console.error("POST /api/convert/batch error:", err.message);
    return NextResponse.json(
      { error: err.message || "Internal server error", code: mapErrorCode(err.message) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/convert/batch/:batchId/download — download ZIP
 */
export async function GET_download(request: NextRequest, { params }: { params: Promise<{ batchId: string }> }) {
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

    // Regenerate ZIP on-the-fly
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
