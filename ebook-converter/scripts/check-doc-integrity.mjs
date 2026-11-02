#!/usr/bin/env node
/**
 * check-doc-integrity.mjs — 文档自身完整性门禁（红队判据 R-D1/D2/D3/D4 的可执行版）
 *
 * 为什么需要这道门禁（2026-11-02 红队复盘结论）：
 *   原有 19 条红队判据只覆盖「有外部真相源」的事实类缺陷（可回源 git / 文件系统 /
 *   正则）。而当晚在审计 PASS 之后的持续写入中，又自造了 5 处缺陷：
 *     ① 章节编号重复（## K 出现两次）      ② 表格两行被静默合并
 *     ③ 百分比算错（写 62%，实为 51.9%）  ④ 新增表格让旧数字失效（282→289 未同步）
 *   这些的共同点：**不存在外部真相源**，无法「回源」证伪，只能与「文档本应长什么样」
 *   比对。判据写在文档里仍需「有人在对的时刻想起来执行」——等于靠记忆。
 *   故本脚本把可机械化的三条做成闸门，第四条显式声明为 UNKNOWN（不可自动化）。
 *
 * 判据与状态语义（三态，禁 fallthrough）：
 *   D1 章节编号唯一且有序 —— 可机械化 → FAIL
 *   D2 表格内各行列数一致 —— 可机械化 → FAIL
 *   D3 百分比可回算     —— 仅「带分母标注」可机械化 → FAIL / UNKNOWN
 *      · `51.9%（80/154）` 形式 → 精确回算，偏差 > 1 个百分点 = FAIL
 *      · 裸 `62%` 无分母      → UNKNOWN（不可判定，绝不当作 PASS）
 *   D4 同指标跨节取值一致 —— **不可机械化** → 恒输出 UNKNOWN 提示，需人工比对
 *
 * 用法：
 *   node scripts/check-doc-integrity.mjs <file...>        # 检查指定文件
 *   node scripts/check-doc-integrity.mjs                  # 默认扫描 docs/ 下全部 .md
 *   node scripts/check-doc-integrity.mjs --json           # 机器可读输出
 *   node scripts/check-doc-integrity.mjs --self-test      # 反向验证：注入缺陷必须 exit 1
 *
 * 退出码：0 = 无 FAIL（可能含 UNKNOWN）；1 = 有 FAIL；2 = 脚本自身异常（fail-closed）
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ───────────────────────────── 单文件检查 ─────────────────────────────

/** 按「未转义的 |」拆表格行。Markdown 里 `\|` 是单元格内的字面竖线（例如 grep "a\|b"）。 */
function splitRow(line) {
  const cells = [];
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '\\' && line[i + 1] === '|') {
      cur += '\\|';
      i++;
      continue;
    }
    if (ch === '|') {
      cells.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  cells.push(cur);
  // 首尾因行首/行尾的 | 各产生一个空串（若行以 | 开头/结尾）
  const trimmed = line.trim();
  if (trimmed.startsWith('|')) cells.shift();
  if (trimmed.endsWith('|')) cells.pop();
  return cells;
}

const isSeparatorRow = (line) => /^\|?[\s:|-]+\|?$/.test(line.trim()) && line.includes('-');

function checkFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const findings = [];

  // ── D1：H2 章节编号唯一（子号必须完整保留：1.5 ≠ 1，G.2 ≠ G）
  // 正则要点：`(?:\.\d+)*` 必须贪婪吃完整子号；`(?=\s|$)` 保证编号后是真分隔，
  // 否则 "## 1.5 xxx" 会被截断成 "1" 而与 "## 1. xxx" 误判重复（首版实测踩过）。
  const h2Tokens = [];
  lines.forEach((line, idx) => {
    const m = /^##\s+([A-Za-z0-9]+(?:\.\d+)*)[.、)]?(?=\s|$)/.exec(line);
    if (m) h2Tokens.push({ token: m[1], line: idx + 1, title: line.trim() });
  });
  const seen = new Map();
  for (const h of h2Tokens) {
    if (seen.has(h.token)) {
      findings.push({
        rule: 'D1',
        severity: 'FAIL',
        line: h.line,
        msg: `章节编号 "${h.token}" 重复（首次出现于第 ${seen.get(h.token)} 行）：${h.title}`,
      });
    } else {
      seen.set(h.token, h.line);
    }
  }

  // ── D2：表格内各行列数一致
  let block = [];
  const flush = () => {
    if (block.length === 0) return;
    const rows = block.filter((r) => !isSeparatorRow(r.line));
    if (rows.length >= 2) {
      const head = splitRow(rows[0].line).length;
      for (const r of rows.slice(1)) {
        const n = splitRow(r.line).length;
        if (n !== head) {
          findings.push({
            rule: 'D2',
            severity: 'FAIL',
            line: r.no,
            msg: `表格列数不一致：表头 ${head} 列，本行 ${n} 列（疑似两行被合并 / 多写竖线）`,
          });
        }
      }
    }
    block = [];
  };
  lines.forEach((line, idx) => {
    if (line.trim().startsWith('|')) {
      block.push({ line, no: idx + 1 });
    } else {
      flush();
    }
  });
  flush();

  // ── D3：百分比可回算（仅带分母标注者可精确校验）
  const annotated = /(\d+(?:\.\d+)?)\s*%\s*[（(]\s*(\d+)\s*[/／]\s*(\d+)\s*[）)]/g;
  let bareCount = 0;
  let annotatedCount = 0;
  lines.forEach((line, idx) => {
    let m;
    annotated.lastIndex = 0;
    while ((m = annotated.exec(line)) !== null) {
      annotatedCount++;
      const pct = parseFloat(m[1]);
      const num = parseFloat(m[2]);
      const den = parseFloat(m[3]);
      if (den === 0) {
        findings.push({ rule: 'D3', severity: 'FAIL', line: idx + 1, msg: `百分比分母为 0：${m[0]}` });
        continue;
      }
      const calc = (num / den) * 100;
      if (Math.abs(calc - pct) > 1) {
        findings.push({
          rule: 'D3',
          severity: 'FAIL',
          line: idx + 1,
          msg: `百分比回算不符：写 ${pct}%，但 ${num}/${den} = ${calc.toFixed(1)}%（容差 1 个百分点）`,
        });
      }
    }
    // 裸百分比：扣掉已带分母的，其余无法判定
    const bareInLine = (line.match(/\d+(?:\.\d+)?\s*%/g) || []).length - (line.match(annotated) || []).length;
    if (bareInLine > 0) bareCount += bareInLine;
  });

  if (bareCount > 0) {
    findings.push({
      rule: 'D3',
      severity: 'UNKNOWN',
      line: 0,
      msg: `${bareCount} 处裸百分比（无分母标注）无法回算 —— 不可判为 PASS。写作规范：比例须写成 \`51.9%（80/154）\` 方可机械校验`,
    });
  }
  if (annotatedCount === 0 && bareCount === 0) {
    findings.push({ rule: 'D3', severity: 'UNKNOWN', line: 0, msg: '本文档无百分比内容，D3 不适用（UNKNOWN 而非 PASS）' });
  }

  // ── D4：同指标跨节一致性 —— 不可机械化，恒报 UNKNOWN
  findings.push({
    rule: 'D4',
    severity: 'UNKNOWN',
    line: 0,
    msg: '同指标跨节取值一致性**未机械化**：需人工/agent 比对（见红队判据 R-D4）。脚本绿 ≠ D4 通过',
  });

  return findings;
}

// ───────────────────────────── 反向验证 ─────────────────────────────

const FIXTURES = {
  'd1-duplicate-heading.md': `# T\n\n## A. 第一\n\n内容\n\n## B. 第二\n\n内容\n\n## A. 重复\n\n内容\n`,
  'd2-broken-table.md': `# T\n\n| a | b | c |\n| --- | --- | --- |\n| 1 | 2 | 3 |\n| 4 | 5 |\n`,
  'd3-wrong-pct.md': `# T\n\n合并后失败占比 62%（80/154），污染数据集。\n`,
  'd-escaped-pipe.md': `# T\n\n| 判据 | 证据 |\n| --- | --- |\n| 检索 | \`grep "素材\\|课程"\` 零命中 |\n| 行数 | 360 |\n`,
  // 回归用例：子号章节（1.5 / G.2）不得被判成与主号（1 / G）重复
  'd-subnumber-ok.md': `# T\n\n## 1. 甲\n\n内容\n\n## 1.5 子节\n\n内容\n\n## 1.6 子节\n\n内容\n\n## G. 乙\n\n内容\n\n## G.2 子节\n\n内容\n`,
  'd-clean.md': `# T\n\n## A. 甲\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n\n## B. 乙\n\n比例 51.9%（80/154）正确。\n`,
};

