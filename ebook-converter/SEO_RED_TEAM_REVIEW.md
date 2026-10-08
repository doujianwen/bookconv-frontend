# 红队审计（SEO_RED_TEAM_REVIEW）

> 阶段：**RED TEAM** · 2026-10-07 · 逐条反驳本 Phase 的三个核心假设
> 纪律：每条反驳强制给 **FACT（已实测）/ ASSUMPTION（推断）/ UNKNOWN（不可判定）**，不用经验替代证据

---


## 假设 1：「意图分工一定有效」


### 反驳结论：**不成立。** 方向对，但"一定有效"这个词无法被任何本地数据支持，且有 3 条反证。


### FACT（实测）

| # | 事实 | 证据 |
|---|---|---|
| F1 | **8-gram Jaccard 最高仅 0.026**（阈值 0.40），31 页对 blog/guide 零内容内耗 | `_wb_tmp/_audit_cannib.json` |
| F2 | 项目自有独立脚本测得两两平均 **0.002**、最高 0.143 | `数据分析/convert差异化-文本层报告.md`（2026-10-07）|
| F3 | 12 组重叠中，**8 组 GSC query 分摊数 = 0** | `CANNIBALIZATION_REPORT.md` 第三节 |
| F4 | 4 组有分摊中，**`mobi-to-epub`（22 query）convert 227 曝光 vs blog 7 曝光 ⇒ convert 已压倒性胜出** | GSC 91 天 |
| F5 | `epub-to-azw3` 组 convert 64 曝光 pos 53.9 **落后** blog 54 曝光 pos 46.1 ⇒ blog 反而更强 | GSC 91 天 |
| F6 | `azw3-vs-mobi` 组 blog 21 曝光 / guide **0 曝光** ⇒ 无改动的现状下 blog 已自然胜出 | GSC 91 天 |

### 反证逐条

**反证 A（F3）—— 大部分重叠根本没发生竞争。**
12 组里 8 组的 GSC query 分摊数是 **0**。对这些组做 title 分工，**没有任何可观测的竞争需要解决**。若把"12 组全改"当成一个包，风险是把 8 个无需改动的页一起改了，而收益只可能来自 4 个组。


**反证 B（F4）—— 已经自洽的组，改了可能无效。**
`mobi-to-epub` 是分摊最严重的组（22 query），但 convert 页 227 曝光 vs blog 7 曝光，**已经是 32:1 的压倒性优势**。这说明 Google 已经成功区分了二者。**对一个已经被正确理解的页面做 title 手术，风险大于收益**（见 UNKNOWN U2）。


**反证 C（F5）—— 有两组现状是"blog 赢"，与分工目标相反。**
| 组 | Convert | Blog | 谁在赢 | 分工目标 |
|---|---|---|---|---|
| `epub-to-azw3` | 64 imp / pos 53.9 | 54 imp / pos **46.1** | **blog** | convert 应赢 |
| `azw3-vs-mobi` | （无 convert 页）| 21 imp / pos 42.8 | **blog** | guide 应赢知识意图 |
| `mobi-to-epub` | 227 imp / pos 70.3 | 7 imp / pos 66.6 | **convert** | convert 赢 ✅ |

🔴 **关键推论**：`epub-to-azw3` 的 blog 页 pos 46.1 优于 convert 页 53.9，且 blog title 是 "Free EPUB to AZW3: Get Your Ebooks Onto Kindle Natively" —— **blog 页带 "Free" 而 convert 页也带 "Free"，两页在抢同一个词**。

**这不是"分工"能解决的问题，而是"两页都想要同一个词"的结构冲突。** 分工方案（把 blog 改成 "How to"）只是让 blog 退让，**但没有任何数据证明 convert 页能接住这个位置**（convert 已经在 53.9，退让后未必能升）。


### ASSUMPTION（合理推断，未验证）

| # | 假设 | 置信度 |
|---|---|---|
| A1 | Google 依据 title/URL 判定页面意图，把 "converter" 归为工具类 | 中（业界通行做法，但本项目无对照实验）|
| A2 | 消除同词竞争后，权重会集中到单一页面 | 中低 |
| A3 | 分工后被"退让"的一方不会因此掉出索引 | 低（301/noindex 类风险不可测）|

### UNKNOWN（不可判定）

| # | 未知 | 缺什么 |
|---|---|---|
| U1 | Google 当前**如何理解**每页意图（是否已正确分类）| 需 Google 抓取日志或人工评审 |
| U2 | title 变更后是否**净增益**（可能被 Google 判为 title 改写降权）| 需 A/B 或前后对比 + 30 天窗口 |
| U3 | 8 个"零分摊"组是否在**其他语言或设备**上发生竞争 | 现有 GSC 数据未按语言/设备拆分到页级 |
| U4 | blog 页 pos 更优是**内容质量导致**还是**query 组合差异** | 需按 query 级别对比两页命中的具体词 |

