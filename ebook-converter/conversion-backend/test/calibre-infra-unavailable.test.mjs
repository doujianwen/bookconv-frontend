// test/calibre-infra-unavailable.test.mjs
// 契约：基础设施失败（spawn ENOENT / execFile 超时）必须独立成码
// BACKEND_UNAVAILABLE，不得兜底成 CONVERSION_FAILED。
//
// 依据（2026-11-08 红队审计 #3）：index.js 的 `result.code || "CONVERSION_FAILED"`
// 是兜底码。若把 spawn ENOENT（Calibre 二进制丢失/损坏）、120s 超时、SIGKILL/OOM
// 都归入 CONVERSION_FAILED，前端会把它当「确定性输入问题」跳过熔断计数 ⇒ 后端
// 真死时熔断永不开启、红卡永不发（后端静默死亡）。BACKEND_UNAVAILABLE 由
// index.js 映射为 HTTP 503，前端按健康失败计数并触发熔断。
//
// calibre.js 的 CALIBRE_BIN 已改为调用时读取 env，故本文件可在同一进程内切换
// shim 覆盖三种失败形态。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(__dirname, "..");

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "bkconv-infra-"));
const isWin = process.platform === "win32";

const inFile = path.join(TMP, "in.epub");
const outFile = path.join(TMP, "out.mobi");
fs.writeFileSync(inFile, "dummy");

let pass = 0;
let fail = 0;
const check = (name, cond) => {
  if (cond) { pass++; console.log("  PASS", name); }
  else { fail++; console.log("  FAIL", name); }
};

const writeShim = (name, mainSrc) => {
  const shim = path.join(TMP, isWin ? `${name}.cmd` : `${name}.sh`);
  const main = path.join(TMP, `${name}.mjs`);
  fs.writeFileSync(main, mainSrc);
  if (isWin) {
    fs.writeFileSync(shim, `@echo off\r\nnode "%~dp0${name}.mjs" %*\r\nexit /b %errorlevel%\r\n`);
  } else {
    fs.writeFileSync(shim, `#!/bin/sh\nnode "$(dirname "$0")/${name}.mjs" "$@"\nexit $?\n`);
    fs.chmodSync(shim, 0o755);
  }
  return shim;
};

const { convertWithCalibre } = await import(pathToFileURL(path.join(APP, "app", "calibre.js")).href);

// --- 用例 1：spawn ENOENT（Calibre 二进制丢失/损坏） ---
// 指向一个必然不存在的路径：execFile 同步抛 ENOENT（err.code 是字符串而非退出码）。
// ⚠️ 不能用 .cmd/.bat 后缀：那会命中 useShell 分支（Windows 下 shell 报错形态是
// 退出码 1 + "is not recognized"，不是 ENOENT）；无扩展名路径才走真实 spawn。
// 生产（Linux）路径本就不带 shell，与本用例形态一致。
process.env.CALIBRE_BIN = path.join(TMP, "definitely-missing-no-ext");
const r1 = await convertWithCalibre(inFile, outFile, { targetFormat: "mobi" });
check("ENOENT -> success false", r1.success === false);
check("ENOENT -> code BACKEND_UNAVAILABLE", r1.code === "BACKEND_UNAVAILABLE");
check("ENOENT -> NOT CONVERSION_FAILED / DRM", r1.code !== "CONVERSION_FAILED" && r1.code !== "DRM_PROTECTED");
check("ENOENT -> error mentions unavailable", /unavailable/i.test(r1.error || ""));

// --- 用例 2：execFile 超时（timeout 500ms < shim 的 3s 退出）→ killed=true ---
const slowShim = writeShim("slow-calibre", `setTimeout(() => process.exit(0), 3000);\n`);
process.env.CALIBRE_BIN = slowShim;
const r2 = await convertWithCalibre(inFile, outFile, { targetFormat: "mobi", timeout: 500 });
check("timeout -> success false", r2.success === false);
check("timeout -> code BACKEND_UNAVAILABLE", r2.code === "BACKEND_UNAVAILABLE");

// --- 用例 3（负例）：正常转换失败（退出码 1 + stderr）不得被误判 infra ---
const failShim = writeShim(
  "fail-calibre",
  `process.stderr.write("calibre.utils.zipfile.BadZipfile: File is not a zip file");\nprocess.exit(1);\n`,
);
process.env.CALIBRE_BIN = failShim;
const r3 = await convertWithCalibre(inFile, outFile, { targetFormat: "mobi" });
check("normal failure -> success false", r3.success === false);
check("normal failure -> NO code (index.js defaults to CONVERSION_FAILED)", r3.code === undefined);
check("normal failure -> error is Conversion failed", /^Conversion failed:/.test(r3.error || ""));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
