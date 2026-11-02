// 生成 docs/数据分析索引.md —— 机器可读索引，只解决「有哪些文件」，不产生结论
// 用法: node scripts/build-data-index.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGETS = [
  { dir: 'data', desc: '站内数据源（配置、算法更新、critic 层快照等），被 src 直接读取' },
  { dir: '数据分析', desc: 'GSC / GA4 / Bing / 竞品流水线产物，多为时点快照' },
];

// 主题分组规则：按文件名前缀匹配。规则显式声明，未命中进「其他」——不硬凑分类。
const GROUP_RULES = [
  [/^GSC[-_]?/i, 'GSC（Google Search Console）'],
  [/^Bing/i, 'Bing（Webmaster / AI 引用）'],
  [/^GA4/i, 'GA4（分析）'],
  [/^keyword/i, '关键词（keyword）'],
  [/^competitor/i, '竞品（competitor）'],
  [/^TopicPortfolio/i, 'TopicPortfolio'],
  [/^关键词排名竞品周报/, '周报（关键词排名/竞品）'],
  [/^critic_layer/i, 'critic 层快照'],
  [/^www\.bookconv\.com/i, 'www.bookconv.com（站内抓取/页面级）'],
  [/^page/i, '页面级（page）'],
  [/^geo/i, 'GEO（geo）'],
  [/^convert差异化/i, '转换页差异化'],
  [/^UNIFIED/i, 'UNIFIED'],
  [/^周报/, '周报'],
  [/^bing/i, 'Bing（Webmaster / AI 引用）'],
];

// 疑似编码异常：文件名含 U+0080–U+00FF（Latin-1 补充区），正常中文名不会出现
const MOJIBAKE = /[\u0080-\u00ff]/;
const MOJIBAKE_GROUP = '⚠️ 文件名编码异常（疑似 GBK 被按 Latin-1 解码）';

function groupOf(name, rel) {
  const base = path.basename(name);
  if (MOJIBAKE.test(base)) return MOJIBAKE_GROUP;
  for (const [re, label] of GROUP_RULES) if (re.test(base)) return label;
  const seg = rel.split('/')[0];
  if (rel.includes('/')) return `子目录：${seg}`;
  return '其他';
}

function kb(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function fmtDate(d) {
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// 递归收集（不限深度，但排除 node_modules 等）
function walk(absDir, baseDir, out = []) {
  for (const e of fs.readdirSync(absDir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const abs = path.join(absDir, e.name);
    if (e.isDirectory()) {
      walk(abs, baseDir, out);
    } else if (e.isFile()) {
      const rel = path.relative(baseDir, abs).split(path.sep).join('/');
      const st = fs.statSync(abs);
      out.push({ rel, size: st.size, mtime: st.mtime });
    }
  }
  return out;
}

const now = new Date();
const lines = [];
let grandTotal = 0;
let totalMojibake = 0;

lines.push('# 数据分析索引（自动生成）', '');
lines.push(`> **生成时间**：${fmtDate(now)}｜**生成脚本**：\`scripts/build-data-index.mjs\`｜**覆盖**：\`data/\` + \`数据分析/\`（含子目录）`);
lines.push('> **性质**：机器生成的**文件清单**，只回答「有哪些文件、多大、什么时候改的」。');
lines.push('> **不含**：任何业务结论、指标好坏判断、优先级建议。要读结论请去 `docs/BookConv运营全面复盘-2026-11-01.md` 或各文件正文。');
lines.push('');
lines.push('> ⚠️ **使用须知（避免误用过期快照）**');
lines.push('> 1. `修改时间` 只反映**文件写入**时间，**不等于数据口径的截止日**（回填历史数据会刷新 mtime）。');
lines.push('> 2. 本目录存在大量**不同窗口**的快照（7 天 / 28 天 / 90 天 / 89 天累计等）。**跨文件相减或混算会得到错误结论**——引用前先确认每个文件的窗口口径。');
lines.push('> 3. 需要「当前值」时，**重新跑采集脚本**，不要拿本目录里 mtime 最新的文件当现状。');
lines.push('> 4. 本文件是**索引不是证据**：文件存在 ≠ 内容可靠。');
lines.push('');
lines.push('---', '');

for (const t of TARGETS) {
  const abs = path.join(ROOT, t.dir);
  if (!fs.existsSync(abs)) {
    lines.push(`## ${t.dir}/（目录不存在，跳过）`, '');
    continue;
  }
  const entries = walk(abs, abs);
  entries.sort((a, b) => b.mtime - a.mtime);
  grandTotal += entries.length;

  const groups = new Map();
  for (const f of entries) {
    const g = groupOf(f.rel, f.rel);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(f);
  }

  const totalSize = entries.reduce((s, f) => s + f.size, 0);
  const newest = entries[0]?.mtime;
  const oldest = entries[entries.length - 1]?.mtime;
  const mojiCount = entries.filter((f) => MOJIBAKE.test(path.basename(f.rel))).length;
  totalMojibake += mojiCount;

  lines.push(`## ${t.dir}/ — ${entries.length} 个文件 / ${kb(totalSize)}`);
  lines.push('');
  lines.push(`> ${t.desc}`);
  if (newest && oldest) lines.push(`> **时间跨度**：${fmtDate(oldest)} → ${fmtDate(newest)}（按 mtime）`);
  const subdirs = [...new Set(entries.map((f) => f.rel).filter((r) => r.includes('/')).map((r) => r.split('/')[0]))];
  if (subdirs.length) lines.push(`> **子目录**：${subdirs.map((s) => `\`${s}/\``).join('、')}`);
  if (mojiCount) lines.push(`> 🔴 **编码异常**：${mojiCount} 个文件名疑似 GBK 被按 Latin-1 解码，**在脚本/命令行中无法按原名访问**，需先重命名`);
  lines.push('');
  lines.push('| 主题分组 | 文件数 | 组内最新 | 组内最旧 |');
  lines.push('|---|---|---|---|');
  const sortedGroups = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [g, files] of sortedGroups) {
    lines.push(`| ${g} | ${files.length} | ${fmtDate(files[0].mtime)} | ${fmtDate(files[files.length - 1].mtime)} |`);
  }
  lines.push('');

  for (const [g, files] of sortedGroups) {
    lines.push(`### ${g}（${files.length}）`, '');
    lines.push('| 文件 | 大小 | 修改时间 |');
    lines.push('|---|---|---|');
    for (const f of files) {
      lines.push(`| \`${f.rel}\` | ${kb(f.size)} | ${fmtDate(f.mtime)} |`);
    }
    lines.push('');
  }
  lines.push('---', '');
}

lines.push('## 汇总', '');
lines.push(`- 文件总数：**${grandTotal}**`);
lines.push(`- 编码异常文件名：**${totalMojibake}**`);
lines.push('- 分组规则：见脚本顶部 `GROUP_RULES`（显式正则，未命中归入「其他」或「子目录：xxx」，**不硬凑分类**）');
lines.push('- 重新生成：`node scripts/build-data-index.mjs`');
lines.push('');
lines.push('> 本索引由脚本生成，**请勿手工编辑**（下次生成会覆盖）。需要补说明请写在各自正文文档里，不要加到本表。');
lines.push('');

const out = path.join(ROOT, 'docs', '数据分析索引.md');
fs.writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`OK 写入 ${out}`);
console.log(`文件总数 ${grandTotal}｜编码异常 ${totalMojibake}`);
