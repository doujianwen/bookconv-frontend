# GA4 进阶分析维度手册（BookConv 实战版 · v2 红队审计修订版）

> 适用场景：常规「流量来源 / PV / 跳出率 / 会话时长」已不能满足增长诊断时，本手册提供进阶维度，按「为什么分析 → 核心指标 → 怎么读数 → 行动建议」四段式展开，可直接套用到 bookconv.com 的 GA4 属性。
>
> **v2 修订说明**：v1 经红队审计发现 9 项问题（含 1 项致命的数据质量盲区），本版已全数闭环——新增「模块 0 数据质量与治理」、GEO 黑暗流量诚实边界、埋点待办清单、与既有管线集成说明，并修正 CWV/归因门槛的失准表述。

---

## 与既有管线集成（前置，避免各算各的）

本手册不是孤立文档，应复用你已有的基建，避免重复造轮子：

- **异常监测（模块 7）** → 复用 `bookconv-daily-analysis` 技能与周一 07:30 双渠道（Bing/Google）分析自动化，把 GA4 异常告警并入既有飞书 Webhook 通道。
- **GEO 桥接（模块 8）** → 数据须与 **VI v1.0 可见性指数**、**Kelriva R_pre/R_post** 报告对齐；GEO 渠道增量用 GA4 衡量、AI 可见性用 Kelriva 衡量，二者三角印证，不互相替代。
- **事件纪律** → 所有新增/既有事件遵循你「先验证后记录」纪律（见模块 0 核查清单），杜绝「以为有数据其实没」的假成功（10-01 故障 T+1 才发现即前车之鉴）。

---

## 模块 0：数据质量与治理（地基，所有分析的前提）

> 🔴 **红队 R1 修正**：v1 完全缺失此维度。脏数据上做任何分析都是错的。本模块必须在一切之前。

**① 为什么分析**
高级分析的前提是「数据可信」。内部员工访问、bot、referral spam、采样、未授权地区的隐私丢弃，都会系统性扭曲每一后续模块的结论。

**② 核心指标 / 核查项**
- 内部流量占比（Internal Traffic）：你与团队的访问是否被排除
- 已知/未知 bot 流量
- 采样率（Sampling）：报告/探索是否被采样
- Consent Mode 覆盖：EU/US 拒 cookie 用户的数据缺失率
- 跨域会话断裂：converter 若在子域/独立域，会话是否统一
- 事件触发真实率：`file_upload` / `conversion_complete` / `conversion_failed` 是否真在发

**③ 怎么读数 / 操作**
- **内部流量**：Admin → Data Streams → Configure Tag Settings → Define internal traffic（按 IP）；再 Data Settings → Data Filters 设为 Active。否则你的访问污染数据。
- **Bot**：GA4 默认开「Exclude known bots and spiders」，但未知爬虫不过滤；异常高 PV 低互动的来源用 Data Filters → Traffic from specific sources 处理。
- **采样**：标准报表通常不采样；**Explorations 在卡片数据超约 1000 万事件时会采样**，看报告右上角是否有采样提示，大数据量分析改用 BigQuery 导出（GA4 ↔ BigQuery 链路）。
- **Consent Mode**：未正确实现时，EU/加州用户拒分析 cookie 后数据缺失 → 归因与留存被低估。须实现 Consent Mode v2 + 服务端建模兜底。
- **跨域**：若 convert 在子域或独立 converter 域，配置跨域追踪（linker），否则会话断裂、归因失真；BookConv 若全同域则无需，但需确认。
- **事件验证（先验证后记录）三道核查**：① DebugView 实时看事件触发；② Realtime 报表抽查；③ GA4 Data API 拉取计数比对。三者一致才算「事件真在跑」。

**④ 行动建议**
- 上线任何新事件前，先过上述三道核查再写进看板。
- 每周用 Data Filters 复核一次异常来源，保持数据干净。
- 若 Consent Mode 未实现，模块 1/3/6 的 EU 数据结论须标注「可能低估」。

---

## 模块 1：用户细分与分群（User Segmentation & Cohorting）

