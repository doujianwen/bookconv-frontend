# 事故分析：CloudConvert 402 复发（晚间，2026-10-20）

> **本报告为独立诊断产出，不含代码改动**。所有结论标注证据等级（Fact / Assumption / Unknown），凡无法判定的项明确标 Unknown。

## 元信息

| 条目 | 详情 |
|---|---|
| 告警 1 | Job `8d5a8e79-7b50-444b-8148-c1cd2ab25f9d`，epub→azw3，engine=calibre，`2026-10-20T14:24:27.260Z`（北京时间 22:24） |
| 告警 2 | Job `fde9e5d7-8e73-4577-b76b-d08368323d1b`，epub→pdf，engine=calibre，`2026-10-20T14:43:34.859Z`（北京时间 22:43） |
| 路径 | sync `/api/convert`（非 VPS 转发；`CONVERSION_BACKEND_URL` 当前未配置，见 §Q3 根因确认） |
| 错误文案 | `CloudConvert job failed after 1 attempt(s) | engine=calibre: CloudConvert client error 402: Your account has run out of conversion credits` |
| 上午同类告警 | Job `1601068e...`（epub→azw3 calibre，03:04Z / 11:04 北京）、Job `0afc2153...`（pdf→epub auto，03:33Z / 11:33 北京） |
| 间隔 | 晚间两告警间隔 19min；与上午第一告警间隔 ~11h20min（跨 UTC 自然日边界） |
| 分析日期 | 2026-10-20 |

---

## TL;DR（结论先行，≤5 条）

1. **根因与上午同类：仍是 CloudConvert API 账户 credits 耗尽，且本次是免费档日额度在 03:04Z 已被耗尽后，晚间 14:24Z / 14:43Z 两个新 cold start 再次命中 402。** 间隔 > 1 天意味着如果额度每日刷新则晚间应当恢复——实际未恢复 → 额度机制不是「免费档日刷新」，或者账户已叠加付费套餐，二者需人工登录 dashboard 确认。
2. **上午报告的「已用 15、免费档每日 10」存在内部矛盾**（见 §对上午报告的更正）。经独立核实，CloudConvert 官方定价页明确「Free: 10 credits / day, Daily reset」，但「只收取成功转换费用」——失败 job 不扣 credits。本晚两条 `after 1 attempt(s)` 均是创建 job 即被拒（ccRequest L106-109 短路），按 CC 规则不应扣 credits。因此「已用 15」可能是把「创建过多少次请求」误算成「成功消耗多少次」。
3. **P1 纯 JS 扩展（commit 590c704）未覆盖本次失败的两个格式对**：`epub→azw3` 与 `epub→pdf` 均仍在 CloudConvert 路径。原因：P1 只扩展「目标=EPUB」的文本派生对，azw3/pdf 属于「专有二进制输出」明确排除在外。
4. **系统行为（短路缓存 + 告警节流）本次按设计工作**。两次告警间隔 19min > TTL 5min，且为不同 cold start，各自直连 API 各获一次 402，符合 `quotaExhaustedUntil` 的进程级语义；告警签名（引擎标签在 error message 前 80 字符内）不同 → 各发一次，未被节流合并。
5. **推荐优先级：① 人工登录 CC dashboard 确认真实额度状态与重置周期（Critical，阻塞 Q1/Q6 判断）→ ② 充值（Package $18/1000 credits 不过期最省心）→ ③ 长期：若业务依赖稳定，从免费档切换至最低档 Subscription（$10/月 1000 credits，月度重置）或 Package，根除日耗尽风险。**

---

## 对上午报告的更正

上午报告（`hermes-context/incident-2026-10-20-cloudconvert-402-credits.md`，同步于 `docs/`）存在以下需更正项：

