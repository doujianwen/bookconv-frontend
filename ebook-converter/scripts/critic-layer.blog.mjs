// scripts/critic-layer.blog.mjs
//
// 「纯纠错智能体」在 bookconv 的实例（ESM 移植自通用模板
// ~/.workbuddy/skills/pure-correction-agent/critic-layer.template.js）。
//
// 与扫描项目的差异：bookconv 是 ESM + TS，博客数据是 src/data/blog/*.ts
// 结构化模板字符串文件，Node 无法直接 import。因此本实例「读 .ts 为文本 +
// 正则提取」构建候选（与项目既有 seo-critic.mjs 同源做法），再跑守卫插件。
//
// 范式（与通用模板一致）：
//   1. 角色固化：只读、只报，不修改任何博客文件。
//   2. 信息隔离：守卫只消费本脚本传入的原始候选 + 派生指标，不 require 生产方。
//   3. 一票否决：任一 BLOCK → exit(1)，由 publish-gate.mjs 卡住发布。
//   4. 自进化：新漏网 → 在 correction-guards.blog.mjs 加守卫。
//
// 运行：node scripts/critic-layer.blog.mjs
//   （测试可用 BLOG_DIR=/abs/path 覆盖博客目录）
// 退出码：0 = 无 BLOCK；1 = 存在 BLOCK（可被门禁拦截）

import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── 配置 ────────────────────────────────────────────────
const cfgPath = join(__dirname, 'correction.config.blog.json');
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
const BLOG_DIR = process.env.BLOG_DIR
  ? resolve(process.env.BLOG_DIR)
  : resolve(ROOT, cfg.blogDir || 'src/data/blog');
const REPORTS_DIR = resolve(ROOT, cfg.reportsDir || 'data');
const GUARD_PLUGIN = resolve(__dirname, cfg.guardPlugin || 'correction-guards.blog.mjs');

// ── 裁决收集 ────────────────────────────────────────────
const findings = [];

