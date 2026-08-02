// scripts/seo-critic.mjs
//
// 「纯纠错 / 纠察」层 #2 —— SEO / 链接 / i18n 静态审计。
//
// 设计原则（对齐纯纠错智能体范式）：
//   1. 角色固化：本脚本只"挑刺"，不修改任何文件、不产出内容。
//   2. 信息隔离：每个检查只读取自己关心的源（博客数据 / llms.txt / 消息文件），
//      互不串扰，避免一个检查的误判污染另一个。
//   3. 一票否决：任一 CRITICAL 级发现 → process.exit(1)，可作为 CI / 定时任务门禁。
//   4. 攻击清单（逐条审计，见 runChecks）：
//      a. 博文注册收敛：磁盘上的博文文件 vs index.ts 的 import + posts 数组。
//      b. llms.txt 同步：指南数 == 注册博文数；转换数 == CONVERSION_MAP 大小。
//      c. 内部死链：博客 / 落地页内容里的内部链接是否指向真实存在的路由 / slug。
//      d. EN/ES 消息键对齐：es.json 是否缺译。
//      e. hreflang / 规范 URL 误指向 /en（会 301 到 /，属历史事故）。
//
// 运行：node scripts/seo-critic.mjs   （零外部依赖，仅 node:fs/path）
// 退出码：0 = 无 CRITICAL；1 = 存在 CRITICAL（可用于门禁）

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'); // ebook-converter/
const BLOG_DIR = join(ROOT, 'src', 'data', 'blog');
const CONTENT_DIR = join(ROOT, 'src', 'data', 'content');
const MSG_DIR = join(ROOT, 'messages');
const PUBLIC_DIR = join(ROOT, 'public');

/** @type {Array<{id:string,severity:'critical'|'warn',message:string,where?:string}>} */
const findings = [];
const add = (severity, id, message, where) => findings.push({ severity, id, message, where });

// ── 工具 ──────────────────────────────────────────────────
function read(p) {
  try { return readFileSync(p, 'utf8'); } catch { return null; }
}
function listTs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.ts'));
}
function flattenKeys(obj, prefix = '') {
  const out = new Set();
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) flattenKeys(v, key).forEach((x) => out.add(x));
      else out.add(key);
    }
  }
  return out;
}

