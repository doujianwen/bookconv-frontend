# BookConv SEO Recovery · Phase 1 执行计划

> 生成：2026-10-07 17:50 · **DESIGN ONLY** — 未修改任何页面 / content / metadata / sitemap / canonical
> 基线：`SEO_AUDIT_V2.md`（已通过 Evidence Validation Gate）
> 门禁：`SEO_PHASE1_GATE`（G1–G7，见第十一节）

---


## 1. 当前 Baseline

### 1.1 资产

| 项 | 值 |
|---|---|
| Convert 页 | 31 |
| blog 页 | 66 |
| guide 页 | 24 |
| live 合计（已排除 noindex）| 121 |

### 1.2 表现

| 项 | 值 |
|---|---|
| Convert 零曝光 | **18 / 31（58.1%）** |
| Tier A / B / C / D | 6 / 5 / 2 / 18 |
| 全站点击（91 天）| **0**（3 次全在首页）|
| Top20（全站 / 资产）| 5 / 4 |
| 有曝光的 guide | **3** |

### 1.3 description

| 项 | 值 |
|---|---|
| 为空 | 0 |
| **>160 字符** | **81 / 121（66.9%）** |
| 140–160 合规 | 30 |
| <120 过短 | 3 |
| 平均 / 最长 | 285 / 961 字符 |

### 1.4 URL 分类（穷尽式）

| 分类 | 数 | 可投外链 |
|---|---|---|
| 资产（en） | 25 | ✅ |
| 资产（es） | 2 | ✅ |
| 301 重定向 | 3 | ❌ |
| 真 404 | 1 | ❌ |
| tag 聚合页 | 1 | ❌ |
| 首页 | 2 | ❌ |
| /es/ 无西语译文 | 3 | ❌ |
| **合计** | **37** | **有效资产 27** |

---


## 2. Description 优化

📄 完整方案：`DESCRIPTION_REWRITE_PLAN_V1.md`

| 项 | 内容 |
|---|---|
| 目标页数 | 81（>160）|
| 方案选择 | **B 语义重写**（否决 A 机械截断）|
| 否决理由 | intro 结构为「背景 → 价值 → 卖点」，机械截断会稳定丢弃卖点 |
| 模板 | Convert（意图+能力+利益+CTA）/ Blog（问题+方案+收益）/ Guide（主题+收获+关键内容）|
| 实施批次 | 4 批：14（有曝光可测）→ convert → blog → guide |

**第 1 批（有曝光 + 超长，30 天内可测）**

| URL | 曝光 | Pos | 当前长度 |
|---|---|---|---:|
| `/convert/epub-to-doc` | 131 | 51.2 | 178 |
| `/guide/mobi-to-epub-keep-formatting` | 93 | 81.2 | 196 |
| `/blog/ebook-formats-explained` | 63 | 64.5 | 283 |
| `/blog/epub-to-azw3` | 54 | 46.1 | 255 |
| `/blog/epub-to-mobi-guide` | 49 | 72.1 | 412 |
| `/convert/epub-to-zip` | 45 | 14.8 | 170 |
| `/blog/why-convert-lit-to-epub` | 26 | 29.8 | 292 |
| `/blog/azw3-vs-mobi` | 21 | 42.8 | 439 |
| `/blog/can-kindle-read-azw3` | 21 | 18 | 459 |
| `/convert/lit-to-epub` | 19 | 34.8 | 179 |
| `/blog/best-ebook-reader-apps` | 7 | 59.6 | 251 |
| `/blog/mobi-to-epub` | 7 | 66.6 | 472 |
| `/blog/mobi-to-kobo` | 1 | 19 | 457 |
| `/guide/epub-to-txt-extract` | 1 | 71 | 232 |

⚠️ **限制**：81 页的 Proposed 描述在设计稿中以**模板骨架**表示，逐页实际文案需在实施阶段撰写。

---


## 3. Intent Partition

📄 完整方案：`INTENT_PARTITION_PLAN_V2.md`

| 项 | 值 |
|---|---|
| 簇数（**实测，非假设 9 组**）| **12 组** |
| 三目录全撞 | 2 组（cbr-to-pdf、djvu-to-pdf）|
| Convert 意图 | Transactional / Tool |
| Blog 意图 | Informational / How-to |
| Guide 意图 | Informational / Reference |
| 需调整 Title 方向的页 | 见 V2 文档 |
| 实施顺序 | 第 1 批 2 组全撞（零曝光、无历史包袱）→ 有分摊簇 → 其余 |

