#!/usr/bin/env node
/**
 * BookConv 对外陈述合规门禁（Product Claims Gate）· 2026-11-13
 *
 * 建立原因：`docs/tasks/CEO_四模型交叉审计_终审报告_2026-11-13.md` 根因 C ——
 * 旧门禁 `scripts/audit-plan-claims.mjs` 只扫 `src/data/blog|content|guides` 与
 * `public/llms.txt`，漏掉 `src/app/`、`src/components/`、`messages/*`、
 * `openapi.json`、JSON-LD 生成源，导致它报 0 error 时全站仍在漂移。
 * 本脚本**补充**而非替换旧门禁（旧门禁管套餐数值，本门禁管对外陈述句式）。
 *
 * 分层裁定（用户 2026-11-13 拍板：核心页 + 全站门禁）：
 *   - CORE_FILES 命中违规句式 ⇒ BLOCKING（exit 1）。核心层必须 0 命中。
 *   - 其余对外载体（src/data/** 博客/指南/内容长尾）命中 ⇒ ADVISORY，只列清单、
 *     不影响退出码，供后续分批治理。**不假绿**：输出会明确打印残留数量。
 *   - `--strict` 可让 ADVISORY 也阻断（等长尾清理完再开启）。
 *
 * 判据纪律：
 *   1. 只测不变量（精确违规短语），不用宽泛词做全局替换判据 —— 实测
 *      "DRM-free" 有 252 处正当用法、"perfect"/"the fastest" 多为普通英语，
 *      否定式合规声明（"we don't remove DRM"）必须放行，否则就是假失败。
 *   2. 内部规范文档（docs/**）不参与扫描：事实源里必须列举禁用措辞，
 *      扫它等于把「元文档」当成「对外承诺」，是设计性误报。
 *   3. 判据无法执行（文件缺失 / 读取失败 / JSON 无法解析）⇒ UNKNOWN（exit 2），
 *      绝不降级成 PASS，也绝不报 FAIL。
 *   4. `--self-test` 纯内存注入事故 → 期望拦截，恢复 → 期望放行，并验 UNKNOWN
 *      分支；双向退出码都要实测，不靠推理。
 *
 * Usage:
 *   node scripts/audit-product-claims.mjs                # 默认：核心阻断 + 长尾报告
 *   node scripts/audit-product-claims.mjs --strict       # 长尾也阻断
 *   node scripts/audit-product-claims.mjs --self-test    # 反向验证（不写文件）
 *   node scripts/audit-product-claims.mjs --json         # 机器可读结果
 * Exit: 0 = 核心层 PASS ｜ 1 = BLOCKING 命中/JSON 非法/自测失败 ｜ 2 = UNKNOWN
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FACTS_V2 = 'docs/BookConv-Product-Facts-v2-2026-11-13.md';
const ENTITY = 'docs/ENTITY.md';
const ADVISORY_OUT = '_wb_tmp/product-claims-advisory.json';

/** 对外核心载体：这些文件里的违规句必须 0 命中。 */
const CORE_FILES = [
  'src/app/[locale]/HomePageClient.tsx',
  'src/app/[locale]/about/page.tsx',
  'src/app/[locale]/batch/page.tsx',
  'src/app/[locale]/compare/bookconv-vs-calibre/page.tsx',
  'src/app/[locale]/pricing/page.tsx',
  'src/app/[locale]/privacy/page.tsx',
  'src/app/api-docs/openapi.json',
  'src/components/layout/RootChrome.tsx',
  'src/components/tools/ConversionProgress.tsx',
  'src/lib/error-handler.ts',
  'src/lib/payments/service.ts',
  'src/lib/schema.ts',
  'src/lib/seo/schema.ts',
  'src/lib/seo/conversion-faq.ts',
  'src/lib/seo/securityFaq.ts',
  'messages/en.json',
  'messages/es.json',
  'public/llms.txt',
];

/**
 * 显式声明的已知核心层缺口（红队 2026-11-13 推翻「核心层已全覆盖」后补）。
 * 这些载体对外可见，但本轮经用户批准不修改；必须打印出来，否则
 * 「核心 0 命中」会被误读成「全站对外陈述已干净」——那就是假绿。
 */
