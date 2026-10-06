#!/usr/bin/env node
// scripts/gate-workbench-transpile.mjs
//
// 门禁：workbench 数据层的「转译清单」必须覆盖全部真实 import 依赖。
//
// 为什么有这个门禁（2026-10-05 实测事故）
// ────────────────────────────────────────────
// build-workbench-html.mjs 用 @swc/core 把 src/lib/** 转译到 .wb-build/ 再 import。
// 它的 prepareDataLayer() 里那份 files[] 是**手工维护的清单**，靠人记得加。
// 2026-10-05：provider-repo.ts 新增了 `import ... from '../feedback/store'`（值导入），
// 但清单里没有 src/lib/feedback/store.ts → 整个 build 以 exit 1 挂掉：
//   ERR_MODULE_NOT_FOUND: .wb-build/lib/feedback/store
// 清单缺文件能潜伏很久，是因为 type-only import 会被 swc elide 掉（不报错），
// 只有**值导入**才炸 —— 于是「漏一个文件」表现得像「随机抽风」。
//
// 这个门禁做什么
// ──────────────
// 1. 解析 build-workbench-html.mjs 的 files[] 清单；
// 2. 扫描清单内每个文件的**全部** from-import（含 type-only，扫源码而非产物）；
// 3. 任何指向 src/lib 下的依赖若不在清单里 → FAIL，并指名缺哪个文件；
// 4. 反向验证：把「清单少一个文件」这个事故真实复现一遍，确认门禁能抓到。
//
// 判据只测不变量（清单 ⊇ 依赖闭包），**不硬编码任何具体文件名** ——
// 加新面板/新依赖时无需改本脚本。

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const BUILDER = join(ROOT, 'scripts', 'build-workbench-html.mjs');
const SELF = process.argv[1] ? resolvePath(process.argv[1]) : '';

// ── 输出协议：ok / hasUnknown / problems（调用方按结构解构，勿改成裸布尔）──
const problems = [];
let hasUnknown = false;
const say = (s) => console.log(s);
const ok = (id, msg) => say(`  PASS  ${id} ${msg}`);
const bad = (id, msg) => { problems.push(`${id} ${msg}`); say(`  FAIL  ${id} ${msg}`); };
const unknown = (id, msg) => { hasUnknown = true; say(`  UNKNOWN  ${id} ${msg}`); };

say('workbench transpile-closure gate');
say('────────────────────────────────────────────────────────────────');

// ── 前置自检：判据自身能否执行（脚本出错≠数据坏了，必须先自检）──
if (!existsSync(BUILDER)) {
  bad('T0.1', `builder script not found: ${BUILDER} — 判据无法执行`);
  say('\nINCONCLUSIVE: builder missing, cannot verify.');
  process.exit(2);
}

const builderSrc = readFileSync(BUILDER, 'utf8');

// 三个解析陷阱（都是 2026-10-05 首版实测踩到的，逐个修）：
//  1. 注释里带引号的内容不是条目 → 先剥掉整行注释再提取。
//  2. 撇号会吃配对：清单中间的注释写着 "today's work too" / "builder's"，
//     正则 /'([^']+)'/g 把撇号当引号配对，从中间开始一路错到下一个真引号，
//     13 条只捞出 5 条却照样 PASS（静默漏读 = 假门禁）。
//     → 必须**先剥注释**（含行注释与跨行注释），再在纯代码里配对引号。
//  3. 非贪婪 /const\s+files\s*=\s*\[([\s\S]*?)\];/ 会在**注释内**的 '];' 处提前截断
//     → 改成从 'const files = [' 起逐行累积，直到遇到**独占一行**的 '];'。
const listLines = (() => {
  const lines = builderSrc.split(/\r?\n/);
  const start = lines.findIndex((l) => /const\s+files\s*=\s*\[/.test(l));
  if (start < 0) return null;
  const acc = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\s*\];\s*$/.test(lines[i])) return acc.join('\n');
    acc.push(lines[i]);
  }
  return null; // 未闭合
})();

if (listLines === null) {
  bad('T0.2', 'could not locate the `const files = [ ... ];` block — 判据解析失败');
  say('\nINCONCLUSIVE: files[] not parseable, cannot verify.');
  process.exit(2);
}
// 剥注释：块注释 /* */ 与行注释 //（块注释内的换行要保留）
const codeOnly = listLines
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split(/\r?\n/)
  .map((l) => l.replace(/\/\/.*$/, ''))
  .join('\n');
const listed = [...codeOnly.matchAll(/'([^']+)'/g)]
  .map((m) => m[1])
  .filter((p) => p.startsWith('src/') && p.endsWith('.ts'));
if (listed.length === 0) {
  bad('T0.2', 'files[] parsed but 0 src/*.ts entries found — 解析器已失效');
  say('\nINCONCLUSIVE: files[] yielded no entries, cannot verify.');
  process.exit(2);
}
const libTsCount = listed.filter((p) => p.startsWith('src/lib/')).length;
ok('T0.1', `builder found, files[] parsed (${listed.length} entries, ${libTsCount} under src/lib)`);
ok('T0.2', 'files[] block located; comments stripped before quote matching (no apostrophe skew)');