// 变更范围：仅 GATE_SLUGS 内的博文，其 BLOCK 才真正卡发布；
// 不在范围内的 BLOCK 降级为 WARN（仅报告），避免存量旧文阻断无关部署。
// 这样门禁卡的是「本次要发布的提案」，而非整个仓库 backlog（防"狼来了"）。
const gateSlugs = (process.env.GATE_SLUGS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
// 命中「本次发布范围」才真正 BLOCK；否则降级为 WARN（仅报告）。
// 范围为空 = 全量审计模式（无提案要门禁）→ 一律不阻断，避免存量旧文卡住无关部署。
const inScope = (slug) => gateSlugs.length > 0 && gateSlugs.includes(slug);

const BLOCK = (category, evidence, why) => {
  const slug = ctx.current ? ctx.current.slug : '(未知)';
  if (inScope(slug)) {
    findings.push({ severity: 'BLOCK', category, evidence, why });
  } else {
    findings.push({
      severity: 'WARN',
      category,
      evidence: `${evidence}（非本次发布变更，仅报告不阻断）`,
      why,
    });
  }
};
const WARN = (category, evidence, why) => findings.push({ severity: 'WARN', category, evidence, why });
const INFO = (category, evidence, why) => findings.push({ severity: 'INFO', category, evidence, why });
const ctx = { cfg, current: null, BLOCK, WARN, INFO };

// ── 工具 ────────────────────────────────────────────────
function read(p) { try { return readFileSync(p, 'utf8'); } catch { return null; } }

function grabTpl(src, name) {
  const m = src.match(new RegExp('export\\s+const\\s+' + name + '\\s*=\\s*`([\\s\\S]*?)`'));
  if (m) return m[1];
  const m2 = src.match(new RegExp('export\\s+const\\s+' + name + '\\s*=\\s*"([^"]*)"'));
  return m2 ? m2[1] : null;
}

function stripWords(md) {
  if (!md) return '';
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')            // images -> alt empty
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')          // links -> text
    .replace(/[`*_>#|\-]/g, ' ')                       // md punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(md) { return stripWords(md).split(/\s+/).filter((w) => w.length > 0).length; }

// ── 单篇解析 ────────────────────────────────────────────
function parsePost(src, file) {
  const slug = grabTpl(src, 'slug');
  const title = grabTpl(src, 'title');
  const author = grabTpl(src, 'author');

  const tagsM = src.match(/export const tags\s*=\s*\[([\s\S]*?)\]/);
  const tags = tagsM ? [...tagsM[1].matchAll(/"([^"]*)"/g)].map((m) => m[1]) : [];

  const introM = src.match(/intro:\s*`([\s\S]*?)`\s*,/);
  const intro = introM ? introM[1] : '';

  const sections = [];
  const secRe = /heading:\s*`([^`]*?)`,\s*body:\s*`([\s\S]*?)`\s*\}/g;
  let sm;
  while ((sm = secRe.exec(src))) sections.push({ heading: sm[1], body: sm[2] });

  // FAQ 计数：在 faqs 块内数 `question:` 出现次数（稳健，不受 answer 内含反引号/花括号干扰）
  const faqBlockM = src.match(/export const faqs\s*=\s*\[([\s\S]*?)\n\];/);
  const faqBlock = faqBlockM ? faqBlockM[1] : '';
  const faqCount = (faqBlock.match(/question:/g) || []).length;
  const faqs = [];
  const faqRe = /question:\s*`([^`]*?)`,\s*answer:\s*`([\s\S]*?)`\s*\}/g;
  let fm;
  while ((fm = faqRe.exec(faqBlock))) faqs.push({ question: fm[1], answer: fm[2] });

  // 派生指标
  const bodyText = intro + '\n' + sections.map((s) => s.body).join('\n');
  const wordCount = countWords(bodyText);
  const internalLinks = (bodyText.match(new RegExp('\\]\\((/(blog|guide|convert|formats)/)', 'g')) || []).length;
  const externalLinks = (bodyText.match(new RegExp('\\]\\(https?:\\/\\/', 'g')) || []).length;
  const hasKeyTakeaways = sections.some((s) => /key takeaways/i.test(s.heading));

  const slugTokens = (slug || '').split('-').filter((t) => t.length >= 3).map((t) => t.toLowerCase());
  const majorTokens = slugTokens.filter((t) => t.length >= 4);
  const titleLower = (title || '').toLowerCase();
  const titleHasSlugToken = majorTokens.some((t) => titleLower.includes(t));

  const introWords = stripWords(intro).toLowerCase().split(/\s+/).slice(0, 100).join(' ');
  const introHasTopic = majorTokens.some((t) => introWords.includes(t));

  const bodyLower = bodyText.toLowerCase();
  const deAiHits = (cfg.deAiWords || []).filter((w) => bodyLower.includes(w.toLowerCase()));

  // 主关键词密度（取最长 slug token 的出现率）
  let topKeywordDensity = 0;
  const words = stripWords(bodyText).toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  const total = words.length || 1;
  for (const t of slugTokens) {
    const n = words.filter((w) => w === t).length;
    const d = n / total;
    if (d > topKeywordDensity) topKeywordDensity = d;
  }

  return {
    slug, title, author, tags, intro, sections, faqs, file,
    wordCount, internalLinks, externalLinks, faqCount, hasKeyTakeaways,
    titleHasSlugToken, introHasTopic, deAiHits, topKeywordDensity,
  };
}

// ── 主流程 ──────────────────────────────────────────────
async function main() {
  if (!existsSync(BLOG_DIR)) { console.error('BLOG_DIR 不存在:', BLOG_DIR); process.exit(2); }

  const skip = new Set(cfg.skipFiles || ['index', 'types', 'rss']);
  const files = readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.ts') && !skip.has(f.replace(/\.ts$/, '')))
    .map((f) => join(BLOG_DIR, f));

  const candidates = [];
  for (const fp of files) {
    const src = read(fp);
    if (!src) continue;
    const base = fp.replace(/\\/g, '/').split('/').pop();
    const c = parsePost(src, base);
    if (!c.slug) {
      BLOCK('数据完整性/解析失败', `博客文件无法解析 slug：${base}`, '文件格式偏离约定（slug 应为模板字符串导出）。须修复。');
      continue;
    }
    // 必填字段
    for (const fld of (cfg.requiredFields || [])) {
      if (fld === 'content' && (!c.intro && c.sections.length === 0)) {
        BLOCK('数据完整性/缺字段', `博文 ${c.slug} 缺 content（intro+sections 为空）`, '无正文，无法发布。');
      }
    }
    candidates.push(c);
  }

  // 守卫插件（信息隔离：只传候选 + ctx；守卫内部会按候选设置 ctx.current）
  const mod = await import(pathToFileURL(GUARD_PLUGIN).href);
  try {
    mod.projectGuards(candidates, ctx);
  } catch (e) {
    WARN('守卫插件/运行异常', `projectGuards 抛错: ${e.message}`, '守卫运行失败，可能漏检。须修复插件。');
  }

  // 汇总
  const blocks = findings.filter((f) => f.severity === 'BLOCK');
  const warns = findings.filter((f) => f.severity === 'WARN');
  const infos = findings.filter((f) => f.severity === 'INFO');
  const verdict = blocks.length > 0 ? 'BLOCKED' : (warns.length > 0 ? 'PASS_WITH_WARNINGS' : 'PASS');

  const localDate = new Date();
  const date = localDate.getFullYear() + '-' + String(localDate.getMonth() + 1).padStart(2, '0') + '-' + String(localDate.getDate()).padStart(2, '0');
  const outPath = join(REPORTS_DIR, `critic_layer_${date}.json`);
  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true });
  const report = {
    verdict,
    generated_at: localDate.toISOString(),
    source: 'bookconv-blog-content',
    counts: { BLOCK: blocks.length, WARN: warns.length, INFO: infos.length },
    posts_audited: candidates.length,
    findings,
  };
  try {
    writeFileSync(outPath, JSON.stringify(report, null, 2));
  } catch (e) {
    console.error('写裁决文件失败:', e.message);
  }

  console.log(`\n=== bookconv 博客内容纠察报告 ===`);
  console.log(`审计 ${candidates.length} 篇；裁决：${verdict}`);
  if (findings.length === 0) console.log('✓ 全部内容检查通过。');
  else for (const f of findings) {
    const tag = f.severity === 'BLOCK' ? '🔴 BLOCK' : f.severity === 'WARN' ? '🟡 WARN' : '🔵 INFO';
    console.log(`${tag} [${f.category}] ${f.evidence}`);
  }
  console.log(`\n汇总：${blocks.length} BLOCK, ${warns.length} WARN, ${infos.length} INFO`);
  console.log(`裁决文件：${outPath.replace(ROOT + '/', '')}`);

  process.exit(blocks.length > 0 ? 1 : 0);
}

main();
