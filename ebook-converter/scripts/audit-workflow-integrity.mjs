#!/usr/bin/env node
// scripts/audit-workflow-integrity.mjs
// 2026-10-04 新增。针对「静默假成功」在 CI 配置层的根因修复。
//
// 背景（复盘实测证据）：
//   仓库有 51 个门禁脚本，但 2026-10-04 之前只有 pre-push、没有 pre-commit；
//   而 .github/workflows/audit.yml 与 weekly-audit.yml 引用的 scripts/audit.sh
//   **从未入库**（git check-ignore exit=1 证明不是被忽略，就是漏提交）；
//   且两处都写成 `bash ../../scripts/audit.sh`——working-directory 是 ./ebook-converter，
//   `../../` 退到仓库【外面】，GitHub runner 上必然 exit 127；
//   weekly-audit.yml 还用 `| tee` 吞掉退出码 ⇒ 审查失败 workflow 仍报绿。
//   三个 bug 叠加 ⇒ 这道门禁在 CI 上从未真正生效，却一直显示「有门禁」。
//
// 本脚本只测【不变量】（不测会随历史增长的绝对数量）：
//   I1 workflow 不得出现 `../../` 越界路径
//   I2 workflow 不得用 `| tee` 包裹会返回非 0 的脚本（吞退出码）
//   I3 workflow 引用但仓库里不存在的脚本 ⇒ 判为「CI 依赖缺失」
//   I4 仓库内不得有硬编码 webhook/token
//   I5 至少存在 pre-commit 钩子（否则内容类事故只在 push 才拦）
//
// 设计原则（沿用本项目既有纪律）：
//   - 单一数据源：被引用的脚本清单直接从 workflow 文本实读，不硬编码。
//   - 判据无法执行 ⇒ 显式 exit 2，不静默当通过。
//   - 双向验证：注入事故必须 exit 1，恢复必须 exit 0。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..'); // scripts/ 在仓库根
const WF_DIR = path.join(REPO_ROOT, '.github', 'workflows');

const blocks = [];
let hasUnknown = false;

function add(ok, title, detail) {
  blocks.push({ ok, title, detail });
}

// I1 / I2 / I3：逐个 workflow 实读
let wfFiles = [];
try {
  wfFiles = fs.readdirSync(WF_DIR).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
} catch (e) {
  console.error('⛔ 判据无法执行：读不到 ' + WF_DIR + ' ⇒ 显式失败（不静默当通过）');
  process.exit(2);
}
if (wfFiles.length === 0) {
  console.error('⛔ 判据无法执行：workflow 目录为空 ⇒ 显式失败');
  process.exit(2);
}

// I1 越界路径
const oob = [];
for (const f of wfFiles) {
  const src = fs.readFileSync(path.join(WF_DIR, f), 'utf8');
  src.split('\n').forEach((line, i) => {
    // 只看 run: 行里的脚本调用，注释行（# 开头）不算
    const t = line.trim();
    if (t.startsWith('#')) return;
    const m = t.match(/\.\.\/\.\.\/\S+/);
    if (m) oob.push(`${f}:${i + 1}  ${t}`);
  });
}
add(
  oob.length === 0,
  'I1 workflow 无 `../../` 越界路径',
  oob.length === 0 ? `已扫 ${wfFiles.length} 个 workflow` : oob.join('\n')
);

// I2 tee 吞退出码
const tees = [];
for (const f of wfFiles) {
  const src = fs.readFileSync(path.join(WF_DIR, f), 'utf8');
  src.split('\n').forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith('#')) return;
    // 形如 `bash xxx.sh 2>&1 | tee log` —— 若该行没有 PIPESTATUS 兜底即为吞退出码
    if (/\|\s*tee\b/.test(t) && !/PIPESTATUS/.test(src)) {
      tees.push(`${f}:${i + 1}  ${t}`);
    }
  });
}
add(
  tees.length === 0,
  'I2 workflow 未用 | tee 吞掉门禁退出码',
  tees.length === 0 ? '无裸 tee 管道' : tees.join('\n') + '\n（修法：加 set -o pipefail 并 exit "${PIPESTATUS[0]}"）'
);

