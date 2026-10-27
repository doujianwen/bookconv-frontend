// test/mock-run.js
// Local contract test WITHOUT Calibre: installs a fake `ebook-convert` on PATH
// that copies input -> output, then exercises the real HTTP server:
//   - GET /health -> 200
//   - POST /api/convert-internal with correct secret -> 200 + file bytes + Content-Disposition
//   - POST with wrong secret -> 403
//   - temp files cleaned up after each request
import { execSync } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(__dirname, "..");

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "bkconv-tmp-"));
const FAKEBIN = fs.mkdtempSync(path.join(os.tmpdir(), "bkconv-bin-"));
const SECRET = "test-secret-123";

// fake ebook-convert (Windows-runnable): copy input -> output. On the Linux
// server this is the real Calibre binary on PATH.
fs.writeFileSync(
  path.join(FAKEBIN, "ebook-convert.cmd"),
  `@echo off\ncopy /Y "%1" "%2" >nul\n`,
);

process.env.CONVERSION_INTERNAL_SECRET = SECRET;
process.env.CALIBRE_BIN = path.join(FAKEBIN, "ebook-convert.cmd");
process.env.CONVERSION_TMP = TMP;
process.env.CONVERSION_LOG_DIR = TMP;
process.env.BIND_HOST = "127.0.0.1";
process.env.PORT = "3099";
process.env.PATH = `${FAKEBIN}${path.delimiter}${process.env.PATH}`;

async function main() {
  await import(pathToFileURL(path.join(APP, "app", "index.js")).href);
  await new Promise((r) => setTimeout(r, 400)); // let listen() settle

  const BASE = "http://127.0.0.1:3099";
  let pass = 0;
  let fail = 0;
  const check = (name, cond) => {
    if (cond) { pass++; console.log("  PASS", name); }
    else { fail++; console.log("  FAIL", name); }
  };

  // 1) health
  let r = await fetch(`${BASE}/health`);
  check("GET /health = 200", r.status === 200);

  // 2) wrong secret -> 403
  const fd = new FormData();
  fd.append("file", new Blob([Buffer.from("hello epub")]), "book.epub");
  fd.append("source_format", "epub");
  fd.append("target_format", "mobi");
  r = await fetch(`${BASE}/api/convert-internal`, { method: "POST", headers: { "x-internal-convert": "wrong" }, body: fd });
  check("wrong secret -> 403", r.status === 403);

  // 3) correct secret -> 200 + bytes + Content-Disposition
  const fd2 = new FormData();
  fd2.append("file", new Blob([Buffer.from("hello epub content")]), "我的书.epub");
  fd2.append("source_format", "epub");
  fd2.append("target_format", "mobi");
  r = await fetch(`${BASE}/api/convert-internal`, { method: "POST", headers: { "x-internal-convert": SECRET }, body: fd2 });
  const buf = Buffer.from(await r.arrayBuffer());
  const disp = r.headers.get("content-disposition") || "";
  check("correct secret -> 200", r.status === 200);
  check("returns file bytes", buf.toString().includes("hello epub content"));
  check("Content-Disposition has ASCII fallback", /filename="[^"]+\.mobi"/.test(disp));
  check("Content-Disposition has UTF-8'' (RFC5987)", /filename\*=UTF-8''/.test(disp));
  check("Cache-Control no-store", (r.headers.get("cache-control") || "").includes("no-store"));

  // 4) unsupported target -> 422
  const fd3 = new FormData();
  fd3.append("file", new Blob([Buffer.from("x")]), "a.epub");
  fd3.append("source_format", "epub");
  fd3.append("target_format", "xyz");
  r = await fetch(`${BASE}/api/convert-internal`, { method: "POST", headers: { "x-internal-convert": SECRET }, body: fd3 });
  check("unsupported target -> 422", r.status === 422);

  // 5) temp cleanup: TMP should have no leftover .epub/.mobi
  const leftovers = fs.readdirSync(TMP).filter((f) => /\.(epub|mobi|tmp)$/.test(f));
  check("temp files cleaned up", leftovers.length === 0);

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