const KNOWN_EXCLUSIONS = [
  {
    file: 'src/data/testimonials.ts',
    risk: 'P0',
    reason: '被 ToolPageClient.tsx / TestimonialsSection.tsx 渲染到每个 /convert/[slug] 页；含 "perfect — no formatting loss" 证言。改写引语需原作者授权，终审报告禁止 AI 润色，故本轮不擅改。',
  },
  {
    file: 'src/data/content/** · src/data/blog/** · src/data/guides/**',
    risk: 'P1',
    reason: '用户批准本轮不动长尾 SEO 文案；构建产物实测约 24 个页面（96 个 HTML/RSC 文件）仍展示旧 Pro / DRM 句式，见 ADVISORY 清单。',
  },
];
const JSON_FILES = new Set([
  'messages/en.json',
  'messages/es.json',
  'src/app/api-docs/openapi.json',
]);

/** 全站对外载体（ADVISORY 扫描根）；docs/** 与 scripts/** 明确排除。 */
const ADVISORY_ROOTS = ['src', 'messages', 'public/llms.txt'];
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.mdx', '.txt']);
const SKIP_DIR = new Set(['node_modules', '.next', '__tests__', '.git', '_wb_tmp', '_archived', '_archive']);

/**
 * 违规判据：全部为**精确短语**，不含裸 "DRM-free" / "perfect" / "fastest"。
 * 「文章标题类」承诺（Without Losing Formatting）不纳入 —— 只改 llms.txt 分发端
 * 会造成与源页面 title 不一致，必须与长尾一起改，登记为 ADVISORY 而非阻断。
 */
const RULES = [
  {
    id: 'R01', label: 'Calibre 全路径绝对句',
    re: /Every conversion runs through[^.\n]*Calibre|runs every conversion through[^.\n]*Calibre|[Pp]owered by Calibre|built on the open-source Calibre conversion engine|Impulsado por el Motor Calibre|Every file[^.\n]{0,30}Calibre engine/gi,
  },
  {
    id: 'R02', label: '未经证明的删除/保留时限',
    re: /deleted automatically within 1 hour|auto-?deleted within (?:1|one) hour|within (?:1|one) hour[^.\n]{0,30}delet|deleted after the conversion completes|automatically deleted after the conversion|deleted instantly|Files are encrypted in transit and auto-deleted/gi,
  },
  {
    id: 'R03', label: '移除/绕过 DRM 的引导或承诺',
    re: /remove DRM before converting|quita el DRM antes de convertir|Remove DRM first|must remove DRM|remove DRM yourself|DRM protection will be removed|DRM will be removed|DRM removal requires original purchase credentials|Contact our support if you need assistance with licen|How do I remove DRM|can remove DRM for personal backup|Without removing DRM first|Once DRM is removed|until the DRM is removed|DeDRM plugin for books|Remove DRM you do not own/gi,
  },
  {
    id: 'R04', label: 'Pro 仍写作 beta 后计划（与已标价展示冲突）',
    re: /Pro (?:is )?planned after (?:the )?beta|planned for Pro after (?:the )?beta|It is planned for Pro after beta|open beta 结束后由 Pro 计划承载/gi,
  },
  {
    id: 'R05', label: '无条件 100MB 上限（batch/fallback 的 4MB 表述正确，不纳入）',
    re: /100 MB per-file limit|capped at 100 MB each on every plan|Uploads are limited to 100 MB per file[^.\n]{0,60}on every plan|Los archivos están limitados a 100 MB por archivo|File size today is 100 MB[^.\n]{0,30}on every plan|Files are capped at 100 MB[^.\n]{0,30}on every plan/gi,
  },
  {
    id: 'R06', label: '速度绝对承诺（收窄：排除代码注释/第三方软件/读者行为）',
    re: /lightning[- ]fast|Lightning Fast|al instante|\binstant (?:conversion|results|download)\b|Convert EPUB, MOBI[^.\n]{0,80}\binstantly\b|\binstantly\b[^.\n]{0,40}No registration/gi,
  },
  {
    id: 'R07', label: '无条件保真承诺',
    re: /fully preserves|no formatting loss|zero loss|near-zero loss/gi,
  },
  {
    id: 'R08', label: 'LIT 不可用（与 conversion map 冲突）',
    re: /LIT are not available|KFX or LIT are not available|LIT is not available|LIT[^.\n]{0,20}unavailable/gi,
  },
  {
    id: 'R09', label: '把 BookConv 写成开源后端',
    re: /Open source backend/gi,
  },
  {
    id: 'R10', label: '架构归属错误（声称全部在浏览器内处理）',
    re: /runs entirely in your browser|processed entirely in your browser/gi,
  },
];

