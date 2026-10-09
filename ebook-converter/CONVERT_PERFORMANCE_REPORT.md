# Convert 页面 Google 真实表现盘点（CONVERT_PERFORMANCE_REPORT）· V2

> 生成：2026-10-07 17:24 · **V2 修订** · 数据源：`_wb_tmp/_v2_data.json`
> 唯一 GSC 源：`_wb_tmp/gsc-qpage.json`（query×page，2026-07-04→10-02，91 天）

## 〇、V1 错误纠正

| V1 表述 | V2 实测 | 处置 |
|---|---|---|
| 「Top20 仅 1 页（`/convert/epub-to-zip`）」 | **全站 5 个，资产 4 个** | 已重算，见第三节 |
| 「11 页中仅 1 页在可见区」 | **仍成立**（convert 页 pos≤20 共 1 个）| 保留 |

## 一、统一表现表（31 页，按曝光降序）

| URL | Impressions | Clicks | Position | query 数 | Tier |
|---|---|---|---|---|---|
| `/convert/mobi-to-epub` | 227 | 0 | 70.3 | 61 | **A** |
| `/convert/epub-to-doc` | 131 | 0 | 51.2 | 24 | **A** |
| `/convert/epub-to-txt` | 72 | 0 | 62.8 | 21 | **A** |
| `/convert/epub-to-azw3` | 64 | 0 | 53.9 | 27 | **A** |
| `/convert/epub-to-zip` | 45 | 0 | 14.8 | 6 | **A** |
| `/convert/azw3-to-mobi` | 21 | 0 | 56.4 | 3 | **A** |
| `/convert/lit-to-epub` | 19 | 0 | 34.8 | 6 | **B** |
| `/convert/docx-to-epub` | 16 | 0 | 82.1 | 2 | **B** |
| `/convert/azw3-to-epub` | 13 | 0 | 62.9 | 8 | **B** |
| `/convert/rtf-to-epub` | 11 | 0 | 45.4 | 5 | **B** |
| `/convert/epub-to-mobi` | 8 | 0 | 74.8 | 8 | **B** |
| `/convert/epub-to-rtf` | 3 | 0 | 43 | 3 | **C** |
| `/convert/pdf-to-epub` | 3 | 0 | 58.7 | 3 | **C** |
| `/convert/azw-to-mobi` | 0 | 0 | — | 0 | **D** |
| `/convert/azw3-to-pdf` | 0 | 0 | — | 0 | **D** |
| `/convert/cbr-to-pdf` | 0 | 0 | — | 0 | **D** |
| `/convert/chm-to-mobi` | 0 | 0 | — | 0 | **D** |
| `/convert/djvu-to-pdf` | 0 | 0 | — | 0 | **D** |
| `/convert/doc-to-epub` | 0 | 0 | — | 0 | **D** |
| `/convert/epub-to-html` | 0 | 0 | — | 0 | **D** |
| `/convert/epub-to-jpg` | 0 | 0 | — | 0 | **D** |
| `/convert/epub-to-pdf` | 0 | 0 | — | 0 | **D** |
| `/convert/epub-to-png` | 0 | 0 | — | 0 | **D** |
| `/convert/epub-to-word` | 0 | 0 | — | 0 | **D** |
| `/convert/fb2-to-epub` | 0 | 0 | — | 0 | **D** |
| `/convert/html-to-epub` | 0 | 0 | — | 0 | **D** |
| `/convert/lit-to-mobi` | 0 | 0 | — | 0 | **D** |
| `/convert/mobi-to-azw3` | 0 | 0 | — | 0 | **D** |
| `/convert/mobi-to-pdf` | 0 | 0 | — | 0 | **D** |
| `/convert/mobi-to-txt` | 0 | 0 | — | 0 | **D** |
| `/convert/txt-to-epub` | 0 | 0 | — | 0 | **D** |
| **合计** | **633** | **0** | — | — | — |

## 二、曝光分层（由数据计算）

| Tier | 定义 | 页数 | 占比 | 曝光合计 | 点击 |
|---|---|---|---|---|---|
| **A** | 曝光 > 20 | 6 | 19.4% | 560 | 0 |
| **B** | 曝光 5–20 | 5 | 16.1% | 67 | 0 |
| **C** | 曝光 1–5 | 2 | 6.5% | 6 | 0 |
| **D** | 曝光 = 0 | 18 | 58.1% | 0 | 0 |

## 三、🔴 Top20 统计（V1 严重错误，此处重算）

V1 写「Top20 仅 1 页」且「/convert/epub-to-zip 是唯一 Top20」。**实测全站 pos≤20 共 5 个**：

