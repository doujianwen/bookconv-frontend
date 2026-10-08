# 搜索量数据缺口（SEARCH_VOLUME_DATA_GAP）

> 阶段：**DESIGN ONLY** · 不修改 constants.ts
> 目的：定义「U3 未知项」的现状、风险，以及**在拿到验证数据前禁止的决策**。

## 一、constants.ts 现状

| 项 | 值 |
|---|---|
| KEYWORDS 条目总数 | **50** |
| status = live | 29 |
| status = planned | 21 |
| 采集来源 | ⚠️ 源码注释写「Ahrefs Free KD Checker（2026-07-09 report）」|

### 注释原文（`src/lib/constants.ts`）

```
// KD calibrated to Ahrefs Free KD Checker (2026-07-09 report) — prior values were inflated 30-70 pts.
```

### 硬编码的 P0 词表（status=live，29 条）

| source→target | keyword | KD | 声明月搜索量 | 对应 Convert 页 | 零曝光 |
|---|---|---:|---:|---|---|
| epub→pdf | `epub to pdf converter` | 38 | **18,100** | `/convert/epub-to-pdf` | 🔴 是 |
| mobi→epub | `mobi to epub converter` | 2 | **9,900** | `/convert/mobi-to-epub` | 否（227 曝光） |
| azw3→epub | `azw3 to epub converter` | 0 | **5,400** | `/convert/azw3-to-epub` | 否（13 曝光） |
| pdf→epub | `pdf to epub converter` | 8 | **12,100** | `/convert/pdf-to-epub` | 否（3 曝光） |
| docx→epub | `docx to epub converter` | 1 | **3,600** | `/convert/docx-to-epub` | 否（16 曝光） |
| epub→mobi | `epub to mobi converter` | 10 | **8,100** | `/convert/epub-to-mobi` | 否（8 曝光） |
| epub→azw3 | `epub to azw3 converter` | 0 | **4,400** | `/convert/epub-to-azw3` | 否（64 曝光） |
| txt→epub | `txt to epub converter` | 1 | **2,900** | `/convert/txt-to-epub` | 🔴 是 |
| epub→txt | `epub to text converter` | 2 | **3,600** | `/convert/epub-to-txt` | 否（72 曝光） |
| epub→html | `epub to html converter` | 0 | **2,400** | `/convert/epub-to-html` | 🔴 是 |
| epub→doc | `epub to word converter` | 1 | **2,900** | `/convert/epub-to-doc` | 否（131 曝光） |
| epub→word | `epub to word` | 1 | **1,000** | `/convert/epub-to-word` | 🔴 是 |
| epub→rtf | `epub to rtf converter` | 0 | **1,900** | `/convert/epub-to-rtf` | 否（3 曝光） |
| mobi→txt | `mobi to text converter` | 0 | **1,600** | `/convert/mobi-to-txt` | 🔴 是 |
| mobi→pdf | `mobi to pdf converter` | 5 | **3,600** | `/convert/mobi-to-pdf` | 🔴 是 |
| azw3→pdf | `azw3 to pdf converter` | 2 | **1,900** | `/convert/azw3-to-pdf` | 🔴 是 |
| azw3→mobi | `azw3 to mobi converter` | 0 | **2,400** | `/convert/azw3-to-mobi` | 否（21 曝光） |
| mobi→azw3 | `mobi to azw3 converter` | 0 | **1,800** | `/convert/mobi-to-azw3` | 🔴 是 |
| fb2→epub | `fb2 to epub converter` | 0 | **1,300** | `/convert/fb2-to-epub` | 🔴 是 |
| lit→epub | `lit to epub converter` | 0 | **1,600** | `/convert/lit-to-epub` | 否（19 曝光） |
| doc→epub | `doc to epub converter` | 3 | **2,400** | `/convert/doc-to-epub` | 🔴 是 |
| cbr→pdf | `cbr to pdf converter` | 5 | **1,300** | `/convert/cbr-to-pdf` | 🔴 是 |
| djvu→pdf | `djvu to pdf converter` | 8 | **1,000** | `/convert/djvu-to-pdf` | 🔴 是 |
| epub→jpg | `epub to jpg converter` | 0 | **1,600** | `/convert/epub-to-jpg` | 🔴 是 |
| epub→png | `epub to png converter` | 0 | **1,300** | `/convert/epub-to-png` | 🔴 是 |
| html→epub | `html to epub converter` | 1 | **1,900** | `/convert/html-to-epub` | 🔴 是 |
| lit→mobi | `lit to mobi converter` | 0 | **500** | `/convert/lit-to-mobi` | 🔴 是 |
| azw→mobi | `azw to mobi converter` | 20 | **300** | `/convert/azw-to-mobi` | 🔴 是 |
| chm→mobi | `chm to mobi converter` | 5 | **200** | `/convert/chm-to-mobi` | 🔴 是 |