| # | 原表述 | 更正 | 依据 |
|---|---|---|---|
| G1 | 「免费档每日 10 credits，已用 15」 | **两者逻辑矛盾**。若上限真为 10，不可能「已用 15」。更可能：① 账户叠加了 Package（一次性购买，不过期）使总额度 > 10；② 「已用 15」计入了失败请求（按 CC 规则「only successful conversions are charged」不应计入）。见 §Q1。 |
| G2 | DEPLOYMENT.md:338 引用「Package $17 / 1000 credits」 | 实测 CC 官方定价页（cloudconvert.com/pricing）当前定价为 **$18 / 1000 credits**（2026-09-30 采集数据）。$17 为过期数字。 |
| G3 | 上午报告未涉及 P1 扩展的边界影响评估 | 本次晚间两条失败格式均不在 P1 覆盖范围内（见 §Q3），需显式记录。 |

---

## Q1 · 免费档额度机制与「已用 15」矛盾

### Q1-a：CloudConvert 免费档额度到底是什么？

**Fact（来源：web search 直接采集 CC 官方定价页 + 多家转载）**：

- CloudConvert 官方定价页（`https://cloudconvert.com/pricing`）明确：
  - Free tier：`10 / day` credits，`Daily reset`
  - Package：一次购买，`never expire`，当前价格 `$18 / 1,000 credits`（实测 2026-09-30 截图）
  - Subscription：`1,000 / month`，`monthly reset`，$10/月起
  - **"Only successful conversions are charged"**（官方 FAQ 原文）
- 失败 job 不扣 credits（CC 官方措辞确认，来自 search result 3）。
- 免费档并发限制 5、最大文件 1GB、最大处理时间 5min。

### Q1-b：「已用 15」与「每日 10」的矛盾如何解释？

三种可能（按置信度排序）：

| 假设 | 置信度 | 可证伪方式 |
|---|---|---|
| A. 账户已叠加 Package，总可用额度 = 10 (每日免费) + N (Package 存量)，早间先消耗 10 免费份，再消耗 Package 存量 5 份 → 累计显示「已用 15」 | **高**（与 ccRequest 的「402 不重试」行为一致：Package 额度耗尽也会 402） | 登录 dashboard 查看 `GET /v2/users/me` 返回的 `credits` 字段 |
| B. 「已用 15」把失败请求也计入消耗（统计口径错） | 中（需对照 CC 计费日志） | 登录 dashboard 查看 usage chart |
| C. 账户是旧版「每月 25」免费档（某些第三方转载误写为 daily，但 CC 官网自 2024 起已统一为 daily 10） | 低 | 同上 |

### Q1-c：额度是「同日内不恢复」还是「跨日后恢复」？

- 官方明确：**Daily reset**（跨日重置）。
- 但重置时间点 **Unknown**（CC 文档未公开 UTC/CET 的具体小时）。Web search result 2 提到「resets midnight UTC」——需人工登录 dashboard 对照 usage chart 验证。

### Q1-d：下一次可能自愈的时间点

**Unknown**。必须人工确认以下最小信息：

1. 登录 `https://cloudconvert.com/account` 查看当前 plan（Free / Package / Subscription）与剩余 credits。
2. 查看 `GET https://api.cloudconvert.com/v2/users/me`（需 `user.read` scope）返回的 `credits` 字段。
3. 查看 usage chart 确认「daily reset」具体在哪个 UTC 小时触发（参考 web search 的「midnight UTC」假设是否成立）。
4. 确认是否有 Auto-Refill 已开启（packages 支持 auto-refill，一旦开启会在 95% 消耗时自动扣费充值）。

**推断**（Fact → Assumption 链路）：
- 若免费档且重置在 UTC midnight：本次 03:04Z 已耗尽 → 08:00CST (00:00Z) 应当恢复 → 14:24Z 不应再 402。实际仍 402 → 假设不成立。
- 更可能的解释：账户已叠加 Package，Package 额度也已耗尽；或套餐为 Subscription 月度额度已耗尽（月末重置）。

### 证据表（Q1）

