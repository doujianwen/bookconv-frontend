// app/idempotency.js
// Request de-duplication for the synchronous conversion backend.
//
// TWO LAYERS (2026-11-21, P0-A round2):
//   1. in-flight  — concurrent duplicate requests with the same x-request-id
//      wait on one promise (no second Calibre job). Lifetime = until terminal.
//   2. completed  — terminal requests are recorded to a bounded, TTL'd,
//      disk-persisted ledger so that AFTER completion a replay of the same
//      request does NOT create a second job, and survives process restart.
//
// WHY layer 2 was required by the CEO red-team round2: the round1 store deleted
// every entry in finish(), so a serial replay after completion created a new
// job — an explicit documented residual. Round2 closes it.
//
// CONTENT FINGERPRINT: the same request_id with DIFFERENT content MUST be
// rejected (409 IDEMPOTENCY_CONFLICT), never silently replayed. Fingerprint =
// sha256(fileBytes || "\0" || source_format || "\0" || target_format || "\0" || quality).
// It is computed on the server from the uploaded bytes (never trusted from a
// client header).
//
// MEMORY SAFETY: successful conversion output bytes are NOT cached (memory.peak
// 474MB vs systemd 1.2G). Only small terminal JSON bodies (<8KB, i.e. errors)
// are retained for byte-identical replay; a success replay returns an explicit
// 409 IDEMPOTENT_ALREADY_COMPLETED + the original jobId, never truncated bytes.
//
// DESIGN: docs/tasks/bookconv-ceo-remediation-20261121-r2/00_round2_design.md

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const DEFAULT_MAX_ENTRIES = 1000;
const MAX_CACHED_BODY = 8 * 1024; // only small error JSON bodies are cached

/** Stable content fingerprint. Order of fields is fixed by this function. */
export function contentFingerprint({ fileSha256 = "", sourceFormat = "", targetFormat = "", quality = "" } = {}) {
  return createHash("sha256")
    .update(`${fileSha256}\0${sourceFormat}\0${targetFormat}\0${quality}`)
    .digest("hex");
}

/** sha256 of a Buffer (used on uploaded bytes during multipart parse). */
export function bufferSha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

/**
 * Completed-request ledger. Bounded + TTL + disk-persisted (JSONL append-only).
 * One instance per backend process; loaded from disk at startup (survives restart).
 */
export function createCompletedLedger({ filePath = null, ttlMs = DEFAULT_TTL_MS, maxEntries = DEFAULT_MAX_ENTRIES, now = () => Date.now() } = {}) {
  /** @type {Map<string, {requestId:string, fingerprint:string, jobId:string|null, status:number, headers:Object, body:string|null, completedAt:number}>} */
  const entries = new Map();

  function _expire() {
    const cutoff = now() - ttlMs;
    for (const [k, v] of entries) if (v.completedAt < cutoff) entries.delete(k);
  }

  function load() {
    entries.clear();
    if (!filePath) return 0;
    try {
      const text = fs.readFileSync(filePath, "utf8");
      for (const line of text.split("\n")) {
        if (!line.trim()) continue;
        try {
          const rec = JSON.parse(line);
          if (rec && typeof rec.requestId === "string") entries.set(rec.requestId, rec);
        } catch { /* skip corrupt line — never break startup */ }
      }
    } catch { /* no ledger yet — normal first run */ }
    _expire();
    return entries.size;
  }

  function get(requestId) {
    if (!requestId) return null;
    const e = entries.get(requestId);
    if (!e) return null;
    if (e.completedAt < now() - ttlMs) { entries.delete(requestId); return null; }
    return e;
  }

  function has(requestId) { return get(requestId) !== null; }

  /**
   * One terminal record. Cache body only when small (errors); successful large
   * file bytes are intentionally NOT stored — replay returns explicit 409.
   */
  function record({ requestId, fingerprint, jobId, status, headers = {}, body = null }) {
    if (!requestId) return false;
    const bodyBuf = body === null ? null : (Buffer.isBuffer(body) ? body : Buffer.from(body));
    const cacheBody = bodyBuf && bodyBuf.length <= MAX_CACHED_BODY
      ? bodyBuf.toString("base64")
      : null;
    const rec = {
      requestId,
      fingerprint,
      jobId: typeof jobId === "string" ? jobId : null,
      status: Number(status) || 200,
      headers: { ...headers },
      body: cacheBody,
      completedAt: now(),
    };
    entries.set(requestId, rec);
    if (filePath) {
      try { fs.appendFileSync(filePath, JSON.stringify(rec) + "\n"); } catch { /* logging must not break conversion */ }
    }
    _expire();
    while (entries.size > maxEntries) {
      const oldest = [...entries.entries()].sort((a, b) => a[1].completedAt - b[1].completedAt)[0];
      if (!oldest) break;
      entries.delete(oldest[0]);
    }
    return true;
  }

  /**
   * Decide a completed replay.
   * @returns {null|{kind:'replay', rec:Object}|{kind:'conflict', rec:Object}}
   *   null        = not in ledger → caller proceeds to create a job
   *   replay      = same fingerprint → return recorded terminal result (no new job)
   *   conflict    = same request_id but DIFFERENT fingerprint → reject 409
   */
  function decide(requestId, fingerprint) {
    const rec = get(requestId);
    if (!rec) return null;
    if (rec.fingerprint === fingerprint) return { kind: "replay", rec };
    return { kind: "conflict", rec };
  }

  function size() { _expire(); return entries.size; }

  return { load, get, has, record, decide, size, _expire };
}

