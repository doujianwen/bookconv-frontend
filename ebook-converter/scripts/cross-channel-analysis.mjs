/**
 * cross-channel-analysis.mjs — Bing vs GSC Spanish query comparison
 *
 * 读取两个数据源，用同一套西语判别正则，输出交叉对比表。
 * 用于验证 2026-09-19 GEO 诊断后「西语页面质量」争议。
 *
 * 用法:
 *   node scripts/cross-channel-analysis.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, '数据分析')

/** 西语 query 判别（同一套正则，Bing/GSC/基线一致） */
const ES_QUERY = (q) => {
  const es = /(convertidor|libros?\b|gratis|descarga|convertir|formato|para\b|sin\b|digitales|pueden|mejor|l[íi]nea|como\b|c[oó]mo|archivo|electr[oó]nico|descargar|puedo|necesito|herramienta|librer[aí]a)|[áéíóúñü¿¡]/i
  const not_es = /(plik[oó]w|fichier)/i
  return es.test(q) && !not_es.test(q)
}

function parseBingCSV(filepath) {
  const text = fs.readFileSync(filepath, 'utf8')
  const lines = text.trim().split('\n').slice(1) // skip header
  const rows = lines.map(l => {
    const [date, query, clicks, impressions, avgClickPos, avgImpPos] = l.split(',')
    return { date, query: query.trim(), clicks: Number(clicks) || 0, impressions: Number(impressions) || 0, avgClickPos, avgImpPos }
  })
  return rows
}

function parseGSCJSON(filepath) {
  return JSON.parse(fs.readFileSync(filepath, 'utf8'))
}

