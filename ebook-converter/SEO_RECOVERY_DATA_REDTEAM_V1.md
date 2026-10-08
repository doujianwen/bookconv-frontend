# 数据采集红队审计（SEO_RECOVERY_DATA_REDTEAM_V1）

> 阶段：**RED TEAM** · 对本轮 4 个数据采集任务做反向检查
> 纪律：即使数据已拿到，**本轮仍不修改任何生产页面**

## 错误 1：把 0 impressions 当成 not indexed

### FACT

| # | 事实 | 数据 |
|---|---|
| 1 | 18 个零曝光页中 **3 页是 `Submitted and indexed`（已收录）** | GSC URL Inspection API 实测 |
| 2 | **14 页是 `Discovered - currently not indexed`（已发现未抓取）** | 同上 |
| 3 | 收录率 | **16.7%** | 3/18 |

### ASSUMPTION

- 「0 impressions = 未收录」是此前多份报告的隐含假设，**本轮被实测推翻**。

### UNKNOWN

- 为何 3 个已收录页零展示（需 U3 搜索量判断是否真无需求）|

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🔴 若沿用旧假设，会把资源投向「提升内容质量以求收录」| 高 | 14/18 的页根本没被抓取，改内容无济于事 |
| 🟡 会误判站点收录健康度 | 中 | 实际收录率 16.7%，不是 0% |

### VALIDATION

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | ✅ **已完成** | GSC URL Inspection API 返回真实 coverageState |
| 2 | 复查 | 每份报告的"零曝光"表述后是否附 coverageState |
| 3 | 后续 | 描述页问题时必须区分「已收录未展示」与「未抓取」 |

---


## 错误 2：把旧 search volume 当成真实 search volume

### FACT

| # | 事实 | 数据 |
|---|---|---|
| 1 | constants.ts KEYWORDS 条目 | 50（live 29 / planned 21）|
| 2 | 采集时间戳字段 | 🔴 **ABSENT** |
| 3 | 源码注释声明的采集源 | Ahrefs Free KD Checker（2026-07-09）|
| 4 | 注释自述精度问题 | 「prior values were inflated **30-70 pts**」|
| 5 | 距今 | 90 天 |
| 6 | 已发生的证伪 | `epub-to-zip` 据此判「伪需求」→ 实测 45 曝光 / pos 14.8 全站最佳 |
| 7 | 达到 VERIFIED 的条数 | **0 / 29** |

### ASSUMPTION

- 常量表中的 `searchVolume` 是真实月搜索量 —— **本轮不采信**。

### UNKNOWN

- 每个词的真实搜索量（全部 UNKNOWN）|
- 该表是否曾经准确过（注释暗示曾虚高 30–70 点，但无法确定当前值）|

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🔴 依据它 REMOVE 页面 | 高 | 已有证伪先例 |
| 🔴 依据它排优先级 | 高 | KD 同源，同样不可信 |
| 🟡 依据它扩页 | 中 | planned 词全部 UNKNOWN |

### VALIDATION

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | ✅ **已完成** | 全部 29 条标记为 HISTORICAL，无 VERIFIED |
| 2 | 待办 | 用 Google Keyword Planner 重新采集 |
| 3 | 门禁 | 任何引用该表的决策须附「HISTORICAL」标记 |

---


## 错误 3：把 UNKNOWN 写成 0

### FACT

| 项 | 正确值 | 错误写法（禁止）|
|---|---|
| U5 referring domains | **UNKNOWN** | ❌「0 个 referring domain」|
| U5 backlinks 总数 | **UNKNOWN** | ❌「0 backlinks」|
| U5 anchor text | **UNKNOWN** | ❌「无锚文本」|
| Manual Action | **UNKNOWN** | ❌「无人工处置」|
| U3 真实搜索量 | **UNKNOWN** | ❌「该词无搜索量」|

### ASSUMPTION

- 「接口没返回」≠「值为 0」。GSC `referringUrls` 返回的是计数；Manual Actions 无接口；搜索量无采集。三者都是「未取得」，不是「取得 0」。

### UNKNOWN

