# U5 External Link 可得性最终审计（U5_EXTERNAL_LINK_FEASIBILITY_V1）

> 阶段：**Phase 1.1 · 只读取**
> 目标不是强行解决 U5，而是回答：**项目现有数据能否真实得到 27 个 seed asset 的 backlink baseline？**

## 一、C1 项目内已有外链数据盘点

| # | 搜索项 | 命中 | 性质 |
|---|---|---|---|
| 1 | `backlink` / `backlinks` | `docs/ops/外链追踪总表-2026-08-25.md`、`数据分析/外链建设行动清单_2026-08-23.md` | **manually collected**（人工记录）|
| 2 | `referringUrls` | `scripts/check-indexing.mjs:106`、`_wb_tmp/_indexing_18.csv`、`_seed_idx.json` | **GSC API**（仅计数）|
| 3 | `referring domains` / `referringDomains` | **0 命中** | — |
| 4 | `anchor` / `anchorText` | **0 命中**（业务代码中的 `anchor` 是 HTML 锚元素，非锚文本）| — |
| 5 | `domainAuthority` / `Domain Rating` | **0 命中** | — |
| 6 | GSC Links 报告导出 | **0 命中** | — |
| 7 | Ahrefs / Semrush / Majestic / Moz 导出 | **0 命中**（`bookconv_data_asset/google/` 只有 `gsc_overview_misc.csv` 与 `normalized_google_search.csv`）| — |

## 二、C2 数据来源标记

| 字段 | 来源标记 | 可得性 |
|---|---|---|
| referring domain 列表 | **UNKNOWN** | ❌ 不可得 |
| backlinks 总数 | **UNKNOWN** | ❌ 不可得 |
| dofollow / nofollow | **UNKNOWN** | ❌ 不可得 |
| referring page URL | **UNKNOWN** | ❌ 不可得 |
| anchor text | **UNKNOWN** | ❌ 不可得 |
| domain authority | **UNKNOWN** | ❌ 不可得 |
| first seen / last seen | **UNKNOWN** | ❌ 不可得 |
| GSC `referringUrls` 计数 | **GSC API** | 🟡 可得（0/1/2）|
| 人工提交记录 | **manually collected** | 🟡 可得（12 条首页记录）|

## 三、C3 🔴 `referringUrls` 到底是什么（关键判定）

> ### 结论：**它既不是 backlink，也不是站内内链的可靠计数。**

### 3.1 项目历史实测已证伪该字段

**证据（`.workbuddy/memory/2026-10-04.md` 第 518 行，原文）**：

> | formats/epub 零内链 | referringUrls=0 | **入链 2 条**（2 篇博文，线上 200 且链接渲染 2 处） | ⚠️ **旧记录已过时** |


🔴 **`referringUrls=0` 的页面实际有 2 条入链。** 该字段与「实际入链数」不一致。

### 3.2 它也不是 external backlink

| # | 理由 |
|---|---|
| 1 | URL Inspection API 的 `indexStatusResult` 属**索引状态**端点，其 `referringUrls` 指「Google 发现的、指向该 URL 的 URL」|
| 2 | 10-04 实测该字段为 0 的页面实际有站内入链 ⇒ **它甚至不是站内内链计数** |
| 3 | 接口**不返回域名**，因此无法判断是站内还是站外 |
| 4 | 27 个 seed 的取值只有 0/1/2，区分度极低，不足以支撑任何分层 |

### 3.3 允许的表述 vs 禁止的表述

| ❌ 禁止 | ✅ 允许 |
|---|---|
| 「Backlinks = 33」| 「GSC `referringUrls` 计数合计 33」|
| 「这些页有 33 条外链」| 「该字段语义为 Google 发现的引用 URL 计数，与 backlink 口径不同」|
| 「0 backlinks」（未取得时）| 「UNKNOWN」|

## 四、C4 最终判断

> ### `U5 = UNKNOWN`

| 缺口 | 状态 |
|---|---|
| referring domain 列表 | **UNKNOWN** |
| backlink 总数 | **UNKNOWN** |
| anchor text / dofollow / DA | **UNKNOWN** |
| 分层 | **拒绝执行**（数据不足）|

**理由**：项目当前只能取得「GSC 引用计数」与「人工提交记录」，**无法构成完整 backlink baseline**。
按任务要求：「不要为了 PASS 强行定义一个近似 backlink」——本报告不这样做。

## 五、U5 最小可行性判断：是否需要第三方 backlink 数据源？

> ### `DEFER`

**判断依据**：

| # | 理由 |
|---|---|
| 1 | U5 **尚未被证明**是下一实验的必要条件 |
| 2 | 上一轮把「U5 是 U1 的必要前置」当作结论，本轮已降级为 **UNKNOWN**（无因果证据）|
| 3 | 引入第三方工具的成本（注册 + 学习 + 数据口径校准）当前**高于**其决策价值 |
| 4 | 现有 3 个 UNKNOWN 中，**没有 1 个靠外链数据才能解除** |
| 5 | 优先可解的两项（Manual Action 人工核验、线上 sitemap 观察）**不依赖外链数据** |

### 什么情况下应改为 YES

| 触发条件 |
|---|
| 外链建设被正式排入某个实验，且需要「投给谁」的排序依据 |
| 出现「position 长期不动且已排除收录/需求问题」的页面，需要权重手段验证 |
| 需要评估竞品外链差距 |

## 六、若将来引入，推荐顺序

| 顺位 | 来源 | 成本 | 备注 |
|---|---|---|---|
| 1 | **GSC → 外部链接报告**（后台）| 免费 | 无需第三方注册，先看「顶级链接页面」|
| 2 | Bing Webmaster Tools → 反向链接 | 免费 | 部分补充 |
| 3 | Ahrefs Webmaster Tools（验证 GSC 所有权后）| 免费版有限 | 与 GSC 数据打通 |
| 4 | Ahrefs / Semrush 付费 | 订阅制 | 最后手段 |