| 结论 | 证据等级 | 定位 |
|---|---|---|
| CC 免费档 = 10 credits/day, daily reset | Fact | web search 直接采集 `cloudconvert.com/pricing` |
| CC 免费档失败 job 不扣 credits | Fact | 官方 FAQ (`only successful conversions are charged`) |
| CC Package 当前价格 = $18/1000 credits | Fact | 同上（2026-09-30 采集） |
| CC Subscription = $10/月 1000 credits, monthly reset | Fact | 同上 |
| 本次账户具体 plan 类型与剩余额度 | **Unknown** | 需登录 dashboard 或 `GET /v2/users/me` |
| daily reset 具体 UTC 时间点 | **Unknown** | 需 dashboard usage chart 验证 |
| 「已用 15」统计口径是否含失败请求 | **Unknown** | 需 CC usage log 核实 |

---

## Q2 · 根因确认 / 排除

### Q2-a：本晚两条与上午两条是否为同一根因？

**Fact（高置信度，证据链）**：

1. **错误文案完全一致**：`CloudConvert client error 402: Your account has run out of conversion credits` —— 这是 CC API 的标准 402 响应体（`cloudconvert.ts:109` 直接透传）。
2. **时间跨度 > 11 小时**（03:04Z → 14:24Z），远大于短路缓存 TTL（5min）与 Serverless 实例寿命（通常 <15min 单请求）。
3. **引擎均为 calibre**（晚间两条），上午一条 calibre 一条 auto —— 引擎差异不影响 402 判定（402 是账户级状态，与引擎无关）。
4. **排除偶发抖动**：CC 402 是确定性响应（账户额度=0），不会「偶发」；若偶发应为 429（rate limit）或 5xx。
5. **排除后端崩溃**：告警送达飞书 = 代码路径正常执行到 `notifyConversionFailure`。
6. **排除短路缓存误触发**：间隔 > TTL，新 cold start 重置 `quotaExhaustedUntil=0`。

**判定**：同一根因 = **CloudConvert 账户 credits 持续耗尽，跨日未恢复**（或账户 plan 已切换至 subscription 月度耗尽）。

### Q2-b：为何 `epub→pdf` 晚间走 calibre 引擎？

**Fact**：

- `CALIBRE_INPUT_FORMATS` 白名单（`cloudconvert.ts:44-64`）包含 `epub`。
- `isCalibreInput('epub')` → `true` → `createJob(..., useCalibre=true)` → job 携带 `engine:'calibre'`。
- 与上午不同：上午 pdf→epub 的 source=`pdf`，不在白名单 → auto 引擎。
- **符合预期**：epub 在白名单内 → 优先 calibre 引擎（calibre 对 epub→pdf 质量优于 auto default）。

### 证据表（Q2）

| 结论 | 证据等级 | 定位 |
|---|---|---|
| 402 文案逐字匹配 CC 标准错误 | Fact | `cloudconvert.ts:109` + 告警原文 |
| 晚间两条引擎均为 calibre | Fact | 告警原文 `engine=calibre` |
| `isCalibreInput('epub')=true` | Fact | `cloudconvert.ts:44`、`L67-69` |
| `isCalibreInput('pdf')=false` | Fact | `cloudconvert.ts:44-64`（无 `pdf`） |
| 同一根因（非偶发/崩溃/缓存误判） | Fact（高置信） | 错误文案一致 + 时间跨 > TTL + 引擎无关 402 |

---

## Q3 · P1 为何没兜住

### Q3-a：当前纯 JS 路径实际覆盖的转换对清单

实测 `src/lib/conversion.ts` L998-1064 分支（不含 `conversion-map.ts` 声明，因为 map 是 UI 展示，执行分支才是真相）：

**纯 JS 覆盖（免疫 402）**，共 **15 对**（来自 `conversion-map.ts` tool=js 的 15 项，且全部在 `conversion.ts` 有对应分支）：