- 上述 5 项的真实值 |

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🔴 把 UNKNOWN 写成 0 会让门禁产生假通过 | 高 | 「0 backlinks」会被读作「已验证无外链」|
| 🟡 影响优先级判断 | 中 | 「无权重」与「权重未知」应对策略完全不同 |

### VALIDATION

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | ✅ **已完成** | `EXTERNAL_LINK_BASELINE_V1.md` 中 Referring Domains 列全部 UNKNOWN |
| 2 | ✅ **已完成** | Manual Actions 写 UNKNOWN 而非「无」|
| 3 | 门禁 G-D2 | UNKNOWN 不得被转换成 0 |

---


## 错误 4：把没有 Manual Action 证据写成「没有 penalty」

### FACT

| # | 事实 |
|---|---|
| 1 | GSC **无公开 API 端点**可查 manual actions |
| 2 | 项目内无相关脚本（已 grep `scripts/*.mjs`）|
| 3 | URL Inspection 响应体**不含** manual action 字段 |
| 4 | 现有 API 结果中无任何处置信息 |

### ASSUMPTION

- 「接口不返回」**不能**推出「无处置」。返回空是接口设计如此。

### UNKNOWN

- `U_MANUAL_ACTION = RESOLVED（无处置）` ✅（2026-10-07 人工截图确认）

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🔴 若真有处置而按「无处置」操作外链，会加重问题 | 高 | Google 可能判为「以链接规避处罚」|
| 🔴 写出 `Google penalized` 无证据支持 | 高 | 属编造事实 |

### VALIDATION

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | ✅ **已完成** | 明确写 UNKNOWN，未写「无 penalty」|
| 2 | ✅ **已完成** | 禁止写 `No official evidence of manual action`（未看过后台）|
| 3 | 待办 | 人工登录 GSC → 安全性与人工处置措施 |
| 4 | 门禁 G-D2/G-D3 | UNKNOWN 保留；不得出现确定性处罚表述 |

---


## 错误 5：把 301/404/tag 放入 backlink seed

### FACT

| # | 事实 | 数据 |
|---|---|---|
| 1 | 301 页面数 | **3** |
| 2 | 404 页面数 | **1** |
| 3 | tag 页面数 | **1** |
| 4 | valid seed pool | **27**（仅 asset + asset_es）|
| 5 | 门禁校验 | `seedList.every(u => !EXCLUDED.includes(urlClass[u]))` |

### ASSUMPTION

- seed pool 由 `urlClass ∈ {asset, asset_es}` 且 `imp > 0` 决定，与旧版一致。

### UNKNOWN

- 无（本项可完全验证）|

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🔴 外链投 301 页会浪费权重在跳转链路 | 高 | — |
| 🔴 外链投 404 页完全无效 | 高 | 如 `/convert/epub-to-lrf` pos 15.0 但页面不存在 |
| 🟡 外链投 tag 页权重不传递到具体页 | 中 | — |

### VALIDATION

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | ✅ **已完成** | seed pool = 27，已剔除 5 类无效 URL |
| 2 | 门禁 G-D5 | 逐行校验 seed pool |
| 3 | 人工复核 | 实际投放前再核一次目标 URL |

---


## 错误 6：把 guide 的 3 个曝光样本扩大成「guide 已验证有效」

### FACT

| Guide | 曝光 | Pos | 全站排名 |
|---|---|---|
| `/guide/calibre-vs-online-converter` | 43 | 48.7 | 第 16 / 37 |
| `/guide/epub-to-txt-extract` | 1 | 71 | 第 30 / 37 |
| `/guide/mobi-to-epub-keep-formatting` | 93 | 81.2 | 第 35 / 37 |
| 零曝光 guide | 21 个 | — | — |

### ASSUMPTION

- 「guide 类型能被 Google 认可」由 3 个样本支持，其中 1 个仅 **1 次曝光**。

### UNKNOWN

- guide 类型的整体有效性（21 个零曝光，样本严重不均衡）|
- guide 权重是否传递到 convert 页 |

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🟡 以 3 个样本推广到 24 个 | 中 | 其中 1 个样本量 = 1，不具统计意义 |
| 🟡 假设 guide 外链能带动 convert | 中 | 权重传递机制完全未验证 |