// I3 CI 依赖缺失：实读 workflow 里提到的 *.sh / *.mjs 脚本，验证「已入库」。
//
// 2026-10-04 修正（首版判据自身有 bug，走了弯路）：
//   首版用 path.join(REPO_ROOT, ref) 判存在，但 workflow 的 working-directory 是 ./ebook-converter，
//   引用 `scripts/syntax-sweep.mjs` 的真实位置是 ebook-converter/scripts/…，
//   于是 7 个真实存在的脚本被误报「不存在」⇒ 假失败。
//   假失败与假通过同样有害（会训练人忽略输出）。现改为：
//   **单一数据源 = git ls-files 实读已入库清单**（Windows 上非 -z 会把中文路径八进制转义，必须 -z），
//   且同时接受「仓库根基准」与「ebook-converter 基准」两种前缀，任一命中即视为已入库。
//   判据仍只测不变量（引用的脚本必须能取到），不测绝对数量。
const missing = [];
const checked = new Set();
let TRACKED = new Set();
try {
  const { execFileSync } = await import('node:child_process');
  const out = execFileSync('git', ['ls-files', '-z'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  TRACKED = new Set(out.split('\0').filter(Boolean));
} catch (e) {
  console.error('⛔ 判据无法执行：git ls-files 失败 ⇒ 显式失败（不静默当通过）');
  process.exit(2);
}
if (TRACKED.size === 0) {
  console.error('⛔ 判据无法执行：git ls-files 返回空 ⇒ 显式失败');
  process.exit(2);
}

for (const f of wfFiles) {
  const src = fs.readFileSync(path.join(WF_DIR, f), 'utf8');
  const re = /(?:^|\s)((?:\.\.\/)?scripts\/[\w.-]+\.(?:sh|mjs|js))/g;
  let m;
  while ((m = re.exec(src))) {
    const at = m.index;
    // 注释行跳过：往前找行首
    const lineStart = src.lastIndexOf('\n', at) + 1;
    if (src.slice(lineStart, at).trimStart().startsWith('#')) continue;

    const ref = m[1].replace(/^\.\.\//, '');
    const key = `${f}::${ref}`;
    if (checked.has(key)) continue;
    checked.add(key);

    // 两种基准任一入库即算通过
    const cands = [ref, path.posix.join('ebook-converter', ref)];
    const hit = cands.find((c) => TRACKED.has(c));
    if (!hit) missing.push(`${f} 引用 ${ref} ⇒ 未入库（已入库候选：${cands.join(' , ')}）`);
  }
}
add(
  missing.length === 0,
  'I3 workflow 引用的脚本均已入库',
  missing.length === 0 ? `实读校验 ${checked.size} 处引用（基准=git ls-files）` : missing.join('\n')
);

// I4 硬编码 token
const secrets = [];
const SCAN_EXT = new Set(['.js', '.mjs', '.yml', '.yaml', '.sh']);
function walk(dir, depth) {
  if (depth > 3) return;
  let ents = [];
  try {
    ents = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of ents) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === '.next') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(p, depth + 1);
    } else if (SCAN_EXT.has(path.extname(e.name))) {
      const src = fs.readFileSync(p, 'utf8');
      src.split('\n').forEach((line, i) => {
        const t = line.trim();
        if (t.startsWith('*') || t.startsWith('//') || t.startsWith('#')) return;
        // 飞书/Slack/企微 webhook 形态
        if (/hook\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(t)) {
          secrets.push(`${path.relative(REPO_ROOT, p)}:${i + 1}  硬编码 webhook token`);
        }
      });
    }
  }
}
walk(REPO_ROOT, 0);
add(
  secrets.length === 0,
  'I4 仓库无硬编码 webhook token',
  secrets.length === 0 ? '已扫 .js/.mjs/.yml/.sh' : secrets.join('\n')
);

// I5 pre-commit 钩子存在且可执行
const hook = path.join(REPO_ROOT, '.git', 'hooks', 'pre-commit');
let hookOk = false;
let hookNote = '';
if (!fs.existsSync(hook)) {
  hookNote = '缺 .git/hooks/pre-commit ⇒ 内容类事故只能在 push 才拦';
} else {
  try {
    fs.accessSync(hook, fs.constants.X_OK);
    hookOk = true;
    hookNote = '存在且可执行';
  } catch {
    hookNote = '存在但不可执行（chmod +x）';
  }
}
add(hookOk, 'I5 存在可执行的 pre-commit 钩子', hookNote);

// ── 输出 ──
console.log('==========================================');
console.log('  workflow / 门禁挂载点完整性审查');
console.log('==========================================');
console.log('');
for (const b of blocks) {
  console.log(`${b.ok ? '✅' : '❌'} ${b.title}`);
  if (b.detail) {
    for (const line of b.detail.split('\n')) console.log(`     ${line}`);
  }
}
const failed = blocks.filter((b) => !b.ok).length;
console.log('');
console.log('==========================================');
console.log(`  通过 ${blocks.length - failed} / 失败 ${failed}`);
console.log('==========================================');

if (hasUnknown) {
  process.exit(2);
}
process.exit(failed > 0 ? 1 : 0);
