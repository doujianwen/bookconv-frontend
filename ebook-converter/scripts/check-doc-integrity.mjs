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

// 阻断门禁范围：仅这 7 份治理/战略/素材文档（本次要保护的对象，实测 FAIL 0）。
// 其余历史文档（含日志表自由文本里的 |、## 11/1 日期标题等）走 advisory 全量扫描，不阻断。
const GOVERNANCE_DOCS = [
  'docs/strategy/BookConv-战略定位与四项职能-V1.0.md',
  'docs/strategy/BookConv-原始规划与战略演进梳理-V1.0.md',
  'docs/strategy/BookConv-知识资产盘点报告-V1.0.md',
  'docs/learning-materials/BookConv-实战素材库索引-V1.0.md',
  'docs/learning-materials/素材沉淀机制-SOP-V1.0.md',
  'docs/project-governance/BookConv-战略整合红队审计-V1.0.md',
  'docs/project-governance/BookConv-本次更新执行与验收报告-V1.0.md',
];

// ───────────────────────────── 单文件检查 ─────────────────────────────

/**
 * 按「未转义的 |」拆表格行。遵循 CommonMark：
 *   · `\|` 是单元格内的字面竖线（例如 grep "a\|b"）→ 不当分隔符
 *   · 反引号代码串（`...|...`）内的 | 也不当分隔符（GitHub 亦如此渲染）
 *     —— 否则 `| BookConv | Free |` 这类对比表会被误判为列数不一致（首版实测踩过）
 */
function splitRow(line) {
  const cells = [];
  let cur = '';
  let inCode = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '`') {
      inCode = !inCode;
      cur += ch;
      continue;
    }
    if (inCode) {
      cur += ch;
      continue;
    }
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

  // ── D1：H2 章节编号唯一（仅提取「章节号形态」标记，排除英文单词标题）
  // 章节号形态：①单字母+分隔符（A. / B) / C:) ②字母.数字（G.2）③纯数字（1 / 1.5）④M.数字（M.4）
  // 反例（不提取）："## Layer 2:"、"## Persona B:" —— 首单词是完整英文词，非章节号；
  //   若整体提取会误把 "Layer" 截成 "L"，与真实的 "## L. 变更记录" 撞成假重复（首版实测踩过）。
  // 注：纯数字分支加了 (?![0-9/\-]) 负向前瞻——排除「## 11/1 晚间状态补记」「## 2026-10-01」
  // 这类日期标题被误当成章节号而假报重复（实测 geo-growth-experiment 踩过此坑；首版只写 (?![/\-])，
  // 正则会回溯取「11/1」的首位「1」去和真章节「## 1」撞重复，故前瞻要同时排除「数字」）。
  // 真章节号后是空格或点号，日期后是 / 或 - 或续接数字，故前瞻即可区分。
  const h2TokRe = /^##\s+((?:[A-Z]\.[0-9]+)|(?:[A-Z][.、):])|(?:[0-9]+(?:\.[0-9]+)*)(?![0-9/\-])|(?:M\.[0-9]+))/;
  const h2Tokens = [];
  lines.forEach((line, idx) => {
    const m = h2TokRe.exec(line);
    if (m) {
      const token = m[1].replace(/[.、):]$/, ''); // "A." → "A"；"G.2"/"1.5"/"M.4" 不变
      h2Tokens.push({ token, line: idx + 1, title: line.trim() });
    }
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
  // 关键：跳过围栏代码块（``` / ~~~）内的行 —— 否则 shell 管道 `curl | jq`、
  // JSON、`grep "a|b"` 等以 | 开头的代码行会被误当表格行，制造大量假 FAIL
  // （纪律：假失败比没门禁更坏，门禁必须高精而非高召回）。
  let block = [];
  let inFence = false;
  let fenceMarker = '';
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
    const fenceMatch = /^(\s*)(```|~~~)/.exec(line);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fenceMatch[2];
        flush(); // 围栏前的表格结束
      } else if (line.trim().startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = '';
      }
      return; // 围栏标记行本身不进表格
    }
    if (inFence) return; // 代码块内：跳过失落处理，也不入 block
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
  // 回归用例：围栏代码块内以 | 开头的行（shell 管道 / JSON）不得触发 D2
  'd-fence-pipe.md': `# T\n\n## A. 甲\n\n\`\`\`bash\ncurl -s url | jq '.a | .b'\ngrep "x|y" file\n\`\`\`\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n`,
  'd-clean.md': `# T\n\n## A. 甲\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n\n## B. 乙\n\n比例 51.9%（80/154）正确。\n`,
  // 回归用例：日期标题（## 11/1 / ## 2026-10-01）不得被误判为章节号重复；
  // 用「## 1 真实章节」做碰撞靶——若门禁回溯取「11/1」的首位「1」就会和「## 1」撞重复而 FAIL
  'd-date-heading-ok.md': `# T\n\n## 11/1 晚间状态补记（以此处更新为准）\n\n## A. 章节\n\n## 1 真实章节\n\n内容\n`,
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
      expectNoFail('d-fence-pipe.md'), // 回归：代码块内 | 行不得误报 D2
      expectNoFail('d-clean.md'),
      expectNoFail('d-date-heading-ok.md'), // 回归：日期标题不得误判章节号
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
  const useGovernance = argv.includes('--governance');
  const files = argv.filter((a) => !a.startsWith('--'));

  let targets;
  if (useGovernance) {
    targets = GOVERNANCE_DOCS.map((f) => path.resolve(ROOT, f));
  } else if (files.length > 0) {
    targets = files.map((f) => path.resolve(f));
  } else {
    // 默认：全量扫描 docs/（advisory，可能含历史文档的噪音 FAIL）
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
