#!/usr/bin/env node
/**
 * audit:repo-hygiene —— 仓库卫生门禁（仓库层盲区兜底）
 *
 * 为什么存在（2026-10-04 实测事故）：
 *   当天查出3 个仓库层问题，全部逃过了现有 15 个门禁——因为那些门禁
 *   只检查内容质量（claim/heading/geo），从不检查"仓库里躺着什么"。
 *     ① .gitignore 三处失效：`.next/` 不匹配 `.next-bc3/`（323MB 本地构建
 *        产物）、`.workbuddy-ai//` 双斜杠整条规则作废、`.trash/` 不匹配
 *        日期变体 → 谁跑一次 `git add -A` 就把323MB 推上公开仓库。
 *     ② public/ 下哈希命名垃圾文件漏删 → Vercel 部署 public/ 全量，
 *        该文件线上 HTTP 200 公网可访问。
 *     ③ instrumentation.ts 属于同批修复却从未入库（`git log --all` 空）。
 *
 * 本脚本做的是**反向检查**（"哪些东西不该在却没被拦住"），
 * 而非已知路径检查 —— 前者能发现未知问题，后者只能复核已知项。
 *
 * 判据（任一 FAIL 即退出码 1）：
 *   H1 公共目录垃圾文件：public/ 下不得有哈希/临时命名文件
 *   H2 大体积未跟踪文件：新增未跟踪文件 > 5MB（构建产物漏ignore 的信号）
 *   H3 ignore 规则实际生效：.gitignore 声明的目录规则必须真的命中
 *   H4工具重写污染：next-env.d.ts 不得指向 .next-* 变体（本地 build 泄漏）
 *
 * 用法：
 *   node scripts/audit-repo-hygiene.mjs            # 全量检查
 *   node scripts/audit-repo-hygiene.mjs --quiet    # 只输出结论
 *   node scripts/audit-repo-hygiene.mjs --no-size  # 跳过大文件扫描（慢）
 */