| 转换对 | conversion.ts 分支变量 | 备注 |
|---|---|---|
| `mobi→txt` | `isMobiToTxt` | L976 |
| `azw3→txt` | `isMobiToTxt` | L976 |
| `mobi→epub` | `isMobiToEpub` | L979 |
| `azw3→epub` | `isMobiToEpub` | L979 |
| `docx→txt` | `isDocxToTxt` | L983 |
| `html→txt` | `isHtmlToTxt` | L987 |
| `txt→epub` | `isTxtToEpub` | L991 |
| `epub→epub` | `isEpubToEpub` | L998（P1 新增） |
| `html→epub` | `isHtmlToEpub` | L999（P1 新增） |
| `docx→epub` | `isDocxToEpub` | L1000（P1 新增） |
| `rtf→epub` | `isRtfToEpub` | L1001（P1 新增） |
| `fb2→epub` | `isFb2ToEpub` | L1002（P1 新增） |
| `lit→epub` | `isLitToEpub` | L1003（P1 新增） |
| `epub→txt` | `isEpubToTxt` | 原有 |
| `epub→rtf` | `isEpubToRtf` | 原有 |
| `epub→fb2` | `isEpubToFb2` | 原有 |
| `epub→docx` | `isEpubToDocx` | 原有 |
| `epub→zip` | `isZipPassthrough` | 原有（非 JS，直接 copy） |

**总计 18 对纯 JS / 本地免疫路径**（含 6 个 P1 新增）。

### Q3-b：`epub→azw3` 与 `epub→pdf` 是否在纯 JS 覆盖范围内？

**Fact**：

- `epub→azw3`：**不在**。`conversion.ts` 无 `isEpubToAzw3` 分支（L998-1064 区间内查无），落入 L1065 `else` → Calibre 不可用（Vercel Serverless） → CloudConvert fallback → 402。
- `epub→pdf`：**不在**。同上，无对应分支，落入 CloudConvert。

**边界原因**（`conversion.ts:996-997` 注释原话）：

> 专有二进制目标（azw3/pdf/mobi/jpeg 等）与图片输出不扩——纯 JS 无法产出可靠文件，仍走 CloudConvert（额度可用时）。

**这是设计决策，非 bug**。azw3 需要 Kindle 专属压缩（TPZ3 头 + 特定字典），PDF 需要排版引擎（页眉页脚、字体嵌入、图像渲染），纯 JS 无法产出可被对应阅读器打开的文件。

### Q3-c：402 触发时是否有自动降级到纯 JS 的逻辑？

**Fact（关键发现）**：

- `convertWithCloudConvert`（`cloudconvert.ts:364-433`）在遇到 402 时：
  1. 第一拍 `ccRequest` 收到 402 → `markQuotaExhausted()` + 抛 `Error('CloudConvert client error 402: ...')`（L106-109）。
  2. 外层 `convertWithCloudConvert` 捕获后检查 `retryable`（L415-418）：
     - `permanentFailure = /DRM/i.test(msg)` → false（402 不含 DRM）
     - `isTransientImport = err.importTaskFailed` → false（402 发生在 job 创建阶段，还没 import）
     - `isEngineDowngrade = err.convertTaskFailed` → false（同上）
     - → `retryable = false` → **break 出循环** → 直接抛 `CloudConvertJobFailure('CloudConvert job failed after 1 attempt(s) | ...')`。
  3. **无任何 P1 fallback 逻辑**：402 是直接上抛，不走纯 JS 路径。

- 换言之：**P1 的设计是「预先把目标格式映射到纯 JS 分支，让请求根本不到达 CloudConvert」**，而不是「CloudConvert 402 后动态降级」。因此 P1 只对 CONVERSION_MAP 中 tool=js 的格式对生效，对仍走 CC 的格式对（如 azw3/pdf/mobi 输出）无效。

### 证据表（Q3）

| 结论 | 证据等级 | 定位 |
|---|---|---|
| 纯 JS 覆盖 18 对（含 P1 新增 6 对） | Fact | `conversion.ts:998-1064` + `conversion-map.ts:28-61` |
| `epub→azw3` 不在纯 JS 范围 | Fact | 同上（无 `isEpubToAzw3` 分支） |
| `epub→pdf` 不在纯 JS 范围 | Fact | 同上 |
| 402 无动态降级到纯 JS 的逻辑 | Fact | `cloudconvert.ts:106-109` + `L415-419` break |
| P1 是静态分支预分配，非动态兜底 | Fact | `conversion.ts:993-997` 注释 |
| azw3/pdf 无法纯 JS 产出可靠文件 | Assumption（专家判断） | 经验库坑位：verifyConversion 的 azw3/pdf 输出侧只能验容器魔数，验不了"Kindle 能否打开 / PDF 能否渲染" |

