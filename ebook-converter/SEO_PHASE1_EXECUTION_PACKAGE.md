# BookConv SEO Phase 1 · 执行包

> 生成：2026-10-07 · 阶段：**AUDIT → DESIGN → RED TEAM**
> 🔒 **本批次为只读分析 + 设计。未修改任何页面、未提交代码、未推送、未生成任何正文内容。**
> 模式约束遵守：✅ 未新增 Convert 页 · ✅ 未新增 Blog 页 · ✅ 未删除页面 · ✅ 未 noindex · ✅ 未改 Sitemap · ✅ 未改 Canonical |

## 交付物清单

| # | 文件 | 内容 | 行数 |
|---|---|---|---|
| INTENT_PARTITION_PLAN | Task 1 · 12 组重叠 slug 意图分工 | 148 |
| CTR_AUDIT_REPORT | Task 2 · SERP CTR 五维审计 | 134 |
| TITLE_REWRITE_PLAN | Task 3 · Tier A 标题重写（仅设计） | 106 |
| AUTHORITY_SEED_REPORT | Task 4 · Authority 种子页清单 | 124 |
| SEO_RED_TEAM_REVIEW | Task 5 · 三假设红队反驳 | 256 |
| **SEO_PHASE1_EXECUTION_PACKAGE.md** | 本文件（汇总） | — |

---


## 一、Intent 分工方案（摘要）

📄 完整版：`INTENT_PARTITION_PLAN.md`


### 1.1 实测：重叠组是 **12 组**，不是 9 组

| 类型 | 组数 | 是否需处理 |
|---|---|---|
| Convert + Blog | 9 | 4 组有 GSC query 分摊，5 组零分摊 |
| **Convert + Blog + Guide** | **2**（cbr-to-pdf、djvu-to-pdf）| ✅ title 语义近乎相同，**必改** |
| Blog + Guide（无 convert）| 4 | azw3-vs-mobi / batch-converter / epub-vs-mobi 等，同属风险 |

⚠️ 上一轮 MASTER_PLAN F7 写"9 组"是**只统计含 convert 页**的口径，本轮全量扫描为 12 组。

### 1.2 分工契约

| 目录 | 意图 | Title 必须含 | Title 禁止含 |
|---|---|---|---|
| **Convert** | 工具 | `{SRC} to {TGT} Converter`、`Free`、`Online` | `How to`、`vs`、`Which` |
| **Blog** | 教程 | `How to`、结果状语 | `Converter` 作主词、`Free Online Tool` |
| **Guide** | 知识 | `vs` / `Format` / `Which` / `Explained` | `Convert` 作主词 |

### 1.3 最高优先级：2 组三目录全撞

| 组 | convert | blog | guide |
|---|---|---|---|
| `cbr-to-pdf` | Free CBR to PDF Converter — No Sign-up | CBR to PDF: Convert Comic Books for Printing and Any Device | CBR to PDF: Read Your Comics on Any Device |
| `djvu-to-pdf` | Free DJVU to PDF Converter — No Sign-up | DjVu to PDF: How to Convert Scanned Archives (Step-by-Step) | DJVU to PDF: Convert Scanned Books to a Readable PDF |

🔴 **三页 title 都是 "X to PDF: …"，Google 无法区分谁是权威页。** guide 的 title 甚至含 "Convert" 作主词，直接违反分工契约。

### 1.4 🔴 本方案发现的更大问题：91 页 description 全空

| 目录 | 页数 | 有 metaDescription | 缺失 |
|---|---|---|---|
| convert | 31 | 31 | 0 ✅ |
| **blog** | **67** | **0** | **67** ❌ |
| **guide** | **24** | **0** | **24** ❌ |

**这是本 Phase 唯一"确定缺陷、方向明确、不违反任何禁令"的改进点。**

---


## 二、CTR 优化方案（摘要）

📄 完整版：`CTR_AUDIT_REPORT.md`


### 2.1 🔴 前置事实：当前排名下 CTR 优化基本无对象

| 项 | 数值 |
|---|---|
| Tier A+B 11 页总曝光 | 627 |
| Tier A+B 11 页总点击 | **0** |
| 11 页 position 区间 | **14.8 – 82.1** |
| 其中 pos < 20 的页 | **1**（`/convert/epub-to-zip`，pos 14.8）|

