# 📋 网站上线前SEO内容任务清单

> 最后更新: 2026-07-13
> 项目: BookConv - 电子书格式转换站
> 状态: 进行中

---

## P0 — 最高优先级（内容字数）

### S级页面 ≥3000字

| # | 页面 | 字数 | 状态 |
|---|------|------|------|
| 1 | epub-to-txt | 5033 | ✅ |
| 2 | lit-to-epub | 6276 | ✅ |
| 3 | pdf-to-epub | 6226 | ✅ |

### A级页面 ≥2000字

| # | 页面 | 字数 | 状态 |
|---|------|------|------|
| 1 | mobi-to-epub | 5860 | ✅ 已修复 |
| 2 | epub-to-mobi | 5631 | ✅ 已修复 |
| 3 | epub-to-text | 4870 | ✅ 已修复 |
| 4 | epub-to-azw3 | 4528 | ✅ |
| 5 | epub-to-pdf | 4251 | ✅ |
| 6 | azw3-to-epub | 3948 | ✅ |
| 7 | azw3-to-pdf | 3733 | ✅ |
| 8 | txt-to-epub | 3566 | ✅ |
| 9 | docx-to-epub | 3312 | ✅ |
| 10 | html-to-epub | 2606 | ✅ |

### B级页面 ≥1200字

| # | 页面 | 字数 | 状态 |
|---|------|------|------|
| 1 | rtf-to-epub | 3160 | ✅ 已修复重复文本bug |
| 2 | mobi-to-txt | 2294 | ✅ |
| 3 | epub-to-doc | 2193 | ✅ |
| 4 | epub-to-rtf | 2178 | ✅ |
| 5 | epub-to-png | 2090 | ✅ |
| 6 | epub-to-jpg | 1840 | ✅ |
| 7 | epub-to-word | 1838 | ✅ |
| 8 | doc-to-epub | 1826 | ✅ |
| 9 | epub-to-html | 1818 | ✅ |
| 10 | fb2-to-epub | 1805 | ✅ |
| 11 | azw3-to-mobi | 1751 | ✅ |
| 12 | djvu-to-pdf | 1764 | ✅ |
| 13 | mobi-to-pdf | 1703 | ✅ |
| 14 | cbr-to-pdf | 1729 | ✅ |

---

## P1 — 中高优先级

| # | 任务 | 状态 | 详情 |
|---|------|------|------|
| 1 | HowTo Schema | ✅ | ToolPageClient.tsx 已实现 @type: "HowTo" + HowToStep + HowToSupply + HowToTool |
| 2 | 内部链接矩阵 | ✅ | RelatedConversions 组件已实现，自动关联同源/同目标的转换页面 |

---

## P2 — 中优先级

| # | 任务 | 状态 | 详情 |
|---|------|------|------|
| 1 | GEO优化（AI摘要友好） | ❌ | 无 ai-summary / generative-AI 相关代码 |
| 2 | 格式科普页 /formats/[format] | ❌ | src/app/formats/ 目录不存在 |

---

## 额外建议（用户提出）

| # | 任务 | 状态 | 详情 |
|---|------|------|------|
| 1 | 视频教程（S级页面配Screen recording） | ❌ | 无视频组件 |
| 2 | 用户评价系统（"已帮助X人成功转换"） | ❌ | 无 testimonial / counter 组件 |
| 3 | 实时转换预览（上传后前后对比） | ❌ | 无 preupload-preview / file-compare 组件 |
| 4 | 批量转换说明（Pro功能引导） | ⚠️ | pricing/page.tsx 有Pro引导，但转换页面无专门的批量说明区域 |
| 5 | API文档（开发者入口） | ❌ | 无 swagger / redoc / OpenAPI 代码 |

---

## 修复记录

- [x] 2026-07-13: 补齐3个A级页面内容（epub-to-text, mobi-to-epub, epub-to-mobi）
- [x] 2026-07-13: 修复rtf-to-epub重复文本bug

