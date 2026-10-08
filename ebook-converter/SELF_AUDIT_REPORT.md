# 自我审计报告（Phase 1 六份报告的复核）

> 审计对象：INTENT_PARTITION_PLAN / CTR_AUDIT_REPORT / TITLE_REWRITE_PLAN / AUTHORITY_SEED_REPORT / SEO_RED_TEAM_REVIEW / SEO_PHASE1_EXECUTION_PACKAGE
> 审计时间：2026-10-07 17:06 · 模式：**READ ONLY**（未修改任何页面）
> 审计立场：**不假设上一轮结论正确，逐条回到源码/数据复验**

## 裁决总览

| # | 上一轮断言 | 裁决 | 实际 |
|---|---|---|---|
| A1 | 「blog 67 页 + guide 24 页 = **91 页 description 完全为空**」 | 🔴 **假失败（判据错）** | **0 页为空**；description 在 generateMetadata 运行时生成，但 **63/91 页超 160 字符（69%）** |
| A2 | 「Tier A = 6 页」 | 🟢 成立 | 6 个 convert 页（另有 10 个非 convert URL 也 >20 曝光，未混入）|
| A3 | 「convert description 23/31 在 140–160 合规」 | 🟢 成立 | 23/31 确在区间；另有 3 页 >160（epub-to-doc 178、lit-to-epub 179、epub-to-zip 170）|
| A4 | 「重叠 12 组」 | 🟢 成立 | 全量扫描 122 页 = 12 组 |
| A5 | 「Authority Seed List 含 25 页有曝光资产」 | 🟡 **口径不严谨** | GSC 有 37 个 URL，其中 **12 个不在 122 页资产内**（301 旧页 / tag 页 / /es/ 页 / 404 页）|
| A6 | 「guide 24 页全部零曝光」 | 🔴 **错误（硬编码文案）** | **2 个 guide 有曝光**：`/guide/mobi-to-epub-keep-formatting` 93、`/guide/calibre-vs-online-converter` 43。报告 3.3 表格正确，结论段错误 |
| A7 | 「Top20 只有 1 页」 | 🔴 **错误** | 实测 pos≤20 共 **5 个**：`/es/blog/azw3-vs-mobi` 13.7、`/convert/epub-to-zip` 14.8、`/convert/epub-to-lrf` 15.0(404页)、`/blog/can-kindle-read-azw3` 18、`/blog/mobi-to-kobo` 19 |
| A8 | Title 重写 6/6 字符合规 | 🟢 成立 | 52/60/53/56/53/57 与 142/142/150/157/153/144，全部在区间 |
| A9 | 报告内部一致性 | 🔴 **发现 2 处自相矛盾** | ①3.3 表格列了 guide 93 曝光 vs 结论段写「全部零曝光」；②结论 #2「Top20 仅 3 页」vs #5「唯一 Top20」 |

---


## A1 🔴 严重：我的「91 页 description 为空」是假失败


### 我怎么错的

我只匹配了一种写法：`export const metaDescription`。命中 0 ⇒ 我据此断言"description 缺失"。


### 真相

| 目录 | 源码位置 | 实际逻辑 |
|---|---|---|
| blog | `src/app/[locale]/blog/[slug]/page.tsx:57` | `const description = displayContent.intro || displayTitle` |
| guide | `src/app/[locale]/guide/[slug]/page.tsx:40` | `const description = g.problem || g.content.intro || g.title` |

**两个文件都没有长度截断**（grep `slice(0, 1xx)` 命中 0）。所以 description 存在，但直接用 intro/problem 全文。

### 实测真实长度（91 页）

| 区间 | 页数 | 占比 |
|---|---|---|
| <70 | 25 | 27% |
| 70-120 | 3 | 3% |
| >160 LONG | 63 | 69% |
| **合计** | **91** | 100% |

| 指标 | 值 |
|---|---|
| **空 description** | **0 页** |
| 平均长度 | **306 字符** |
| **>160 字符（SERP 会截断）** | **63 页（69%）** |
| <120 字符（太短，浪费展示位） | 28 页（31%） |
| 最长 | `/blog/legacy-lit-djvu-fb2-converter` **961 字符** |