// ── 判据：清单闭包 ──────────────────────────────────────────────────────
// 把清单条目归一化成 src/lib/... 形式。listedAbs 始终保持为 **数组**（.filter 可用），
// 需要集合语义时另建 Set —— 首版把 map 的结果当 Set 用，self-test 直接崩。
const listedArr = listed.map((p) => p.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\.ts$/, ''));
const listedAbs = new Set(listedArr);

/** 解析一个相对 specifier 相对 from 所在文件，产出归一形式。 */
function resolveRel(fromFile, spec) {
  const base = fromFile.slice(0, fromFile.lastIndexOf('/')); // src/lib/workbench
  // 🔴 不要为 '../' 预先 slice 掉 base 的末段：spec 里的 '..' 段本身还会再 pop 一次，
  // 预切等于上跳两级 → '../feedback/store' 从 src/lib/workbench 出发被算成
  // 'src/feedback/store'，不以 'src/lib/' 开头 → 被下面的 continue 静默跳过 →
  // 门禁永远报 PASS（假门禁，2026-10-05 由 --self-test 抓出）。
  // 正确做法：base 完整参与，让 spec 里的 '..' 段自己 pop。
  const segs = base.split('/').concat(spec.split('/'));
  const out = [];
  for (const s of segs) {
    if (s === '.' || s === '') continue;
    if (s === '..') { out.pop(); continue; }
    out.push(s);
  }
  return out.join('/').replace(/\.ts$/, '');
}

const missing = [];
let depEdges = 0;
let typeOnlyEdges = 0;

for (const entry of listedArr) {
  const absTs = join(ROOT, `${entry}.ts`);
  if (!existsSync(absTs)) {
    bad('T1.1', `listed file does not exist on disk: ${entry}.ts`);
    continue;
  }
  const src = readFileSync(absTs, 'utf8');
  // 匹配所有 from '...' / from "..."，含 type-only（必须含，否则测不到潜伏型缺口）
  for (const m of src.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    const spec = m[1];
    const isTypeOnly = /import\s+type\s/.test(src.slice(Math.max(0, m.index - 60), m.index));
    if (isTypeOnly) typeOnlyEdges++;
    // 只关心落在 src/lib 下的内部依赖（数据层之间）
    if (!spec.startsWith('.')) continue; // '@/...' 别名本层未使用；node: 内置忽略
    const target = resolveRel(entry, spec);
    if (!target.startsWith('src/lib/')) continue; // ../../../data/*.json 等
    depEdges++;
    if (!listedAbs.has(target)) {
      missing.push({ from: entry, spec, target, isTypeOnly });
    }
  }
}

say(`  ....  内部依赖边 ${depEdges} 条（其中 type-only ${typeOnlyEdges} 条）`);

if (depEdges === 0) {
  // 解析器没抓到任何边 = 判据失效，不是「没有依赖」
  unknown('T1.2', 'scanned 0 internal dependency edges — 解析器可能已失效，无法判定');
} else {
  ok('T1.2', `dependency edges parsed (${depEdges})`);
}

if (missing.length === 0) {
  ok('T1.3', `清单覆盖完整：${listedArr.length} 个文件的内部依赖全部在清单内`);
} else {
  for (const mi of missing) {
    bad('T1.3', `清单缺 ${mi.target}.ts（被 ${mi.from} 导入 '${mi.spec}'${mi.isTypeOnly ? '，type-only，潜伏型' : '，值导入，会炸'}）`);
  }
}

// ── 反向验证：复现「清单少一个文件」，确认判据真能抓到 ──────────────────
// 只在 --self-test 时跑；用完即弃，不污染工作区。
if (process.argv.includes('--self-test')) {
  say('\n  [self-test] 注入事故：把清单里任意一个条目删掉，判据是否报 FAIL？');
  const victim = listedArr.find((p) => p.endsWith('feedback/store')) || listedArr[0];
  const brokenArr = listedArr.filter((p) => p !== victim);
  const broken = new Set(brokenArr);
  let caught = 0;
  for (const entry of brokenArr) {
    const src = readFileSync(join(ROOT, `${entry}.ts`), 'utf8');
    for (const m of src.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const spec = m[1];
      if (!spec.startsWith('.')) continue;
      const target = resolveRel(entry, spec);
      if (!target.startsWith('src/lib/')) continue;
      if (!broken.has(target)) caught++;
    }
  }
  if (caught > 0) {
    ok('T2.1', `注入事故可被抓到：删掉 ${victim}.ts 后判据检出 ${caught} 条缺失依赖`);
  } else {
    bad('T2.1', `注入事故检不出：删掉 ${victim}.ts 判据仍报通过 —— 判据无效`);
  }
}

say('────────────────────────────────────────────────────────────────');
if (problems.length === 0) {
  if (hasUnknown) {
    say('INCONCLUSIVE: 存在不可判定项，未发现问题但不能算通过。');
    process.exit(0);
  }
  say('Transpile closure verified. No missing entries.');
  process.exit(0);
}
say(`${problems.length} problem(s) found. Fix before shipping.`);
process.exit(1);
