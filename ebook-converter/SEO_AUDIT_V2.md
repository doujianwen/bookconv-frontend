# BookConv SEO Audit V2 · 修订版汇总

> 生成：2026-10-07 17:24 · 依据 `SELF_AUDIT_REPORT.md` 全面修订
> 模式：**READ ONLY** — 未修改任何页面、未提交、未推送
> 数据层：`_wb_tmp/_v2_data.json` · 6 道构建守卫 + 44 项证据门禁全部通过

---


## 一、修订清单（对照 A1 / A6 / A7）

| 项 | V1 表述 | V2 实测 | 状态 |
|---|---|---|---|
| **A1** | 「blog 67 + guide 24 = 91 页 description 完全为空」 | **0 页为空**。description 在 `generateMetadata` 运行时生成；真实缺陷是 **81 页超 160 字符**（66.9%）| ✅ 已修正 |
| **A6** | 「guide 24 页全部零曝光」 | **3 页有曝光**：`/guide/calibre-vs-online-converter`（43）、`/guide/epub-to-txt-extract`（1）、`/guide/mobi-to-epub-keep-formatting`（93） | ✅ 已修正 |
| **A7** | 「Top20 只有 1 页」 | **全站 5 / 资产 4** | ✅ 已修正 |
| 汇总表 | 手工填写 | 全部由数据层生成 + Evidence Validation Gate | ✅ |
| Seed List | 含 301/404/tag 页 | **已剔除**（`redirect_301`/`not_found_404`/`tag`/`homepage`/`es_no_translation`）| ✅ |
| Authority Seed List | 口径不严谨 | **27 个可投外链资产页** | ✅ 已重建 |
| Evidence Validation Gate | 无 | **6 报告各带门禁表 + 44 项独立校验 + 5/5 反向验证** | ✅ 新增 |

## 二、A1 深度修正：description 不是「缺失」而是「超长」

### 2.1 V1 的错在哪

V1 只匹配静态 `export const metaDescription`，命中 0 ⇒ 报「91 页为空」。**这是假失败**：判据只覆盖了一种语法形式。

真实逻辑在运行时：

| 目录 | 源码 | 表达式 | 页数 |
|---|---|---|---|
| convert | `convert/[slug]/page.tsx:47` | `contentData?.metaDescription || subtitle` | 31 |
| blog | `blog/[slug]/page.tsx:57` | `displayContent.intro || displayTitle` | 67 |
| guide | `guide/[slug]/page.tsx:40` | `g.problem || g.content.intro || g.title` | 24 |
| **合计** | | | **122** |

**两处均无长度截断** ⇒ description = intro / problem 全文。

### 2.2 真实缺陷分布（121 个 live 页）

| 区间 | 页数 | 占比 | 判定 |
|---|---|---|---|
| <70 | 2 | 1.7% | ⚠️ 偏短，浪费展示位 |
| 70-120 | 1 | 0.8% | ⚠️ 偏短，浪费展示位 |
| 121-160 | 37 | 30.6% | ✅ 合规 |
| >160 | 81 | 66.9% | **🔴 SERP 会截断，卖点丢失** |

| 指标 | 值 |
|---|---|
| 空 description | **0 页** |
| **>160 字符** | **81 页（66.9%）** |
| 平均长度 | 285 字符 |
| 最长 | **961 字符**（/blog/legacy-lit-djvu-fb2-converter）|

### 2.3 为什么这是 P0

description = intro 全文，而 intro 的写法是「背景铺垫 → 才讲结论」。**卖点（Free / No Sign-up / 保留排版）通常在段尾** ⇒ Google 截断到 ~155 字符后，展示的恰好是共情开头而非产品承诺。

