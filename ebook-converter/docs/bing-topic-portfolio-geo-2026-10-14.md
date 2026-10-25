# Bing Topic Portfolio (BETA) × GEO 价值最大化战略（bookconv.com）

> 创建：2026-10-14 ｜ 状态：V2 定稿（经红队审计 15 项发现修订，规划文件存档 `~/.workbuddy/plans/radiant-forging-babbage-LGg6wfad.md`）
> 数据源：BWT → AI Performance → Topic Portfolio (BETA)，站点 `www.bookconv.com/`，时间窗 1M (Sep)，实抓 2026-10-14
> 配套数据：`data/topic-portfolio-opportunities.json`（50 词唯一真相源，TP-id 计数）｜作战台模块 `M11`（`data/seo-geo-board.json`）
> ⚠️ 数据属性：**BETA**（"may evolve over time"）；**账号个性化**（"personalized based on your context"）；**月粒度窗口**；指标为近似区间。不可当市场通用数据对外表述。

---

## 一、定位与目标

**这个资产是什么**：Bing Copilot/Partner 引用侧的**差距地图**——
1. **Your Topic Portfolio**（7 主题）：bookconv 已被 AI 引用的主题版图，含 Topic Size（需求）、Sites Cited（竞争拥挤度）、Queries（主题宽度）。
2. **Top Opportunity Queries**（50 词）：竞品被引而 bookconv 未被引的 grounding queries，含 Citation Range（引用频次区间，推断项）。

**它不是什么**：不是 Google 排名数据；不是搜索量工具；不是市场通用数据。

**目标**：把可服务的机会词逐个变成被 AI 引用的落地页，并接入 GEO Growth Loop 的 R_pre/R_post 测量闭环。

**成功指标（双渠道分离，绝不与 Google 合并）**：
- Bing/AI 侧：P0 词从「BWT 未被引」→ 发布后探针 `is_bookconv=true`；Bing AI 手工导出（教材 SOP）出现 bookconv。
- 纪律指标：门禁零 BLOCK、人工审稿通过、报告 append-only、claim tier 合规。VI≥20% 仅 HEURISTIC。

## 二、7 主题组合（Sep 实抓）

| Topic | Topic Size | Sites Cited（竞争） | Queries（宽度） | 判读 |
|---|---|---|---|---|
| E-Books & Kindle | 10M-50M | 5K-10K | 10K-50K | **主场**：已立足、竞争适中、机会词最集中（10/50） |
| PDF & Document Software | 100M-500M | 10K-50K | 100K-500K | 大盘：需求最大，convert 词多但 402 受限 |
| Books | 10M-50M | 10K-50K | 50K-100K | 观察 |
| Audiobooks | 1M-5M | **1K-5K（最低）** | 10K-50K | **[HEURISTIC] 蓝海候选**：竞争最低+有宽度；替代解释=该主题 AI 引用活动总量可能本就低（低 Sites Cited ≠ 机会大，是两个命题）。⚠️ Sep 前 50 机会词中 **0 条** Audiobooks 词——仅主题级观察，暂无具体查询靶点，待下月快照验证 |
| Productivity Apps | 50M-100M | 10K-50K | 50K-100K | 观察 |
| Technology | 1B-5B | **100K-500K（最高）** | 1M-5M | **陷阱**：极拥挤且偏离电子书 niche，EXCLUDE |
| Online Utility Tools | 100M-500M | 10K-50K | 100K-500K | 邻接：多为图片/视频/音频词，能力边界外 |

## 三、核心亮点（4 条，均带证据边界）

1. **机会词与产品面高度重叠，但「可服务」比例需按实际计数**（F11 修正）：50 词中 convert 型命中 CONVERSION_MAP 的 **5 条**（epub转mobi / pdf to epub / convert pdf to epub / azw3 to pdf / mobi to pdf），guide/blog 型可承接 **11 条**，能力边界外（none）**33 条**，Technology **1 条**。→ 结论是「**已有承载面但未被 AI 引用**的词是主力」，而非泛泛的"80% 重叠"。
2. **`epub转mobi` ↔ Growth Loop 语义对应**（F4 修正：非逐字对齐）：BWT 原词 `epub转mobi`（zh）与既有 Growth Loop prompt `epub to mobi converter`（en）语义对应；Bing 确认该意图上 bookconv 未被引 = 现成 R_pre 第三方佐证。en 侧测量继续走既有 `geo/questions-seed.json` 闭环，不受本模块影响。
3. **CloudConvert 402 是最硬的现实约束**（F3 新增）：5 条 convert 词全部 tool=calibre → serverless 走 CloudConvert → **当前 402 无法交付转换**。给 AI 引用导流到失败转换是负体验 → convert 词标 **P1-parked**，解锁条件 = 额度恢复或纯 JS 路径扩展覆盖目标格式。M11 不新增 convert 页工作量（与 M2-8 同页顺带优化除外）。
4. **多语言分层**（F6 新增）：50 词中 en 38 / zh 2 / ja 1 / fr 2 / es 1（另 6 条见 JSON lang 字段）。zh/ja/fr 词站内无对应页面（de/ja 未建）→ 仅观察层，不进探针；zh 词部分源于账号上下文个性化。