import { execFileSync } from 'node:child_process';
import { statSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = dirname(dirname(fileURLToPath(import.meta.url))); // ebook-converter/
/**
 * 仓库根可能高于应用根（git rev-parse 失败时降级为父目录）。
 * 不用 git 命令拿根：Windows 下 spawnSync git 可能 EBUSY（文件锁），
 * 崩在启动阶段比拿不到根更糟—— 门禁必须「降级运行」而不是「拒绝运行」。
 */
function resolveRepoRoot(appRoot) {
  const direct = appRoot;
  const parent = dirname(appRoot);
  // 判据：父目录存在 .git（文件或目录皆可，worktree 场景是文件）
  try {
    statSync(join(parent, '.git'));
    return parent;
  } catch {
    return direct;
  }
}
const REPO_ROOT = resolveRepoRoot(APP_ROOT);

const args = process.argv.slice(2);
const QUIET = args.includes('--quiet');
const SKIP_SIZE = args.includes('--no-size');

/** 公共目录：Vercel 会全量部署 public/，这里的任何文件都直接公网可访问 */
const PUBLIC_DIR = join(APP_ROOT, 'public');

/** 垃圾文件命名特征：哈希名、tmp/临时、备份残留 */
const JUNK_NAME_PATTERNS = [
  // 🔴 判据要点（10-04 踩坑）：哈希名必须**允许扩展名**。
  // 真实事故文件 = "6d8f9d25096b4bb380a718f3d84ee140.txt"（带 .txt），
  // 用 /^<hex>+$/ 锚死全名会**漏抓**（end anchor 匹配不上 ".txt"）——
  // 门禁看着有、实际抓不到 = 假门禁，比没门禁更坏。
  { re: /^[0-9a-f]{20,}(\.[a-z0-9]{1,8})?$/i, why: '哈希命名（临时产物特征，内容通常是自身哈希）' },
  { re: /^(tmp|temp)[-_.]/i, why: 'tmp/temp 前缀' },
  { re: /~$/, why: '编辑器备份文件' },
  { re: /^(copy|副本)/i, why: 'copy/副本 命名' },
  { re: /\.bak$/i, why: '.bak 备份残留' },
  { re: /\.orig$/i, why: '.orig 合并残留' },
];

/** 必须在 .gitignore 中声明且实际生效的目录规则 */
const MUST_BE_IGNORED = [
  { path: '.next', label: 'Next.js 构建产物' },
  { path: '.next-bc3', label: '本地 build 变体（junction bug 绕行产物，历史上323MB）' },
  { path: '.trash', label: '每日垃圾清理备份' },
  { path: '.trash-2026-10-01', label: '日期变体清理备份' },
  { path: '.workbuddy-ai', label: 'WorkBuddy AI 缓存' },
  { path: '_wb_tmp', label: 'WorkBuddy 临时脚本目录' },
  { path: 'node_modules', label: '依赖目录' },
];

const findings = [];
function fail(id, label, detail) {
  findings.push({ id, label, detail, level: 'FAIL' });
}
function warn(id, label, detail) {
  findings.push({ id, label, detail, level: 'WARN' });
}
/**
 * UNKNOWN = 判据无法执行（git 不可用 / 环境受限），不等于 PASS 也不等于 FAIL。
 * 关键设计：门禁在受限环境（沙箱内 EBUSY）下若把「无法判定」报成 FAIL，
 * 就是**假失败** —— 会训练人忽略门禁输出，这比没有门禁更危险。
 */
function unknown(id, label, detail) {
  findings.push({ id, label, detail, level: 'UNKNOWN' });
}
function gitUsable() {
  const r = gitExec(['rev-parse', '--git-dir'], { allowFail: true });
  return r.ok;
}
function pass(id, label, detail) {
  findings.push({ id, label, detail, level: 'PASS' });
}

/**
 * git 调用统一走这里。
 * Windows 上 git 进程偶发 EBUSY（index.lock /packed-refs 文件锁竞争），
 * 属瞬时故障 —— 重试 3 次并退避，而不是让整个门禁崩在启动阶段。
 * 门禁「拿不到数据」必须降级成 WARN/FAIL，绝不能变成进程崩溃。
 */
function gitExec(args, { allowFail = false } = {}) {
  let lastErr = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return { ok: true, out: execFileSync('git', args, { cwd: APP_ROOT, encoding: 'utf8' }) };
    } catch (e) {
      lastErr = e;
      // 🔴 关键区分（10-04 踩坑）：status 为数字（含非 0）= git 正常执行并给出
      // 退出码 ⇒ 有效结论，不重试；status 为 null/undefined = 进程崩溃（EBUSY 等）
      // ⇒ 才重试。把「退出码 1」误判为「git 不可用」会让门禁报假 FAIL。
      if (typeof e.status === 'number') {
        return { ok: true, out: e.stdout || '', exitCode: e.status };
      }
      lastErr = e;
      spawnSyncSleep();
    }
  }
  if (allowFail) return { ok: false, out: '', exitCode: null };
  throw lastErr;
}

function spawnSyncSleep() {
  // 同步忙等（Atomics.wait 避免 child_process 依赖，脚本已在顶层 import 同步模块）
  try {
    const sab = new SharedArrayBuffer(4);
    Atomics.wait(new Int32Array(sab), 0, 0, 150);
  } catch {
    /* 某些环境无 SharedArrayBuffer，退化为无退避 */
  }
}

function gitOut(args) {
  const r = gitExec(args, { allowFail: true });
  return r.ok ? r.out : '';
}

function dirSizeMb(dir) {
  let total = 0;
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try {
      entries = readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const p = join(cur, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.isFile()) {
        try {
          total += statSync(p).size;
        } catch {
          /* 文件可能已被清理 */
        }
      }
    }
  }
  return total / 1024 / 1024;
}

// ---------------------------------------------------------------- H1
// public/ 垃圾文件：直接公网可访问，且极易漏删（根目录那份删了，public 那份没删）
function checkPublicJunk() {
  let names = [];
  try {
    names = readdirSync(PUBLIC_DIR);
  } catch {
    fail('H1', 'public/ 目录可读', `无法读取 ${PUBLIC_DIR}`);
    return;
  }
  const junk = names.filter((n) => JUNK_NAME_PATTERNS.some((p) => p.re.test(n)));
  if (junk.length === 0) {
    pass('H1', 'public/ 无垃圾文件', `${names.length} 个文件，均为正常命名`);
  } else {
    fail(
      'H1',
      'public/ 存在垃圾文件（线上公网可访问）',
      junk
        .map((n) => `${n} — ${JUNK_NAME_PATTERNS.find((p) => p.re.test(n)).why}`)
        .join('; ')
    );
  }
}

