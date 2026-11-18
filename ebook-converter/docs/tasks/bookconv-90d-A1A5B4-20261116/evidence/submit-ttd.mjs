#!/usr/bin/env node
/**
 * submit-ttd.mjs — B4: 向 The Tool Directory 提交 BookConv 免费标准 listing。
 * 用户已授权真实提交（2026-11-16 会话确认）。仅免费、不勾 featured、用站点公示官方邮箱。
 * 描述严格对齐已核验产品事实；禁 100MB 全格式/无限免费/自动删除等过度承诺。
 * 保存：请求体快照 + 原始 HTTP 响应 → 回执证据。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const SUBMIT_URL = 'https://thetooldirectory.com/submit-a-tool/'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

// 同一会话内先 GET 取新鲜 nonce + cookie，避免跨会话 nonce 失效
const pageRes = await fetch(SUBMIT_URL, { headers: { 'User-Agent': UA }, redirect: 'follow' })
const html = await pageRes.text()
const setCookie = pageRes.headers.get('set-cookie') || ''
const cookie = setCookie.split(/,(?=\s*[^;,=]+=)/).map(c => c.split(';')[0]).join('; ')
const nonce = (html.match(/name="ttd_submit_nonce"[^>]*value="([^"]+)"/) || [])[1]
fs.writeFileSync(path.join(HERE, 'ttd-submit-page-fresh.html'), html)
if (!nonce) { console.error('NO_NONCE'); process.exit(2) }

// 严格对齐真实能力：31 转换对/18 格式；单文件直传上限 100MB（仅部分路径），batch/回退 4MB/文件；免费 beta
const fields = {
  ttd_submit_nonce: nonce,
  _wp_http_referer: '/submit-a-tool/',
  ttd_submit_tool: '1',
  tool_name: 'BookConv',
  tool_url: 'https://www.bookconv.com/',
  tool_tagline: 'Free online ebook format converter for EPUB, MOBI, AZW3, PDF and DOCX',
  tool_pricing: 'Free',
  tool_category: '33', // Utilities
  submitter_email: 'hello@bookconv.com',
  tool_platforms: 'Web',
  tool_audiences: 'Readers, students, authors, ebook users',
  tool_use_cases: 'Convert ebooks between EPUB, MOBI, AZW3, PDF and DOCX formats online',
  tool_alternatives: 'Calibre, CloudConvert',
  tool_logo: '',
  tool_screenshots: '',
  tool_description: 'BookConv is a free online ebook format conversion tool for personal use. It provides format-specific workflows for EPUB, MOBI, AZW3, PDF, DOCX and other supported file types. Single-file direct upload supports up to 100 MB on enabled routes; fallback and batch uploads are limited to 4 MB per file. Availability, processing time and output fidelity depend on the format pair and conversion route. Batch conversion is free during the public beta. Some processing routes use third-party services; please review the privacy policy before uploading sensitive documents.',
  growth_challenge: 'visitors'
  // 故意不包含 feature_interest（付费 featured 勾选）——保持免费提交
}

const body = new URLSearchParams(fields).toString()
fs.writeFileSync(path.join(HERE, 'ttd-submit-request.json'), JSON.stringify({
  url: SUBMIT_URL, method: 'POST', at: new Date().toISOString(), fields
}, null, 2))

const started = new Date().toISOString()
const res = await fetch(SUBMIT_URL, {
  method: 'POST',
  headers: {
    'User-Agent': UA,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Origin': 'https://thetooldirectory.com',
    'Referer': SUBMIT_URL,
    'Accept': 'text/html,application/xhtml+xml',
    ...(cookie ? { 'Cookie': cookie } : {})
  },
  body,
  redirect: 'manual'
})
const text = await res.text()
const receipt = {
  at: started,
  url: SUBMIT_URL,
  status: res.status,
  location: res.headers.get('location') || null,
  contentType: res.headers.get('content-type') || null,
  responseBytes: Buffer.byteLength(text),
  // 成功关键词探测（不做结论，仅记录证据供人工判定）
  signals: {
    hasThankYou: /thank you|thanks for submit|submission received|we.?ll review|under review|successfully submitted/i.test(text),
    hasError: /error|required field|invalid|spam|nonce/i.test(text),
    hasDuplicate: /already (submitted|exists|listed)|duplicate/i.test(text)
  },
  excerpt: text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 800),
  interpretation: 'HTTP 状态与信号仅为提交回执证据；平台人工审核后的公开 listing URL 才算 LIVE_VERIFIED。当前阶段最多到 SUBMITTED。'
}
fs.writeFileSync(path.join(HERE, 'ttd-submit-receipt.json'), JSON.stringify(receipt, null, 2))
console.log(JSON.stringify({ status: receipt.status, location: receipt.location, signals: receipt.signals, responseBytes: receipt.responseBytes }, null, 2))
