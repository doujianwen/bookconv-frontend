// scripts/publish-gate.mjs
//
// 「纯纠错智能体」门禁（Gate B）—— bookconv 发布前总闸。
//
// 串起两层纠察，任一失败即退出码 1，卡住 git push / 部署：
//   ① seo-critic.mjs      —— 结构层（注册收敛 / llms.txt 同步 / 死链 / i18n / hreflang）
//   ② critic-layer.blog.mjs —— 内容层（写作指南：GEO/SEO/去AI/E-E-A-T/内链）
//
// 用法：node scripts/publish-gate.mjs
//   建议接 git pre-push 钩子，或发布命令前置：
//     "publish": "node scripts/publish-gate.mjs && git push"
//
// 退出码：0 = 两层均放行；1 = 任一层有 BLOCK/critical（不得发布）。

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, basename } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GIT_ROOT = resolve(__dirname, '../..'); // 电子书格式转换站/（git root，父目录）
const PROJ_ROOT = resolve(__dirname, '..');   // ebook-converter/（项目根）

// 计算本次发布变更的博文 slug（staged + 工作区未提交），仅这些进 BLOCK 范围
//
// ⚠️ 2026-10-04 修复（本项目纪律 8：判据取不到基线 ≠ 基线为空）：
// 原来这里用 spawnSync('git') 取变更集。但 Windows 上 Node 内 fork 任何二进制都 EBUSY
// （status === null），旧代码 `r.status === 0 ? ... : []` 把 EBUSY 静默变成「本次无变更」，
// 于是 GATE_SLUGS 没设 → critic 层退化成审计全量 64 篇 → 存量 BLOCK 拦住本次 push。
// 实测证据：_wb_tmp/probe-fork.mjs 打印 status=null / error=EBUSY。
//
// 修法（两层）：
//   ① 优先读 pre-push 钩子传进来的 GATE_SLUGS —— 钩子是 sh 调 git，不受 EBUSY 影响，
//      它算出的 slug 列表才是权威的「本次变更范围」。
//   ② 拿不到时才回退到本地 git；回退拿不到（EBUSY）必须 exit(2) 明确报「不可判定」，
//      绝不静默当成「无变更」——静默放行等于把门禁关掉。
function slugsFromEnv() {
  // 区分「钩子未提供 GATE_SLUGS」（回退本地 git）与「钩子明确给了空串」
  // （= 钩子用 sh-git 权威判定「本次无博文变更」，直接采信，绝不能回退——
  //   回退会在 Windows 上 spawnSync git EBUSY → exit 2，误拦纯文档/配置 push）。
  // 修复前：空串与未提供不可区分，.gitignore/docs-only push 被门禁自身故障拦死。
  if (!('GATE_SLUGS' in process.env)) return null;
  const SKIP = new Set(['index', 'types', 'rss']);
  return (process.env.GATE_SLUGS || '').split(',').map((s) => s.trim()).filter(Boolean)
    .filter((s) => !SKIP.has(s));
}

function changedBlogSlugs() {
  const fromEnv = slugsFromEnv();
  if (fromEnv) {
    console.log('[publish-gate] slug 范围来源：GATE_SLUGS 环境变量（由 pre-push 钩子提供，权威）');
    return fromEnv;
  }
  console.log('[publish-gate] 未收到 GATE_SLUGS，回退到本地 git 查询…');
  const SKIP = new Set(['index', 'types', 'rss']);
  const run = (args) => {
    const r = spawnSync('git', args, { cwd: GIT_ROOT, encoding: 'utf8' });
    if (r.status === 0) return (r.stdout || '').split('\n').map((s) => s.trim()).filter(Boolean);
    if (r.status === null) {
      console.error('[publish-gate] ❌ 本地 git 调用崩溃（status=null，Windows 上通常是 EBUSY）');
      console.error('[publish-gate]    ⇒ 无法判定本次变更范围。');
      console.error('[publish-gate]    ⇒ 绝不把「取不到」当成「无变更」（那等于关掉门禁）。');
      console.error('[publish-gate]    修法：请通过 pre-push 钩子 push（它用 sh 调 git，不受此影响），');
      console.error('[publish-gate]          或临时用 GATE_SLUGS=a,b 显式指定本次变更的 slug。');
      process.exit(2);
    }
    // status 是非 0 的数字 = git 正常执行并给出结论（例如路径不存在），不是崩溃
    return [];
  };
  const files = new Set([
    ...run(['diff', '--name-only', '--cached', 'HEAD', '--', 'ebook-converter/src/data/blog']),
    ...run(['diff', '--name-only', 'HEAD', '--', 'ebook-converter/src/data/blog']),
  ]);
  const slugs = new Set();
  for (const f of files) {
    const base = basename(f).replace(/\.ts$/, '');
    if (base && !SKIP.has(base)) slugs.add(base);
  }
  return [...slugs];
}

