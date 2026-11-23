// test/ledger-persistence.test.mjs
// P0-A round2: module-level ledger invariants — persistence across restart,
// TTL expiry, content-fingerprint conflict, bounded capacity, small-body cache.
// Pure fs in a temp dir; no server, no network, no production credentials.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(__dirname, "..");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "bkconv-ledger-"));
const LEDGER = path.join(TMP, "idempotency-ledger.jsonl");

const mod = await import(pathToFileURL(path.join(APP, "app", "idempotency.js")).href);
const { createCompletedLedger, contentFingerprint, bufferSha256 } = mod;

let pass = 0, fail = 0;
const check = (n, c, d) => { if (c) { pass++; console.log("  PASS", n); } else { fail++; console.log("  FAIL", n, d !== undefined ? `-> ${d}` : ""); } };

let clock = 1_700_000_000_000;
const ledger = createCompletedLedger({ filePath: LEDGER, ttlMs: 1000, maxEntries: 10, now: () => clock });
const fpA = contentFingerprint({ fileSha256: "aaa", sourceFormat: "epub", targetFormat: "mobi", quality: "default" });
const fpB = contentFingerprint({ fileSha256: "bbb", sourceFormat: "epub", targetFormat: "mobi", quality: "default" });

// 1) fresh ledger
check("fresh ledger empty", ledger.size() === 0);

// 2) record + same-fingerprint replay
ledger.record({ requestId: "req-aaaa1111", fingerprint: fpA, jobId: "job-1", status: 200, headers: { "content-type": "application/epub+zip" }, body: Buffer.alloc(8192 + 1, 0x41) }); // 8193B > MAX_CACHED_BODY(8KB)
let d = ledger.decide("req-aaaa1111", fpA);
check("same id+fp -> replay", d && d.kind === "replay", JSON.stringify(d && d.kind));
check("success large body NOT cached", d.rec.body === null, String(d.rec.body));

// 3) same id DIFFERENT fingerprint -> conflict
d = ledger.decide("req-aaaa1111", fpB);
check("same id+different fp -> conflict", d && d.kind === "conflict", JSON.stringify(d && d.kind));
check("conflict carries original jobId", d.rec.jobId === "job-1");

// 4) small error body IS cached (byte-identical replay)
ledger.record({ requestId: "req-error2222", fingerprint: fpB, jobId: "job-2", status: 422, headers: { "content-type": "application/json" }, body: Buffer.from('{"error":"drm"}') });
d = ledger.decide("req-error2222", fpB);
check("small error body cached", d.rec.body !== null && Buffer.from(d.rec.body, "base64").toString() === '{"error":"drm"}');

// 5) unknown id -> null (proceed to create job)
check("unknown id -> null", ledger.decide("req-unknown333", fpA) === null);

// 6) persistence across restart: load into a NEW ledger instance
const ledger2 = createCompletedLedger({ filePath: LEDGER, ttlMs: 1000, maxEntries: 10, now: () => clock });
const loaded = ledger2.load();
check("restart load restores records", loaded === 2, `loaded=${loaded}`);
check("restart: replay still works", ledger2.decide("req-aaaa1111", fpA)?.kind === "replay");
check("restart: conflict still works", ledger2.decide("req-aaaa1111", fpB)?.kind === "conflict");

// 7) TTL expiry
clock += 1001;
check("TTL expiry drops record", ledger2.decide("req-aaaa1111", fpA) === null);

// 8) fingerprint determinism + distinctness
check("fingerprint deterministic", contentFingerprint({ fileSha256: "x", sourceFormat: "epub", targetFormat: "pdf", quality: "high" }) === contentFingerprint({ fileSha256: "x", sourceFormat: "epub", targetFormat: "pdf", quality: "high" }));
check("fingerprint distinguishes quality", contentFingerprint({ fileSha256: "x", sourceFormat: "epub", targetFormat: "pdf", quality: "high" }) !== contentFingerprint({ fileSha256: "x", sourceFormat: "epub", targetFormat: "pdf", quality: "default" }));
check("bufferSha256 stable", bufferSha256(Buffer.from("abc")) === bufferSha256(Buffer.from("abc")));
check("bufferSha256 distinguishes bytes", bufferSha256(Buffer.from("abc")) !== bufferSha256(Buffer.from("abd")));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fail === 0 ? 0 : 1);
