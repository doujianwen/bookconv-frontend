/**
 * fetch-serp-top10-once.mjs — one-off: 拉取指定 query 的完整 organic 前 10 名。
 *
 * 目的（第 5 个数据源）：判断「位置 70 → 位置 10」的差距是否可弥补。
 * 需要看清 SERP 前 10 名是谁、什么类型、有没有小站能挤进去。
 *
 * 与 fetch-competitor-serp.mjs 的区别：那个只记录预设竞品域名的排名，
 * 这个记录完整排名表（含 title/snippet），用于判断页面形态。
 *
 * 输出：数据分析/serp-top10-2026-10-25.json
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const OUT = join(ROOT, '数据分析', 'serp-top10-2026-10-25.json')

function loadDotEnv() {
  const p = join(ROOT, '.env')
  if (!existsSync(p)) return
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/)
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}
loadDotEnv()

const KEYS = [process.env.SERPAPI_KEY, process.env.SERPAPI_KEY_2].filter(Boolean)
if (!KEYS.length) {
  console.error('✗ 没有 SERPAPI_KEY，无法拉取')
  process.exit(1)
}

const hostOf = (u) => {
  try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' }
}

// 依据 GSC 90 天数据选词：覆盖「核心词 / 冷门词 / 内容词 / 西语词」四类
const QUERIES = [
  { q: 'mobi to epub',          gl: 'us', hl: 'en', tag: '核心词 pos69.6' },
  { q: 'ebook converter',       gl: 'us', hl: 'en', tag: '核心词 pos93.1' },
  { q: 'epub to azw3',          gl: 'us', hl: 'en', tag: '核心词 pos48.9' },
  { q: 'epub to zip',           gl: 'us', hl: 'en', tag: '冷门词 pos12.1' },
  { q: 'azw3 vs mobi',          gl: 'us', hl: 'en', tag: '内容词 pos9.9' },
  { q: 'epub para doc',         gl: 'mx', hl: 'es', tag: '西语 pos45.7' },
]

async function fetchOne(query, gl, hl, key) {
  const url =
    `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}` +
    `&gl=${gl}&hl=${hl}&num=20&api_key=${key}`
  const res = await fetch(url)
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  const organic = (json.organic_results || []).map((r) => ({
    position: r.position,
    title: r.title,
    link: r.link,
    domain: hostOf(r.link),
    snippet: (r.snippet || '').slice(0, 160),
    displayed_link: r.displayed_link,
  }))
  return {
    query, gl, hl,
    totalResults: json.search_information?.total_results,
    organic,
    relatedQuestions: (json.related_questions || []).map((q) => q.question).slice(0, 6),
    features: {
      hasAiOverview: !!json.ai_overview,
      hasKnowledgePanel: !!json.knowledge_graph,
      hasLocalPack: !!json.local_results,
      hasTopStories: !!json.top_stories,
      hasVideos: !!json.inline_videos,
      hasPeopleAlsoAsk: (json.related_questions || []).length > 0,
    },
  }
}

const results = []
for (let i = 0; i < QUERIES.length; i++) {
  const { q, gl, hl, tag } = QUERIES[i]
  const key = KEYS[i % KEYS.length]
  try {
    const r = await fetchOne(q, gl, hl, key)
    r.tag = tag
    results.push(r)
    console.log(`\n=== ${q}  [${tag}] ===  organic=${r.organic.length}  total≈${r.totalResults ?? '?'}`)
    const feats = Object.entries(r.features).filter(([, v]) => v).map(([k]) => k.replace('has', ''))
    if (feats.length) console.log(`   SERP 特性: ${feats.join(', ')}`)
    for (const o of r.organic.slice(0, 10)) {
      console.log(`   ${String(o.position).padStart(2)}. ${o.domain.padEnd(26)} ${o.title?.slice(0, 62) || ''}`)
    }
  } catch (e) {
    console.log(`\n=== ${q} === 失败: ${e.message}`)
    results.push({ query: q, tag, error: e.message })
  }
  if (i < QUERIES.length - 1) await new Promise((r) => setTimeout(r, 1200))
}

writeFileSync(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), source: 'serpapi', results }, null, 2))
console.log(`\n→ 已写入 ${OUT}`)
