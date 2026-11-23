// test/correlation-idempotency.test.mjs
// P0 (2026-11-21): verifies failure-path correlation headers and in-flight
// request de-duplication against the REAL HTTP backend, with a fake copy-only
// ebook-convert. No real Calibre, no network, no production credentials.
//
// Run: node conversion-backend/test/correlation-idempotency.test.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(__dirname, "..");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "bkconv-correl-"));
const FAKEBIN = fs.mkdtempSync(path.join(os.tmpdir(), "bkconv-correl-bin-"));
const SECRET = "test-secret-corr";
const BASE = "http://127.0.0.1:3107";
const PORT = "3107";

// Copy-only fake: no conversion quality claim, just deterministic bytes.
const isWin = process.platform === "win32";
const fakeName = isWin ? "ebook-convert.cmd" : "ebook-convert";
fs.writeFileSync(
  path.join(FAKEBIN, fakeName),
  isWin ? `@echo off\ncopy /Y "%1" "%2" >nul\n` : "#!/bin/sh\ncp -- \"$1\" \"$2\"\n",
  { mode: 0o755 },
);
process.env.CONVERSION_INTERNAL_SECRET = SECRET;
process.env.CALIBRE_BIN = path.join(FAKEBIN, fakeName);
process.env.CONVERSION_TMP = TMP;
process.env.CONVERSION_LOG_DIR = TMP;
process.env.BIND_HOST = "127.0.0.1";
process.env.PORT = PORT;
process.env.MAX_FILE_BYTES = "2048";
process.env.BUSY_WAIT_MS = "4000";
process.env.PATH = `${FAKEBIN}${path.delimiter}${process.env.PATH}`;

let pass = 0;
let fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log("  PASS", name); }
  else { fail++; console.log("  FAIL", name, detail !== undefined ? `-> ${detail}` : ""); }
};

function form(target = "mobi", bytes = "hello correlation world") {
  const fd = new FormData();
  fd.append("file", new Blob([Buffer.from(bytes)]), "book.epub");
  fd.append("source_format", "epub");
  fd.append("target_format", target);
  return fd;
}
const headers = (rid) => ({ "x-internal-convert": SECRET, ...(rid ? { "x-request-id": rid } : {}) });
const logText = () => fs.readFileSync(path.join(TMP, "conversion.log"), "utf8");

