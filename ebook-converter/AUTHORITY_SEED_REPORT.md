# Authority 资产盘点（AUTHORITY_SEED_REPORT）· V2

> 生成：2026-10-07 17:24 · **V2 修订 · Seed List 已重建**

## 〇、V1 错误纠正

| V1 表述 | V2 实测 |
|---|---|
| 「Top20 仅 1 页」 | 全站 5 / **资产 4** |
| 「Top20 仅 3 页」 | 同上，V1 报告内自相矛盾 |
| 「guide 24 页全零曝光」 | **3 页有曝光** |
| Seed List 含 301/404/tag 页 | **已剔除**（见第二节）|

## 一、GSC 全 URL 分类（V2 新增，穷尽式）

| 分类 | URL 数 | 是否可作外链目标 | 明细 |
|---|---|---|---|
| 资产（en） | 25 | ✅ 可 | `/convert/azw3-to-epub` `/blog/why-convert-lit-to-epub` `/convert/mobi-to-epub` `/guide/mobi-to-epub-keep-formatting` `/convert/azw3-to-mobi` `/blog/azw3-vs-mobi` `/blog/ebook-formats-explained` `/blog/epub-to-azw3` `/blog/can-kindle-read-azw3` `/guide/calibre-vs-online-converter` `/convert/epub-to-azw3` `/blog/epub-to-mobi-guide` `/convert/epub-to-txt` `/convert/epub-to-doc` `/convert/epub-to-mobi` `/convert/epub-to-rtf` `/convert/epub-to-zip` `/convert/lit-to-epub` `/convert/pdf-to-epub` `/convert/rtf-to-epub` `/convert/docx-to-epub` `/blog/best-ebook-reader-apps` `/guide/epub-to-txt-extract` `/blog/mobi-to-epub` `/blog/mobi-to-kobo` |
| 资产（es 白名单） | 2 | ✅ 可 | `/es/blog/azw3-vs-mobi` `/es/guide/azw3-to-mobi-keep-formatting` |
| 301 重定向旧页 | 3 | ❌ 禁止 | `/blog/mobi-or-azw3-for-kindle` `/blog/how-to-convert-epub-to-mobi` `/convert/epub-to-docx` |
| 真 404（不在 CONTENT_MAP） | 1 | ❌ 禁止 | `/convert/epub-to-lrf` |
| tag 聚合页 | 1 | ❌ 禁止 | `/blog/tag/kindle` |
| 首页 | 2 | ❌ 禁止 | `/` `/es` |
| /es/ 但无西语译文 | 3 | ❌ 禁止 | `/es/blog/epub-to-azw3` `/es/blog/txt-to-epub` `/es/blog/tag/fb2` |
| **合计** | **37** | | |

🔒 **GUARD 5**：分类必须穷尽，残留 UNKNOWN 即 `process.exit(2)`。本轮 UNKNOWN=**0**。

### 1.1 归档页核实

| 项 | 值 |
|---|---|
| `_archived/` 中 slug 数 | 4 |
| GSC 中命中归档 slug 的 URL | `/blog/mobi-or-azw3-for-kindle`、`/blog/how-to-convert-epub-to-mobi` |

归档 slug 命中的 2 个 URL **已在第一节归入 301**（`middleware.ts` 有对应重定向），故已被剔除出 Seed List。


## 二、🔒 Authority Seed List（V2 重建，仅含可投外链的资产页）

### 纳入规则

| 规则 | 说明 |
|---|---|
| ✅ 纳入 | `asset`（en 资产）+ `asset_es`（sitemap es 白名单内的西语资产）|
| ❌ 剔除 | `redirect_301` / `not_found_404` / `tag` / `homepage` / `es_no_translation` |

**被剔除的有曝光 URL（10 个，全部不得作为外链目标）：**

