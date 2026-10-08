# Authority Seed 方案 V2（AUTHORITY_SEED_PLAN_V2）

> 阶段：**DESIGN ONLY** · 基础 = 27 个有效资产（已剔除 301/404/tag/homepage/es_无译文）

## 〇、准入集合（27 个）

| 分类 | 规则 |
|---|---|
| ✅ 纳入 | GSC 有曝光 且 urlClass = asset 或 asset_es |
| ❌ 剔除 | redirect_301（3）/ not_found_404（1）/ tag（1）/ homepage（2）/ es_no_translation（3）|
| 合计剔除 | 10 个 URL |

## 一、Tier 分级（27 个）

| Tier | 定义 | 页数 | 曝光合计 |
|---|---|---|---|
| **A** | pos ≤ 20 | 4 | 136 |
| **B** | Top21–50 | 7 | 177 |
| **C** | Top51+ | 16 | 776 |
| **D** | 有曝光但无稳定排名（pos 数据不足）| 0 | 0 |
| **合计** | | **27** | **1089** |

### Tier A（4 个）

| # | URL | 曝光 | Pos | 目录 |
|---|---|---|---|---|
| 1 | `/es/blog/azw3-vs-mobi` | 69 | **13.7** | — |
| 2 | `/convert/epub-to-zip` | 45 | **14.8** | convert |
| 3 | `/blog/can-kindle-read-azw3` | 21 | **18** | blog |
| 4 | `/blog/mobi-to-kobo` | 1 | **19** | blog |

### Tier B（7 个）

| # | URL | 曝光 | Pos | 目录 |
|---|---|---|---|---|
| 1 | `/blog/why-convert-lit-to-epub` | 26 | 29.8 | blog |
| 2 | `/convert/lit-to-epub` | 19 | 34.8 | convert |
| 3 | `/blog/azw3-vs-mobi` | 21 | 42.8 | blog |
| 4 | `/convert/epub-to-rtf` | 3 | 43 | convert |
| 5 | `/convert/rtf-to-epub` | 11 | 45.4 | convert |
| 6 | `/blog/epub-to-azw3` | 54 | 46.1 | blog |
| 7 | `/guide/calibre-vs-online-converter` | 43 | 48.7 | guide |

### Tier C（16 个）

| # | URL | 曝光 | Pos | 目录 |
|---|---|---|---|---|
| 1 | `/convert/epub-to-doc` | 131 | 51.2 | convert |
| 2 | `/convert/epub-to-azw3` | 64 | 53.9 | convert |
| 3 | `/convert/azw3-to-mobi` | 21 | 56.4 | convert |
| 4 | `/es/guide/azw3-to-mobi-keep-formatting` | 1 | 58 | — |
| 5 | `/convert/pdf-to-epub` | 3 | 58.7 | convert |
| 6 | `/blog/best-ebook-reader-apps` | 7 | 59.6 | blog |
| 7 | `/convert/epub-to-txt` | 72 | 62.8 | convert |
| 8 | `/convert/azw3-to-epub` | 13 | 62.9 | convert |
| 9 | `/blog/ebook-formats-explained` | 63 | 64.5 | blog |
| 10 | `/blog/mobi-to-epub` | 7 | 66.6 | blog |
| 11 | `/convert/mobi-to-epub` | 227 | 70.3 | convert |
| 12 | `/guide/epub-to-txt-extract` | 1 | 71 | guide |
| 13 | `/blog/epub-to-mobi-guide` | 49 | 72.1 | blog |
| 14 | `/convert/epub-to-mobi` | 8 | 74.8 | convert |
| 15 | `/guide/mobi-to-epub-keep-formatting` | 93 | 81.2 | guide |
| 16 | `/convert/docx-to-epub` | 16 | 82.1 | convert |

### Tier D（0 个）

| # | URL | 曝光 | 目录 |
|---|---|---|

## 二、🔴 特别标记：3 个有曝光的 Guide

**不因页面类型排除。** 依据：A6 修正后实测它们有真实曝光。

| URL | 曝光 | Pos | 全站排名 | 排名依据 |
|---|---|---|---|---|
| `/guide/calibre-vs-online-converter` | **43** | 48.7 | 第 **16** / 37 | 全站 37 个有 position 的 URL 排序 |
| `/guide/epub-to-txt-extract` | **1** | 71 | 第 **30** / 37 | 全站 37 个有 position 的 URL 排序 |
| `/guide/mobi-to-epub-keep-formatting` | **93** | 81.2 | 第 **35** / 37 | 全站 37 个有 position 的 URL 排序 |

| Guide | 曝光 | pos | 建议 |
|---|---|---|---|
| `/guide/calibre-vs-online-converter` | 43 | 48.7 | 中高 — 43 曝光 pos 50.7；品牌词相关，转化路径直接 |
| `/guide/epub-to-txt-extract` | 1 | 71 | 低 — 仅 1 曝光，需先确认是否值得投 |
| `/guide/mobi-to-epub-keep-formatting` | 93 | 81.2 | 🔴 **最高优先级** — 93 曝光全站第 4；且与 /convert/mobi-to-epub（227 曝光）形成"工具 vs 知识"分工的天然样本 |

## 三、外链投放顺序（若 U5 外链基线数据到位）

| 顺位 | 目标 | 依据 |
|---|---|---|
| 1 | `/es/blog/azw3-vs-mobi` | Top20（pos 13.7）|
| 2 | `/convert/epub-to-zip` | Top20（pos 14.8）|
| 3 | `/blog/can-kindle-read-azw3` | Top20（pos 18）|
| 4 | `/blog/mobi-to-kobo` | Top20（pos 19）|
| 5 | `/guide/mobi-to-epub-keep-formatting` | Guide 实测 93 曝光，类型已验证 |
| 6 | `/guide/calibre-vs-online-converter` | Guide 实测 43 曝光，类型已验证 |
| 7 | `/guide/epub-to-txt-extract` | Guide 实测 1 曝光，类型已验证 |
| 8 | `/convert/mobi-to-epub` | 曝光 227（基数大）|
| 9 | `/convert/epub-to-doc` | 曝光 131（基数大）|
| 10 | `/convert/epub-to-txt` | 曝光 72（基数大）|

⚠️ **本表在拿到外链基线前不可执行**。项目内无外链数据（U5 UNKNOWN）⇒ 无法判断外链的边际收益。