**① 为什么分析**
流量「总量」会掩盖结构性变化。同样 1 万 UV，可能来自 1 万次低质直接访问，也可能是 5 千高参与度老客的回归。细分才能定位「谁在真正驱动增长」。

**② 核心指标**
- 新访客 vs 回访者：参与度对比（engagement rate、events per session、平均互动时长）
- 受众特征：地域（国家/城市）、语言（默认 locale）、设备类别、兴趣亲和（Affinity）/ 购买意向（In-Market）受众
- 高参与度簇：按 engagement rate / events per session 分位（Top 10% / 20%）
- 参与度分群（RFM 思想迁移）：近因（最近访问）、频次（回访次数）、力度（engagement / 转化）

**③ 怎么读数**
- **Free Form Exploration**：行 = 受众维度（如「国家」），列 = 指标（engagement rate、conversions）；叠加「用户类型 = 新/回访」作为次级维度。
- **Segment Overlap**：对比「高参与度用户」「转化用户」「回访者」三集合重叠，找高价值交集。
- **User Explorer**：抽样高价值用户，回看其真实事件流（验证行为假设，而非凭印象）。

**④ 行动建议（BookConv）**
- 若 `es` 语言用户 engagement 显著低于 `en`，优先排查伪翻译 / es 页质量（你已知的 Spam Update 命中面）。
- 若某地域（如日本，对应你评估过的 Calibre VPS 市场）转化高但流量低，加大该区域 GEO 内容投放。
- 把「高参与度未转化」簇单独建受众，做再营销或产品引导优化。

---

## 模块 2：转化漏斗与用户路径（Funnels & Paths）

**① 为什么分析**
PV / 跳出率只描述单页，不描述「用户有没有走完你想让他走的路」。漏斗与路径揭示断点——增长卡在哪一步。

**② 核心指标**
- 关键事件漏斗：`file_upload → conversion_complete`（核心）；`conversion_failed` 作为负向分流
- 漏斗各步转化率与流失率（drop-off %）
- 路径探索：实际步骤序列 vs 预期路径
- 微转化 vs 宏转化（`file_upload` 是微，`conversion_complete` 是宏）
- 页面/事件级退出率

**③ 怎么读数**
- **Funnel Exploration**：开放漏斗（允许跳步）vs 封闭漏斗（必须顺序），设步骤 = `[file_upload, conversion_complete]`，观察第 1→2 步流失。
- 叠加 `conversion_failed` 维度：区分「上传但未完成」中「主动失败」占比，定位是文件问题还是引擎超时（你 10-01 的 8 用户故障场景）。
- **Path Exploration**：起点 = landing page，看用户真实流向（是否绕过你的 convert 页直接离开）。

**④ 行动建议**
- 若 `file_upload → conversion_complete` 流失集中在某些格式对（如 mobi→pdf 大文件），对应你已知的 Vercel 60s 硬上限，优先做 MAX_FILE_SIZE 止损。
- 把 `conversion_failed` 高发的格式对单独拉漏斗，做根因分流（额度 402 vs 超时）。
- 路径若显示用户大量从 /convert 跳到首页再离开，强化首屏 CTA 与格式选择引导。

**⚠️ 埋点待办清单（红队 R3 修正）**
当前漏斗 `[file_upload → conversion_complete]` **过粗**，漏了已知大流失微步骤。建议补以下事件以细化漏斗：
- `format_selected`：用户选定目标格式（已知选错格式对是 `conversion_failed` 主因之一）
- `convert_started`：转换任务真正发起（区分「上传了但没点转换」）
- `download_complete`：结果文件下载完成（宏转化闭环最后一环）
- `error_detail`（带参数 category）：失败类别（配额/超时/格式不支持），支撑根因分流
补完后漏斗可细化为：`format_selected → file_upload → convert_started → conversion_complete (+ download_complete)`，断点定位精度大幅提升。

---

## 模块 3：留存与忠诚（Retention & Loyalty）

**① 为什么分析**
只看新客获客成本会误判。留存好的站点，增长靠复利；留存差，流量越多亏越多。留存是「产品是否真有用」的最硬证据。