async function main() {
  await import(pathToFileURL(path.join(APP, "app", "index.js")).href);
  await new Promise((r) => setTimeout(r, 400));

  // ---- 1) failure paths carry correlation headers (G-A) ----
  let r = await fetch(`${BASE}/api/convert-internal`, {
    method: "POST", headers: headers("req-fail-422-abcdefgh"), body: form("xyz"),
  });
  check("422 response carries request id", r.headers.get("x-conversion-request-id") === "req-fail-422-abcdefgh", r.headers.get("x-conversion-request-id"));
  check("422 response carries job id", /^[0-9a-f-]{36}$/.test(r.headers.get("x-conversion-job-id") || ""), r.headers.get("x-conversion-job-id"));
  check("422 has CORRELATION_FAIL log", /CORRELATION_FAIL job=[0-9a-f-]+ request=req-fail-422-abcdefgh/.test(logText()));

  r = await fetch(`${BASE}/api/convert-internal`, {
    method: "POST",
    headers: { "x-internal-convert": SECRET, "Content-Type": "multipart/form-data; boundary=missing" },
    body: "not-multipart",
  });
  check("400 response carries request id", /^[A-Za-z0-9-]{8,80}$/.test(r.headers.get("x-conversion-request-id") || ""), r.headers.get("x-conversion-request-id"));
  check("400 response has no job id (no backend task created)", !r.headers.get("x-conversion-job-id"));
  check("400 has CORRELATION_FAIL log", /CORRELATION_FAIL job=none request=/.test(logText()));

  const tooBig = form("mobi", "x".repeat(3000));
  r = await fetch(`${BASE}/api/convert-internal`, { method: "POST", headers: headers("req-too-big-123456"), body: tooBig });
  check("413 response carries request id", r.headers.get("x-conversion-request-id") === "req-too-big-123456", r.headers.get("x-conversion-request-id"));
  check("413 has CORRELATION_FAIL log", /CORRELATION_FAIL job=none request=req-too-big-123456/.test(logText()));

  r = await fetch(`${BASE}/api/convert-internal`, {
    method: "POST", headers: { "x-internal-convert": "wrong", "x-request-id": "req-403-secret" }, body: form(),
  });
  check("403 does NOT leak correlation id", !r.headers.get("x-conversion-request-id") && !r.headers.get("x-conversion-job-id"));

  // ---- 2) concurrent duplicate requests de-duplicate (G-B) ----
  const dupRid = "req-dup-concurrent-0001";
  const beforeLog = logText();
  const startsBefore = (beforeLog.match(/START /g) || []).length;
  const bodies = Array.from({ length: 3 }, () => "dedup-payload-" + dupRid);
  const responses = await Promise.all(
    bodies.map((b) => fetch(`${BASE}/api/convert-internal`, {
      method: "POST", headers: headers(dupRid), body: form("mobi", b),
    })),
  );
  const bufs = await Promise.all(responses.map((x) => x.arrayBuffer().then((ab) => Buffer.from(ab).toString())));
  const hitFlags = responses.map((x) => x.headers.get("x-conversion-idempotent-hit"));
  const jobIds = responses.map((x) => x.headers.get("x-conversion-job-id"));
  const startAfter = (logText().match(/START /g) || []).length;

  check("3 concurrent duplicates -> all 200", responses.every((x) => x.status === 200), responses.map((x) => x.status).join(","));
  check("only ONE START log for 3 duplicates", startAfter - startsBefore === 1, `delta=${startAfter - startsBefore}`);
  check("all duplicate bytes identical to first", bufs.every((b) => b === bufs[0]), JSON.stringify(bufs));
  check("first request has no idempotent-hit header", hitFlags[0] === null, String(hitFlags[0]));
  check("2 replayed requests marked idempotent-hit", hitFlags[1] === "true" && hitFlags[2] === "true", JSON.stringify(hitFlags));
  check("all duplicates share the SAME job id", new Set(jobIds).size === 1 && /^[0-9a-f-]{36}$/.test(jobIds[0] || ""), JSON.stringify(jobIds));
  check("IDEMPOTENT_HIT logged twice", (logText().match(/IDEMPOTENT_HIT /g) || []).length === 2, String((logText().match(/IDEMPOTENT_HIT /g) || []).length));
  check("replayed bytes equal first (no data loss)", bufs[1] === bufs[0] && bufs[2] === bufs[0]);

  // ---- 3) negative control: different request ids -> different jobs (no false dedup) ----
  const [a, b] = await Promise.all(
    ["req-distinct-A-000001", "req-distinct-B-000001"].map((rid) =>
      fetch(`${BASE}/api/convert-internal`, { method: "POST", headers: headers(rid), body: form("mobi") })),
  );
  check("distinct request ids -> both 200", a.status === 200 && b.status === 200);
  check("distinct request ids -> different jobs", a.headers.get("x-conversion-job-id") !== b.headers.get("x-conversion-job-id"));
  check("distinct request ids -> no idempotent hit", !a.headers.get("x-conversion-idempotent-hit") && !b.headers.get("x-conversion-idempotent-hit"));

  // ---- 4) audit sample output (per-request, not aggregate) ----
  const audit = [];
  for (const line of logText().split("\n").filter(Boolean)) {
    const jm = line.match(/job=([0-9a-f-]+)/);
    const rm = line.match(/request=([A-Za-z0-9-]+)/);
    if (!jm || !rm) continue;
    if (/CORRELATION_OK/.test(line)) audit.push({ request_id: rm[1], job_id: jm[1], outcome: "success" });
    else if (/CORRELATION_FAIL/.test(line)) audit.push({ request_id: rm[1], job_id: jm[1], outcome: "failure" });
  }
  const ih = (logText().match(/IDEMPOTENT_HIT request=([A-Za-z0-9-]+) job=([0-9a-f-]+)/g) || []);
  for (const m of ih) {
    const mm = m.match(/request=([A-Za-z0-9-]+) job=([0-9a-f-]+)/);
    if (mm) audit.push({ request_id: mm[1], job_id: mm[2], outcome: "idempotent_hit" });
  }
  const auditPath = path.join(APP, "..", "docs", "tasks", "bookconv-ceo-remediation-20261121", "evidence");
  fs.mkdirSync(auditPath, { recursive: true });
  const outFile = path.join(auditPath, "P0-audit-samples.jsonl");
  fs.writeFileSync(outFile, audit.map((x) => JSON.stringify(x)).join("\n") + "\n");
  check("audit sample covers dup request", audit.some((x) => x.request_id === dupRid && x.outcome === "idempotent_hit"));
  check("audit sample file written", fs.existsSync(outFile) && audit.length > 0, outFile);

  console.log(`\nAUDIT_FILE=${outFile}`);
  console.log(`AUDIT_ROWS=${audit.length}`);
  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
