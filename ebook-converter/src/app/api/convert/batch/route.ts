// src/app/api/convert/batch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import JSZip from "jszip";
import { getConversionQueue, MAX_RETRIES } from "@/lib/queue";
import { SUPPORTED_FORMATS, normalizeFormat } from "@/lib/conversion-map";
import { checkRateLimitWithStrategy, getRateLimitHeaders, RATE_LIMIT_STRATEGIES } from "@/lib/rate-limit";
import { saveBatch, getBatch, deleteBatch, cleanupExpiredBatches, BatchFileItem, BatchJobData } from "@/lib/batch-store";

// ── Pro limits ────────────────────────────────────────────────
const BATCH_MAX_FILES = parseInt(process.env.BATCH_MAX_FILES || "50", 10);
const BATCH_MAX_FILE_SIZE = parseInt(process.env.BATCH_MAX_FILE_SIZE_MB || "50", 10) * 1024 * 1024;
const BATCH_CONCURRENCY = parseInt(process.env.BATCH_CONCURRENCY || "3", 10);
const JOB_RETENTION_DAYS = 7;
const BATCH_CLEANUP_DELAY_MS = 30 * 60 * 1000; // 30 min after completion

// ── Helpers ───────────────────────────────────────────────────
function mapErrorCode(message: string): string {
  const codes: Record<string, string> = {
    ENOENT: "FILE_NOT_FOUND",
    EACCES: "PERMISSION_DENIED",
    ETIMEDOUT: "CONVERSION_TIMEOUT",
    EMFILE: "TOO_MANY_OPEN_FILES",
    EBUSY: "CONVERSION_BUSY",
  };
  for (const [key, code] of Object.entries(codes)) {
    if (message.includes(key)) return code;
  }
  return "CONVERSION_FAILED";
}

/** Sanitize filename for ZIP entry to prevent path traversal */
function sanitizeFileName(originalName: string, targetExt: string): string {
  const safeName = originalName.replace(/^.*[/\\]/, "").replace(/\0/g, "");
  const baseName = safeName.replace(/\.[^.]+$/, "");
  return `${baseName}.${targetExt}`;
}

/**
 * Run a single conversion via BullMQ — fire and forget.
 * Returns immediately with the BullMQ job ID; the caller polls
 * GET /api/convert/batch?batchId=xxx for status updates.
 */
async function queueSingleConversion(
  fileBuffer: Buffer,
  sourceFormat: string,
  targetFormat: string,
  batchId: string,
  itemIndex: number,
  priority: number
): Promise<{ success: boolean; bullJobId: string }> {
  const queue = getConversionQueue();
  const job = await queue.add("conversion", {
    fileBuffer: fileBuffer.toString("base64"),
    sourceFormat,
    targetFormat,
    priority,
  }, {
    removeOnCount: { complete: 1000, failed: 500 },
    retries: MAX_RETRIES - 1,
    delay: 0,
    priority,
  });

  const bullJobId = String(job.id);

  // Poll for completion (max 5 minutes)
  const maxWait = 5 * 60 * 1000;
  const pollInterval = 2000;
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    const jobData = await queue.getJob(bullJobId);
    if (!jobData) {
      // Job may have been pruned by removeOnCount — update via status
      return { success: false, bullJobId };
    }
    if (jobData.state === "completed") {
      return { success: true, bullJobId };
    }
    if (jobData.state === "failed") {
      return { success: false, bullJobId };
    }
    await new Promise((r) => setTimeout(r, pollInterval));
  }

  return { success: false, bullJobId };
}

/**
 * Process a batch asynchronously — returns immediately after queuing.
 * This avoids HTTP timeouts from load balancers (typically 60s-5min).
 */
