#!/usr/bin/env node
/**
 * ga-parse-results.mjs — 运行 syntax-sweep 与 geo-audit-guide，解析结果写 _wb_tmp JSON。
 *
 * 目的：把 Part A 的 F2/F3 执行 + 结果解析集中到一个脚本，避免自动化 prompt 内联
 *       node -e 正则被 shell 转义（实测 \d → /d 导致语法错误）。
 * 产出：
 *   _wb_tmp/ga-syntax.json  { ok: parse_failures===0, detail: "<末行>" }
 *   _wb_tmp/ga-geo.json     { ok: 命中 >=400 指标, full: N, detail: ">=400词 guide: N（基线9）；P/T PASS" }
 * 退出码：恒 0（解析失败不阻断流水线；下游红队会据 ok 字段裁定）
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const T = (f) => path.join(ROOT, '_wb_tmp', f);

function run(args) {
  const scriptPath = path.join(ROOT, 'scripts', args[0]);
  const rest = args.slice(1);
  try {
    return execFileSync('node', [scriptPath, ...rest], { encoding: 'utf8' });
  } catch (e) {
    return (e.stdout || '') + (e.stderr || '');
  }
}

// ── F2 syntax-sweep ────────────────────────────────────────────────────
const ssOut = run(['syntax-sweep.mjs']);
const ssLines = ssOut.trim().split(/\r?\n/);
const ssLast = ssLines[ssLines.length - 1] || '';
const ssFail = Number((ssLast.match(/parse failures:\s*(\d+)/) || [])[1] || '0');
fs.writeFileSync(T('ga-syntax.json'), JSON.stringify({ ok: ssFail === 0, detail: ssLast }, null, 2));
console.log('[F2] syntax ok=' + (ssFail === 0) + ' | ' + ssLast);

// ── F3 geo-audit-guide --no-online ─────────────────────────────────────
const geoOut = run(['geo-audit-guide.mjs', '--no-online']);
const geoFull = (geoOut.match(/>=\s*400\s*\(full\):\s*(\d+)/i) || [])[1];
const geoTotal = (geoOut.match(/Total guides:\s*(\d+)/i) || [])[1];
const geoPass = (geoOut.match(/PASS\s*\(>=5\.0\):\s*(\d+)/i) || [])[1];
fs.writeFileSync(T('ga-geo.json'), JSON.stringify({
  ok: geoFull != null,
  full: geoFull != null ? Number(geoFull) : null,
  detail: '>=400词 guide: ' + (geoFull || '?') + '（基线9）；' + (geoPass || '?') + '/' + (geoTotal || '?') + ' PASS',
}, null, 2));
console.log('[F3] geo | ' + JSON.parse(fs.readFileSync(T('ga-geo.json'), 'utf8')).detail);
