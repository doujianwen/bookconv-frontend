// app/index.js
// Standalone Calibre conversion backend for BookConv.
//
// Contract (must match Vercel src/app/api/convert/route.ts forwarding):
//   POST /api/convert-internal
//     Header:  x-internal-convert: <CONVERSION_INTERNAL_SECRET>
//     Body:    multipart/form-data { file, source_format, target_format[, quality] }
//     Success: 200 + file bytes, headers:
//                Content-Type: <mime>
//                Content-Disposition: attachment; filename="<base>.<ext>"; filename*=UTF-8''<enc>
//                Cache-Control: no-store
//     Error:   JSON { error, code? } with non-200 status
//   GET  /health -> 200 { status:"ok" }
//
// Isolation: single in-flight conversion (concurrency=1) so a 2-core box is
// never swamped. Temp files live in CONVERSION_TMP (a tmpfs on the server) and
// are always cleaned up.
//
// 2026-11-02：并发=1 时不再「立即 429」，改为**有限排队**（BUSY_WAIT_MS，默认 5s）。
// 依据：HK 实测单次转换 0.85s(162B html→epub) / 1.16s(16KB) / 2.57s(html→pdf)，
// 而 Threads=1 的锁一旦被占，第二个请求原本毫秒级被拒、直接回退 CloudConvert。
// 短重叠（1–3s）本可自然消解，却被当成失败 —— 既烧 CC 额度又多 10–30s 延迟。
// 不提高并发度的原因：memory.peak = 474MB vs systemd MemoryMax=1.2G，并发 2
// 余量不足，有 OOM 风险；排队不增加内存，是当前唯一安全的容量平滑手段。
// 回滚开关：BUSY_WAIT_MS=0 即恢复「立即 429」旧行为。
// 注意：等待期间仍占着连接，故必须检测客户端断开（Vercel abort）提前退出。
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";
import Busboy from "busboy";
import { convertWithCalibre } from "./calibre.js";
import {
  createIdempotencyStore,
  createCompletedLedger,
  contentFingerprint,
  bufferSha256,
  captureResult,
  writeReplay,
  writeCompletedReplay,
  writeFingerprintConflict,
} from "./idempotency.js";

const SECRET = process.env.CONVERSION_INTERNAL_SECRET;
const PORT = parseInt(process.env.PORT || "3001", 10);
const BIND_HOST = process.env.BIND_HOST || "127.0.0.1"; // internal only; nginx fronts it
const TMP = process.env.CONVERSION_TMP || "/opt/bookconv-conversion/data/tmp";
const LOG_DIR = process.env.CONVERSION_LOG_DIR || "/opt/bookconv-conversion/logs";
const MAX_FILE_BYTES = parseInt(process.env.MAX_FILE_BYTES || String(50 * 1024 * 1024), 10);
// Round2 P0-B: 120000→60000 to remove the budget inversion (calibre was longer
// than the edge delegate's 90s → orphan child after edge abort). Override with
// CALIBRE_TIMEOUT=120000 to restore round1 (reintroduces the inversion).
const CALIBRE_TIMEOUT = parseInt(process.env.CALIBRE_TIMEOUT || "60000", 10);
/** 锁被占时最多排队等待多久（毫秒）；0 = 旧行为（立即 429） */
const BUSY_WAIT_MS = parseInt(process.env.BUSY_WAIT_MS ?? "5000", 10);
/** 排队时的轮询间隔；越小越灵敏、越大越省 CPU */
const BUSY_POLL_MS = 150;

// MIME types for the formats this backend can emit
const MIME = {
  epub: "application/epub+zip",
  mobi: "application/x-mobipocket-ebook",
  azw: "application/x-mobipocket-ebook",
  azw3: "application/x-mobi8-ebook",
  pdf: "application/pdf",
  txt: "text/plain",
  txtz: "application/x-zip-compressed",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  html: "text/html",
  htmlz: "application/x-zip-compressed",
  rtf: "application/rtf",
  lit: "application/x-ms-reader",
  fb2: "application/x-fictionbook+xml",
  lrf: "application/x-sony-bbeb",
  pdb: "application/vnd.palm",
  rb: "application/x-rocketbook",
  snb: "application/x-sony-bbeb",
  tcr: "application/x-tcr",
  oeb: "application/oebps-package+xml",
  zip: "application/zip",
};