---

## Q4 · 影响面实测

### Q4-a：当前还有多少转换对 100% 失败？

实测 `src/lib/conversion-map.ts` 当前 36 对（CONVERSION_MAP 键数，非旧的 31/35）：

**纯 JS / 本地免疫（18 对）**：`mobi→txt`、`azw3→txt`、`mobi→epub`、`azw3→epub`、`docx→txt`、`html→txt`、`txt→epub`、`epub→epub`、`html→epub`、`docx→epub`、`rtf→epub`、`fb2→epub`、`lit→epub`、`epub→txt`、`epub→rtf`、`epub→fb2`、`epub→docx`、`epub→zip`。

**CloudConvert 路径（18 对，402 时 100% 失败）**：

| 转换对 | tool 声明 | 说明 |
|---|---|---|
| `epub→azw3` | calibre | 本案失败 |
| `epub→pdf` | calibre | 本案失败 |
| `epub→mobi` | calibre | CC calibre 引擎支持 |
| `epub→doc` | calibre | CC calibre 引擎支持 |
| `epub→html` | calibre | CC calibre 引擎支持（HTMLZ） |
| `epub→jpg` | calibre+imagemagick | 需 Calibre + ImageMagick，CC 不支持 ImageMagick |
| `epub→png` | calibre+imagemagick | 同上 |
| `azw3→mobi` | calibre | CC calibre 引擎支持 |
| `mobi→azw3` | calibre | CC calibre 引擎支持 |
| `azw3→pdf` | calibre | CC calibre 引擎支持 |
| `mobi→pdf` | calibre | CC calibre 引擎支持 |
| `cbr→pdf` | calibre | CC calibre 引擎支持 |
| `djvu→pdf` | calibre | CC 默认引擎（calibre 读不了，但 CC 默认引擎支持） |
| `lit→mobi` | calibre | CC calibre 引擎支持 |
| `azw→mobi` | calibre | CC calibre 引擎支持 |
| `chm→mobi` | calibre | CC calibre 引擎支持 |
| `doc→epub` | libreoffice+calibre | **Note**: conversion-map 声明 tool=libreoffice+calibre，但 `conversion.ts` 无对应分支 → 落 CloudConvert fallback（LibreOffice 未在 CC 白名单提及，实际走 CC auto 引擎） |
| `pdf→epub` | calibre | 注意：map 声明 calibre，但 `CALIBRE_INPUT_FORMATS` 不含 pdf → 实际走 auto 引擎（上午 pdf→epub 即为 engine=auto） |

**合计 18 对仍依赖 CloudConvert，402 时 100% 失败。**

### Q4-b：CONVERSION_MAP 当前数量

**Fact**：`grep -c '"tool"' src/lib/conversion-map.ts` = **36**（非 31、非 35）。上午报告引用的 35 为 commit 590c704 刚落地时的计数；后续无新增，但上午报告统计时可能未包含某一新增对。本次实测 36 对为准。

### 证据表（Q4）

| 结论 | 证据等级 | 定位 |
|---|---|---|
| 当前 CONVERSION_MAP = 36 对 | Fact | `grep '"tool"' src/lib/conversion-map.ts` = 36 |
| 纯 JS 免疫路径 = 18 对 | Fact | `conversion.ts:958-1064` 分支枚举 |
| CloudConvert 依赖路径 = 18 对 | Fact | 36 - 18 = 18，逐一核对 tool 声明 |
| 18 对 402 时 100% 失败 | Fact（基于 Q3-c 逻辑） | 无动态降级，CC 402 直接上抛 |

---

## Q5 · 系统行为正确性

### Q5-a：quotaExhaustedUntil 短路缓存本次是否按设计工作？

**Fact**：

- TTL = 5min（`cloudconvert.ts:27`）。
- 晚间两告警间隔 19min > TTL，各自冷启动 → 各自 quotaExhaustedUntil=0 → 各自直连 API → 各获一次 402。
- **设计符合预期**：短路由单实例内减少重复轮询浪费；跨实例不共享状态，符合 Serverless 架构。

