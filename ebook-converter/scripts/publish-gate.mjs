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
const ROOT = resolve(__dirname, '..');

// 计算本次发布变更的博文 slug（staged + 工作区未提交），仅这些进 BLOCK 范围
function changedBlogSlugs() {
  const SKIP = new Set(['index', 'types', 'rss']);
  const run = (args) => {
    const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
    return r.status === 0 ? (r.stdout || '').split('\n').map((s) => s.trim()).filter(Boolean) : [];
  };
  const files = new Set([
    ...run(['diff', '--name-only', '--cached', 'HEAD', '--', 'src/data/blog']),
    ...run(['diff', '--name-only', 'HEAD', '--', 'src/data/blog']),
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
    cwd: ROOT,
    stdio: 'inherit',
    env,
  });
  const code = r.status ?? 1;
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