**② 核心指标**
- 按获客日期 cohort 的留存率（第 1 / 7 / 30 日回访）
- 回访频率 / 回访间隔（days between sessions）
- N 次回访用户占比（如 ≥3 次访问用户比例）
- 参与度生命周期曲线（engagement 随回访次数变化）
- 新 vs 老客贡献的转化占比
- ⚠️ Cohort 分析注意日期基准：GA4 cohort 用「获客日」而非「末次访问日」；对比不同周 cohort 时固定相同观察窗口（如都看获客后 30 天），避免窗口不一致导致的伪结论。

**③ 怎么读数**
- **Cohort Exploration**：行 = 获客周，列 = 第 N 日留存；重点看 7 日 / 30 日留存是否随渠道恶化。
- **User Lifetime** 技术：看回访用户的累计事件 / 转化。
- 区分「工具属性低回访」与「体验差低回访」：BookConv 本质是工具站，天然回访低；看 `conversion_complete` 是否达成——达成了就是成功使用，不算流失。

**④ 行动建议**
- 若 GEO 渠道来的用户 7 日留存显著高于直接流量，证明 GEO 内容带来的是「有需求的人」，应加码。
- 对达成过 `conversion_complete` 的用户，用「批量转换 / 历史记录」等功能提升回访钩子。
- cohort 留存骤降的周，回溯是否对应某次部署 / 算法更新（衔接模块 7）。

---

## 模块 4：内容互动深度（Content Engagement）

**① 为什么分析**
跳出率是个粗糙代理。真正的问题：用户读了吗？滚到哪？搜了什么没找到？内容互动深度揭示需求与缺口。

**② 核心指标**
- 参与度指标：engaged sessions、engagement rate、平均互动时长（per session / per active user）
- 滚动深度（需自定义 `scroll_depth` 事件，如 25/50/75/100%）
- 站内搜索：search terms、no-result searches（零结果搜索）、搜索后转化
- 资源 / CTA 交互：下载、复制、CTA 点击（自定义事件）
- 内容衰减曲线：发布后 N 天流量 / 转化衰减（你 GEO 博客适用）

**③ 怎么读数**
- **Free Form**：维度 = 页面标题 / URL，指标 = engagement rate + 平均互动时长 + 滚动深度，排序找「高跳出但高时长」页（可能是长文被读完但 GA 判定非互动）。
- 站内搜索报告（Reports → Engagement → 站内搜索）：零结果搜索词 = 内容缺口清单。
- 内容衰减：导出某批 GEO 文章发布后每日 PV，画衰减曲线，定「复盘窗口」（你已有 D7 复盘机制，可对齐）。

**④ 行动建议**
- 零结果搜索词直接变成新 guide / blog 选题（如用户搜「epub to kfx」但无内容 → 补 azw3/kfx 指南，呼应你 D3 扩 guide 工作）。
- 滚动深度低的 convert 页，强化首屏价值主张。
- GEO 文章发布后 7 日复盘，对衰减快的选题调整内链 / 标题（你 Phase 2 Title-First 策略）。

---

## 模块 5：技术与设备体验（Tech & Device Experience）

**① 为什么分析**
技术体验是转化的隐形税。同样的内容，INP 慢 200ms 可能直接掉几个点的转化。必须量化「体验 → 业务」的因果。

**② 核心指标**
- Core Web Vitals：LCP、INP、CLS
- 设备 / 浏览器 / OS 维度的转化差异（mobile vs desktop 的 `conversion_complete` 率）
- 页面加载性能 vs 跳出率 / 转化（自定义 timing 事件）
- 异常事件：JS 错误（自定义 `js_error` 事件）、API 超时

**③ 怎么读数**
- ⚠️ **CWV 数据来源修正（红队 R6）**：GA4 **不原生采集** CWV 字段数据。GA4 的「Core Web Vitals」报表（若 Engagement 下存在）实质是拉取已关联的 Search Console 的 **CrUX** 数据，且要求站点已在 Search Console 验证并关联。因此推荐：用 **web-vitals JS 库**在端上采集 LCP/INP/CLS，作为自定义事件（如 `web_vitals`）发到 GA4，才能与 `conversion_complete` 做逐页关联。
- **Free Form**：维度 = 设备类别 / 浏览器，指标 = conversions / engagement rate，找「流量大但转化差」的设备段。
- 把 `web_vitals` 自定义事件（LCP/INP 分桶）与 `conversion_complete` 做关联：高 INP 桶的转化是否显著低。
- 结合你 Vercel 部署：冷启 60–90s 期间若有 `conversion_failed` 尖峰，对应体验劣化窗口。