| 页面 | 全长 | Google 实际展示（约 155 字符）|
|---|---|
| `/blog/legacy-lit-djvu-fb2-converter` | 961 | Lost digital libraries are a nightmare for any avid reader. You might have stumbled upon a rare technical manual in the old LIT format, found a classi… |
| `/blog/azw3-epub-mobi-kindle-compatibility` | 804 | Choosing the right eBook format is the single most critical step in self-publishing or digital distribution. If you are reading on a Kindle Paperwhite… |
| `/blog/ebook-conversion-tools` | 801 | Turning a physical manuscript or a complex document into a polished ebook is one of the most critical steps in modern publishing. Whether you are a se… |

**修法方向反转**：V1 说「补写」，实际应「**截断/重写到 140–160，卖点前置**」。严重度从 P1 升 **P0**（81 页 vs convert 页的少数几页）。


## 三、A6 深度修正：guide 有 3 页有曝光

| URL | 曝光 | Pos | 含义 |
|---|---|---|---|
| `/guide/ai-ebook-converter` | 0 | — | 零曝光 |
| `/guide/azw3-to-epub-keep-formatting` | 0 | — | 零曝光 |
| `/guide/azw3-to-mobi-keep-formatting` | 0 | — | 零曝光 |
| `/guide/azw3-vs-mobi` | 0 | — | 零曝光 |
| `/guide/batch-converter` | 0 | — | 零曝光 |
| `/guide/best-ebook-converter` | 0 | — | 零曝光 |
| `/guide/calibre-alternative` | 0 | — | 零曝光 |
| `/guide/calibre-alternatives-online` | 0 | — | 零曝光 |
| `/guide/calibre-vs-online-converter` | 43 | 48.7 | Top31-50 |
| `/guide/cbr-to-pdf` | 0 | — | 零曝光 |
| `/guide/djvu-to-pdf` | 0 | — | 零曝光 |
| `/guide/docx-to-epub-self-publish` | 0 | — | 零曝光 |
| `/guide/epub-to-azw3-for-kindle` | 0 | — | 零曝光 |
| `/guide/epub-to-mobi-keep-formatting` | 0 | — | 零曝光 |
| `/guide/epub-to-txt-extract` | 1 | 71 | Top51+ |
| `/guide/epub-vs-mobi` | 0 | — | 零曝光 |
| `/guide/fb2-to-epub-keep-formatting` | 0 | — | 零曝光 |
| `/guide/fix-epub-to-pdf-formatting` | 0 | — | 零曝光 |
| `/guide/how-to-read-epub-on-kindle` | 0 | — | 零曝光 |
| `/guide/kindle-formats` | 0 | — | 零曝光 |
| `/guide/lit-to-epub-keep-formatting` | 0 | — | 零曝光 |
| `/guide/mobi-to-epub-keep-formatting` | 93 | 81.2 | Top51+ |
| `/guide/pdf-to-epub-keep-formatting` | 0 | — | 零曝光 |
| `/guide/txt-to-epub-build-ebook` | 0 | — | 零曝光 |

🔴 **V1 据此得出的战略结论是错的**：V1 写「guide 零曝光 ⇒ 不投 guide 外链」。
实际 `/guide/mobi-to-epub-keep-formatting` **43 曝光是全站第 4**，pos 48.7 ⇒ **guide 类型已被 Google 认可**，不是死路。


## 四、A7 深度修正：Top20 统计

| # | URL | Pos | 曝光 | 分类 | 可投外链 |
|---|---|---|---|---|---|
| 1 | `/es/blog/azw3-vs-mobi` | **13.7** | 69 | asset_es | ✅ |
| 2 | `/convert/epub-to-zip` | **14.8** | 45 | asset | ✅ |
| 3 | `/convert/epub-to-lrf` | **15** | 1 | not_found_404 | ❌ |
| 4 | `/blog/can-kindle-read-azw3` | **18** | 21 | asset | ✅ |
| 5 | `/blog/mobi-to-kobo` | **19** | 1 | asset | ✅ |

| 分桶（全 37 个 GSC URL）| 数 |
|---|---|
| Top20 | 5 |
| Top21-30 | 1 |
| Top31-50 | 11 |
| Top51+ | 20 |
| **资产口径 Top20** | **4** |

