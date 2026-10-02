# 网站工作台（Workbench）

统一管理与运营入口。两种交付形态，**同一套数据层**：

| 形态 | 入口 | 适用场景 | 数据新鲜度 |
|---|---|---|---|
| **实时路由** | `/admin`（en）· `/es/admin`（es） | 开发/运维常态使用 | 每次请求重算（derived）或快照 |
| **单文件离线快照** | `workbench.html`（双击即开） | 分享、存档、无 Node 环境查看 | 生成那一刻冻结 |

工作台里有两个不同性质的东西，别混：

| | 网站工作台 | **SEO/GEO 作战台** |
|---|---|---|
| 回答的问题 | 「站点现在是什么状态？」 | 「**我今天要做什么？**」 |
| 数据源 | 仓库推导 + 人工快照 | `data/seo-geo-board.json`（唯一真相源） |
| 变化原因 | 代码/配置变了 | **你的工作进度变了** |
| 入口 | `/admin`（10 个面板） | `/admin/board` · 全量台账 `/admin/board/register` |

作战台是「每日执行 + 模块进度」的载体，把
`docs/SEO-GEO-V2.0-执行拆解表-2026-09-27.md` 的 63 条任务转成结构化数据后推导而来
（2026-10-02 起另含执行计划并入的 M2-8 / M2-9 / M9-7 三条，共 66 条）。
详见下方「SEO/GEO 作战台」。

## 单文件离线快照

```bash
npm run build:workbench     # 产出根目录 workbench.html
```

产物特性（实测）：

- **自包含**：0 个外部请求（无 CDN/字体/图片/JS 外链），断网可看。
- 内联 CSS：浅色/深色随 `prefers-color-scheme` 自动切换，含打印样式。
- 响应式：`<900px` 时侧栏收为顶部 `<select>` 跳转导航。
- 每个模块顶部**保留数据来源徽标**（real-time / snapshot + 日期），不伪装离线快照为实时。
- 生成器 `scripts/build-workbench-html.mjs` 用 `@swc/core` 把
  `src/lib/workbench/*` 的 TS 转译到临时目录 `.wb-build/`，再以 ESM 导入，
  调用与实时路由**完全相同**的 `getAllWorkbenchPayloads()` 取数。
  即：单文件是实时路由的**渲染快照**，不是另写一份数据。

> ⚠️ 单文件产物已加入 `.gitignore`（`/workbench.html`、`.wb-build/`）——
> 它含经营数据快照，不进公开仓库。

## 模块清单

| 模块 | 路由 | 数据来源 | 说明 |
|---|---|---|---|
| **SEO/GEO 作战台** | `/admin/board` | **derived** | **今日该做什么** + 模块进度（读 `data/seo-geo-board.json`） |
| **关键词排名** | `/admin/keywords` | **derived** | 真实数据表：目标词排名位置 + Δ + 竞品缺口（读 `data/keyword-series.json`） |
| 站点概览 | `/admin` | **derived** | 聚合全部模块头条 + 模块导航网格 |
| 域名与服务器 | `/admin/domain` | snapshot | 域名、DNS、SSL、托管、备用源站 |
| 部署与版本 | `/admin/deploy` | **derived** | 质量门禁实时运行结果 |
| 内容与文章 | `/admin/content` | **derived** | 内容清单（每次请求从磁盘重算） |
| SEO 设置 | `/admin/seo` | **derived** | 差异化门禁实时运行 + 技术基线 |
| 数据统计 | `/admin/analytics` | snapshot | Google / Bing-AI 双渠道分离 |
| 插件与主题 | `/admin/extensions` | **derived** | 集成清单 + 废弃模块普查 |
| 用户与权限 | `/admin/users` | snapshot | 角色矩阵、认证后端状态 |
| 备份与安全 | `/admin/security` | snapshot | 安全基线 checklist |
| 消息通知 | `/admin/notifications` | snapshot | 通知流、告警规则（未派发） |

> `board` 是唯一**不走 Provider getter** 的面板——它读自己的数据文件，因此
> `ProviderPanelKey = Exclude<PanelKey, 'board'>`。新增 provider 面板时不要把它算进去。

## SEO/GEO 作战台

> 入口：`/admin/board`（今日作战台）· `/admin/board/register`（M0–M10 全量任务台账）
> 数据源：`data/seo-geo-board.json` —— **唯一真相源**。改这里 = 改作战台，**不需要改任何代码**。

