# 策略红队 V2（SEO_RECOVERY_STRATEGY_REDTEAM_V2）

> 阶段：**Phase 1.1 · RED TEAM** · 攻击 Phase 1 的 6 条策略假设
> 纪律：判为 UNPROVEN 的假设，**不得作为下一步行动依据**

## H1：「zero impressions → content quality problem」

> ### 裁决：**REJECTED**

| # | 依据 |
|---|---|
| 1 | **3 / 18 的零曝光页已收录** |
| 2 | **0 个**为 Crawled - currently not indexed（即"抓取后判为不值得收录"）|
| 3 | **14 / 18 是"已发现但未抓取"** —— 页面内容根本没被抓取，无从判定质量 |

**⇒ 零曝光的主因不是内容质量，是「未被抓取」。**

---


## H2：「14 discovered-not-indexed → backlink problem」

> ### 裁决：**UNPROVEN**

| # | 事实 |
|---|---|
| 1 | 14 个 URL 当前确实是 `Discovered - currently not indexed` |

| # | 为什么无法证明是外链问题 |
|---|---|
| 1 | `Discovered` 只说明 Google 知道该 URL，**不说明为何不抓** |
| 2 | 可能成因至少有 7 种：crawl prioritization / sitemap 或 discovery / internal linking / authority / freshness / site-level signals / technical issues / Google scheduling |
| 3 | 本项目**无外链基线**（U5 UNKNOWN），无法做相关性检验 |
| 4 | 项目历史有一条**反例**：`.workbuddy/memory/2026-10-04` 记录 `formats/epub` 的 `referringUrls=0` 但**实际入链 2 条** ⇒ 该字段与内链关系不可靠 |

**⇒ 假设成立需要「外链数据 + 对照实验」，两者当前都不具备。**

---


## H3：「U5 必须先解决才能处理 U1」

> ### 裁决：**UNPROVEN**（本轮推翻上一轮结论）

| # | 上一轮的说法 | 本轮判定 |
|---|---|---|
| 1 | 「14/18 未抓取通常与权重/内链相关，因此 U5 是 U1 的必要前置」| 🔴 **降级为 UNKNOWN** |

**理由**：

| # | 说明 |
|---|---|
| 1 | 「通常与权重相关」是行业经验，**不是本项目的证据** |
| 2 | 上一轮把 ASSUMPTION 写进了结论段，违反「结论必须能被表格反向验证」|
| 3 | 本轮无任何数据可支持该依赖链 |

**⇒ U1 与 U5 之间没有已证实的依赖关系。U5 不再是 U1 的前置条件。**


**那么 U1 现在可做什么？**

| 可做 | 依据 |
|---|---|
| 观察 | 14 页是否随时间自行被抓取（需 30 天后复测 API）|
| 观察 | 已收录的 3 页 position 是否变化 |
| 🔴 不可做 | 在成因未知前投入内容改写或外链建设并声称"为解决 U1" |

---


## H4：「修 description 可以解决 14 个未抓取页面」

> ### 裁决：**UNPROVEN**

| # | 理由 |
|---|---|
| 1 | 14 个页面**从未被抓取** ⇒ Google 没有读取其 meta description |
| 2 | meta description 影响的是 **SERP 展示与 CTR**，不直接影响抓取 |
| 3 | 81 页 description >160 的问题**客观存在**，但那是**独立的 CTR 问题**，与抓取问题无因果链 |

**⇒ description 优化应按 CTR 问题归因，不得声称能解决抓取问题。**

⚠️ 补充：81 页 description 超长是真实缺陷，值得修——但理由是「截断导致卖点丢失」，**不是**「能提升抓取」。

---


## H5：「增加内容可以提高 crawl」

> ### 裁决：**UNPROVEN**

| # | 理由 |
|---|---|
| 1 | 14 个页面在 **source 与 live sitemap 中都存在**（SOURCE_ONLY=0，8/8 异常 URL 均在 live sitemap）⇒ 发现渠道无问题 |
| 2 | 增加内容不改变「Google 已发现但未抓取」这一状态 |
| 3 | 抓取预算通常与站点规模/更新频率/权重相关，**内容量**的作用未在本项目验证 |

**⇒ 「加内容 → 提高 crawl」在本项目无证据支撑。**

---


## H6：「修 sitemap 可以解决 14 个未抓取页面」

> ### 裁决：**UNPROVEN，且前提已被证伪**

| # | 事实 |
|---|---|
| 1 | 线上 sitemap **31/31** 完整包含 Convert 页 |
| 2 | 8 个"异常 URL"**全部在 live sitemap 中**（curl 实测）|
| 3 | SOURCE_ONLY = **0** |

🔴 **前提不成立**：sitemap 没有缺失，无需修复。


**⇒ 该假设 REJECTED（前提被推翻），而非 UNPROVEN。**


### ⚠️ 但本轮发现一个真实的 sitemap 问题（方向相反）

| # | 问题 |
|---|---|
| 1 | `/blog/sync-ebooks-reading-groups` **仍在线上 sitemap**（LIVE_ONLY），但源码已 301 到 `/blog/reading-groups-hub` |
| 2 | ⇒ **线上部署落后于源码**（该收口未上线）|
| 3 | 这是**向 Google 提交了已重定向 URL**的问题，与「未抓取」无关 |

---


## 汇总

| 假设 | 裁决 | 是否可作为行动依据 |
|---|---|---|
| H1 zero impressions = 内容质量问题 | **REJECTED** | ❌ |
| H2 未抓取 = 外链问题 | **UNPROVEN** | ❌ |
| H3 U5 是 U1 的必要前置 | **UNPROVEN**（本轮推翻）| ❌ |
| H4 修 description 能解决未抓取 | **UNPROVEN** | ❌ |
| H5 加内容能提高 crawl | **UNPROVEN** | ❌ |
| H6 修 sitemap 能解决未抓取 | **REJECTED**（前提已证伪）| ❌ |

## 🔴 本轮红队的核心结论

> **6 条策略假设，无一可用于指导下一步行动。**
>
> 上一轮 Phase 1 的实验设计（description 重写 / title 实验 / intent 分工）**全部基于 H1 与 H4**，而这两条现已 REJECTED / UNPROVEN。
>
> **这不意味着那些实验不该做**——它们针对的是 CTR 与排名（真实问题），只是**不能声称它们解决 14 个未抓取页**。

>
> **必须先解决的前置**：Manual Action 人工核验（唯一能解锁策略判断的未知项）。

