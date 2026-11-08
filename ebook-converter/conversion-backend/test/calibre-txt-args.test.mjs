// test/calibre-txt-args.test.mjs
// 契约锁：calibre.js 不得再向 ebook-convert 传 --dont-add-chapters-to-toc。
//
// 依据（2026-11-08 告警 1 根因）：该选项在部署的 Calibre 7.6.0 中不存在
// （服务器实测 `ebook-convert: error: no such option`），曾导致所有 X→txt
// 后端转换 100% 返回 500 CONVERSION_FAILED；每 3 次连续失败即熔断开闸，
// 误报「🚨 Conversion Backend Unavailable」红卡并让全站绕过后端 60s。
// 若有人把它加回来，本用例立刻变红。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(__dirname, "..");

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "bkconv-args-"));
const isWin = process.platform === "win32";
const fakeShim = path.join(TMP, isWin ? "fake-calibre.cmd" : "fake-calibre.sh");
const fakeMain = path.join(TMP, "fake-calibre.mjs");
const argvFile = path.join(TMP, "argv.json");

// 假 ebook-convert：把 argv 原样写盘并成功退出（ESM，.mjs）。
fs.writeFileSync(
  fakeMain,
  `import fs from "node:fs";\nfs.writeFileSync(process.env.ARGV_FILE, JSON.stringify(process.argv.slice(2)));\n`,
);

if (isWin) {
  fs.writeFileSync(fakeShim, `@echo off\r\nnode "%~dp0fake-calibre.mjs" %*\r\nexit /b %errorlevel%\r\n`);
} else {
  fs.writeFileSync(fakeShim, `#!/bin/sh\nnode "$(dirname "$0")/fake-calibre.mjs" "$@"\nexit $?\n`);
  fs.chmodSync(fakeShim, 0o755);
}
process.env.CALIBRE_BIN = fakeShim;
process.env.ARGV_FILE = argvFile;

const { convertWithCalibre } = await import(pathToFileURL(path.join(APP, "app", "calibre.js")).href);

const inFile = path.join(TMP, "in.epub");
const outFile = path.join(TMP, "out.bin");
fs.writeFileSync(inFile, "dummy");

let pass = 0;
let fail = 0;
const check = (name, cond) => {
  if (cond) { pass++; console.log("  PASS", name); }
  else { fail++; console.log("  FAIL", name); }
};

const BROKEN_FLAG = "--dont-add-chapters-to-toc";

async function argsFor(targetFormat, opts = {}) {
  const res = await convertWithCalibre(inFile, outFile, { targetFormat, ...opts });
  if (!res.success) throw new Error("fake calibre failed: " + res.error);
  return JSON.parse(fs.readFileSync(argvFile, "utf8"));
}

// 1) txt / text：不得再传坏选项
const txtArgs = await argsFor("txt");
check("txt -> no --dont-add-chapters-to-toc", !txtArgs.includes(BROKEN_FLAG));
check("txt -> positional in/out preserved", txtArgs[0] === inFile && txtArgs[1] === outFile);

const textArgs = await argsFor("text");
check("text -> no --dont-add-chapters-to-toc", !textArgs.includes(BROKEN_FLAG));

// 2) 其余目标格式不受影响（无多余参数）
const mobiArgs = await argsFor("mobi");
check("mobi -> only positional args", JSON.stringify(mobiArgs) === JSON.stringify([inFile, outFile]));

// 3) quality=high 分支回归（/pdf /epub 的既有行为不变）
const pdfHigh = await argsFor("pdf", { quality: "high" });
check("pdf high -> --pdf-page-numbers", pdfHigh.includes("--pdf-page-numbers"));
check("pdf high -> --pretty-print", pdfHigh.includes("--pretty-print"));
const epubHigh = await argsFor("epub", { quality: "high" });
check("epub high -> --pretty-print", epubHigh.includes("--pretty-print"));

// 4) 源码级契约锁：不得出现 `args.push("<flag>")` 代码形态
//    （注释里允许出现选项名作解释，故匹配完整 push 语句而非裸串）
const src = fs.readFileSync(path.join(APP, "app", "calibre.js"), "utf8");
check(
  "calibre.js source has no args.push(--dont-add-chapters-to-toc)",
  !src.includes(`args.push("${BROKEN_FLAG}")`),
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