### 为什么要有它

`docs/SEO-GEO-V2.0-执行拆解表-2026-09-27.md` 是 63 条任务的规范文档，
但**规范文档不能告诉你今天该干哪几件**：它有 63 行，而今天只做得动几件。
作战台做的事就是把那 63 行压成「今天这几件」
（现数据文件共 66 条：拆解表 63 + 执行计划 M2-8/M2-9/M9-7）。

### 每日视图的四个分区

| 分区 | 来源 | 说明 |
|---|---|---|
| **今日工作** | `due` = 今天 或 calendar cadence 今天触发 | 只有**有期任务**，是今天真正的交付物 |
| **常驻纪律**（折叠） | `recurring ∈ {continuous, per-change, per-round}` | 每天都适用、**没有完成状态**，故单列 |
| 已逾期 | `due < today` 且状态未完成 | 逾期会累积，不会自动消失 |
| 复查队列 | `recheck` ≤ today | §5-5：做完不算完，到期必须复查并填 Result |

其余分区：**关键节点**倒计时（10/1 · 10/6 · 10/20 · 10/22）、**模块进度**（M0–M10）、
**社媒排期**（X / Reddit 当日槽位）、**待你决策**。

### 🔴 常驻纪律为什么必须单列（这是本页最关键的设计）

`continuous` / `per-change` / `per-round` 三类 cadence **按构造每天都触发**。
如果把它们和 `daily` 一样丢进「今日工作」，2026-09-27 那天会得到：

- 不分组：**11 条**今日任务 —— 而其中**只有 5 条是真有交付物的**
- 分组后：**5 条**今日工作 + **8 条**常驻纪律（折叠）

后果不是"看起来乱"，是**那 5 条会被淹掉**。一份每天都有 11 条的清单，人会在第三天开始忽略它。
判据写在 `src/lib/board/types.ts` 的 `STANDING_CADENCES`，由 `deriveBoard` 分流，
测试 `tests/unit/board.test.ts` 逐条锁定（含「同一任务不得同时出现在两个桶里」）。

> 想改动分组？改 `STANDING_CADENCES` 一处即可，不要在各渲染层分别写 if。

### 数据文件契约

```jsonc
{
  "meta":   { "d0": "2026-09-27", "discipline": "…" },
  "anchors":[{ "id":"A1","date":"2026-10-01","label":"Tier-1 首读","kind":"read" }],
  "social": { "x": { "slots":[{ "date":"2026-09-27","item":"Post 1" }] },
              "reddit": { "slots":[…], "warmupEnd":"…", "karmaTarget":100 } },
  "modules":[{ "id":"M0","name":"…","tier":"CORE","tasks":[
      { "id":"M0-1","action":"…","detail":"…","owner":"O","deliverable":"…",
        "accept":"…","due":"2026-09-28","priority":"P0","tier":"CORE",
        "status":"todo","recheck":"2026-09-28","recurring":"daily" }]}],
  "openDecisions":[{ "id":"D1","title":"…","context":"…","suggestion":"…" }]
}
```

| 字段 | 取值 | 约束 |
|---|---|---|
| `status` | `todo` / `doing` / `done` / `blocked` / `dropped` | 必填，`dropped` 不参与任何统计 |
| `priority` | `P0` / `P1` / `P2` / `P3` | P0 阻断性 |
| `tier` | `CORE` / `SUPP` | CORE=规范原文条款；SUPP=规范未提及、按最佳实践补全的假设 |
| `due` | `YYYY-MM-DD` | 完成时限 |
| `recheck` | `YYYY-MM-DD` | 复查日期（§5-5） |
| `recurring` | 见下 | 有则按 cadence 触发，`due` 不再当日期解析 |

`recurring` 全部取值：`daily` · `weekly` · `weekly-monday` · `every-2-days` · `monthly` ·
`monthly-first-week` · `monthly-end` · `quarterly` · **`continuous` · `per-change` · `per-round`**（后三类 = 常驻）。

### 推导是纯函数

```ts
deriveBoard(data: BoardData, today: string): BoardView   // src/lib/board/derive.ts
```

- **`today` 由调用方注入**，函数不读系统时钟 → 可在任意日期上测试，不会随时间漂移。
- `every-2-days` 的奇偶锚在 `D0`（`2026-09-27`），不是"读文件那天"，否则隔日任务会随运行时间漂移。
- 无副作用、不修改入参（有测试锁定）。

