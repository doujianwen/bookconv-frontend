# GA4 进阶分析待办登记（2026-10-11）

> 来源：`数据分析/GA4进阶分析-v2手册执行版-2026-10-11.md` 优先级清单中无法当日闭环的三项，登记观察/等待条件与到期检查方式。

## P0-3 error_code 失败根因分流 —— ⏳ 等待数据

- **前置**：commit 89f901e（conversion_failed 补 error_code 参数）已上线（2026-10-11 探针验证 page chunk 命中）。
- **等待条件**：线上积累 ≥48h 且出现 ≥1 个带 error_code 的 conversion_failed 事件（预计 2026-10-13）。
- **到期检查方式**：GA4 后台 Events → conversion_failed → 参数列表出现 error_code；或 Data API 查 dimension error_code（需先在 GA4 Admin → 自定义定义注册 error_code 维度——**首 个事件被观测前无法注册，这是 GA4 限制**）。
- **然后做什么**：按 error_code × pagePath 分流失败（402 额度类 / 超时类 / 格式类），对应接 CloudConvert 充值 / MAX_FILE_SIZE 10→2 止损（待办④）/ 格式不支持提示。
- **背景数字**：28 天失败率 66%（109 上传 / 72 失败）；10-05、10-07 修复后单日失败率仍 73.7%、76.5%。

## P1-6 mobile/iOS 上传交互排查 —— 📋 排查清单

实测依据：mobile 参与度 23% vs desktop 41%；iOS engagement 21% vs Windows 45%（28 天，n 足够方向可信）。

排查清单（按 ROI 排序）：
1. iOS Safari 文件选择器：ToolPageClient.tsx 的 `<input type="file">` 是否设了 `accept`（限制过窄在 iOS 会禁用"文件"入口，只给相册）。
2. 移动端上传按钮/表单是否在首屏折叠线下（m4 数据：首页参与度 0.43 低于所有 convert 页）。
3. GA4 DebugView 用真机 iOS Safari 走一遍 file_upload 全流程。
4. 修复后验收：iOS engagement 从 21% 回到 ≥30%。

## P2-8 Android Webview 纳入观察名单 —— 📋 待 GA4 配置

实测依据：Android Webview 20 用户 / engagement 仅 5%（近乎全非参与，疑似 App 内嵌 WebView 或 bot）。

- 手段：GA4 Admin → 数据过滤器（Traffic from specific sources）或受众定义排除；**不建议直接删除**，先观察 2 周确认无真实用户。
- 挂在 P0-2 的数据过滤器配置完成后一起做（同一 UI 区域）。

---
*状态机遵循项目作战台约定：todo/doing/done/blocked/dropped。*

---

## 状态更新（2026-10-21 · GA4 进阶分析）

> 数据源：GA4 Data API 实时拉取，窗口 2026-09-20~10-20（`scripts/ga4-advanced-analysis.mjs` → `数据分析/GA4进阶分析-2026-10-21.md`）。

- **P0-3**：✅ 可执行。`error` 自定义维度已注册可用（commit 89f901e 后 + GA4 Admin 注册）。有文本样本中 **402 容量占 12/16=75%**，印证「结构性容量不足 → 升级付费档」。⚠️ 但 84 次失败中 68 次 `error=(not set)`（81% 盲区，因 10-11 才上线 error 参数），根因分流仅覆盖 10-11 后事件。
- **P1-6**：🔄 修订。`iOS 文件选择器坏掉`假设**不成立**（iOS 上传 25 / 完成 11，可用）；真瓶颈在 **mobile 上传率 27% vs desktop 80%**（Android 仅 15%）—— up-funnel 首屏 CTA 问题。验收指标改为「mobile 上传率 27% → ≥50%」。
- **P2-8**：⏳ 维持观察。当前 Android 参与度 35.3%、67 用户，**未见 5% 参与度的 Webview 簇**；GA4 OS 维度无法区分 Webview/原生 → 工具限制下不可判定。
- 新增发现：doubao.com/referral 已成第二大源（24 用户 / 35 上传 / 21 失败，参与度 77.4%），建议单独归因 + 外发 GEO 链接统一 UTM。

## 状态更新（2026-10-22 · 复测 · 402 兜底效果验证）

> 数据源：GA4 Data API 实时重拉，窗口 2026-09-21~10-21（`scripts/ga4-advanced-analysis.mjs` → `数据分析/GA4复测-兜底效果验证-2026-10-22.md`）。

- **P0-3（续）**：🟢 **兜底生效**。10-20 部署的纯 JS 免疫 402 路径已将失败率从早期 **54.4%（09-21~10-17）压到 21.1%（10-18~10-21）**，10-21 单日 **0 失败**。原"立即升级付费档"结论**修订为观察项**——402 仍偶发 12 次（未覆盖全部格式对），待纯 JS 路径补全覆盖后再评估是否付费升级，不为一次性 402 盲目付费。
- **项 2（FILE_TOO_LARGE 补事件）**：✅ 部署验证通过（`HEAD==origin/main==809fb3d`，convert 页 200；tsc+eslint 0 error）。新窗口未观测到该事件属样本无超大文件，非代码失效。
- **seobotai 过滤器**：⏳ 测试模式（10-21 经 tabbit 创建），待 ~10-23 用维度 `Test data filter name=排除 seobotai 爬虫` 验证命中量再激活。