**④ 行动建议**
- 若 mobile 转化远低于 desktop，优先查移动端 CTA / 表单 / 文件上传交互（iOS Safari 文件选择等已知坑）。
- `web_vitals` 差且转化差的页面，列入性能优化 backlog（衔接你 Next.js 构建优化）。
- 把 `js_error` 接入与 `conversion_failed` 同级的实时告警。

---

## 模块 6：归因与渠道价值（Attribution & Channel Value）

**① 为什么分析**
「最后点击」会系统性高估直接 / 品牌搜索、低估 GEO / 内容 / 社媒的播种价值。进阶归因让预算 / 精力分配不靠感觉。

**② 核心指标**
- 归因模型对比：data-driven（默认）vs last-click vs first-click vs position-based
- 辅助转化（assisted conversions）：某渠道在路径中多次出现但非末触
- 各渠道转化贡献与「参与转化」贡献差值
- 渠道分组（Channel Group）与 UTM 规范

**③ 怎么读数**
- Reports → Advertising → 归因报告：切换模型，看哪些渠道在 data-driven 下贡献上升（通常是 GEO / 内容）。
- **Free Form / 路径**：维度 = session source / medium，指标 = conversions + 辅助转化，排序找「高辅助低末触」渠道（播种型，应加投）。
- 校验 UTM：你发布的 GEO 内容若未带 `utm_source`，会被归到 direct，低估 GEO 真实贡献。

**④ 行动建议**
- 明确把 GEO / AI 引用渠道从 direct 中剥离（见模块 8），用归因证明 GEO 的播种价值，支撑你持续投入。
- 对「高辅助转化」渠道（如 Bing Webmaster 带来的验证引用）增加内容供给。
- 建立 UTM 规范文档，所有外发 GEO 链接强制带 `utm_source` / `utm_medium` / `utm_campaign`。

> ⚠️ **归因门槛修正（红队 R5）**：data-driven 归因需要足够转化数据，但 Google **不以固定数字公布阈值**，GA4 会在数据不足时自动回退到 last-click 并给出提示。实操中单渠道 7 天内数百次转化是常见最低经验值，但**请以 GA4 实际是否提供 data-driven 模型选项为准**——若无该选项即数据不足，此时对比结论不可信。

---

## 模块 7：异常与趋势监测（Anomaly & Trend Monitoring）

**① 为什么分析**
增长背后的风险往往藏在「某天突然掉了 30%」里。被动月报发现太晚（你 10-01 故障 T+1 才发现就是教训）。需要异常主动预警。

**② 核心指标**
- 同环比异常（日 / 周维度 sudden drop / spike）
- 关键事件异常：`conversion_complete` 骤降、`conversion_failed` 骤升
- 算法 / 更新影响窗口（如 Google Spam Update 命中你的 en 核心页 / es 伪翻译页）
- 流量结构突变（某渠道占比剧烈变化）
- ⚠️ 异常告警须区分「真异常」与「数据质量假异常」（模块 0）：先排除内部流量未过滤、埋点失效、采样导致的伪波动，再定性为业务异常。

**③ 怎么读数**
- GA4 智能预警（Annotations + 异常检测）设阈值；更稳的是你已落地的 **飞书 Webhook**：`conversion_failed` 实时告警（T+0）。
- **Free Form** 按日拉 `conversion_complete` / `conversion_failed` 时序，叠加部署日期标注（Annotations）。
- 流量突变周，用模块 1 / 6 反查渠道与 cohort 变化定位原因。