### VALIDATION

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | ✅ **已完成** | 3 个样本逐一列出，含曝光量与排名 |
| 2 | 观察 | 投放后测 guide 与 convert 的 position 联动 |
| 3 | 判据 | 联动出现才支持假设，否则证伪 |

---


## 错误 7：把 27 个 seed asset 自动等同于「应该投外链」

### FACT

| # | 事实 |
|---|---|
| 1 | seed pool 定义 | GSC 有曝光 且属有效资产 |
| 2 | 🔴 **该定义不含「值得投外链」判断** |
| 3 | U5 外链基线 | **UNKNOWN** ⇒ 无法判断外链边际收益 |
| 4 | Manual Action | **UNKNOWN** ⇒ 若有处置，外链会加重问题 |

### ASSUMPTION

- 「有曝光」⇒「适合投外链」—— **本轮不采信**。前者是观察结果，后者是策略判断。

### UNKNOWN

- 外链投放的边际收益（需 U5）|
- 是否存在人工处置（需 Manual Action）|

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🔴 两个前置 UNKNOWN 未解就投放 | 高 | 可能无效，且可能加重处罚 |
| 🟡 投给已收录但无展示的页 | 中 | 3 个已收录零曝光页是否适合投外链，需先解 U3 |

### VALIDATION

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | 准备 | seed pool 可作为**候选清单**（已备）|
| 2 | 🔴 **不可执行** | 前置：Manual Action + U5 均 UNKNOWN |
| 3 | 解锁 | 先解 U5 与 Manual Action |

---


## 错误 8：把 backlink 数量自动等同于 SEO authority

### FACT

| # | 事实 | 数据 |
|---|---|---|
| 1 | GSC `referringUrls` 计数合计（27 个 seed）| **33** |
| 2 | 计数取值分布 | 仅 0 / 1 / 2 三种 |
| 3 | referring domain 列表 | **UNKNOWN**（接口不返回）|
| 4 | 域权威度 | **UNKNOWN**（无 Ahrefs/Semrush）|
| 5 | 🔴 **反例** | `/convert/epub-to-zip` 无 guide 内链却 pos 14.8 全站最佳 |

### ASSUMPTION

- 「外链多 ⇒ 权重高」——本轮**无任何数据可验证**。

### UNKNOWN

- 33（计数合计）不等于外链总数，也不是 referring domain 数 |
- 外链质量（是否 spam 站、是否被 nofollow）完全未知 |

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🔴 把 GSC 计数当外链数 | 高 | 口径不同：GSC 是「有多少页面链到该 URL」的估算 |
| 🔴 把数量当质量 | 高 | 1 个 spam 站外链 ≠ 10 个高质量外链 |
| 🟡 第 5 条反例削弱「外链→排名」假设 | 中 | 零内链页拿到最佳 position |

### VALIDATION

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | ✅ **已完成** | 文档明确标注「计数不是外链总数」|
| 2 | 待办 | 接入 Ahrefs/Semrush 取真实 RD 与 DA |
| 3 | 判据 | 至少 3 个渠道数据一致才算 VERIFIED |

---


## 错误 9：把 search volume 自动等同于 traffic opportunity

### FACT

| # | 事实 | 数据 |
|---|---|---|
| 1 | constants.ts 声明 `epub to pdf converter` vol=18,100 | 声明值 |
| 2 | 该页实测曝光 | **0**（Tier D）|
| 3 | 该页 coverageState | Discovered - currently not indexed |
| 4 | 全站点击（91 天）| **0** |

### ASSUMPTION

- 「搜索量大 ⇒ 有流量机会」—— 需同时满足「收录 + 有展示 + 有点击」，三者当前都不成立。

### UNKNOWN

- 该词真实搜索量（数据 HISTORICAL，非 VERIFIED）|
- 即便搜索量真实，18,100 的量级在 KD 38 下的可获得份额未知 |

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🔴 按声明量级排优先级，投入产出可能为零 | 高 | 高搜索量 + 零曝光 = 拿不到 |
| 🟡 忽视「收录/抓取」这一前置条件 | 中 | 搜索量再大，未抓取则无展示 |

