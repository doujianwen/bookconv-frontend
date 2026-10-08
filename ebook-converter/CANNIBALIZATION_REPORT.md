# 搜索意图冲突审计（CANNIBALIZATION_REPORT）· V2

> 生成：2026-10-07 17:24 · **V2 修订** · 数据源：`_wb_tmp/_v2_data.json`

## 〇、V1 错误纠正

| V1 表述 | V2 实测 |
|---|---|
| 「重叠 9 组」（引 MASTER_PLAN F7）| **12 组**（全量 122 页扫描，含 blog↔guide 无 convert 的组）|
| 「guide 24 页全部零曝光」 | **3 页有曝光**：`/guide/calibre-vs-online-converter`(43)、`/guide/epub-to-txt-extract`(1)、`/guide/mobi-to-epub-keep-formatting`(93) |

## 一、重叠组全表（12 组）

| # | Cluster | Convert | Blog | Guide | 类型 | GSC 曝光（各页）|
|---|---|---|---|---|---|---|
| 1 | `azw3-to-mobi` | `/convert/azw3-to-mobi` | `/blog/azw3-to-mobi` | — | C+B | C:azw3-to-mobi=21 B:azw3-to-mobi=0 |
| 2 | `cbr-to-pdf` | `/convert/cbr-to-pdf` | `/blog/cbr-to-pdf` | `/guide/cbr-to-pdf` | **C+B+G** | C:cbr-to-pdf=0 B:cbr-to-pdf=0 G:cbr-to-pdf=0 |
| 3 | `djvu-to-pdf` | `/convert/djvu-to-pdf` | `/blog/djvu-to-pdf` | `/guide/djvu-to-pdf` | **C+B+G** | C:djvu-to-pdf=0 B:djvu-to-pdf=0 G:djvu-to-pdf=0 |
| 4 | `epub-to-azw3` | `/convert/epub-to-azw3` | `/blog/epub-to-azw3` | — | C+B | C:epub-to-azw3=64 B:epub-to-azw3=54 |
| 5 | `epub-to-mobi` | `/convert/epub-to-mobi` | `/blog/epub-to-mobi` | — | C+B | C:epub-to-mobi=8 B:epub-to-mobi=0 |
| 6 | `epub-to-word` | `/convert/epub-to-word` | `/blog/epub-to-word` | — | C+B | C:epub-to-word=0 B:epub-to-word=0 |
| 7 | `fb2-to-epub` | `/convert/fb2-to-epub` | `/blog/fb2-to-epub` | — | C+B | C:fb2-to-epub=0 B:fb2-to-epub=0 |
| 8 | `mobi-to-epub` | `/convert/mobi-to-epub` | `/blog/mobi-to-epub` | — | C+B | C:mobi-to-epub=227 B:mobi-to-epub=7 |
| 9 | `txt-to-epub` | `/convert/txt-to-epub` | `/blog/txt-to-epub` | — | C+B | C:txt-to-epub=0 B:txt-to-epub=0 |
| 10 | `azw3-vs-mobi` | — | `/blog/azw3-vs-mobi` | `/guide/azw3-vs-mobi` | C+B | B:azw3-vs-mobi=21 G:azw3-vs-mobi=0 |
| 11 | `batch-converter` | — | `/blog/batch-converter` | `/guide/batch-converter` | C+B | B:batch-converter=0 G:batch-converter=0 |
| 12 | `epub-vs-mobi` | — | `/blog/epub-vs-mobi` | `/guide/epub-vs-mobi` | C+B | B:epub-vs-mobi=0 G:epub-vs-mobi=0 |

### 1.1 三目录全撞（2 组，必改）

| 组 | convert | blog | guide |
|---|---|---|---|
| `cbr-to-pdf` | Free CBR to PDF Converter — No Sign-up | CBR to PDF: Convert Comic Books for Printing and Any Device | CBR to PDF: Read Your Comics on Any Device |
| `djvu-to-pdf` | Free DJVU to PDF Converter — No Sign-up | DjVu to PDF: How to Convert Scanned Archives (Step-by-Step) | DJVU to PDF: Convert Scanned Books to a Readable PDF |

### 1.2 有 GSC 曝光的重叠组（实测优先）

| Cluster | 有曝光的页 | 各页 pos | 目录 |
|---|---|---|---|
| `azw3-to-mobi` | `/convert/azw3-to-mobi` | 56.4 | convert |
| `epub-to-azw3` | `/convert/epub-to-azw3`、`/blog/epub-to-azw3` | 53.9 / 46.1 | convert+blog |
| `epub-to-mobi` | `/convert/epub-to-mobi` | 74.8 | convert |
| `mobi-to-epub` | `/convert/mobi-to-epub`、`/blog/mobi-to-epub` | 70.3 / 66.6 | convert+blog |
| `azw3-vs-mobi` | `/blog/azw3-vs-mobi` | 42.8 | blog |

## 二、判据有效性（自检）

| 检查 | 结果 |
|---|---|
| 同页自比 Jaccard | **1.000** ✅ 判据有效 |
| TRUE cannibalization（shared query + Jaccard>0.4）| **0**（沿用 V1 实测，最高 Jaccard 0.026）|

⚠️ Jaccard 结论沿用 V1 的 `_audit_cannib.json`（该判据自检 1.000 通过，本轮未变更输入）。

## 三、分工契约

| 目录 | 意图 | Title 必须含 | Title 禁止含 |
|---|---|---|---|
| **Convert** | 工具 | `{SRC} to {TGT} Converter`、`Free`、`Online` | `How to`、`vs`、`Which` |
| **Blog** | 教程 | `How to`、结果状语 | `Converter` 作主词、`Free Online Tool` |
| **Guide** | 知识 | `vs` / `Format` / `Which` / `Explained` | `Convert` 作主词 |

## 四、Evidence Validation Gate（本报告）

| # | 结论 | 表格可反查的数 | 反查方式 | 状态 |
|---|---|---|---|---|
| 重叠组 = 12 | 12 | 数表一行数 | ✅ PASS |
| 三目录全撞 = 2 | 2 | 数表一「C+B+G」行 | ✅ PASS |
| 有曝光的重叠组 = 5 | 5 | 数表一.2 行数 | ✅ PASS |
| guide 有曝光页 = 3 | 3 | = guidePages 中 imp>0 | ✅ PASS |

> **门禁：PASS（4/4）**
