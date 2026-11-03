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
import { randomUUID } from "node:crypto";
import Busboy from "busboy";
import { convertWithCalibre } from "./calibre.js";

const SECRET = process.env.CONVERSION_INTERNAL_SECRET;
const PORT = parseInt(process.env.PORT || "3001", 10);
const BIND_HOST = process.env.BIND_HOST || "127.0.0.1"; // internal only; nginx fronts it
const TMP = process.env.CONVERSION_TMP || "/opt/bookconv-conversion/data/tmp";
const LOG_DIR = process.env.CONVERSION_LOG_DIR || "/opt/bookconv-conversion/logs";
const MAX_FILE_BYTES = parseInt(process.env.MAX_FILE_BYTES || String(50 * 1024 * 1024), 10);
const CALIBRE_TIMEOUT = parseInt(process.env.CALIBRE_TIMEOUT || "120000", 10);
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

function json(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) });
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

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    let fileMeta = null;
    let fileWriter = null;
    let aborted = false;

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
      if (fileWriter && !fileWriter.writableFinished) {
        fileWriter.once('finish', () => resolve({ fields, fileMeta }));
      } else resolve({ fields, fileMeta });
    });
    bb.on("error", (e) => reject(e));

    req.pipe(bb);
  });
}

async function doConvert(req, res) {
  // 1) secret
  const provided = req.headers["x-internal-convert"];
  if (!SECRET || provided !== SECRET) {
    return json(res, 403, { error: "Forbidden" });
  }

  // 2) parse upload
  let parsed;
  try {
    parsed = await parseMultipart(req);
  } catch (e) {
    if (e && e.message === "FILE_TOO_LARGE") {
      return json(res, 413, { error: "File too large.", code: "FILE_TOO_LARGE" });
    }
    return json(res, 400, { error: "Bad request body.", code: "BAD_REQUEST" });
  }
  const { fields, fileMeta } = parsed;
  const sourceFormat = (fields.source_format || "").toLowerCase().replace(/^\./, "");
  const targetFormat = (fields.target_format || "").toLowerCase().replace(/^\./, "");
  const quality = fields.quality === "high" ? "high" : "default";

  if (!fileMeta || !sourceFormat || !targetFormat) {
    if (fileMeta) try { await fsp.unlink(fileMeta.tmp); } catch {}
    return json(res, 400, { error: "Missing required fields: file, source_format, target_format" });
  }
  if (!BACKEND_TARGETS.has(targetFormat)) {
    try { await fsp.unlink(fileMeta.tmp); } catch {}
    return json(res, 422, {
      error: `Target format "${targetFormat}" is not handled by the self-hosted backend.`,
      code: "UNSUPPORTED_BACKEND_FORMAT",
    });
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
    // 完整 stderr 单行落盘（2026-11-03，Job f547b469）：上一行只有 200 字符摘要，
    // 看得到异常类型却看不到上下文（哪一步、哪个成员、哪个路径）。压平换行是为了
    // 守住「一条日志一行」的格式——既有分析脚本都按行 grep。截 1500 字符控体积。
    if (result.rawStderr) {
      log("STDERR", String(result.rawStderr).replace(/\s+/g, " ").trim().slice(0, 1500));
    }
    return json(res, 500, { error: result.error, code: "CONVERSION_FAILED" });
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
    });
    res.end(outBuf);
    log("OK", sourceFormat, "->", targetFormat, `${outBuf.length}B`, `${Date.now() - started}ms`);
  } catch {
    return json(res, 500, { error: "Output read failed.", code: "OUTPUT_ERROR" });
  } finally {
    try { await fsp.unlink(outPath); } catch {}
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") {
      return json(res, 200, { status: "ok", ts: Date.now() });
    }
    if (req.method === "POST" && req.url === "/api/convert-internal") {
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