### 给本 Phase 的修正建议

| 原计划 | 修正后 |
|---|---|
| 12 组全部分工 | **只做 4 组有 GSC 分摊的**（mobi-to-epub、epub-to-azw3、epub-to-mobi、azw3-to-mobi）+ 2 组三目录全撞（cbr-to-pdf、djvu-to-pdf，因 title 语义近乎相同属明显缺陷）|
| 12 组一起改，一次性上线 | 分两批：先做 2 组三目录全撞（低风险、无历史包袱），观察 30 天，再做 4 组有分摊的 |
| 分工后 convert 必然受益 | **删除该预期**。`epub-to-azw3` 的 blog 优于 convert 是事实，不能假设分工能翻转 |

---


## 假设 2：「CTR 优化一定带来点击」


### 反驳结论：**在当前排名下，CTR 优化对 10/11 页无作用对象。** 这是本 Phase 最硬的反驳。


### FACT（实测）

| # | 事实 | 证据 |
|---|---|---|
| F1 | Tier A+B 共 11 页，**曝光合计 627，点击 0** | GSC 91 天 |
| F2 | 11 页 position 区间 **14.8 – 82.1**，**仅 `/convert/epub-to-zip`（pos 14.8）落在 Google 可见区** | GSC 91 天 |
| F3 | **全站 91 天总点击 3 次，全部在首页** ⇒ 不是 Convert 页的 CTR 问题，是全站问题 | GSC 91 天 |
| F4 | `/blog/epub-to-azw3` **pos 46.1（排名比 convert 页更好）也是 0 点击** | GSC 91 天 |
| F5 | 🔴 **blog 67 页 + guide 24 页 = 91 页 description 为空** ⇒ Google 只能自行抓正文生成 snippet | 源码解析 `metaDescription` 命中 0 |
| F6 | `/convert/epub-to-zip` pos 14.8、45 曝光、**0 点击** ⇒ 唯一在可见区的页也点不动 | GSC 91 天 |

### 反驳逻辑

**CTR = 点击 / 曝光。分子分母都是位置(position)的函数。**

当 position 在 50 名以后，Google 几乎不产生展示（imp）也不产生点击。**没有展示，就没有 CTR 可优化。**

本组 11 页中：
- 1 页（`epub-to-zip`，pos 14.8）有真实展示 → CTR 优化**可能**有效；
- 10 页（pos 34–75）无展示 → CTR 优化**确定无效**（分母为 0 或近 0）。


🔴 **而 F6 更进一步否定了唯一的那 1 页**：`epub-to-zip` pos 14.8、45 次曝光、CTR = 0%。

**45 次曝光 0 点击**有两种解释，本数据集无法区分：
1. **title 确实没吸引力**（title 缺陷 → CTR 优化有效）；
2. **用户看到但不点**（需求不匹配 / 品牌陌生 / SERP 位置实际渲染位置远低于 14.8 平均值）。

⚠️ **注意一个技术陷阱**：GSC 的 position 是**平均值**。`epub-to-zip` 的 14.8 是 6 个 query 的加权平均，**不代表每次展示都在第 15 位**。真实展示位置分布可能是「1 次第 5 位 + 5 次第 40 位」。本项目**无 SERP 真实展示位置数据**（需 GSC 逐日逐 query 或第三方 SERP 追踪）。


### ASSUMPTION

| # | 假设 | 置信度 |
|---|---|---|
| A1 | 现行 title 缺少强卖点（Free / No Sign-up / Instant）压制了 CTR | 低——实测 31/31 页已含 "Free"，31/31 含免注册语义 |
| A2 | 补齐 description 缺失能提升 CTR | **中**（这是本 Phase 唯一有实测支撑的 CTR 假设：F5 描述了可控性缺失，但**无本项目数据证明补 description 后 CTR 会涨**）|
| A3 | position 提升后 CTR 优化才有意义 | **高**（符合 CTR 的基本数学定义）|

### UNKNOWN

| # | 未知 | 缺什么 |
|---|---|---|
| U1 | `epub-to-zip` 45 次曝光的真实展示位置分布 | 需逐日逐 query position 或 SERP 追踪 |
| U2 | 这 45 次曝光的**实际设备/地区分布** | 现有 GSC 未拆到页 × 设备 × 地区 |
| U3 | 补 description 后 CTR 实际变化 | 需实施后 30 天对比，本项目无 A/B 能力 |
| U4 | 用户是否因**品牌陌生**而不点（而非 title 问题）| 需品牌词 vs 非品牌词 CTR 对比。现有数据：唯一进 Top10 的是品牌词 bookconv |

