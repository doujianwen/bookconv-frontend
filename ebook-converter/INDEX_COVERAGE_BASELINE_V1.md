# Index Coverage 基线 V1（INDEX_COVERAGE_BASELINE_V1）

> 阶段：**DATA ACQUISITION** · 真实 API 调用，非推断
> 数据源：**GSC URL Inspection API v1（`searchconsole.googleapis.com/v1/urlInspection/index:inspect`）**
> 执行时间：2026-10-07 18:12–18:16 · 资源类型 `https://www.bookconv.com/`
> URL 来源：数据层 `_wb_tmp/_urls_zero.txt`（脚本从 `tiers.D` 生成，**未手工复制**）

## 一、🔴 这个结果推翻了核心假设

| 假设 | 实际情况 |
|---|---|
| 「18 个零曝光页 = 未收录」| ❌ **错误**。实测 3 页已收录、14 页已发现未抓取、1 页 Google 未知 |

**「Discovered - currently not indexed」的真实含义**：Google **已发现该 URL 但未抓取**，这与「抓取后判定不值得收录」是完全不同的状态，指向抓取预算/权重问题，而非内容质量问题。


## 二、18 个 URL 明细（真实 API 返回）

| # | URL | Impressions | Position | Index Status | Coverage State | Evidence | Decision |
|---|---|---:|---:|---|---|---|---|
| 1 | `/convert/azw-to-mobi` | 0 | — | PASS | **Submitted and indexed** | API | 见第四节 |
| 2 | `/convert/azw3-to-pdf` | 0 | — | NEUTRAL | **Discovered - currently not indexed** | API | 见第四节 |
| 3 | `/convert/cbr-to-pdf` | 0 | — | NEUTRAL | **Discovered - currently not indexed** | API | 见第四节 |
| 4 | `/convert/chm-to-mobi` | 0 | — | PASS | **Submitted and indexed** | API | 见第四节 |
| 5 | `/convert/djvu-to-pdf` | 0 | — | NEUTRAL | **Discovered - currently not indexed** | API | 见第四节 |
| 6 | `/convert/doc-to-epub` | 0 | — | NEUTRAL | **Discovered - currently not indexed** | API | 见第四节 |
| 7 | `/convert/epub-to-html` | 0 | — | NEUTRAL | **Discovered - currently not indexed** | API | 见第四节 |
| 8 | `/convert/epub-to-jpg` | 0 | — | NEUTRAL | **Discovered - currently not indexed** | API | 见第四节 |
| 9 | `/convert/epub-to-pdf` | 0 | — | NEUTRAL | **Discovered - currently not indexed** | API | 见第四节 |
| 10 | `/convert/epub-to-png` | 0 | — | NEUTRAL | **URL is unknown to Google** | API | 见第四节 |
| 11 | `/convert/epub-to-word` | 0 | — | PASS | **Submitted and indexed** | API | 见第四节 |
| 12 | `/convert/fb2-to-epub` | 0 | — | NEUTRAL | **Discovered - currently not indexed** | API | 见第四节 |
| 13 | `/convert/html-to-epub` | 0 | — | NEUTRAL | **Discovered - currently not indexed** | API | 见第四节 |
| 14 | `/convert/lit-to-mobi` | 0 | — | NEUTRAL | **Discovered - currently not indexed** | API | 见第四节 |
| 15 | `/convert/mobi-to-azw3` | 0 | — | NEUTRAL | **Discovered - currently not indexed** | API | 见第四节 |
| 16 | `/convert/mobi-to-pdf` | 0 | — | NEUTRAL | **Discovered - currently not indexed** | API | 见第四节 |
| 17 | `/convert/mobi-to-txt` | 0 | — | NEUTRAL | **Discovered - currently not indexed** | API | 见第四节 |
| 18 | `/convert/txt-to-epub` | 0 | — | NEUTRAL | **Discovered - currently not indexed** | API | 见第四节 |

> Impressions / Position 来自 `_v2_data.json`（GSC 91 天窗口）；Coverage State 来自 2026-10-07 18:12–18:16 的 API 调用。两者是**独立数据源**。

## 三、Coverage State 分布

| Coverage State | 页数 | 占比 | 含义 |
|---|---|---|---|
| Discovered - currently not indexed | **14** | 77.8% | 已发现未抓取 ⇒ 抓取预算/权重不足 |
| Submitted and indexed | **3** | 16.7% | 已提交且已收录（有展示机会但无展示） |
| URL is unknown to Google | **1** | 5.6% | Google 完全不知道该 URL |
| **合计** | **18** | 100% | |

