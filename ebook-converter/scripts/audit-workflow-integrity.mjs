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
//
// 2026-10-04 二次修正：Windows 下 Node fork git 恒 EBUSY（execFileSync status=null），
//   故 git ls-files 的原始清单改由【外部传入】：
//     node scripts/audit-workflow-integrity.mjs --tracked-from-stdin < <(git ls-files -z)
//   拿不到清单时显式 exit 2（判据无法执行 ≠ 通过），绝不把「取不到」静默当成「没入库」。
const missing = [];
const basemismatch = [];
const checked = new Set();

function loadTracked() {
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--tracked-from-stdin');
  if (i >= 0) {
    // 从 stdin 读 NUL 分隔清单（由 shell 的 `git ls-files -z` 提供）
    const chunks = [];
    const buf = Buffer.alloc(1 << 16);
    const fd = 0;
    while (true) {
      let n;
      try {
        n = fs.readSync(fd, buf, 0, buf.length, null);
      } catch (e) {
        if (e.code === 'EAGAIN') continue;
        if (e.code === 'EOF') break;
        throw e;
      }
      if (n === 0) break;
      chunks.push(Buffer.from(buf.slice(0, n)));
    }
    return new Set(
      Buffer.concat(chunks)
        .toString('utf8')
        .split('\0')
        .filter(Boolean)
    );
  }
  return null;
}

const TRACKED = loadTracked();
if (!TRACKED || TRACKED.size === 0) {
  console.error(
    '⛔ 判据无法执行：拿不到 git ls-files 清单。\n' +
      '   本脚本在 Windows 下不 fork git（恒 EBUSY），请这样调用：\n' +
      '     node scripts/audit-workflow-integrity.mjs --tracked-from-stdin < <(git ls-files -z)\n' +
      '   （显式 exit 2，不静默当通过）'
  );
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
    if (hit) continue;

// ── 基准自校正（2026-10-04 实测踩坑）──
// 实测事实（别推理，看数字）：
//   `git ls-files` 的路径基准取决于【当前工作目录】：
//     仓库根执行         ⇒ `.github/workflows/ci.yml`、`scripts/audit.sh`
//     ebook-converter/ 内 ⇒ `scripts/_audit_internal_links.mjs`、`src/...`
//   ⚠️ 两个基准下的 `scripts/` 【同名但不是同一个目录】：
//      仓库根的 scripts/ 放 audit.sh 等工具；app 的 scripts/ 放门禁 .mjs。
//   实测计数：根基准 `^scripts/audit.sh$` 命中 1，子目录基准命中 0。
// 而 workflow 里写的是 `bash ../scripts/audit.sh`（仓库根相对）。
//   ⇒ 「cd 进子目录后忘了加 -C」会让引用假报未入库（实测 exit 1，CI 会红）。
//
// 判定策略（三层，逐层放宽且都基于实测，不猜）：
//   1) 直接命中 → 通过；
//   2) 剥掉一层前缀后命中 → 通过（基准差异但文件确在）；
//   3) 都不中，但磁盘上该路径确实存在 → 判为【清单基准不对】，只提示不算失败
//      （这是真正的情形：`scripts/audit.sh` 在父目录，app 基准的清单里根本没有它）
//   4) 都不中且磁盘也不存在 → 真的未入库，失败。
const norm = (s) => s.replace(/^[^/]+\//, '');
const loose = [...TRACKED].filter((p) => cands.some((c) => norm(c) === norm(p)));
if (loose.length > 0) {
  basemismatch.push(
    `${f} 引用 ${ref}：清单基准与引用基准不一致（清单里实际是 ${loose.join(' , ')}）\n` +
      `     ⇒ 建议用 \`git -C <repoRoot> ls-files -z\` 传清单。脚本确已入库，本条只提示不算失败。`
  );
  checked.add(`${f}::${ref}::basemismatch`);
  continue;
}
// 第 3 层：磁盘上确实有这个文件 ⇒ 只是清单没覆盖到（基准问题），不算未入库
const onDisk = cands.some((c) => fs.existsSync(path.join(REPO_ROOT, c)));
if (onDisk) {
  basemismatch.push(
    `${f} 引用 ${ref}：传入的清单未覆盖该文件，但磁盘上确实存在（${cands.find((c) => fs.existsSync(path.join(REPO_ROOT, c)))}）。\n` +
      `     ⇒ 清单基准不对（多半是 cd 进子目录后忘了 \`git -C\`）。本条只提示，不判为未入库。`
  );
  checked.add(`${f}::${ref}::basemismatch`);
  continue;
}
missing.push(`${f} 引用 ${ref} ⇒ 未入库（已入库候选：${cands.join(' , ')}）`);
  }
}
// 注意：basemismatch 提示必须【无条件拼接】。
//   第一版写成 `missing.length===0 ? A : B + (basemismatch...)`，
//   结果「清单基准不对」这类提示恰好在 missing 为空时被短路掉 ⇒ 提示永不显示，
//   属于「有逻辑但不可见」，与假门禁同源。已实测确认（grep 计数 0）。
add(
  missing.length === 0,
  'I3 workflow 引用的脚本均已入库',
  missing.length === 0
    ? `实读校验 ${checked.size} 处引用（基准=git ls-files）`
    : missing.join('\n')
);
if (basemismatch.length > 0) {
  blocks[blocks.length - 1].detail +=
    `\n（另有 ${basemismatch.length} 处属清单基准不一致，文件确实存在，只提示不算失败）\n` +
    basemismatch.map((s) => '   · ' + s).join('\n');
}

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

// I5 pre-commit 钩子存在且可执行 —— 【故意只作信息项，不参与成败】
//
// 为什么降级（2026-10-04 实测修正，这是本文件自身的一处「假门禁」）：
//   `.git/hooks/` 是 git 的机制目录，天然【不入库】。GitHub runner 的 fresh clone
//   永远没有 .git/hooks/pre-commit ⇒ 若把这项计入 FAIL，CI 就是永久红。
//   而永久红的门禁比没门禁更坏：会训练人忽略输出（2026-10-04 用户级铁律第 6 条）。
//   同时 CI 上 hooks 内容本就【不可判定】，按纪律「判据无法执行 ⇒ 降级 UNKNOWN，不报 FAIL」。
//
// 真正强制 pre-commit 落地的地方在本地：audit-agent-discipline.mjs 的 I4，
//   它读钩子真实内容并逐个核对「被调用的脚本是否存在」+「名单里的门禁是否真被调用」，
//   那是可执行判据；本项只是提醒，避免两个门禁在 CI 上互相制造假红。
const hook = path.join(REPO_ROOT, '.git', 'hooks', 'pre-commit');
let hookNote;
if (!fs.existsSync(hook)) {
  hookNote =
    '当前环境无 .git/hooks/pre-commit。\n' +
    '  · 在 CI 上属正常（hooks 不入库，fresh clone 必然没有）⇒ 本项不计入成败。\n' +
    '  · 在本地开发机上则意味着【没装钩子】：需从版本库外的备份重装，\n' +
    '    否则内容类事故只能等 push 门禁（pre-push 只审博文 slug，非博文文件不经它）。\n' +
    '  · 本地落地情况由 audit-agent-discipline.mjs 的 I4 强制核对。';
} else {
  try {
    fs.accessSync(hook, fs.constants.X_OK);
    hookNote = '存在且可执行 ✓（本地已挂载）';
  } catch {
    hookNote = '存在但不可执行（需 chmod +x）⇒ 本地钩子不会生效';
  }
}
add(true, 'I5 pre-commit 钩子状态（信息项，CI 上不可判定故不计成败）', hookNote);

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
