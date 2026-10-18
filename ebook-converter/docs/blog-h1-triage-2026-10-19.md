# Blog H1 清晰度三桶分诊（GEO 视角）

**日期**：2026-10-19
**来源**：`docs/B3-全站元数据检查报告-2026-10-16.md` §三「blog（36 条）」+ `src/data/blog/index.ts`
**范围**：27 篇 blog `title` 超长、且**无独立 `metaTitle`** 者（`title` 字段驱动可见 H1 / OG / JSON-LD，非 SERP）。
**GEO 判定口径**：H1 长度本身不是排名惩罚项；`<=55` 是 SERP `<title>`(metaTitle) 的硬规则，被误套用到可见 H1。GEO 真正要的是 **H1 = 干净的「实体 + 意图」锚点**。分三桶：
- **A 保留**：H1 即用户/AI 高频长尾原句，或属于已验证的「IP 多设备」策略簇（Bing 实测 Harry Potter 58% Citation Share）→ 是检索资产，不动。
- **B 精简**：H1 含冗余填充（"(2026)" / "Instead of a Browser Tool" / "ReadEra, Moon+ Reader, and More"）→ 人工删冗余、留核心实体+关键词，长度自然降。
- **C 重构**：H1 把两个不相关意图揉一起 → 选主意图或拆页。
- ⚠️ **执行纪律**：`title` 一改，H1/OG/JSON-LD 三处联动；新 H1 须同时满足「可见可读 + OG 体面 + JSON-LD headline 一致」。**人工逐页审措辞，禁脚本批量替换；≤3 页/批。**

---

## 一、A 桶 — 保留（15 篇，GEO 资产，不建议改）

| # | slug | 当前 H1（长度） | GEO 依据 |
|---|------|----------------|---------|
| 1 | `ai-feeding-notebooklm-chatgpt` | AI Feeding: Import NotebookLM and ChatGPT Content to Ebook (58) | 主题聚焦、信息密度高 |
| 2 | `cbr-to-pdf` | CBR to PDF: Convert Comic Books for Printing and Any Device (59) | 精确 query 匹配 |
| 3 | `chronicles-of-narnia-ebooks-multiple-devices` | Chronicles of Narnia Ebooks: Read the Complete Series on Kindle, Kobo, and More (79) | IP 多设备簇，已验证策略 |
| 4 | `djvu-to-pdf` | DjVu to PDF: How to Convert Scanned Archives (Step-by-Step) (59) | 精确 query 匹配 |
| 5 | `ebook-formats-explained` | EPUB vs AZW3 vs MOBI: Which Ebook Format Should You Use? (56) | 高意图对比锚点 |
| 6 | `env-variables-setup` | Configuring BookConv: Environment Variables for Self-Hosting (60, NOIDX) | 开发者向，无索引，表述干净 |
| 7 | `harry-potter-digital-books-multiple-devices` | Harry Potter Digital Books: How to Read Across Multiple Devices (63) | IP 簇头部，58% 份额已验证 |
| 8 | `lord-of-the-rings-ebooks-multiple-devices` | Lord of the Rings Ebooks: Read the Saga Across Kindle, Kobo, and More (69) | IP 多设备簇 |
| 9 | `mobi-to-kobo` | MOBI to Kobo: How to Read Your MOBI Books on a Kobo Reader (58) | 精确 query 匹配 |
| 10 | `bookconv-faq` | BookConv FAQ: Is It Safe, Free, and How Does It Compare to Calibre? (67) | FAQ  hub，AI 首选引用源 |
| 11 | `txt-to-epub` | How to Turn a Plain TXT File into an EPUB with a Table of Contents (66) | 精确 query 匹配 |
| 12 | `webhook-integration` | BookConv Webhooks: Get a Signed Notification the Second Your Conversion Finishes (80) | 长但高信息密度，品牌特性锚点 |
| 13 | `which-kindle-books-can-you-convert-drm-free-checklist` | Which Kindle Books Can You Convert? (DRM-Free Checklist) (56) | 强 query 匹配 + 清单价值 |
| 14 | `why-bookconv` | Why BookConv: A Free, Private Ebook Converter Built for Every Device (68) | 品牌实体陈述，清晰 |
| 15 | `twilight-ebooks-multiple-devices` | Twilight Ebooks: Read the Saga Across Kindle, Kobo, and More (60) | IP 多设备簇 |

---

## 二、B 桶 — 精简（11 篇，人工删冗余，保留核心词）

