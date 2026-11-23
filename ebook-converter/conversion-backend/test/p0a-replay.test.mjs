// test/p0a-replay.test.mjs
// P0-A round2 HTTP integration: post-completion replay, content conflict,
// post-timeout replay, and PROCESS RESTART — against the REAL backend with a
// fake copy-only ebook-convert. No real Calibre, no network, no credentials.
//
// Run: node conversion-backend/test/p0a-replay.test.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(__dirname, "..");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "bkconv-p0a-"));
const BIN = fs.mkdtempSync(path.join(os.tmpdir(), "bkconv-p0a-bin-"));
const SECRET = "test-secret-p0a";
const isWin = process.platform === "win32";
const fakeName = isWin ? "ebook-convert.cmd" : "ebook-convert";
fs.writeFileSync(
  path.join(BIN, fakeName),
  isWin ? `@echo off\ncopy /Y "%1" "%2" >nul\n` : "#!/bin/sh\ncp -- \"$1\" \"$2\"\n",
  { mode: 0o755 },
);

let pass = 0, fail = 0;
const check = (n, c, d) => { if (c) { pass++; console.log("  PASS", n); } else { fail++; console.log("  FAIL", n, d !== undefined ? `-> ${d}` : ""); } };

const envFor = (port) => ({
  ...process.env,
  CONVERSION_INTERNAL_SECRET: SECRET,
  CALIBRE_BIN: path.join(BIN, fakeName),
  CONVERSION_TMP: TMP,
  CONVERSION_LOG_DIR: TMP, // ledger persists here across restarts
  BIND_HOST: "127.0.0.1",
  PORT: String(port),
  MAX_FILE_BYTES: "2048",
  BUSY_WAIT_MS: "4000",
  PATH: `${BIN}${path.delimiter}${process.env.PATH}`,
});