**10/11 页 position > 34，Google 几乎不产生展示 ⇒ 没有展示就没有 CTR 可优化。**

### 2.2 五维属性覆盖率（31 页 convert）

| 属性 | 覆盖率 | 缺口 |
|---|---|---|
| 免费 | 31/31（100%）| — |
| 结果承诺 | 31/31（100%）| — |
| 免注册 | 31/31（100%）| — |
| 工具属性 | 30/31（97%）| `/convert/mobi-to-azw3` |
| 速度 | 11/31（35%）| 20 页 |
| **在线转换** | **3/31（10%）** | **28 页** 🔴 |

### 2.3 标题字数

| 区间 | 页数 |
|---|---|
| < 50 字符 | **25/31（81%）** 🔴 |
| 50–60 字符 | 2 |
| 61–70 字符 | 4 |

### 2.4 优化优先级（按 position 排，不按曝光排）

| 优先 | URL | 曝光 | Pos | 动作 |
|---|---|---|---|---|
| P1 | `/convert/epub-to-zip` | 45 | **14.8** | title + desc（desc 现 170 字符偏长）|
| P2 | `/convert/mobi-to-epub` | 227 | 70.3 | 标题仅 39 字符（最短）|
| P3 | `/convert/epub-to-doc` | 131 | 51.2 | 缺速度/在线属性 |
| P4 | `/convert/epub-to-azw3` | 64 | 53.9 | 缺在线；与 blog 撞词 |
| P5 | `/convert/epub-to-txt` | 72 | 62.8 | 标题缺 Converter |
| — | 其余 6 页 | — | 34–75 | 🔴 **推迟到 position < 30 之后** |

---


## 三、Title 重写方案（摘要 · 仅设计）

📄 完整版：`TITLE_REWRITE_PLAN.md`


### 3.1 Tier A 六页重写（6/6 字符合规）

| URL | Current | Proposed | 字符 |
|---|---|---|---|
| `/convert/mobi-to-epub` | Convert MOBI to EPUB — Free Online Tool | **MOBI to EPUB Converter — Free Online, Keeps Chapters** | 52 ✅ |
| `/convert/epub-to-doc` | Convert EPUB to Word Document — Free Online Tool | **EPUB to Word Converter — Free Online DOCX Export, No Sign-up** | 60 ✅ |
| `/convert/epub-to-txt` | EPUB to TXT — Free Online Converter | **EPUB to TXT Converter — Free Online, Instant Download** | 53 ✅ |
| `/convert/epub-to-azw3` | Free EPUB to AZW3 Converter — No Sign-up | **EPUB to AZW3 Converter — Free Online, Keeps Kindle Fonts** | 56 ✅ |
| `/convert/epub-to-zip` | EPUB to ZIP Converter — Free Online Tool | **EPUB to ZIP Converter — Free Online, Instant Download** | 53 ✅ |
| `/convert/azw3-to-mobi` | AZW3 to MOBI: Free Downgrade for Old Kindles (pre-2015) | **AZW3 to MOBI Converter — Free Online for Pre-2015 Kindles** | 57 ✅ |

**Description 重写（同样 6/6 合规 140–160）**

| URL | 现 desc | 新 desc | 字符 |
|---|---|---|---|
| `/convert/mobi-to-epub` | 149 | Convert MOBI to EPUB free online with no sign-up. Keeps chapters, images and metadata intact, adds no watermark, and finishes in seconds flat. | 142 ✅ |
| `/convert/epub-to-doc` | 178 | Convert EPUB to editable Word DOCX free, no sign-up. Keeps headings, paragraphs and lists so you can edit right away, with no watermark added. | 142 ✅ |
| `/convert/epub-to-txt` | 159 | Extract EPUB to plain TXT free with no sign-up. Auto chapter breaks, table of contents and paragraph flow kept intact. Instant download, no watermark. | 150 ✅ |
| `/convert/epub-to-azw3` | 145 | Convert EPUB to AZW3 free online with no sign-up. Get native Kindle Format 8 rendering with better fonts, styling and tables. No watermark, no signup needed. | 157 ✅ |
| `/convert/epub-to-zip` | 170 | Package EPUB files into ZIP archives free online with no sign-up. Ideal for batch transfers, backups and offline storage. Instant download, no watermark. | 153 ✅ |
| `/convert/azw3-to-mobi` | 146 | Need AZW3 on a 2007 to 2014 Kindle? Convert AZW3 to MOBI free online with no sign-up. Keeps your text intact, finishes in seconds, no watermark. | 144 ✅ |