### 质量门禁

`npm run audit:workbench` 的 **P5.x** 段锁定作战台契约：

| 断言 | 内容 |
|---|---|
| P5.0 / P5.1 | 数据文件存在且可解析 |
| P5.2 – P5.4 | 有任务；每条都声明 `status` 与 `tier`（不允许隐式默认） |
| P5.5 | 任务 id 唯一（否则台账会静默重复计数） |
| P5.6 | 每个 anchor 都是真实 `YYYY-MM-DD` |
| P5.7 / P5.10 | 文件自我说明：是唯一数据源 + 记录了常驻 cadence 取值 |
| P5.8 / P5.9 | **常驻分流在推导层真实生效**（不是只在类型里写了） |
| P5.11 / P5.12 | **数据文件必须入库**，且 `.gitignore` 不得整目录排除 `data/` |

> ⚠️ P5.11/12 是踩过坑加的：`.gitignore` 原有 `/data/`（为排除生成的 critic 报告）。
> **目录级排除会让后续的 `!/data/xxx` 反选完全失效** —— git 不会进入已排除的目录去找可反选的文件。
> 结果就是作战台的唯一真相源**静默不入库**，文件一丢整个作战台消失。
> 已改为 `/data/*.json` + `!/data/seo-geo-board.json`，并加断言防回归。
> （实测反证：把规则改回 `/data/`，P5.11 + P5.12 双双 FAIL —— 门禁不是摆设。）

```bash
npm run audit:workbench                  # 含 P1–P5 全部断言
npx jest tests/unit/board.test.ts        # 作战台 56 个用例
```

## 关键词排名面板（实战补的第一张真实数据表）

> 入口：`/admin/keywords`
> 数据源：`data/keyword-series.json` —— 由 `scripts/build-keyword-series.mjs` 从 `数据分析/` 的原始快照**合并**生成
> 这个面板就是作战台一直只说「去做关键词表」却从没显示过的那张表。

### 它解决什么
用户最初质疑作战台的实用性，核心就是：「我要先看**目标关键词-排名位置统计表**，再每天分析**排名变化及变化原因**，再统计**竞品关键词的变化** —— 这工作台能给我看具体的数据表吗？」

作战台是*任务追踪器*，不是*数据仪表盘*。这张面板把第一类、第二类（变化部分）补上了：

| 用户要的表 | 现状 | 缺口 |
|---|---|---|
| ① 目标关键词-排名位置统计表 | ✅ `keyword-rank-latest.csv` + 面板表格 | — |
| ② 每日排名变化 + 变化原因 | ✅ 面板有「Δ / Trend / 前一期」+ 原因层（见下） | 原因需人填，不自动生成 |
| ③ 竞品关键词变化 | ⚠️ 采集脚手架已建，待 SERP key 填充 | 见「竞品关键词面板」 |

### 数据怎么来（诚实口径）
- **Bing Webmaster `GetQueryStats`**：只有 Top-100 查询、约 7 天滚动窗口、接口**不支持按日期过滤**。所以有历史，但短且会滚掉。脚本每天追加快照、再拼接，可比词从 6 个升到 27 个（13 升 / 9 降 / 5 平），其余 453 个是单点（无法判断趋势）。
- **GSC 导出**：各次导出**窗口长度不一致**（10 天 vs 31 天），跨日对比无意义。脚本把它们标成 `comparable: false`，UI 明确警告「不可比」，而不是假装能算 Δ。
- 原始快照在 `数据分析/`（**未纳入版本控制**，机器一坏就没了）；合并后的 `data/keyword-series.json` 入库。

### 生成命令
```bash
npm run fetch:bing      # 抓 Bing Webmaster（需 BING_WEBMASTER_API_KEY）
npm run fetch:gsc       # 抓 Google Search Console
npm run build:keywords  # 合并成可比序列 → data/keyword-series.json
```
文件缺失时 `/admin/keywords` 会显示上述指引，而不是崩溃。

### 变化原因层（已建，表②的「原因」）
数据只给 Δ，不解释「为什么」。原因由人看后填到 `data/keyword-reasons.json`（已纳入 git，丢了难重建）：
- 追加一条：`node scripts/add-keyword-reason.mjs "<词>" "<YYYY-MM-DD>" "<原因>"`
- 面板「关键词排名」多一列「原因」（取每个词最新一条）；`keyword-rank-latest.csv` 多了 `Reasons` 列（`build:keywords` 自动并回）。
- 诚实边界：原因是**人工判断**（算法更新 / 对手动作 / 页面改动 / 季节性），系统不会自动编造。

