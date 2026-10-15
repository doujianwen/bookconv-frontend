/**
 * Meta Description 数据层门禁（SEO/GEO 标准可执行化）。
 *
 * 诞生背景（2026-10-15）：Bing URL 检查报「Meta Description 太长或太短」错误级。
 * 全站实测 162 页中 100 页超 160 字符、3 页 meta description 残留 markdown 字面量
 * （且 blog intro 被原样渲染在页面首段，线上可见星号垃圾）。根因：blog/guide/convert
 * 三处 generateMetadata 用整段首段当 description 且无截断。
 *
 * 两层防护（缺一不可）：
 *   渲染层（已上线）：src/lib/seo/meta-description.ts 的 clampMetaDescription()
 *     —— 句末截断 ≤158 + markdown strip，保证任何数据都不会输出不合规 description。
 *   数据层（本脚本）：约束作者写源头数据——
 *     E1 markdown 残留（bold 星号、反引号 code、[文本](链接)、# 标题、列表符）→ ERROR（源头必须干净）
 *     E2 >158 字符 → WARN（渲染层会自动截断，但作者应收口手写；--strict 下 ERROR）
 *     E3 非空但 <25 字符 → ERROR（Bing「过短」标记；0 存量）
 *
 * 存量纪律：E2 存量 100 页只 WARN 不 BLOCK（自动截断已兜底），避免门禁变成噪声；
 * E1/E3 存量清零后才启用 ERROR（2026-10-15 已清零）。
 *
 * 扫描对象（description 的数据来源）：
 *   src/data/content/*.ts  -> metaDescription（含 es.metaDescription）
 *   src/data/blog/*.ts     -> content.intro（含 es.content.intro）
 *   src/data/guides/*.ts   -> problem / content.intro（含 es 变体）
 *
 * 用法：
 *   node scripts/audit-meta-descriptions.mjs            # 扫描（E1/E3=ERROR, E2=WARN）
 *   node scripts/audit-meta-descriptions.mjs --strict   # E2 也升级为 ERROR（新内容 CI）
 *   node scripts/audit-meta-descriptions.mjs --self-test  # 反向验证：注入事故样本必须被抓到
 *
 * 退出码：0 = 无 ERROR；1 = 有 ERROR；2 = 不可判定（扫描目录缺失/解析失败，绝不静默放行）。
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ROOT = process.cwd();
const STRICT = process.argv.includes('--strict');
const SELF_TEST = process.argv.includes('--self-test');

const MAX_LEN = 158;   // Bing 硬限 160 留 2 字符余量；Google 桌面 ~155-160
const MIN_LEN = 25;    // Bing「过短」标记下限

// description 的数据来源属性名（不扫正文 body——正文的 markdown 是合法的）
const TARGET_PROPS = new Set(['metaDescription', 'intro', 'problem']);

const SKIP_FILES = new Set(['index.ts', 'types.ts', 'rss.ts', 'shared.ts']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.ts') && !SKIP_FILES.has(e.name)) out.push(p);
  }
  return out;
}

function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }

/** 提取所有 description 来源字符串：{file, line, path, value} */
function extract(file) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);
  const records = [];

  function literalText(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    return null;
  }

  function visit(node, ancestors) {
    if (ts.isPropertyAssignment(node) && TARGET_PROPS.has(node.name.getText(sf))) {
      const v = literalText(node.initializer);
      if (v !== null) {
        const via = ancestors.length ? ancestors.join('.') + '.' + node.name.getText(sf) : node.name.getText(sf);
        records.push({ file, line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, path: via, value: v });
      }
    }
    if (ts.isVariableDeclaration(node) && TARGET_PROPS.has(node.name.getText(sf))) {
      const v = node.initializer ? literalText(node.initializer) : null;
      if (v !== null) {
        records.push({ file, line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, path: node.name.getText(sf), value: v });
      }
    }
    const childAncestors = ts.isPropertyAssignment(node)
      ? [...ancestors, node.name.getText(sf)]
      : ancestors;
    ts.forEachChild(node, (child) => visit(child, childAncestors));
  }
  visit(sf, []);
  return records;
}