// ---------------------------------------------------------------- H2
// 未跟踪大文件 = 构建产物/临时产物没被 ignore 拦住的前兆信号
function checkUntrackedLargeFiles() {
  if (SKIP_SIZE) {
    pass('H2', '未跟踪大文件扫描', '已按 --no-size 跳过');
    return;
  }
  const out = gitOut(['status', '--porcelain', '--untracked-files=normal']);
  const untracked = out
    .split('\n')
    .filter((l) => l.startsWith('?? '))
    .map((l) => l.slice(3).trim().replace(/^"(.*)"$/, '$1'));

  const LARGE = new Set(['.next-bc3', '.trash-2026-10-01']);
  const big = [];
  for (const rel of untracked) {
    const name = basename(rel);
    if (LARGE.has(name) || rel.includes('/')) {
      // 仍对具体目录测体积
    }
    let st;
    try {
      st = statSync(join(APP_ROOT, rel));
    } catch {
      continue;
    }
    if (st.isFile()) {
      if (st.size / 1024 / 1024 > 5) big.push(`${rel} (${(st.size / 1024 / 1024).toFixed(1)}MB, 单文件)`);
    } else if (st.isDirectory()) {
      const mb = dirSizeMb(join(APP_ROOT, rel));
      if (mb > 5) big.push(`${rel}/ (${mb.toFixed(1)}MB, 目录)`);
    }
  }
  if (big.length === 0) {
    pass('H2', '无>5MB 未跟踪文件', `${untracked.length} 个未跟踪项，体积均达标`);
  } else {
    warn(
      'H2',
      '存在 >5MB 未跟踪文件（可能被 git add -A 误提交）',
      big.join('; ')
    );
  }
}

// ---------------------------------------------------------------- H3
// .gitignore 规则「实际生效」检查 —— 不是看规则存在，是看 check-ignore 是否真的命中
function checkIgnoreRulesEffective() {
  const broken = [];
  let gitUnavailable = false;
  for (const item of MUST_BE_IGNORED) {
    const full = join(APP_ROOT, item.path);
    let exists = true;
    try {
      statSync(full);
    } catch {
      exists = false;
    }
    // 🔴 判据要点（10-04 实测）：必须用「子路径探针」而非目录裸路径。
    // .gitignore 的「.next/」是尾斜杠目录规则，只匹配目录；
    // git check-ignore 对**不存在**的路径按文件判定 ⇒ 裸路径必然 exit=1（假FAIL）。
    // 用 <dir>/x 探针无论目录是否存在都能命中规则，这才是真判据。
    void exists;
    const probe = `${item.path}/__hygiene_probe__`;
    const res = gitExec(['check-ignore', '-q', '--', probe], { allowFail: true });
    if (!res.ok) {
      gitUnavailable = true;
      continue;
    }
    // check-ignore 退出码 0 = 已忽略；1 = 未忽略（正常结果，不是错误）
    const ignored = res.exitCode === 0;
    if (!ignored) {
      broken.push(`${item.path} (${item.label})${exists ? '' : ' [目录当前不存在，用探针路径测规则]'}`);
    }
  }
  if (gitUnavailable) {
    warn('H3', '.gitignore 规则检查', 'git 进程不可用（EBUSY/锁竞争），本项降级跳过 —— 请重跑');
    return;
  }
  if (broken.length === 0) {
    pass('H3', '.gitignore 规则实际生效', `${MUST_BE_IGNORED.length} 条目录规则全部命中`);
  } else {
    fail('H3', '.gitignore 规则失效（check-ignore 未命中）', broken.join('; '));
  }
}

// ---------------------------------------------------------------- H4
// 本地 build 泄漏：本地 build 需 --webpack + .next-bc3绕junction bug，
// 会把 next-env.d.ts 改写成 .next-bc3 路径，推上去让 Vercel 构建路径错乱
function checkBuildArtifactLeak() {
  const envPath = join(APP_ROOT, 'next-env.d.ts');
  let content = '';
  try {
    content = readFileSync(envPath, 'utf8');
  } catch {
    warn('H4', 'next-env.d.ts 可读性', '文件不存在，跳过');
    return;
  }
  const m = content.match(/import\s+"(\.[^"]*types\/routes\.d\.ts)"/);
  if (!m) {
    pass('H4', 'next-env.d.ts 路径正常', '未发现 routes.d.ts 引用');
    return;
  }
  const ref = m[1];
  if (/\.next-/.test(ref)) {
    fail(
      'H4',
      'next-env.d.ts 被本地构建污染（会破坏 Vercel 构建）',
      `引用 ${ref} —— 本地 build 用了 .next-* 变体目录，push 前必须 git checkout还原`
    );
  } else {
    pass('H4', 'next-env.d.ts 路径正常', `引用 ${ref}`);
  }
}