### 候选原因生成器（半自动，证据驱动，不编造）
纯 LLM 自由编原因 = 把猜测当事实。正确做法：**系统只生成「证据驱动的候选假设」，人确认后才进真相文件**。

- 生成候选：`node scripts/suggest-keyword-reasons.mjs [--threshold N]`（默认 |Δ|≥3）
  - 读 `data/keyword-series.json`（bing 排名序列）+ `data/competitor-series.json`（表③竞品）+ `data/algorithm-updates.json`（人工维护的算法窗口）
  - 两个证据源：① **竞品压力**——同词有竞品排名上升 / 新进 Top100，属高质量数据信号（high 置信）；② **算法窗口**——变动日落在已知更新窗口内，属相关性提示（medium 置信，明确标注相关≠因果）
  - 产出：`data/keyword-reason-candidates.json`（入库）+ `数据分析/keyword-reason-candidates-<date>.md`（可读报告，gitignored）
- 晋升为正式原因（**唯一**写入 `keyword-reasons.json` 的路径）：`node scripts/confirm-keyword-reason.mjs "<词>" <itemIndex>`
- 面板表现：原因列有「原因」则显示已确认文本；否则若有关联候选，显示琥珀色「候选 N 条（待确认）」徽标（hover 看完整假设），与已确认原因**视觉区分、数据隔离**。
- 核心纪律：候选文件与真相文件分离；`buildCandidates()` 是纯函数（位于 `src/lib/keywords/candidates.ts`，单测覆盖），CLI 只负责 IO，绝不在脚本里把猜测写进真相文件。

### 竞品关键词面板（脚手架已建，待 SERP key 填充）
> 入口：`/admin/competitors` · 配置：`data/competitor-config.json`（盯哪些竞品域名 / 哪些目标词，都能改）
> 这个面板把表 ③（竞品关键词变化）补上 —— 此前项目完全没有关键词级竞品时序
> （`geo/competitors.csv` 只有出现次数，`normalized_serp.csv` 只有 2026-08-01 一张快照）。

- 采集：`scripts/fetch-competitor-serp.mjs` —— 对配置里的每个词查 SERP，记录每个竞品域名的排名，写 `数据分析/competitor-serp-<date>.json`。
- 合并：`scripts/build-competitor-series.mjs` —— 把每日快照缝合成 `data/competitor-series.json`（每竞品×词的最新/上期/Δ/趋势）。
- **SERP 数据源（二选一，绝不裸抓）**：`SERPAPI_KEY`（SerpApi Google）或 `BING_WEB_SEARCH_KEY`（Bing Web Search API v7）。**没有 key 时脚本只提示、不编造数据**，面板显示配置指引。
- 默认竞品（占位，改 `competitor-config.json` 即可换成真实对手）：convertio.co / onlineconvert.com / zamzar.com / freeconvert.com / anyconv.com。
- 面板表格：竞品 × 目标词，列 = 最新排名 / 上期 / Δ / 趋势 / 日期，可按竞品筛选、按词搜索、排序。
- 离线 `workbench.html` 同样含此面板（无数据时显示配置指引）。


## 数据来源三档（关键设计）

早期版本用 `live | mock` 两档，**这是一个会撒谎的标签**：数字是从仓库脚本手抄一次的，
面板本身零 I/O，却被标成 `live`。现在改为三档，并在 UI 上强制区分：

| 值 | 徽标 | 含义 | UI 表现 |
|---|---|---|---|
| `derived` | 实时计算（绿） | 每次请求从本地文件/脚本重算 | 绿色徽标 + 绿色说明条 |
| `remote` | 实时接口（蓝） | 来自外部 API | 蓝色徽标 |
| `static` | 快照（黄） | 人工核对的静态数字 | **黄色边框 + 警告条 + 卡片显示 snapshot 日期** |

`static` 面板必须携带 `snapshotDate`（`audit-workbench-honesty.mjs` P1.4 强制），
侧栏与卡片都会显示它，看板上写明「不要用它做当日决策」。

## 架构

