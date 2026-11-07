// test/calibre-drm.test.mjs
// 直接单测 convertWithCalibre 的 DRM 检测（无需真实 Calibre / HTTP server）。
// 用 node 做假 ebook-convert：退出码 1 + 受控 stderr。
//
// 验证 2026-11-07 修复：原 /\bDRM\b/i 匹配不到 calibre.ebooks.DRMError
// （DRM 紧贴 Error 无词边界），导致 DRM 分支永不触发、被兜底成 CONVERSION_FAILED。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(__dirname, "..");

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "bkconv-drm-"));
const isWin = process.platform === "win32";
const fakeShim = path.join(TMP, isWin ? "fake-calibre.cmd" : "fake-calibre.sh");
const fakeMain = path.join(TMP, "fake-calibre.mjs");

// 假 ebook-convert 主程序：把 FAKE_STDERR 写到 stderr 并退出 1。
fs.writeFileSync(fakeMain, `process.stderr.write(process.env.FAKE_STDERR || "Unknown error");\nprocess.exit(1);\n`);

if (isWin) {
  fs.writeFileSync(fakeShim, `@echo off\r\nnode "%~dp0fake-calibre.mjs" %*\r\nexit /b %errorlevel%\r\n`);
} else {
  fs.writeFileSync(fakeShim, `#!/bin/sh\nnode "$(dirname "$0")/fake-calibre.mjs" "$@"\nexit $?\n`);
  fs.chmodSync(fakeShim, 0o755);
}
process.env.CALIBRE_BIN = fakeShim;

const { convertWithCalibre } = await import(pathToFileURL(path.join(APP, "app", "calibre.js")).href);

const inFile = path.join(TMP, "in.epub");
const outFile = path.join(TMP, "out.mobi");
fs.writeFileSync(inFile, "dummy");

let pass = 0;
let fail = 0;
const check = (name, cond) => {
  if (cond) { pass++; console.log("  PASS", name); }
  else { fail++; console.log("  FAIL", name); }
};

const runWith = async (stderr) => {
  process.env.FAKE_STDERR = stderr;
  return convertWithCalibre(inFile, outFile, { targetFormat: "mobi" });
};

// 1) 本罪证形态：calibre.ebooks.DRMError（原正则漏匹配）
const r1 = await runWith(
  "Traceback (most recent call last):\n  File \"calibre/ebooks/epub.py\", line 1\ncalibre.ebooks.DRMError: bb659e02-1755-4400-90c7-4cceca66ad02.epub",
);
check("DRMError -> success false", r1.success === false);
check("DRMError -> message unchanged", r1.error === "This file is protected by DRM and cannot be converted.");
check("DRMError -> code DRM_PROTECTED", r1.code === "DRM_PROTECTED");

// 2) 非 DRM 损坏（BadZipfile）不应被误判 DRM
const r2 = await runWith("calibre.utils.zipfile.BadZipfile: File is not a zip file");
check("BadZipfile -> success false", r2.success === false);
check("BadZipfile -> NOT DRM code", r2.code !== "DRM_PROTECTED");

// 3) 独立单词 DRM（"protected by DRM"）仍应命中
const r3 = await runWith("This book is DRM-protected and cannot be opened.");
check("standalone DRM -> code DRM_PROTECTED", r3.code === "DRM_PROTECTED");

// 4) 正常转换（无错误）仍 success（回归保护）
process.env.FAKE_STDERR = "";
fs.writeFileSync(fakeMain, `process.stdout.write("");\nprocess.exit(0);\n`);
const r4 = await convertWithCalibre(inFile, outFile, { targetFormat: "mobi" });
check("exit 0 -> success true", r4.success === true);

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
