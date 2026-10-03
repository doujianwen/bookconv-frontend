// scripts/protect-top-asset.mjs
// M2-5 头号资产保护 —— /guide/best-ebook-converter 自动化断言（作战台唯一
// 无品牌场景 AI 引用来源，GEO 核心资产）。
//
// 验收（docs/SEO-GEO-V2.0-执行拆解表 M2-5）：
//   存在自动化断言：该页在 sitemap 内、robots 未屏蔽、noindex 未设。
//
// 两层检查：
//   A. 静态层（离线）：guide 数据文件存在；middleware 无针对该 slug 的重定向。
//   B. 线上层（实测，权威）：HTTP 200 且 final URL 未被 301/302 改写；
//      meta robots 无 noindex；sitemap.xml 含该 URL；robots.txt 无匹配 Disallow。
//
// 用法：node scripts/protect-top-asset.mjs [--offline]
//   --offline  只跑静态层（无网环境 / CI 冒烟）
// 退出码：0 = 全 PASS；1 = 存在 FAIL。任何 FAIL 都意味着头号资产保护被破坏。
import { readFileSync, existsSync } from 'node:fs';

const SLUG = 'best-ebook-converter';
const PAGE_PATH = `/guide/${SLUG}`;
const BASE = (process.env.BOOKCONV_BASE_URL || 'https://www.bookconv.com').replace(/\/$/, '');
const OFFLINE = process.argv.includes('--offline');

const results = [];
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

// ── A. 静态层 ──────────────────────────────────────────────────────────────
function staticChecks() {
  console.log(`\n静态层（离线）`);

  const dataFile = `src/data/guides/${SLUG}.ts`;
  record('guide 数据文件存在', existsSync(dataFile), dataFile);

  // middleware 源码：该 slug 不得出现在任何「重定向/映射到其他 slug」的结构里。
  // 已知合法出现位置：/es/guide ESP_GUIDE_SLUGS 白名单（允许渲染，非重定向）。
  const mw = readFileSync('src/middleware.ts', 'utf8');
  const redirectish = mw.match(
    new RegExp(`['"\`]${SLUG}['"\`]\\s*:`)
  );
  record('middleware 无 slug 重定向映射', !redirectish,
    redirectish ? '发现 slug 作为映射 key（疑似重定向表），需人工复核' : '仅 /es/guide 白名单引用（合法）');

  // 页面代码层：guide 页路由不得注入 noindex。
  const pageFile = 'src/app/[locale]/guide/[slug]/page.tsx';
  if (existsSync(pageFile)) {
    const page = readFileSync(pageFile, 'utf8');
    record('guide 页代码无硬编码 noindex', !/noindex/i.test(page),
      /noindex/i.test(page) ? 'page.tsx 中出现 noindex 字样，需人工复核' : '');
  } else {
    record('guide 页路由文件存在', false, `${pageFile} 未找到（路由结构可能已变更，脚本需更新）`);
  }
}

// ── B. 线上层 ──────────────────────────────────────────────────────────────
async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
  const text = await res.text();
  return { res, text };
}

function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

async function liveChecks() {
  console.log(`\n线上层（实测 ${BASE}）`);

  // 1. 页面 200 + 未被重定向改写 + 无 noindex + H1 可见
  try {
    const { res, text } = await fetchText(`${BASE}${PAGE_PATH}`);
    record('页面 HTTP 200', res.status === 200, `status=${res.status}`);
    const finalPath = new URL(res.url).pathname;
    record('URL 未被重定向改写', finalPath === PAGE_PATH,
      finalPath === PAGE_PATH ? '' : `final URL = ${finalPath}`);

    const body = stripScripts(text);
    const robots = body.match(/<meta\s+name=["']robots["'][^>]*>/i)?.[0] || '';
    record('meta robots 无 noindex', !/noindex/i.test(robots),
      robots ? robots.slice(0, 120) : '（无 robots meta = 默认 index,follow）');
    const h1 = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
    record('H1 存在（非空壳渲染）', Boolean(h1 && h1.replace(/<[^>]+>/g, '').trim()),
      h1 ? 'H1=' + h1.replace(/<[^>]+>/g, '').trim().slice(0, 80) : '未找到 H1');
  } catch (e) {
    record('页面可访问', false, String(e).slice(0, 120));
  }

  // 2. sitemap 含该 URL
  try {
    const { res, text } = await fetchText(`${BASE}/sitemap.xml`);
    const inSitemap = res.status === 200 && text.includes(`${BASE}${PAGE_PATH}`);
    record('sitemap.xml 含该页', inSitemap,
      inSitemap ? '' : `HTTP ${res.status} 或 URL 缺失（= 未注册/未派生）`);
    const esIn = text.includes(`${BASE}/es${PAGE_PATH}`);
    console.log(`  INFO  /es 版本在 sitemap：${esIn ? '是' : '否'}（参考项，不计分）`);
  } catch (e) {
    record('sitemap.xml 可访问', false, String(e).slice(0, 120));
  }

  // 3. robots.txt 无匹配 Disallow
  try {
    const { res, text } = await fetchText(`${BASE}/robots.txt`);
    const rules = res.status === 200
      ? text.split('\n').filter((l) => /disallow/i.test(l))
      : [];
    // 精确到前缀匹配：Disallow 值是 PAGE_PATH 的前缀（或 /）才算屏蔽
    const blocked = rules.filter((l) => {
      const v = l.split(':')[1]?.trim();
      if (!v) return false;
      if (v === '/') return true;
      return PAGE_PATH.startsWith(v);
    });
    record('robots.txt 未屏蔽该页', res.status === 200 && blocked.length === 0,
      blocked.length ? blocked.join(' | ').slice(0, 120) : '');
  } catch (e) {
    record('robots.txt 可访问', false, String(e).slice(0, 120));
  }
}

// ── 汇总 ───────────────────────────────────────────────────────────────────
staticChecks();
if (!OFFLINE) await liveChecks();

const fails = results.filter((r) => !r.ok).length;
console.log(`\n${fails === 0 ? '✅' : '❌'} 头号资产保护断言：${results.length - fails}/${results.length} 项达标${fails ? `，FAIL ${fails}` : ''}`);
process.exit(fails === 0 ? 0 : 1);
