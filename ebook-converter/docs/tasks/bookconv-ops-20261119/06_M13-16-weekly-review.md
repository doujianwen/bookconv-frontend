# M13-16｜联合周评审③｜2026-11-16数据复核（补交）

## 经营结论
**数据足以识别流量与埋点风险，但不足以判定本周SEO/GEO增长实验成功或失败。**本周没有可靠证据支持“持续增长”“海外流量增长”或“AI平台引荐增长”；不以单日尖峰、事件比值或采样关键词替代经营结果。

## 1. GSC：点击与查询归属
来源：`docs/tasks/bookconv-90d-A1A5B4-20261116/REPORT.md`，GSC截至2026-11-14（T-2）。

- D30（10/15–11/14）：13 clicks / 211 impressions。
- Recent7（11/08–11/14）：0 clicks / 45 impressions；Prev7（11/01–11/07）：4 clicks / 43 impressions。
- Page D10（11/04–11/14）：首页1 click / 55 impressions，是该窗唯一有点击URL。
- Date维度唯一1 click落在11/05；它不属于recent7，故date与page窗口差异是窗口错位，不是GSC数据矛盾。
- Query D10同窗clicks合计0；缺少query×page双维度，不能将首页1次点击归属到具体query，保持UNKNOWN。

## 2. 排名与内容机会
- GSC观测关键词410个（不是全量词库）；非品牌375、品牌35。
- Top30外396/410（96.6%），中位排名67.3；Top10=14、Top30=23、Top50=52。
- `ebook converter` 84 impressions、平均位置93.6，是“有需求但排名深”的候选，不足以单独授权新页面或大规模改写。
- 未调用URL Inspection API；未索引、canonical、抓取和逐页内容质量根因仍UNKNOWN。

## 3. GA4：用户与任务事件
来源：同一报告A4，T-1=2026-11-15。

- activeUsers 34、totalUsers 36、newUsers 30、sessions 38、engagedSessions 18、keyEvents 26、pageViews 107。
- 事件：file_upload 30、conversion_attempt 30、conversion_complete 26、conversion_failed 2。
- 26/(26+2)=92.9%只能称事件级终态占比；没有job_id，不能关联同一任务的上传与转换，不能称任务成功率。
- 禁止把26/30=86.7%称真实转化率（分子/分母口径不同）；工具页的143% proxy同样无效。
- 国家China 38 sessions（100%），与海外目标不符，疑似本地测试/代理出口污染；不可当海外增长证据。
- 可识别AI平台引荐为0；`(not set)`/Unassigned 11 sessions存在异常，来源保持UNKNOWN。
- 7d窗口有DIRECT_UPLOAD_PUT_FAILED×2、CORRUPT_INPUT×1、UPLOAD_NOT_FOUND×1；T-1单日看不到这些异常，链路健康必须带时间窗。

## 4. Bing：11/08尖峰
- 11/08单日11 clicks / 176 impressions，尖峰存在。
- Recent7（11/02–11/08）31 clicks；Prev7（10/26–11/01）31 clicks；剔除11/08后Recent7仅20 clicks。
- Query/PageTraffic为周桶，不含11/08单日行，不能把尖峰归属到具体query/page/referral。
- 结论：CONFIRMED（单日尖峰）+ UNKNOWN（单日归因）；不得称趋势增长。

## 5. 红队与经营裁决
- 推翻“GSC date 0 click与page 1 click互相矛盾”：窗口不同，11/05落在page窗、不在recent7。
- 推翻“410词代表全站关键词覆盖率”：它是采样词集合。
- 推翻“26/30=转化率”：事件/用户口径不同，缺少任务级job_id。
- 推翻“11/08 Bing尖峰代表增长”：周总量31 vs 31，剔除尖峰后20。
- 推翻“China 100%代表海外流量”：当前只能视为污染嫌疑。

## 6. 本周决策
1. 不发布SEO/GEO实验成败结论，不追加页面，不为了完成计划强行选两页。
2. 优先完成M8-16任务级观测契约与M8-18额度提示；本地完成不等于GA4线上回流，须部署后再观察。
3. M3-13 DRM预检继续挂起，直到真实GA4 `error_code` 数据可用；不以代码本地测试替代生产数据。
4. M12-1索引/内容根因中的URL Inspection、canonical和抓取证据另行补齐；本报告不把排名弱推断升级为索引根因。

## 证据与验收
- 主报告：`docs/tasks/bookconv-90d-A1A5B4-20261116/REPORT.md`。
- 原始数据与复算：同目录 `raw/`、`evidence/`；run_id `BC90D-A1A5B4-20261116-230301`。
- 报告结论按Fact/Assumption/Unknown分层；A1–A5红队复算通过；B4外链提交未成功，保持DRAFTED，不冒充已提交。
- 本任务交付的是“联合周评审与不做错误归因”的决策，不代表SEO/GEO增长目标达成。

**裁定：M13-16周评审交付完成；数据不足，不评价实验成败。**