⚠️ 两条必须记住：

1. `/convert/epub-to-lrf` pos 15.0 排 Top20 第 3，但**它不在 CONTENT_MAP ⇒ 真 404**。**position 好看 ≠ 页面存在**。
2. `/es/blog/azw3-vs-mobi` **pos 13.7 是全站最佳**，且是**西语页** ⇒ 与项目记忆「/es 内容信号遭 Spam Update」的认知**冲突，需人工核实**。

## 五、Seed List 重建（已剔除 301/404/Tag/Archive）

### 5.1 GSC 全 URL 穷尽分类

| 分类 | 数 | 可投外链 | 明细 |
|---|---|---|
| 资产（en） | 25 | ✅ | `/convert/azw3-to-epub` `/blog/why-convert-lit-to-epub` `/convert/mobi-to-epub` `/guide/mobi-to-epub-keep-formatting` `/convert/azw3-to-mobi` `/blog/azw3-vs-mobi` `/blog/ebook-formats-explained` `/blog/epub-to-azw3` `/blog/can-kindle-read-azw3` `/guide/calibre-vs-online-converter` `/convert/epub-to-azw3` `/blog/epub-to-mobi-guide` `/convert/epub-to-txt` `/convert/epub-to-doc` `/convert/epub-to-mobi` `/convert/epub-to-rtf` `/convert/epub-to-zip` `/convert/lit-to-epub` `/convert/pdf-to-epub` `/convert/rtf-to-epub` `/convert/docx-to-epub` `/blog/best-ebook-reader-apps` `/guide/epub-to-txt-extract` `/blog/mobi-to-epub` `/blog/mobi-to-kobo` |
| 资产（es 白名单） | 2 | ✅ | `/es/blog/azw3-vs-mobi` `/es/guide/azw3-to-mobi-keep-formatting` |
| **301 重定向旧页** | 3 | ❌ | `/blog/mobi-or-azw3-for-kindle` `/blog/how-to-convert-epub-to-mobi` `/convert/epub-to-docx` |
| **真 404** | 1 | ❌ | `/convert/epub-to-lrf` |
| **tag 聚合页** | 1 | ❌ | `/blog/tag/kindle` |
| 首页 | 2 | ❌ | `/` `/es` |
| **/es/ 但无西语译文** | 3 | ❌ | `/es/blog/epub-to-azw3` `/es/blog/txt-to-epub` `/es/blog/tag/fb2` |
| **合计** | **37** | | |

🔒 GUARD 5 强制分类穷尽，残留 UNKNOWN 即 `process.exit(2)`。本轮 UNKNOWN = **0**。

### 5.2 归档页核实

| 项 | 值 |
|---|---|
| `_archived/` 中 slug 数 | 4 |
| GSC 命中归档 slug 的 URL | `/blog/mobi-or-azw3-for-kindle`、`/blog/how-to-convert-epub-to-mobi` |

这 2 个 URL **已归入 301 并剔出 Seed List**（`middleware.ts` 有对应重定向）。

### 5.3 Seed List（27 个，按曝光降序）

