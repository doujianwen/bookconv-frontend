#!/usr/bin/env node
/**
 * Tier-1 首次读数采集脚本（10/1）
 *
 * 用途：采集 Tier-1 五页在改造后 ≥14 天的首次指数读数
 *
 * 数据源：
 * - GSC page report (API) → 最近 7 天曝光/排名
 * - Bing PageTrafficReport → 最新快照曝光/排名
 * - Bing AIPageStatsReport → 最新快照 citations
 *
 * 使用方法：
 *   node scripts/tier1-first-read.mjs [--help]
 */

const fs = require('fs');
const path = require('path');

// ── 配置 ──────────────────────────────────────────────────────────
const BASE = process.env.BASE_DIR || 'E:/一人公司/电子书格式转换站/ebook-converter';
const DATA_DIR = path.join(BASE, '数据分析');
const BING_DIR = path.join(BASE, 'bookconv_data_asset/bing');

// Tier-1 五页（9/17 改造，基线 9/15）
const TIER1_PAGES = [
  { slug: 'mobi-to-epub',         baseImp: 76,  basePos: 66.2, note: '最高基线' },
  { slug: 'epub-to-azw3',         baseImp: 71,  basePos: 60.6, note: '次高基线' },
  { slug: 'pdf-to-epub',          baseImp: 9,   basePos: 49.4, note: '位置最好' },
  { slug: 'epub-to-mobi',         baseImp: 8,   basePos: 58.5, note: '偏低' },
  { slug: 'epub-to-pdf',          baseImp: 0,   basePos: null, note: '⚠️ 零曝光' },
];

// ── 工具函数 ──────────────────────────────────────────────────────
function readCSV(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(Boolean);
  if (lines.length < 2) return null;
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.replace(/"/g, '').trim());
    const row = {};
    headers.forEach((h, i) => row[h] = cols[i]);
    return row;
  });
}

function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function findFile(dir, pattern) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  return files.find(f => f.includes(pattern));
}

// ── 数据采集 ──────────────────────────────────────────────────────
function collectData() {
  const result = {
    collectDate: new Date().toISOString().split('T')[0],
    gsc: null,
    bingPageTraffic: null,
    bingAIPageStats: null,
    tier1Readings: []
  };

  // 1. GSC page report（最近 7 天窗口）
  const gscFile = findFile(DATA_DIR, 'GSC_API_page_');
  if (gscFile) {
    const gscData = readJSON(path.join(DATA_DIR, gscFile));
    if (gscData && gscData.rows) {
      result.gsc = {
        source: gscFile,
        rows: gscData.rows,
        startDate: gscData.startDate,
        endDate: gscData.endDate
      };
    }
  }

  // 2. Bing PageTrafficReport（最新）
  const bingPageFile = findFile(BING_DIR, 'PageTrafficReport');
  if (bingPageFile) {
    const bingData = readCSV(path.join(BING_DIR, bingPageFile));
    if (bingData) {
      result.bingPageTraffic = {
        source: bingPageFile,
        rows: bingData
      };
    }
  }

  // 3. Bing AIPageStatsReport（最新）
  const bingAIFile = findFile(BING_DIR, 'AIPageStatsReport');
  if (bingAIFile) {
    const bingData = readCSV(path.join(BING_DIR, bingAIFile));
    if (bingData) {
      result.bingAIPageStats = {
        source: bingAIFile,
        rows: bingData
      };
    }
  }

  // 4. 聚合 Tier-1 读数
  result.tier1Readings = TIER1_PAGES.map(page => {
    const reading = {
      slug: page.slug,
      url: `https://www.bookconv.com/convert/${page.slug}`,
      baseline: { impressions: page.baseImp, position: page.basePos, note: page.note }
    };

    // GSC 数据
    if (result.gsc) {
      const gscRow = result.gsc.rows.find(r =>
        r.keys && r.keys[0] && r.keys[0].includes(`/convert/${page.slug}`)
      );
      if (gscRow) {
        reading.gsc = {
          impressions: gscRow.impressions,
          position: parseFloat(gscRow.position),
          window: `${result.gsc.startDate} ~ ${result.gsc.endDate}`
        };
      } else {
        reading.gsc = { impressions: 0, position: null, notFound: true };
      }
    }

    // Bing PageTraffic 数据
    if (result.bingPageTraffic) {
      const bingRow = result.bingPageTraffic.rows.find(r =>
        r['页面'] && r['页面'].includes(`/convert/${page.slug}`)
      );
      if (bingRow) {
        reading.bing = {
          impressions: parseInt(bingRow['印象数']),
          clicks: parseInt(bingRow['点击次数']),
          position: parseFloat(bingRow['平均排名'])
        };
      } else {
        reading.bing = { impressions: 0, clicks: 0, position: null, notFound: true };
      }
    }

    // Bing AI citations
    if (result.bingAIPageStats) {
      const aiRow = result.bingAIPageStats.rows.find(r =>
        r['页面'] && r['页面'].includes(`/convert/${page.slug}`)
      );
      if (aiRow) {
        reading.aiCitations = parseInt(aiRow['Citations']);
      } else {
        reading.aiCitations = 0;
      }
    }

    // 变化率（vs 基线）
    if (reading.gsc && reading.gsc.impressions > 0 && page.baseImp > 0) {
      reading.gscChange = ((reading.gsc.impressions - page.baseImp) / page.baseImp * 100).toFixed(1) + '%';
    } else if (page.baseImp === 0) {
      reading.gscChange = '基线为0';
    } else {
      reading.gscChange = '无数据';
    }

    return reading;
  });

  return result;
}