const layers = [
  { name: '结构层 (seo-critic)', cmd: 'seo-critic.mjs', scoped: false },
  { name: '内容层 (blog-content)', cmd: 'critic-layer.blog.mjs', scoped: true },
];

const changedSlugs = changedBlogSlugs();
console.log('\n══════════════════════════════════════════════════════');
console.log('  bookconv 发布门禁（纯纠错智能体）');
console.log('══════════════════════════════════════════════════════');
console.log(changedSlugs.length
  ? `本次变更博文（进入 BLOCK 范围）：${changedSlugs.join(', ')}`
  : '本次未变更博文（内容层仅报告存量问题，不阻断发布）');
console.log('');

let failed = false;
for (const layer of layers) {
  console.log(`── 运行 ${layer.name} ──`);
  const env = { ...process.env, NODE_OPTIONS: '', CODEBUDDY_SESSION_ID: '' };
  if (layer.scoped && changedSlugs.length) env.GATE_SLUGS = changedSlugs.join(',');
  const r = spawnSync(process.execPath, [resolve(__dirname, layer.cmd)], {
    cwd: PROJ_ROOT,
    stdio: 'inherit',
    env,
  });
  // 区分「子进程正常退出（status 为数字）」与「门禁自身故障」：
  //   - r.status === null：进程崩溃 / 无法启动（Windows 上 Node fork 自身偶发 EBUSY）；
  //   - r.signal 非空：子进程被子信号杀死；
  //   - r.error 存在：spawn 本身出错（如 EBUSY）。
  // 这些都属于「门禁判据无法执行」，绝不能伪装成「内容有 BLOCK」误导人以为
  // 代码有问题。纪律：判据无法执行降级为 UNKNOWN（exit 2），fail-closed 拦截，
  // 但诚实标注根因，便于定位，而非逼人去修根本没问题的代码。
  if (r.status === null || r.signal || r.error) {
    const why = r.error
      ? `spawn 失败（${r.error.code}）`
      : r.signal
        ? `被子信号 ${r.signal} 杀死`
        : '进程崩溃（status=null）';
    console.error(`[publish-gate] ❌ ${layer.name} 门禁子进程故障：${why}，判据无法执行。`);
    console.error(`[publish-gate]    ⇒ 降级为 UNKNOWN（exit 2），fail-closed 拦截。`);
    console.error(`[publish-gate]    ⇒ 这是门禁自身故障，不是内容 BLOCK；请确认 Node 环境正常后重试。`);
    process.exit(2);
  }
  const code = r.status;
  // 子脚本显式报告「判据无法执行」（main 包裹 try/catch 后 process.exit(2)）
  // 也走 UNKNOWN 分支，与 spawn 故障一视同仁。
  if (code === 2) {
    console.error(`[publish-gate] ⚠️ ${layer.name} 报告判据无法执行（exit 2，UNKNOWN）。`);
    process.exit(2);
  }
  if (code !== 0) {
    failed = true;
    console.log(`❌ ${layer.name} 未放行（exit ${code}）\n`);
  } else {
    console.log(`✅ ${layer.name} 放行\n`);
  }
}

console.log('══════════════════════════════════════════════════════');
if (failed) {
  console.log('⛔ 纠察层未完全放行 —— 发布被拦截。请先清零 BLOCK/critical 再 push。');
  console.log('══════════════════════════════════════════════════════\n');
  process.exit(1);
}
console.log('✅ 两层纠察均放行，可以发布。');
console.log('══════════════════════════════════════════════════════\n');
process.exit(0);
