# External Link 基线 V1（EXTERNAL_LINK_BASELINE_V1）

> 阶段：**DATA ACQUISITION** · 真实 API 调用
> 数据源：GSC URL Inspection API v1（`searchconsole.googleapis.com/v1/urlInspection/index:inspect`） 的 `referringUrls` 字段
> 执行时间：2026-10-07 18:12–18:16

## 一、可获得的数据与其边界

| 想要的数据 | 可得性 | 说明 |
|---|---|---|
| referring domains | ❌ **不可得** | GSC URL Inspection 只返回**数量**，不返回域名列表 |
| backlinks | ⚠️ 部分 | 仅有数量（1 或 2），无 URL、无锚文本 |
| dofollow / nofollow | ❌ **不可得** | 接口不返回 |
| referring page | ❌ **不可得** | 接口不返回（只给 count）|
| anchor text | ❌ **不可得** | 接口不返回 |
| domain authority | ❌ **不可得** | 项目内无 Ahrefs/Semrush 数据 |
| first seen / last seen | ❌ **不可得** | 接口不返回 |

**唯一真实可得**：`referringUrls` 的**计数**（0 / 1 / 2）。

## 二、A. 27 个 seed asset（真实 API 返回）

| # | URL | Type | Current Referring Domains | Backlinks | Evidence | Status |
|---|---|---|---:|---:|---|---|
| 1 | `/convert/azw3-to-epub` | convert | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 2 | `/blog/why-convert-lit-to-epub` | blog | **UNKNOWN** | 0（计数）| API | 🟡 PARTIAL |
| 3 | `/convert/mobi-to-epub` | convert | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 4 | `/guide/mobi-to-epub-keep-formatting` | guide | **UNKNOWN** | 2（计数）| API | 🟡 PARTIAL |
| 5 | `/es/blog/azw3-vs-mobi` | es-asset | **UNKNOWN** | 2（计数）| API | 🟡 PARTIAL |
| 6 | `/convert/azw3-to-mobi` | convert | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 7 | `/blog/azw3-vs-mobi` | blog | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 8 | `/blog/ebook-formats-explained` | blog | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 9 | `/blog/epub-to-azw3` | blog | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 10 | `/blog/can-kindle-read-azw3` | blog | **UNKNOWN** | 2（计数）| API | 🟡 PARTIAL |
| 11 | `/es/guide/azw3-to-mobi-keep-formatting` | es-asset | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 12 | `/guide/calibre-vs-online-converter` | guide | **UNKNOWN** | 2（计数）| API | 🟡 PARTIAL |
| 13 | `/convert/epub-to-azw3` | convert | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 14 | `/blog/epub-to-mobi-guide` | blog | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 15 | `/convert/epub-to-txt` | convert | **UNKNOWN** | 2（计数）| API | 🟡 PARTIAL |
| 16 | `/convert/epub-to-doc` | convert | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 17 | `/convert/epub-to-mobi` | convert | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 18 | `/convert/epub-to-rtf` | convert | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 19 | `/convert/epub-to-zip` | convert | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 20 | `/convert/lit-to-epub` | convert | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 21 | `/convert/pdf-to-epub` | convert | **UNKNOWN** | 2（计数）| API | 🟡 PARTIAL |
| 22 | `/convert/rtf-to-epub` | convert | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 23 | `/convert/docx-to-epub` | convert | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 24 | `/blog/best-ebook-reader-apps` | blog | **UNKNOWN** | 2（计数）| API | 🟡 PARTIAL |
| 25 | `/guide/epub-to-txt-extract` | guide | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 26 | `/blog/mobi-to-epub` | blog | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |
| 27 | `/blog/mobi-to-kobo` | blog | **UNKNOWN** | 1（计数）| API | 🟡 PARTIAL |

⚠️ **「Current Referring Domains」列全部为 UNKNOWN** —— GSC 不返回域名列表。
「Backlinks」列是 GSC 的 `referringUrls` 计数，**不是外链工具的 backlinks 总数**，两者口径不同，不可混用。

## 三、B. 分层

> **不做分层。**

理由：分层需要「外链数量/质量」作为排序依据。当前只有 GSC 计数（0/1/2，区分度极低），**不足以支撑有意义的分层**。