async function processBatchAsync(
  batchId: string,
  fileBuffers: {
    file: File;
    index: number;
    sourceFormat: string;
    targetFormat: string;
  }[],
  items: BatchFileItem[]
): Promise<void> {
  const pLimit = (await import("p-limit")).default;
  const limit = pLimit(BATCH_CONCURRENCY);

  // Create a snapshot of items to avoid closure issues
  const itemsSnapshot = structuredClone(items);

  const results = await Promise.all(
    fileBuffers.map(({ file, index, sourceFormat, targetFormat }) =>
      limit(async () => {
        const item = itemsSnapshot[index];
        if (!item) return;

        // Update the live batch data (reads from Redis + memory)
        const batch = await getBatch(batchId);
        if (!batch) return;
        const liveItem = batch.files[index];
        if (!liveItem) return;

        liveItem.status = "processing";

        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await queueSingleConversion(
          buffer, sourceFormat, targetFormat, batchId, index, 1
        );

        liveItem.bullJobId = result.bullJobId;
        if (result.success) {
          // Fetch the actual result from the job
          const queue = getConversionQueue();
          const job = await queue.getJob(liveItem.bullJobId);
          if (job?.state === "completed" && job.returnvalue) {
            liveItem.status = "completed";
            liveItem.result = job.returnvalue;
          } else {
            liveItem.status = "failed";
            liveItem.error = "Conversion completed but result not found";
          }
        } else {
          liveItem.status = "failed";
          liveItem.error = "Conversion failed or timed out";
        }

        // Persist updated batch back to Redis
        await saveBatch(batchId, batch);
      })
    )
  );

  // Wait for all results (results array is for type safety; mutations happen in-place)
  void results;

  // Build ZIP after all conversions complete
  const batch = await getBatch(batchId);
  if (!batch) return;

  const completedFiles = batch.files.filter((f) => f.status === "completed" && f.result);
  if (completedFiles.length > 0) {
    const zip = new JSZip();
    for (const item of completedFiles) {
      if (item.result?.base64Data) {
        const outName = sanitizeFileName(item.name, item.result.extension);
        zip.file(outName, item.result.base64Data, { base64: true });
      }
    }

    try {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipFileName = `converted-${batchId.slice(0, 8)}.zip`;
      (batch as any).zipBlob = zipBlob;
      (batch as any).zipFileName = zipFileName;
    } catch (zipErr: any) {
      console.error("Failed to generate batch ZIP:", zipErr.message);
    }
  }

  // Mark batch as completed for auto-cleanup
  batch.completedAt = Date.now();

  // Persist updated batch
  await saveBatch(batchId, batch);

  // Also trigger periodic cleanup
  await cleanupExpiredBatches();
}

// ── GET /api/convert/batch?batchId=xxx — get batch status ─────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const batchId = searchParams.get("batchId");

  if (!batchId) {
    return NextResponse.json({ error: "Missing batchId query parameter" }, { status: 400 });
  }

  const batch = await getBatch(batchId);
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

// ── POST /api/convert/batch — submit batch conversion ─────────
export async function POST(request: NextRequest) {
  try {
    const rateResult = await checkRateLimitWithStrategy(request, "convertApi");
    const rateHeaders = getRateLimitHeaders(rateResult, RATE_LIMIT_STRATEGIES.convertApi.maxRequests);

    if (!rateResult.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateHeaders });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    let targetFormat = normalizeFormat(formData.get("target_format") as string);
    if (!targetFormat) {
      targetFormat = normalizeFormat(formData.get("target_format") as string) || "epub";
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
    const fileBuffers: {
      file: File;
      index: number;
      sourceFormat: string;
      targetFormat: string;
    }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = normalizeFormat(file.name.split(".").pop() || "");

      if (!SUPPORTED_FORMATS.includes(ext)) {
        items.push({
          index: i, name: file.name, size: file.size,
          sourceFormat: ext, targetFormat, bullJobId: "",
          status: "failed", error: `Unsupported format: .${ext}`,
        });
        continue;
      }

      if (file.size > BATCH_MAX_FILE_SIZE) {
        items.push({
          index: i, name: file.name, size: file.size,
          sourceFormat: ext, targetFormat, bullJobId: "",
          status: "failed",
          error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB > ${(BATCH_MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB)`,
        });
        continue;
      }

      items.push({
        index: i, name: file.name, size: file.size,
        sourceFormat: ext, targetFormat, bullJobId: "", status: "queued",
      });
      fileBuffers.push({ file, index: i, sourceFormat: ext, targetFormat });
    }

    // Store batch info
    const batchData: BatchJobData = {
      batchId, files: items, targetFormat, createdAt: Date.now(),
    };
    await saveBatch(batchId, batchData);

    // Fire-and-forget: process asynchronously, return immediately
    if (fileBuffers.length > 0) {
      // Detach the async work so it doesn't block the response
      void processBatchAsync(batchId, fileBuffers, items);
    }

    // Return immediately with batchId for polling
    const total = items.length;
    const queued = items.filter((f) => f.status === "queued").length;
    const failed = items.filter((f) => f.status === "failed").length;

    return NextResponse.json(
      {
        batchId,
        total,
        queued,
        failed,
        files: items.map(({ index, name, size, sourceFormat, status, error }) => ({
          index, name, size, sourceFormat, status, error,
        })),
        message: failed > 0
          ? `${failed} file(s) rejected, ${total - failed} queued for conversion. Poll status via ?batchId=${batchId}`
          : `${total} files queued. Poll status via ?batchId=${batchId}`,
      },
      { status: 202, headers: rateHeaders }
    );
  } catch (err: any) {
    console.error("POST /api/convert/batch error:", err.message);
    return NextResponse.json(
      { error: err.message || "Internal server error", code: mapErrorCode(err.message) },
      { status: 500 }
    );
  }
}