## 四、优先级矩阵 [HEURISTIC]（可复现版，按序判定）

1. **EXCLUDE**：Topic=Technology。
2. **P2**：`capabilityFit=none`（无承载面、不建页、仅记录）。
3. **`capabilityFit=guide`**：已有强承载 guide → **P0**（强化）；需新建 guide → **P1**。
4. **convert 对**：`servableNow=true` → P0；false（402 波及）→ **P1-parked**。
5. on-niche 无工具但有 blog/guide 承载 → **P1**（Audiobooks 类，本批 0 条）。

### 优先级总表（计数真相源 = opportunities JSON TP-id）

| 优先级 | 数量 | 词 |
|---|---|---|
| **P0** | 2 | `send to kindle`(TP-022)、`amazon send to kindle`(TP-026) → 强化 guide `how-to-send-epub-to-kindle` |
| **P1**（内容承接） | 9 | `open epub file`、`epub reader online`、`epub reader`(→强化 `how-to-read-epub-on-kindle`)、`kindle vs kobo`、`kobo vs kindle`、`kindle vs kobo, which is the best`（新建 guide）、`kindle epub`(→强化 `kindle-formats`)、`e-reader buying considerations`(blog)、`epub online reader`(blog) |
| **P1-parked**（402 解锁后升级） | 5 | `epub转mobi`(epub-to-mobi)、`pdf to epub`、`convert pdf to epub`(pdf-to-epub)、`azw3 to pdf`(azw3-to-pdf)、`mobi to pdf`(mobi-to-pdf) |
| **P2**（能力边界外，仅记不建） | 33 | image to pdf、heic 系列、md转pdf/md to pdf、mkv/mp4/mov、ogg/mp3/wav、odt、dwg/dxf、pdf 编辑器类、pdf to csv/pdfa、pocket book verse pro 等 |
| **EXCLUDE** | 1 | `*.mp4 or *.mov or *.avi or *.mkv`（Technology） |

**R_pre 探针集（probeEligible=true，11 词，全部 en）**：open epub file / send to kindle / epub reader online / amazon send to kindle / epub reader / kindle vs kobo / kindle epub / e-reader buying considerations / epub online reader / kobo vs kindle / kindle vs kobo, which is the best。

## 五、内容映射（V2）

- **guide 型** → 强化 `src/data/guides/`：`how-to-send-epub-to-kindle`（P0）、`how-to-read-epub-on-kindle`、`kindle-formats`；新建 `kindle vs kobo` guide（登记 `guides/index.ts`）。
- **blog 型** → `src/data/blog/*.ts`（BlogPostMeta：intro+sections+faqs+Key Takeaways+schema），遵守 `英文博客写作指南.md` 11 步。
- **convert 型** → 挂起（402）；仅与 M2-8 同页时顺带优化（同页不两次触碰）；新 slug 须先注册 CONVERSION_MAP + CONTENT_MAP（`src/data/content/`，否则 `dynamicParams=false` 404）。
- 全部走 `seo-critic` → `critic-layer.blog` → `publish-gate`（Gate B）→ **人工审稿红线** → 用户「发布」触发 → `verify-nojs-render` + `verify-hreflang-canonical`。

## 六、测量设计（双层）

1. **既有层**：`geo/questions-seed.json`（28 词，含 `epub to mobi converter`）照旧走既有 Growth Loop 闭环，不动。
2. **本模块层**：`geo/topic-portfolio-questions.json` 仅收 **probeEligible=true 的 BWT 原样 en 词**（11 条），schema 对齐既有 5 字段（id/question/intent/target_slug/priority）。
   - 引擎现实（已核实 `geo/geo-exposure-probe.py`）：`probe`=Gemini+ChatGPT（`GEMINI_API_KEY`/`OPENAI_API_KEY` 至少其一）；**Brave=独立 `brave` 子命令 + `BRAVE_API_KEY`**；输出硬编码 `geo/exposure-report.*`。
   - **哈希锁**：`scripts/topic-portfolio-measure.mjs` 薄封装（不改 Python）——校验 `sha256(question)` 与存量一致（漂移 exit 2 fail-closed）→ 调 probe+brave → 输出立即归档带日期副本（防覆盖）→ 追加 `data/topic-portfolio-measurement.json`（append-only 时序，替代物理不存在的 geo_collector.db）。
   - **R_pre**：打标后立即采集（2026-10-18 前），与 BWT「未被引」交叉验证；有效期距发布 ≤14 天，超期重采。
   - **R_post**：发布后 **8 周 × 每周（仅 P0）**，P1 月频；每轮记录调用数；`cited=true` 连续 2 周或期满停测。
   - **成本上限**：11 词 × 3 引擎 ≈ 33 调用/轮；月度 Bing 手工导出三角印证（M11-6），注明月粒度口径差。

