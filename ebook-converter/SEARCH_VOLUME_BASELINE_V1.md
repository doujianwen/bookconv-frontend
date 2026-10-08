# Search Volume 基线 V1（SEARCH_VOLUME_BASELINE_V1）

> 阶段：**DATA ACQUISITION** · 只读取，未修改 `constants.ts`
> 数据源：`src/lib/constants.ts`（**仅作历史/内部数据源，不自动视为真实 Search Volume**）

## 一、现有 search volume 盘点

| 项 | 值 |
|---|---|
| 字段 | `searchVolume: number`（月搜索量，近似值）|
| 伴随字段 | `kd`（关键词难度 0–100）、`phase`、`status`、`source`、`target`、`keyword` |
| 条目总数 | **50** |
| `status = live` | **29** |
| `status = planned` | **21** |
| 声明的采集来源 | Ahrefs Free KD Checker（源码注释：`2026-07-09 report`）|
| 采集时间戳字段 | 🔴 **ABSENT**（无 `fetchedAt` / `lastFetched` / `updatedAt`）|
| live 词对应到实际 Convert 页 | **29 / 29** |
| planned 词已有对应页 | undefined / 21 |

## 二、逐条数据（29 条 live）

| Query / URL | Current Value | Source | Freshness | Confidence | Status |
|---|---:|---|---|---|---|
| `epub to pdf converter`<br>`/convert/epub-to-pdf` | 18,100 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `mobi to epub converter`<br>`/convert/mobi-to-epub` | 9,900 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `azw3 to epub converter`<br>`/convert/azw3-to-epub` | 5,400 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `pdf to epub converter`<br>`/convert/pdf-to-epub` | 12,100 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `docx to epub converter`<br>`/convert/docx-to-epub` | 3,600 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `epub to mobi converter`<br>`/convert/epub-to-mobi` | 8,100 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `epub to azw3 converter`<br>`/convert/epub-to-azw3` | 4,400 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `txt to epub converter`<br>`/convert/txt-to-epub` | 2,900 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `epub to text converter`<br>`/convert/epub-to-txt` | 3,600 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `epub to html converter`<br>`/convert/epub-to-html` | 2,400 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `epub to word converter`<br>`/convert/epub-to-doc` | 2,900 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `epub to word`<br>`/convert/epub-to-word` | 1,000 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `epub to rtf converter`<br>`/convert/epub-to-rtf` | 1,900 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `mobi to text converter`<br>`/convert/mobi-to-txt` | 1,600 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `mobi to pdf converter`<br>`/convert/mobi-to-pdf` | 3,600 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `azw3 to pdf converter`<br>`/convert/azw3-to-pdf` | 1,900 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `azw3 to mobi converter`<br>`/convert/azw3-to-mobi` | 2,400 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `mobi to azw3 converter`<br>`/convert/mobi-to-azw3` | 1,800 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `fb2 to epub converter`<br>`/convert/fb2-to-epub` | 1,300 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `lit to epub converter`<br>`/convert/lit-to-epub` | 1,600 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `doc to epub converter`<br>`/convert/doc-to-epub` | 2,400 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `cbr to pdf converter`<br>`/convert/cbr-to-pdf` | 1,300 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `djvu to pdf converter`<br>`/convert/djvu-to-pdf` | 1,000 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `epub to jpg converter`<br>`/convert/epub-to-jpg` | 1,600 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `epub to png converter`<br>`/convert/epub-to-png` | 1,300 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `html to epub converter`<br>`/convert/html-to-epub` | 1,900 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `lit to mobi converter`<br>`/convert/lit-to-mobi` | 500 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `azw to mobi converter`<br>`/convert/azw-to-mobi` | 300 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |
| `chm to mobi converter`<br>`/convert/chm-to-mobi` | 200 | constants.ts（Ahrefs Free KD Checker 注释）| `2026-07-09（仅注释声明，无字段）` | **LOW** | **HISTORICAL** |