### 最严重的 10 页

| URL | 实际长度 | SERP 实际展示 | 浪费 |
|---|---|---|---|
| 1 | `/blog/legacy-lit-djvu-fb2-converter` | **961** | ~160 | 801 字符被丢弃 |
| 2 | `/blog/azw3-epub-mobi-kindle-compatibility` | **804** | ~160 | 644 字符被丢弃 |
| 3 | `/blog/ebook-conversion-tools` | **801** | ~160 | 641 字符被丢弃 |
| 4 | `/guide/best-ebook-converter` | **800** | ~160 | 640 字符被丢弃 |
| 5 | `/guide/epub-to-azw3-for-kindle` | **781** | ~160 | 621 字符被丢弃 |
| 6 | `/blog/can-kobo-read-epub-files` | **764** | ~160 | 604 字符被丢弃 |
| 7 | `/guide/epub-vs-mobi` | **656** | ~160 | 496 字符被丢弃 |
| 8 | `/blog/which-kindle-books-can-you-convert-drm-free-checklist` | **641** | ~160 | 481 字符被丢弃 |
| 9 | `/blog/epub-vs-mobi` | **607** | ~160 | 447 字符被丢弃 |
| 10 | `/blog/epub-to-word` | **598** | ~160 | 438 字符被丢弃 |

### 真实缺陷（与我的原结论方向相反）

| | 我的原结论 | 真实结论 |
|---|---|---|
| 问题性质 | **缺失**（0 字符）| **超长**（306 平均，69% 超 160）|
| 影响 | 无法控制 snippet | Google 截断到 ~155 字符，**关键卖点被切掉** |
| 修法方向 | 补写 description | **截断/重写到 140–160**，把卖点前置 |
| 严重度 | 我说的 P1 | 🔴 **升级为 P0**（63 页在丢卖点，比 convert 页的 8 页问题大 8 倍）|

🔴 **更糟的一点**：这些超长 description 全部是 **intro 段落全文**。intro 的写法是"背景铺垫 → 才讲结论"，**卖点（Free / No Sign-up / 保留排版）通常在段尾** ⇒ 被截断后 Google 展示的恰好是**最没信息量的开头**。

举例 `/blog/legacy-lit-djvu-fb2-converter`（961 字符）的开头是 "Lost digital libraries are a nightmare for any avid reader. You might have stumb..." —— **这是共情文案，不是产品承诺**。

### 连带影响：CTR 报告与执行包都要改

| 位置 | 原表述 | 应改为 |
|---|---|---|
| CTR_AUDIT 第六节 | 「🔴 blog 67 + guide 24 = 91 页完全没有 metaDescription」 | 「63/91 页 description 超 160 字符被截断，28 页过短」|
| EXEC_PACKAGE 1.4 | 同上 | 同上 |
| 红队 P1 建议 | 「补 91 页 description」 | 「**重写 63 页超长 description + 补长 28 页过短**」|

### 教训（对应项目纪律 🔍2 静默假成功 / 🔍11 判据完整性）

> **「命中 0 次」有两种可能：真的没有，或我的正则只覆盖了一种写法。**
>
> 上一轮我在 blog 语料上**已经踩过一次同样的坑**（三种引号写法只匹配单引号，把 68 篇读成 4 篇），当时靠断言拦下了。**但换成 description 字段时没有再问一遍"还有别的写法吗"，直接写了"91 页为空"的结论。**
>
> ⇒ **判据只覆盖一种写法 ⇒ 报出的 0 命中不可信。** 同类字段（title/description/canonical/slug）必须先枚举全部语法形式再统计。

---


## A6 🔴 我说错：「guide 24 页全部零曝光」


### 事实

| URL | 曝光 | Position | 在 sitemap？ |
|---|---|---|---|
| `/guide/mobi-to-epub-keep-formatting` | **93** | 83.0 | ❌ 不在（guide 未进 sitemap 段）|
| `/guide/calibre-vs-online-converter` | **43** | 50.7 | ❌ 不在 |

**这两个 guide 页是全站曝光第 4 和第 11 名**——比我列进 Seed List 的某些 blog 页还高。