## 七、自动化与定时任务边界（2026-10-14 用户决策）

| 对象 | 决定 |
|---|---|
| 计划/战略文档 | ❌ 不自动化（决策产物，执行走 board 任务 + 人工触发） |
| Topic Portfolio 月度快照 | ✅ **挂月频自动化，但前置验证**：待每日 08:00 Bing URL 提交自动化（id 7ecd345e，首跑 10-15）无人值守稳定 1-2 周后，经用户批准创建（board M11-8，status=blocked）。设计：每月首周 tabbit 抓取 → 归档 `bookconv_data_asset/bing/TopicPortfolio_snapshot_<date>.json` → 与上月对比 delta 报告 → 人工审阅。兜底：Tabbit 未运行/登录失效/BETA 改版 → BLOCKED 如实报告 |
| R_post 探针 | ⏸️ 先手动跑 2 轮验证 key/成本/稳定性，再评估是否定时 |
| board / 发布 | ❌ 人工（人工审稿红线、绝不自动 push） |

## 八、复用方法论（仅方法论，不产出外部交付物）

> ⚠️ **适用范围与边界**：本节约为**可复用方法论**，供 geo-distributor 客户、geocitationblueprint.com 等场景**方法复用**；**不产出任何客户交付物、不对客户披露 bookconv 内部数据**。文中 bookconv 实例仅作「方法如何落地」的演示样例，其数值属 BETA / 个性化 / 近似区间，对外引用须带对应限定。所有推断性结论统一标 [HEURISTIC] 并带 claim tier。

### 8.1 资产识别（Asset Identification）
- **目标**：获得可服务的「AI 引用差距地图」——站点已被引主题版图 + 竞品被引而本站点未被引的 grounding queries。
- **数据源**：Bing Webmaster Tools → AI Performance → Topic Portfolio (BETA)。属性：**BETA**（随时演化）、**账号个性化**、**月粒度窗口**、指标为近似区间——绝不可当市场通用数据对外表述。
- **抓取 SOP（抗故障）**：API 404（实测 BWT API 不稳定）→ 降级为「登录态 UI 导出 / 半自动抓取」；BETA 改版 → 如实 BLOCKED 不造假数据。
- **唯一真相源**：导出后落盘为带 TP-id 计数的 JSON（如 `data/topic-portfolio-opportunities.json`），后续所有计数以该 JSON 为准，不与网页显示交叉混用。

### 8.2 能力拟合（Capability Fit）
- **判定字段**：`capabilityFit ∈ {calibre, js, cloudconvert, guide, none}` + `servableNow`（当前能否真交付）。
- **用途**：在追词前先确认「站内是否有承载面、当前能否真服务」，避免追能力边界外词（如 402 受限的 convert 词）。
- **关键现实约束 [HEURISTIC]**：转换类词若依赖 CloudConvert 且当前 402，则 `servableNow=false` → 标 P1-parked，解锁条件 = 额度恢复或纯 JS 路径覆盖目标格式；**绝不**把无法交付的转换词导流到失败页（负体验）。

### 8.3 优先级矩阵（Priority Matrix）[HEURISTIC]
- **判定次序（可复现，按序短路）**：
  1. **EXCLUDE**：偏离 niche 的超大拥挤主题（如 Technology）。
  2. **P2**：`capabilityFit=none`（无承载面、不建页、仅记录）。
  3. `capabilityFit=guide`：已有强承载 → **P0**（强化）；需新建 → **P1**。
  4. convert 对：`servableNow=true` → **P0**；false（402）→ **P1-parked**。
  5. on-niche 无工具但有 blog/guide 承载 → **P1**。
- **乘积直觉 [HEURISTIC]**：Topic 需求 × 竞争反比 × 能力 × 语言 / 探针资格。注意：低 Sites Cited ≠ 机会大（可能是该主题 AI 引用活动总量本就低），两个命题不可混淆。