### 给本 Phase 的修正建议

| 原计划 | 修正后 |
|---|---|
| 优化 11 页 title 提升 CTR | **先补 91 页 blog/guide 的 description**（这是确定的缺陷，且 F4 证明 blog 排名更好却同样 0 点击，说明 snippet 是可控短板）|
| 以 CTR 提升为 Phase 1 目标 | **把 Phase 1 目标改为"为 position 爬进前 20 做准备"**，CTR 是次级收益 |
| 按曝光量排优先级 | **按 position 排优先级**（离可见区最近的优先）|
| 忽略 position 直接优化 CTR | **epub-to-zip 单独做**（唯一有展示机会），其余 10 页的 title 改动推迟到 position < 30 之后 |

---


## 假设 3：「Authority 是最大瓶颈」


### 反驳结论：**无法确认它是"最大"瓶颈——本项目缺少做这个判断所需的全部三类数据。** 说它是最大瓶颈，目前是 ASSUMPTION，不是 FACT。


### 支持假设的 FACT

| # | 事实 | 证据 |
|---|---|---|
| F1 | 全站 91 天点击 **3 次** | GSC |
| F2 | Convert 页平均 position 50–75，**122 页中仅 3 页在 Top20** | GSC + 122 页全量扫描 |
| F3 | **guide 目录 24 页全部零曝光** | GSC |
| F4 | 3 个 Top20 页面中，`/convert/epub-to-zip`（pos 14.8） | GSC |
| F5 | 🔴 **项目内无任何外链数据**（无 Ahrefs/Semrush/GSC 外部链接报告）| 全项目文件搜索确认 |

### 反驳理由

**"最大瓶颈"是相对判断，需要比较所有候选瓶颈的量级。** 本 Phase 设计了 3 个并行方案（意图分工 / CTR 优化 / Authority 建设），要判断 Authority 是否"最大"，需要：

| 候选瓶颈 | 量化所需数据 | 本项目有吗 |
|---|---|---|
| Authority（域名权重）| 外链数量/质量/增长速度 | ❌ **完全没有** |
| 内容质量 | 内容量、差异化度、原创度 | ✅ 有（已审计：实测字数、FAQ、差异化 FAIL）|
| 收录覆盖 | Index Coverage / 索引率 | ❌ **完全没有**（MASTER_PLAN U1）|
| 搜索需求匹配 | 关键词搜索量 | ❌ 无（`constants.ts` 搜索量表已证伪脱节）|
| 技术 SEO | canonical/schema/sitemap/HTTP | ✅ 有（已审计：全部健康）|

🔴 **三类关键数据（外链、索引覆盖、搜索量）全部缺失。** 在这个前提下宣称 Authority 是"最大"瓶颈，等于在只测了一个变量的情况下下结论。


### 一个被忽视的替代解释

**F3（guide 24 页全部零曝光）这个事实，Authority 假设解释不了。**

| 观察 | Authority 假设的解释 | 竞争/结构假设的解释 |
|---|---|---|
| guide 全零曝光 | guide 权重太低 | guide 与 blog title 语义撞（`/guide/azw3-vs-mobi` vs `/blog/azw3-vs-mobi` 实测 title 几乎相同）⇒ 自身被压制 |
| `epub-to-zip` 无内链却 pos 14.8 | 不符合 Authority 假设 | ✅ 与 Authority 无关，纯属需求匹配 |

⚠️ **第二个观察是决定性的反证**：`epub-to-zip` **没有任何 guide 内链**（INTERNAL_LINK_REPORT 实测），却拿到全站最佳 position 14.8。

**若 Authority（权重积累）是主导因素，一个零内链的孤立页不可能是最好的排名页。**

### ASSUMPTION

| # | 假设 | 置信度 |
|---|---|---|
| A1 | 站点外链/域名权威度低 | **无法评估**（无数据）|
| A2 | 提高外链能提升排名 | 中（业界通行，但本项目无对照）|
| A3 | Authority 是**最大**瓶颈 | **低**——无法与"收录覆盖""需求不匹配"比较 |
| A4 | 新站（域名年龄短）天然权重低 | 中——但站点具体上线日需另证 |

### UNKNOWN