// ---------------------------------------------------------------- H5
// 同批修复只落一半：instrumentation.ts 这类"提交说明写了但文件没 add"的情况，
// git log 查不到任何记录= 从未入库
function checkOrphanSource() {
  const CRITICAL = ['src/instrumentation.ts'];
  const missing = [];
  for (const rel of CRITICAL) {
    const tracked = gitOut(['ls-files', '--error-unmatch', '--', rel]).trim();
    const onDisk = (() => {
      try {
        statSync(join(APP_ROOT, rel));
        return true;
      } catch {
        return false;
      }
    })();
    if (onDisk && !tracked) {
      missing.push(`${rel} 存在于磁盘但从未 git add（git log 查不到）`);
    }
  }
  if (missing.length === 0) {
    pass('H5', '关键源文件均已入库', `${CRITICAL.length} 个关键文件已 tracked`);
  } else {
    fail('H5', '关键源文件漏提交（同批修复只落一半）', missing.join('; '));
  }
}
// ---------------------------------------------------------------- 输出
function report() {
  const fails = findings.filter((f) => f.level === 'FAIL');
  const warns = findings.filter((f) => f.level === 'WARN');
  const passes = findings.filter((f) => f.level === 'PASS');
  const unknowns = findings.filter((f) => f.level === 'UNKNOWN');
  const hasUnknown = unknowns.length > 0;

  if (!QUIET) {
    console.log('');
    console.log('仓库卫生审计（repository hygiene）');
    console.log('='.repeat(74));
    console.log(`仓库根: ${REPO_ROOT}`);
    console.log(`应用根: ${APP_ROOT}`);
    console.log('');
    const icon = { PASS: '✓', WARN: '!', FAIL: '✗', UNKNOWN: '?' };
    for (const f of findings) {
      console.log(`${icon[f.level]} [${f.id}] ${f.label}`);
      console.log(`      ${f.detail}`);
    }
    console.log('');
    console.log('-'.repeat(74));
  }
  console.log(
    `结论: ${passes.length} PASS / ${warns.length} WARN / ${unknowns.length} UNKNOWN / ${fails.length} FAIL — ${
      fails.length === 0
        ? hasUnknown
          ? '⚠️  通过（含未判定项）'
          : '✅ 通过'
        : '❌ 未通过'
    }`
  );
  if (hasUnknown) {
    console.log('');
    console.log('⚠️  UNKNOWN 明细（判据未执行，勿当PASS）：');
    unknowns.forEach((f) => console.log(`  ? [${f.id}] ${f.label}`));
  }
  if (fails.length > 0) {
    console.log('');
    console.log('FAIL 明细（任一 FAIL 即不得 push）：');
    fails.forEach((f) => console.log(`  · [${f.id}] ${f.label}`));
  }
  console.log('');
  // 🔴 返回结构必须与调用方解构一致（10-04踩坑：曾return 裸布尔值，
  // 调用方按 {ok, hasUnknown} 解构 ⇒ ok 恒undefined ⇒ 明明"通过"却 exit 1，
  // 会让 CI 永远红）。UNKNOWN 不影响退出码（判据未执行≠不通过）。
  return { ok: fails.length === 0, hasUnknown };
}

checkPublicJunk();
checkBuildArtifactLeak();

// 以下 3 项依赖 fork git；沙箱/受限环境会EBUSY ⇒ 降级 UNKNOWN 而非假 FAIL
if (gitUsable()) {
  checkIgnoreRulesEffective();
  checkOrphanSource();
  checkUntrackedLargeFiles();
} else {
  unknown('H2', '未跟踪大文件扫描', 'git 进程不可用（spawnSync EBUSY，沙箱限制）—— 门禁在受限环境降级，请在正常终端复跑');
  unknown('H3', '.gitignore 规则实际生效', 'git 进程不可用（spawnSync EBUSY，沙箱限制）—— 请在正常终端复跑');
  unknown('H5', '关键源文件均已入库', 'git 进程不可用（spawnSync EBUSY，沙箱限制）—— 请在正常终端复跑');
}

const { ok, hasUnknown } = report();
process.exit(ok ? 0 : 1);
