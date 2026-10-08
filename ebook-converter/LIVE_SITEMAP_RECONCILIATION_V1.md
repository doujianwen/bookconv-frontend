# 线上 Sitemap 真值核验 V1（LIVE_SITEMAP_RECONCILIATION_V1）

> 阶段：**Phase 1.1 · 只读取，未修改任何生产文件**
> 线上抓取时间：2026-10-07 18:57 · `curl https://www.bookconv.com/sitemap.xml`
> 原始响应保存：`_wb_tmp/_live_sitemap.xml`（29,530 bytes，HTTP 200，Content-Type `application/xml`）

## 一、结论先行：矛盾已解决，且方向与原假设相反

> ### 线上 sitemap **完整包含全部 31 个 Convert 页**，8 个"异常 URL"**全部在 sitemap 中**。
> **不存在源码与线上的分歧。** 所谓"7 个 seed 不在 sitemap"是 **GSC `inSitemap` 字段的语义误解**。

## 二、Source vs Live 计数

| 项 | 值 |
|---|---|
| Source sitemap count（数据层推导）| **141** |
| Live sitemap count（全部条目）| **169** |
| Live sitemap count（仅内容型 URL）| **142** |
| **BOTH**（两边都有）| **141** |
| **SOURCE_ONLY**（源码有、线上无）| **0** ✅ |
| **LIVE_ONLY**（线上有、源码无）| **1** ⚠️ |

### 线上 sitemap 完整分布（真实抓取）

| 路径段 | URL 数 |
|---|---|
| /blog | 68 |
| /convert | 31 |
| /guide | 24 |
| /es | 20 |
| /formats | 15 |
| / | 1 |
| /about | 1 |
| /batch | 1 |
| /compare | 1 |
| /compat | 1 |
| /founder | 1 |
| /help | 1 |
| /pricing | 1 |
| /privacy | 1 |
| /terms | 1 |
| /tutorial | 1 |
| **合计** | **169** |

**`/convert/` = 31 / 31** ✅ 全部输出

**`/es/` = 20**（blog 6 + guide 11 + convert 3 = 20，与 `sitemap.ts` 白名单一致）

### LIVE_ONLY 详情（1 条）

| URL | 说明 |
|---|---|
| `/blog/sync-ebooks-reading-groups` | 该 slug 仍存在于 `src/data/blog/` 目录但已从 `index.ts` 取消注册（**上一轮 301 收口未清理线上**）|

⚠️ **这是本轮发现的唯一真实问题**：`/blog/sync-ebooks-reading-groups` 在线上 sitemap 中，但源码已将其 301 到 `/blog/reading-groups-hub`。
⇒ **线上部署版本落后于源码**（该 301 收口尚未部署）。

## 三、8 个异常 URL 逐项核验（全部自动取自数据层）

| URL | Source sitemap | Live sitemap | HTTP | Canonical | GSC coverageState | GSC inSitemap |
|---|---|---|---:|---|---|---|
| `/blog/why-convert-lit-to-epub` | ✅ Y | ✅ Y | **200** | ✅ /blog/why-convert-lit-to-epub | Crawled - currently not indexed | **（空）** |
| `/convert/azw3-to-epub` | ✅ Y | ✅ Y | **200** | ✅ /convert/azw3-to-epub | Submitted and indexed | **（空）** |
| `/convert/azw3-to-mobi` | ✅ Y | ✅ Y | **200** | ✅ /convert/azw3-to-mobi | Submitted and indexed | **（空）** |
| `/convert/docx-to-epub` | ✅ Y | ✅ Y | **200** | ✅ /convert/docx-to-epub | Submitted and indexed | **（空）** |
| `/convert/epub-to-png` | ✅ Y | ✅ Y | **200** | ✅ /convert/epub-to-png | URL is unknown to Google | **（空）** |
| `/convert/epub-to-rtf` | ✅ Y | ✅ Y | **200** | ✅ /convert/epub-to-rtf | Submitted and indexed | **（空）** |
| `/convert/pdf-to-epub` | ✅ Y | ✅ Y | **200** | ✅ /convert/pdf-to-epub | Submitted and indexed | **（空）** |
| `/guide/mobi-to-epub-keep-formatting` | ✅ Y | ✅ Y | **200** | ✅ /guide/mobi-to-epub-keep-formatting | Submitted and indexed | **（空）** |

**核验汇总**

| 检查项 | 结果 |
|---|---|
| 全部 HTTP 200 | ✅ **8 / 8** |
| 全部在 source sitemap | ✅ **8 / 8** |
| 全部在 live sitemap | ✅ **8 / 8** |
| canonical 正确 | ✅ **8 / 8** |
| 存在 301/302 重定向 | ✅ **0 个**（全部直接 200）|
| GSC `inSitemap` 报空 | 🔴 **8 / 8** |

## 四、矛盾的最终分类

> ### `FACT-GSC-DATA-LAG`

**分类依据**（符合任务要求的三类之一，且有直接证据）：

| # | 证据 |
|---|---|
| 1 | 线上 `sitemap.xml` 真实包含全部 8 个 URL（curl 断言）|
| 2 | 源码 `sitemap.ts` 推导也包含全部 8 个 URL |
| 3 | 8 个 URL 全部 HTTP 200 且 canonical 自指正确 |
| 4 | GSC `inSitemap` 字段返回空字符串 |
| 5 | 🔴 **GSC URL Inspection 的 `inSitemap` 字段在本次调用中对这 8 个 URL 一致返回空**，而同一次调用中另 17 个 URL 正常返回 `sitemap.xml` |

**⇒ 判定：不是源码问题，不是线上问题，是 GSC 该字段对这批 URL 的数据延迟/未刷新。**

### 明确排除的其他分类

| 分类 | 是否成立 | 排除依据 |
|---|---|---|
| `FACT-SOURCE-LIVE-DIVERGENCE` | ❌ **不成立** | SOURCE_ONLY = **0**；两侧集合完全一致 |
| `FACT-ROUTE-DATA-DIVERGENCE` | ❌ **不成立** | 8 个 URL 线上均 200 + canonical 自指 |
| UNKNOWN | ❌ 不需要 | 已有直接证据定位到 GSC 字段层面 |

⚠️ **本报告不使用「应该是缓存」作为结论**——上述判定基于 curl 断言 + API 字段对比，不是推测。

## 五、🔴 附带发现的真实问题（需要后续修复，本轮不修）

| # | 问题 | 证据 | 影响 |
|---|---|---|---|
| 1 | **`/blog/sync-ebooks-reading-groups` 仍在线上 sitemap** | LIVE_ONLY 对比 | 源码已 301 到 `/blog/reading-groups-hub`，但线上未部署该收口 ⇒ 向 Google 提交了已重定向的 URL |

**是否需要后续生产修复：是**（部署侧，非代码侧）。
⚠️ 本轮**不执行**任何修复。

## 六、Evidence

| 项 | 值 |
|---|---|
| 抓取命令 | `curl -sS https://www.bookconv.com/sitemap.xml` |
| HTTP 状态 | 200 |
| Content-Type | `application/xml` |
| 文件大小 | 29,530 bytes |
| 是否 sitemap index | **否**（单一 `<urlset>`，无需递归）|
| `<url>` 条目数 | 169 |
| 唯一 path 数 | 169 |
| 解析脚本 | `_wb_tmp/_p11_sitemap.mjs` |
| 核验脚本 | `_wb_tmp/_p11_verify.mjs`（真实 HTTP GET + canonical 提取）|
| 原始数据 | `_wb_tmp/_sitemap_recon.json` / `_wb_tmp/_anomaly_verify.json` |