### 8.4 内容映射判定树（Content Mapping Decision Tree）
- **guide 型**：强化既有 `src/data/guides/` 或新建（须登记 `guides/index.ts`）。
- **blog 型**：`src/data/blog/*.ts`（intro + sections + faqs + Key Takeaways + schema），遵守博客写作指南。
- **convert 型**：挂起（402）；仅与既有页同页时顺带优化（同页不两次触碰）；新 slug 须先注册 CONVERSION_MAP + CONTENT_MAP（否则 `dynamicParams=false` 404）。
- **统一流水线**：`seo-critic` → `critic-layer.blog` → `publish-gate`(Gate B) → **人工审稿红线** → 用户「发布」触发 → `verify-nojs-render` + `verify-hreflang-canonical`。

### 8.5 测量模板（Measurement Template）
- **R_pre**：发布前打标即采集，与 BWT「未被引」交叉验证；有效期距发布 ≤14 天，超期重采。
- **R_post**：发布后 8 周 × 每周（仅 P0），P1 月频；每轮记录调用数；`cited=true` 连续 2 周或期满停测。
- **哈希锁**：薄封装校验 `sha256(question)` 与存量一致（漂移 exit 2 fail-closed）→ 调探针 → 输出立即归档带日期副本（防覆盖）→ 追加 append-only 时序 JSON（替代物理数据库）。
- **成本上限 [HEURISTIC]**：探针集 × 引擎 ≈ 调用数/轮；月度手工导出三角印证，注明月粒度口径差。
- **双引擎 / 多语言纪律**：query 字段一律数据源原样字符串，禁止改写 / 翻译；仅 `probeEligible=true` 的原样 en 词进探针集。

### 8.6 纪律红线（Discipline Red Lines）
1. **双渠道分离**：Bing / AI 与 Google 看板绝不合并成单一 GEO 分。
2. **人工审稿红线**：绝不自动 push；no scheduler / no rollback / 无假数据。
3. **变更节制**：≤3 页改动 / 批、≤10 页 / 天；禁止混合测量批次。
4. **append-only**：报告只追加；数字写前当场复算；delta = 0 如实记录。
5. **claim tier**：所有推断（蓝海 / 重叠率）标 [HEURISTIC]；引用本文件数据须带「BETA + 个性化 + 近似区间」限定。
6. **GEO 负向门禁**：不建特殊 GEO schema、不强制 chunking、不为 AI 生成影子页。

> **复用交付口径**：对 geo-distributor 客户仅提供「方法骨架（8.1–8.6 流程）」，不附带 bookconv 内部计数与 BWT 个性化导出；任何客户侧实例化数据均须客户自行抓取并标注其自身 BETA / 个性化属性。

## 九、红线

1. 双渠道分离，绝不合并成单一 GEO 分。
2. 人工审稿红线；绝不自动 push；no scheduler / no rollback。
3. ≤3 页改动/批、≤10 页/天；M2-8（13 零抓取页，P0 due 10-20）完成为 M11-3 前置；首批 ≥2026-10-21；禁止混合测量批次。
4. 报告 append-only；数字写前当场复算；delta=0 如实记录。
5. claim tier：所有推断（蓝海/重叠率）标 [HEURISTIC]；引用本文件数据须带「BETA + 个性化 + 近似区间」限定。
6. GEO 负向门禁：不建特殊 GEO schema、不强制 chunking、不为 AI 生成影子页。
7. `query` 字段一律 BWT 原样字符串，禁止改写/翻译（F4 纪律）。

## 十、执行状态（M11 编排，详见 board.json）

| 任务 | 内容 | due | 状态 |
|---|---|---|---|
| M11-1 | 导出转录 opportunities JSON + 归档 | 2026-10-16 | ✅ done 2026-10-14 |
| M11-2 | V2 矩阵打标 | 2026-10-17 | ✅ done 2026-10-14（随 M11-1 完成） |
| M11-4 | R_pre 基线采集（seed+哈希锁+三 key 预检） | 2026-10-18 | todo（key 已预检齐备） |
| M11-3 | 内容分发（前置 M2-8 完成；P0 内容词先行） | 2026-10-21 | todo |
| M11-5 | R_post 跟踪（8 周窗口） | 2026-10-28 | todo, weekly |
| M11-6 | Bing 月度印证 | 每月首周 | todo, monthly |
| M11-7 | 复用方法论章节收口 | 2026-10-24 | ✅ done 2026-10-25（§八 6 小节定稿，含「内部优先/外部不产出」标注与 claim tier） |
| M11-8 | 月度快照自动化（前置：08:00 自动化验证 + 用户批准） | 2026-11-01 | blocked |