function startServer(port) {
  const child = spawn(process.execPath, [path.join(APP, "app", "index.js")], {
    env: envFor(port), stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", () => {});
  child.stderr.on("data", () => {});
  return child;
}
async function waitHealth(port, timeout = 6000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try { const r = await fetch(`http://127.0.0.1:${port}/health`); if (r.ok) return true; } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}
function form(target = "mobi", bytes = "p0a-payload") {
  const fd = new FormData();
  fd.append("file", new Blob([Buffer.from(bytes)]), "book.epub");
  fd.append("source_format", "epub");
  fd.append("target_format", target);
  return fd;
}
const headers = (rid) => ({ "x-internal-convert": SECRET, ...(rid ? { "x-request-id": rid } : {}) });

async function main() {
  const PORT = 3111;
  const BASE = `http://127.0.0.1:${PORT}`;
  let child = startServer(PORT);
  check("backend started (proc #1)", await waitHealth(PORT));
  const logText = () => fs.readFileSync(path.join(TMP, "conversion.log"), "utf8");

  // ---- 1) first request -> creates a job, records terminal ----
  const rid = "req-p0a-complete-0001";
  let r1 = await fetch(`${BASE}/api/convert-internal`, { method: "POST", headers: headers(rid), body: form("mobi", "serial-replay-payload") });
  const b1 = Buffer.from(await r1.arrayBuffer());
  const job1 = r1.headers.get("x-conversion-job-id");
  check("first request 200 + job id", r1.status === 200 && /^[0-9a-f-]{36}$/.test(job1 || ""), `${r1.status} ${job1}`);
  // Wait for server-side teardown (await unlink + handler finally) to finish so
  // this is a genuine POST-COMPLETION replay, not an in-flight overlap.
  await new Promise((r) => setTimeout(r, 300));
  const startsBefore = (logText().match(/START /g) || []).length;

  // ---- 2) post-completion replay: SAME id + SAME content -> no new job ----
  let r2 = await fetch(`${BASE}/api/convert-internal`, { method: "POST", headers: headers(rid), body: form("mobi", "serial-replay-payload") });
  const startsAfter = (logText().match(/START /g) || []).length;
  check("post-completion replay does NOT create new job", startsAfter === startsBefore, `delta=${startsAfter - startsBefore}`);
  check("replay marked completed", r2.headers.get("x-conversion-idempotent-replay") === "completed", String(r2.headers.get("x-conversion-idempotent-replay")));
  check("replay carries original job id", r2.headers.get("x-conversion-job-id") === job1, `${r2.headers.get("x-conversion-job-id")} vs ${job1}`);
  check("IDEMPOTENT_COMPLETED_REPLAY logged", /IDEMPOTENT_COMPLETED_REPLAY request=req-p0a-complete-0001/.test(logText()));
  // success body >8KB would be 409 metadata-only; small file here is cached -> byte-identical
  const b2 = Buffer.from(await r2.arrayBuffer());
  check("replay body identical (small cached)", b2.equals(b1), `${b1.length} vs ${b2.length}`);

  // ---- 3) same id + DIFFERENT content -> 409 conflict, no new job ----
  const startsBeforeConflict = (logText().match(/START /g) || []).length;
  let r3 = await fetch(`${BASE}/api/convert-internal`, { method: "POST", headers: headers(rid), body: form("mobi", "DIFFERENT-content-payload") });
  const startsAfterConflict = (logText().match(/START /g) || []).length;
  check("content conflict -> 409", r3.status === 409, String(r3.status));
  const c3 = JSON.parse(await r3.text());
  check("content conflict code", c3.code === "IDEMPOTENCY_CONFLICT", c3.code);
  check("content conflict creates NO job", startsAfterConflict === startsBeforeConflict, `delta=${startsAfterConflict - startsBeforeConflict}`);
  check("IDEMPOTENCY_CONFLICT logged", /IDEMPOTENCY_CONFLICT request=req-p0a-complete-0001/.test(logText()));

  // ---- 4) post-timeout replay: use a failing terminal (422 unsupported) then replay ----
  const ridT = "req-p0a-timeout-00002";
  let t1 = await fetch(`${BASE}/api/convert-internal`, { method: "POST", headers: headers(ridT), body: form("xyz", "timeout-payload") });
  check("first failing request 422", t1.status === 422, String(t1.status));
  await new Promise((r) => setTimeout(r, 300)); // ensure terminal recorded
  const startsBeforeT = (logText().match(/START /g) || []).length;
  let t2 = await fetch(`${BASE}/api/convert-internal`, { method: "POST", headers: headers(ridT), body: form("xyz", "timeout-payload") });
  const startsAfterT = (logText().match(/START /g) || []).length;
  check("post-failure replay creates NO job", startsAfterT === startsBeforeT, `delta=${startsAfterT - startsBeforeT}`);
  check("post-failure replay returns same 422", t2.status === 422, String(t2.status));
  const tb2 = JSON.parse(await t2.text());
  check("post-failure replay keeps error code", tb2.code === "UNSUPPORTED_BACKEND_FORMAT", tb2.code);

  // ---- 5) PROCESS RESTART: kill proc #1, start proc #2 with same ledger ----
  child.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 400));
  const ledgerFile = path.join(TMP, "idempotency-ledger.jsonl");
  check("ledger persisted to disk", fs.existsSync(ledgerFile) && fs.readFileSync(ledgerFile, "utf8").trim().length > 0);
  const ledgerLines = fs.readFileSync(ledgerFile, "utf8").trim().split("\n").length;
  check("ledger has multiple terminal records", ledgerLines >= 2, `lines=${ledgerLines}`);
  child = startServer(PORT);
  check("backend restarted (proc #2)", await waitHealth(PORT));
  check("restart log shows ledger loaded", /IDEMPOTENCY_LEDGER_LOADED entries=[1-9]/.test(logText()));
  const startsBeforeRestart = (logText().match(/START /g) || []).length;
  let r4 = await fetch(`${BASE}/api/convert-internal`, { method: "POST", headers: headers(rid), body: form("mobi", "serial-replay-payload") });
  const startsAfterRestart = (logText().match(/START /g) || []).length;
  check("AFTER RESTART replay creates NO job", startsAfterRestart === startsBeforeRestart, `delta=${startsAfterRestart - startsBeforeRestart}`);
  check("AFTER RESTART replay marked completed", r4.headers.get("x-conversion-idempotent-replay") === "completed", String(r4.headers.get("x-conversion-idempotent-replay")));
  check("AFTER RESTART original job id preserved", r4.headers.get("x-conversion-job-id") === job1);

  // ---- 6) negative control on proc #2: fresh id still creates a job ----
  const startsBeforeFresh = (logText().match(/START /g) || []).length;
  let rf = await fetch(`${BASE}/api/convert-internal`, { method: "POST", headers: headers("req-p0a-fresh-000003"), body: form("mobi", "fresh-payload") });
  const startsAfterFresh = (logText().match(/START /g) || []).length;
  check("fresh id after restart DOES create job", rf.status === 200 && startsAfterFresh - startsBeforeFresh === 1, `delta=${startsAfterFresh - startsBeforeFresh}`);

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  try { child.kill("SIGTERM"); } catch {}
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.rmSync(BIN, { recursive: true, force: true });
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); try { child?.kill("SIGTERM"); } catch {} process.exit(1); });
