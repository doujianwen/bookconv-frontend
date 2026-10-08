# 红队审计 · Phase 1（SEO_RED_TEAM_PHASE1）

> 阶段：**RED TEAM** · 攻击 5 条假设，每条给 FACT / ASSUMPTION / UNKNOWN / RISK / VALIDATION METHOD
> 纪律：无 Google 官方人工处罚证据时，只能写「Spam Update 后的表现变化 / Recovery hypothesis」，**不得**断言「Google penalized」|

## H1：Description 优化能够明显提高 CTR

### FACT

| # | 事实 | 数据 |
|---|---|
| 1 | 确实存在 description 超长问题 | **81 / 121 页 >160 字符**（66.9%）|
| 2 | description 全部来自 intro/problem 全文，无截断 | `blog/[slug]/page.tsx:57`、`guide/[slug]/page.tsx:40` |
| 3 | 🔴 **全站 91 天点击 = 0** | GSC，37 个 URL 合计 |
| 4 | 🔴 Convert 页 position 区间 | 最低 14.8，仅 1 页 <20 |
| 5 | 唯一 pos<20 的页 CTR 也是 0 | `/convert/epub-to-zip` pos 14.8，45 曝光，0 点击 |

### ASSUMPTION

- 假设「卖点前置能提高 CTR」| 业界通行，但**本项目无任何对照数据** |

### UNKNOWN

- 真实展示位置分布（pos 14.8 是加权均值，可能是「1 次第 5 + 5 次第 40」）|
- 补 description 后的实际 CTR 变化 |
- 用户不点是因 title 差、需求不符、还是品牌陌生 |

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🔴 **改了也测不出效果** | 高 | position 不变 ⇒ 无展示 ⇒ CTR 无从变化。会把"无变化"误读为"方案无效" |
| 🟡 抢错关键词 | 中 | 强行植入的卖点词可能与用户实际搜索意图不符 |
| 🟢 本身无 SEO 风险 | 低 | description 不影响排名，只影响 CTR |

### VALIDATION METHOD

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | 先取 Index Coverage（U1）| 确认零曝光页是否已收录 |
| 2 | 只改 1 批（有曝光且 pos<20 的页）| 避免全改后无法归因 |
| 3 | 30 天后比 position（不是 CTR）| VI v1.0：|VI|<10% 无信号 / 10–20% 弱 / ≥20% 信号成立 |
| 4 | **前置判据** | 若 pos 未改善到 <20，则 H1 在本项目**不可验证**，不得据此下结论 |

### 裁决

> 🔴 **H1 在当前排名下不可验证。** description 确实需要改（81 页缺陷客观存在），但「能明显提高 CTR」这个因果链缺少中间环节：**position 必须先改善到有展示位**。

---


## H2：Intent Partition 能够减少 Google 的权重分散

### FACT

| # | 事实 | 数据 |
|---|---|
| 1 | 内容内耗**已排除** | 8-gram Jaccard 最高 **0.026**（阈值 0.40），判据自检 1.000 |
| 2 | 完全同名跨目录簇 | **12 组** |
| 3 | 其中三目录全撞 | **2 组**（`cbr-to-pdf`、`djvu-to-pdf`）|
| 4 | GSC 中有 query 分摊的簇 | 见 CANNIBALIZATION_REPORT |
| 5 | 🔴 反例：`mobi-to-epub` 已 32:1 胜出 | convert 227 曝光 vs blog 7 曝光 |
| 6 | 🔴 反例：`epub-to-azw3` 是 **blog 赢** | blog 54 曝光 pos 46.1 vs convert 64 曝光 pos 53.9 |

### ASSUMPTION

- 假设「Google 依据 title/URL 判定意图，title 分工能把权重集中到单一页」| 无本地对照实验 |

### UNKNOWN

- Google 当前如何理解每页意图 |
- title 变更后是否净增益（可能被判 title 改写）|
| 被"退让"的一方是否会因此掉出索引 |

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🔴 **可能改错方向** | 高 | 2 组现状是 blog 赢；若强制让 convert 赢，可能双输 |
| 🟡 权重分散可能根本不存在 | 中 | Jaccard 0.026 说明内容不重复；Google 本就可能已正确区分 |
| 🟢 canonical 未动 | 低 | 改动不涉及 canonical/sitemap |

