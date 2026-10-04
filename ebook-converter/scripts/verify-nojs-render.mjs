#!/usr/bin/env node
/**
 * M3-5 抓取与渲染可解析性审计
 *
 * 目的：校验关键页在【禁用 JS】时仍输出 H1 与正文要点，
 * 防止纯客户端渲染导致 AI 爬虫（GPTBot / PerplexityBot / ClaudeBot 等）
 * 抓到空壳页面 —— 空壳 = 被判为低质量 = 不进 AI 答案。
 *
 * 两种口径必须分开测（这是本脚本存在的关键理由）：
 *   口径A「HTML 源码全量」= 文本抽取型爬虫 / 抓取原始 HTML 的 AI 爬虫看到的
 *   口径B「hidden 容器外」= 不执行 JS 的真实浏览器渲染出的可见内容
 * 两者差异大⇒ 内容依赖 React streaming Suspense（<div hidden>）投递，
 * 原始 HTML 有内容（AI 爬虫 OK）但 no-JS 浏览器只看到 loading 占位符（UX 脆弱）。
 *
 * 用法：
 *   node scripts/verify-nojs-render.mjs                    # 线上抓取（默认）
 *   node scripts/verify-nojs-render.mjs --file <htmlPath>  # 读本地快照（无网时）
 *   node scripts/verify-nojs-render.mjs --html <url>       # 任意 URL
 *
 * 硬判据（口径A，任一 FAIL 即整体 FAIL，退出码 1）：
 *   1. HTTP 200
 *   2. 剥<script> 后仍存在非空 <h1>
 *   3. H1 文本长度 >= 10 字符
 *   4. 剥 <script> 后 <p> 段落数 >= 3
 *   5. 正文纯文本 >= 500 字符（AI 引用的最低体量）
 *   6. <title> 非空且 >= 10 字符
 *
 * 软判据（口径B，只报告不FAIL）：可见占比 = 可见纯文本 / 全量纯文本。
 *   >= 60% 健康 · 20–60% 部分客户端渲染 · < 20% 几乎全靠 JS
 *
 * 证据：数据分析/M3-5-抓取与渲染可解析性-2026-10-04.md
 */

import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://www.bookconv.com';

/**
 * 覆盖站点全部主要渲染路径：4 类页面模板 + 首页 + 其他路由。
 * URL 全部取自 src/app/sitemap.ts（实测：/compare 与 /compat/calibre 均 404，
 * 写 URL 前必须对 sitemap，否则会把「我写错路径」误判成「页面缺陷」）。
 */
const TARGETS = [
  { key: 'home', url: '/' },
  { key: 'convert', url: '/convert/epub-to-pdf' },
  { key: 'guide', url: '/guide/calibre-alternatives-online' },
  { key: 'blog', url: '/blog/can-kobo-read-epub-files' },
  { key: 'formats-index', url: '/formats' },
  { key: 'formats-detail', url: '/formats/epub' },
  { key: 'compare', url: '/compare/bookconv-vs-calibre' },
  { key: 'compat', url: '/compat/epub-to-mobi-on-kindle-paperwhite' },
  { key: 'help', url: '/help' },
  { key: 'tutorial', url: '/tutorial' },
];

const MIN_H1_LEN = 10;
const MIN_PARAGRAPHS = 3;
const MIN_TEXT_LEN = 500;
const MIN_TITLE_LEN = 10;

/** 剥掉 script / style / noscript / template —— 模拟不执行 JS 的纯文本流 */
function stripToTextStream(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<template[\s\S]*?<\/template>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ');
}

/**
 * 深度追踪定位 <div hidden …>…</div> 的完整区间。
 * 不能用非贪婪正则 —— React 输出的 hidden 容器内含嵌套 div，
 * 非贪婪会在第一个 </div> 处提前截断（实测导致 convert 页H1 被误判为"消失"）。
 */