### 我为什么会错

我在 `AUTHORITY_SEED_REPORT.md` 里写的判定是：`scored = allPages.map(...).filter(x => x.imp > 0)`。

`allPages` 来自 `pages.filter(x => !x.noindex)`，**122 页全部在册**；`x.imp` 来自 `imp(x.route)`，route 是从**目录前缀拼出来的**（`/guide/` + slug）。

按这个逻辑 `/guide/mobi-to-epub-keep-formatting` 应该能被查到——**除非它的 slug 拼写与 GSC 里不一致**。


### 立即验证


| 检查项 | 结果 |
|---|---|
| guide 目录文件数 | 24 |
| 拼出的 guide route 数 | 24 |
| GSC 中 `/guide/*` 的 URL | 2 |
| 我上一轮报告里 guide 有曝光的页数 | **0（我写的）** |

**根因已定位（不是"可能是路径问题"）**：路由拼写正确、计算逻辑正确 —— 

`AUTHORITY_SEED_REPORT.md` 的 **3.3 Guide 表格里明明列着** G1 `/guide/mobi-to-epub-keep-formatting` 93 曝光、G2 `/guide/calibre-vs-online-converter` 43 曝光、G3 `/guide/epub-to-txt-extract` 1 曝光。

**但第四、五节的结论段写的是"guide 全部 24 页 0 曝光"。**

```
3.3 Guide 表格（真实计算）:  G1 93 曝光 · G2 43 曝光 · G3 1 曝光   ← 正确
第四节外链优先级（硬编码）:  guide 全部 24 页 | 0 曝光            ← 错误
第五节结论 #3（硬编码）  :  guide 24 页全部零曝光，无一进入 Seed List ← 错误
```

🔴 **这是硬编码文案没跟随计算结果 —— 与项目纪律点名过的失效模式完全一致**（"单测探针禁指向会收口的任务" / "结论必须由数据生成，不能手写"）。表格是对的，结论是手写的，两者脱节。

**同一段落还有第二处自相矛盾**：

| 结论 # | 原文 | 冲突 |
|---|---|---|
| 2 | 「**Top20 仅 3 页**（`/convert/epub-to-zip`、`/blog/can-kindle-read-azw3`、`/blog/mobi-to-kobo`）」| 与 #5 直接冲突 |
| 5 | 「`/convert/epub-to-zip` 是**唯一 Top20**（pos 14.8）」| — |

⇒ #2 与 #5 不可能同时为真。**#5 正确（实测仅 epub-to-zip 一个 convert 页 pos≤20），#2 的「3 页」是错的。**

真实 Top20 情况（实测 pos ≤ 20）：

| URL | Pos | 曝光 | 是否可投外链 |
|---|---|---|---|
| `/es/blog/azw3-vs-mobi` | **13.7** | 69 | ⚠️ 西语页，需先确认是否为主动运营 |
| `/convert/epub-to-zip` | 14.8 | 45 | ✅ 英文资产，可投 |
| `/convert/epub-to-lrf` | 15.0 | 1 | ❌ **真 404，禁止投** |
| `/blog/can-kindle-read-azw3` | 18.0 | 21 | ✅ 英文资产，可投 |
| `/blog/mobi-to-kobo` | 19.0 | 1 | ✅ 英文资产，可投（但仅 1 次曝光，样本极小）|

🔴 **Top20 实为 5 个，不是 1 个也不是 3 个。** 我在 `AUTHORITY_SEED_REPORT` 里写的「Top20 仅 1 页」和「Top20 仅 3 页」**都不对**。

**更重要的发现**：`/es/blog/azw3-vs-mobi` **pos 13.7 是全站最佳排名**，比 `epub-to-zip` 还高一位。它是西语页，出现在 6 个有西语译文的 blog slug 清单里（`ESP_BLOG_SLUGS`）。