## 三、可信度判定

### 逐条标记规则

| 标记 | 含义 | 本项目适用 |
|---|---|---|
| **VERIFIED** | 本轮用可靠数据源重新取得并确认 | ❌ **本项目 0 条** |
| **HISTORICAL** | 项目内历史记录，来源与时效不可考 | ✅ **29 条全部适用** |
| **UNKNOWN** | 无任何数据 | 21 条 planned 中的量级为 UNKNOWN |

### 判定为 HISTORICAL 而非 VERIFIED 的理由

| # | 理由 |
|---|---|
| 1 | 源码注释声明采集自 Ahrefs Free KD Checker（2026-07-09），但**无 `fetchedAt` 字段**可交叉验证 |
| 2 | 距今已 **90 天**，期间搜索量可能已变 |
| 3 | 🔴 **已有一次实测证伪**：`epub-to-zip` 曾据这份数据被判「伪需求」建议 noindex，实测该页 45 曝光 / pos 14.8（全站最佳）|
| 4 | 注释本身承认「prior values were inflated 30-70 pts」⇒ 该表历史上已知不准确 |

⚠️ **第 4 条是决定性的**：注释写明前值虚高 30–70 点，说明维护者自己已确认此表精度不足。

## 四、覆盖完整性

| 覆盖项 | 结果 |
|---|---|
| 29 条 live 词是否都对应实际 Convert 页 | ✅ 是（29/29）|
| 31 个 Convert 页是否都有搜索量数据 | ❌ 否——31 页中仅 29 页在 live 表内 |
| 未覆盖的 Convert 页 | `/convert/epub-to-zip`、`/convert/rtf-to-epub` |
| planned 词（21 条）| 全部 **UNKNOWN**（无任何实测或可靠来源数据）|

## 五、被 U3 阻断的决策

> ### `Search Volume evidence is insufficient`

| # | 被阻断的决策 | 阻断原因 |
|---|---|---|
| 1 | **REMOVE** 任何 Convert 页 | 无可靠搜索量 ⇒ 无法判断该格式对是否真无需求。已有证伪先例（`epub-to-zip`）|
| 2 | **MERGE** 任何页面 | 同上；且 Jaccard 0.026 已排除内容内耗，合并无收益依据 |
| 3 | **NOINDEX** 任何页面 | 同上 |
| 4 | **大规模扩展**（21 条 planned 词）| planned 词的量级全部 UNKNOWN；且 Calibre 委派路径已关闭（VPS 到期）⇒ 转换能力边界未确认 |
| 5 | **页面优先级排序** | KD 值同样来自未验证采集，且注释承认曾虚高 30–70 点 |

## 六、解除 U3 需要什么

| # | 方案 | 能得到什么 | 成本 |
|---|---|---|
| 1 | Google Keyword Planner（需 GSC/Ads 账户）| 精确搜索量 + 竞争度，官方且免费 | 需建 Ads 账户 |
| 2 | Ahrefs / Semrush 付费账户 | 搜索量 + KD + 竞品词 | 订阅制 |
| 3 | GSC 自身的 impression 数据（本项目已有）| 🔴 **不是搜索量**，是被展示次数 | 免费 |

**推荐 #1**：Google Keyword Planner 是官方来源，免费，且能同时覆盖全部 31 个 Convert 页。

⚠️ 注意：#3 已有的 GSC 数据**不能替代搜索量**——「被展示次数」与「被搜索次数」是两个指标。

## 七、结论

> ### `U3 = UNKNOWN`（数据已盘点，但无一可信）

| 项 | 状态 |
|---|---|
| 条目数 | 50（live 29 / planned 21）|
| VERIFIED 条数 | **0** |
| HISTORICAL 条数 | **29** |
| 采集时间戳 | **ABSENT** |
| 独立验证 | ❌ 无 |

**没有任何一条 search volume 达到 VERIFIED 门槛。**
