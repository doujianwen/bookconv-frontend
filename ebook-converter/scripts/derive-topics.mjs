#!/usr/bin/env node
// 衍生选题自动汇总（workflow §四 4.5 连线的读取端，2026-10-11）
// 扫描作战台任务的 statusNote（约定主字段）/ detail 中的「衍生选题：<目标>」前缀，
// 输出候选选题清单到 数据分析/衍生选题汇总-<日期>.md。
// 退出码：0=正常执行（含 0 命中，会显式说明）；2=作战台 JSON 不可解析/文件缺失（不可判定）。
// 用法：node scripts/derive-topics.mjs [--board <path>] [--out <dir>]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
function argOf(name, dflt) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
}
const boardPath = resolve(ROOT, argOf('--board', 'data/seo-geo-board.json'));
const outDir = resolve(ROOT, argOf('--out', '数据分析'));

// ── 读取与自检（判据失效时 exit 2，不报假结果）────────────────────────────
let board;
try {
  board = JSON.parse(readFileSync(boardPath, 'utf8'));
} catch (e) {
  console.error(`exit 2: 作战台 JSON 不可解析（${e.message.slice(0, 120)}）`);
  process.exit(2);
}
if (!board.modules || typeof board.modules !== 'object') {
  console.error('exit 2: board.modules 缺失或非对象，判据无法执行');
  process.exit(2);
}

// ── 收集任务与命中 ──────────────────────────────────────────────────────────
const tasks = [];
for (const [mod, m] of Object.entries(board.modules)) {
  const list = m.tasks || m.items || [];
  for (const t of list) tasks.push({ mod, ...t });
}
const RE = /衍生选题[:：]\s*([^\n]+)/;
const hits = [];
for (const t of tasks) {
  for (const fld of ['statusNote', 'detail']) {
    const v = t[fld];
    if (typeof v !== 'string') continue;
    const m = v.match(RE);
    if (m) hits.push({ source: `${t.id || '(无id)'}`, mod: t.mod, field: fld, target: m[1].trim() });
  }
}

// ── 目标解析：前导 M/D/K 编号 → board 任务 id；否则按标题模糊匹配 ───────────
function resolveTarget(target) {
  const key = target.trim();
  const code = key.match(/^([MDK]\d+(?:-\d+)?)/i);
  if (code) {
    const byId = tasks.find((t) => (t.id || '').toLowerCase() === code[1].toLowerCase());
    if (byId) return { resolved: true, ref: `${byId.id} ${String(byId.action).slice(0, 40)}` };
  }
  const byAction = tasks.find((t) => String(t.action || '').includes(key) && key.length >= 4);
  if (byAction) return { resolved: true, ref: `${byAction.id} ${String(byAction.action).slice(0, 40)}` };
  return { resolved: false, ref: '未解析（可能指向执行计划文档 M/D/K 编号或尚不存在的新选题）' };
}
for (const h of hits) h.resolution = resolveTarget(h.target);

// ── 报告（日期用本地时区，禁 UTC）─────────────────────────────────────────
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
let md = `# 衍生选题汇总 ${today}\n\n`;
md += `> 来源：作战台 \`data/seo-geo-board.json\` 任务 statusNote/detail 的「衍生选题：」前缀（约定见 _readme 与 workflow §四 4.5）。\n`;
md += `> 生成：\`npm run topics:derive\`（scripts/derive-topics.mjs）。本报告为快照，非权威源。\n\n`;
md += `- 扫描任务总数：**${tasks.length}**\n`;
md += `- 衍生选题命中：**${hits.length} 条**${hits.length === 0 ? '（约定 2026-10-10 刚登记，尚无使用记录——此为显式空态，非故障）' : ''}\n\n`;
if (hits.length) {
  md += `| 来源任务 | 所在模块 | 字段 | 指向目标 | 解析状态 |\n|---|---|---|---|---|\n`;
  for (const h of hits) {
    md += `| ${h.source} | ${h.mod} | ${h.field} | ${h.target} | ${h.resolution.ref} |\n`;
  }
  md += `\n## 建议动作\n\n- 「已解析」项：核对目标任务状态后进入 ② 内容规划取题流程。\n- 「未解析」项：人工确认是指向执行计划文档编号（§十）还是需新建作战台任务。\n`;
}
const outFile = join(outDir, `衍生选题汇总-${today}.md`);
mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, md, 'utf8');

console.log(`扫描任务 ${tasks.length} 个，衍生选题命中 ${hits.length} 条`);
for (const h of hits) console.log(`  [${h.resolution.resolved ? '已解析' : '未解析'}] ${h.source} → ${h.target}`);
console.log(`报告已写入 ${outFile}`);
process.exit(0);