### Q5-b：告警通道节流规则

**Fact**：

- `alerts.ts:27`：`ALERT_COOLDOWN_MS = 10 * 60 * 1000`（10min）。
- `alerts.ts:146`：签名 = `kind + ':' + error[:80]`。
- 晚间两条：
  - 告警 1：`kind=conversion-error`，error ≈ `'CloudConvert job failed after 1 attempt(s) | engine=calibre: CloudConvert client error 402...'`
  - 告警 2：同上 kind，error ≈ `'CloudConvert job failed after 1 attempt(s) | engine=calibre: CloudConvert client error 402...'`
- **关键**：两条 error message 前 80 字符内是否含 `engine=calibre` 相同？是。但注意两条的 **jobId 不同、source/target 不同**，但 error 字符串本身（截断 80 字符）**均从 "CloudConvert job failed after 1 attempt(s) | engine=calibre: CloudConvert client error 402:" 开始** —— 这部分前 80 字符完全相同。
- 然而告警仍**各发一次**，因为间隔 19min > 10min 冷却窗口，第二次发出时第一次的 lastSentAt 已过期。
- **设计符合预期**：10min 同签名节流防风暴；跨窗口独立发送。

### Q5-c：用户端错误码

**Fact**：

- `error-handler.ts:52`：`'cloudconvert client error 402'` → `'CONVERSION_QUOTA_EXCEEDED'`。
- `error-handler.ts:84`：友好文案 `'This format is temporarily at capacity for today. EPUB to TXT and EPUB to ZIP still work right now — for other formats, please try again later.'` + `retryable=false`。
- `BatchUpload.tsx:401-402`：前端识别 `code === 'CONVERSION_QUOTA_EXCEEDED'` → 设 `quotaExhausted=true` → 本批次后续文件跳过（仅非 LOCAL 转换）。
- **设计符合预期**：用户看到友好提示，批量请求智能跳过，不再白等 270s。

### 证据表（Q5）

| 结论 | 证据等级 | 定位 |
|---|---|---|
| quotaExhausted TTL = 5min | Fact | `cloudconvert.ts:27` |
| 19min > TTL → 两次独立 402 | Fact | 告警时间戳 |
| 告警节流窗口 = 10min | Fact | `alerts.ts:27` |
| 19min > 10min → 两条都发出 | Fact | 节流签名规则 + 时间差 |
| 402 → CONVERSION_QUOTA_EXCEEDED | Fact | `error-handler.ts:52` |
| 前端 quotaExhausted 短路批量 | Fact | `BatchUpload.tsx:401-402` |

---

## Q6 · 修复方案 + ROI 排序

按「成本 / 收益 / 风险 / 是否改码 / 预计时效」五维度排序：

### A. 充值 CloudConvert（P0，立即执行）

| 维度 | 评估 |
|---|---|
| 成本 | Package $18/1000 credits（一次性，不过期）或 Subscription $10/月（月度重置） |
| 收益 | 立即恢复全部 18 对 CloudConvert 路径，无等待 |
| 风险 | Package 额度再次耗尽（低，1000 credits 可支撑数百次转换）；Subscription 月度清零未用部分 |
| 改码 | 否（dashboard 操作） |
| 预计时效 | 充值即时生效，5min 内 quotaExhaustedUntil TTL 过期后自愈 |

**推荐子选项**：
- **A1. Package $18/1000 credits（首选）**：一次性买断，不过期，避免月度清零浪费。BookConv 流量低，1000 credits 足够数月使用。
- **A2. Subscription $10/月**：若预计月转化量接近或超过 1000 次（不太可能），选 subscription 更经济；否则浪费月度未用部分。

### B. 扩展纯 JS 到专有二进制输出（判死，不建议）

| 维度 | 评估 |
|---|---|
| 成本 | 高（azw3 需实现 Kindle KF8 压缩引擎；pdf 需排版引擎） |
| 收益 | 理论上免疫 402 |
| 风险 | **产出不可用**（经验库坑位：verifyConversion 只能验容器魔数，验不了"Kindle 能否打开 / PDF 能否渲染"） |
| 改码 | 是（大规模） |
| 预计时效 | 数周到数月 |