function main() {
  // --- Load Bing ---
  const bingFiles = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('www.bookconv.com_BingAPI_Query_')).sort().reverse()
  if (!bingFiles.length) { console.error('No Bing API Query files found'); process.exit(1) }
  const bingFile = path.join(DATA_DIR, bingFiles[0])
  const bingRows = parseBingCSV(bingFile)
  console.log(`Loaded Bing: ${bingFile} (${bingRows.length} rows)`)

  // --- Load GSC ---
  const gscQFile = fs.readdirSync(DATA_DIR).find(f => f.startsWith('GSC_API_query_'))
  const gscPFile = fs.readdirSync(DATA_DIR).find(f => f.startsWith('GSC_API_page_'))
  if (!gscQFile || !gscPFile) { console.error('Missing GSC files'); process.exit(1) }
  const gscQ = parseGSCJSON(path.join(DATA_DIR, gscQFile))
  const gscPage = parseGSCJSON(path.join(DATA_DIR, gscPFile))
  console.log(`Loaded GSC: ${gscQFile} (${gscQ.rows.length} rows), ${gscPFile} (${gscPage.rows.length} rows)`)

  // --- Aggregate Bing ---
  const bingAgg = {}
  bingRows.forEach(r => {
    bingAgg[r.query] = { i: (bingAgg[r.query]?.i || 0) + r.impressions, c: (bingAgg[r.query]?.c || 0) + r.clicks }
  })
  const bingES = Object.entries(bingAgg).filter(([q]) => ES_QUERY(q))
  const bingTotalI = Object.values(bingAgg).reduce((a, v) => a + v.i, 0)
  const bingES_I = bingES.reduce((a, [, v]) => a + v.i, 0)
  const bingES_C = bingES.reduce((a, [, v]) => a + v.c, 0)

  // --- Aggregate GSC query ---
  const gscAgg = {}
  gscQ.rows.forEach(r => {
    const q = r.keys[0]
    gscAgg[q] = { i: (gscAgg[q]?.i || 0) + r.impressions, c: (gscAgg[q]?.c || 0) + r.clicks, pos: (gscAgg[q]?.pos || 0) + r.position, n: (gscAgg[q]?.n || 0) + 1 }
  })
  const gscES = Object.entries(gscAgg).filter(([q]) => ES_QUERY(q))
  const gscTotalI = Object.values(gscAgg).reduce((a, v) => a + v.i, 0)
  const gscES_I = gscES.reduce((a, [, v]) => a + v.i, 0)
  const gscES_C = gscES.reduce((a, [, v]) => a + v.c, 0)

  // --- GSC page-level /es/ analysis ---
  const gscPageAgg = {}
  gscPage.rows.forEach(r => { gscPageAgg[r.keys[0]] = r })
  const esPages = Object.entries(gscPageAgg)
    .filter(([k]) => k.includes('/es/'))
    .sort((a, b) => b[1].impressions - a[1].impressions)
  const nonEsPages = Object.entries(gscPageAgg)
    .filter(([k]) => !k.includes('/es/'))
    .sort((a, b) => b[1].impressions - a[1].impressions)

  // --- Print ---
  console.log('')
  console.log('═'.repeat(70))
  console.log('  Bing vs GSC 交叉对比 · 西语查询与页面表现')
  console.log('═'.repeat(70))
  console.log('')

  console.log('【Query 维度：西语占比】')
  console.log('┌───────────────┬────────────┬────────────┐')
  console.log('│               │    Bing    │    GSC     │')
  console.log('├───────────────┼────────────┼────────────┤')
  const bqCount = Object.keys(bingAgg).length
  const gqCount = Object.keys(gscAgg).length
  console.log(`│ 查询数        │ ${String(bqCount).padEnd(10)} │ ${String(gqCount).padEnd(10)} │`)
  console.log(`│ 西语查询数    │ ${String(bingES.length).padEnd(10)} │ ${String(gscES.length).padEnd(10)} │`)
  console.log(`│ 西语/query    │ ${(bingES.length / bqCount * 100).toFixed(1).padEnd(10)}% │ ${(gscES.length / gqCount * 100).toFixed(1).padEnd(10)}% │`)
  console.log(`│ 总曝光        │ ${String(bingTotalI).padEnd(10)} │ ${String(gscTotalI).padEnd(10)} │`)
  console.log(`│ 西语曝光      │ ${String(bingES_I).padEnd(10)} │ ${String(gscES_I).padEnd(10)} │`)
  console.log(`│ 西语/曝光     │ ${(bingES_I / bingTotalI * 100).toFixed(1).padEnd(10)}% │ ${(gscES_I / gscTotalI * 100).toFixed(1).padEnd(10)}% │`)
  const bqC = Object.values(bingAgg).reduce((a, v) => a + v.c, 0)
  const gqC = Object.values(gscAgg).reduce((a, v) => a + v.c, 0)
  console.log(`│ 总点击        │ ${String(bqC).padEnd(10)} │ ${String(gqC).padEnd(10)} │`)
  console.log(`│ 西语点击      │ ${String(bingES_C).padEnd(10)} │ ${String(gscES_C).padEnd(10)} │`)
  console.log('└───────────────┴────────────┴────────────┘')

  console.log('')
  console.log('【GSC 页面维度：/es/ 页面表现（30d）】')
  console.log(`  全站被索引页: ${Object.keys(gscPageAgg).length} | /es/ 页: ${esPages.length}`)
  console.log('')
  console.log('  ── /es/ 页面 (按曝光排序) ──')
  esPages.forEach(([, v], i) => {
    const status = v.impressions > 5 ? '有曝光' : '低曝光'
    console.log(`    ${String(i + 1).padStart(2)}. pos=${v.position.toFixed(1).padStart(4)}  imp=${String(v.impressions).padStart(3)}  clk=${String(v.clicks).padStart(2)}  [${status}]  ${v.keys[0]}`)
  })
  console.log('')
  console.log('  ── 非 /es/ Top 15 页面 (对照) ──')
  nonEsPages.slice(0, 15).forEach(([, v], i) => {
    console.log(`    ${String(i + 1).padStart(2)}. pos=${v.position.toFixed(1).padStart(4)}  imp=${String(v.impressions).padStart(3)}  clk=${String(v.clicks).padStart(2)}  ${v.keys[0]}`)
  })

  console.log('')
  console.log('【结论】')
  const esAvgPos = esPages.reduce((a, [, v]) => a + v.position, 0) / (esPages.length || 1)
  const nonEsAvgPos = nonEsPages.slice(0, 10).reduce((a, [, v]) => a + v.position, 0) / (nonEsPages.slice(0, 10).length || 1)
  console.log(`  • /es/ 页面平均排名: ${esAvgPos.toFixed(1)} (better = lower number)`)
  console.log(`  • 非 /es/ Top10 平均排名: ${nonEsAvgPos.toFixed(1)}`)
  if (esAvgPos < nonEsAvgPos) {
    console.log('  ✅ 西语页面排名明显优于英文页（平均 pos ' + esAvgPos.toFixed(1) + ' vs ' + nonEsAvgPos.toFixed(1) + '）')
  } else {
    console.log('  ⚠️ 西语页面排名未优于英文页')
  }
  console.log('')
  console.log('⚠️  数据说明:')
  console.log('  • Bing 数据日期范围: ' + bingRows[0]?.date + ' ~ ' + bingRows[bingRows.length - 1]?.date)
  console.log('  • GSC 数据窗口: ' + gscQ.startDate + ' ~ ' + gscQ.endDate + ' (GSC 有 ~2 天延迟)')
  console.log('  • 点击数据: GSC 有隐私阈值（<3 点击不显示），Bing 无此限制')
}

try { main() } catch (e) { console.error('FAILED:', e.message); process.exit(1) }