function norm(p) { return p.replace(/\\/g, '/'); }

function collectFiles(targets) {
  const out = [];
  const walk = (dir, rel) => {
    for (const name of fs.readdirSync(dir)) {
      if (SKIP_DIR.has(name)) continue;
      const full = path.join(dir, name);
      const r = rel ? `${rel}/${name}` : name;
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full, r);
      else if (EXTS.has(path.extname(name))) out.push(norm(r));
    }
  };
  for (const t of targets) {
    const abs = path.join(ROOT, t);
    if (!fs.existsSync(abs)) continue;
    if (fs.statSync(abs).isFile()) out.push(norm(t));
    else walk(abs, norm(t));
  }
  return [...new Set(out)].sort();
}

/** 只测内容不变量的纯函数，供 self-test 注入虚拟文本。 */
function evaluate(coreEntries, advisoryEntries, meta) {
  const blocking = [];
  const advisory = [];
  const unknown = [];
  const jsonErrors = [];

  for (const f of CORE_FILES) {
    if (!coreEntries.some((e) => e.file === f)) unknown.push(`核心文件缺失/不可读：${f}`);
  }
  for (const e of coreEntries) {
    if (JSON_FILES.has(e.file)) {
      try { JSON.parse(e.text); } catch (err) { jsonErrors.push(`${e.file}: ${err.message}`); }
    }
    for (const h of scanText(e.file, e.text)) blocking.push(h);
  }
  for (const e of advisoryEntries) {
    for (const h of scanText(e.file, e.text)) advisory.push(h);
  }
  for (const u of meta.unknown) unknown.push(u);
  return { blocking, advisory, unknown, jsonErrors, meta };
}

function scanText(file, text) {
  const hits = [];
  const lines = text.split(/\r?\n/);
  for (const rule of RULES) {
    const re = rule.re;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {
        hits.push({
          file, line: i + 1, ruleId: rule.id, ruleLabel: rule.label,
          match: m[0], context: line.trim().slice(0, 200),
        });
        if (re.lastIndex === m.index) re.lastIndex++;
      }
    }
  }
  return hits;
}

function readMeta() {
  const unknown = [];
  let factsActive = false;
  let entitySuperseded = false;
  try {
    factsActive = /\bACTIVE\b/.test(fs.readFileSync(path.join(ROOT, FACTS_V2), 'utf8'));
  } catch { unknown.push(`单一事实源不可读：${FACTS_V2}`); }
  try {
    entitySuperseded = /SUPERSEDED/i.test(fs.readFileSync(path.join(ROOT, ENTITY), 'utf8'));
  } catch { unknown.push(`旧实体文档不可读：${ENTITY}`); }
  if (!factsActive) unknown.push(`事实源未标记 ACTIVE：${FACTS_V2}`);
  if (!entitySuperseded) unknown.push(`旧实体文档未标记 SUPERSEDED：${ENTITY}`);
  return { factsActive, entitySuperseded, unknown };
}

function loadEntries(files) {
  const entries = [];
  for (const f of files) {
    try { entries.push({ file: f, text: fs.readFileSync(path.join(ROOT, f), 'utf8') }); }
    catch { /* 缺失在 evaluate 里降级为 UNKNOWN，不报 FAIL */ }
  }
  return entries;
}

