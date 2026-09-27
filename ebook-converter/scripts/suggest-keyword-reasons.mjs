// scripts/suggest-keyword-reasons.mjs
// Generate evidence-based CANDIDATE causes for keyword rank movement.
//
//   node scripts/suggest-keyword-reasons.mjs [--threshold N]
//
// Reads data/keyword-series.json (bing.keywords) + data/competitor-series.json
// + data/algorithm-updates.json, runs the pure buildCandidates() from
// src/lib/keywords/candidates.ts (transpiled here the same way build-workbench-html.mjs
// does), and writes:
//   - data/keyword-reason-candidates.json   (machine-readable, committed)
//   - 数据分析/keyword-reason-candidates-<date>.md  (GEO-readable report, gitignored)
//
// Candidates are HYPOTHESES (correlation != causation). A human confirms them
// via scripts/confirm-keyword-reason.mjs, which is the ONLY path into
// data/keyword-reasons.json (the confirmed truth file).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transformSync } from '@swc/core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TMP = join(ROOT, '.wb-build');

function transpile(rel) {
  const abs = join(ROOT, rel);
  const src = readFileSync(abs, 'utf8');
  const out = transformSync(src, {
    filename: abs,
    jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
    module: { type: 'es6' },
  });
  const code = out.code
    .replace(/from ['"]\.\/([a-z-]+)['"]/g, "from './$1.mjs'")
    .replace(/from ['"]@\/(.*?)['"]/g, (_m, p) => `from '${p}.mjs'`);
  const dest = join(TMP, rel.replace(/^src\//, '').replace(/\.ts$/, '.mjs'));
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, code);
  return dest;
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

async function main() {
  const thresholdArg = process.argv.find((a) => a.startsWith('--threshold='));
  const threshold = thresholdArg ? Number(thresholdArg.split('=')[1]) : 3;

  const series = readJson(join(ROOT, 'data/keyword-series.json'), null);
  const competitor = readJson(join(ROOT, 'data/competitor-series.json'), null);
  const algoDoc = readJson(join(ROOT, 'data/algorithm-updates.json'), { updates: [] });

  if (!series || !series.bing) {
    console.error('✗ data/keyword-series.json 缺失或没有 bing 数据，先跑 npm run build:keywords');
    process.exit(1);
  }

  const candMod = await import(pathToFileURL(transpile('src/lib/keywords/candidates.ts')).href);
  const { buildCandidates } = candMod;

  const doc = buildCandidates({
    keywords: series.bing.keywords,
    competitorMatrix: competitor?.matrix ?? [],
    algoUpdates: algoDoc.updates ?? [],
    threshold,
    d0: series.d0,
  });

  writeFileSync(
    join(ROOT, 'data/keyword-reason-candidates.json'),
    JSON.stringify(doc, null, 2) + '\n',
    'utf8',
  );

  // Diagnostics: when the result is ZERO the report must say WHY, otherwise it
  // is indistinguishable from a broken run. This is the difference between
  // "no evidence-backed candidates today" and "the generator silently failed".
  const comparable = series.bing.keywords.filter((k) => k.delta !== null);
  const movers = comparable.filter((k) => Math.abs(k.delta) >= threshold);
  const compWithRank = [
    ...new Set((competitor?.matrix ?? []).filter((r) => r.latestRank !== null).map((r) => r.query)),
  ];
  const overlap = movers.map((k) => k.query).filter((q) => compWithRank.includes(q));
  const diag = {
    threshold,
    totalKeywords: series.bing.keywords.length,
    comparable: comparable.length,
    moversAtThreshold: movers.length,
    movers: movers.map((k) => ({ query: k.query, delta: k.delta })),
    competitorQueriesWithRank: compWithRank,
    overlap,
    algoWindows: algoDoc.updates?.length ?? 0,
  };

  const date = (series.d0 || new Date().toISOString().slice(0, 10));
  const md = renderReport(doc, diag);
  const mdPath = join(ROOT, '数据分析', `keyword-reason-candidates-${date}.md`);
  mkdirSync(dirname(mdPath), { recursive: true });
  writeFileSync(mdPath, md, 'utf8');

  console.log(`✓ 候选原因已生成：${doc.candidates.length} 个词有候选`);
  console.log(`  data/keyword-reason-candidates.json`);
  console.log(`  数据分析/keyword-reason-candidates-${date}.md（可读报告）`);
  console.log(`  阈值 |Δ| ≥ ${threshold}；竞品源 ${competitor?.matrix?.length ?? 0} 对，算法窗口 ${algoDoc.updates?.length ?? 0} 条`);
  console.log(`  确认某条：node scripts/confirm-keyword-reason.mjs "<query>" <itemIndex>`);
}

function renderReport(doc, diag) {
  const lines = [];
  lines.push(`# 关键词排名变动 · 候选原因报告`);
  lines.push('');
  lines.push(`> 生成于 ${doc.generatedAt} · 阈值 |Δ| ≥ ${doc.threshold} · 数据日 d0=${doc.d0}`);
  lines.push('>');
  lines.push('> ⚠️ 以下是**证据驱动的候选假设（相关≠因果）**，不是已确认的原因。');
  lines.push('> 请你逐条核对证据后，用 `confirm-keyword-reason.mjs` 把认可的晋升为正式原因；');
  lines.push('> 不认可的丢弃即可，绝不自动写入真相文件 `keyword-reasons.json`。');
  lines.push('');

  // ---------------------------------------------------------------- diagnostics
  lines.push(`## 诊断（为什么是这个结果）`);
  lines.push('');
  lines.push('| 项 | 值 |');
  lines.push('|---|---|');
  lines.push(`| Bing 唯一关键词 | ${diag.totalKeywords} |`);
  lines.push(`| 可比（≥2 观测点） | ${diag.comparable} |`);
  lines.push(`| 达标变动词（|Δ|≥${diag.threshold}） | ${diag.moversAtThreshold} |`);
  lines.push(`| 竞品有真实排名的词 | ${diag.competitorQueriesWithRank.length} |`);
  lines.push(`| **达标词 ∩ 竞品有排名词** | **${diag.overlap.length}** |`);
  lines.push(`| 已配置算法更新窗口 | ${diag.algoWindows} |`);
  lines.push('');
  if (diag.movers.length > 0) {
    lines.push(`达标变动词：`);
    lines.push('');
    for (const m of diag.movers) {
      lines.push(`- \`${m.query}\` Δ=${m.delta}`);
    }
    lines.push('');
  }
  if (diag.competitorQueriesWithRank.length > 0) {
    lines.push(`竞品有真实排名的词：${diag.competitorQueriesWithRank.map((q) => `\`${q}\``).join('、')}`);
    lines.push('');
  }
  if (diag.overlap.length === 0 && diag.moversAtThreshold > 0 && diag.competitorQueriesWithRank.length > 0) {
    lines.push(
      `> 🔴 **结论：这两个集合不相交** —— 达标的变动词没有一个落在竞品监测列表里，` +
        `所以无论把阈值降到多少都不会产生候选。这是**监控配置问题，不是工具故障**。`,
    );
    lines.push('>');
    lines.push('> 修法：把实际会动的词加进 `data/competitor-config.json` 的 `keywords`，');
    lines.push('> 再跑 `npm run fetch:competitor && npm run build:competitor`，候选才会出现。');
    lines.push('');
  }
  if (diag.overlap.length === 0 && diag.moversAtThreshold === 0) {
    lines.push('> 本期没有达到阈值的排名变动，属正常，无需处理。');
    lines.push('');
  }

  if (doc.candidates.length === 0) {
    lines.push('本期**没有可生成候选**的排名变动（原因见上方诊断）。');
    return lines.join('\n') + '\n';
  }
  for (const c of doc.candidates) {
    const obs = c.observed;
    lines.push(`## 「${c.query}」`);
    lines.push('');
    lines.push(
      `- 观测：${obs.prevPos ?? '?'} → ${obs.latestPos ?? '?'}（Δ=${obs.delta}，区间 ${obs.prevDate ?? '?'}→${obs.latestDate ?? '?'}）`,
    );
    lines.push('');
    c.items.forEach((it, i) => {
      lines.push(`### 候选 ${i} · [${it.type}] ${it.confidence} 置信度`);
      lines.push('');
      lines.push(`- 假设：${it.text}`);
      lines.push(`- 证据：${it.evidence}`);
      lines.push(`- 来源：${it.source}`);
      lines.push('');
    });
  }
  lines.push('---');
  lines.push('');
  lines.push('晋升为正式原因（写入 keyword-reasons.json）：');
  lines.push('```');
  lines.push('node scripts/confirm-keyword-reason.mjs "<query>" <itemIndex>');
  lines.push('```');
  return lines.join('\n') + '\n';
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
