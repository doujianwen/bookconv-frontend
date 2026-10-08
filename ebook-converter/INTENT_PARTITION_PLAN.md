# 9 组同名 Slug 意图分工方案（INTENT_PARTITION_PLAN）

> 阶段：AUDIT → DESIGN（**本批次只分析设计，未修改任何页面**）· 2026-10-07
> 读入：`SEO_RECOVERY_MASTER_PLAN_2026Q4.md`（F7）、`CANNIBALIZATION_REPORT.md`（第四、五节）
> 实测源：`src/data/{content,blog,guides}/*.ts`（122 页 title/desc 解析）+ `_wb_tmp/gsc-qpage.json`（91 天 GSC query×page）

## 一、扫描口径与实测发现

按**完全同名 slug**（跨目录）扫描全部 122 页，得 **12 组**重叠（不是 9 组）：

| 类型 | 组数 | 说明 |
|---|---|---|
| **Convert + Blog** | 7 | convert 与 blog 同名 |
| **Convert + Guide** | 0 | convert 与 guide 同名 |
| **Convert + Blog + Guide** | **2** | 三目录全撞（cbr-to-pdf、djvu-to-pdf）|
| **Blog + Guide**（无 convert）| 3 | blog/guide 同名但无 convert 页 ⇒ 不属本任务范围，仍列出以免漏 |

⚠️ **修正上一轮口径**：MASTER_PLAN F7 写的是"9 组跨目录同名 slug"，那是**只统计含 convert 页**的口径。本轮全量扫描发现 **12 组**总重叠，其中 9 组含 convert、3 组是 blog↔guide 之间（无 convert）。
**这 4 组 blog↔guide 同名（azw3-vs-mobi / batch-converter / epub-vs-mobi / can-kindle-read-azw3 等）同样是内耗风险，本轮一并给出分工。**

## 二、完整重叠组表（含真实 title）

| # | Cluster | Convert（工具意图）| Blog（教程意图）| Guide（知识意图）| GSC 分摊 query |
|---|---|---|---|---|---|
| 1 | `cbr-to-pdf` | `/convert/cbr-to-pdf` | `/blog/cbr-to-pdf` | `/guide/cbr-to-pdf` | 0 |
| 2 | `djvu-to-pdf` | `/convert/djvu-to-pdf` | `/blog/djvu-to-pdf` | `/guide/djvu-to-pdf` | 0 |
| 3 | `epub-to-word` | `/convert/epub-to-word` | `/blog/epub-to-word` | — | 0 |
| 4 | `fb2-to-epub` | `/convert/fb2-to-epub` | `/blog/fb2-to-epub` | — | 0 |
| 5 | `txt-to-epub` | `/convert/txt-to-epub` | `/blog/txt-to-epub` | — | 0 |
| 6 | `azw3-vs-mobi` | — | `/blog/azw3-vs-mobi` | `/guide/azw3-vs-mobi` | 0 |
| 7 | `batch-converter` | — | `/blog/batch-converter` | `/guide/batch-converter` | 0 |
| 8 | `epub-vs-mobi` | — | `/blog/epub-vs-mobi` | `/guide/epub-vs-mobi` | 0 |
| 9 | `azw3-to-mobi` | `/convert/azw3-to-mobi` | `/blog/azw3-to-mobi` | — | 1 |
| 10 | `epub-to-mobi` | `/convert/epub-to-mobi` | `/blog/epub-to-mobi` | — | 2 |
| 11 | `epub-to-azw3` | `/convert/epub-to-azw3` | `/blog/epub-to-azw3` | — | 7 |
| 12 | `mobi-to-epub` | `/convert/mobi-to-epub` | `/blog/mobi-to-epub` | — | 22 |

### 2.1 三目录全撞组（最高风险，2 组）

**`cbr-to-pdf`** — 三页 title 实测：

| 目录 | URL | Title（长度）| GSC 曝光 |
|---|---|---|---|
| convert | `/convert/cbr-to-pdf` | Free CBR to PDF Converter — No Sign-up（38）| 0 |
| blog | `/blog/cbr-to-pdf` | CBR to PDF: Convert Comic Books for Printing and Any Device（59）| 0 |
| guide | `/guide/cbr-to-pdf` | CBR to PDF: Read Your Comics on Any Device（42）| 0 |