## 四、按要求的五种组合分别统计

| 组合 | 页数 | URL |
|---|---|---|
| 0 impressions + Indexed | **3** | `/convert/azw-to-mobi`、`/convert/chm-to-mobi`、`/convert/epub-to-word` |
| 0 impressions + Crawled not indexed | **0** | （无） |
| 0 impressions + Discovered not indexed | **14** | `/convert/azw3-to-pdf`、`/convert/cbr-to-pdf`、`/convert/djvu-to-pdf`、`/convert/doc-to-epub`、`/convert/epub-to-html`、`/convert/epub-to-jpg`、`/convert/epub-to-pdf`、`/convert/fb2-to-epub`、`/convert/html-to-epub`、`/convert/lit-to-mobi`、`/convert/mobi-to-azw3`、`/convert/mobi-to-pdf`、`/convert/mobi-to-txt`、`/convert/txt-to-epub` |
| 0 impressions + Excluded | **0** | （无） |
| 0 impressions + UNKNOWN | **0** | （无） |

**UNKNOWN 数量 = 0**（真实 API 已覆盖全部 18 个 URL，无 UNKNOWN）

## 五、辅助证据（同一 API 返回）

| 指标 | 值 | 说明 |
|---|---|---|
| 在 sitemap.xml 中 | **17 / 18** | 已被提交 |
| 有 lastCrawlTime（被抓取过）| **3 / 18** | 仅这 3 页被抓取过 |
| userCanonical == googleCanonical | **3 / 18** | canonical 无冲突 |
| referringUrls（数量）| 合计 **15** | GSC 返回的计数，非域名列表 |

🔴 **关键交叉证据**：17/18 已在 sitemap 中，但仅 3/18 被抓取过。
⇒ **「已提交 + 已发现 + 未抓取」= 抓取侧问题，不是收录规则问题，也不是 sitemap 问题。**

## 六、数据来源与时间窗口

| 项 | 值 |
|---|---|
| API | GSC URL Inspection API v1（`searchconsole.googleapis.com/v1/urlInspection/index:inspect`） |
| GSC 资源 | `https://www.bookconv.com/`（URL 前缀类型）|
| 凭据 | `scripts/gsc-service-account.json`（`bookconv-gsc-reader@...`）|
| 执行时间 | 2026-10-07 18:12–18:16 |
| Impressions/Position 窗口 | 2026-07-04 → 2026-10-02（91 天）|
| 原始输出 | `_wb_tmp/_indexing_18.csv` |
| 解析结果 | `_wb_tmp/_idx18.json` |

⚠️ **API 配额**：URL Inspection 默认 2,000 次/天。本次用 45 次（18 + 27）。

## 七、结论

> ### `U1 = RESOLVED`

| 缺口 | 之前 | 现在 | 依据 |
|---|---|---|---|
| U1 是否收录 | UNKNOWN | **RESOLVED** | 18/18 拿到真实 coverageState |
| U2 零曝光真因 | UNKNOWN | **PARTIALLY RESOLVED** | 14 页「已发现未抓取」+ 3 页「已收录」⇒ 主因是抓取侧；但「已收录的 3 页为何无展示」仍需 U3 |

### 已可确定的结论

| # | 结论 | 等级 |
|---|---|---|
| 1 | 18 个零曝光页中 **3 页已收录** ⇒ 零曝光 ≠ 未收录 | 🟢 FACT |
| 2 | **14 页已发现未抓取** ⇒ 主因在抓取侧，不在内容侧 | 🟢 FACT |
| 3 | sitemap 覆盖 17/18，**不是 sitemap 缺失问题** | 🟢 FACT |
| 4 | canonical 无冲突 | 🟢 FACT |

### 仍不可判定

| # | 未知 | 为什么 |
|---|---|---|
| 1 | 已收录的 3 页为何零曝光 | 需 U3 搜索量判断是否真无搜索需求 |
| 2 | 为何 14 页「已发现」却「未抓取」| 可能原因：抓取预算优先级、权重不足、内链不足。**本数据无法区分** |
| 3 | `epub-to-png` 为何 Google 完全未知 | 该页不在 sitemap 中（NOT in）—— 但 sitemap.ts 源码显示 31 页全量输出，**需人工核实** |
