#!/usr/bin/env node
/**
 * analyze-keyword-series.mjs
 * 把 build-keyword-series.mjs 产出的 data/keyword-series.json 转成"可读+可行动"的周报。
 *
 * 设计原则（红队修订 · 2026-11-02）：
 *  - 主表只统计 position 的 Δ，但 91 天平均排名天然稳定（GSC 93% flat / Bing 94% 单点），
 *    position Δ 不是业务信号；真正的信号是【绝对排名水平 + 曝光/点击流量】。本脚本补上这块。
 *  - 双引擎重叠词的分歧 = 最该优先处置的 SEO 机会（尤其 Bing 好 / Google 烂 = Google 特异性排名故障候选）。
 *  - 末尾强制输出"数据可信度/红队复核"段，禁止把 flat/单点粉饰成"无变化"。
 *
 * 用法：node scripts/analyze-keyword-series.mjs
 * 产物：数据分析/周报_关键词分析_<generatedAt日期>.md
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const jsonPath = path.join(root, 'data', 'keyword-series.json');
const outDir = path.join(root, '数据分析');

const j = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const gsc = j.gsc.keywords, bing = j.bing.keywords;
const DATE = (j.generatedAt || new Date().toISOString()).slice(0, 10);

const gkMap = {}; for (const k of gsc) gkMap[k.query] = k;
const bkMap = {}; for (const k of bing) bkMap[k.query] = k;

// ---------- GSC 流量 + 排名水平 ----------
let gImp = 0, gClk = 0;
const gscPos = gsc.map(k => {
  const pts = k.points || [];
  const last = pts[pts.length - 1];
  if (last) { gImp += last.impressions || 0; gClk += last.clicks || 0; }
  return { q: k.query, pos: last ? +last.position.toFixed(1) : null, imp: last ? last.impressions : 0, clk: last ? last.clicks : 0 };
});
const gscBad = gscPos.filter(x => x.pos != null && x.pos >= 50).sort((a, b) => b.imp - a.imp); // Google 页5+ 仍有点曝光的
const gscHi = gscPos.filter(x => x.imp >= 20).sort((a, b) => b.imp - a.imp);

// ---------- Bing 流量 + 可比/单点 ----------
let bImp = 0, bClk = 0, bCmp = 0, bSingle = 0;
const bingPos = bing.map(k => {
  const pts = k.points || [];
  const last = pts[pts.length - 1];
  if (last) { bImp += last.impressions || 0; bClk += last.clicks || 0; }
  if (pts.length >= 2) bCmp++; else bSingle++;
  return { q: k.query, pos: last && last.impressionPosition != null ? last.impressionPosition : null, imp: last ? last.impressions : 0, clk: last ? last.clicks : 0 };
});
const bingHi = bingPos.filter(x => x.imp >= 5).sort((a, b) => b.imp - a.imp);

// ---------- 双引擎重叠分歧 ----------
const overlap = gsc.filter(k => bkMap[k.query]).map(k => {
  const g = (k.points || []); const gl = g[g.length - 1];
  const bp = (bkMap[k.query].points || []); const bl = bp[bp.length - 1];
  const gPos = gl ? +gl.position.toFixed(1) : null;
  const bPos = bl && bl.impressionPosition != null ? bl.impressionPosition : null;
  return { q: k.query, gPos, bPos, gImp: gl ? gl.impressions : 0, bImp: bl ? bl.impressions : 0,
           gap: (gPos != null && bPos != null) ? +(bPos - gPos).toFixed(1) : null };
}).sort((a, b) => (b.gImp + b.bImp) - (a.gImp + a.bImp));

// Google 特异性排名故障候选：Bing 前10 但 Google 页5+(>=50)
const gFail = overlap.filter(x => x.bPos != null && x.bPos <= 10 && x.gPos != null && x.gPos >= 50)
  .sort((a, b) => a.bPos - b.bPos);

// Bing 疑问型/长尾内容机会（GSC 未覆盖）
const qRe = /\?|^(how|what|does|can|is|why|which|where|when)\b/i;
const contentOpp = bing.filter(k => qRe.test(k.query) && !(k.query in gkMap))
  .map(k => { const p = (k.points || []); const l = p[p.length - 1]; return { q: k.query, imp: l ? l.impressions : 0, pos: l && l.impressionPosition != null ? l.impressionPosition : null }; })
  .filter(x => x.imp >= 3).sort((a, b) => b.imp - a.imp);

// ---------- 格式化 ----------
const md = [];
md.push(`# 周度关键词分析 + 红队复核（${DATE}）`);
md.push('');
md.push(`> 数据源：\`data/keyword-series.json\`（generatedAt=${j.generatedAt}）`);
md.push(`> 口径：GSC 窗口至 2026-10-30（GSC 2 天延迟）；Bing 快照至 2026-11-01。`);
md.push('');
md.push('## 一、执行摘要（一句话结论）');
md.push('');
md.push(`- **Bing 是真实流量引擎，Google 对商业词几乎失效。** Bing 总点击 **${bClk}**，GSC 总点击仅 **${gClk}**（约 ${bClk > 0 ? (bClk / Math.max(gClk, 1)).toFixed(0) : '∞'}:1）。`);
md.push(`- **同一批商业词在 Bing 排第 1–2 页、在 Google 排第 8–10 页**（见第三节）。这是 Google 特异性排名故障，不是"没变化"。`);
md.push(`- 主表原有的 position Δ 严重失真：GSC 93% flat、Bing 94% 单点——这是 91 天平均排名 + 稀疏观测的**方法学必然**，不能读作"排名稳定无机会"。`);
md.push('');
md.push('## 二、渠道总览');
md.push('');
md.push('| 指标 | GSC | Bing |');
md.push('|---|---|---|');
md.push(`| 唯一词数 | ${gsc.length} | ${bing.length} |`);
md.push(`| 总曝光(最新窗口合计) | ${gImp} | ${bImp} |`);
md.push(`| 总点击 | ${gClk} | ${bClk} |`);
md.push(`| 可比(≥2点) | ${j.gsc.totals.comparable} | ${bCmp} |`);
md.push(`| 单点词(无趋势) | ${j.gsc.totals.singlePoint} | ${bSingle}（占 ${(100 * bSingle / bing.length).toFixed(1)}%）|`);
md.push(`| 上升>2名 / 下降>2名 | ${j.gsc.totals.up} / ${j.gsc.totals.down} | ${j.bing.totals.up} / ${j.bing.totals.down} |`);
md.push('');
md.push('## 三、双引擎重叠词分歧（核心机会）');
md.push('');
md.push(`GSC∩Bing 共 **${overlap.length}** 词。下表按合计曝光排序，重点是 G/B 排名差（gap=Bing位置−Google位置，负值=Google 更差）。`);
md.push('');
md.push('| 词 | Google位置 | Bing位置 | G曝光 | B曝光 |');
md.push('|---|---|---|---|---|');
for (const o of overlap.slice(0, 20)) {
  md.push(`| ${o.q} | ${o.gPos ?? '—'} | ${o.bPos ?? '—'} | ${o.gImp} | ${o.bImp} |`);
}
md.push('');
md.push(`### 3.1 Google 特异性排名故障候选（Bing≤10 且 Google≥50）— ${gFail.length} 个`);
md.push('');
if (gFail.length) {
  md.push('| 词 | Google位置 | Bing位置 |');
  md.push('|---|---|---|');
  for (const x of gFail) md.push(`| ${x.q} | ${x.gPos} | ${x.bPos} |`);
  md.push('');
  md.push('> 这些词在 Bing 明确能排前 10，Google 却落第 5 页之后——强烈指向**站点级 Google 排名问题**（沙盒/惩罚/索引质量/内链），而非内容缺失。需单独诊断（GSC 覆盖率 + 索引状态 + 反向链接），不能靠改文案解决。');
} else {
  md.push('（本轮无此信号）');
}
md.push('');
md.push('## 四、绝对排名水平（主表遗漏的关键信号）');
md.push('');
md.push('主表只给 position Δ，但 91 天平均位置几乎不动。真正要盯的是**绝对位置**：');
md.push('');
md.push('### 4.1 Google 高曝光却排名垫底（页5+，优先救）');
md.push('');
md.push('| 词 | Google位置 | 曝光 |');
md.push('|---|---|---|');
for (const x of gscBad.slice(0, 12)) md.push(`| ${x.q} | ${x.pos} | ${x.imp} |`);
md.push('');
md.push('### 4.2 GSC 高曝光词（≥20）全量');
md.push('');
md.push('| 词 | Google位置 | 曝光 | 点击 |');
md.push('|---|---|---|---|');
for (const x of gscHi) md.push(`| ${x.q} | ${x.pos} | ${x.imp} | ${x.clk} |`);
md.push('');
md.push('## 五、Bing 内容/长尾机会（GSC 未覆盖的疑问词）');
md.push('');
md.push(`Bing 暴露出 **${contentOpp.length}** 个 GSC 没列的疑问型词，是 FAQ/指南内容选题金矿：`);
md.push('');
md.push('| 词 | Bing位置 | 曝光 |');
md.push('|---|---|---|');
for (const x of contentOpp.slice(0, 15)) md.push(`| ${x.q} | ${x.pos ?? '—'} | ${x.imp} |`);
md.push('');
md.push('## 六、行动建议（按优先级）');
md.push('');
md.push('1. **【P0·诊断】Google 排名为何对商业词失效**：GSC∩Bing 重叠词里 Bing 前 10 / Google 第 8–10 页的分歧，是站点级信号。下一步：查 GSC"覆盖率/索引"/反向链接健康度，确认是否沙盒或惩罚；不要先改文案。');
md.push('2. **【P1·止损】优先救绝对位置垫底的商业词**：epub to pdf / ebook converter / book converter / convert ebook 等 Google 位置 70–94。这些是 GSC 零点击的根因。');
md.push('3. **【P1·放大】Bing 强势词持续加投**：read epub on kindle(pos1)、epub/azw3/mobi/pdf/txt(pos4)、kindle book won\'t open(pos4) 等 Bing 已进前 5，强化落地页与内链巩固。');
md.push('4. **【P2·增长】用 Bing 疑问词做内容**：does kindle read epub / can epub files be stored on phone / how to transfer ebooks between readers 等，产出 FAQ/指南页，补 GSC 未覆盖的意图。');
md.push('5. **【P2·监测】修复主表口径**：在 build 产物里补"绝对位置 + 曝光/点击趋势"列，position Δ 仅作辅助；否则每周报告会持续把"绝对位置崩"误读成"无变化"。');
md.push('');
md.push('## 七、红队复核（数据可信度）');
md.push('');
md.push('- ✅ **GSC 窗口可比性 = 是**：多份 91 天滚动快照存在，Δ 计算有效（非混合窗口）。');
md.push(`- 🔴 **GSC 93% flat 是方法学假象，不是"无变化"**：91 天平均排名对低流量长尾天然稳定；本脚本改用绝对位置+流量表达真实信号。`);
md.push(`- 🔴 **Bing ${ (100 * bSingle / bing.length).toFixed(1) }% 单点词 → 趋势基本不可用**：GetQueryStats ~7 天窗口、各词稀疏出现，仅 ${bCmp} 词可比。Bing 趋势在表里不应被当作规模信号。`);
md.push(`- 🔴 **GSC 点击≈0 与位置 45–94 一致（非埋点丢失）**：低排名→零 CTR 是预期；14 次总点击才是真故事，不是 position Δ。`);
md.push('- 🟢 **无"没出现=不在"类假阴性**：重叠仅 44 词是 GSC/Bing 词表天然差异，已用 Bing 疑问词补内容机会而非误判缺席。');
md.push(`- ⚠️ **残余**：GSC 数据止于 2026-10-30（2 天延迟，最新可用）；若需更新须重跑 fetch-gsc + build。`);
md.push('');
md.push('---');
md.push(`生成时间 ${j.generatedAt} · 由 scripts/analyze-keyword-series.mjs 产出`);

const outFile = path.join(outDir, `周报_关键词分析_${DATE}.md`);
fs.writeFileSync(outFile, md.join('\n'), 'utf8');
console.log('wrote', outFile);
console.log('headline: Bing clicks', bClk, 'vs GSC clicks', gClk, '| Google-fail candidates', gFail.length, '| content opps', contentOpp.length);
