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
// never swamped; second concurrent request gets 429. Temp files live in
// CONVERSION_TMP (a tmpfs on the server) and are always cleaned up.
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

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    let fileMeta = null;
    let aborted = false;

    const bb = Busboy({
      headers: req.headers,
      limits: { files: 1, fileSize: MAX_FILE_BYTES },
    });

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("file", (_name, stream, info) => {
      const ext = path.extname(info.filename) || "";
      const tmp = path.join(TMP, `${randomUUID()}${ext}`);
      const ws = fs.createWriteStream(tmp);
      fileMeta = { tmp, originalName: info.filename };
      stream.pipe(ws);
      stream.on("limit", () => {
        aborted = true;
        try {
          fs.unlinkSync(tmp);
        } catch {
          /* ignore */
        }
        reject(new Error("FILE_TOO_LARGE"));
      });
      ws.on("error", (e) => reject(e));
    });

    bb.on("close", () => {
      if (aborted) return; // reject already fired
      resolve({ fields, fileMeta });
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
  } catch (e) {
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
      if (busy) {
        return json(res, 429, { error: "Backend busy, retry later.", code: "BACKEND_BUSY" });
      }
      busy = true;
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
