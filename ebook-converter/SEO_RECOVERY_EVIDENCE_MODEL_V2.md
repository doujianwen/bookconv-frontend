# SEO Recovery 证据模型 V2（SEO_RECOVERY_EVIDENCE_MODEL_V2）

> 阶段：**Phase 1.1** · 每条 claim 标注状态与证据，未验证的一律 UNKNOWN

## 一、FACT（有直接证据）

| # | Claim | Status | Evidence |
|---|---|---|
| F1 | 18 个 Convert 页零曝光 | **FACT** | GSC Search Analytics（91 天）|
| F2 | 其中 14 个为 Discovered - currently not indexed | **FACT** | URL Inspection API |
| F3 | 其中 3 个为 Submitted and indexed（已收录）| **FACT** | URL Inspection API |
| F4 | 其中 1 个为 URL is unknown to Google | **FACT** | URL Inspection API |
| F5 | **0 个**为 Crawled - currently not indexed | **FACT** | URL Inspection API |
| F6 | 线上 sitemap 含全部 31 个 Convert 页 | **FACT** | curl 实时抓取 |
| F7 | SOURCE_ONLY = 0（源码与线上无分歧）| **FACT** | 集合比对 |
| F8 | 8 个"异常 URL"全部 HTTP 200 + canonical 自指 | **FACT** | 真实 HTTP GET |
| F9 | 8 个 URL 的 GSC `inSitemap` 报空，但线上 sitemap 含它们 | **FACT** | curl + API 对比 |
| F10 | `/blog/sync-ebooks-reading-groups` 在线上 sitemap 但源码已 301 | **FACT** | LIVE_ONLY 集合 |
| F11 | Convert 总曝光 633，总点击 0 | **FACT** | GSC |
| F12 | 81 / 121 页 description >160 字符 | **FACT** | 源码解析 |

## 二、UNKNOWN（无因果证据，**不得转为推断**）

| # | Claim | Status | Why UNKNOWN |
|---|---|---|
| U1 | 「缺少抓取」由弱权威导致 | **UNKNOWN** | **无因果证据**。14 页未抓取可能涉及 crawl prioritization / internal linking / authority / freshness / site-level signals / technical issues / Google scheduling，本数据集无法区分 |
| U2 | 外链可解释 U1 | **UNKNOWN** | **无因果证据**。未证明「外链基线 → 必然解释 14 个未抓取页」|
| U3 | 存在 Manual Action | **RESOLVED** ✅（GSC 实测，90天窗口）| 无 GSC 人工处置证据 |
| U4 | 搜索量已验证 | **NO** | U3 UNKNOWN，29 条 live 全部 HISTORICAL，0 条 VERIFIED |
| U5 | 「已收录的 3 页为何零展示」| **UNKNOWN** | 需搜索量判断是否真无需求 |
| U6 | 8 个 URL 的 GSC `inSitemap` 为何报空 | **UNKNOWN** | 已知线上有；**GSC 侧原因无直接证据**（分类为 DATA-LAG 是基于对比推断）|
| U7 | `Discovered - currently not indexed` 的成因 | **UNKNOWN** | 同 U1 |

## 三、NO（明确为假 / 未达成）

| # | Claim | Status | Evidence |
|---|---|---|
| N1 | 「zero impressions = not indexed」| **NO — 已被推翻** | 3 / 18 零曝光页已收录 |
| N2 | 「源码与线上 sitemap 不一致」| **NO — 已被推翻** | SOURCE_ONLY = 0 |
| N3 | 「搜索量数据可信」| **NO** | 注释自述虚高 30–70 点；无 fetchedAt；距今 90 天 |

## 四、统计

| 类别 | 数量 |
|---|---|
| FACT | **12** |
| UNKNOWN | **7** |
| NO（已推翻/未达成）| **3** |

## 五、⚠️ 本模型相对 V1 的关键变化

| # | V1 的说法 | V2 的修正 |
|---|---|---|
| 1 | 「U1 与 U5 互为依赖，U5 是 U1 的必要前置」| 🔴 **降级为 UNKNOWN**。无因果证据支持该依赖链 |
| 2 | 「14 页未抓取指向抓取预算/权重」| 🔴 拆分为 FACT（未抓取）+ UNKNOWN（原因）|
| 3 | 「7 个 seed 不在 sitemap」| 🔴 **已被线上抓取推翻**；实为 GSC 字段报空 |