| 缺什么 | 为什么必须先有 |
|---|---|
| referring domain 列表 | 判断外链来自哪里、是否真实、是否 spam |
| anchor text 分布 | 判断锚文本是否过度集中（可能触发 spam 信号）|
| dofollow/nofollow | 判断链接传递的权威度 |
| 域权威度 | 判断外链价值排序 |

按任务要求：「如果数据不足，不强行分层」。

## 四、C. 结论

> ### `U5 = UNKNOWN`（部分数据已获取）

| 项 | 状态 |
|---|---|
| referring domain 列表 | **UNKNOWN** |
| backlink 总数 | **UNKNOWN** |
| anchor text | **UNKNOWN** |
| dofollow/nofollow | **UNKNOWN** |
| 域权威度 | **UNKNOWN** |
| **GSC referringUrls 计数** | 🟡 **已获取**（见下）|

### 已获取的 GSC 计数（真实数据）

| 计数 | URL 数 |
|---|---|
| 1 | 19 |
| 2 | 7 |
| 0 | 1 |
| **合计** | **27** |
| 总计 referring URLs | **33** |

### 🔴 严禁的表述

| ❌ 禁止 | 原因 |
|---|---|
| 「站点 0 条外链」| GSC 返回的是「有多少页面链接到该 URL」的估算计数，不等于外链总数 |
| 「Backlinks = 33」| 33 是 27 个 URL 的 GSC 计数之和，口径与外链工具不同 |
| 「这些页权重低」| 权重需外链数据支撑，当前 UNKNOWN |

## 五、解除 U5 需要什么

| # | 方案 | 成本 | 能得到什么 |
|---|---|---|
| 1 | Ahrefs / Semrush 免费账户（需注册）| 免费版限域 | referring domains 列表、DA、锚文本 |
| 2 | Google Search Console → 外部链接报告 | 免费，需后台 | 指向本站的**顶级链接页**列表（仍不含锚文本/DA）|
| 3 | Bing Webmaster Tools → 反向链接 | 免费 | 部分补充 |
| 4 | Ahrefs Webmaster Tools（需验证 GSC 所有权）| 免费版有限 | 与 GSC 数据打通 |

**推荐先做 #2**（无需第三方注册，GSC 后台即可看），可先拿到「谁在链我们」的页面级证据。

## 五·补、排除清单（与外链 seed 的区别）

本轮 seed pool = 27 个有效资产。以下 URL **已被排除，不得作为外链目标**：

| 类别 | 数量 | URL | 为何排除 |
|---|---|---|---|
| 301 重定向旧页 | 3 | `/blog/mobi-or-azw3-for-kindle`、`/blog/how-to-convert-epub-to-mobi`、`/convert/epub-to-docx` | 外链权重浪费在跳转链路上 |
| 真 404 | 1 | `/convert/epub-to-lrf` | 页面不存在（如 pos 15.0 但已 404）|
| tag 聚合页 | 1 | `/blog/tag/kindle` | 聚合页权重不传递到具体页 |
| homepage | 2 | `/`、`/es` | 不属页面级外链范畴（除非单独作品牌资产）|
| /es/ 无西语译文 | 3 | `/es/blog/epub-to-azw3`、`/es/blog/txt-to-epub`、`/es/blog/tag/fb2` | 英文兜底（英文正文 + lang=es），属 i18n 完整性问题（M5-2 补译文），非 spam 惩罚 |
| **合计排除** | **10** | | |

## 六、附带发现：seed 池的索引状态

| Coverage State | URL 数 |
|---|---|
| Submitted and indexed | 25 |
| Crawled - currently not indexed | 2 |

| 指标 | 值 |
|---|---|
| 在 sitemap.xml 中 | 20 / 27 |
| 🔴 **不在 sitemap 中的** | **7** |

**`/convert/azw3-to-epub`、`/blog/why-convert-lit-to-epub`、`/guide/mobi-to-epub-keep-formatting`、`/convert/azw3-to-mobi`、`/convert/epub-to-rtf`、`/convert/pdf-to-epub`、`/convert/docx-to-epub`** 不在 sitemap 中。
⇒ 这解释了为何它们「Crawled - currently not indexed」：已被抓取但 sitemap 未提交。