function selfTest() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-integrity-'));
  const results = [];
  try {
    for (const [name, content] of Object.entries(FIXTURES)) {
      const p = path.join(dir, name);
      fs.writeFileSync(p, content, 'utf8');
      const f = checkFile(p);
      results.push({ name, fails: f.filter((x) => x.severity === 'FAIL'), findings: f });
    }

    const expectFail = (name, rule) => {
      const r = results.find((x) => x.name === name);
      const hit = r.fails.some((x) => x.rule === rule);
      return { name: `${name} 应触发 ${rule}`, ok: hit, detail: hit ? 'PASS' : `未触发（实际 FAIL: ${r.fails.map((x) => x.rule).join(',') || '无'}）` };
    };
    const expectNoFail = (name) => {
      const r = results.find((x) => x.name === name);
      return { name: `${name} 应无 FAIL`, ok: r.fails.length === 0, detail: r.fails.length === 0 ? 'PASS' : `误报 ${r.fails.map((x) => `${x.rule}:${x.msg}`).join(' | ')}` };
    };

    const checks = [
      expectFail('d1-duplicate-heading.md', 'D1'),
      expectFail('d2-broken-table.md', 'D2'),
      expectFail('d3-wrong-pct.md', 'D3'),
      expectNoFail('d-escaped-pipe.md'), // 反向验证：转义竖线不得误报 D2
      expectNoFail('d-subnumber-ok.md'), // 回归：1.5/G.2 不得误报 D1
      expectNoFail('d-clean.md'),
    ];

    let bad = 0;
    for (const c of checks) {
      if (!c.ok) bad++;
      console.log(`${c.ok ? '✓' : '✗'} ${c.name} — ${c.detail}`);
    }
    const cleanHasUnknown = (results.find((x) => x.name === 'd-clean.md').findings || []).some((x) => x.severity === 'UNKNOWN');
    console.log(`${cleanHasUnknown ? '✓' : '✗'} 干净文件仍报 UNKNOWN（D4 恒提示，防「脚本绿=全过」）`);
    if (!cleanHasUnknown) bad++;

    console.log(`\n自检结果：${checks.length + 1 - bad} passed / ${bad} failed`);
    process.exit(bad === 0 ? 0 : 1);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ───────────────────────────── 主流程 ─────────────────────────────

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.next' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--self-test')) return selfTest();
  const asJson = argv.includes('--json');
  const files = argv.filter((a) => !a.startsWith('--'));

  let targets = files.map((f) => path.resolve(f));
  if (targets.length === 0) {
    const docs = path.join(ROOT, 'docs');
    targets = fs.existsSync(docs) ? walk(docs) : [];
  }
  if (targets.length === 0) {
    console.error('[doc-integrity] 未找到待检查文件（fail-closed，不当作通过）');
    process.exit(2);
  }

  const report = [];
  for (const f of targets) {
    if (!fs.existsSync(f)) {
      console.error(`[doc-integrity] 文件不存在：${f}`);
      process.exit(2);
    }
    report.push({ file: path.relative(ROOT, f), findings: checkFile(f) });
  }

  const totalFail = report.reduce((s, r) => s + r.findings.filter((x) => x.severity === 'FAIL').length, 0);
  const totalUnknown = report.reduce((s, r) => s + r.findings.filter((x) => x.severity === 'UNKNOWN').length, 0);

  if (asJson) {
    console.log(JSON.stringify({ scanned: targets.length, fail: totalFail, unknown: totalUnknown, report }, null, 2));
  } else {
    for (const r of report) {
      const fails = r.findings.filter((x) => x.severity === 'FAIL');
      const unknowns = r.findings.filter((x) => x.severity === 'UNKNOWN');
      if (fails.length === 0 && unknowns.length === 0) continue;
      console.log(`\n■ ${r.file}`);
      for (const x of fails) console.log(`  FAIL    [${x.rule}]${x.line ? ` L${x.line}` : ''} ${x.msg}`);
      for (const x of unknowns) console.log(`  UNKNOWN [${x.rule}] ${x.msg}`);
    }
    console.log(
      `\n[doc-integrity] 扫描 ${targets.length} 文件｜FAIL ${totalFail}｜UNKNOWN ${totalUnknown}` +
        (totalFail === 0 ? '  → 无 FAIL（UNKNOWN 不等于通过，须人工看）' : '  → 存在 FAIL，已阻断'),
    );
  }

  process.exit(totalFail === 0 ? 0 : 1);
}

main();