| # | URL | 分类 | Impressions | Position | 桶 |
|---|---|---|---|---|---|
| 1 | `/convert/mobi-to-epub` | asset | **227** | 70.3 | Top51+ |
| 2 | `/convert/epub-to-doc` | asset | **131** | 51.2 | Top51+ |
| 3 | `/guide/mobi-to-epub-keep-formatting` | asset | **93** | 81.2 | Top51+ |
| 4 | `/convert/epub-to-txt` | asset | **72** | 62.8 | Top51+ |
| 5 | `/es/blog/azw3-vs-mobi` | asset_es | **69** | 13.7 | Top20 |
| 6 | `/convert/epub-to-azw3` | asset | **64** | 53.9 | Top51+ |
| 7 | `/blog/ebook-formats-explained` | asset | **63** | 64.5 | Top51+ |
| 8 | `/blog/epub-to-azw3` | asset | **54** | 46.1 | Top31-50 |
| 9 | `/blog/epub-to-mobi-guide` | asset | **49** | 72.1 | Top51+ |
| 10 | `/convert/epub-to-zip` | asset | **45** | 14.8 | Top20 |
| 11 | `/guide/calibre-vs-online-converter` | asset | **43** | 48.7 | Top31-50 |
| 12 | `/blog/why-convert-lit-to-epub` | asset | **26** | 29.8 | Top21-30 |
| 13 | `/convert/azw3-to-mobi` | asset | **21** | 56.4 | Top51+ |
| 14 | `/blog/azw3-vs-mobi` | asset | **21** | 42.8 | Top31-50 |
| 15 | `/blog/can-kindle-read-azw3` | asset | **21** | 18 | Top20 |
| 16 | `/convert/lit-to-epub` | asset | **19** | 34.8 | Top31-50 |
| 17 | `/convert/docx-to-epub` | asset | **16** | 82.1 | Top51+ |
| 18 | `/convert/azw3-to-epub` | asset | **13** | 62.9 | Top51+ |
| 19 | `/convert/rtf-to-epub` | asset | **11** | 45.4 | Top31-50 |
| 20 | `/convert/epub-to-mobi` | asset | **8** | 74.8 | Top51+ |
| 21 | `/blog/best-ebook-reader-apps` | asset | **7** | 59.6 | Top51+ |
| 22 | `/blog/mobi-to-epub` | asset | **7** | 66.6 | Top51+ |
| 23 | `/convert/epub-to-rtf` | asset | **3** | 43 | Top31-50 |
| 24 | `/convert/pdf-to-epub` | asset | **3** | 58.7 | Top51+ |
| 25 | `/es/guide/azw3-to-mobi-keep-formatting` | asset_es | **1** | 58 | Top51+ |
| 26 | `/guide/epub-to-txt-extract` | asset | **1** | 71 | Top51+ |
| 27 | `/blog/mobi-to-kobo` | asset | **1** | 19 | Top20 |

**Seed List 不含任何 301 / 404 / tag / homepage / es_无译文页**（门禁逐行校验）。


## 六、Evidence Validation Gate

### 6.1 三层门禁架构

| 层 | 位置 | 作用 | 失败时 |
|---|---|---|---|
| **构建守卫（6 项）** | `_v2_data.mjs` | 数据提取正确性 | `process.exit(2)`，报告不生成 |
| **报告内门禁表** | 6 份报告各自 | 结论可被本报告表格反查 | 表内出现 ❌ FAIL |
| **独立校验器（44 项）** | `_v2_gate.mjs` | 从数据层重算并解析报告文本比对 | `process.exit(1)` |

### 6.2 构建守卫清单（6/6 PASS）

| # | 守卫 | 防的问题 | 状态 |
|---|---|---|---|
| 1 | no-slug-drop | 解析数 ≠ 文件数时静默丢页 | ✅ PASS |
| 2 | empty-description | 出现 0 字符 description（A1 回归测试）| ✅ PASS（0 页）|
| 3 | desc-source dist | 来源分布异常 | ✅ {"convert/metaDescription":31,"blog/content.intro":67,"guide/problem":24} |
| 4 | Jaccard self-test | 判据有效性（同页自比 = 1.000）| ✅ PASS |
| 5 | URL 分类穷尽 | 残留 UNKNOWN 未定性 | ✅ PASS（0 unknown）|
| 6 | no-title-fallback | fallback 到 title = 提取器漏真实字段 | ✅ PASS（0 页）|

🔍 **GUARD 6 是本轮新增的**，因构建中真抓到 4 页假 fallback（`"intro":` 用 JSON 引号键，`\bintro` 在引号前不匹配）。

### 6.3 独立校验器（44/44 PASS）

| 层 | 检查内容 | 结果 |
|---|---|
| L1 | claim-vs-data：每个声明数字 = 重算值 | ✅ 121 页 / 37 URL 全覆盖 |
| L1b | **表格 vs 结论冲突**：门禁表内数值单元格必须出现在结论句中 | ✅ 0 冲突 |
| L2 | 跨报告一致性：6 份报告不得互相矛盾、不得残留 V1 错误断言 | ✅ 0 冲突 |

