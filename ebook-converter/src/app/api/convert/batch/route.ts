// src/app/api/convert/batch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import JSZip from "jszip";
import { getConversionQueue, MAX_RETRIES } from "@/lib/queue";
import { SUPPORTED_FORMATS, normalizeFormat } from "@/lib/conversion-map";
import { checkRateLimitWithStrategy, getRateLimitHeaders, RATE_LIMIT_STRATEGIES } from "@/lib/rate-limit";
import { saveBatch, getBatch, deleteBatch, updateBatch, cleanupExpiredBatches, BatchFileItem, BatchJobData } from "@/lib/batch-store";
import { sanitizeError, mapErrorCode } from "@/lib/error-handler";
import { loggers as log } from "@/lib/logger";
import { getRedisClient } from "@/lib/redis";

// ── Pro limits ────────────────────────────────────────────────
const BATCH_MAX_FILES = parseInt(process.env.BATCH_MAX_FILES || "50", 10);
const BATCH_MAX_FILE_SIZE = parseInt(process.env.BATCH_MAX_FILE_SIZE_MB || "50", 10) * 1024 * 1024;
const BATCH_CONCURRENCY = parseInt(process.env.BATCH_CONCURRENCY || "3", 10);
const JOB_RETENTION_DAYS = 7;
const BATCH_CLEANUP_DELAY_MS = 30 * 60 * 1000; // 30 min after completion
const IDEMPOTENCY_WINDOW_MS = 5 * 60 * 1000; // 5 min idempotency window

// ── Helpers ───────────────────────────────────────────────────

/** Compute a simple hash of file metadata for idempotency dedup */
async function computeBatchFingerprint(files: File[], targetFormat: string): Promise<string> {
  const parts = files.map((f) => `${f.name}:${f.size}:${f.lastModified}`).join('|');
  // Use a simple hash — adequate for dedup within the idempotency window
  const encoder = new TextEncoder();
  const hashBuf = await crypto.subtle.digest('SHA-256', encoder.encode(parts + ':' + targetFormat));
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
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
): Promise<{ success: boolean; bullJobId: string; result?: any }> {
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
      return { success: false, bullJobId, result: null };
    }
    if (jobData.state === "completed") {
      return { success: true, bullJobId, result: jobData.returnvalue };
    }
    if (jobData.state === "failed") {
      return { success: false, bullJobId, result: null };
    }
    await new Promise((r) => setTimeout(r, pollInterval));
  }

  return { success: false, bullJobId, result: null };
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
          liveItem.status = "completed";
          liveItem.result = result.result;
        } else {
          liveItem.status = "failed";
          liveItem.error = "Conversion failed or timed out";
        }

        // Persist batch update to Redis (single write, no duplicate)
        await updateBatch(batchId, (b) => {
          b.files[index] = liveItem;
          b.completedAt = Date.now();
        });
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
      log.batch.error("Failed to generate batch ZIP", { error: zipErr.message });
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

    // Idempotency check: if the same files + target were submitted recently,
    // return the existing batch instead of creating a duplicate.
    const fingerprint = await computeBatchFingerprint(files, targetFormat);
    const idempotencyKey = `idemp:batch:${fingerprint}`;
    const redis = getRedisClient();
    if (!redis.connected) {
      await redis.connect();
    }
    const existingBatchId = await redis.get(idempotencyKey);
    if (existingBatchId) {
      log.batch.info('Idempotent batch match', { fingerprint, existingBatchId });
      const existingBatch = await getBatch(existingBatchId as string);
      if (existingBatch) {
        return NextResponse.json({
          batchId: existingBatch.batchId,
          total: existingBatch.files.length,
          queued: existingBatch.files.filter((f) => f.status === 'queued').length,
          failed: existingBatch.files.filter((f) => f.status === 'failed').length,
          files: existingBatch.files.map(({ index, name, size, sourceFormat, status, error }) => ({
            index, name, size, sourceFormat, status, error,
          })),
          message: 'Duplicate batch submission — returning existing batch',
          isDuplicate: true,
        }, { status: 200, headers: rateHeaders });
      }
    }
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

    // Store idempotency key (TTL = idempotency window)
    await redis.set(idempotencyKey, batchId, 'EX', Math.ceil(IDEMPOTENCY_WINDOW_MS / 1000));

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
    log.batch.error("Batch conversion error", { error: err.message });
    return NextResponse.json(
      { error: sanitizeError(err) || "Internal server error", code: mapErrorCode(err.message) },
      { status: 500 }
    );
  }
}