🔴 **实施前必读**：这 6 页点击均为 0，其中 5 页 position > 50。**改写是"为排名爬进前 20 后做准备"，不是"现在涨点击"。**

### 3.2 约束核对

| 约束 | 状态 |
|---|---|
| 不改 slug | ✅ |
| 不改 canonical | ✅ |
| 不改 sitemap | ✅ |
| 不增删页面 | ✅ 6 改 6 |
| 不写正文 | ✅ 仅 title / metaDescription |
| Title 50–60 字符 | ✅ 6/6 |
| Description 140–160 字符 | ✅ 6/6 |
| **本批次未实施** | ✅ 仅设计 |

---


## 四、Authority 种子页（摘要）

📄 完整版：`AUTHORITY_SEED_REPORT.md`


### 4.1 全量扫描：122 页

| 指标 | 数值 |
|---|---|
| 扫描页数（已排除 noindex 1 页）| 122 |
| **有曝光页数** | **25（20.5%）** |
| 零曝光页数 | 97（79.5%） |
| **Top20 页数** | **3** |
| Top21–30 | 1 |
| Top31–50 | 6 |
| Top51+ | 15 |

### 4.2 Authority Seed List（Top 12，按曝光降序）

| # | URL | 目录 | Impressions | Position | 桶 |
|---|---|---|---|---|---|
| 1 | `/convert/mobi-to-epub` | convert | **227** | 70.3 | Top51+ |
| 2 | `/convert/epub-to-doc` | convert | **131** | 51.2 | Top51+ |
| 3 | `/guide/mobi-to-epub-keep-formatting` | guide | **93** | 81.2 | Top51+ |
| 4 | `/convert/epub-to-txt` | convert | **72** | 62.8 | Top51+ |
| 5 | `/convert/epub-to-azw3` | convert | **64** | 53.9 | Top51+ |
| 6 | `/blog/ebook-formats-explained` | blog | **63** | 64.5 | Top51+ |
| 7 | `/blog/epub-to-azw3` | blog | **54** | 46.1 | Top31–50 |
| 8 | `/blog/epub-to-mobi-guide` | blog | **49** | 72.1 | Top51+ |
| 9 | `/convert/epub-to-zip` | convert | **45** | 14.8 | **Top20** |
| 10 | `/guide/calibre-vs-online-converter` | guide | **43** | 48.7 | Top31–50 |
| 11 | `/blog/why-convert-lit-to-epub` | blog | **26** | 29.8 | Top21–30 |
| 12 | `/convert/azw3-to-mobi` | convert | **21** | 56.4 | Top51+ |

### 4.3 🔴 三条外链投放限制

| # | 限制 | 依据 |
|---|---|---|
| 1 | **guide 目录 24 页全部零曝光**，无一进入 Seed List ⇒ 不建议投外链 | GSC 91 天实测 |
| 2 | **有曝光页点击仍为 0** ⇒ 外链目标是"换排名"不是"换点击" | GSC 91 天实测 |
| 3 | 🔴 **站点外链基线未知**（项目内无外链数据）⇒ 无法设定外链数量目标 | 全项目文件搜索确认 |

### 4.4 投放优先级（须先拿到外链基线）

| 优先 | 目标页 | 依据 |
|---|---|---|
| 1 | `/convert/epub-to-zip` | pos 14.8，**全站唯一 Top20**，最快见效 |
| 2 | `/convert/mobi-to-epub` | 227 曝光（最高），爬升空间最大 |
| 3 | `/convert/epub-to-doc` | 131 曝光 |
| 4 | `/convert/epub-to-txt` | 72 曝光 + 6 条出站引用（信任信号最全）|
| — | guide 全部 / 零曝光 18 页 | 无已验证基础 |

---


## 五、红队意见（摘要）

📄 完整版：`SEO_RED_TEAM_REVIEW.md`


### 5.1 三条假设的裁决

