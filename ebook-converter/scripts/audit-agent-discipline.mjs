#!/usr/bin/env node
// scripts/audit-agent-discipline.mjs
// 把 2026-10-04 复盘出的三类重复错误固化成【可执行门禁】。
//
// 依据：2026-10-04 单日 12 个错误，9 个被门禁/判据抓住，3 个靠复盘自觉发现。
//   ⇒ 变成可执行判据的错误一次没漏；只写进 MEMORY 的文字纪律一定重犯。
//
// 三类错误 → 四条判据（每条都是不变量，不是绝对数量）：
//   A. 抽样偏差：只看文件尾部/片段就断言逻辑成立（今天看 tail -8 断言 audit.sh 恒绿，
//      实际第 204 行有 exit 1）。⇒ I1：必须全文扫描 exit 并做结构配对，
//      且「文件里出现过 exit」不等于「失败分支会非 0 退出」。
//   B. 路径靠猜：凭记忆写路径（今天 formats.ts vs lib/conversion-map.ts、
//      app/convert vs app/[locale]/convert/[slug]）。
//      ⇒ I2：不再用「文件存在」这种弱判据（实测会产 10 个假失败），
//      改为【内容签名 + 唯一定义处】——符号必须恰好在一个文件里被定义。
//   C. 写法反模式：heredoc 吞反斜杠（今天连踩 3 次，\\s 被吞、\\1 丢失）。
//      ⇒ I3：先实测确认「语法检查抓不到」（/\\d/ 变 /d/ 仍语法合法，
//        实测见 _wb_tmp/probe-syntax.mjs），所以 I3 改为【提交前语法闸】
//        由 pre-commit 的 syntax-sweep 承担；本脚本只做常驻不变量 I4。
//
// 纪律（对本脚本自身同样生效）：
//   - 只测不变量，不测会随历史增长的绝对数量。
//   - 判据无法执行 ⇒ 显式 exit(2)，绝不静默当通过。
//   - 不 fork 任何二进制：本机实测 spawnSync('node'/'git') 恒 EBUSY(status=null)，
//     实测见 _wb_tmp/probe-fork.mjs ⇒ 一律纯 fs 读取实现。
//   - 判据写完必做反向验证（注入事故⇒1，恢复⇒0），否则就是假门禁。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(__dirname, '..');
const REPO = path.resolve(APP, '..');

const blocks = [];
const add = (ok, title, detail) => blocks.push({ ok, title, detail });

// 读文件；读不到 ⇒ 判据不可执行，必须显式失败而不是当通过。
function readOrDie(p, label) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (e) {
    console.error(`⛔ 判据无法执行：读不到 ${label}（${p}）：${e.message} ⇒ exit 2`);
    process.exit(2);
  }
}