/**
 * Create an isolated in-flight store. One instance per backend process.
 * (Round1 semantics preserved unchanged — concurrent de-dup only.)
 */
export function createIdempotencyStore() {
  /** @type {Map<string, {requestId:string, jobId:string|null, promise:Promise<any>, resolve:(v:any)=>void, startedAt:number}>} */
  const inflight = new Map();

  function has(requestId) {
    return inflight.has(requestId);
  }

  function start(requestId) {
    let resolve;
    const promise = new Promise((r) => { resolve = r; });
    const entry = { requestId, jobId: null, promise, resolve, startedAt: Date.now() };
    inflight.set(requestId, entry);
    return entry;
  }

  function get(requestId) {
    return inflight.get(requestId) || null;
  }

  function finish(requestId, result) {
    const entry = inflight.get(requestId);
    if (!entry) return false;
    const h = result && result.headers ? result.headers : {};
    const jid = h["x-conversion-job-id"];
    if (!entry.jobId && typeof jid === "string") entry.jobId = jid;
    entry.resolve({ ...(result || {}), jobId: entry.jobId });
    inflight.delete(requestId);
    return true;
  }

  function size() {
    return inflight.size;
  }

  return { has, start, get, finish, size };
}

/** Wrap a ServerResponse to capture status/headers/body for in-flight replay. */
export function captureResult(res) {
  const captured = { status: 200, headers: {}, body: Buffer.alloc(0), finished: false };

  const origWriteHead = typeof res.writeHead === "function" ? res.writeHead.bind(res) : null;
  if (origWriteHead) {
    res.writeHead = (status, headers) => {
      captured.status = status;
      captured.finished = true;
      if (headers && typeof headers === "object" && !Array.isArray(headers)) {
        for (const [k, v] of Object.entries(headers)) captured.headers[String(k).toLowerCase()] = v;
      }
      return origWriteHead(status, headers);
    };
  }

  const origEnd = res.end.bind(res);
  res.end = (chunk, ...rest) => {
    if (chunk !== undefined && chunk !== null) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      captured.body = Buffer.concat([captured.body, buf]);
    }
    captured.finished = true;
    return origEnd(chunk, ...rest);
  };

  return captured;
}

/** Write the captured first-response to a de-duplicated waiter. */
export function writeReplay(res, result) {
  const headers = { ...(result.headers || {}) };
  headers["x-conversion-idempotent-hit"] = "true";
  if (result.jobId && !headers["x-conversion-job-id"]) {
    headers["x-conversion-job-id"] = result.jobId;
  }
  res.writeHead(result.status || 200, headers);
  res.end(result.body || Buffer.alloc(0));
}

/**
 * Write a completed-ledger replay to a serial replay request.
 * - small cached error body  -> byte-identical replay with explicit marker
 * - large/success body       -> 409 + JSON stating completion, original jobId;
 *                               NEVER emit truncated file bytes as a fake success.
 */
export function writeCompletedReplay(res, rec, fingerprint) {
  const headers = {
    "Content-Type": "application/json",
    "X-Conversion-Idempotent-Replay": "completed",
    "X-Conversion-Request-Id": rec.requestId,
  };
  if (rec.jobId) headers["X-Conversion-Job-Id"] = rec.jobId;
  headers["X-Conversion-Fingerprint"] = fingerprint;

  if (rec.body !== null && rec.body !== undefined) {
    // Cached terminal (usually error) JSON: replay original bytes + status.
    headers["x-conversion-idempotent-hit"] = "true";
    res.writeHead(rec.status || 200, headers);
    res.end(Buffer.from(rec.body, "base64"));
    return { status: rec.status || 200, kind: "cached" };
  }
  const payload = JSON.stringify({
    error: "This request_id has already completed; no new job was created.",
    code: "IDEMPOTENT_ALREADY_COMPLETED",
    job_id: rec.jobId,
  });
  headers["Content-Length"] = Buffer.byteLength(payload);
  res.writeHead(409, headers);
  res.end(payload);
  return { status: 409, kind: "metadata-only" };
}

/** Reject a same-id / different-content replay. NEVER creates a job. */
export function writeFingerprintConflict(res, requestId, fingerprint, rec) {
  const payload = JSON.stringify({
    error: "request_id already used with different request content.",
    code: "IDEMPOTENCY_CONFLICT",
    job_id: rec && rec.jobId ? rec.jobId : null,
  });
  res.writeHead(409, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    "X-Conversion-Request-Id": requestId,
    "X-Conversion-Idempotent-Replay": "conflict",
    "X-Conversion-Fingerprint": fingerprint,
  });
  res.end(payload);
}