## 二、🔴 核心问题：这份数据已被验证不可靠

**证据（项目内已有实测记录）**：

| # | 事实 | 来源 |
|---|---|---|
| 1 | 2026-08-03 的 `数据分析/转换页收录核对清单.md` 曾据这份数据建议 `epub-to-zip` 与 `epub-to-lrf` **noindex**，理由是「伪需求」| 历史文档 |
| 2 | `epub-to-zip` 现为 Convert 页曝光第 5（**45 曝光，pos 14.8，全站最佳**）| `gsc-qpage.json` |
| 3 | 该清单同表记录的 `epub-to-lrf` 月搜索量「200」但该页已 404 且不在 CONTENT_MAP | 历史文档 + 源码 |
| 4 | `SELF_AUDIT_REPORT.md` 已将「`epub-to-zip` 是伪需求」标记为**已被证伪的历史结论** | 审计报告 |

⇒ **同一份搜索量数据，已经产生过一次被实测证伪的错误决策。**


## 三、逐项风险：哪些词的值存疑

| # | 词 | 声明量级 | 实测 | 矛盾点 |
|---|---|---:|---|---|
| 1 | `epub to zip converter` | 400 | epub-to-zip 已 45 曝光 pos 14.8 | 「伪需求」判断与实测直接矛盾 |
| 2 | `epub to lrf converter` | 200 | 页已 404，不在 CONTENT_MAP | planned 词对应的页从未真正上线 |

📌 其余 27 个 live 词**未被证伪，但也未被验证**——「未被证伪」不等于「正确」。

## 四、🚫 被 U3 阻塞的决策（不得执行）

| # | 决策 | 为什么被阻塞 | 解除条件 |
|---|---|---|---|
| 1 | **删除**任何 Convert 页 | 无搜索量数据 ⇒ 无法判断该格式对是否真无需求。已有一个「伪需求」判断被证伪的先例 | 取得可靠搜索量 |
| 2 | **合并**任何页面 | 合并会损失差异化（Jaccard 0.026 已排除内耗），且无搜索量证明合并有益 | 同上 |
| 3 | **新增**格式组合页 | 21 个 planned 词的量级未经验证；且 Calibre 委派路径已关闭（VPS 149.104.69.126 到期）⇒ 能力边界未确认 | 搜索量 + 转换能力双重确认 |
| 4 | 把「零曝光」判定为「无需求」 | 混淆了 U1（收录）与 U3（需求）两个独立 UNKNOWN | U1 + U3 同时解除 |
| 5 | 按 KD 排优先级 | KD 值同样来自同一批未验证采集 | 同上 |

## 五、需要取得的数据

| # | 数据项 | 用途 | 优先级 |
|---|---|---|
| 1 | 31 个格式对的月搜索量（可靠来源）| 解除删除/合并/新增决策的阻塞 | **P0** |
| 2 | 搜索量数据的**采集日期与来源** | 判断是否需要重采 | **P0** |
| 3 | 21 个 planned 词的搜索量 | 新增页决策 | P1 |
| 4 | 竞品同关键词的搜索量对照 | 判断是否存在搜索需求但被竞品占据 | P1 |

## 六、当前可安全使用的部分

| 可用 | 理由 |
|---|---|
| 各页的 **实测曝光与 position** | GSC 直接数据，权威 |
| 各页的 **实测字数/标题/description** | 源码直接解析 |
| 站内 **Jaccard 相似度** | 自测判据，自比=1.000 |
| **不用** constants.ts 的 searchVolume / kd 做任何决策 | 已被证伪过 |