| URL | 曝光 | Pos | 剔除原因 | 危害 |
|---|---|---|---|---|
| `/` | 380 | 86 | 首页 | 不属页面级外链范畴 |
| `/blog/mobi-or-azw3-for-kindle` | 20 | 45.8 | 301 重定向旧页 | 外链权重浪费在跳转链路上 |
| `/blog/how-to-convert-epub-to-mobi` | 2 | 47 | 301 重定向旧页 | 外链权重浪费在跳转链路上 |
| `/es/blog/epub-to-azw3` | 1 | 40 | /es/ 但无西语译文 | 英文兜底（英文正文 + lang=es），属 i18n 完整性问题（M5-2 补译文），非 spam 惩罚 |
| `/es/blog/txt-to-epub` | 3 | 74 | /es/ 但无西语译文 | 英文兜底（英文正文 + lang=es），属 i18n 完整性问题（M5-2 补译文），非 spam 惩罚 |
| `/convert/epub-to-docx` | 11 | 49.1 | 301 重定向旧页 | 外链权重浪费在跳转链路上 |
| `/es` | 1 | 73 | 首页 | 不属页面级外链范畴 |
| `/convert/epub-to-lrf` | 1 | 15 | 真 404（不在 CONTENT_MAP） | **position 好看但页面不存在**（如 epub-to-lrf pos 15.0） |
| `/blog/tag/kindle` | 4 | 52.8 | tag 聚合页 | 聚合页非内容页，权重不传递到具体页 |
| `/es/blog/tag/fb2` | 3 | 30.7 | /es/ 但无西语译文 | 英文兜底（英文正文 + lang=es），属 i18n 完整性问题（M5-2 补译文），非 spam 惩罚 |

### 2.1 Seed List（27 个资产页，按曝光降序）

