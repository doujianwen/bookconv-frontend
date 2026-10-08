# SEO Recovery 数据基线总表 V1（SEO_RECOVERY_DATA_BASELINE_V1）

> 阶段：**DATA ACQUISITION** · 只读取，未修改任何生产文件
> 执行时间：2026-10-07 18:12–18:16
> 本表所有数字**从数据层重新计算**，未复制旧报告

## 一、4 个数据缺口状态

| Data Gap | Previous Status | Current Status | Evidence | Blocking? |
|---|---|---|---|---|
| Manual Action | UNKNOWN | **UNKNOWN** | GSC 无公开 API 端点；项目内无相关脚本；需人工登录后台 | 🔴 **是** — 阻塞 H5 |
| U1 Index Coverage | UNKNOWN | 🟢 **RESOLVED** | 真实 API 调用 18/18 URL，coverageState 全部返回 | 🟡 部分（U2 仍部分未解）|
| U3 Search Volume | UNKNOWN | **UNKNOWN** | constants.ts 50 条盘点完成，但 **0 条达到 VERIFIED**；无采集时间戳 | 🔴 **是** — 阻塞 REMOVE/MERGE/NOINDEX/扩展 |
| U5 External Link | UNKNOWN | **UNKNOWN**（部分数据已取）| GSC `referringUrls` 计数已取（0/1/2），但 referring domain / anchor / DA 全部不可得 | 🔴 **是** — 阻塞外链投放 |

## 二、🔴 本轮最重要的发现：U1 推翻了核心假设

| 之前的假设 | 真实数据 |
|---|---|
| 「18 个零曝光 Convert 页 = 未收录」| ❌ **错误** |

| 真实 Coverage State | 页数 | 含义 |
|---|---:|---|
| Discovered - currently not indexed | **14** | 已发现**未抓取** ⇒ 抓取侧问题 |
| Submitted and indexed | **3** | 已收录 ⇒ 零曝光不是收录问题 |
| URL is unknown to Google | **1** | Google 尚未发现 |
| Crawled - currently not indexed | **0** | 已抓取未收录 ⇒ 内容侧问题 |
| **合计** | **18** | |

**这意味着「提升内容质量以解决收录」的思路需要重新评估**——14/18 的页根本没被抓取过。

## 三、基线数字交叉确认（从数据层重算）

| # | 指标 | 值 | 数据层来源 |
|---|---|---|
| 1 | Convert pages | **31** | `D.live` kind=convert |
| 2 | zero-impression Convert | **18** | `D.tiers.D` |
| 3 | description >160 | **81 / 121** | `D.live` descLen |
| 4 | Guide with exposure | **3** | guide imp>0 |
| 5 | Top20 | **5** | `D.top20All` |
| 6 | valid external-link assets | **27** | `urlClass` ∈ {asset, asset_es} 且 imp>0 |
| 7 | 301 | **3** | `D.classDist` |
| 8 | 404 | **1** | `D.classDist` |
| 9 | tag | **1** | `D.classDist` |
| 10 | same-slug groups | **12** | `D.clusters` |

## 四、本轮新取得的真实数据（非推断）

| # | 数据 | 值 | 来源 |
|---|---|---|
| 1 | 18 个零曝光页的 coverageState | 3 类分布（见第二节）| GSC URL Inspection API |
| 2 | 27 个 seed 的 coverageState | 25 Submitted and indexed / 2 Crawled not indexed | 同上 |
| 3 | 27 个 seed 的 referringUrls 计数 | 合计 **33** | 同上 |
| 4 | 18 页中在 sitemap 的数量 | **17 / 18** | 同上 |
| 5 | 27 个 seed 中不在 sitemap 的数量 | **7** | 同上 |

## 五、🔴 发现的一个待核实矛盾

| 事实 | 来源 A | 来源 B |
|---|---|---|
| sitemap 是否包含全部 Convert 页 | **源码 `sitemap.ts:248`** 对 `CONVERSION_PAGES` 全量输出 | **API 实测**：7 个 seed 页不在 sitemap |

不在 sitemap 中的 seed 页：

| URL | Coverage State |
|---|---|
| `/convert/azw3-to-epub` | Submitted and indexed |
| `/blog/why-convert-lit-to-epub` | Crawled - currently not indexed |
| `/guide/mobi-to-epub-keep-formatting` | Submitted and indexed |
| `/convert/azw3-to-mobi` | Submitted and indexed |
| `/convert/epub-to-rtf` | Submitted and indexed |
| `/convert/pdf-to-epub` | Submitted and indexed |
| `/convert/docx-to-epub` | Submitted and indexed |

⚠️ **这是一个矛盾，不能自行解释。** 两种可能：
1. 线上部署的 sitemap 与当前源码不一致（源码更新未部署）；
2. GSC 的 `inSitemap` 字段反映的是**上次抓取的 sitemap 快照**，非实时。

**判定需要**：直接抓取线上 `https://www.bookconv.com/sitemap.xml` 核对实际条目数。

## 六、是否可以进入下一阶段

| 缺口 | 是否阻塞 |
|---|---|
| U1 Index Coverage | 🟡 已解决，但**新结论改变了优先级**（抓取侧 > 内容侧）|
| Manual Action | 🔴 阻塞 H5（外链时机）|
| U3 Search Volume | 🔴 阻塞 REMOVE/MERGE/NOINDEX/扩展 |
| U5 External Link | 🔴 阻塞外链投放 |

### 结论

> **3 个缺口仍为 UNKNOWN 且阻塞对应动作。**
>
> 特别是 **U1 的结果反而加重了 U5 的阻塞**：14/18 的零曝光页是「已发现未抓取」，抓取预算不足通常与权重/内链相关，
> 而权重数据（U5）恰好 UNKNOWN。⇒ **两个缺口互相依赖，必须先解 U5。**