### VALIDATION METHOD

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | 先改 3 组「零曝光、无历史包袱」的三目录全撞簇 | 风险最低，无现有 position 可损失 |
| 2 | 30 天后检查是否出现 `Duplicate without user-selected canonical` | 若出现 ⇒ 分工失败反而制造了重复 |
| 3 | 单独处理 2 组「blog 赢」的簇，方向与常规相反 | convert 页只强化工具属性，blog 页退让为 How to |
| 4 | **不做合并** | Jaccard 0.026，合并无收益 |

### 裁决

> 🟡 **H2 方向合理但"减少权重分散"这个机制未被证实。** 内容内耗已排除（F1），所以分工解决的不是"内容重复"，而是"意图信号竞争"——这个机制在本地数据上**无法验证**。
>
> 🔴 **最重要的一条反例**：`mobi-to-epub` 组 convert 已是 227:7 的压倒性优势，Google 显然已正确区分。**对已自洽的簇做改动，风险大于收益。**

---


## H3：27 个 Seed Page 适合外链建设

### FACT

| # | 事实 | 数据 |
|---|---|
| 1 | 有效资产（有曝光）| **27 个**（已剔除 301/3、404/1、tag/1、homepage/2、es_无译文/3）|
| 2 | 其中 pos≤20 | 4 个 |
| 3 | 这些页的点击 | **全部 0** |
| 4 | 🔴 站点外链基线 | **UNKNOWN** — 项目内无外链数据 |
| 5 | 🔴 反例：`/convert/epub-to-zip` | **零 guide 内链**却 pos 14.8 全站最佳 |

### ASSUMPTION

- 假设「给已有曝光的页加外链能提升排名」| 业界通行，无本地验证 |

### UNKNOWN

- 🔴 **站点当前外链数量、质量、增长速度**（U5）|
- 外链与 position 的因果关系 |
| Seed List 中哪一页的回报最高（无基线无法排序）|

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🔴 **无基线即投放 = 盲投** | 高 | 不知道现在有多少外链、不知道目标是多少 |
| 🔴 投放 301/404/tag 页 | 高 | 已由 URL 分类剔除，但执行时仍需人工复核 |
| 🟡 低量级页回报差 | 中 | 27 个中大量是 pos>50 的长尾 |

### VALIDATION METHOD

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | 🔴 **先拉外链基线**（Ahrefs / Semrush / GSC 外部链接报告）| 解除 U5 |
| 2 | 按 pos 分层投放，Top20 优先 | 分层依据已在本文件给出 |
| 3 | 每批投放后 30 天复测 position | VI v1.0 口径 |
| 4 | 人工复核投放目标不在 301/404/tag 集合内 | 门禁 G3 已自动化，但执行时仍需确认 |

### 裁决

> 🔴 **H3 当前不可执行。** 27 个 Seed List 本身是干净的（已剔除 5 类无效 URL），但**「适合外链建设」这个判断需要外链基线才能成立**。
>
> 在 U5 解除前，唯一能做的是**准备投放清单**，不能投放。

---


## H4：Guide 可以作为 Authority 资产

### FACT

| # | 事实 | 数据 |
|---|---|---|
| 1 | 有曝光的 Guide 页 | **3 个** |
| — | `/guide/calibre-vs-online-converter` | 43 曝光，pos 48.7 |
| — | `/guide/epub-to-txt-extract` | 1 曝光，pos 71 |
| — | `/guide/mobi-to-epub-keep-formatting` | 93 曝光，pos 81.2 |
| 2 | 零曝光 Guide | 21 个 |
| 3 | Guide 最高曝光页的全站排名 | 第 4（93 曝光）|
| 4 | 12 组重叠簇中 Blog↔Guide 同名 | 存在（见 INTENT_PARTITION_V2）|

### ASSUMPTION

- 假设「guide 页面类型能承接外链权重并传递到 convert 页」| 未验证 |

### UNKNOWN