// ── 输出报告 ──────────────────────────────────────────────────────
function printReport(data) {
  console.log('═'.repeat(70));
  console.log('Tier-1 首次读数报告');
  console.log(`采集时间: ${data.collectDate}`);
  console.log('═'.repeat(70));

  console.log('\n【数据源】');
  console.log(`  GSC: ${data.gsc?.source || '未找到'}`);
  console.log(`  Bing PageTraffic: ${data.bingPageTraffic?.source || '未找到'}`);
  console.log(`  Bing AIPageStats: ${data.bingAIPageStats?.source || '未找到'}`);

  console.log('\n【Tier-1 五页读数】\n');
  console.log('| 页面 | GSC 曝光 | GSC 位置 | Bing 曝光 | Bing 位置 | AI Citations | 变化 |');
  console.log('|------|----------|----------|-----------|-----------|--------------|------|');

  data.tier1Readings.forEach(r => {
    const gscImp = r.gsc ? r.gsc.impressions : '-';
    const gscPos = r.gsc?.position ? r.gsc.position.toFixed(1) : '-';
    const bingImp = r.bing ? r.bing.impressions : '-';
    const bingPos = r.bing?.position ? r.bing.position.toFixed(1) : '-';
    const aiCit = r.aiCitations ?? '-';
    const change = r.gscChange || '-';
    console.log(`| /convert/${r.slug} | ${gscImp} | ${gscPos} | ${bingImp} | ${bingPos} | ${aiCit} | ${change} |`);
  });

  // 汇总
  const totalGscImp = data.tier1Readings.reduce((s, r) => s + (r.gsc?.impressions || 0), 0);
  const totalBingImp = data.tier1Readings.reduce((s, r) => s + (r.bing?.impressions || 0), 0);
  const totalAiCit = data.tier1Readings.reduce((s, r) => s + (r.aiCitations || 0), 0);
  const baselineTotal = TIER1_PAGES.reduce((s, p) => s + p.baseImp, 0);

  console.log('\n【汇总】');
  console.log(`  GSC 基线总曝光: ${baselineTotal}`);
  console.log(`  GSC 当前总曝光: ${totalGscImp}`);
  console.log(`  Bing 当前总曝光: ${totalBingImp}`);
  console.log(`  Bing AI 总 Citations: ${totalAiCit}`);

  // 主题簇（相关重名页）
  console.log('\n【主题簇提醒】');
  console.log('  • epub→mobi 簇（5 个近重名页）: 需看总量');
  console.log('  • epub→docx 簇（5 个近重名页）: 需看总量');
  console.log('  • 单次读数仅作参考，判定需 6-8 周趋势');
}

// ── 主程序 ────────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: node ${path.basename(process.argv[1])} [--help]
    
Tier-1 首次读数采集脚本
数据源:
  - GSC page report (API, 最近 7 天)
  - Bing PageTrafficReport (WMT 手动导出)
  - Bing AIPageStatsReport (WMT 手动导出)

输出:
  - 终端报告
  - JSON 保存到 数据分析/tier1_first_read_<date>.json`);
    return;
  }

  const data = collectData();
  printReport(data);

  // 保存 JSON
  const dateStr = data.collectDate.replace(/-/g, '');
  const outPath = path.join(DATA_DIR, `tier1_first_read_${dateStr}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n📄 JSON 已保存: ${outPath}`);
}

main();