---


## 4. Title 实验

📄 完整方案：`TITLE_EXPERIMENT_PLAN.md`

| 项 | 值 |
|---|---|
| 实验池 | **6 页**（仅 Tier A Convert，不做全站改）|
| 准入 | Tier A / Top20 / 有曝光但 CTR=0（三者去重）|
| 排除 | Tier B/C/D 共 25 页 + 全部 blog/guide |
| 字符合规 | Title 50–60 · Desc 140–160 |
| 验证 | 30 天，比 **position**（不是 CTR，因全站点击为 0）|
| 对照组 | 未改动的 Tier B（5 页）|
| 无法做 | 同页 title A/B（无多版本框架）|

---


## 5. Authority Seed

📄 完整方案：`AUTHORITY_SEED_PLAN_V2.md`

| Tier | 定义 | 页数 |
|---|---|---|
| A | pos ≤ 20 | 4 |
| B | Top21–50 | 7 |
| C | Top51+ | 16 |
| D | 有曝光但无稳定排名 | 0 |
| **合计** | | **27** |

**3 个有曝光 guide（不因类型排除）**

| URL | 曝光 | Pos | 全站排名 |
|---|---|---|---|
| `/guide/calibre-vs-online-converter` | 43 | 48.7 | 第 16 / 37 |
| `/guide/epub-to-txt-extract` | 1 | 71 | 第 30 / 37 |
| `/guide/mobi-to-epub-keep-formatting` | 93 | 81.2 | 第 35 / 37 |

🔴 **外链投放的前置条件未满足**：U5（外链基线）UNKNOWN ⇒ 清单可备，投放不可行。

---


## 6. Index Coverage

📄 完整定义：`INDEX_COVERAGE_GAP.md`

| 项 | 内容 |
|---|---|
| U1 | 已知 |
| 需取得的 8 类状态 | Indexed / Crawled-not-indexed / Discovered-not-indexed / Excluded-noindex / Duplicate / Alternate / Soft 404 / Other |
| 第一批验证对象 | **18 个零曝光 Convert URL**（已列出）|
| 采集途径 | GSC 网页索引报告（快）/ URL Inspection（细，有配额）|
| 决策树 | 已定义 4 分支（见该文档第四节）|

🔴 **不得推断**「零曝光 = 未收录」。三种成因在现有数据中表现完全相同。

---


## 7. Search Volume Gap

📄 完整定义：`SEARCH_VOLUME_DATA_GAP.md`

| 项 | 内容 |
|---|---|
| U3 状态 | **UNKNOWN** |
| constants.ts KEYWORDS | 50 条（live 29 / planned 21）|
| 采集来源 | 源码注释：Ahrefs Free KD Checker（2026-07-09）|
| 🔴 已发生的证伪 | `epub-to-zip` 曾被判「伪需求」建议 noindex → **现 45 曝光 pos 14.8 全站最佳** |

**被 U3 阻塞、当前禁止的决策**

| # | 决策 | 状态 |
|---|---|---|
| 1 | 删除任何 Convert 页 | 🚫 禁止 |
| 2 | 合并任何页面 | 🚫 禁止 |
| 3 | 新增格式组合页 | 🚫 禁止 |
| 4 | 把零曝光判定为「无需求」| 🚫 禁止 |
| 5 | 按 KD 排优先级 | 🚫 禁止 |

---


## 8. Red Team

📄 完整版：`SEO_RED_TEAM_PHASE1.md`（5 条假设 × FACT/ASSUMPTION/UNKNOWN/RISK/VALIDATION）

| 假设 | 裁决 | 关键理由 |
|---|---|---|
| H1 description 提高 CTR | 🔴 **当前不可验证** | 81 页缺陷客观存在，但 position 34–75 无展示位 ⇒ 无从测 CTR |
| H2 Intent Partition 减少权重分散 | 🟡 方向合理，机制未证实 | Jaccard 0.026 已排除内容内耗；`mobi-to-epub` 已 32:1 自洽；`epub-to-azw3` 现状是 blog 赢 |
| H3 27 个 Seed 适合外链 | 🔴 **当前不可执行** | U5 外链基线 UNKNOWN ⇒ 无法判断边际收益 |
| H4 guide 可作 Authority 资产 | 🟡 方向成立，样本不足 | 3 个有曝光（93/43/1），证明类型被认可但不足以支撑类别结论 |
| H5 Spam Update 恢复期适合外链 | 🔴 **不可执行 + 措辞需改写** | 无 GSC 人工处置证据（U6）；若真有处罚，外链会加重问题 |