| guide 页是否在 sitemap 中（全站 sitemap 输出，但未逐条核实 guide 段过滤逻辑）|
| guide 与 convert 之间的实际权重传递 |

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🟡 样本极小 | 中 | 仅 3 个 guide 有曝光，其中 1 个仅 1 次曝光 ⇒ 结论强度弱 |
| 🟡 可能与 convert 抢同一词 | 中 | `cbr-to-pdf`、`djvu-to-pdf` 三目录全撞 |
| 🟢 A6 修正后已不排除 Guide | 低 | V1 的"guide 零曝光"结论已纠正 |

### VALIDATION METHOD

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | 优先投 `/guide/mobi-to-epub-keep-formatting`（93 曝光，全站第 4）| 已有验证基础 |
| 2 | 30 天后观察该页 position 与 convert 页 position 的联动 | 若无联动 ⇒ 权重不传递 |
| 3 | 三目录全撞的 2 组先做 intent 分工再投外链 | 避免加剧竞争 |

### 裁决

> 🟡 **H4 方向成立但样本不足。** 3 个有曝光 guide 证明「guide 类型能被 Google 认可」，但 93 + 43 + 1 的曝光量不足以证明「guide 是好的外链标的」。
>
> **可做**：优先投最高曝光那 1 个并观察联动。**不可做**：把 guide 整体列为 Authority 资产类别。

---


## H5：Spam Update 恢复期适合进行外链建设

### FACT

| # | 事实 | 数据 |
|---|---|---|
| 1 | 全站 91 天点击 | **3**（全在首页）|
| 2 | Google 近 7 天曝光趋势 | 10-05 日报：recent7 37 vs prev7 51（**-27.5%**）|
| 3 | Bing Web 同期 | 614 曝光 / 22 点击（**+26.1%**）|
| 4 | 🔴 **GSC 人工处置记录** | **本项目无任何数据** |
| 5 | 🔴 站内是否存在被 Google 认定的违规信号 | 无本地证据 |

### ⚠️ 措辞纪律

本项目**没有任何 Google 官方人工处罚证据**（无 GSC 人工处置报告、无 Search Console 消息记录）。因此：

| ❌ 禁止表述 | ✅ 允许表述 |
|---|---|
| Google penalized this site | **Spam Update 后的表现变化** |
| Spam penalty | **Recovery hypothesis** |
| The site was punished | 2026-08 Google Spam Update 期间的排名波动（原因未验证）|

### ASSUMPTION

- 假设「当前 Google 表现与 2026-08 Spam Update 有关」| ⚠️ **这是一个未验证的假设**。项目记忆中有该背景记录，但**无 GSC 官方证据** |
- 假设「恢复期加外链能加速恢复」| 无本地证据 |

### UNKNOWN

- 🔴 **是否存在 Google 人工处置**（U6）|
| 2026-08 前后 position 是否有可测断崖 |
| Bing 与 Google 反向是 Spam Update 导致还是其他原因 |

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🔴 **若真有处罚，外链会加重问题** | 高 | 人工处罚下大量外链可能被判为「试图以链接规避处罚」|
| 🔴 **措辞风险** | 高 | 报告若写"Google penalized"而实际无证据，属**编造事实** |
| 🟡 恢复期投放时机不当 | 中 | 无法判断当前处于恢复期还是常态期 |

### VALIDATION METHOD

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | 🔴 **先查 GSC 人工处置记录**（Security & Manual Actions）| 解除 U6 |
| 2 | 查是否存在「网址检查」以外的排名断崖证据 | 需 2026-07/08 的 position 历史 |
| 3 | 若确认无人工处置 → H5 转为「外链建设时机」问题，而非「处罚恢复」问题 | |
| 4 | 若确认有人工处置 → **暂停外链建设**，先处理处罚 | |

### 裁决

> 🔴 **H5 当前不可执行，且措辞需严格改写。**
>
> 1. **"Spam Update 恢复期"这个前提本身没有 GSC 官方证据支撑**。正确表述是「2026-08 Google Spam Update 期间出现 Google 单渠道下滑，Bing 同期反向增长，**原因未验证**」。
> 2. **若存在人工处罚，外链建设会加重问题**⇒ 必须先查 GSC Manual Actions。
> 3. 在 U6 解除前，**不进行任何外链投放**。
