#!/usr/bin/env node
/**
 * monitor-brand-keywords.mjs
 * 品牌词监控脚本 —— 跟踪 "bookconv" / "ebookconverter" 等品牌词在 GSC 和 Bing API 的表现
 *
 * 输出到：数据分析/brand_monitor_<date>.json
 * 触发：每日双渠道分析流水线阶段 1 后
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { glob } from 'glob';

const DATA_DIR = '数据分析';

// 品牌词清单（按优先级）
const BRAND_KEYWORDS = [
  'bookconv',
  'ebookconverter',
  'ebook convert',
  'epub converter',
];

function parseGSC(file) {
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    return data.rows || [];
  } catch {
    return [];
  }
}

function parseBingQuery(file) {
  try {
    let content = readFileSync(file, 'utf8');
    // Strip BOM if present
    if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

    // Custom CSV parser that handles quoted fields
    function parseCSVLine(line) {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current);
      return result;
    }

    const lines = content.split('\n').filter(l => l.trim());
    const header = parseCSVLine(lines[0]);
    return lines.slice(1).map(line => {
      const vals = parseCSVLine(line);
      const row = {};
      header.forEach((h, i) => row[h] = vals[i]);
      return row;
    });
  } catch {
    return [];
  }
}

async function main() {
  const date = new Date().toISOString().slice(0, 10);
  const results = {
    date,
    brand_keywords: BRAND_KEYWORDS,
    gsc: {},
    bing: {},
    summary: {}
  };

  // GSC 查询文件（使用正斜杠避免 Windows glob 问题）
  const gscFiles = await glob(`${DATA_DIR}/GSC_API_query_*.json`);

  for (const f of gscFiles.sort().reverse().slice(0, 3)) {
    try {
      const rows = parseGSC(f);
      const fileDate = f.match(/GSC_API_query_(\d{4}-\d{2}-\d{2})/)?.[1];
      if (!fileDate) continue;

      results.gsc[fileDate] = {
        total_rows: rows.length,
        brand_matches: []
      };

      for (const keyword of BRAND_KEYWORDS) {
        const matches = rows.filter(r => {
          const keys = r.keys || [];
          return keys.some(k => k.toLowerCase().includes(keyword.toLowerCase()));
        });

        if (matches.length > 0) {
          const totalImp = matches.reduce((s, r) => s + parseInt(r.impressions || 0), 0);
          const totalClick = matches.reduce((s, r) => s + parseInt(r.clicks || 0), 0);
          results.gsc[fileDate].brand_matches.push({
            keyword,
            rows: matches.length,
            impressions: totalImp,
            clicks: totalClick,
            ctr: totalImp > 0 ? (totalClick / totalImp * 100).toFixed(2) + '%' : '0%'
          });
        }
      }
    } catch {}
  }

  // Bing Query API 文件
  const bingFiles = await glob(`${DATA_DIR}/www.bookconv.com_BingAPI_Query_*.csv`);

  for (const f of bingFiles.sort().reverse().slice(0, 3)) {
    try {
      const rows = parseBingQuery(f);
      // Extract date from filename (handle both / and \ on Windows)
      const fileDate = f.replace(/\\/g, '/').match(/BingAPI_Query_(\d{4})_(\d{2})_(\d{2})/);
      if (!fileDate) continue;
      const dateStr = `${fileDate[1]}-${fileDate[2]}-${fileDate[3]}`;

      results.bing[dateStr] = {
        total_rows: rows.length,
        brand_matches: []
      };

      for (const keyword of BRAND_KEYWORDS) {
        const matches = rows.filter(r => {
          const query = r.Query || '';
          return query.toLowerCase().includes(keyword.toLowerCase());
        });

        if (matches.length > 0) {
          const totalImp = matches.reduce((s, r) => s + parseInt(r.Impressions || 0), 0);
          const totalClick = matches.reduce((s, r) => s + parseInt(r.Clicks || 0), 0);
          const avgPos = matches.reduce((s, r) => s + parseFloat(r.AvgImpressionPosition || 0), 0) / matches.length;
          results.bing[dateStr].brand_matches.push({
            keyword,
            rows: matches.length,
            impressions: totalImp,
            clicks: totalClick,
            avg_position: avgPos > 0 ? avgPos.toFixed(1) : 'N/A'
          });
        }
      }
    } catch {}
  }

  // 汇总
  let totalBrandImp = 0;
  let totalBrandClick = 0;
  for (const period of Object.values(results.gsc)) {
    for (const m of period.brand_matches) {
      totalBrandImp += m.impressions;
      totalBrandClick += m.clicks;
    }
  }
  for (const period of Object.values(results.bing)) {
    for (const m of period.brand_matches) {
      totalBrandImp += m.impressions;
      totalBrandClick += m.clicks;
    }
  }

  results.summary = {
    total_brand_impressions: totalBrandImp,
    total_brand_clicks: totalBrandClick,
    blended_ctr: totalBrandImp > 0 ? (totalBrandClick / totalBrandImp * 100).toFixed(2) + '%' : '0%',
    status: totalBrandClick > 0 ? '🟢 品牌词有点击' : '🟡 品牌词无点击，需观察'
  };

  // 输出
  const outDir = DATA_DIR;
  mkdirSync(outDir, { recursive: true });
  const outFile = `${outDir}/brand_monitor_${date}.json`;
  writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf8');

  console.log(JSON.stringify({
    ok: true,
    file: outFile,
    summary: results.summary,
    gsc_periods: Object.keys(results.gsc),
    bing_periods: Object.keys(results.bing)
  }, null, 2));
}

main().catch(err => {
  console.error(JSON.stringify({ ok: false, error: err.message }));
  process.exit(1);
});