### VALIDATION

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | ✅ **已完成** | 明确区分「搜索量」与「已获得的曝光」|
| 2 | 顺序 | 先解决抓取（14 页未抓取），再谈搜索量 |
| 3 | 判据 | 优先级 = 搜索量 × 已收录 × 已展示，三者缺一不可 |

---


## 错误 10：把 Spam Update 后的表现变化自动解释为 penalty

### FACT

| # | 事实 | 数据 |
|---|---|---|
| 1 | Manual Action 数据 | **未取得**（无 API 端点）|
| 2 | Security Issues | **未取得** |
| 3 | Google 近 7 天曝光趋势（2026-10-05 日报）| 37 vs prev7 51，**-27.5%** |
| 4 | Bing Web 同期 | 614 曝光 / 22 点击，**+26.1%** |
| 5 | 样本量 | recent7 仅 37 次曝光，**统计意义有限** |

### ASSUMPTION

- 「当前 Google 表现与 2026-08 Spam Update 有关」—— ⚠️ **这是一个未验证的假设**。

### UNKNOWN

- 🔴 ~~`U_MANUAL_ACTION = UNKNOWN`~~ → **已排除**（2026-10-07 人工截图确认「未检测到任何问题」，U_MANUAL_ACTION = RESOLVED 无处置）
| 是否存在人工处置 |
| 2026-08 前后是否有可测排名断崖 |
| Google 单渠道下滑是否与 Bing 反向有因果关系 |

### RISK

| 风险 | 等级 | 说明 |
|---|---|---|
| 🔴 若真有处罚而大量投外链 | 高 | 可能被判为规避处罚 |
| 🔴 写 `Google penalized` 无证据 | 高 | 属编造事实 |
| 🟡 37 次曝光样本推趋势 | 中 | 窗口平移 1 天即可翻转符号（项目历史已实测）|

### VALIDATION

| 步骤 | 动作 | 判据 |
|---|---|---|
| 1 | ✅ **已完成** | 措辞改为「Spam Update 后的表现变化 / Recovery hypothesis」|
| 2 | ✅ **已完成** | 未写 `Google penalized` |
| 3 | 待办 | 人工查 GSC 安全性与人工处置措施 |
| 4 | 门禁 G-D2/G-D3 | UNKNOWN 保留 + 处罚措辞禁止 |

## 汇总

| # | 错误模式 | 本轮是否犯过 | 状态 |
|---|---|---|
| 1 | 0 imp = not indexed | ⚠️ **此前报告犯过** | ✅ 本轮已用真实数据推翻 |
| 2 | 旧 search volume 当真实 | ⚠️ 旧清单犯过（epub-to-zip）| ✅ 本轮全部标 HISTORICAL |
| 3 | UNKNOWN 写成 0 | ❌ 未犯 | ✅ 已守 |
| 4 | 无证据写成无 penalty | ❌ 未犯 | ✅ 已守 |
| 5 | 301/404/tag 进 seed | ❌ 未犯 | ✅ 已守 |
| 6 | 3 样本扩大成结论 | ⚠️ **有风险** | 🟡 已标注样本不均衡 |
| 7 | seed = 该投外链 | ❌ 未犯 | ✅ 标为「候选清单，不可执行」|
| 8 | backlink 数 = authority | ❌ 未犯 | ✅ 已标口径差异 |
| 9 | search volume = traffic | ⚠️ **有风险** | 🟡 已标前置条件 |
| 10 | Spam Update = penalty | ❌ 未犯 | ✅ 措辞已改写 |

### 仍有风险的 3 项

| # | 风险 | 为什么 | 如何避免 |
|---|---|---|
| 6 | 3 个 guide 样本外推 | 样本量 1–93 极不均衡 | 引用时必须同时给出曝光量 |
| 9 | 搜索量 = 机会 | 前置条件（收录/展示）未满足 | 优先级公式必须含三因子 |
| 1 | 旧报告的收录结论仍在流传 | 已推翻但旧文档未改 | 本轮文档已给出正确表述 |