**判定**：❌ 不推荐。纯 JS 合成 azw3/pdf 无法达到商业可用性，不如靠充值。

### C. 预消耗监控 / 提前预警（P2，辅助）

| 维度 | 评估 |
|---|---|
| 成本 | 低（每日 CC API `GET /v2/users/me` 查剩余 credits） |
| 收益 | 低于阈值（如 <20%）发飞书预警，避免"全挂才发现" |
| 风险 | 极低（只读 API，无状态变更） |
| 改码 | 是（新增每日 cron job） |
| 预计时效 | 2 小时内可上线 |

**推荐**：✅ 作为 A 的配套措施长期保留。

### D. 402 时用户体验兜底（提示用户改走可用格式对）（P2，可选）

| 维度 | 评估 |
|---|---|
| 成本 | 低（前端文案层调整） |
| 收益 | 引导用户用纯 JS 可用格式（如 epub→txt）替代 |
| 风险 | 当前 `CONVERSION_QUOTA_EXCEEDED` 已提示「EPUB to TXT and EPUB to ZIP still work」——已部分覆盖 |
| 改码 | 小（前端文案微调） |
| 预计时效 | 半天 |

**判定**：⚠️ 已有基础覆盖，可优化但优先级低于 A/C。

### E. 其他可行项

- **E1. 启用 VPS Calibre 后端**（`CONVERSION_BACKEND_URL` 重新配置）—— 成本中等（VPS 月费 ~$5-10），但可完全摆脱 CC 依赖。**但需重新采购 VPS（现实例已到期）**，投入较大，建议与 A 并行评估。
- **E2. 切换 CloudConvert 供应商**（如 ConvertAPI、Zamzar）—— 成本高（迁移测试），收益不确定（同样有额度限制），当前流量级别不值得。**不推荐**。

### 排序总结

| 排序 | 方案 | 理由 |
|---|---|---|
| 1 | A（充值） | 零改码，即时生效，成本可控 |
| 2 | C（预消耗监控） | 低成本配套，防复发 |
| 3 | E1（重购 VPS） | 中长期彻底解耦 CC，投入适中 |
| 4 | D（体验兜底优化） | 锦上添花，已有基础覆盖 |
| 5 | B（纯 JS 扩二进制） | 判死，不推荐 |
| 6 | E2（换供应商） | 不推荐，投入产出不成比例 |

---

## Q7 · 验收判据

### 充值后即时验收（A 落地后）

- [ ] `curl -X POST https://api.cloudconvert.com/v2/users/me -H "Authorization: Bearer $CLOUD_CONVERT_API_KEY"` 返回 `credits > 0`。
- [ ] 手动触发 `epub→azw3` 转换（<1MB 样本）→ 期望 HTTP 200 + AZW3 魔数（`BOOK` 或 `TPZ3` 在偏移 60）。
- [ ] 手动触发 `epub→pdf` 转换 → 期望 HTTP 200 + PDF 魔数 `%PDF`。
- [ ] 飞书 24h 内不再收到 402 告警。
- [ ] GA4 `conversion_failed` 事件 `error_code` 字段不再出现 `CONVERSION_QUOTA_EXCEEDED`。

### 代码层验证（C/D 落地后）

- [ ] 模拟 CC 402（mock `ccRequest` 返回 402）→ 短路缓存 5min 内同实例快速失败，不创建 job。
- [ ] Cold start 后 `quotaExhaustedUntil=0`，新实例正常发 API。
- [ ] 告警节流 10min 同签名窗口内只发一次。
- [ ] 前端 `BatchUpload.tsx:401-402` 识别 `CONVERSION_QUOTA_EXCEEDED` 后正确设 `quotaExhausted=true`，本批次剩余文件跳过。

### 长期

- [ ] 预消耗监控 cron job 每日 07:00 查 CC 余额，<20% 发飞书预警（C 方案）。
- [ ] 连续 7 天无 402 告警（A 方案充值后）。
- [ ] 若启用 VPS（E1），`CONVERSION_BACKEND_URL` 配置后，epub→azw3/epub→pdf 转走 VPS 本地 Calibre，不再经过 CC。