### ⚠️ 措辞纪律（G5）

| ❌ 禁止 | ✅ 允许 |
|---|---|
| Google penalized | **Spam Update 后的表现变化** |
| Spam penalty | **Recovery hypothesis** |
| 被 Google 处罚 | 2026-08 期间 Google 单渠道下滑，**原因未验证** |

---


## 9. 实施顺序

| 步 | 动作 | 前置 | 阻塞了什么 | 可否跳过 |
|---|---|---|---|---|
| **1** | 🔴 查 GSC 人工处置记录 | 无 | H5 / U6 | 否 |
| **2** | 🔴 拉 Index Coverage | 无 | 18 页存废、18 页根因、U1 | 否 |
| **3** | 🔴 拉外链基线（Ahrefs/Semrush）| 无 | H3 / U5 | 否 |
| **4** | 🔴 重拉搜索量 | 无 | U3、删除/合并/新增决策 | 否 |
| 5 | Description 第 1 批（14 页）| 步 2 完成 | — | 可，但需接受"测不出效果" |
| 6 | Title 实验（6 页）| 步 5 完成 | — | 可 |
| 7 | Intent 第 1 批（2 组）| 无 | — | 可 |
| 8 | 外链投放 | **步 1+3 完成** | — | **否，前置未满足** |

🔴 **步 1–4 全部是「取数据」而非「改页面」。** 在这 4 步完成前，任何页面改动都无法归因。

---


## 10. 预期验证指标

| # | 指标 | 当前 | 目标 | 判据来源 | 何时可测 |
|---|---|---|---|---|
| 1 | Index Coverage 中 `Crawled-not-indexed` | UNKNOWN | 取得基线 | GSC | 步 2 后 |
| 2 | Index Coverage 中 `Duplicate` | UNKNOWN | 取得基线，期望 0 | GSC | 步 2 后 |
| 3 | description >160 页数 | 81 | 0 | 源码解析 | 步 5 后 |
| 4 | description 140–160 合规页数 | 30 | 121 | 源码解析 | 步 5 后 |
| 5 | Tier A 六页加权 position | 62.9 / 56.4 / 82.1 / 53.9 / 51.2 / 74.8 / 62.8 / 14.8 / 34.8 / 70.3 / 45.4 | 改善（VI ≥20% 才算信号）| GSC | 30 天后 |
| 6 | Convert 页 pos≤20 的数量 | 1 | 增加 | GSC | 30 天后 |
| 7 | `Duplicate` 状态（意图分工的副作用）| UNKNOWN | 保持 0 | GSC | 步 7 后 30 天 |
| 8 | 外链基线 | UNKNOWN | 取得基线 | Ahrefs/Semrush | 步 3 后 |
| 9 | GSC 人工处置 | UNKNOWN | 确认有无 | GSC | 步 1 后 |

### ❌ 不能作为验证指标的

| 指标 | 为什么不行 |
|---|---|
| CTR | 全站点击 0，无基线；且 position >20 时无展示 |
| 转化 | 需先有流量 |
| 「排名变好」的直觉判断 | 无对照，必须用 VI v1.0 口径 |

---


## 11. 硬门禁（G1–G7）

| # | 门禁 | 实现 |
|---|---|
| G1 | 所有数字来自数据层 | 每个数字带来源标记，报告生成器不手写常量 |
| G2 | 报告结论数字必须与表格一致 | 解析每份报告表格，数值必须出现在结论句中 |
| G3 | URL 必须属有效资产，或明确标记为 301/404/tag/homepage/untranslated | URL 分类穷尽 + 逐行校验 |
| G4 | 不得出现 REMOVE / MERGE / NOINDEX（除非有 Index Coverage + Search Volume 证据）| 文本扫描 + 证据检查 |
| G5 | 不得出现 "Google penalized" / "Spam penalty" 等确定性表述 | 文本扫描（排除「禁止表述」对照列）|
| G6 | 任何 0 值结论必须通过多实现方式扫描 | ≥2 种实现交叉验证 |
| G7 | 任何 UNKNOWN 必须显式列出，不得转换成推断 | UNKNOWN 表存在性 + 计数一致性 |

**门禁状态：见本次运行的最终输出（PASS 或 FAIL，无中间态）**