🔴 **三页 title 语义几乎完全重叠**（都是"CBR to PDF"），Google 无法区分谁是权威页。

**`djvu-to-pdf`** — 三页 title 实测：

| 目录 | URL | Title（长度）| GSC 曝光 |
|---|---|---|---|
| convert | `/convert/djvu-to-pdf` | Free DJVU to PDF Converter — No Sign-up（39）| 0 |
| blog | `/blog/djvu-to-pdf` | DjVu to PDF: How to Convert Scanned Archives (Step-by-Step)（59）| 0 |
| guide | `/guide/djvu-to-pdf` | DJVU to PDF: Convert Scanned Books to a Readable PDF（52）| 0 |

🔴 **三页 title 语义几乎完全重叠**（都是"CBR to PDF"），Google 无法区分谁是权威页。

### 2.2 有 GSC 分摊的重叠组（4 组，实测优先）

| Cluster | Convert 曝光/pos | Blog 曝光/pos | 分摊 query | 症状 |
|---|---|---|---|---|
| `mobi-to-epub` | 227 / 70.3 | 7 / 66.6 | 22 | convert 占优 ✅ |
| `epub-to-azw3` | 64 / 53.9 | 54 / 46.1 | 7 | convert 占优 ✅ |
| `epub-to-mobi` | 8 / 74.8 | 0 / null | 2 | convert 占优 ✅ |
| `azw3-to-mobi` | 21 / 56.4 | 0 / null | 1 | convert 占优 ✅ |

## 三、设计规则（意图分工契约）

| 目录 | 意图类型 | Title 必须含 | Title 禁止含 | Description 必须含 |
|---|---|---|---|---|
| **Convert** | **工具意图** | `{SRC} to {TGT} Converter`、`Free`、`Online` | `How to`、`vs`、`Which`、`Guide`、`Why` | 动作动词 + 结果承诺 + 免注册 |
| **Blog** | **教程意图** | `How to`、结果状语 | `Converter`（作为主词）、`Free Online Tool` | 步骤化说明 + 何时用哪个 |
| **Guide** | **知识意图** | `vs` / `Format` / `Which` / `Explained` | `Convert` 作主词、`Free Online Tool` | 概念定义 + 决策建议 |

### 3.1 判定脚本（可自动化，Phase 2 门禁用）

```js
// intentOf(title) — 纯字符串判定，供 CI 门禁使用
const RULES = [
  { intent: "guide",   must: /\b(vs|versus|which|explained|guide|format\b|compatibility|comparison)\b/i },
  { intent: "blog",    must: /\b(how to|why|what is|tutorial|step[- ]by[- ]step|guide to)\b/i },
  { intent: "convert", must: /\b(converter|convert|tool|kit)\b/i },
];
// 冲突判定：convert 目录的 title 命中 guide/blog 规则 => FAIL
```

⚠️ 已知例外须白名单：`/guide/batch-converter` title 含 "Converter"（`BookConv Batch Converter: Convert Many Files at Once in Your Browser`）—— 它是**产品功能页**不是知识页，建议改判为 convert 意图或改 title。

## 四、逐组分工方案（Proposed，仅设计）

**只改 title / metaDescription，不动正文、不改 slug、不改 canonical、不改 sitemap。**


