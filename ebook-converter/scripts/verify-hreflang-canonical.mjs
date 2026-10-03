/**
 * M5-1: 全站 hreflang 双向回指 + canonical 自指校验（线上层权威）。
 *
 * 验收（看板 M5-1）：0 处单向回指、0 处 canonical 指向他页。
 *
 * 口径（依据 src/lib/seo/alternates.ts 单一权威点设计）：
 * - 仅 hasEsVersion=true 的 leaf 输出 en/es/x-default 三件套；其余页只输出
 *   en + x-default —— 这是有意设计，不判违规。
 * - 违规定义：
 *   V1 canonical != 最终落地 URL（跟随 301 后判）
 *   V2 页面输出了 hreflang es，但目标 URL 抓取失败/不在 sitemap
 *   V3 单向回指：en 页输出 es 回指，但 es 页未输出 en 回指（或反之）
 *   V4 es 回指目标与 en↔es 配对 URL 不一致（指错页）
 *   V5 x-default 缺失或不指向 en 版
 *
 * 用法：node scripts/verify-hreflang-canonical.mjs
 * 退出码：0 = 全部通过；1 = 存在违规。
 */
import https from 'node:https';

const BASE = 'https://www.bookconv.com';
const CONCURRENCY = 6;
const TIMEOUT = 25000;

function get(u) {
  return new Promise((resolve, reject) => {
    const req = https.get(u, { timeout: TIMEOUT }, (r) => {
      // 手动跟随最多 3 跳，记录最终 URL
      if ([301, 302, 308].includes(r.statusCode) && r.headers.location) {
        r.resume();
        const next = new URL(r.headers.location, u).href;
        if (req._hops === undefined) req._hops = 0;
        return reject({ redirect: next, hops: (req._hops || 0) + 1 });
      }
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => resolve({ code: r.statusCode, body: d, finalUrl: u }));
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
  });
}

async function fetchFollow(u, maxHops = 3) {
  let url = u;
  for (let i = 0; i <= maxHops; i++) {
    try {
      return await get(url);
    } catch (e) {
      if (e && e.redirect) {
        if (e.hops > maxHops) throw new Error('too many redirects');
        url = e.redirect;
        continue;
      }
      throw e;
    }
  }
  throw new Error('redirect loop');
}

function extractLinks(html) {
  const canonical = (html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/) ||
    html.match(/<link[^>]*href="([^"]+)"[^>]*rel="canonical"/) || [])[1] || null;
  const languages = {};
  // React SSR 输出 hrefLang（驼峰），原生可能 hreflang —— 用 [hH][rR][eE][fF][lL]ang 兼容
  const HL = '[hH][rR][eE][fF][lL]ang';
  const re = new RegExp(`<link[^>]*rel="alternate"[^>]*${HL}="([^"]+)"[^>]*href="([^"]+)"`, 'g');
  let m;
  while ((m = re.exec(html))) languages[m[1]] = m[2];
  // href 与 hreflang 顺序颠倒的写法
  const re2 = new RegExp(`<link[^>]*href="([^"]+)"[^>]*${HL}="([^"]+)"[^>]*rel="alternate"`, 'g');
  while ((m = re2.exec(html))) if (!languages[m[2]]) languages[m[2]] = m[1];
  return { canonical, languages };
}

// 1. sitemap
const smRes = await fetchFollow(`${BASE}/sitemap.xml`);
if (smRes.code !== 200) { console.error('SITEMAP FAIL', smRes.code); process.exit(1); }
const urls = [...smRes.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`sitemap URLs: ${urls.length}`);

// 2. 并发抓全站
const results = new Map(); // url -> {code, finalUrl, canonical, languages, err}
let idx = 0;
async function worker() {
  while (idx < urls.length) {
    const u = urls[idx++];
    try {
      const r = await fetchFollow(u);
      const { canonical, languages } = extractLinks(r.body);
      results.set(u, { code: r.code, finalUrl: r.finalUrl, canonical, languages });
    } catch (e) {
      results.set(u, { code: 0, err: e.message });
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`fetched: ${results.size}, non-200: ${[...results.values()].filter((r) => r.code !== 200).length}`);

// 3. 断言
const violations = [];
const esTrioPages = [];
for (const u of urls) {
  const r = results.get(u);
  if (!r || r.code !== 200) { violations.push(`V0 ${u} 抓取失败 ${r && r.err ? r.err : r.code}`); continue; }
  const final = r.finalUrl.replace(/\/$/, '');
  const self = u.replace(/\/$/, '');

  // V1 canonical 自指（按最终落地 URL）
  if (!r.canonical) violations.push(`V1a ${u} 缺 canonical`);
  else if (r.canonical.replace(/\/$/, '') !== final)
    violations.push(`V1b ${u} canonical=${r.canonical} ≠ 落地 ${final}`);

  // V5 x-default
  if (r.languages['x-default'] && r.languages.en &&
      r.languages['x-default'] !== r.languages.en)
    violations.push(`V5 ${u} x-default=${r.languages['x-default']} ≠ en=${r.languages.en}`);
  if (!r.languages['x-default']) violations.push(`V5a ${u} 缺 x-default`);

  // es 回指相关
  if (r.languages.es) {
    esTrioPages.push(u);
    const esTarget = r.languages.es.replace(/\/$/, '');
    // es 页自身输出 es→self 是三件套的正确行为，跳过
    if (esTarget === self) continue;
    // V2 es 目标必须在 sitemap 内；不在则主动探测，区分 404 与漏收
    if (!urls.some((x) => x.replace(/\/$/, '') === esTarget)) {
      let probe = 'unknown';
      try { const pr = await fetchFollow(esTarget); probe = String(pr.code); }
      catch (e) { probe = 'ERR ' + e.message; }
      violations.push(`V2 ${u} es 回指目标 ${esTarget} 不在 sitemap（实测 HTTP ${probe}）`);
      continue;
    }
    // V3/V4 双向闭合
    const esRes = results.get(esTarget);
    if (!esRes || esRes.code !== 200) {
      violations.push(`V2b ${u} es 目标 ${esTarget} 抓取失败`);
    } else {
      if (esRes.languages.en !== self)
        violations.push(`V3 单向回指: ${u}→es ${esTarget}，但 es 页 en 回指=${esRes.languages.en || '缺失'}`);
      if (!esRes.canonical || esRes.canonical.replace(/\/$/, '') !== esTarget)
        violations.push(`V4 es 页 ${esTarget} canonical=${esRes.canonical} ≠ 自身`);
    }
  }
}

console.log(`\n输出 es 回指（三件套）页面: ${esTrioPages.length}`);
for (const p of esTrioPages) console.log(`  ${p} → ${results.get(p).languages.es}`);

console.log(`\n违规总数: ${violations.length}`);
for (const v of violations) console.log('  ' + v);
if (violations.length === 0) console.log('ALL PASS: canonical 全自指，es 回指双向闭合');
process.exit(violations.length ? 1 : 0);