**④ 行动建议**
- `conversion_failed` 实时告警已建，补一个 `conversion_complete` 日环比下跌告警（如日跌 >20% 触发）。
- 每次 Vercel 部署后在 GA4 打 Annotation，便于事后归因（你「push ≠ deployed」纪律的可观测化）。
- 算法更新窗口用模块 3 cohort 留存 + 模块 6 渠道对比，量化受影响面。

---

## 模块 8：GEO / AI 可见性桥接（贴合你的核心业务）

**① 为什么分析**
你的 GEO Growth Loop 测的是 ChatGPT 等 AI 的品牌可见性（R_pre / R_post），但 AI 引用带来的站点访问在 GA4 里常被归为 direct / none（AI 聊天链接常不带 referrer）。不主动桥接，GEO 投入就是黑盒。

**② 核心指标**
- AI 平台引荐识别：Session source / medium 中出现 chat.openai.com / copilot.microsoft.com / perplexity.ai / gemini.google.com 等（需 referrer 透传或 UTM 标记）
- GEO 渠道 vs 传统 organic 的转化对比（`conversion_complete` 率、engagement）
- AI 提及 → 站点访问归因：发布 GEO 内容后，对应 landing 页流量增量
- GEO 播种价值：AI 平台流量在归因模型中的辅助转化贡献

**③ 怎么读数**
- 在 **Traffic acquisition** 报告按 source 排序，找出 AI 域名；对无 referrer 的疑似 GEO 流量，用你 `publish_to_bookconv.py` 发布时强制带 `utm_source=chatgpt&utm_medium=geo` 等标记，使其可追踪。
- **Free Form**：维度 = session source（含 GEO UTM），指标 = conversions + engagement rate，对比 GEO vs google / organic。
- 把 GEO 发布批次（Batch 4 Day10/11 等）作为 campaign 维度，叠加时序看 R_post 提升后是否带来访问增量，形成「AI 可见性 → 站点流量 → 转化」闭环证据。

**④ 行动建议**
- 所有外发 GEO 链接统一 UTM 规范（模块 6 复用），让 AI 引用流量可量化。
- 建一个 GEO 专属看板：source = geo-* 的实时 `conversion_complete` / engagement，作为 GEO ROI 证据。
- 将 R_pre / R_post（Kelriva 等工具测得）与 GA4 GEO 渠道流量做时间对齐，向客户 / 自己证明 GEO 漏斗成立。

> ⚠️ **黑暗流量诚实边界（红队 R2 修正）**：UTM 只能追踪你「主动发布且带标记」的 GEO 链接。AI 在回答中**自然提及** bookconv.com、但用户凭记忆手输 URL 访问的流量，会落入 `direct/none`，属于**黑暗流量**，无法完全归因。因此 GEO 的 ROI **不能只看 GA4 末触转化**——须结合 R_pre/R_post 可见性指标（Kelriva）与 GEO 渠道增量做三角印证，三者一致才下结论。

---

## 模块 9：落地优先级建议（给 BookConv）

> ⚠️ **红队 R8 修正**：以下优先级为「基于当前已知风险（10-01 故障、GEO 战略）的**起始假设**，非已论证结论」，应在运行 2–4 周后用真实数据回看调整。

按 ROI 分三批：

1. **P0（立即）**：模块 0（数据质量地基）、模块 2（转化漏斗 + `conversion_failed` 分流 + 埋点待办）、模块 7（异常告警）、模块 8（GEO UTM 桥接）—— 直接对应你已知故障与 GEO 战略，且模块 0 是其余一切的前提。
2. **P1（本周）**：模块 1（用户分群）、模块 6（归因对比）、模块 3（留存 cohort）—— 回答「增长来自谁、值不值」。
3. **P2（持续）**：模块 4（内容互动）、模块 5（技术体验）—— 优化层，依赖前序数据。

配套动作：在 GA4 建 2–3 个固定 Exploration 模板（漏斗 / 分群 / GEO 渠道），每周复用，避免每次重搭；所有模板数据源须先过模块 0 质量核查。

---

*本文档为进阶分析维度框架（v2 红队审计修订版），非一次性报告。建议随 BookConv GA4 事件演进持续增补（如新增 `batch_convert` 等事件时同步更新模块 2 埋点清单）。*