| # | URL | 目录 | 分类 | Impressions | Position | 桶 | Title |
|---|---|---|---|---|---|---|---|
| 1 | `/convert/mobi-to-epub` | convert | asset | **227** | 70.3 | Top51+ | Convert MOBI to EPUB — Free Online Tool |
| 2 | `/convert/epub-to-doc` | convert | asset | **131** | 51.2 | Top51+ | Free EPUB to DOC Converter — Extract Text for Lega… |
| 3 | `/guide/mobi-to-epub-keep-formatting` | guide | asset | **93** | 81.2 | Top51+ | MOBI to EPUB: Keep Formatting and Read Your Kindle… |
| 4 | `/convert/epub-to-txt` | convert | asset | **72** | 62.8 | Top51+ | Free EPUB to TXT Converter — Extract Clean Plain T… |
| 5 | `/es/blog/azw3-vs-mobi` | guide/blog(es) | asset_es | **69** | 13.7 | Top20 | (archived / non-asset) |
| 6 | `/convert/epub-to-azw3` | convert | asset | **64** | 53.9 | Top51+ | Free EPUB to AZW3 Converter — No Sign-up |
| 7 | `/blog/ebook-formats-explained` | blog | asset | **63** | 64.5 | Top51+ | EPUB vs AZW3 vs MOBI: Which Ebook Format Should Yo… |
| 8 | `/blog/epub-to-azw3` | blog | asset | **54** | 46.1 | Top31-50 | Free EPUB to AZW3: Get Your Ebooks Onto Kindle Nat… |
| 9 | `/blog/epub-to-mobi-guide` | blog | asset | **49** | 72.1 | Top51+ | EPUB to MOBI: Still Needed? Send-to-Kindle & AZW3 |
| 10 | `/convert/epub-to-zip` | convert | asset | **45** | 14.8 | Top20 | Free EPUB to ZIP Converter — Extract XHTML, CSS & … |
| 11 | `/guide/calibre-vs-online-converter` | guide | asset | **43** | 48.7 | Top31-50 | Calibre vs Online Converters: Which Should You Act… |
| 12 | `/blog/why-convert-lit-to-epub` | blog | asset | **26** | 29.8 | Top21-30 | Why Convert LIT to EPUB (And How to Do It on BookC… |
| 13 | `/convert/azw3-to-mobi` | convert | asset | **21** | 56.4 | Top51+ | AZW3 to MOBI: Free Downgrade for Old Kindles (pre-… |
| 14 | `/blog/azw3-vs-mobi` | blog | asset | **21** | 42.8 | Top31-50 | MOBI vs AZW3 & AZW3 vs MOBI — Which Kindle Format … |
| 15 | `/blog/can-kindle-read-azw3` | blog | asset | **21** | 18 | Top20 | Can Kindle Read AZW3? Yes — Every Model Since 2015 |
| 16 | `/convert/lit-to-epub` | convert | asset | **19** | 34.8 | Top31-50 | Free LIT to EPUB Converter — Rescue Old Microsoft … |
| 17 | `/convert/docx-to-epub` | convert | asset | **16** | 82.1 | Top51+ | Free DOCX to EPUB Converter — No Sign-up |
| 18 | `/convert/azw3-to-epub` | convert | asset | **13** | 62.9 | Top51+ | Free AZW3 to EPUB Converter — No Sign-up |
| 19 | `/convert/rtf-to-epub` | convert | asset | **11** | 45.4 | Top31-50 | Free RTF to EPUB Converter — No Sign-up |
| 20 | `/convert/epub-to-mobi` | convert | asset | **8** | 74.8 | Top51+ | Convert EPUB to MOBI Online — Free Converter, No S… |
| 21 | `/blog/best-ebook-reader-apps` | blog | asset | **7** | 59.6 | Top51+ | Best Free Ebook Reader Apps for Every Device (2026… |
| 22 | `/blog/mobi-to-epub` | blog | asset | **7** | 66.6 | Top51+ | How to Convert MOBI to EPUB (And Why You'd Want To… |
| 23 | `/convert/epub-to-rtf` | convert | asset | **3** | 43 | Top31-50 | Free EPUB to RTF Converter — No Sign-up |
| 24 | `/convert/pdf-to-epub` | convert | asset | **3** | 58.7 | Top51+ | Free PDF to EPUB Converter — No Sign-up |
| 25 | `/es/guide/azw3-to-mobi-keep-formatting` | guide/blog(es) | asset_es | **1** | 58 | Top51+ | (archived / non-asset) |
| 26 | `/guide/epub-to-txt-extract` | guide | asset | **1** | 71 | Top51+ | EPUB to TXT: Extract Plain Text Without Losing You… |
| 27 | `/blog/mobi-to-kobo` | blog | asset | **1** | 19 | Top20 | MOBI to Kobo: How to Read Your MOBI Books on a Kob… |

### 2.2 排名分桶（资产口径）

| 桶 | URL 数 | 曝光合计 |
|---|---|---|
| Top20 | 4 | 136 |
| Top21-30 | 1 | 26 |
| Top31-50 | 6 | 151 |
| Top51+ | 16 | 776 |
| 零曝光 | 0 | 0 |
| **合计** | **27** | **1089** |

### 2.3 Top20 资产页（4 个）

| # | URL | Pos | 曝光 | 目录 |
|---|---|---|---|---|
| 1 | `/es/blog/azw3-vs-mobi` | **13.7** | 69 | — |
| 2 | `/convert/epub-to-zip` | **14.8** | 45 | convert |
| 3 | `/blog/can-kindle-read-azw3` | **18** | 21 | blog |
| 4 | `/blog/mobi-to-kobo` | **19** | 1 | blog |

⚠️ **注意曝光量级**：4 个 Top20 资产页曝光合计仅 **136**。pos 好 ≠ 量级够。


## 三、外链投放优先级（已剔除 301/404/tag）

| 优先 | 目标 | 曝光 | Pos | 依据 |
|---|---|---|---|---|
| 1 | `/convert/mobi-to-epub` | 227 | 70.3 | 曝光基数最高 |
| 2 | `/convert/epub-to-doc` | 131 | 51.2 | 曝光基数第 2 |
| 3 | `/guide/mobi-to-epub-keep-formatting` | 93 | 81.2 | 曝光基数第 3 |
| 4 | `/convert/epub-to-txt` | 72 | 62.8 | 曝光基数第 4 |
| — | guide 零曝光 21 页 | 0 | — | ⚠️ 等 Index Coverage |
| ❌ | 301 / 404 / tag / homepage / es_无译文 | — | — | **禁止投放**（V1 曾误列）|

## 四、Evidence Validation Gate（本报告）

| # | 结论 | 表格可反查的数 | 反查方式 | 状态 |
|---|---|---|---|---|
| GSC URL 合计 = 37 | 37 | Σ 表一分类数 | ✅ PASS |
| 分类穷尽 UNKNOWN = 0 | 0 | GUARD 5 硬失败 | ✅ PASS |
| Seed List = 27 | 27 | 数表 2.1 行数 | ✅ PASS |
| 被剔除有曝光 URL = 10 | 10 | 数表二行数 | ✅ PASS |
| Seed + 剔除 = 有曝光 URL 37 | 37 | 应 = 37 | ✅ PASS |
| 资产 Top20 = 4 | 4 | 数表 2.3 行数 | ✅ PASS |
| Seed List 违规页数 0（不含 301/404/tag/homepage） | 0 | 逐行检查 urlClass | ✅ PASS |
| 归档 URL 2 个已剔出 Seed List（剩 0） | 0 | 归档 URL 均不在 seedList 中 | ✅ PASS |

> **门禁：PASS（8/8）**