## 状态更新（2026-10-22 · 402 源分布细分 + P0-4 立项）

> 数据源：GA4 Data API 重拉窗口 2026-09-21~10-21（`_wb_tmp/ga4-advanced-2026-10-21.json`），按 `failed_by_format`（source×target）+ `failed_by_error` 细分。

- **402 源分布关键发现**：12 次 402 中，**epub 源（epub→mobi/azw3/doc/pdf/word）占 44 次/90% 为绝对主因**，mobi 源仅 8 次/16%。⚠️ 10-22 20:24 已 push commit **9912f0d**（真 MOBI/AZW3 文本抽取器，纯 JS 覆盖 mobi/azw3/lit 源 15 对）→ **只解了 mobi 源的 8 次/16%，未触及 epub 源 44 次/90% 主因**。
- **P0-4（新增立项）**：epub 源 402（44 次/90%）需独立决策——epub→二进制目标（mobi/azw3/doc/pdf/word）纯 JS 无法产出二进制文件，只能走 CloudConvert，须三选一：
  - **A. CloudConvert 付费档**：直接消 402 容量墙，但为持续付费项（10-21 修订结论已因 mobi 兜底生效下调付费优先级，现 epub 44 次/90% 主因重估后**优先级回升**）。
  - **B. 转换结果缓存**：高频 epub→mobi/azw3 加 Redis/S3 结果缓存（输入 hash + 目标 → 命中即免调 CloudConvert），消 402 且省钱，需加缓存层代码。
  - **C. 转换降频/排队**：对 402 触发对做客户端排队 + 错峰，缓解但非根治。
  - **建议**：先 **B（缓存，零付费 + 可复用）** 验证能否把 epub 402 降到 402 容量线内；若高频对命中率仍低再上 **A（付费档）**。决策待用户拍板，本项不擅自实施。
- **T+1 因果验证（已建自动化）**：mobi/azw3 源 402 是否随 9912f0d 归零需 T+1 观察——已建一次性自动化（2026-10-23 09:00）自动复跑 `ga4-advanced-analysis.mjs 2026-10-22 --days=1`，产出 `数据分析/GA4-T1观察-mobi-azw3源验证-2026-10-23.md`，专项判定 mobi/azw3 源「归零 / 未归零 / 样本不足(UNKNOWN)」。
- **诚实边界**：今日（10-22）GA4 数据 T+1 才可见，9912f0d（10-22 20:24 push）效果**当前无法判定（UNKNOWN）**，须 10-23 拉 10-22 数据验证；若 mobi 源上传样本 < 3 次则标样本不足不作归零判定。

## P0-4 epub 源 402 大头（CloudConvert 容量）—— 📋 待决策

> 立项 2026-10-22。epub→二进制目标（mobi/azw3/doc/pdf/word）402 占 402 总量 90%（44 次），纯 JS 路径无法覆盖（二进制目标不能纯 JS 产出），须 CloudConvert 容量决策。

- **现状**：10-21 窗口 epub 源 402 = 44 次，占全部 402 的 90%。
- **方案三选一**：A 付费档（根治，持续付费）／ B 转换结果缓存（零付费，加 Redis/S3 缓存层）／ C 降频排队（缓解非根治）。
- **建议**：先 B 验证高频对命中率，命中率低再上 A。
- **验收**：实施后 T+1 观察 epub 源 402 次数降至 0 或缓存命中率 ≥ 80%。
- **状态**：📋 待用户拍板（A/B/C），本项不擅自实施。

## 状态更新（2026-10-26 · 全窗口复测）

> 数据源：GA4 Data API 实时拉取，窗口 2026-09-25~10-25（`scripts/ga4-advanced-analysis.mjs` → `数据分析/GA4进阶分析-2026-10-26.md` + `_wb_tmp/ga4-advanced-2026-10-25.json`）。10 模块全 ✅，exit 0。