```
src/lib/workbench/
  types.ts         类型契约：PanelKey / PanelPayload / WorkbenchProvider / DataSourceKind
  panels.ts        面板注册表：导航、路由、分组、数据来源档位
  facts.ts         本地事实推导：collectRepoFacts() + 门禁脚本运行器
  admin-guard.ts   访问控制：运营者白名单 + fail-closed 判定（页面与 API 共用）
  provider.ts      provider 注册表（扩展接缝）
  provider-repo.ts 默认 provider：能推导的推导，不能的诚实标为快照

src/components/workbench/
  WorkbenchShell.tsx 响应式外壳（桌面固定侧栏 / 移动抽屉）
  SidebarNav.tsx     由面板注册表驱动的导航（含来源徽标）
  PanelView.tsx      统一渲染 + 来源分层提示
  primitives.tsx     Card / MetricCard / DataTable / Timeline / ChecklistCard / StatusChip

src/lib/board/          ← SEO/GEO 作战台（独立于 workbench 数据层）
  types.ts          契约：BoardTask / BoardView / STANDING_CADENCES
  derive.ts         纯推导：deriveBoard(data, today) —— 注入日期，不读时钟
  loader.ts         读 data/seo-geo-board.json + 校验（非法枚举/重复 id 抛错）

src/lib/keywords/      ← 关键词排名面板（client 安全，无 node:fs）
  series.ts         类型 + 纯函数：isMoving() / sortRows()（被客户端组件 import）
  loader.ts         仅服务端：读 data/keyword-series.json（缺失返回 null）

src/components/board/
  BoardView.tsx     作战台视图 + TaskRegister（M0–M10 全量台账）
  primitives.tsx    Chip / PriorityChip / OwnerChip / TierChip / StatusChip / ProgressBar / Stat / Callout …

src/components/keywords/
  KeywordPanel.tsx  'use client' 交互表：视图切换 / 排序 / 搜索 / Δ 高亮

src/app/[locale]/admin/    面板路由（含 /admin/board、/admin/board/register、/admin/keywords）+ layout（noindex）
src/app/api/workbench/     只读 JSON API
scripts/audit-workbench-honesty.mjs   诚实性门禁 P1–P5（npm run audit:workbench）
scripts/build-workbench-html.mjs      单文件生成器（npm run build:workbench）
tests/unit/workbench.test.ts          46 个用例
tests/unit/board.test.ts              56 个用例
data/seo-geo-board.json               作战台唯一真相源
```

核心设计：**面板不感知数据来源**。UI 只调 `getWorkbenchPayload(panelKey)`，由 provider 注册表决定谁来回答。

## 为什么数字不写死

第一版硬编码了 40+ 个数字，包括「audit:claims 红灯 1 处」「未 push commit 2 个」。
这些是**状态**不是**事实**——改一个文件就变，而冻结的副本会让看板变成谎言生成器。

现在：**凡能本地推导的一律推导**（转换对数、格式数、blog/guide/format 页数、
是否进 sitemap、废弃模块普查、门禁通过情况），**不能推导的一律不显示数字或标注快照日期**。

`facts.ts` 用 `execFileSync` 实时运行 `audit-plan-claims.mjs`、
`audit-convert-differentiation.mjs`、`publish-gate.mjs`，解析真实裁决；
结果在进程内缓存 5 分钟（跑一次要数秒）。

## 接入真实数据源

1. 新建 `src/lib/workbench/provider-<name>.ts`，实现 `WorkbenchProvider`（`ProviderPanelKey` 对应的 10 个 async getter —— 作战台 `board` 不在其中，它自己读数据文件）。
2. 在 `provider.ts` 的 `PROVIDERS` 注册。
3. 设 `WORKBENCH_PROVIDER=<name>`。

| 面板 | 建议数据源 |
|---|---|
| deploy | GitHub API（commits / workflow runs） |
| domain | Cloudflare API（DNS / SSL / WAF） |
| analytics | GSC API + Bing Webmaster API + GA4 Data API |
| seo | GSC 关键词位置（叠加现有本地推导） |
| security | Sentry API + 备份任务状态 |
| notifications | 通知通道（邮件 / Webhook） |
| users | `src/lib/auth` 用户存储 |

## API

```bash
curl http://localhost:3000/api/workbench                    # 全部面板
curl "http://localhost:3000/api/workbench?panel=seo"        # 单个面板
curl "http://localhost:3000/api/workbench?provider=github"  # 指定 provider
```

响应 `{ provider, generatedAt, data }`，`Cache-Control: no-store`。

## 质量门禁

