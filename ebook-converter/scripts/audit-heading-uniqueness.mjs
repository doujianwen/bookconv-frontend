#!/usr/bin/env node
// scripts/audit-heading-uniqueness.mjs
// 2026-10-04 新增。防止 #0 程序化页差异化成果被后续改动悄悄退化。
//
// 为什么要有这个（实测依据）：
//   #0 主线已分两批处理完 51 处共用 heading（首批 24 处 + 三组 27 处）。
//   但这些成果当时只靠人工执行的判据确认，没有常驻门禁
//   ⇒ 下次有人（或我自己）改内容时，可能重新引入共用标题而无人发现。
//
// 判据设计（只测不变量，不测绝对数量）：
//   I1 任一 heading 被 N 个以上页面共用 ⇒ FAIL。
//      为什么用「共用」而不是「必须唯一」：
//      知识型标题（如「什么 EPUB」出现在 8 个 EPUB 相关页）本身合理，
//      强制唯一会产生大量无意义改动和噪声 ⇒ 门禁会训练人忽略输出。
//      阈值取 3：同一句话出现在 3+ 个页面即判同质信号，需人工确认或差异化。
//   I2 覆盖 0 个 section 的内容文件 ⇒ FAIL（防解析器失灵却报通过）。
//
// 反向验证（必做，否则是假门禁）：
//   注入某页改回共用标题 ⇒ exit 1；恢复 ⇒ exit 0。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(__dirname, '..');
const DIR = path.join(APP, 'src/data/content');

const MAX_SHARE = 3; // 允许 1–2 页共用（可能确实合理），3 页起算同质信号

// 已知合理共用白名单（每条都必须写明理由，否则就是在给噪声开后门）
// 纪律：白名单不是「让它别报」而是「记录为什么它该共用」；
//       若某条的 body 其实逐字克隆且与页面主题不符，必须从白名单移除。
const SHARED_OK = new Map([
  [
    'Before You Convert: Check Your EPUB',
    '这是一份通用输入检查清单（确认文件真是 EPUB / 无 DRM / 未超大小上限），' +
      '对任何以 EPUB 为输入的页面都同样成立，属合理共用。' +
      '已实测 3 页 body 逐字相同且内容与各页主题均不冲突（不是错题）。',
  ],
]);

let files;
try {
  files = fs.readdirSync(DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
} catch (e) {
  console.error(`⛔ 判据无法执行：读不到 ${DIR} ⇒ exit 2`);
  process.exit(2);
}
if (files.length === 0) {
  console.error('⛔ 判据无法执行：src/data/content 下无内容文件 ⇒ exit 2（不是「通过」）');
  process.exit(2);
}

// section 解析：heading 与 body 的引号各自独立捕获（仓库里两种引号混用）
const secRe = /"?heading"?:[ \t]*(["'`])([\s\S]*?)\1[ \t\r\n]*,[ \t\r\n]*"?body"?:[ \t]*(["'`])([\s\S]*?)\3[ \t\r\n]*,?[ \t\r\n]*\}/g;

const byHeading = new Map();
const zeroSection = [];
let totalSections = 0;

for (const f of files) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const slug = f.replace(/\.ts$/, '');
  let n = 0;
  secRe.lastIndex = 0;
  let m;
  while ((m = secRe.exec(src))) {
    const h = m[2].trim();
    if (!h) continue;
    n++;
    if (!byHeading.has(h)) byHeading.set(h, []);
    byHeading.get(h).push(slug);
  }
  totalSections += n;
  if (n === 0) zeroSection.push(slug);
}

// I1 共用 heading
const allShared = [...byHeading.entries()]
  .filter(([, slugs]) => slugs.length >= MAX_SHARE)
  .sort((a, b) => b[1].length - a[1].length);
const shared = allShared.filter(([h]) => !SHARED_OK.has(h));
const whitelisted = allShared.filter(([h]) => SHARED_OK.has(h));

// 白名单里的条目必须真的还在被共用（否则白名单腐化，该条目已无意义）
const stale = [...SHARED_OK.keys()].filter((h) => (byHeading.get(h) || []).length < MAX_SHARE);

// I2 零 section 文件
// 说明：解析器一旦失灵（如模板串闭合被破坏），所有文件会同时变 0 段，
// 此时 I1 会「全部通过」—— 那是典型的假通过，故必须显式检查。

console.log('==========================================');
console.log('  convert 页 heading 唯一性审查（防 #0 成果退化）');
console.log('==========================================');
console.log('');
console.log(`内容文件：${files.length}　解析出 section：${totalSections}　不同 heading：${byHeading.size}`);
console.log(`共用阈值：同一 heading 出现在 ≥ ${MAX_SHARE} 个页面即 FAIL`);
console.log('');

if (zeroSection.length > 0) {
  console.log(`❌ I2 每个内容页都解析出 section（防解析器失灵却报通过）`);
  console.log(`     ${zeroSection.length} 个文件解析为 0 段：${zeroSection.join(', ')}`);
  console.log('     ⚠️ 若全部文件同时为 0 段，几乎必然是解析器失灵而非内容缺失 ⇒ 必须先修解析器。');
} else {
  console.log('✅ I2 每个内容页都解析出 section（防解析器失灵却报通过）');
  console.log(`     ${files.length} 个文件全部有 section（最低 ${Math.min(...files.map(() => 1)) && ''}均 > 0）`);
}
console.log('');

if (stale.length > 0) {
  console.log(`⚠️  白名单中有 ${stale.length} 条已不再被多页共用（白名单腐化，请删除）：${stale.join(' / ')}`);
  console.log('');
}

if (shared.length === 0) {
  console.log('✅ I1 无被多页共用的 heading（程序化页差异化未退化）');
} else {
  console.log(`❌ I1 无被多页共用的 heading（程序化页差异化未退化）`);
  for (const [h, slugs] of shared) {
    console.log(`     「${h}」出现在 ${slugs.length} 页：${slugs.join(', ')}`);
  }
  console.log('     ⇒ 判定前先实读这些页的 body：');
  console.log('       · body 逐字克隆（sha1 相同）⇒ 必须差异化正文（属错题 bug）');
  console.log('       · body 各自独有 ⇒ 只改 heading，正文不该动');
  console.log('       · 确属通用内容（如通用检查清单）⇒ 加进本脚本 SHARED_OK 并写明理由');
}
if (whitelisted.length > 0) {
  console.log('');
  console.log(`ℹ️  ${whitelisted.length} 组共用标题已按「合理共用」登记（不计失败）：`);
  for (const [h, slugs] of whitelisted) {
    console.log(`     「${h}」${slugs.length} 页：${slugs.join(', ')}`);
    console.log(`       理由：${SHARED_OK.get(h)}`);
  }
}

const failed = shared.length > 0 || zeroSection.length > 0;
console.log('');
console.log('==========================================');
console.log(`  通过 ${failed ? 1 : 2} / 失败 ${failed ? 1 : 0}`);
console.log('==========================================');
process.exit(failed ? 1 : 0);