| 假设 | 裁决 | 核心理由 |
|---|---|---|
| 1. 意图分工**一定**有效 | **部分成立，措辞不成立** | 12 组中 **8 组 GSC 分摊 = 0**（无需改）；`mobi-to-epub` 已 32:1 压倒性胜出（无需改）；**2 组现状是 blog 赢**（`epub-to-azw3` blog pos 46.1 > convert 53.9）|
| 2. CTR 优化**一定**带来点击 | **不成立** | **10/11 页 position > 34 无展示机会**；唯一有展示的 `epub-to-zip` 45 曝光 0 点击；且 GSC position 是**平均值**，真实展示位置分布未知 |
| 3. Authority 是**最大**瓶颈 | **无法确认** | 外链/索引覆盖/搜索量**三类数据全缺**；且 `epub-to-zip` **零内链却 pos 14.8** 是直接反证 |

### 5.2 🔴 最关键的反证

> `epub-to-zip` **没有任何 guide 内链**（INTERNAL_LINK_REPORT 实测），却拿到全站最佳 position 14.8。
>
> **若 Authority（权重积累）是主导因素，一个零内链的孤立页不可能是最好的排名页。**

### 5.3 红队重排后的 Phase 1 优先级

| 顺序 | 动作 | 性质 | 依据 |
|---|---|---|---|
| **P0** | 拉 GSC Index Coverage | 解锁判断 | 若显示未收录 ⇒ 本 Phase 全部方案作废 |
| **P0** | 拉外链基线（Ahrefs/Semrush）| 解锁判断 | 假设 3 无法验证的根因 |
| **P1** | 补 blog 67 + guide 24 = **91 页 description** | 确定缺陷 | 91 页实测为 0；且排名更好的 blog 页同样 0 点击 |
| **P2** | 2 组三目录全撞 title 分工（cbr-to-pdf、djvu-to-pdf）| 低风险 | title 语义近乎相同，无历史包袱 |
| **P2** | `epub-to-zip` 单页 title/desc | 唯一 CTR 有效对象 | pos 14.8 |
| **P3** | 4 组有 GSC 分摊的意图分工 | 需先解决 P0 | 2 组现状与目标相反 |
| **P3** | 其余 5 页 Tier A title 重写 | 推迟 | pos 51–75，无展示机会 |
| **P4** | 外链投放 | **前提缺失** | 无基线无法判断边际收益 |

### 5.4 红队最终裁决

> **可以现在就做且方向正确的只有 3 件**：
> ① 补 91 页 description（确定缺陷）；② 2 组三目录全撞 title 分工（低风险）；③ `epub-to-zip` 单页优化（唯一有展示机会）。
>
> **在做任何事之前，必须先花 1–2 天拿到 Index Coverage 与外链基线。**
> 因为如果 18 个零曝光页的根因是"根本没被索引"，本 Phase 设计的 3 个方案**全部指向错误方向**。

---


## 六、Phase 2 实施前置条件（尚未满足）


| # | 前置 | 当前状态 | 阻塞了什么 |
|---|---|---|---|
| 1 | GSC Index Coverage 数据 | ❌ 缺失 | 18 个零曝光页的存废决策 |
| 2 | 外链基线数据 | ❌ 缺失 | Authority 是否最大瓶颈的验证 |
| 3 | 关键词搜索量（重拉）| ❌ `constants.ts` 已脱节 | 扩页决策、删页决策 |
| 4 | 30 天对照窗口 | ⏳ 需时间累积 | 任何变更的净效果验证 |

## 七、本批次合规声明


| 禁令 | 遵守 |
|---|---|
| 新增 Convert 页面 | ✅ 未新增 |
| 新增 Blog 页面 | ✅ 未新增 |
| 删除页面 | ✅ 未删除 |
| noindex 页面 | ✅ 未设置 |
| 修改 Sitemap | ✅ 未修改 |
| 修改 Canonical | ✅ 未修改 |
| 修改任何页面 | ✅ 未修改（`git status` 对 `src/` 全程无本任务产生的变更）|
| 提交代码 | ✅ 未提交 |
| 推送 | ✅ 未推送 |
| 生成正文内容 | ✅ 未生成（仅 title / metaDescription 设计字符串，且未写入源码）|

**验证方式**：`git status --porcelain src/` 的输出中不含本任务涉及的任何文件（content/blog/guides/seo/convert/internal-links/sitemap）。