- **P0-4（续）**：🔴 仍结构性未闭环。30 天 epub 源失败 **47 次（占全部失败 50%）**，其中 402 "at capacity" 错误 **13 次**几乎全部来自 epub→azw3/mobi（纯 JS 无法产出二进制）。日均可忽略（~0.43/天）但**集中爆发**——日内撞满 10 credits 即当日该路径全挂。A/B/C 仍待拍板，建议优先 **B 缓存（零付费）**。
- **新增 doubao.com 信号**（🆕 优先级上调）：doubao.com/referral 参与度 **77.4%**（全源最高之一）但 **35 上传失败 21（60%）**——高意图真实流量正被 402 路径漏掉，与 P0-4 同源。建议把它列为 P0-4 的「高价值验收对象」，B 缓存方案一并救。
- **失败率趋势确认**：全窗口 47.0% → 近 14 天 27.7% → 近 7 天 **21.1%** → 近 3 天 21.0%。修复有效，但 402 构成硬底。
- **设备维度**：失败率与专业工作流强度正相关——**Windows 57% / desktop 55%** 最高（epub→二进制桌面用户撞 402），Android 14% 最低。证实是「高价值桌面用户」损失，非低端设备问题。
- **txt→epub 验证缺口**（⚠️ 诚实边界）：脚本无「格式×日期」时序，15 次 txt→epub 失败大概率在 10-20 纯 JS 上线前，但**未经独立验证，不可判 PASS**。建议后续补 `date × source_format × target_format` 维度闭环。
- **P2-8**：维持观察。Android 93 用户 / 参与度 38%，未见 5% Webview 簇；GA4 OS 维度无法区分 Webview/原生 → 工具限制下 UNKNOWN。

## 状态更新（2026-10-26 二次 · 执行 P0-4「B 缓存方案」+ doubao 验收对象）

> 用户拍板：将 P0-4 走 B（结果缓存，零付费），并以 **doubao.com 高质流量 + epub→mobi/azw3** 为验收对象。执行结果如下。

### 关键发现：B 缓存早已随路线 A 部署（2026-10-25 · commit 8039536），本次非新建
- 缓存层 `src/lib/conversion-cache.ts` 已实现并经 `convert-handler.ts` 接线：仅在 `usesCloudConvert`（即 epub→二进制等 CloudConvert 依赖对）前查缓存、成功后写缓存，fail-open、TTL 30 天、入缓存前 `validateCachedOutput` 完整性校验、R2 存字节 + Redis 存 meta。
- 生产 R2 + Redis env 已于 10-25 经 tabbit 搜索框+负对照确认为 Production & Preview 已配置 ⇒ 缓存生产可运行。
- 因此「执行 B」= 验收 + 形式化验收对象，而非写新缓存。

### 本次新增验收证据：store→get 命中路径端到端测试
- 新增 `tests/unit/conversion-cache-roundtrip.test.ts`（内存版 R2/Redis 双 mock），**7/7 通过**：
  1. 存入合法 azw3/mobi 输出 → 同输入同格式二次查询命中、字节一致；
  2. 不同输入（不同文件）→ miss；不同目标格式 → miss（不串格式）；
  3. 损坏/错格式字节 → 既不入缓存、命中也不返回（R8 门禁）；
  4. 过期 meta → miss（R7 防陈旧）。
- 既有 `conversion-budget-cache.test.ts` **19/19 通过**（格式分类、预算闸门、fail-open）。合计 **26/26 绿**。

### ⚠️ 诚实边界（必须向用户明示，不可报假 PASS）
- **缓存只命中「完全相同输入字节 + 同格式」**。代码注释与红队 v2 已确认：**10 个不同用户各转不同的书时命中 = 0**。
- 因此 B 缓存 **不能「救」 doubao 的「不同用户/不同书」转换**——它只帮**重复转换**（热门公版书、用户同文件重试）省 credit，从而把 10 credits/天池子撑得更久、让不同文件更晚/更少撞 402（概率性缓解，非确定性修复）。
- **真正根治 distinct-file 402 仍只有**：A（CloudConvert 付费档，$17/1000 credits，持续付费）或 自托管 Calibre（路线 B，零付费但需 VPS + 信用卡）。二者按阶段约束（零成本优先、 monetization 后再付费）**仍延后**。
- **A2 预算闸门才是 doubao 体验的直接保障**：撞额时不报硬 402，而返回友好文案 + 本地免费格式推荐 + 重置时间，避免沉默失败。

### 重新定义 P0-4 验收（原「402 降至 0 / 命中率≥80%」对 distinct-file 不可达，作废）
- ✅ 可达验收：① 缓存机制生产可用（已证明：代码 + 26 测试 + env 已配）；② 生产出现首个 `X-Conversion-Cache: hit`（需重复同文件流量，低流量下可能数周才出现，UNKNOWN 非 FAILED）；③ epub→二进制 402 在「高重复」场景下下降。
- ⏳ 待观察（非当前可判定）：doubao 流量是否集中在少数热门书名（命中率可期）还是长尾离散（命中≈0）。前者 B 有效，后者需 A/路线B。

### 状态
- P0-4 方案 B：**✅ 已执行并机制验证通过**（生产已部署、测试绿）。
- P0-4 残余：**🔴 仍存在**（distinct-file 402 结构性未解），按阶段约束接受为已知限制，触发条件 = monetization 后上 A 或路线 B。
- doubao 验收对象：📋 已登记，待重复流量出现后读 `X-Conversion-Cache` + GA4 epub→binary 402 计数判定。
