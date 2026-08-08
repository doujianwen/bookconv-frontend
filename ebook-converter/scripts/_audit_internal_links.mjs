import fs from 'fs';
import path from 'path';

const ROOT = 'E:/一人公司/电子书格式转换站/ebook-converter';
const blogDir = path.join(ROOT, 'src/data/blog');
const guideDir = path.join(ROOT, 'src/data/guides');
const contentDir = path.join(ROOT, 'src/data/content');

function listSlugs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'types.ts')
    .map(f => f.replace(/\.ts$/, ''));
}
const blogSlugs = new Set(listSlugs(blogDir));
const guideSlugs = new Set(listSlugs(guideDir));
const convertSlugs = new Set(listSlugs(contentDir));

const staticRoutes = new Set(['', '/', '/blog', '/guide', '/convert', '/batch', '/pricing', '/formats', '/tutorial', '/privacy', '/terms']);

function slugifyTag(tag) {
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function extractTags(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const m = txt.match(/tags:\s*\[([^\]]*)\]/);
  if (!m) return [];
  return m[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
}
const hubTags = new Set();
for (const s of blogSlugs) {
  for (const t of extractTags(path.join(blogDir, s + '.ts'))) hubTags.add(slugifyTag(t));
}

const linkRe = /\[([^\]]*)\]\((\/[^)\s]+)\)/g;
const edges = [];
function extractLinks(file, fromSlug, type) {
  const txt = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = linkRe.exec(txt))) {
    edges.push({ from: `${type}:${fromSlug}`, anchor: m[1].trim(), target: m[2].trim() });
  }
}
for (const s of blogSlugs) extractLinks(path.join(blogDir, s + '.ts'), s, 'blog');
for (const s of guideSlugs) extractLinks(path.join(guideDir, s + '.ts'), s, 'guide');

function classify(target) {
  let t = target.split('#')[0].split('?')[0];
  if (t.endsWith('/')) t = t.slice(0, -1);
  let parts = t.split('/').filter(Boolean);
  if (parts[0] === 'es') parts = parts.slice(1);
  if (parts.length === 0) return { ok: true, type: 'home' };
  const seg = parts[0];
  if (seg === 'blog') {
    if (parts.length === 1) return { ok: true, type: 'blog-index' };
    if (parts[1] === 'tag') return { ok: hubTags.has(parts[2] || ''), type: 'blog-tag', broken: !hubTags.has(parts[2] || '') };
    return { ok: blogSlugs.has(parts[1]), type: 'blog-post', broken: !blogSlugs.has(parts[1]) };
  }
  if (seg === 'guide') {
    if (parts.length === 1) return { ok: true, type: 'guide-index' };
    return { ok: guideSlugs.has(parts[1]), type: 'guide', broken: !guideSlugs.has(parts[1]) };
  }
  if (seg === 'convert') {
    if (parts.length === 1) return { ok: true, type: 'convert-index' };
    return { ok: convertSlugs.has(parts[1]), type: 'convert', broken: !convertSlugs.has(parts[1]) };
  }
  return { ok: staticRoutes.has(t) || staticRoutes.has('/' + seg), type: 'static', broken: !(staticRoutes.has(t) || staticRoutes.has('/' + seg)) };
}

// Analyze
let broken = [];
const inboundEditorial = new Map();
const anchorQuality = { generic: 0, descriptive: 0 };
const GENERIC = /^(click here|here|read more|this|link|more|this article|learn more|see more)$/i;
for (const e of edges) {
  const c = classify(e.target);
  if (c.broken) broken.push(e);
  const key = e.target.replace(/^https?:\/\/[^/]+/, '').split('#')[0].split('?')[0].replace(/\/$/, '');
  inboundEditorial.set(key, (inboundEditorial.get(key) || 0) + 1);
  if (GENERIC.test(e.anchor)) anchorQuality.generic++; else anchorQuality.descriptive++;
}

console.log('=== 有效页面数 ===');
console.log('blog:', blogSlugs.size, '| guide:', guideSlugs.size, '| convert:', convertSlugs.size);
console.log('hub tags:', [...hubTags].join(', '));
console.log('\n=== 编辑型内链统计 ===');
console.log('总编辑内链:', edges.length);
console.log('锚文本: 描述性', anchorQuality.descriptive, '| 通用(劣质)', anchorQuality.generic);
console.log('\n=== 断链 (指向不存在的页面) ===');
if (broken.length === 0) console.log('无');
else for (const b of broken) console.log(`  ${b.from}  ->  [${b.anchor}](${b.target})`);

// editorial inbound per subsystem
function inboundFor(set, prefix) {
  let total = 0; const zero = [];
  for (const s of set) {
    const n = inboundEditorial.get(`/${prefix}/${s}`) || 0;
    total += n;
    if (n === 0) zero.push(s);
  }
  return { total, zero };
}
const bi = inboundFor(blogSlugs, 'blog');
const gi = inboundFor(guideSlugs, 'guide');
const ci = inboundFor(convertSlugs, 'convert');
console.log('\n=== 编辑型入链 (仅正文 markdown 链接, 不含组件自动链接) ===');
console.log(`blog: 总${bi.total}, 零入链${bi.zero.length} -> ${bi.zero.join(', ')}`);
console.log(`guide: 总${gi.total}, 零入链${gi.zero.length} -> ${gi.zero.join(', ')}`);
console.log(`convert: 总${ci.total}, 零入链${ci.zero.length} -> ${ci.zero.join(', ')}`);

// cross-subsystem editorial links
const cross = { blogToGuide: 0, guideToBlog: 0, blogToConvert: 0, convertToBlog: 0, guideToConvert: 0, convertToGuide: 0 };
for (const e of edges) {
  const [ft] = e.from.split(':');
  const c = classify(e.target);
  const tt = c.type.includes('guide') ? 'guide' : c.type.includes('blog') ? 'blog' : c.type.includes('convert') ? 'convert' : 'other';
  if (ft === 'blog' && tt === 'guide') cross.blogToGuide++;
  if (ft === 'guide' && tt === 'blog') cross.guideToBlog++;
  if (ft === 'blog' && tt === 'convert') cross.blogToConvert++;
  if (ft === 'guide' && tt === 'convert') cross.guideToConvert++;
}
console.log('\n=== 跨子系统编辑型链接 ===');
console.log(JSON.stringify(cross, null, 0));
