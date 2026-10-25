/**
 * scan-es-localization.mjs — 扫描全站 /es/ 页面的本地化完整度。
 *
 * 目的：确认「英语 CTA + 西语正文」的混语言现象是单页问题还是系统性问题。
 *
 * 检测三类信号：
 *   1. <html lang> 声明
 *   2. <title> 的语言
 *   3. 首屏可见文本的英/西词比例 + 硬编码英语 CTA 是否存在
 *
 * 输出：数据分析/es-localization-scan-2026-10-25.json
 */
import fs from 'node:fs'

const SITE = 'https://www.bookconv.com'
const OUT = '数据分析/es-localization-scan-2026-10-25.json'

// 已知的硬编码英语 UI 串（从线上实测发现）
const EN_UI_MARKERS = [
  'Ready to Convert?',
  'Try our free online converter',
  'Other useful conversions',
  'Related articles',
  'Frequently Asked Questions',
  'Convert now',
  'No registration',
  'Back to',
]

// 西语 UI 串（已本地化的对照）
const ES_UI_MARKERS = [
  'Ver todos los conversores',
  'Artículos relacionados',
  'Preguntas frecuentes',
  'Convertir ahora',
]

const ES_WORDS = /\b(para|como|cómo|cuál|cual|cuales|convertir|archivo|archivos|libro|libros|gratis|gratuito|todos|todas|más|con|del|los|las|una|uno|este|esta|estos|desde|puedes|puede|nuestro|nuestra|en línea|sin|sobre|entre|también|pero|cuando|donde|porque|hacer|tiene|tienen|ser|está|están|es|son|muy|solo|sólo|ahora|aquí)\b/gi
const EN_WORDS = /\b(the|and|with|your|free|convert|ready|try|our|from|this|that|you|are|is|of|for|to|in|on|by|an|or|it|its|can|will|how|what|which|when|not|no|all|more|best|use|using|file|files|book|books)\b/gi

function scoreLang(text) {
  const es = (text.match(ES_WORDS) || []).length
  const en = (text.match(EN_WORDS) || []).length
  return { es, en }
}

function classify(es, en) {
  if (es === 0 && en === 0) return '无信号'
  if (es >= en * 2) return '西语为主'
  if (en >= es * 2) return '英语为主'
  return '混合'
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

async function scan(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BookConvSEO/1.0)' } })
  const html = await res.text()
  const status = res.status

  const lang = (html.match(/<html[^>]*\blang="([^"]*)"/i) || [])[1] || '(无)'
  const title = (html.match(/<title[^>]*>([^<]*)/i) || [])[1] || '(无)'
  const visible = stripHtml(html)
  const head = visible.slice(0, 1200)

  const tScore = scoreLang(title)
  const hScore = scoreLang(head)

  const enMarkers = EN_UI_MARKERS.filter((m) => html.includes(m))
  const esMarkers = ES_UI_MARKERS.filter((m) => html.includes(m))

  return {
    url: url.replace(SITE, ''),
    status,
    htmlLang: lang,
    title,
    titleLang: classify(tScore.es, tScore.en),
    headLang: classify(hScore.es, hScore.en),
    headScore: hScore,
    enUiMarkers: enMarkers,
    esUiMarkers: esMarkers,
    headSample: head.slice(0, 180),
  }
}

// 从 sitemap 拿全部 /es/ URL
const smRes = await fetch(`${SITE}/sitemap.xml`)
const smXml = await smRes.text()
const esUrls = [...smXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1])
  .filter((u) => u.includes('/es/') || u.endsWith('/es'))

console.log(`sitemap 中 /es/ URL 共 ${esUrls.length} 个\n`)

const results = []
for (const u of esUrls) {
  try {
    const r = await scan(u)
    results.push(r)
    const flag = r.headLang === '英语为主' || r.enUiMarkers.length > 0 ? '⚠' : ' '
    console.log(
      `${flag} ${r.url.padEnd(46)} lang=${r.htmlLang.padEnd(3)} title=${r.titleLang.padEnd(6)} 首屏=${r.headLang.padEnd(6)} EN标记=${r.enUiMarkers.length}`
    )
  } catch (e) {
    console.log(`✗ ${u} 失败: ${e.message}`)
    results.push({ url: u.replace(SITE, ''), error: e.message })
  }
  await new Promise((r) => setTimeout(r, 400))
}

fs.writeFileSync(OUT, JSON.stringify({ scannedAt: new Date().toISOString(), results }, null, 2))

// 汇总
const ok = results.filter((r) => !r.error)
const mixed = ok.filter((r) => r.headLang === '英语为主' || r.enUiMarkers.length > 0)
const clean = ok.filter((r) => r.headLang !== '英语为主' && r.enUiMarkers.length === 0)

console.log('\n=== 汇总 ===')
console.log(`扫描成功 ${ok.length} / 失败 ${results.length - ok.length}`)
console.log(`存在英语 UI 或首屏英语为主: ${mixed.length}`)
console.log(`本地化干净: ${clean.length}`)

if (mixed.length) {
  console.log('\n--- 有问题的页面 ---')
  for (const r of mixed) {
    console.log(`${r.url}`)
    console.log(`   title: ${r.title}`)
    console.log(`   英语 UI 串: ${r.enUiMarkers.join(' | ') || '(无)'}`)
    console.log(`   首屏: ${r.headSample.slice(0, 120)}`)
  }
}

// 硬编码英语串的全局分布
console.log('\n--- 硬编码英语 UI 串出现次数 ---')
for (const m of EN_UI_MARKERS) {
  const c = ok.filter((r) => r.enUiMarkers.includes(m)).length
  if (c > 0) console.log(`  ${c} 页  "${m}"`)
}

console.log(`\n→ 已写入 ${OUT}`)