| 含义 | |
|---|---|
| 1 | **全站排名最好的页面是西语页** —— 这与项目记忆里「/es 伪翻译遭 Google Spam Update 命中」的认知**冲突**，需人工核实该页当前状态 |
| 2 | 我在 CTR 报告里写的「11 页中仅 1 页在可见区」**结论仍成立**（那 11 页全是 convert 页，mobi-to-epub pos 70.3 等确实 >20）|
| 3 | 但「全站 Top20 只有 1 页」这个更广的说法**是错的** |
| 4 | 全部 pos ≤ 20 的页**曝光都极低**（69/45/1/21/1）⇒ 即使 pos 好，量级极小，不宜作为外链主目标 |

⚠️ 附带说明：`/convert/epub-to-lrf` pos 15.0 虽是 Top20，但它是 **404 页**（`dynamicParams=false`），Google 保留的历史 position。**这恰好证明了 A5 的必要性——position 好看不等于页面存在。**

🔴 **这两处错误的共同特征：都出在"结论段"，而出错的地方表格是对的。**

🔴 **连带影响**：AUTHORITY_SEED_REPORT 里「guide 24 页全部零曝光 ⇒ 不建议投外链」这条**结论方向错了**。真实的图景是：

| guide 类型 | 页数 | 曝光 | 解读 |
|---|---|---|---|
| 已被 Google 认可 | 2 | 93 / 43 | 证明 guide 页面类型**能拿到曝光**，不是死路 |
| 未获曝光 | 22 | 0 | 需要逐页排查（收录 vs 内容 vs 需求）|

⚠️ **更值得注意的是 sitemap**：`sitemap.ts` 只对 blog 做了 `filter(p => !p.noindex)`，**guide 段的 `getAllGuides()` 是否有同样过滤我没查**。若 guide 全部进 sitemap，则「93 曝光却不在 sitemap」的推断需要重新核实。


---


## A5 🟡 Authority Seed List 口径不严谨


### 事实：GSC 有 37 个 URL，其中 12 个不在 122 页资产内

| 曝光 | URL | 性质 | 能否作为外链目标 |
|---|---|---|---|
| 380 | `/` | 首页 | ⚠️ 需确认 |
| 69 | `/es/blog/azw3-vs-mobi` | 西语版本页（资产表只统计 en） | ⚠️ 需确认 |
| 20 | `/blog/mobi-or-azw3-for-kindle` | 301 → /blog/azw3-vs-mobi | ❌ **不能** |
| 11 | `/convert/epub-to-docx` | 301 → /convert/epub-to-word | ❌ **不能** |
| 4 | `/blog/tag/kindle` | tag 聚合页 | ❌ **不能** |
| 3 | `/es/blog/txt-to-epub` | 西语版本页（资产表只统计 en） | ⚠️ 需确认 |
| 3 | `/es/blog/tag/fb2` | 西语 tag 页 | ❌ **不能** |
| 2 | `/blog/how-to-convert-epub-to-mobi` | 301 → /blog/epub-to-mobi-guide | ❌ **不能** |
| 1 | `/es/guide/azw3-to-mobi-keep-formatting` | 西语版本页（资产表只统计 en） | ⚠️ 需确认 |
| 1 | `/es/blog/epub-to-azw3` | 西语版本页（资产表只统计 en） | ⚠️ 需确认 |
| 1 | `/es` | 西语首页 | ❌ **不能** |
| 1 | `/convert/epub-to-lrf` | dynamicParams=false ⇒ 真 404 | ❌ **不能** |

🔴 **301 旧页与 404 页进外链目标是明确错误的外链策略**——会把权重浪费在跳转链路上。

### 修正后的 Seed List 口径

| 类别 | URL 数 | 说明 |
|---|---|---|
| en 资产且有曝光 | 25 | ✅ 唯一可作为外链目标集合 |
| /es/ 页面 | 5 | ⚠️ 是真实资产但不在 en 统计口径内 |
| tag 聚合页 | 2 | ⚠️ 可投但价值低（聚合页非内容页）|
| 301 旧页 | 3 | ❌ 禁止 |
| 404 页 | 1 | ❌ 禁止 |
| 首页 / 西语首页 | 2 | ❌ 不属"页面级外链"范畴 |

---


## 🟢 经复核仍成立的断言