// Formats Calibre can natively produce on this backend (whitelist; Vercel only
// forwards these — see WP4 routing). Anything else -> clear 422 so Vercel can
// fall back to CloudConvert.
const BACKEND_TARGETS = new Set(Object.keys(MIME));

// P0 G-A: correlation headers on EVERY response that passed the secret check.
// `corr` = { requestId, jobId }; omitted only for the 403 secret failure (where
// leaking internal IDs to an unauthenticated caller would be unsafe) and health/404.
function json(res, status, obj, corr) {
  const body = JSON.stringify(obj);
  const headers = { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) };
  if (corr && corr.requestId) headers["X-Conversion-Request-Id"] = corr.requestId;
  if (corr && corr.jobId) headers["X-Conversion-Job-Id"] = corr.jobId;
  res.writeHead(status, headers);
  res.end(body);
}

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(" ")}\n`;
  try {
    fs.appendFileSync(path.join(LOG_DIR, "conversion.log"), line);
  } catch {
    /* logging must never break a conversion */
  }
  console.log(line.trim());
}

// --- single-slot concurrency gate (concurrency = 1) ---
let busy = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 尝试获取转换锁。锁空闲则立即取得；被占则在 waitMs 内轮询等待，
 * 超时才返回 false（调用方据此回 429 BACKEND_BUSY）。
 *
 * 竞态说明：Node 单线程，`if (!busy) { busy = true; }` 之间无 await，
 * 因此「检查 + 占位」是原子的，多个等待者不会同时拿到锁。
 *
 * @param {number} waitMs 最长等待毫秒数（<=0 表示不等待）
 * @param {() => boolean} [isAborted] 客户端是否已断开；断开则立刻放弃等待
 * @returns {Promise<boolean>} true = 已取得锁（调用方必须在 finally 释放）
 */
async function acquireConvertLock(waitMs, isAborted) {
  if (!busy) {
    busy = true;
    return true;
  }
  if (!(waitMs > 0)) return false;

  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    await sleep(BUSY_POLL_MS);
    if (isAborted && isAborted()) return false;
    if (!busy) {
      busy = true;
      return true;
    }
  }
  return false;
}

function safeCorrelationId(value) {
  return typeof value === "string" && /^[A-Za-z0-9-]{8,80}$/.test(value) ? value : null;
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    let fileMeta = null;
    let fileWriter = null;
    let aborted = false;
    // P0-A round2: hash uploaded bytes while streaming (no second disk read).
    const fileHash = createHash("sha256");

    const bb = Busboy({
      headers: req.headers,
      // Browser/undici multipart filenames are UTF-8 bytes, not Latin-1.
      defParamCharset: "utf8",
      limits: { files: 1, fileSize: MAX_FILE_BYTES },
    });

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("file", (_name, stream, info) => {
      const ext = path.extname(info.filename) || "";
      const tmp = path.join(TMP, `${randomUUID()}${ext}`);
      const ws = fs.createWriteStream(tmp);
      fileWriter = ws;
      fileMeta = { tmp, originalName: info.filename };
      // hash each chunk as it streams past (data listener coexists with pipe)
      stream.on("data", (chunk) => fileHash.update(chunk));
      stream.pipe(ws);
      stream.on("limit", () => {
        aborted = true;
        // Wait for the writer to close before unlinking: it may not have
        // opened its file yet when Busboy emits the size-limit event.
        stream.unpipe(ws);
        ws.once('close', async () => {
          try { await fsp.unlink(tmp); } catch { /* already absent */ }
          reject(new Error("FILE_TOO_LARGE"));
        });
        ws.destroy();
        stream.resume();
      });
      ws.on("error", (e) => reject(e));
    });

    bb.on("close", () => {
      if (aborted) return; // reject already fired
      // Multipart parsing can finish before the disk write has flushed.
      const fileSha256 = fileHash.digest("hex");
      if (fileWriter && !fileWriter.writableFinished) {
        fileWriter.once('finish', () => resolve({ fields, fileMeta, fileSha256 }));
      } else resolve({ fields, fileMeta, fileSha256 });
    });
    bb.on("error", (e) => reject(e));

    req.pipe(bb);
  });
}

async function doConvert(req, res) {
  // 1) secret
  const provided = req.headers["x-internal-convert"];
  if (!SECRET || provided !== SECRET) {
    // 403 不携带关联 ID：向未授权调用方泄露内部标识没有收益，且有信息泄露风险。
    return json(res, 403, { error: "Forbidden" });
  }

  // P0 G-A：request_id 与计时点提前到 secret 校验之后、multipart 解析之前。
  // 这样 400/413（解析阶段失败）也能携带 request_id 并输出 CORRELATION_FAIL，
  // 实现"每个请求都能追踪到最终结果或失败原因"。
  // jobId 仍在解析成功后生成——400/413 没有创建后台任务，不应伪装有 job，
  // 也避免改变 R4 的"后台任务数"基线口径。
  const requestId = safeCorrelationId(req.headers["x-request-id"]) || randomUUID();
  const correlationStarted = Date.now();
  let jobId;

  // 2) parse upload
  let parsed;
  try {
    parsed = await parseMultipart(req);
  } catch (e) {
    if (e && e.message === "FILE_TOO_LARGE") {
      log("CORRELATION_FAIL", "job=none", `request=${requestId}`, `duration=${Date.now() - correlationStarted}ms`, "code=FILE_TOO_LARGE");
      return json(res, 413, { error: "File too large.", code: "FILE_TOO_LARGE" }, { requestId });
    }
    log("CORRELATION_FAIL", "job=none", `request=${requestId}`, `duration=${Date.now() - correlationStarted}ms`, "code=BAD_REQUEST");
    return json(res, 400, { error: "Bad request body.", code: "BAD_REQUEST" }, { requestId });
  }
  const { fields, fileMeta, fileSha256 } = parsed;
  const sourceFormat = (fields.source_format || "").toLowerCase().replace(/^\./, "");
  const targetFormat = (fields.target_format || "").toLowerCase().replace(/^\./, "");
  const quality = fields.quality === "high" ? "high" : "default";

  // P0-A round2: server-computed content fingerprint. A completed request_id
  // replayed with the SAME content returns its recorded terminal result (no new
  // job); the SAME id with DIFFERENT content is rejected (409), never replayed.
  const fingerprint = contentFingerprint({ fileSha256, sourceFormat, targetFormat, quality });
  req.__fingerprint = fingerprint;
  const idemKey = safeCorrelationId(req.headers["x-request-id"]);
  if (idemKey) {
    const decision = completedLedger.decide(idemKey, fingerprint);
    if (decision) {
      // Uploaded temp file is never converted — unlink it to avoid a leak.
      if (fileMeta) try { await fsp.unlink(fileMeta.tmp); } catch {}
      if (decision.kind === "conflict") {
        log("IDEMPOTENCY_CONFLICT", `request=${idemKey}`, `fingerprint=${fingerprint.slice(0, 16)}`, `original=${String(decision.rec.fingerprint).slice(0, 16)}`);
        req.__completedReplay = true; // never overwrite the original terminal record
        return writeFingerprintConflict(res, idemKey, fingerprint, decision.rec);
      }
      log("IDEMPOTENT_COMPLETED_REPLAY", `request=${idemKey}`, `job=${decision.rec.jobId || "none"}`, `fingerprint=${fingerprint.slice(0, 16)}`);
      req.__completedReplay = true; // handler finally must NOT overwrite original record
      return writeCompletedReplay(res, decision.rec, fingerprint);
    }
  }

  jobId = randomUUID();
  const corr = { requestId, jobId };
  log("START", `job=${jobId}`, `request=${requestId}`, sourceFormat, "->", targetFormat);
  if (!fileMeta || !sourceFormat || !targetFormat) {
    if (fileMeta) try { await fsp.unlink(fileMeta.tmp); } catch {}
    log("CORRELATION_FAIL", `job=${jobId}`, `request=${requestId}`, `duration=${Date.now() - correlationStarted}ms`, "code=MISSING_FIELDS");
    return json(res, 400, { error: "Missing required fields: file, source_format, target_format" }, corr);
  }
  if (!BACKEND_TARGETS.has(targetFormat)) {
    try { await fsp.unlink(fileMeta.tmp); } catch {}
    log("CORRELATION_FAIL", `job=${jobId}`, `request=${requestId}`, `duration=${Date.now() - correlationStarted}ms`, "code=UNSUPPORTED_BACKEND_FORMAT");
    return json(res, 422, {
      error: `Target format "${targetFormat}" is not handled by the self-hosted backend.`,
      code: "UNSUPPORTED_BACKEND_FORMAT",
    }, corr);
  }

  // 3) convert
  const outExt = targetFormat;
  const outPath = path.join(TMP, `${randomUUID()}.${outExt}`);
  const started = Date.now();
  let result;
  try {
    result = await convertWithCalibre(fileMeta.tmp, outPath, {
      targetFormat,
      quality,
      timeout: CALIBRE_TIMEOUT,
    });
  } finally {
    // always remove the INPUT temp
    try { await fsp.unlink(fileMeta.tmp); } catch {}
  }

  if (!result.success) {
    try { await fsp.unlink(outPath); } catch {}
    log("FAIL", sourceFormat, "->", targetFormat, result.error);
    log("CORRELATION_FAIL", `job=${jobId}`, `request=${requestId}`, `duration=${Date.now() - correlationStarted}ms`, `code=${result.code || "CONVERSION_FAILED"}`);
    // 完整 stderr 单行落盘（2026-11-03，Job f547b469）：上一行只有 200 字符摘要，
    // 看得到异常类型却看不到上下文（哪一步、哪个成员、哪个路径）。压平换行是为了
    // 守住「一条日志一行」的格式——既有分析脚本都按行 grep。截 1500 字符控体积。
    if (result.rawStderr) {
      log("STDERR", String(result.rawStderr).replace(/\s+/g, " ").trim().slice(0, 1500));
    }
    // DRM 受保护是确定性用户侧输入问题，非后端健康故障：返回 422 + DRM_PROTECTED，
    // 让委托方短路返回「去 DRM」提示而不回退 CloudConvert、不计入熔断（2026-11-07）。
    const code = result.code || "CONVERSION_FAILED";
    // 2026-11-08（红队审计 #3）：BACKEND_UNAVAILABLE（spawn ENOENT / 超时 / 被 kill）
    // → HTTP 503，让前端按「健康失败」计数并触发熔断。若把它兜底进 CONVERSION_FAILED
    //（500），前端会视为确定性输入问题而不计数 —— Calibre 二进制损坏这类真故障
    // 将熔断永不开启、红卡永不发（后端静默死亡）。
    const status = code === "DRM_PROTECTED" ? 422 : code === "BACKEND_UNAVAILABLE" ? 503 : 500;
    return json(res, status, { error: result.error, code }, corr);
  }

  // 4) stream output back (mirror convert-handler.buildFileResponse contract)
  try {
    const outBuf = await fsp.readFile(outPath);
    const mime = MIME[targetFormat] || "application/octet-stream";
    const base = (fileMeta.originalName || "converted").replace(/\.[^.]+$/, "") || "converted";
    const asciiBase = base.replace(/[^\x20-\x7E]/g, "_").replace(/["\\;]/g, "_");
    const disp = `attachment; filename="${asciiBase}.${outExt}"; filename*=UTF-8''${encodeURIComponent(`${base}.${outExt}`)}`;
    res.writeHead(200, {
      "Content-Type": mime,
      "Content-Disposition": disp,
      "Cache-Control": "no-store",
      "Content-Length": outBuf.length,
      "X-Conversion-Request-Id": requestId,
      "X-Conversion-Job-Id": jobId,
    });
    res.end(outBuf);
    log("OK", sourceFormat, "->", targetFormat, `${outBuf.length}B`, `${Date.now() - started}ms`);
    log("CORRELATION_OK", `job=${jobId}`, `request=${requestId}`, `bytes=${outBuf.length}`, `duration=${Date.now() - correlationStarted}ms`);
  } catch {
    log("CORRELATION_FAIL", `job=${jobId}`, `request=${requestId}`, `duration=${Date.now() - correlationStarted}ms`, "code=OUTPUT_ERROR");
    return json(res, 500, { error: "Output read failed.", code: "OUTPUT_ERROR" }, corr);
  } finally {
    try { await fsp.unlink(outPath); } catch {}
  }
}

// P0 G-B: one in-flight de-dup store per backend process.
const idempotency = createIdempotencyStore();
// P0-A round2: persisted completed-request ledger (survives process restart).
const completedLedger = createCompletedLedger({
  filePath: path.join(LOG_DIR, "idempotency-ledger.jsonl"),
});
const loadedCompleted = completedLedger.load();
log("IDEMPOTENCY_LEDGER_LOADED", `entries=${loadedCompleted}`, `ttl=24h`, `max=1000`);

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") {
      return json(res, 200, { status: "ok", ts: Date.now() });
    }
    if (req.method === "POST" && req.url === "/api/convert-internal") {
      // request_id 只用于关联；幂等键额外要求格式合法（与 doConvert 的
      // safeCorrelationId 同一判据），无效/缺失则不去重、只生成随机 ID。
      const idemKey = safeCorrelationId(req.headers["x-request-id"]);

      // 幂等命中：在获取并发锁之前拦截。等待首请求的终态，回放相同字节/头，
      // 不占用并发槽位、不创建第二个 Calibre 任务、不生成第二个 jobId。
      if (idemKey && idempotency.has(idemKey)) {
        const entry = idempotency.get(idemKey);
        const result = await entry.promise;
        // 客户端已断开：不往关闭的 socket 写。
        if (res.writableEnded || req.destroyed) return;
        log("IDEMPOTENT_HIT", `request=${idemKey}`, `job=${result.jobId || "none"}`);
        return writeReplay(res, result);
      }

      // 首请求：注册幂等 entry（has→start 之间无 await，原子），并捕获写出结果
      // 供可能的重复请求回放。无有效 key 时不进 store，但仍需捕获？——不需要，
      // 只在该请求持有 entry 时捕获，避免无谓开销。
      const captured = idemKey ? captureResult(res) : null;
      const entry = idemKey ? idempotency.start(idemKey) : null;
      try {
        const queuedAt = Date.now();
        const acquired = await acquireConvertLock(
          BUSY_WAIT_MS,
          () => req.destroyed === true || res.writableEnded === true,
        );
        if (!acquired) {
          const waited = Date.now() - queuedAt;
          // 客户端已断开（Vercel abort）：不要再往已关闭的 socket 写响应
          if (res.writableEnded || req.destroyed) return;
          log("BUSY_REJECT", `waited=${waited}ms`);
          return json(res, 429, { error: "Backend busy, retry later.", code: "BACKEND_BUSY" });
        }
        const waited = Date.now() - queuedAt;
        if (waited > 0) log("BUSY_WAITED", `${waited}ms`);
        try {
          return await doConvert(req, res);
        } finally {
          busy = false;
        }
      } finally {
        // 终态收口：无论成功/失败/异常/客户端断开，都必须 resolve 等待者，
        // 否则相同 request_id 的并发请求会永久挂起。
        if (entry && captured) {
          if (!captured.finished) {
            // 客户端断开等场景：没有正常响应写出，合成一个明确的空终态，
            // 让等待者拿到 499 而不是永远等待（客户端关闭连接本就无响应）。
            captured.status = 499;
            captured.headers = {};
            captured.body = Buffer.alloc(0);
            captured.finished = true;
          }
          idempotency.finish(idemKey, captured);
          // P0-A round2: record terminal state for post-completion replay.
          // Skip if this was itself a completed-ledger replay/conflict (must not
          // overwrite the original record) or if the client aborted (499 is not
          // a real terminal outcome worth replaying).
          if (!req.__completedReplay && captured.status !== 499 && req.__fingerprint) {
            completedLedger.record({
              requestId: idemKey,
              fingerprint: req.__fingerprint,
              jobId: captured.headers["x-conversion-job-id"] || null,
              status: captured.status,
              headers: captured.headers,
              body: captured.body,
            });
          }
        }
      }
    }
    return json(res, 404, { error: "Not found" });
  } catch (e) {
    log("UNHANDLED", e && e.stack ? e.stack : String(e));
    if (!res.headersSent) json(res, 500, { error: "Internal error" });
  }
});

server.listen(PORT, BIND_HOST, () => {
  log(`bookconv-conversion-backend listening on ${BIND_HOST}:${PORT}`);
});