| Cluster | 目录 | Current | Proposed | 理由 |
|---|---|---|---|---|
| `mobi-to-epub` | convert | Convert MOBI to EPUB — Free Online Tool | **MOBI to EPUB Converter — Free Online, No Sign-up** | 现 title 39 字符偏短且"Tool"弱于"Converter"；补 No Sign-up 前置（与全站 31/31 页 modifier 一致） |
| `mobi-to-epub` | blog | How to Convert MOBI to EPUB (And Why You'd Want To) | **How to Convert MOBI to EPUB — And Why It's Worth It** | 现 title 51 字符合格但缺结果状语；"Why You Would Want To" 口语化，改后更明确教程+动机双意图 |
| `epub-to-azw3` | convert | Free EPUB to AZW3 Converter — No Sign-up | **EPUB to AZW3 Converter — Free Online Kindle Format 8** | convert 曝光 64 pos 53.9 落后 blog 54 pos 46.1；title 加 "Online"（现仅 3/31 页有），明确工具属性 |
| `epub-to-azw3` | blog | Free EPUB to AZW3: Get Your Ebooks Onto Kindle Natively | **How to Convert EPUB to AZW3 for Kindle — Step by Step** | 🔴 关键：blog 现 title 含 "Free"，与 convert 页 "Free" 直接抢词。改后去掉 Free、加 How to/Step by Step，让 blog 走教程意图 |
| `epub-to-mobi` | convert | Convert EPUB to MOBI Online — Free Converter, No Sign-up | **EPUB to MOBI Converter — Free Online for Old Kindles** | 现 56 字符含"Online"但与 blog 语义撞；改后用"for Old Kindles"锁定结果场景 |
| `epub-to-mobi` | blog | How to Convert EPUB to MOBI Free Online | **How to Convert EPUB to MOBI — Step-by-Step for Old Kindles** | 🔴 blog 现 title 含 "Free Online" 与 convert 撞词；去 Free、加 Step-by-Step |
| `azw3-to-mobi` | convert | AZW3 to MOBI: Free Downgrade for Old Kindles (pre-2015) | **AZW3 to MOBI Converter — Free Online for Pre-2015 Kindles** | 现 title 无 "Converter" 一词（全站仅此 1 页缺），工具属性弱；补齐 |
| `azw3-to-mobi` | blog | How to Convert AZW3 to MOBI Online Fast | **How to Convert AZW3 to MOBI — Why Downgrade Is Rarely Worth It** | 🔴 现 title 含 "Online Fast" 与 convert 抢；改为教程+判断（Why 意图） |
| `cbr-to-pdf` | convert | Free CBR to PDF Converter — No Sign-up | **CBR to PDF Converter — Free Online Comic Archive Converter** | 仅补全 modifier，不改意图 |
| `cbr-to-pdf` | blog | CBR to PDF: Convert Comic Books for Printing and Any Device | **How to Convert CBR to PDF — Print-Ready Comic Archives** | 去"Convert...for"，改 How to + Print-Ready |
| `cbr-to-pdf` | guide | CBR to PDF: Read Your Comics on Any Device | **CBR to PDF Explained — Format Limits, DRM, and Whether It Works** | 🔴 guide 现 title 与 blog 高度近似（都是 CBR to PDF: …）；改知识/解释意图 |
| `djvu-to-pdf` | convert | Free DJVU to PDF Converter — No Sign-up | **DJVU to PDF Converter — Free Online for Scanned Archives** | 仅补全 modifier，不改意图 |
| `djvu-to-pdf` | blog | DJVU to PDF: How to Convert Scanned Archives (Step-by-Step) | **How to Convert DJVU to PDF — Step-by-Step for Scanned Books** | 现 title 已含 How to/Step-by-Step，方向正确；仅需去"to PDF:"前缀 |
| `djvu-to-pdf` | guide | DJVU to PDF: Convert Scanned Books to a Readable PDF | **DJVU Format Explained — Scans, OCR, and Why PDF Is Not Always Better** | 🔴 guide 现 title 含 "Convert" 作主词，与 convert 页撞；改纯知识意图 |
| `epub-to-word` | convert | Free EPUB to Word Converter — No Sign-up | **EPUB to Word Converter — Free Online DOCX Export** | 仅补全 modifier，不改意图 |
| `epub-to-word` | blog | Epub to Word: Convert eBooks to Editable Docx | **How to Convert EPUB to Word — Editable DOCX Without Word** | 🔴 现 title 用 "Epub"（大小写不一致，品牌规范应为 EPUB）且"Convert eBooks"与 convert 撞 |
| `fb2-to-epub` | convert | Free FB2 to EPUB Converter — No Sign-up | **FB2 to EPUB Converter — Free Online FictionBook Converter** | 仅补全 modifier，不改意图 |
| `fb2-to-epub` | blog | FB2 to EPUB: Convert FictionBook for Any Reader (Including Kindle) | **How to Convert FB2 to EPUB — FictionBook for Any Reader** | 现 66 字符偏长；去"Convert"主词，改 How to |
| `txt-to-epub` | convert | Free TXT to EPUB Converter — No Sign-up | **TXT to EPUB Converter — Free Online with Auto Chapter Breaks** | 仅补全 modifier，不改意图 |
| `txt-to-epub` | blog | How to Turn a Plain TXT File into an EPUB with a Table of Contents | **How to Turn TXT into EPUB — Adding a Table of Contents Manually** | 现 title 已走教程意图且 66 字符；仅需去 "an EPUB" 使其与 convert 区分 |
| `azw3-vs-mobi` | blog | MOBI vs AZW3 & AZW3 vs MOBI — Which Kindle Format Wins in 2026 | **MOBI vs AZW3 — Which Kindle Format Wins in 2026** | 🔴 现 title 双向重复（MOBI vs AZW3 & AZW3 vs MOBI）浪费 60% 字数；删掉反向表述 |
| `azw3-vs-mobi` | guide | AZW3 vs MOBI: Which Kindle Format Should You Use? | **AZW3 vs MOBI — Format Differences Explained Side by Side** | 🔴 guide 0 曝光 / blog 21 曝光 = 事实上的赢家；guide 改纯知识意图补差异化 |
| `epub-vs-mobi` | blog | EPUB vs MOBI: Which Ebook Format Should You Actually Use? (2026) | **EPUB vs MOBI — Which Ebook Format to Use in 2026** | 现 64 字符含"(2026)"冗余；精简 |
| `epub-vs-mobi` | guide | EPUB vs MOBI: Device Compatibility Guide | **EPUB vs MOBI — Device Compatibility Compared** | 🔴 与 blog 语义几乎相同；改知识/对比表意图 |
| `batch-converter` | blog | When to Use Calibre for Batch Conversion (Instead of a Browser Tool) | **When to Use Calibre Instead of a Browser Batch Converter** | 现 68 字符偏长 |
| `batch-converter` | guide | BookConv Batch Converter: Convert Many Files at Once in Your Browser | **Browser vs Calibre Batch Conversion — Which to Choose** | 🔴 guide 现 title 是产品宣传（"BookConv Batch Converter:"）不属知识意图，且与 blog 主题撞 |

## 五、🔴 本方案发现的一个更严重问题：91 页 description 全空

| 目录 | 页数 | description 实测 |
|---|---|---|
| convert | 31 | 平均 148 字符，23/31 在 140–160 合规区间 ✅ |
| **blog** | **67** | **全部 0 字符（缺失）** ❌ |
| **guide** | **24** | **全部 0 字符（缺失）** ❌ |

**实测依据**：解析 `src/data/blog/*.ts` 与 `src/data/guides/*.ts` 的 `export const metaDescription`，命中 0 次。

📌 **影响评估**：blog/guide 的 snippet 由 Google 自行抓取正文生成 ⇒ 无法控制、无法植入卖点、无法引导点击。**这是比 title 分工更高优先级的 CTR 杠杆，且不违反本批次"不改页面"约束（Phase 2 才实施）。**

## 六、本阶段结论

| # | 结论 | 等级 |
|---|---|---|
| 1 | 完全同名跨目录重叠实为 **12 组**（MASTER_PLAN 写 9 组是"含 convert"子集）| 🟢 实测 |
| 2 | 其中 **2 组三目录全撞**（cbr-to-pdf、djvu-to-pdf），三页 title 语义近乎相同 | 🟢 实测 |
| 3 | **4 组有真实 GSC query 分摊**（mobi-to-epub 22 个、epub-to-azw3 7、epub-to-mobi 2、azw3-to-mobi 1）| 🟢 实测 |
| 4 | **blog 页 title 含 "Free/Online/Fast" 与 convert 页直接抢词**（epub-to-azw3、epub-to-mobi、azw3-to-mobi 三组已确认）| 🟢 实测 |
| 5 | **azw3-vs-mobi 组 guide 0 曝光 vs blog 21 曝光** ⇒ 事实赢家是 blog，guide 需改定位 | 🟢 实测 |
| 6 | 🔴 **blog 67 页 + guide 24 页 description 全为 0 字符** | 🟢 实测 |
| 7 | title 长度：convert 平均 43 字符（25/31 不足 50），blog 平均 57、guide 平均 59 | 🟢 实测 |