// ── 检查 a：博文注册收敛 ────────────────────────────────
function checkBlogRegistration() {
  const SKIP = new Set(['index', 'types', 'rss']);
  const diskFiles = listTs(BLOG_DIR).flatMap((f) => {
    const base = f.replace(/\.ts$/, '');
    if (SKIP.has(base)) return [];
    const src = read(join(BLOG_DIR, f)) || '';
    const m = src.match(/export\s+const\s+slug\s*=\s*["'`]([^"'`]+)["'`]/);
    return m ? [{ base, slug: m[1] }] : [{ base, slug: null }];
  });

  const indexSrc = read(join(BLOG_DIR, 'index.ts')) || '';
  // import * as postN from "./base"
  const importRe = /import\s+\*\s+as\s+(\w+)\s+from\s+["']\.\/([\w-]+)["']/g;
  const imports = new Map(); // base -> identifier
  let mm;
  while ((mm = importRe.exec(indexSrc))) imports.set(mm[2], mm[1]);

  // posts 数组里的标识符
  const postsBlock = indexSrc.match(/const\s+posts\s*:\s*BlogPostMeta\[\]\s*=\s*\[([\s\S]*?)\];/);
  const postsIds = new Set((postsBlock ? postsBlock[1].match(/\bpost\d+\b/g) || [] : []).map((s) => s));

  const diskBases = new Set(diskFiles.map((d) => d.base));
  const diskSlugs = new Map(diskFiles.map((d) => [d.base, d.slug]));

  // 1) 磁盘有文件但未在 index.ts import → 未注册
  for (const { base, slug } of diskFiles) {
    if (!imports.has(base)) {
      add('critical', 'blog-unregistered', `博文文件存在但未在 index.ts 注册：${base}.ts (slug=${slug || '?'})`, 'src/data/blog/index.ts');
    }
  }
  // 2) index.ts import 了但磁盘无文件 → 孤儿 import
  for (const base of imports.keys()) {
    if (!diskBases.has(base)) {
      add('critical', 'blog-orphan-import', `index.ts 导入了不存在的博文文件：./${base}`, 'src/data/blog/index.ts');
    }
  }
  // 3) 导入的标识符未进入 posts 数组
  for (const [base, ident] of imports) {
    if (!postsIds.has(ident)) {
      add('critical', 'blog-import-not-in-posts', `导入的 ${ident} (./${base}) 未加入 posts 数组`, 'src/data/blog/index.ts');
    }
  }
  // 4) slug 冲突
  const slugCount = new Map();
  for (const s of diskSlugs.values()) if (s) slugCount.set(s, (slugCount.get(s) || 0) + 1);
  for (const [slug, n] of slugCount) if (n > 1) add('critical', 'blog-slug-collision', `slug 重复出现 ${n} 次：${slug}`, 'src/data/blog/*.ts');

  return { registeredSlugs: new Set([...diskSlugs.values()].filter(Boolean)), diskCount: diskFiles.length };
}

// ── 检查 b：llms.txt 同步 ───────────────────────────────
function checkLlmsTxt(registeredSlugs, conversionMapSize) {
  const txt = read(join(PUBLIC_DIR, 'llms.txt'));
  if (!txt) { add('warn', 'llms-missing', 'public/llms.txt 不存在', 'public/llms.txt'); return; }

  // 取各 section
  const guidesMatch = txt.match(/## Guides([\s\S]*?)(?=\n## |$)/);
  const convMatch = txt.match(/## Conversions([\s\S]*?)(?=\n## |$)/);

  const blogLinks = (guidesMatch ? guidesMatch[1] : '').match(/\/blog\/([a-z0-9-]+)/g) || [];
  const blogSlugs = new Set(blogLinks.map((s) => s.replace('/blog/', '')));
  const convLinks = (convMatch ? convMatch[1] : '').match(/\/convert\/([a-z0-9-]+)/g) || [];

  if (blogSlugs.size !== registeredSlugs.size) {
    // 找出 llms.txt 有但注册没有 / 反之
    const missingInTxt = [...registeredSlugs].filter((s) => !blogSlugs.has(s));
    const extraInTxt = [...blogSlugs].filter((s) => !registeredSlugs.has(s));
    add('critical', 'llms-blog-out-of-sync',
      `llms.txt 指南数(${blogSlugs.size}) ≠ 注册博文数(${registeredSlugs.size})` +
      (missingInTxt.length ? `；llms.txt 缺：${missingInTxt.join(', ')}` : '') +
      (extraInTxt.length ? `；llms.txt 多余：${extraInTxt.join(', ')}` : ''),
      'public/llms.txt');
  }

  if (conversionMapSize > 0 && convLinks.length !== conversionMapSize) {
    add('warn', 'llms-conv-out-of-sync',
      `llms.txt 转换数(${convLinks.length}) ≠ CONVERSION_MAP(${conversionMapSize})`, 'public/llms.txt');
  }
}

// ── 检查 c：内部死链 ────────────────────────────────────
function checkInternalLinks(registeredSlugs, validConvertSlugs, supportedFormats) {
  const dirs = [BLOG_DIR, CONTENT_DIR].filter(existsSync);
  const files = dirs.flatMap((d) => listTs(d).map((f) => join(d, f)));
  const KNOWN = new Set(['/', '/blog', '/convert', '/formats', '/pricing', '/privacy', '/terms', '/api-docs', '/auth', '/sitemap.xml', '/llms.txt', '/robots.txt', '/rss.xml']);

  for (const fp of files) {
    const src = read(fp);
    if (!src) continue;
    const linkRe = /\[[^\]]*\]\(([^)\s]+)\)/g; // markdown 链接
    let m;
    while ((m = linkRe.exec(src))) {
      let url = m[1].trim();
      if (url.startsWith('https://www.bookconv.com')) url = url.replace('https://www.bookconv.com', '');
      if (url.startsWith('http://www.bookconv.com')) url = url.replace('http://www.bookconv.com', '');
      if (!url.startsWith('/')) continue; // 外链跳过
      const where = `${fp.replace(ROOT + '/', '')}:${lineOf(src, m.index)}`;

      if (KNOWN.has(url)) continue;
      if (url.startsWith('/blog/tag/')) continue; // 标签页动态

      let ok = false, reason = '';
      const blogM = url.match(/^\/blog\/([a-z0-9-]+)$/);
      if (blogM) {
        if (registeredSlugs.has(blogM[1])) ok = true;
        else reason = `博文 slug 未注册：${blogM[1]}`;
      } else if (url.startsWith('/convert/')) {
        const slug = url.slice('/convert/'.length);
        if (validConvertSlugs.has(slug)) ok = true;
        else reason = `转换 slug 不在 CONVERSION_MAP：${slug}`;
      } else if (url.startsWith('/formats/')) {
        const fmt = url.slice('/formats/'.length);
        if (supportedFormats.has(fmt)) ok = true;
        else reason = `格式不在 SUPPORTED_FORMATS：${fmt}`;
      } else {
        reason = `未知内部路径：${url}`;
      }
      if (!ok) add('critical', 'dead-internal-link', reason, where);
    }
  }
}
function lineOf(src, idx) {
  return src.slice(0, idx).split('\n').length;
}

// ── 检查 d：EN/ES 消息键对齐 ───────────────────────────
function checkI18nParity() {
  const en = read(join(MSG_DIR, 'en.json'));
  const es = read(join(MSG_DIR, 'es.json'));
  if (!en || !es) { add('warn', 'i18n-missing', 'en.json 或 es.json 缺失', 'messages/'); return; }
  let enObj, esObj;
  try { enObj = JSON.parse(en); esObj = JSON.parse(es); } catch (e) { add('warn', 'i18n-parse', `消息文件 JSON 解析失败：${e.message}`, 'messages/'); return; }
  const enKeys = flattenKeys(enObj);
  const esKeys = flattenKeys(esObj);
  const missing = [...enKeys].filter((k) => !esKeys.has(k));
  const extra = [...esKeys].filter((k) => !enKeys.has(k));
  if (missing.length) add('warn', 'i18n-es-missing', `es.json 缺译 ${missing.length} 个键（示例：${missing.slice(0, 8).join(', ')}）`, 'messages/es.json');
  if (extra.length) add('warn', 'i18n-es-extra', `es.json 多出 ${extra.length} 个键（示例：${extra.slice(0, 8).join(', ')}）`, 'messages/es.json');
}

// ── 检查 e：hreflang / 规范 URL 误指向 /en ──────────────
function checkEnRedirects() {
  const targets = [
    join(ROOT, 'next.config.ts'),
    join(ROOT, 'src', 'app', 'layout.tsx'),
    join(ROOT, 'src', 'app', '[locale]', 'layout.tsx'),
  ];
  for (const p of targets) {
    const src = read(p);
    if (!src) continue;
    if (/['"]\/en['"]/.test(src)) {
      add('critical', 'hreflang-points-to-en', '检测到字面量 "/en"，会 301 到 /（历史事故），应避免在 hreflang/alternates/canonical 指向 /en', p.replace(ROOT + '/', ''));
    }
  }
}

// ── 主流程 ──────────────────────────────────────────────
function getConversionMapSize() {
  const src = read(join(ROOT, 'src', 'lib', 'conversion-map.ts')) || '';
  const keys = [...src.matchAll(/"([a-z0-9]+-[a-z0-9]+)":/g)].map((m) => m[1]);
  return { size: keys.length, validConvertSlugs: new Set(keys.map((k) => k.replace('-', '-to-'))), supportedFormats: new Set(keys.flatMap((k) => k.split('-'))) };
}

function main() {
  const reg = checkBlogRegistration();
  const cm = getConversionMapSize();
  checkLlmsTxt(reg.registeredSlugs, cm.size);
  checkInternalLinks(reg.registeredSlugs, cm.validConvertSlugs, cm.supportedFormats);
  checkI18nParity();
  checkEnRedirects();

  const critical = findings.filter((f) => f.severity === 'critical');
  const warn = findings.filter((f) => f.severity === 'warn');

  console.log('\n=== SEO / 链接 / i18n 纠察报告 ===');
  if (findings.length === 0) {
    console.log('✓ 全部检查通过，无发现。');
  } else {
    for (const f of findings) {
      const tag = f.severity === 'critical' ? '🔴 CRITICAL' : '🟡 WARN';
      console.log(`${tag} [${f.id}] ${f.message}${f.where ? `  @ ${f.where}` : ''}`);
    }
  }
  console.log(`\n汇总：${critical.length} critical, ${warn.length} warn`);
  console.log(`注册博文 ${reg.registeredSlugs.size} 篇；CONVERSION_MAP ${cm.size} 条`);
  process.exit(critical.length > 0 ? 1 : 0);
}

main();