// ── I1：shell 退出码必须「失败计数 ⇒ 非 0 退出」全文配对 ──
// 今天的事故正是「只看尾部」。所以判据不看单个文件，而是：
//   1) 全文列出所有 exit 行号（证明确实扫了全文，不是 tail）；
//   2) 若存在失败计数变量（FAIL=0 / fail(){...FAIL++}），
//      则必须存在非 0 的 exit，否则脚本失败也返回 0；
//   3) 若存在非 0 exit，则必须被某个 if/条件包裹（不是孤立残留）。
const shDir = path.join(REPO, 'scripts');
let shFiles;
try {
  shFiles = fs.readdirSync(shDir).filter((f) => f.endsWith('.sh'));
} catch (e) {
  console.error(`⛔ 判据无法执行：读不到 ${shDir} ⇒ exit 2`);
  process.exit(2);
}
if (shFiles.length === 0) {
  console.error('⛔ 判据无法执行：scripts/ 下无 .sh ⇒ exit 2（不是「通过」）');
  process.exit(2);
}
const i1Problems = [];
const i1Lines = [];
for (const f of shFiles) {
  const src = readOrDie(path.join(shDir, f), f);
  const lines = src.split(/\r?\n/);
  // 全文扫描 exit（明确不能用 tail/head 取样）
  const exits = [];
  lines.forEach((ln, i) => {
    const m = ln.match(/(^|\s)exit\s+(\d+)/);
    if (m) exits.push({ line: i + 1, code: Number(m[2]), text: ln.trim() });
  });
  if (exits.length === 0) {
    i1Problems.push(`${f}: 全文无 exit ⇒ 返回最后一条命令的退出码`);
    continue;
  }
  const nonzero = exits.filter((e) => e.code !== 0);
  const hasCounter = /(FAIL|ERROR|FAILED|ISSUES?)(\s*=\s*0|=0)/.test(src);
  const hasIncr = /(FAIL|ERROR|FAILED|ISSUES?)\s*=\s*\$\(\(/.test(src);
  // 情况1：有失败计数，却没有非 0 exit ⇒ 必假绿
  if ((hasCounter || hasIncr) && nonzero.length === 0) {
    i1Problems.push(`${f}: 有失败计数变量但全文无非 0 exit（${i1Lines.length} 处 exit 全为 0）⇒ 失败时仍返回 0`);
  }
  // 情况2：非 0 exit 存在，但必须是条件退出，不能是孤立残留
  for (const e of nonzero) {
    const ctx = lines.slice(Math.max(0, e.line - 6), e.line).join('\n');
    if (!/\b(if|&&|\|\||then|exit\b.*\$)/.test(ctx)) {
      i1Problems.push(`${f}:${e.line} 非 0 exit 未被任何 if/条件包裹（疑似死代码）`);
    }
  }
  i1Lines.push(`${f}: exit 共 ${exits.length} 处，其中非 0 ${nonzero.length} 处`);
}
add(
  i1Problems.length === 0,
  'I1 shell 退出码逻辑全文配对（防「只看尾部就判恒绿」的抽样偏差）',
  i1Problems.length === 0
    ? i1Lines.join('\n')
    : i1Problems.join('\n')
);

// ── I2：权威源【唯一定义处】+ 关键路径（防路径靠猜）──
// 实测教训：判「文件存在」不够。formats.ts 存在，但 CONVERSION_MAP 不在里面。
// 真正的不变量是：符号只能被定义一次，且必须在这个文件。
// 同时固化今天两个猜错的路径，让猜错立刻暴露而不是静默用错源。
const SRC = path.join(APP, 'src');

function listFiles(dir, ext, out = [], depth = 0) {
  if (depth > 8) return out;
  let ents;
  try {
    ents = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of ents) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(p, ext, out, depth + 1);
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
}

const codeFiles = listFiles(SRC, '.ts').concat(listFiles(SRC, '.tsx'));
if (codeFiles.length === 0) {
  console.error('⛔ 判据无法执行：src/ 下无 .ts/.tsx ⇒ exit 2');
  process.exit(2);
}

// 2a. 每个关键符号必须【恰好一个】定义处，且在指定文件
const SYMBOLS = [
  { name: 'CONVERSION_MAP', file: 'src/lib/conversion-map.ts' },
];
const i2Problems = [];
const i2Lines = [];
for (const sym of SYMBOLS) {
  const re = new RegExp(`export\\s+(?:const|let|var|function|class)\\s+${sym.name}\\b`);
  const defs = [];
  for (const f of codeFiles) {
    const src = readOrDie(f, path.relative(APP, f));
    src.split(/\r?\n/).forEach((ln, i) => {
      if (re.test(ln)) defs.push({ file: path.relative(APP, f).replace(/\\/g, '/'), line: i + 1 });
    });
  }
  if (defs.length === 0) {
    i2Problems.push(`${sym.name}: 全 src/ 找不到定义 ⇒ 权威源已漂移，必须实读确认新位置后更新本脚本`);
  } else if (defs.length > 1) {
    i2Problems.push(`${sym.name}: 有 ${defs.length} 个定义处（${defs.map((d) => `${d.file}:${d.line}`).join(', ')}）⇒ 权威源不唯一，读到哪个取决于 import 顺序`);
  } else {
    const got = defs[0].file;
    if (got !== sym.file) {
      i2Problems.push(`${sym.name}: 定义在 ${got}，但本脚本白名单写的是 ${sym.file} ⇒ 记忆里的路径已过时（防「路径靠猜」的反向闸）`);
    } else {
      i2Lines.push(`${sym.name} 唯一定义处 = ${got}:${defs[0].line} ✓`);
    }
  }
}

// 2b. 今天猜错过、必须存在的目录（缺了就是结构漂移，不是「换个地方也能跑」）
const MUST_EXIST = [
  'src/app/[locale]/convert/[slug]/page.tsx',
  'src/app/[locale]/convert/[slug]/ToolPageClient.tsx',
  'src/lib/conversion-map.ts',
  'src/data/formats.ts',
  'src/data/content',
  'src/data/blog',
];
for (const rel of MUST_EXIST) {
  if (!fs.existsSync(path.join(APP, rel))) {
    i2Problems.push(`必需路径缺失：${rel} ⇒ 结构漂移，必须实读确认新结构，禁止猜路径`);
  }
}
// 2c. section.heading 必须仍渲染为正文 h2（今天已实读确认；若变成面包屑则 SEO 判据失效）
const tpc = path.join(APP, 'src/app/[locale]/convert/[slug]/ToolPageClient.tsx');
if (fs.existsSync(tpc)) {
  const tsrc = readOrDie(tpc, 'ToolPageClient.tsx');
  const h2ok = /<h2[^>]*>\s*\{section\.heading\}\s*<\/h2>/.test(tsrc);
  if (!h2ok) {
    i2Problems.push('ToolPageClient.tsx 不再把 section.heading 渲染为 <h2> ⇒ 「heading 是正文 H2」这一前提已失效');
  } else {
    i2Lines.push('section.heading → <h2> ✓（结论仍成立：正文 H2，SEO 计入）');
  }
}
add(
  i2Problems.length === 0,
  'I2 权威源唯一定义处 + 关键路径（防路径靠猜）',
  i2Problems.length === 0 ? i2Lines.join('\n') : i2Problems.join('\n')
);

// ── I3：heredoc 反模式（今天连踩 3 次）──
// 实测结论（_wb_tmp/probe-syntax.mjs）：/\\d/ 被吃成 /d/ 后【语法仍然合法】，
//   所以任何语法检查都抓不到 ⇒ 不能靠「扫文件内容」解决。
// 真正可靠的防线在写入侧：pre-commit 的 syntax-sweep 拦未闭合，
//   而「必须用 Write 工具写含反斜杠的脚本」是操作纪律。
// 因此 I3 降级为【可检测的子集】并明确它不覆盖什么 —— 宁可标注盲区，
// 也不给一个「看着有、实际抓不到」的门禁。
// 可检测子集：shell 脚本里用 heredoc 写含正则元字符的脚本（heredoc + 反斜杠同现）。
const shFilesWithHeredoc = [];
for (const f of shFiles) {
  const src = readOrDie(path.join(shDir, f), f);
  const lines = src.split(/\r?\n/);
  let inHeredoc = false;
  lines.forEach((ln, i) => {
    if (/<<-?\s*'?"?[A-Z_]+'?"?/.test(ln)) inHeredoc = true;
    else if (/^\s*[A-Z_]+\s*$/.test(ln)) inHeredoc = false;
    else if (inHeredoc && /\\[s d w S D W b]|\\\[0-9]/.test(ln)) {
      shFilesWithHeredoc.push(`${f}:${i + 1} heredoc 块内含正则转义（该写法会被 shell 吞）`);
    }
  });
}
add(
  shFilesWithHeredoc.length === 0,
  'I3 heredoc 吞反斜杠反模式（仅覆盖 .sh 可静态检测的子集）',
  shFilesWithHeredoc.length === 0
    ? `已扫 ${shFiles.length} 个 .sh，heredoc+反斜杠同现 0 处\n` +
      '⚠️ 已知盲区（非本门禁能覆盖）：agent 用 `cat > x.mjs <<EOF` 写含反斜杠的脚本。\n' +
      '   实测语法检查抓不到（/\\d/→/d/ 仍合法），只能靠写入侧纪律 + syntax-sweep 拦未闭合。'
    : shFilesWithHeredoc.join('\n')
);

// ── I4：本门禁自身必须挂在真实挂载点上（防「门禁存在≠生效」）──
// 今天最大的教训：CI 里那道「门禁」从未真正生效，却一直显示「有门禁」。
// 所以判据必须验证「它自己挂在哪、怎么被调用」。
//
// 环境判定（实测必需，否则 CI 永久红 —— 这是我写第一版时踩的坑）：
//   .git/hooks/ 天然不入库。GitHub runner 的 fresh clone 永远没有 pre-commit，
//   若在 CI 上把「钩子缺失/未调用」计入 FAIL ⇒ 每跑必红 ⇒ 训练人忽略输出
//   （比没门禁更坏）。因此：CI 环境只核对 CI 侧挂载，hooks 侧判为 UNKNOWN 并明示；
//   本地环境才强制核对 hooks 内容。判据不可判定时降级，绝不假装通过。
const IN_CI = !!(process.env.CI || process.env.GITHUB_ACTIONS);
const HOOK = path.join(REPO, '.git/hooks/pre-commit');
const i4Problems = [];
const i4Lines = [];
let hookSrc = '';
let hookExists = false;
try {
  hookSrc = fs.readFileSync(HOOK, 'utf8');
  hookExists = true;
} catch {
  /* 缺失按下方环境分支处理 */
}

// CI 侧：workflow 必须真调用（这部分在任何环境都可判定）
const GATES = ['audit-agent-discipline.mjs', 'audit-workflow-integrity.mjs', 'syntax-sweep.mjs', 'audit-content-integrity.mjs'];
const CI = path.join(REPO, '.github/workflows/ci.yml');
if (!fs.existsSync(CI)) {
  i4Problems.push('找不到 .github/workflows/ci.yml ⇒ CI 挂载点无法验证');
} else {
  const ci = readOrDie(CI, 'ci.yml');
  for (const g of GATES) {
    if (!ci.includes(g)) i4Problems.push(`ci.yml 未调用 ${g} ⇒ CI 侧缺该门禁`);
  }
  if (!i4Problems.length) i4Lines.push(`ci.yml → ${GATES.length} 道门禁全部挂载 ✓`);
}

if (IN_CI) {
  i4Lines.push('CI 环境：.git/hooks 不入库（fresh clone 必然缺失）⇒ 本地钩子状态在此不可判定，降级为 UNKNOWN（不计成败）');
} else if (!hookExists) {
  i4Problems.push('.git/hooks/pre-commit 不存在 ⇒ 本门禁无本地挂载点（hooks 不入库，新克隆/换机器需手动重装）');
} else {
  // 真实存在的钩子：核对「谁被调用」+「被调用的是否存在」
  const hookScripts = [...hookSrc.matchAll(/node\s+(?:scripts\/)?([A-Za-z0-9_.-]+\.mjs)/g)].map((m) => m[1]);
  // 假挂载：钩子引用了不存在的脚本（必须按钩子里真实出现的路径查，
  // 否则名字改错时会误判成「未调用」，把排查引向错误方向）
  for (const s of new Set(hookScripts)) {
    if (!fs.existsSync(path.join(APP, 'scripts', s))) {
      i4Problems.push(`pre-commit 调用了 scripts/${s}，但该文件不存在 ⇒ 假挂载（钩子引用了不存在的脚本）`);
    }
  }
  // 反向：名单里的每道门禁都必须被真实调用（防「新加了门禁却忘了挂」）
  for (const g of GATES) {
    if (!hookScripts.includes(g)) i4Problems.push(`pre-commit 未调用 ${g} ⇒ 该门禁在本地不生效`);
    else i4Lines.push(`pre-commit → ${g} ✓`);
  }
}
add(
  i4Problems.length === 0,
  'I4 门禁挂载点自检（防「门禁存在 ≠ 门禁生效」）',
  i4Problems.length === 0 ? i4Lines.join('\n') : i4Problems.join('\n')
);

// ── 输出 ──
console.log('==========================================');
console.log('  执行纪律门禁（把重复错误固化成可执行判据）');
console.log('==========================================');
console.log('');
for (const b of blocks) {
  console.log(`${b.ok ? '✅' : '❌'} ${b.title}`);
  if (b.detail) for (const line of b.detail.split('\n')) console.log(`     ${line}`);
}
const failed = blocks.filter((b) => !b.ok).length;
console.log('');
console.log(`==========================================`);
console.log(`  通过 ${blocks.length - failed} / 失败 ${failed}`);
console.log('==========================================');
process.exit(failed > 0 ? 1 : 0);