function hiddenRanges(html) {
  const ranges = [];
  const tagRe = /<(\/?)div([^>]*)>/gi;
  let m;
  let depth = 0;
  let start = -1;
  while ((m = tagRe.exec(html)) !== null) {
    if (m[1] === '/') {
      if (depth > 0) {
        depth--;
        if (depth === 0) ranges.push([start, m.index + m[0].length]);
      }
    } else if (/\bhidden\b/.test(m[2] || '')) {
      if (depth === 0) start = m.index;
      depth++;
    } else if (depth > 0) {
      depth++;
    }
  }
  return ranges;
}

/** 移除 hidden 容器内的内容 */
function stripHiddenContainers(html) {
  const ranges = hiddenRanges(html);
  if (ranges.length === 0) return html;
  const mask = new Uint8Array(html.length);
  for (const [a, b] of ranges) for (let i = a; i < b && i < html.length; i++) mask[i] = 1;
  let out = '';
  for (let i = 0; i < html.length; i++) if (!mask[i]) out += html[i];
  return out;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function collapse(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function analyse(key, url, html, httpStatus) {
  const stream = stripToTextStream(html);
  const visibleStream = stripToTextStream(stripHiddenContainers(html));

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = collapse(decodeEntities(titleMatch ? titleMatch[1] : ''));

  const h1Matches = [...stream.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Raw = collapse(decodeEntities(h1Matches.map((m) => m[1]).join(' ')));
  // 去掉 h1 内可能嵌套的标签残留
  const h1 = collapse(h1Raw.replace(/<[^>]+>/g, ' '));

  const paragraphs = [...stream.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => collapse(decodeEntities(m[1].replace(/<[^>]+>/g, ' '))))
    .filter((t) => t.length > 0);

  const text = collapse(decodeEntities(stream.replace(/<[^>]+>/g, ' ')));

  // 口径B：no-JS 浏览器实际可见的正文
  const visibleText = collapse(decodeEntities(visibleStream.replace(/<[^>]+>/g, ' ')));
  const visibleH1 = [...visibleStream.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((m) => collapse(decodeEntities(m[1].replace(/<[^>]+>/g, ' '))));
  const visibleRatio = text.length ? Math.round((visibleText.length / text.length) * 100) : 0;

  const checks = [
    { id: 'http200', label: 'HTTP 200', pass: httpStatus === 200, actual: `status ${httpStatus}` },
    { id: 'h1', label: 'no-JS 存在 H1', pass: h1Matches.length > 0, actual: `${h1Matches.length} 个 <h1>` },
    { id: 'h1len', label: `H1 长度 >= ${MIN_H1_LEN}`, pass: h1.length >= MIN_H1_LEN, actual: `${h1.length} 字符` },
    { id: 'paras', label: `正文段落 >= ${MIN_PARAGRAPHS}`, pass: paragraphs.length >= MIN_PARAGRAPHS, actual: `${paragraphs.length} 段` },
    { id: 'textlen', label: `正文纯文本 >= ${MIN_TEXT_LEN} 字符`, pass: text.length >= MIN_TEXT_LEN, actual: `${text.length} 字符` },
    { id: 'title', label: `title 长度 >= ${MIN_TITLE_LEN}`, pass: title.length >= MIN_TITLE_LEN, actual: `${title.length} 字符` },
  ];

  return {
    key,
    url,
    htmlBytes: Buffer.byteLength(html, 'utf8'),
    hiddenContainers: hiddenRanges(html).length,
    title,
    h1,
    visibleH1Count: visibleH1.length,
    paragraphCount: paragraphs.length,
    textLength: text.length,
    visibleTextLength: visibleText.length,
    visibleRatio,
    firstParagraph: paragraphs[0] || '',
    checks,
    pass: checks.every((c) => c.pass),
  };
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; M3-5-audit/1.0; +no-js-simulation)',
      Accept: 'text/html',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(45000),
  });
  return { status: res.status, html: await res.text() };
}

function readFileSafe(p) {
  const abs = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
  if (!fs.existsSync(abs)) {
    console.error(`✗ 文件不存在: ${abs}`);
    process.exit(2);
  }
  return fs.readFileSync(abs, 'utf8');
}

function printReport(results) {
  const passCount = results.filter((r) => r.pass).length;
  const allPass = passCount === results.length;
  const thin = results.filter((r) => r.visibleRatio < 60);

  console.log('');
  console.log('M3-5 抓取与渲染可解析性审计（禁用 JS 模拟）');
  console.log('='.repeat(74));
  console.log('');
  console.log('口径A = HTML 源码全量（文本抽取型爬虫 / 抓原始 HTML 的 AI 爬虫）');
  console.log('口径B = hidden 容器之外（不执行 JS 的真实浏览器可见内容）');
  console.log('');

  for (const r of results) {
    const icon = r.pass ? '✓' : '✗';
    console.log(`${icon} [${r.key}] ${r.url}`);
    console.log(`    HTML ${r.htmlBytes}B | hidden容器 ${r.hiddenContainers} 个 | 正文 ${r.textLength} 字符 / ${r.paragraphCount} 段`);
    console.log(`    A口径 H1: ${r.h1 || '(空)'}`);
    console.log(`    B口径 可见 ${r.visibleTextLength} 字符（${r.visibleRatio}%）| 可见H1 ${r.visibleH1Count} 个`);
    console.log(`    正文首段: ${(r.firstParagraph || '(空)').slice(0, 90)}${(r.firstParagraph || '').length > 90 ? '…' : ''}`);
    const failed = r.checks.filter((c) => !c.pass);
    if (failed.length) {
      for (const c of r.checks) console.log(`      ${c.pass ? 'PASS' : 'FAIL'}  ${c.label}  →  ${c.actual}`);
    } else {
      console.log(`      PASS  全部 6 项硬判据`);
    }
    console.log('');
  }

  console.log('-'.repeat(74));
  console.log(`硬判据结论: ${passCount}/${results.length} 页通过 —— ${allPass ? '✅ PASS' : '❌ FAIL'}`);
  if (thin.length) {
    console.log('');
    console.log(`软判据提示: ${thin.length}/${results.length} 页可见占比 < 60%（内容经 React streaming Suspense 投递）`);
    thin.forEach((r) => console.log(`  · [${r.key}] ${r.url} — 可见 ${r.visibleRatio}%`));
    console.log('  ⇒ AI 爬虫抓原始 HTML 不受影响（口径A 已含正文）；no-JS 浏览器只见 loading 占位符。');
  } else {
    console.log('软判据: 全部页面内容服务端直出，无客户端渲染依赖。');
  }
  console.log('');
  return allPass;
}

async function main() {
  const argv = process.argv.slice(2);
  const fileIdx = argv.indexOf('--file');
  const htmlIdx = argv.indexOf('--html');

  let results;

  if (fileIdx !== -1) {
    // 本地快照模式：--file 依次配 TARGETS 顺序，或用 --file=a.html,b.html
    const files = (argv[fileIdx + 1] || '').split(',').filter(Boolean);
    results = TARGETS.slice(0, files.length).map((t, i) => {
      const html = readFileSafe(files[i]);
      return analyse(t.key, t.url, html, 200);
    });
  } else if (htmlIdx !== -1) {
    const url = argv[htmlIdx + 1] || TARGETS[0].url;
    const full = url.startsWith('http') ? url : BASE + url;
    const { status, html } = await fetchHtml(full);
    results = [analyse('custom', full, html, status)];
  } else {
    console.log(`抓取 ${TARGETS.length} 个代表页（不执行 JS，等价 AI 爬虫视角）…`);
    const settled = await Promise.all(
      TARGETS.map(async (t) => {
        try {
          const { status, html } = await fetchHtml(BASE + t.url);
          return analyse(t.key, t.url, html, status);
        } catch (e) {
          return {
            ...analyse(t.key, t.url, '', 0),
            pass: false,
            checks: [{ id: 'fetch', label: '抓取成功', pass: false, actual: e.message }],
          };
        }
      }),
    );
    results = settled;
  }

  const allPass = printReport(results);
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
