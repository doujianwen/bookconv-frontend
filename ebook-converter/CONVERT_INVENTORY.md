# Convert 页面全量清单（CONVERT_INVENTORY）· V2 修订版

> 生成：2026-10-07 17:24 · **V2 修订** · 数据源：`_wb_tmp/_v2_data.json`（6 道守卫全部 PASS）
> 修订依据：`SELF_AUDIT_REPORT.md`
> 模式：READ ONLY（未修改任何页面）

## 〇、本版修订摘要

| 项 | V1 | V2 |
|---|---|---|
| description 判据 | 只匹配静态 `export const metaDescription` ⇒ 报「91 页为空」 | **复刻运行时表达式**（`content.intro` / `problem` / `metaDescription`）⇒ 0 页为空 |
| guide 曝光结论 | 硬编码「24 页全零」（与自身表格矛盾） | **由数据生成** ⇒ 3 页有曝光 |
| Top20 统计 | 「仅 1 页」 | **全站 5 / 资产 4** |
| 汇总表 | 手工填写 | 全部由数据层生成 + Evidence Validation Gate |

## 一、总览（全部由数据层计算）

| 指标 | 数值 | 计算方式 |
|---|---|---|
| Convert 页面总数 | **31** | kind=convert 的 live 页 |
| 可索引页面数 | **31** | `dynamicParams=false` ⇒ 全部静态生成 |
| Sitemap 收录（en / es） | 31 / 3 | `sitemap.ts:248` 全量 / `ESP_CONVERT_SLUGS` 3 页 |
| Canonical | 31/31 显式 | `buildAlternates`，无 /en 硬编码 |
| Schema 类型数 | 4 | BreadcrumbList / HowTo / WebPage / FAQPage |
| Convert 总曝光 | **633** | ΣGSC impressions |
| Convert 总点击 | **0** | ΣGSC clicks |
| Convert 页有曝光 | **13 / 31** | imp>0 |

## 二、完整清单（31 页，按曝光降序）

| # | URL | Source | Target | Level | 标题字数 | desc 字数 | desc 来源 | 曝光 | Pos | 桶 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `/convert/mobi-to-epub` | MOBI | EPUB | — | 39 | 149 | metaDescription | 227 | 70.3 | Top51+ |
| 2 | `/convert/epub-to-doc` | EPUB | DOC | — | 65 | 178 | metaDescription | 131 | 51.2 | Top51+ |
| 3 | `/convert/epub-to-txt` | EPUB | TXT | — | 64 | 159 | metaDescription | 72 | 62.8 | Top51+ |
| 4 | `/convert/epub-to-azw3` | EPUB | AZW3 | — | 40 | 145 | metaDescription | 64 | 53.9 | Top51+ |
| 5 | `/convert/epub-to-zip` | EPUB | ZIP | — | 67 | 170 | metaDescription | 45 | 14.8 | Top20 |
| 6 | `/convert/azw3-to-mobi` | AZW3 | MOBI | — | 55 | 146 | metaDescription | 21 | 56.4 | Top51+ |
| 7 | `/convert/lit-to-epub` | LIT | EPUB | — | 62 | 179 | metaDescription | 19 | 34.8 | Top31-50 |
| 8 | `/convert/docx-to-epub` | DOCX | EPUB | — | 40 | 143 | metaDescription | 16 | 82.1 | Top51+ |
| 9 | `/convert/azw3-to-epub` | AZW3 | EPUB | — | 40 | 149 | metaDescription | 13 | 62.9 | Top51+ |
| 10 | `/convert/rtf-to-epub` | RTF | EPUB | — | 39 | 140 | metaDescription | 11 | 45.4 | Top31-50 |
| 11 | `/convert/epub-to-mobi` | EPUB | MOBI | — | 56 | 129 | metaDescription | 8 | 74.8 | Top51+ |
| 12 | `/convert/epub-to-rtf` | EPUB | RTF | — | 39 | 136 | metaDescription | 3 | 43 | Top31-50 |
| 13 | `/convert/pdf-to-epub` | PDF | EPUB | — | 39 | 152 | metaDescription | 3 | 58.7 | Top51+ |
| 14 | `/convert/azw-to-mobi` | AZW | MOBI | — | 39 | 126 | metaDescription | — | — | — |
| 15 | `/convert/azw3-to-pdf` | AZW3 | PDF | — | 39 | 151 | metaDescription | — | — | — |
| 16 | `/convert/cbr-to-pdf` | CBR | PDF | — | 38 | 139 | metaDescription | — | — | — |
| 17 | `/convert/chm-to-mobi` | CHM | MOBI | — | 39 | 126 | metaDescription | — | — | — |
| 18 | `/convert/djvu-to-pdf` | DJVU | PDF | — | 39 | 151 | metaDescription | — | — | — |
| 19 | `/convert/doc-to-epub` | DOC | EPUB | — | 39 | 150 | metaDescription | — | — | — |
| 20 | `/convert/epub-to-html` | EPUB | HTML | — | 40 | 140 | metaDescription | — | — | — |
| 21 | `/convert/epub-to-jpg` | EPUB | JPG | — | 39 | 145 | metaDescription | — | — | — |
| 22 | `/convert/epub-to-pdf` | EPUB | PDF | — | 39 | 149 | metaDescription | — | — | — |
| 23 | `/convert/epub-to-png` | EPUB | PNG | — | 39 | 148 | metaDescription | — | — | — |
| 24 | `/convert/epub-to-word` | EPUB | WORD | — | 40 | 144 | metaDescription | — | — | — |
| 25 | `/convert/fb2-to-epub` | FB2 | EPUB | — | 39 | 143 | metaDescription | — | — | — |
| 26 | `/convert/html-to-epub` | HTML | EPUB | — | 40 | 140 | metaDescription | — | — | — |
| 27 | `/convert/lit-to-mobi` | LIT | MOBI | — | 39 | 150 | metaDescription | — | — | — |
| 28 | `/convert/mobi-to-azw3` | MOBI | AZW3 | — | 45 | 144 | metaDescription | — | — | — |
| 29 | `/convert/mobi-to-pdf` | MOBI | PDF | — | 39 | 148 | metaDescription | — | — | — |
| 30 | `/convert/mobi-to-txt` | MOBI | TXT | — | 21 | 155 | metaDescription | — | — | — |
| 31 | `/convert/txt-to-epub` | TXT | EPUB | — | 39 | 149 | metaDescription | — | — | — |

## 三、Evidence Validation Gate（本报告）

| # | 结论 | 表格可反查的数 | 反查方式 | 状态 |
|---|---|---|---|---|
| Convert 页面总数 = 31 | 31 | 数表格行数 | ✅ PASS |
| Convert 总曝光 = 633 | 633 | Σ 表中曝光列 | ✅ PASS |
| Convert 总点击 = 0 | 0 | Σ 表中点击（GSC 原始） | ✅ PASS |
| 有曝光页数 = 13 | 13 | 数 imp>0 的行 | ✅ PASS |
| Tier A = 6 | 6 | imp>20 的行 | ✅ PASS |
| Tier D = 18 | 18 | imp=0 的行 | ✅ PASS |

> **本报告门禁：PASS（6/6）**