| # | URL | Pos | 曝光 | 分类 | 是否可作外链目标 |
|---|---|---|---|---|---|
| 1 | `/es/blog/azw3-vs-mobi` | **13.7** | 69 | asset_es | ✅ 可 |
| 2 | `/convert/epub-to-zip` | **14.8** | 45 | asset | ✅ 可 |
| 3 | `/convert/epub-to-lrf` | **15** | 1 | 404 | ⚠️ 404 |
| 4 | `/blog/can-kindle-read-azw3` | **18** | 21 | asset | ✅ 可 |
| 5 | `/blog/mobi-to-kobo` | **19** | 1 | asset | ✅ 可 |

**资产口径 Top20（剔除 301/404/tag/homepage/es_无译文）：4 个**

| # | URL | Pos | 曝光 | 目录 |
|---|---|---|---|---|
| 1 | `/es/blog/azw3-vs-mobi` | 13.7 | 69 | — |
| 2 | `/convert/epub-to-zip` | 14.8 | 45 | convert |
| 3 | `/blog/can-kindle-read-azw3` | 18 | 21 | blog |
| 4 | `/blog/mobi-to-kobo` | 19 | 1 | blog |

🔴 **两条必须记住的教训**

| 观察 | 含义 |
|---|---|
| `/convert/epub-to-lrf` pos 15.0（Top20 第 3）| **它不在 CONTENT_MAP ⇒ `dynamicParams=false` ⇒ 真 404**。position 好看 ≠ 页面存在 |
| `/es/blog/azw3-vs-mobi` pos **13.7 是全站最佳** | **西语页排第一**，与项目记忆「/es 内容信号遭 Spam Update」的认知**冲突**，需人工核实该页当前状态 |
| 5 个 Top20 曝光合计仅 137 | pos 好 ≠ 量级够 |

## 四、🔴 重点核实：「52% Convert 页零曝光」

| 口径 | 分母 | 零曝光 | 占比 |
|---|---|---|---|
| 用户所述 | — | — | 52% |
| **V2 实测（31 页 / 91 天）** | 31 | 18 | **58.1%** |
| 差异 | | | **+6.1pp** |

**结论：52% 不成立，V2 实测 58.1%（18/31）。**

## 五、零曝光页清单（18 页）

| # | URL | 标题字数 | desc 字数 | desc 来源 |
|---|---|---|---|---|
| 1 | `/convert/azw-to-mobi` | 39 | 126 | metaDescription |
| 2 | `/convert/azw3-to-pdf` | 39 | 151 | metaDescription |
| 3 | `/convert/cbr-to-pdf` | 38 | 139 | metaDescription |
| 4 | `/convert/chm-to-mobi` | 39 | 126 | metaDescription |
| 5 | `/convert/djvu-to-pdf` | 39 | 151 | metaDescription |
| 6 | `/convert/doc-to-epub` | 39 | 150 | metaDescription |
| 7 | `/convert/epub-to-html` | 40 | 140 | metaDescription |
| 8 | `/convert/epub-to-jpg` | 39 | 145 | metaDescription |
| 9 | `/convert/epub-to-pdf` | 39 | 149 | metaDescription |
| 10 | `/convert/epub-to-png` | 39 | 148 | metaDescription |
| 11 | `/convert/epub-to-word` | 40 | 144 | metaDescription |
| 12 | `/convert/fb2-to-epub` | 39 | 143 | metaDescription |
| 13 | `/convert/html-to-epub` | 40 | 140 | metaDescription |
| 14 | `/convert/lit-to-mobi` | 39 | 150 | metaDescription |
| 15 | `/convert/mobi-to-azw3` | 45 | 144 | metaDescription |
| 16 | `/convert/mobi-to-pdf` | 39 | 148 | metaDescription |
| 17 | `/convert/mobi-to-txt` | 21 | 155 | metaDescription |
| 18 | `/convert/txt-to-epub` | 39 | 149 | metaDescription |

⚠️ **归因仍不可判定**：GSC 曝光数据只记录"被展示过"。未收录 / 收录但不值展示 / 无搜索需求，三者在本数据中表现完全相同 ⇒ 需 Index Coverage（UNKNOWN）。

## 六、Evidence Validation Gate（本报告）

| # | 结论 | 表格可反查的数 | 反查方式 | 状态 |
|---|---|---|---|---|
| Convert 页数 = 31 | 31 | 数表一 | ✅ PASS |
| 总曝光 = 633 | 633 | Σ 表一曝光列 | ✅ PASS |
| Tier A/B/C/D = 6/5/2/18（合计 31） | 31 | Σ = 页数 31 | ✅ PASS |
| 零曝光 = 18（58.1%） | 18 | = Tier D，且 = 表一 imp=0 行数 | ✅ PASS |
| 全站 Top20 = 5 | 5 | 数表三行数（pos≤20） | ✅ PASS |
| 资产 Top20 = 4 | 4 | 表三下半段行数 | ✅ PASS |
| convert 页 pos≤20 = 1 | 1 | 数表一 pos≤20 行 | ✅ PASS |

> **门禁：PASS（7/7）**