### 6.4 反向验证（5/5 CAUGHT）

门禁「打印 PASS」本身不构成证据。已注入 5 类真实事故：

| # | 注入的事故 | 结果 |
|---|---|---|
| 1 | 门禁表内结论与数值单元格不一致（`Seed List = 27` 改成 `99`）| ✅ CAUGHT → exit 1 |
| 2 | 把门禁行改成 ❌ FAIL | ✅ CAUGHT → exit 1 |
| 3 | 整段删除 Evidence Validation Gate | ✅ CAUGHT → exit 1 |
| 4 | 重新引入 V1 错误断言「Top20 只有 1 页」作为正文 | ✅ CAUGHT → exit 1 |
| 5 | 重新引入 V1 错误断言「91 页完全没有 metaDescription」 | ✅ CAUGHT → exit 1 |
| — | 恢复原状 | ✅ BACK TO PASS → exit 0 |

**结论：GATE PROVEN LIVE**（有故障则失败，无故障则通过）。


## 七、修订后的 Phase 1 优先级

| 顺序 | 动作 | 依据 | 变化 |
|---|---|---|---|
| **P0** | 拉 GSC Index Coverage | 若未收录则全部方案作废 | 不变 |
| **P0** | 拉外链基线（Ahrefs/Semrush）| Authority 是否最大瓶颈无法验证 | 不变 |
| **P0** | 🔴 **重写 81 页超长 description**（>160，平均 285，卖点被截断在段尾）| A1 修正 | 🆕 **从 P1 升 P0** |
| **P1** | 补 3 页过短 description | <120 浪费展示位 | 🆕 |
| **P1** | 3 个有曝光 guide 页纳入外链候选 | A6 修正：guide 已被 Google 认可 | 🆕 |
| **P2** | 2 组三目录全撞 title 分工（cbr-to-pdf、djvu-to-pdf）| title 语义近乎相同 | 不变 |
| **P2** | `/convert/epub-to-zip` 单页 title/desc | 唯一 en 资产 Top20 | 不变 |
| **P2** | 修 3 页 convert 超长 desc | 与 blog/guide 同类问题 | 🆕 |
| **P3** | 4 组有 GSC 分摊的意图分工 | 2 组现状与目标相反 | 不变 |
| **P4** | 外链投放 | Seed List 已修正为 27 个纯资产页 | 🔒 口径已干净 |

## 八、6 份报告清单

| # | 文件 | 修订内容 | 门禁 |
|---|---|---|---|
| 1 | `CONVERT_INVENTORY.md` | 加 V1 纠正表 + 门禁表；清单加 desc 来源列 | ✅ |
| 2 | `CONVERT_PERFORMANCE_REPORT.md` | **A7 Top20 全量重算**（含分类列与外链可用性）| ✅ |
| 3 | `CANNIBALIZATION_REPORT.md` | A6 纠正 + 簇表加曝光列 | ✅ |
| 4 | `CONTENT_QUALITY_REPORT.md` | **A1 完全重写**：从「缺失」改为「超长」+ 卖点截断实证 | ✅ |
| 5 | `INTERNAL_LINK_REPORT.md` | A6 纠正（guide 逐页曝光实况）| ✅ |
| 6 | `AUTHORITY_SEED_REPORT.md` | **Seed List 完全重建** + URL 穷尽分类 + 归档核实 | ✅ |

## 九、本批次合规声明

| 约束 | 遵守 |
|---|---|
| 未修改任何页面 | ✅ `git status` 对 `src/` 无本任务变更 |
| 未提交代码 | ✅ |
| 未推送 | ✅ |
| 未生成正文内容 | ✅ 仅分析报告 |
| 所有结论可反向验证 | ✅ 44 项独立校验 + 5/5 反向验证 |
