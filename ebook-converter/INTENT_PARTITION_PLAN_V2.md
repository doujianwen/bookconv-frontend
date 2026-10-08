# Intent Partition 方案 V2（INTENT_PARTITION_PLAN_V2）

> 阶段：**DESIGN ONLY** · 数据源：`_wb_tmp/_v2_data.json`（**不以"9 组"为假设，重新全量计算**）

## 〇、实测簇数（不假设 9 组）

全量扫描 122 页（31 convert / 66 blog / 24 guide），按**完全同名 slug 跨目录**判定：

> **12 组**（V1 旧口径称"9 组"，是"仅含 convert 页"的子集）

| 类型 | 组数 | 判定 |
|---|---|---|
| Convert + Blog + Guide | **2** | 🔴 最高风险：3 页 title 语义近乎相同 |
| Convert + Blog | 7 | 需分工 |
| Convert + Guide | 0 | 需分工 |
| Blog + Guide（无 convert）| 3 | 同属风险，一并处理 |
| Blog only 跨目录 | 0 | — |
| Guide only 跨目录 | 0 | — |
| **合计** | **12** | |

## 一、Intent 分类契约

| Page Type | Primary Intent | Google 期望的内容形态 | Title 必须含 | Title 禁止含 |
|---|---|---|---|---|
| **Convert** | **Transactional / Tool** | 上传即用的工具 | `{SRC} to {TGT} Converter`、`Free`、`Online` | `How to`、`vs`、`Which`、`Explained` |
| **Blog** | **Informational / How-to** | 步骤化教程 | `How to`、结果状语 | `Converter` 作主词、`Free Online Tool` |
| **Guide** | **Informational / Reference** | 概念/对比/决策参考 | `vs`、`Format`、`Explained`、`Which`、`Compatibility` | `Convert` 作主词、促销词 |

## 二、逐簇方案（12 组）

| Cluster | URL | Page Type | Primary Intent | Proposed Title Direction |
|---|---|---|---|---|
| `azw3-to-mobi` | /convert/azw3-to-mobi | Convert | Transactional / Tool | ⚠️ 缺工具词 → 补「Converter」 |
| `azw3-to-mobi` | /blog/azw3-to-mobi | Blog | Informational / How-to | ✅ 已符合教程意图 |
| `cbr-to-pdf` | /convert/cbr-to-pdf | Convert | Transactional / Tool | 补「Online」强化工具属性 |
| `cbr-to-pdf` | /blog/cbr-to-pdf | Blog | Informational / How-to | 改「How to CBR to PDF …」 |
| `cbr-to-pdf` | /guide/cbr-to-pdf | Guide | Informational / Reference | ❌ 缺知识意图标记 → 补 vs/Explained/Format |
| `djvu-to-pdf` | /convert/djvu-to-pdf | Convert | Transactional / Tool | 补「Online」强化工具属性 |
| `djvu-to-pdf` | /blog/djvu-to-pdf | Blog | Informational / How-to | ✅ 已符合教程意图 |
| `djvu-to-pdf` | /guide/djvu-to-pdf | Guide | Informational / Reference | ❌ 缺知识意图标记 → 补 vs/Explained/Format |
| `epub-to-azw3` | /convert/epub-to-azw3 | Convert | Transactional / Tool | 补「Online」强化工具属性 |
| `epub-to-azw3` | /blog/epub-to-azw3 | Blog | Informational / How-to | ❌ 抢 Convert 的「Free/Converter」→ 改「How to …」 |
| `epub-to-mobi` | /convert/epub-to-mobi | Convert | Transactional / Tool | ✅ 已符合工具意图，仅补 modifier |
| `epub-to-mobi` | /blog/epub-to-mobi | Blog | Informational / How-to | ❌ 抢 Convert 的「Free/Converter」→ 改「How to …」 |
| `epub-to-word` | /convert/epub-to-word | Convert | Transactional / Tool | 补「Online」强化工具属性 |
| `epub-to-word` | /blog/epub-to-word | Blog | Informational / How-to | 改「How to EPUB to WORD …」 |
| `fb2-to-epub` | /convert/fb2-to-epub | Convert | Transactional / Tool | 补「Online」强化工具属性 |
| `fb2-to-epub` | /blog/fb2-to-epub | Blog | Informational / How-to | 改「How to FB2 to EPUB …」 |
| `mobi-to-epub` | /convert/mobi-to-epub | Convert | Transactional / Tool | ✅ 已符合工具意图，仅补 modifier |
| `mobi-to-epub` | /blog/mobi-to-epub | Blog | Informational / How-to | ✅ 已符合教程意图 |
| `txt-to-epub` | /convert/txt-to-epub | Convert | Transactional / Tool | 补「Online」强化工具属性 |
| `txt-to-epub` | /blog/txt-to-epub | Blog | Informational / How-to | ✅ 已符合教程意图 |
| `azw3-vs-mobi` | /blog/azw3-vs-mobi | Blog | Informational / How-to | 改「How to AZW3-VS-MOBI …」 |
| `azw3-vs-mobi` | /guide/azw3-vs-mobi | Guide | Informational / Reference | ✅ 已符合参考意图 |
| `batch-converter` | /blog/batch-converter | Blog | Informational / How-to | 改「How to BATCH-CONVERTER …」 |
| `batch-converter` | /guide/batch-converter | Guide | Informational / Reference | ❌ 缺知识意图标记 → 补 vs/Explained/Format |
| `epub-vs-mobi` | /blog/epub-vs-mobi | Blog | Informational / How-to | 改「How to EPUB-VS-MOBI …」 |
| `epub-vs-mobi` | /guide/epub-vs-mobi | Guide | Informational / Reference | ✅ 已符合参考意图 |