---

## 残留风险表

| 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|
| 充值后本月末再次耗尽（Subscription 月度清零） | 中（取决于用量） | 转换失败 | 选 Package（A1）而非 Subscription（A2）；叠加 C 预消耗监控 |
| 免费档「每日 10」在 UTC midnight 重置后仍未恢复（账户实际是 Subscription 月度耗尽） | 未知（需 dashboard 确认） | 跨日后仍 402 | 人工登录 dashboard 确认 plan 类型（Q1-d 关键） |
| 纯 JS 扩展边界外的格式对（18 对）持续 402 依赖 CC | 已知 | 功能缺口 | E1（VPS 重购）中长期解决 |
| CC API 变更（402 语义变化 / 额度计算方式变化） | 低 | 诊断失效 | 监控告警文案变化，适配 `error-handler.ts` 正则 |
| 前端 quotaExhausted 短路仅适用于 BatchUpload，单文件路径无短路 | 中 | 单文件用户仍需等待 270s 轮询后 402 | 短期可接受（单文件用户少）；中期可加前端轮询超时优化 |

---

## 参考文件清单

| 文件 | 用途 |
|---|---|
| `src/lib/cloudconvert.ts` | CC 客户端，402 短路分支（L106-109）、quotaExhaustedUntil（L26-33）、CALIBRE_INPUT_FORMATS（L44-64） |
| `src/lib/conversion.ts` | 执行层，纯 JS 分支（L958-1064）、Calibre fallback（L1065-1116） |
| `src/lib/conversion-map.ts` | 36 对转换对声明（tool 字段决定走 JS/CC/Calibre） |
| `src/lib/alerts.ts` | 飞书告警，10min 节流（L27）、签名规则（L146） |
| `src/lib/error-handler.ts` | 错误码映射，402 → CONVERSION_QUOTA_EXCEEDED（L52） |
| `src/components/tools/BatchUpload.tsx` | 前端批量转换，quotaExhausted 短路（L401-402）、LOCAL_CONVERSIONS 白名单（L49） |
| `src/app/api/convert/route.ts` | 入口路由，CONVERSION_BACKEND_URL 转发逻辑（L45-79） |
| `src/app/api/convert-internal/route.ts` | VPS 后端内部端点（当前未启用） |
| `.env.example:54-59` | CloudConvert 配置项声明（**注意：文档注释「Free tier: 25 conversions/month」已过时，应为 10/day**） |
| `DEPLOYMENT.md:338` | 已知限制表格（**$17 定价已过时，应为 $18**） |
| `hermes-context/incident-2026-10-20-cloudconvert-402-credits.md` | 上午同类事故报告（本报告的基线参考） |
| `HERMES.md §「2026-10-20 · CloudConvert 402（积分耗尽）故障 + P1 纯 JS 兜底扩展」` | 经验库 P1 落地记录 |

---

## 附：对上午报告的具体更正（汇总）

1. **§1.3「置信度：高」** 仍成立，但论据需补充「跨日未恢复」这一新事实，指向「账户可能已非纯免费档」或「重置时间点非 UTC midnight」。
2. **§2.1 受影响转换对表格** 漏列 `epub→mobi/doc/html/jpg/png` 等其余 CC 路径格式；本次 Q4 补全为 18 对。
3. **§4 修复方案** 未涵盖「P1 扩展边界已明确（target=epub 文本派生），azw3/pdf 不在范围内」这一事实；本次 Q3 显式说明。
4. **定价数字 $17 → $18**（DEPLOYMENT.md:338 + 上午报告 §4-A 均需更正）。
5. **.env.example:58 免费档描述「25 conversions/month」已过时**（应为 10/day），建议顺带修正。

---

*报告生成：2026-10-20 晚间独立诊断会话（只诊断，不修码）*
*输出路径：`ebook-converter/hermes-context/incident-2026-10-20-cloudconvert-402-recurrence-evening.md`*