| # | slug | 当前 H1（长度） | 冗余点 | 建议 H1（≤55） |
|---|------|----------------|--------|---------------|
| 1 | `azw3-vs-mobi` | MOBI vs AZW3 & AZW3 vs MOBI — Which Kindle Format Wins in 2026 (62) | 短语重复 + "(2026)" | `MOBI vs AZW3: Which Kindle Format Should You Use?` |
| 2 | `batch-converter` | When to Use Calibre for Batch Conversion (Instead of a Browser Tool) (68) | 括号废话 | `When to Use Calibre for Batch Ebook Conversion` |
| 3 | `best-epub-reader-android` | Best EPUB Reader Apps for Android (2026): ReadEra, Moon+ Reader, and More (73) | 年份+枚举填充 | `Best EPUB Reader Apps for Android` |
| 4 | `best-epub-reader-iphone-ipad` | Best EPUB Reader Apps for iPhone and iPad (2026): Apple Books and Beyond (72) | 年份+枚举填充 | `Best EPUB Reader Apps for iPhone and iPad` |
| 5 | `bookconv-vs-calibre` | BookConv vs Calibre: Which Ebook Converter Should You Use in 2026? (66) | "(in 2026)" | `BookConv vs Calibre: Which Converter Should You Use?` |
| 6 | `epub-vs-mobi` | EPUB vs MOBI: Which Ebook Format Should You Actually Use? (2026) (64) | "(2026)" | `EPUB vs MOBI: Which Format Should You Use?` |
| 7 | `fb2-to-epub` | FB2 to EPUB: Convert FictionBook for Any Reader (Including Kindle) (66) | "(Including Kindle)" 可移正文 | `FB2 to EPUB: Convert FictionBook for Any Reader`（可选） |
| 8 | `large-file-conversion-guide` | How to Convert Large Ebooks (Over 4 MB): Free Methods and When to Upgrade (73) | 括号细节移正文 | `How to Convert Large Ebooks for Free`（可选） |
| 9 | `reading-groups-hub` | How to Sync Ebooks for Virtual Book Clubs & Reading Groups (2026) (65) | "(2026)" | `How to Sync Ebooks for Virtual Book Clubs` |
| 10 | `selection-intercept-converter` | Selection & Intercept: Best Free Ebook Converters in 2026 (57) | "in 2026" | `Best Free Ebook Converters: Selection & Intercept`（可选） |
| 11 | `sync-reading-across-devices` | How to Transfer Ebooks Between Devices & Sync Reading Progress (2026) (69) | "(2026)" | `How to Transfer Ebooks Between Devices` |

> B 桶核心动作 = **删年份/删括号填充/删枚举**，不动核心实体与关键词；每篇人工定稿后 ≤3 页/批落地。

---

## 三、C 桶 — 重构（1 篇，主题混淆）

| # | slug | 当前 H1（长度） | 问题 | 建议 |
|---|------|----------------|------|------|
| 1 | `marvel-comics-ebooks-multiple-devices` | Marvel Comics & Movies: How to Read Digital Books Across Kindle, Kobo, and More (79) | "Comics & Movies" 把两个媒介揉一起，「读数字书」与「电影」意图冲突 | 选主意图 → `Marvel Comics: Read Digital Books on Kindle, Kobo & More`（删 Movies）；或拆出独立「Marvel 电影」页 |

---

## 四、已 SERP 收口、最低优先（9 篇，不在 27 内，仅记）

Day 17·b3 已补 `metaTitle`（SERP 合规），其 `title` 仍 >55 但只影响 H1/OG/JSON-LD；按本分诊逻辑多数属 A 桶（强意图），可暂缓：
- en 6：`conversion-error-guide` / `why-ebook-wont-open-kindle` / `check-converted-file-quality` / `download-troubleshooting` / `sitemap-seo-guide` / `pdf-to-epub-guide`
- es 3：`can-kindle-read-azw3` / `epub-to-mobi-guide` / `why-convert-lit-to-epub`

---

## 五、落地节奏与待办队列（执行纪律）

> 执行纪律：H1 改动 = 可见内容，`title` 一改联动 H1/OG/JSON-LD；人工逐页审措辞、禁脚本批量替换；**≤3 页/批**；每批跑 `npm run audit:syntax` + `build`，人工 review 后 commit（不自动 push）。

### 待办队列（按序执行）
- [ ] **C-1（优先，1 篇）**：`marvel-comics-ebooks-multiple-devices` 重构 → 建议 `Marvel Comics: Read Digital Books on Kindle, Kobo & More`（删 Movies 子意图；或拆独立「Marvel 电影」页）。人工定稿后单页改。
- [ ] **B-批1（≤3 页）**：`azw3-vs-mobi` + `batch-converter` + `best-epub-reader-android`（删年份/括号填充）
- [ ] **B-批2（≤3 页）**：`best-epub-reader-iphone-ipad` + `bookconv-vs-calibre` + `epub-vs-mobi`
- [ ] **B-批3（≤3 页）**：`fb2-to-epub` + `large-file-conversion-guide` + `reading-groups-hub`
- [ ] **B-批4（≤2 页）**：`selection-intercept-converter` + `sync-reading-across-devices`
- [ ] **A 桶（15 篇）**：保留，不动（GEO 资产，强行缩短反而丢 query 匹配）。

### 备注
- B 桶每篇只删冗余、不改语义；建议 H1 见 §二。
- C 桶优先原因：主题混淆（Comics & Movies 两个媒介揉一起）最伤实体锚点，先解。
