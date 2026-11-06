// M8-15 红队独立通道（纯本地，不联网、不 import 现有采集脚本）
// 目的：证伪「数字相等 ⇒ 同窗」。用已有 GA4 US 逐日 + Bing 逐日两份原始导出。
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..', '..')
const us = JSON.parse(fs.readFileSync(path.join(ROOT, '数据分析', 'GA4_M8-15_USdetail_2026-10-08_2026-11-04.json'), 'utf8'))
const OUT = path.join(ROOT, 'docs', 'tasks', 'bookconv-growth-20261105', 'evidence', 'M8-15')
fs.mkdirSync(OUT, { recursive: true })

// ---------- A. Bing 侧：clicks=108 的窗口唯一性 ----------
const rt = fs.readFileSync(path.join(ROOT, '数据分析', 'www.bookconv.com_BingAPI_RankAndTraffic_2026_11_05.csv'), 'utf8')
  .trim().split(/\r?\n/).slice(1).map((l) => { const p = l.split(','); return { d: p[0], c: +p[1], i: +p[2] } })
const bingAll = []
for (let a = 0; a < rt.length; a++) for (let b = a; b < rt.length; b++) {
  const w = rt.slice(a, b + 1)
  const c = w.reduce((x, y) => x + y.c, 0), i = w.reduce((x, y) => x + y.i, 0)
  if (c === 108) bingAll.push({ start: w[0].d, end: w.at(-1).d, days: w.length, clicks: c, impr: i })
}
// 1.5K 缩写允许区间：1450..1549 ⇒ 总印象 3494..3593
const bingNarrow = bingAll.filter((h) => h.impr >= 3494 && h.impr <= 3593)
console.log('=== A. Bing 侧窗口唯一性 ===')
console.log('clicks=108 的连续窗口数:', bingAll.length)
console.log('再叠加印象∈[3494,3593] 后剩余:', bingNarrow.length)
for (const h of bingNarrow) console.log('  ', JSON.stringify(h))

// ---------- B. GA4 侧：US 逐日会话窗口唯一性 ----------
// us.usDaily 只列「有 US 会话」的日期（其余日期 US=0，需补零）
const usByDate = {}
for (const r of us.usDaily) usByDate[r.date] = r.sessions
const dates = []
for (let d = new Date('2026-10-08T00:00:00Z'); d <= new Date('2026-11-04T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) {
  dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''))
}
const series = dates.map((d) => ({ date: d, us: usByDate[d] ?? 0 }))
console.log('\n=== B. GA4 US 逐日会话（补齐零值）===')
console.log('窗口 10/08–11/04 天数', series.length, 'US 会话合计', series.reduce((a, b) => a + b.us, 0))
const gaHits = []
for (let a = 0; a < series.length; a++) for (let b = a; b < series.length; b++) {
  const w = series.slice(a, b + 1)
  const s = w.reduce((x, y) => x + y.us, 0)
  if (s === 9) gaHits.push({ start: w[0].date, end: w.at(-1).date, days: w.length, usSessions: s })
}
console.log('GA4 US 会话=9 的连续子窗口数:', gaHits.length)
for (const h of gaHits.slice(0, 12)) console.log('  ', JSON.stringify(h))
console.log('  ... 共', gaHits.length, '个（完整列表见 verification-window.json）')

// ---------- C. 判定 ----------
const verdict = {
  bingClicks108Windows: bingAll.length,
  bingNarrowWindows: bingNarrow.length,
  gaUs9Windows: gaHits.length,
  conclusion: '数值相等不能证明同窗：Bing 侧 clicks=108 有 ' + bingAll.length + ' 个窗口，叠加印象约束仍有 ' + bingNarrow.length + ' 个；GA4 侧 US=9 有 ' + gaHits.length + ' 个子窗口。',
  correction: '原「同窗 CONFIRMED」必须降级为 UNKNOWN / 数值相容但窗口未直接读取。窗口只能由 BWT 日期控件或导出文件元数据确认。',
}
fs.writeFileSync(path.join(OUT, 'verification-window.json'), JSON.stringify({ verdict, bingAll, bingNarrow, gaHits, series }, null, 2))
console.log('\n=== 裁定 ===')
console.log(verdict.conclusion)
console.log(verdict.correction)
console.log('WROTE:', path.join(OUT, 'verification-window.json'))