| # | 未知 | 缺什么 |
|---|---|---|
| U1 | **站点当前外链数量、质量、增长速度** | 需 Ahrefs/Semrush/GSC 外链报告 —— 这是最关键的缺口 |
| U2 | 18 个零曝光 convert 页是否已被收录 | 需 GSC Index Coverage |
| U3 | 竞品的 position 分布如何 | 项目内有 `数据分析/competitor-serp-2026-10-05.json`，但本审计未展开对比 |
| U4 | 站点上线至今的**自然外链增长曲线** | 需历史快照 |

### 给本 Phase 的修正建议

| 原计划 | 修正后 |
|---|---|
| 假设 Authority 是最大瓶颈并优先投外链 | **先花 1 天拉外链基线**（P0 前置，见 MASTER_PLAN 30 天动作）。**没有基线就无法判断外链投入的边际收益** |
| 按 Authority 逻辑排序 Seed List | Seed List 保留（它是必要条件），但**在拿到外链数据前不投预算** |
| 认为 guide 零曝光 = 权重低 | **优先检查 guide 与 blog 的 title 撞车**（已实测相似），这比外链更可能是原因 |
| — | 新增一条假设到 MASTER_PLAN：**"零曝光主因是收录覆盖不足"**（假设 A6），并把它排到与 Authority 同级 |

---


## 汇总：三条假设的裁决


| 假设 | 裁决 | 核心理由 |
|---|---|---|
| 1. 意图分工一定有效 | **部分成立，措辞不成立** | 方向对（Jaccard 0.026 无内耗 ⇒ 权重分散是真实结构问题），但 8/12 组零分摊无需改、1 组已自洽、2 组现状是 blog 赢 ⇒ 不能说"一定有效" |
| 2. CTR 优化一定带来点击 | **不成立** | 10/11 页 position > 34 无展示机会；唯一有展示的 `epub-to-zip` 45 曝光 0 点击；且真实展示位置分布未知 |
| 3. Authority 是最大瓶颈 | **无法确认** | 外链/索引覆盖/搜索量三类数据全缺；且 `epub-to-zip` 零内链却 pos 14.8 是直接反证 |

## 三条假设共同的方法论问题


| 问题 | 说明 |
|---|---|
| 🔴 **三个方案都没解决"点击为 0"** | Tier A+B 曝光 627，点击 0。任何方案若不改变 position，CTR 都无从谈起 |
| 🔴 **都建立在 position 可变的假设上** | 但 position 50→20 需要什么？本项目三份数据都答不了 |
| 🟡 **最可能的真瓶颈未被检验** | MASTER_PLAN U1（索引覆盖）与 U3（搜索量）两项数据若显示"大部分页面根本没被索引"或"大部分格式没人搜"，则本 Phase 三个方案全部**方向错误** |

## 红队给出的 Phase 1 优先级重排


| 顺序 | 动作 | 依据 | 性质 |
|---|---|---|---|
| **P0** | 拉 GSC Index Coverage | MASTER_PLAN U1；若显示未收录则本 Phase 全部方案作废 | 解锁判断 |
| **P0** | 拉外链基线（Ahrefs/Semrush）| 假设 3 的 U1；无基线则"Authority 是最大瓶颈"无法验证 | 解锁判断 |
| **P1** | 补 blog 67 页 + guide 24 页 description | F5（91 页缺失）+ F4（blog 排名更好仍 0 点击）⇒ snippet 是确定短板 | 确定缺陷 |
| **P2** | 2 组三目录全撞 title 分工（cbr-to-pdf、djvu-to-pdf）| title 语义近乎相同，无历史包袱，改动风险最低 | 低风险 |
| **P2** | `epub-to-zip` title/description 优化 | 唯一有真实展示机会（pos 14.8）| 唯一 CTR 有效对象 |
| **P3** | 4 组有 GSC 分摊的意图分工 | 2 组现状与目标相反（blog 赢），风险高于收益 | 需先解决 P0 |
| **P3** | 其余 5 页 title 重写 | pos 51–75，无展示机会 | 推迟到 position < 30 后 |
| **P4** | 外链投放 | **在拿到基线前不投** | 前提缺失 |

## 最终裁决


> **本 Phase 的三个假设，两个被实测数据削弱（假设 1、2），一个被判定为无法验证（假设 3）。**
>
> **可以现在就做且方向正确的只有 3 件**：① 补 91 页 description（确定缺陷）；② 2 组三目录全撞的 title 分工（低风险）；③ `epub-to-zip` 单页 title/desc 优化（唯一有展示机会）。
>
> **在做任何事之前，必须先花 1–2 天拿到 Index Coverage 与外链基线。** 因为如果 18 个零曝光页的根因是"根本没被收录"，那么本 Phase 设计的 3 个方案（意图分工、CTR、外链）**全部指向错误的方向**。