const MD_PATTERNS = [
  [/\*\*[^*]+\*\*/, 'bold **..**'],
  [/`[^`]+`/, 'code `..`'],
  [/!?\[[^\]]*\]\([^)]*\)/, 'link [..](..)'],
  [/^\s*#{1,6}\s+\S/, 'heading #'],
  [/^\s*[-*+]\s+\S/, 'list bullet'],
];

function checkRecords(records, strict) {
  let errors = 0, warns = 0;
  for (const r of records) {
    const text = r.value.replace(/\s+/g, ' ').trim();
    const where = `${rel(r.file)}:${r.line} [${r.path}]`;
    for (const [re, name] of MD_PATTERNS) {
      if (re.test(r.value)) {
        console.log(`  ❌ E1 markdown 残留 (${name}) | ${where} | ${text.slice(0, 70)}`);
        errors++;
      }
    }
    if (text.length > MAX_LEN) {
      const msg = `E2 超长 ${text.length}>${MAX_LEN}（渲染层自动截断，建议手写收口）`;
      if (strict) { console.log(`  ❌ ${msg} | ${where}`); errors++; }
      else { console.log(`  ⚠️  ${msg} | ${where}`); warns++; }
    }
    if (text.length > 0 && text.length < MIN_LEN) {
      console.log(`  ❌ E3 过短 ${text.length}<${MIN_LEN} | ${where} | ${text}`);
      errors++;
    }
  }
  return { errors, warns };
}

/** --self-test：在临时目录注入全部事故类型，必须全部抓到（反向验证） */
function selfTest() {
  const dir = path.join(ROOT, '_wb_tmp', 'meta-desc-selftest');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'src/data/blog'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'src/data/guides'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'src/data/content'), { recursive: true });

  const longText = 'A'.repeat(200);
  fs.writeFileSync(path.join(dir, 'src/data/blog/bad.ts'), `
export const post = {
  title: 'Bad',
  content: {
    intro: 'This intro has **bold markdown** leaking into the meta description for everyone to see in search results.',
    sections: [],
  },
  es: { content: { intro: '${longText}' } },
};
`);
  fs.writeFileSync(path.join(dir, 'src/data/blog/good.ts'), `
export const post = {
  title: 'Good',
  content: { intro: 'A perfectly sized meta description between twenty-five and one hundred fifty-eight characters for testing.', sections: [] },
};
`);
  fs.writeFileSync(path.join(dir, 'src/data/guides/bad.ts'), `
export const guide = { problem: 'Too short', content: { intro: 'ok intro that is long enough to pass the minimum length rule for guides here.' } };
`);
  fs.writeFileSync(path.join(dir, 'src/data/content/bad.ts'), `
export const metaDescription = 'See [our guide](/blog/x) and \`code\` here';
`);

  const files = [
    ...walk(path.join(dir, 'src/data/blog')),
    ...walk(path.join(dir, 'src/data/guides')),
    ...walk(path.join(dir, 'src/data/content')),
  ];
  let records = [];
  for (const f of files) records = records.concat(extract(f));
  // self-test 强制 strict：E2 也必须报 ERROR，三类判据全部验证
  const { errors, warns } = checkRecords(records, true);

  // 期望：blog/bad.ts = E1(1) + E2(1) = 2；guides/bad.ts = E3(1)；content/bad.ts = E1(2)
  // good.ts = 0。合计 errors = 5。
  fs.rmSync(dir, { recursive: true, force: true });
  if (errors === 5) {
    console.log('✅ self-test PASS：5 类注入事故全部被抓到（E1×3, E2×1, E3×1），干净文件 0 误报');
    return 0;
  }
  console.log(`❌ self-test FAIL：期望抓到 5 个违规，实际 ${errors}——判据失效，门禁不可信`);
  return 1;
}

if (SELF_TEST) process.exit(selfTest());

const dirs = ['src/data/content', 'src/data/blog', 'src/data/guides'];
const missing = dirs.filter((d) => !fs.existsSync(path.join(ROOT, d)));
if (missing.length) {
  console.error(`❌ 不可判定：扫描目录不存在（${missing.join(', ')}）——绝不静默当成「无违规」`);
  process.exit(2);
}

console.log('════════ Meta Description 数据层门禁 ════════');
console.log(`标准：${MIN_LEN}-${MAX_LEN} 字符（Bing 25-160 / Google ~155-160，2026-10-15 查实）`);
console.log(`模式：${STRICT ? 'STRICT（E2 超长=ERROR）' : '默认（E2 超长=WARN，渲染层自动截断兜底）'}\n`);

let allErrors = 0, allWarns = 0, total = 0;
for (const d of dirs) {
  const files = walk(path.join(ROOT, d));
  let records = [];
  for (const f of files) records = records.concat(extract(f));
  total += records.length;
  console.log(`── ${d}（${records.length} 个 description 来源）──`);
  const { errors, warns } = checkRecords(records, STRICT);
  allErrors += errors;
  allWarns += warns;
}

console.log(`\n合计：${total} 个 description 来源 | ERROR=${allErrors} | WARN=${allWarns}`);
if (allErrors > 0) {
  console.log('❌ FAIL：存在 ERROR 级违规，修复源头数据后再发布');
  process.exit(1);
}
console.log('✅ PASS：无 ERROR 级违规');
process.exit(0);
