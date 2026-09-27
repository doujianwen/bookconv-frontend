#!/usr/bin/env node
/**
 * Bing URL Status Checker — 复核 9/7 提交的 16 个 URL 状态变化
 *
 * 用法:
 *   node bing-check-submitted-urls.mjs --key "APIKEY"
 *
 * 输出: CSV 文件 bing-url-status-submitted16-2026-09-13.csv
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function arg(name, envName, def) {
  const i = process.argv.indexOf(name);
  if (i > -1 && process.argv[i + 1]) return process.argv[i + 1];
  if (envName && process.env[envName]) return process.env[envName];
  return def;
}

const KEY = arg('--key', 'BING_WMT_API_KEY');
const SITE = 'https://www.bookconv.com';
const IN = arg('--in', null, resolve(__dirname, '../数据分析/bing-url-status-submitted16-2026-09-07.csv'));
const OUT = arg('--out', null, resolve(__dirname, '../数据分析/bing-url-status-submitted16-2026-09-13.csv'));

if (!KEY) {
  console.error('缺少 API Key: 用 --key 或环境变量 BING_WMT_API_KEY');
  process.exit(1);
}

// ── 1. 读目标 URL ─────────────────────────────────────
function parseCsv(path) {
  const lines = readFileSync(path, 'utf-8').split(/\r?\n/).filter(Boolean);
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const m = lines[i].match(/^"([^"]*)","([^"]*)"/);
    if (m) out.push({ url: m[1], state: m[2] });
  }
  return out;
}

const targets = parseCsv(IN);
console.log(`目标 URL: ${targets.length} 个\n`);

// ── 2. 批量查询 GetUrlInfo ─────────────────────────────
const API = 'https://ssl.bing.com/webmaster/api.svc/json';
const results = [];

console.log('=== 开始查询 GetUrlInfo ===\n');

for (const { url, state: oldState } of targets) {
  const u = `${API}/GetUrlInfo?siteUrl=${encodeURIComponent(SITE)}&url=${encodeURIComponent(url)}&apikey=${encodeURIComponent(KEY)}`;

  try {
    const res = await fetch(u);
    const text = await res.text();
    const json = JSON.parse(text);

    let newState = 'error';
    let discoveryDate = '';
    let lastCrawledDate = '';
    let note = '';

    if (json.Results && json.Results.length > 0) {
      const info = json.Results[0].UrlInfoById;
      newState = info.State || 'unknown';
      discoveryDate = info.DiscoveryDate || '';
      lastCrawledDate = info.LastCrawledDate || '';
      note = info.Note || '';
    } else {
      note = 'No results';
    }

    results.push({
      url,
      oldState,
      newState,
      discoveryDate,
      lastCrawledDate,
      note
    });

    const changed = oldState !== newState ? '⚠️ CHANGED' : '✅ same';
    console.log(`${changed} | ${oldState} → ${newState} | ${url}`);
    if (discoveryDate) console.log(`       Discovery: ${discoveryDate}, Crawled: ${lastCrawledDate}`);

    // 限流退避
    await new Promise(r => setTimeout(r, 3000));
  } catch (e) {
    results.push({ url, oldState, newState: 'error', discoveryDate: '', lastCrawledDate: '', note: e.message });
    console.log(`❌ ERROR | ${url} | ${e.message.slice(0, 50)}`);
    await new Promise(r => setTimeout(r, 5000));
  }
}

// ── 3. 输出 CSV ────────────────────────────────────────
const header = 'url,oldState,newState,discoveryDate,lastCrawledDate,note';
const rows = results.map(r =>
  `"${r.url}","${r.oldState}","${r.newState}","${r.discoveryDate}","${r.lastCrawledDate}","${r.note}"`
);
const csv = [header, ...rows].join('\n');
writeFileSync(OUT, csv, 'utf-8');

console.log(`\n✅ 结果已保存: ${OUT}`);

// ── 4. 统计变化 ────────────────────────────────────────
const changed = results.filter(r => r.oldState !== r.newState);
const discovered = results.filter(r => r.discoveryDate);

console.log(`\n=== 统计 ===`);
console.log(`总 URL: ${results.length}`);
console.log(`状态变化: ${changed.length}`);
console.log(`出现 DiscoveryDate: ${discovered.length}`);

if (discovered.length > 0) {
  console.log('\n有新抓取记录的 URL:');
  for (const r of discovered) {
    console.log(`  ${r.url} → ${r.oldState} → ${r.newState} (Discovery: ${r.discoveryDate})`);
  }
}