function decide(result, strict) {
  if (result.unknown.length > 0) return 2;
  if (result.blocking.length > 0 || result.jsonErrors.length > 0) return 1;
  if (strict && result.advisory.length > 0) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const selfTest = args.includes('--self-test');
const strict = args.includes('--strict');
const asJson = args.includes('--json');

const meta = readMeta();
const coreEntries = loadEntries(CORE_FILES);
const advisoryFiles = collectFiles(ADVISORY_ROOTS).filter((f) => !CORE_FILES.includes(f));
const advisoryEntries = selfTest ? [] : loadEntries(advisoryFiles);
const result = evaluate(coreEntries, advisoryEntries, meta);

// ---- 反向验证：注入事故 → 期望拦截；恢复 → 期望放行；缺失 → 期望 UNKNOWN ----
if (selfTest) {
  const checks = [];
  const injected = coreEntries.map((e) => e.file === 'public/llms.txt'
    ? { ...e, text: `${e.text}\n> Files are deleted automatically within 1 hour. Pro planned after beta. Please remove DRM before converting. Powered by Calibre.\n` }
    : e);
  const rInject = evaluate(injected, [], meta);
  checks.push({
    name: '注入 4 类违规句到核心文件 ⇒ 门禁必须拦截',
    pass: decide(rInject, false) === 1 && rInject.blocking.length >= 4,
    evidence: `blocking=${rInject.blocking.length}, exit=${decide(rInject, false)}`,
  });
  const rClean = evaluate(coreEntries, [], meta);
  checks.push({
    name: '恢复真实修复后文本 ⇒ 门禁必须放行',
    pass: decide(rClean, false) === 0 && rClean.blocking.length === 0,
    evidence: `blocking=${rClean.blocking.length}, unknown=${rClean.unknown.length}, exit=${decide(rClean, false)}`,
  });
  const rMissing = evaluate(coreEntries.filter((e) => e.file !== 'messages/en.json'), [], meta);
  checks.push({
    name: '核心文件缺失 ⇒ 必须 UNKNOWN(2)，不得静默 PASS',
    pass: decide(rMissing, false) === 2 && rMissing.unknown.length >= 1,
    evidence: `unknown=${rMissing.unknown.length}, exit=${decide(rMissing, false)}`,
  });
  const rBadJson = evaluate(coreEntries.map((e) => e.file === 'messages/es.json'
    ? { ...e, text: '{ "broken": ' } : e), [], meta);
  checks.push({
    name: '注入非法 JSON ⇒ 必须拦截(1)',
    pass: rBadJson.jsonErrors.length >= 1 && decide(rBadJson, false) === 1,
    evidence: `jsonErrors=${rBadJson.jsonErrors.length}, exit=${decide(rBadJson, false)}`,
  });
  const rNegation = evaluate([{ file: 'src/lib/error-handler.ts', text: "we don't remove DRM and no converter can legally remove DRM" }].concat(coreEntries.filter((e) => e.file !== 'src/lib/error-handler.ts')), [], meta);
  checks.push({
    name: '否定式合规声明不得误报（只测精确短语）',
    pass: !rNegation.blocking.some((h) => h.ruleId === 'R03'),
    evidence: `R03命中=${rNegation.blocking.filter((h) => h.ruleId === 'R03').length}`,
  });
  const rAdv = evaluate(coreEntries, [{ file: 'src/data/blog/injected.ts', text: 'Pro planned after beta\n' }], meta);
  checks.push({
    name: '长尾 ADVISORY 命中 ⇒ 默认放行(0)、--strict 拦截(1)（分层不反）',
    pass: rAdv.advisory.length >= 1 && decide(rAdv, false) === 0 && decide(rAdv, true) === 1,
    evidence: `advisory=${rAdv.advisory.length}, default=${decide(rAdv, false)}, strict=${decide(rAdv, true)}`,
  });

  for (const c of checks) console.log(`${c.pass ? '✅' : '❌'} ${c.name}  [${c.evidence}]`);
  const allPass = checks.every((c) => c.pass);
  console.log(`\n反向验证：${checks.filter((c) => c.pass).length}/${checks.length} 通过 · ${allPass ? 'PASS' : 'FAIL'}`);
  process.exit(allPass ? 0 : 1);
}

// ---- 正常输出 ----
const byRule = {};
for (const h of result.advisory) byRule[h.ruleId] = (byRule[h.ruleId] || 0) + 1;
const advisoryFileSet = new Set(result.advisory.map((h) => h.file));
try {
  fs.mkdirSync(path.join(ROOT, '_wb_tmp'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, ADVISORY_OUT), JSON.stringify({
    generatedAt: new Date().toISOString(),
    coreFiles: CORE_FILES.length,
    advisoryFilesScanned: advisoryEntries.length,
    blocking: result.blocking,
    advisory: result.advisory,
    unknown: result.unknown,
    jsonErrors: result.jsonErrors,
  }, null, 2), 'utf8');
} catch { /* 报告文件写不出不影响判据，仅在输出里提示 */ }

const exit = decide(result, strict);
if (asJson) {
  console.log(JSON.stringify({
    exit,
    coreFiles: CORE_FILES.length,
    coreFilesRead: coreEntries.length,
    advisoryFilesScanned: advisoryEntries.length,
    blockingCount: result.blocking.length,
    advisoryCount: result.advisory.length,
    advisoryByRule: byRule,
    unknown: result.unknown,
    jsonErrors: result.jsonErrors,
    meta,
  }, null, 2));
  process.exit(exit);
}

console.log('=== BookConv 对外陈述合规门禁 · 2026-11-13 ===');
console.log(`模式：${strict ? 'STRICT（长尾也阻断）' : '默认（核心 BLOCKING / 长尾 ADVISORY，不假绿）'}`);
console.log(`核心文件：${coreEntries.length}/${CORE_FILES.length} 可读 ｜ 全站扫描：${advisoryEntries.length} 文件`);
console.log(`JSON 语法：${JSON_FILES.size - result.jsonErrors.length}/${JSON_FILES.size} 有效`);
console.log(`事实源：v2 ${meta.factsActive ? 'ACTIVE ✅' : 'UNKNOWN ⚠️'} ｜ ENTITY ${meta.entitySuperseded ? 'SUPERSEDED ✅' : 'UNKNOWN ⚠️'}`);

console.log('\n--- 核心层（BLOCKING，必须 0 命中）---');
if (result.blocking.length === 0) console.log('✅ 命中 0');
else {
  for (const h of result.blocking) console.log(`  ❌ [${h.ruleId}] ${h.file}:${h.line} | ${h.match} | ${h.context.slice(0, 140)}`);
}
if (result.jsonErrors.length) for (const e of result.jsonErrors) console.log(`  ❌ JSON 非法：${e}`);
if (result.unknown.length) for (const u of result.unknown) console.log(`  ⚠️  UNKNOWN：${u}`);

console.log('\n--- 全站长尾（ADVISORY，尚未修复，不代表通过）---');
if (result.advisory.length === 0) console.log('  无残留');
else {
  for (const rule of RULES) {
    const n = byRule[rule.id] || 0;
    if (n) console.log(`  ${rule.id} ${rule.label.padEnd(28)} ${String(n).padStart(4)} 处`);
  }
  console.log(`  合计 ${result.advisory.length} 处 / ${advisoryFileSet.size} 文件`);
  console.log(`  完整清单：${ADVISORY_OUT}`);
}

const verdict = exit === 0 ? 'PASS（仅核心层）' : exit === 1 ? 'FAIL' : 'UNKNOWN';
console.log(`\n裁定：${verdict}`);
console.log('\n--- 已知核心层缺口（显式声明，不得当作「已覆盖」）---');
for (const x of KNOWN_EXCLUSIONS) console.log(`  ⚠️  ${x.risk} ${x.file}\n       ${x.reason}`);
console.log('\n⚠️  PASS 只表示「已定义的 18 个核心载体」已修复，不代表全站一致：');
console.log(`    ADVISORY 是线索清单（需人工语义复核），当前 ${result.advisory.length} 处命中 / ${advisoryFileSet.size} 文件，均未修复。`);
console.log(`    运行级未决项 6 项见 ${FACTS_V2} §5。`);
console.log('    Pro 支付闭环、R2 lifecycle 控制台、50–100MB E2E、LIT 样本 E2E 均未经运行验证。');
process.exit(exit);