## 三、需要改 Title 的簇（12 组中的具体页）

| # | URL | Page Type | 当前 Title | 需要的方向 |
|---|---|---|---|---|
| 1 | `/convert/azw3-to-mobi` | convert | AZW3 to MOBI: Free Downgrade for Old Kindles (pre-2015) | ⚠️ 缺工具词 → 补「Converter」 |
| 2 | `/guide/cbr-to-pdf` | guide | CBR to PDF: Read Your Comics on Any Device | ❌ 缺知识意图标记 → 补 vs/Explained/Format |
| 3 | `/guide/djvu-to-pdf` | guide | DJVU to PDF: Convert Scanned Books to a Readable PDF | ❌ 缺知识意图标记 → 补 vs/Explained/Format |
| 4 | `/blog/epub-to-azw3` | blog | Free EPUB to AZW3: Get Your Ebooks Onto Kindle Natively | ❌ 抢 Convert 的「Free/Converter」→ 改「How to …」 |
| 5 | `/blog/epub-to-mobi` | blog | How to Convert EPUB to MOBI Free Online | ❌ 抢 Convert 的「Free/Converter」→ 改「How to …」 |
| 6 | `/guide/batch-converter` | guide | BookConv Batch Converter: Convert Many Files at Once in Your Browser | ❌ 缺知识意图标记 → 补 vs/Explained/Format |

**共 6 页需调整 Title 方向。**

## 四、🔴 本方案不能解决的问题（诚实边界）

| 限制 | 说明 |
|---|---|
| 无 A/B 能力 | Next.js 静态页无多版本测试，title 变更的净效果无法归因 |
| 已收录的旧 title 需重跑 | 改动后 Google 需重新抓取，30 天内可能不稳定 |
| Jaccard 已排除内容内耗 | 最高 0.026（阈值 0.40）⇒ **本方案解决的是"权重分散"假设，不是"内容重复"** |
| 假设未被验证 | 「分工能减少权重分散」是 ASSUMPTION，见红队 H2 |

## 五、实施顺序

| 批次 | 对象 | 理由 | 风险 |
|---|---|---|---|
| **第 1 批** | 2 组三目录全撞（`cbr-to-pdf`、`djvu-to-pdf`）| title 语义近乎相同，最明显的缺陷 | 低（无历史包袱，3 页均零曝光）|
| 第 2 批 | 有 GSC 分摊的簇 | 有真实竞争才值得改 | 中（可能影响现有 position）|
| 第 3 批 | 其余仅 slug 同名、无分摊的簇 | 收益最低 | 低 |