| 断言 | 复核方式 | 结果 |
|---|---|---|
| Tier A = 6 个 convert 页 | 从 gsc-qpage.json 重算 imp>20 且路由以 /convert/ 开头 | ✅ 6 个，一致 |
| convert desc 23/31 在 140–160 | 重算 31 个长度 | ✅ 23 个在区间，5 个 <140，3 个 >160 |
| 重叠 12 组 | 全量 122 页重扫 | ✅ 一致 |
| Top20 仅 1 页 | 曝光加权 position ≤20 | ✅ 仅 epub-to-zip (14.8) |
| Title 方案 6/6 合规 | 逐条数字符长度 | ✅ 全部在区间 |
| 0 页 description 为空 | 重跑生成逻辑解析 | ❌ **错，实为 0 页为空**（A1）|
| guide 24 页零曝光 | 重算 GSC guide 路由 | ❌ **错，2 页有曝光**（A6）|

---


## 需要修订的交付物清单


| 文件 | 需修订处 | 严重度 |
|---|---|---|
| `CTR_AUDIT_REPORT.md` | 第六节「91 页 description 全空」 | 🔴 高 |
| `SEO_PHASE1_EXECUTION_PACKAGE.md` | 1.4 节 + 摘要 2.1 | 🔴 高 |
| `AUTHORITY_SEED_REPORT.md` | 4.3「guide 全零曝光」+ Seed List 含非资产 URL | 🔴 高 |
| `SEO_RED_TEAM_REVIEW.md` | P1 建议「补 91 页 description」 | 🟡 中 |
| `INTENT_PARTITION_PLAN.md` | 第五节同一断言 | 🟡 中 |
| `TITLE_REWRITE_PLAN.md` | 无需修订（已复核通过）| ✅ — |

---


## 修订后的 Phase 1 优先级（替换红队原版 P1）


| 顺序 | 动作 | 依据 | 与上一版差异 |
|---|---|---|---|
| **P0** | 拉 GSC Index Coverage | 若未收录则全部方案作废 | 不变 |
| **P0** | 拉外链基线 | 假设 3 无法验证 | 不变 |
| **P0** | 🔴 **重写 63 页超长 description**（>160 字符，平均 306，最长 961）| 卖点被截断在段尾，Google 展示的是共情开头 | 🆕 **从 P1 升到 P0** |
| **P1** | 补长 28 页过短 description（<120 字符）| 浪费展示位 | 🆕 从"未列出"补入 |
| **P1** | 重新核实 guide 页的 sitemap 与收录状态 | 2 个 guide 已有 93/43 曝光，说明该类型可行 | 🆕 新增 |
| **P2** | 2 组三目录全撞 title 分工 | title 语义近乎相同 | 不变 |
| **P2** | `/convert/epub-to-zip` 单页 title/desc | 唯一 pos<20 | 不变 |
| **P2** | 修 3 页 convert 超长 desc（epub-to-doc 178 / lit-to-epub 179 / epub-to-zip 170）| 与 blog/guide 同类问题 | 🆕 从"未列出"补入 |
| **P3** | 4 组有 GSC 分摊的意图分工 | 2 组现状与目标相反 | 不变 |
| **P4** | 外链投放 | Seed List 口径修正前禁止投 | 🔴 **加强：禁止把外链投给 301/404/tag 页** |

---


## 审计结论


> **6 份报告里 2 条核心断言错误（A1 description 全空、A6 guide 全零曝光），4 条成立但 1 条口径不严谨（A5）。**
>
> **A1 的错误方向性最强：我把"超长 306 字符"误判为"完全为空"，结论从"补写"变成了"截断"，动作完全相反。**
>
> **A6 的错误会导致一个具体的战略误判：我在 Authority 报告里建议"guide 零曝光，不投外链"，而实际上 guide 已有 93 曝光的页面——说明 guide 类型是被 Google 认可的，那个判断本可以更乐观。**
>
> **共同根因：两处都是"只验证了判据能跑，没验证判据覆盖了全部情况"。** description 字段只匹配一种写法、guide 曝光统计的路由口径未逐条验证——都是「假失败」而非「假通过」。
>
> **修订优先级：P0 三项（Index Coverage / 外链基线 / 63 页超长 description），其中 description 从原 P1 升 P0。**