```bash
npm run audit:workbench                 # 诚实性 + 访问控制 + 作战台契约（P1–P5）
npm run build:workbench                 # 生成单文件离线快照 workbench.html
npx jest tests/unit/workbench.test.ts   # 46 个用例
npx jest tests/unit/board.test.ts       # 56 个用例
```

`audit-workbench-honesty.mjs` 检查五项承诺：
- **P1 不许把冻结数字伪装成实时**：每个 static 面板必须有日期，payload 不许内嵌时间戳字面量。
- **P2 能推导的不许写死**：provider 里不许出现 `conversionPairs: 31` 这类字面量。
- **P3 禁止措辞**：9,012 引用必须带「非流量」限定；llms.txt 归因必须标 WEAK EVIDENCE；禁止「GEO 总分」「队列已删除」。
- **P4 访问控制在位**：页面与 API 都必须调闸门；`TODO(security)` 必须消失；空白名单必须拒绝；API 拒绝必须是 404。
- **P5 作战台契约**：数据文件存在可解析；每条任务声明 `status`/`tier`；id 唯一；anchor 日期合法；文件自我说明；**常驻分流在推导层真实生效**。

## 访问控制（已实现）

工作台暴露的是**经营与运维元数据**（生产环境标识、域名/DNS 供应商、哪个门禁是红的、
Sentry 条目数、未推送 commit、流量数字）。它必须只有运维者能读。

### 两道闸门

| 层 | 位置 | 行为 |
|---|---|---|
| 页面 | `src/app/[locale]/admin/layout.tsx` | 未授权渲染**拒绝页**，不取任何面板数据 |
| 接口 | `src/app/api/workbench/route.ts` | 未授权返回 **404**（不是 401/403） |

> API 刻意用 404 而非 401/403：401 等于告诉扫描器「这个端点存在且需要认证」。
> 具体拒绝原因只写服务端日志，**不回传给未授权调用方**（否则泄露配置状态）。

### 为什么是"运营者白名单"而不是"登录即可"

本站认证是**客户认证**——`/api/auth/register` 对公众开放，任何人都能自助注册。
若把闸门写成「有有效 session 就放行」，那**任何注册用户都能读运维数据**。
所以闸门是一份独立的运营者邮箱白名单（`WORKBENCH_ADMIN_EMAILS`）。

### 为什么默认拒绝（fail-closed）

两种"没配好"都必须**拒绝**，而不是放行：

| 情形 | 若放行的后果 | 实际行为 |
|---|---|---|
| `WORKBENCH_ADMIN_EMAILS` 未设/为空 | 忘了配 = 工作台静默公开 | **拒绝所有人**（空名单 ≠ 放行名单） |
| `AUTH_SECRET` 未设/仍是占位符 | 占位符是公开的，**任何人可伪造 session** | **拒绝所有人** |

检查顺序也是刻意的：**先查配置，再查身份**——配置坏了的时候，任何身份都不可信。

### 拒绝原因

| reason | 含义 |
|---|---|
| `no_allowlist` | `WORKBENCH_ADMIN_EMAILS` 未配置 |
| `weak_secret` | `AUTH_SECRET` 缺失或仍是公开占位符 |
| `no_session` | 无/无效/过期的 session cookie |
| `not_operator` | 已登录，但不在运营者白名单内 |

### 实测结论

- 单元测试 12 例（`tests/unit/workbench.test.ts` → `workbench access control`）
- **真实 JWT 端到端实测 12/12**：用仓库真实 `signJwt` 签 token，走真实
  `getSession()` → `verifyJwt()` 校验链，覆盖伪造签名 / 过期 / 换密钥签名 /
  非运营者 / 大小写容错等情形。
- 门禁断言 P4.1–P4.7（`npm run audit:workbench`）反向锁定：路由必须调闸门、
  `TODO(security)` 必须消失、空名单必须拒绝、API 必须返回 404。

## ⚠️ 部署前必须配置

1. **设 `AUTH_SECRET`**（长随机串）。不设则工作台拒绝所有人，且客户登录 session 可被伪造。
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
2. **设 `WORKBENCH_ADMIN_EMAILS`** 为你自己的运营邮箱。不设则无人能进 `/admin`。
3. **`/admin` 已设 `robots: noindex,nofollow,nocache`**，且不在 `sitemap.ts` 内。
   新增面板不要破坏这一点。
4. **`static` 面板的数字会过期**。用之前先看标注日期，核对后更新 `snapshotDate`。
