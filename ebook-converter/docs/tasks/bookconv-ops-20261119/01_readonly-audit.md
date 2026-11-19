# 只读核查记录｜2026-11-19

## 任务板原始记录摘录
### M12-1
```json
{
          "id": "M12-1",
          "action": "定位 Google 站级可见度坍塌根因（断崖日 2026-08-22）",
          "detail": "三方证据已备：①GSC 逐日复算 08-21=142 → 08-22=32 → 08-23=8；A 段(8/1-8/21) 112.1 展示/日、排名 54.9 → C 段(9/18-10/24) 6.2 展示/日、排名 65.5。②Google 2026 年 8 月垃圾内容更新：8/18 09:27 PDT 起、8/21 01:49 PDT 完成、全球全语言（Search Status Dashboard + SEJ + SERoundtable 三源交叉）。③Bing AI 同期于 09-24 创峰值 1450 引用/日 ⇒ Google 单侧事件。需用户执行 GSC 三查：手动操作、安全风险、索引编制页数；并提供 8/15-8/31 站点变更记录。判定目标：抓取层问题 vs 垃圾判定层问题（两条路行动互斥）。",
          "owner": "A→U",
          "deliverable": "诊断_Google站级坍塌根因_2026-11.md（含三查结论 + 二分判定）",
          "accept": "三查结论全部落纸，或明确写 UNKNOWN 并给出下一步取证；二分判定（抓取层 / 判定层）有结论；未判定前不得启动 S1 页面实验",
          "due": "2026-11-17",
          "priority": "P0",
          "tier": "CORE",
          "status": "doing",
          "statusNote": "2026-11-03 通过 tabbit 实测 GSC + Vercel 完成三查（原\"阻塞于用户侧登录\"已作废）：\n① GSC 人工处置措施（手动操作）：未检测到任何问题 ✅ 无惩罚\n② GSC 安全问题：未检测到任何问题 ✅ 无安全风险\n③ GSC 网页索引编制：已编入索引 62；未编入索引 150（6 原因：已发现未编入117 / 规范备用页11 / 已抓取未编入8 / 重定向6 / 404×5 / noindex×3）；sitemap 更新 2026-10-23\n④ 站点变更核查(8/15-8/31)：git 仓库最早提交 2026-09-28（该窗口无提交）；Vercel 部署历史翻页最早仅至 2026-10-16，无 8 月部署。即 8/22 坍塌发生在当前仓库/部署历史之前的代码状态，无法从版本控制追溯代码变更。\n==> 二分判定：判定层（算法/质量重分类），非抓取层、非手动惩罚、非安全风险、非当前仓库可追溯代码变更。\n佐证：时间线与 Google 2026-08 垃圾内容更新（8/18 起、8/21 完成，全球）精确吻合；同期 Bing AI 引用未受影响（9/24 峰值 1450/日）。\n剩余：连续14天 GSC 展示>20/日 确认窗为被动监测，不阻塞 S1 路线（S1 应定为\"整改+观察\"而非\"增长\"）。\n2026-11-04 落 deliverable：诊断_Google站级坍塌根因_2026-11.md（三查结论+二分判定=判定层质量重分类）。保持 doing：14 天 GSC 展示>20/日 被动监测窗 + S1「整改+观察」未启动。\n[2026-11-04 监测窗启动] 14 天被动监测窗 START=2026-11-04 / END=2026-11-18（连续 14 天 GSC 展示>20/日 为观察信号，不阻塞 S1）
```
### M12-1-S1
```json
{
          "id": "M12-1-S1",
          "tier": "CORE",
          "owner": "A→O",
          "detail": "由 M12-1 拆解：M12-1 已判定为「判定层质量重分类」（非抓取层/非手动惩罚/非安全风险），故 S1 定性为「整改+观察」而非增长实验。范围=内容质量与规范入口的整改清单，不含页面实验、不动实验页。拆分理由：与 11/10、11/12 首批页面实验隔离，避免互相干扰。",
          "status": "todo",
          "priority": "P0",
          "due": "2026-11-18",
          "action": "S1 整改：基于 M12-1 判定层质量重分类，定义并执行内容质量/规范入口整改清单（非页面实验）",
          "accept": "列出具体整改页+动作，或写 UNKNOWN",
          "statusNote": "2026-11-04 由 M12-1 拆解，待启动",
          "statusAudited": "2026-11-04 残余三项分流"
        }
      ]
    },
    {
      "id": "M13",
      "name": "2026年11月逐日执行计划(红队修订版)",
      "why": "排程入口:把 docs/11月逐日执行计划-红队修订版.md 的按日主线写入作战台,复用旧任务(M7/M11等)不另开平行执行状态;11/3测量修复已完成并红队(见 docs/seed-url-mapping-2026-11-03.md)",
      "tier": "CORE",
      "tasks": [
        {
          "id": "M13-1",
          "action": "[11-01] 周日 · 已做＋本轮规划",
          "detail": "月度复核、红队审计和逐日拆解；详见 docs/11月逐日执行计划-红队修订版.md §三",
          "owner": "A→O",
          "deliverable": "docs/11月逐日执行计划-红队修订版.md",
          "accept": "月度复核、红队审计和逐日拆解",
          "due": "2026-11-01",
          "priority": "P0",
          "tier": "CORE",
          "status": "done",
          "statusNote": "计划标注已完成；执行层残余见待办 §七",
          "statusAudit": "plan-redteam-2026-11-01"
        },
        {
          "id": "M13-2",
          "action": "[11-02] 周一 · 联合周评审①",
          "detail": "采集增长基线、复核固定竞品面板与6任务初始答案；详见 docs/11月逐日执行计划-红队修订版.md §三",
          "owner": "A→O",
          "deliverable": "docs/11月逐日执行计划-红队修订版.md",
          "accept": "采集增长基线、复核固定竞品面板与6任务初始答案",
          "due": "2026
```
### M8-15
```json
{
          "id": "M8-15",
          "action": "海外Bing点击到站与GA差异核验",
          "due": "2026-11-06",
          "priority": "P0",
          "detail": "同日期10/08—11/04，核对时区/站点/搜索范围；最多5个美国主要落地页，检查标签、跳转、来源与可用访问日志。43点击≠8用户，不计算丢失率。",
          "accept": "跨平台差异表、原始导出与逐页核验；确认/排除/UNKNOWN分列，工具拦collect不归因生产故障。",
          "owner": "A",
          "tier": "SUPP",
          "status": "doing",
          "deliverable": "docs/tasks/bookconv-growth-20261105/M8-15.md",
          "recheck": "2026-11-30",
          "statusNote": "2026-11-06 已执行核验并交付 M8-15.md（PASS WITH RESIDUALS）。三源对账：BWT UI 国家表108点击=Bing API 同窗108点击；GA4 美国9会话/8活跃用户、中国458/391与用户截图一致；US 明细四维度组合闭合9/8。红队推翻「108相等=同窗」（19个窗口/印象约束后仍5个）降为 UNKNOWN。逐页核验 Bing 全站 Top5 均200+canonical自引用+无跳转，负对照404。43点击≠8用户判 NOT_COMPARABLE（禁相减/丢失率/漏记）。未完成：美国×页面落地页（BWT无国家维度、tabbit表格rows=0）与 BWT 窗口日期文字，均 UNKNOWN 并给最小解阻，交 11/09 联合周评审②由站长普通浏览器导出，故不标 done。未改代码/配置、未提交 git、未 push；线上作战台与 Notion NOT_SYNCED。既有F/R编号为同一工作承接，不新建重复故障。"
        },
        {
          "id": "M8-16",
          "action": "任务级最小观测契约与单文件接入",
          "due": "2026-11-10",
          "priority": "P1",
          "detail": "承接F25；request_id/attempt_id/batch_id与schema_version，覆盖前置拒绝和终态；不重定义旧file_upload，不为随机ID注册常规高基数GA维度。",
          "accept": "成功/前置拒绝/上传失败/重试独立对账；GA不可用不阻断功能；任务ID无PII。",
          "owner": "A",
          "tier": "SUPP",
          "status": "todo",
          "deliverable": "docs/tasks/bookconv-growth-20261105/M8-16.md",
          "recheck": "2026-11-30",
          "statusNote": "2026-11-05 用户授权纳入增长计划；仅完成排程登记，开发未执行。既有F/R编号为同一工作承接，不新建重复故障；执行预算见11月逐日计划增补。"
        },
        {
          "id":
```
### M13-18
```json
{
          "id": "M13-18",
          "action": "[11-18] 周三 · 竞品月度深度结论",
          "detail": "汇总本月证据,形成领先/落后/值得测试/明确不做矩阵；详见 docs/11月逐日执行计划-红队修订版.md §三",
          "owner": "A→O",
          "deliverable": "docs/11月逐日执行计划-红队修订版.md",
          "accept": "汇总本月证据,形成领先/落后/值得测试/明确不做矩阵",
          "due": "2026-11-18",
          "priority": "P0",
          "tier": "CORE",
          "status": "todo",
          "statusNote": "至少3项决策,分别链接本站URL与验证指标",
          "statusAudit": "plan-redteam-2026-11-01"
        },
        {
          "id": "M13-19",
          "action": "[11-19] 周四 · SEO流量承接补缺",
          "detail": "从已证实问题中只选1项处理并验收；详见 docs/11月逐日执行计划-红队修订版.md §三",
          "owner": "A→O",
          "deliverable": "docs/11月逐日执行计划-红队修订版.md",
          "accept": "从已证实问题中只选1项处理并验收",
          "due": "2026-11-19",
          "priority": "P1",
          "tier": "CORE",
          "status": "todo",
          "statusNote": "不向参考页追加实验链接",
          "statusAudit": "plan-redteam-2026-11-01"
        },
        {
          "id": "M13-20",
          "action": "[11-20] 周五 · 竞品⑥",
          "detail": "Bing与豆包差异应用；详见 docs/11月逐日执行计划-红队修订版.md §三",
          "owner": "A→O",
          "deliverable": "docs/11月逐日执行计划-红队修订版.md",
          "accept": "Bing与豆包差异应用",
          "due": "2026-11-20",
          "priority": "P1",
          "tier": "CORE",
          "status": "todo",
          "statusNote": "不假定两平台共用索引",
          "statusAudit": "plan-redteam-2026-11-01"
        },
        {
          "id": "M13-21",
          "action": "[11-21] 周六 · 证据完整性检查",
          "detail": "检查本周卡片/变更/上线与回答记录是否可定位；详见 docs/11月逐日执行计划-红队
```
### M8-18
```json
{
          "id": "M8-18",
          "action": "额度可用状态与上传前提示",
          "due": "2026-11-19",
          "priority": "P1",
          "detail": "11/17状态实现、11/19提示与验证；复用既有缓存及batch停止逻辑，available/limited/unknown，按实际路由验证替代方案，不增加付费。",
          "accept": "耗尽/未知/过期/恢复/检查后变更及batch受限可测；不伪造恢复时间或全站不可用。",
          "owner": "A",
          "tier": "SUPP",
          "status": "todo",
          "deliverable": "docs/tasks/bookconv-growth-20261105/M8-18.md",
          "recheck": "2026-11-30",
          "statusNote": "2026-11-05 用户授权纳入增长计划；仅完成排程登记，开发未执行。既有F/R编号为同一工作承接，不新建重复故障；执行预算见11月逐日计划增补。"
        },
        {
          "id": "M8-19",
          "action": "下载发起与批量任务观测收口",
          "due": "2026-11-20",
          "priority": "P1",
          "detail": "依赖M8-16；覆盖ToolPageClient、BeforeAfterComparison、DownloadButton、BatchUpload真实入口，终态与重复点击分开。",
          "accept": "download_clicked不声称保存到磁盘；批量子任务与前置失败可对账，事件版本与部署分期明确。",
          "owner": "A",
          "tier": "SUPP",
          "status": "todo",
          "deliverable": "docs/tasks/bookconv-growth-20261105/M8-19.md",
          "recheck": "2026-11-30",
          "statusNote": "2026-11-05 用户授权纳入增长计划；仅完成排程登记，开发未执行。既有F/R编号为同一工作承接，不新建重复故障；执行预算见11月逐日计划增补。"
        },
        {
          "id": "M8-20",
          "action": "三项开发联合验收、发布包与观测复查",
          "due": "2026-11-21",
          "priority": "P1",
          "detail": "依赖M8-16/17/18/19；验收代码、浏览器行为、事件对账和回滚，11/22缓冲；11/30、12/07、12/21复查，按实际t0和完整数据顺延。人工复核发布，不自动push。",
          "accept": "各项通过/受阻及证据分列；本地、生产部署、GA回流分别验证；不能将计划、提交或上线等同增长效果。",
          "owner": "A",
          "tier": "SUPP",
          "status":
```
### M8-16
```json
{
          "id": "M8-16",
          "action": "任务级最小观测契约与单文件接入",
          "due": "2026-11-10",
          "priority": "P1",
          "detail": "承接F25；request_id/attempt_id/batch_id与schema_version，覆盖前置拒绝和终态；不重定义旧file_upload，不为随机ID注册常规高基数GA维度。",
          "accept": "成功/前置拒绝/上传失败/重试独立对账；GA不可用不阻断功能；任务ID无PII。",
          "owner": "A",
          "tier": "SUPP",
          "status": "todo",
          "deliverable": "docs/tasks/bookconv-growth-20261105/M8-16.md",
          "recheck": "2026-11-30",
          "statusNote": "2026-11-05 用户授权纳入增长计划；仅完成排程登记，开发未执行。既有F/R编号为同一工作承接，不新建重复故障；执行预算见11月逐日计划增补。"
        },
        {
          "id": "M8-17",
          "action": "上传可靠性取证、针对性修复与浏览器复测",
          "due": "2026-11-12",
          "priority": "P0",
          "detail": "承接F19/R2、F20/R-B、F23。11/07取证、11/11修复、11/12复测；已实施F20不重复。根因UNKNOWN时仅补取证和复测，不拍脑袋扩容或重做CORS。",
          "accept": "合法样本大小边界、阶段错误和可打开输出矩阵；未测明确登记，R-B缺真实回流不假关闭。",
          "owner": "A",
          "tier": "SUPP",
          "status": "done",
          "deliverable": "docs/tasks/bookconv-growth-20261105/M8-17.md",
          "recheck": "2026-11-30",
          "statusNote": "2026-11-07 执行当日取证准备，详见M8-17.md及evidence/2026-11-07。正式页CSP含R2、presign enabled/100MB；12:38 独立复核经 /api/health 实测生产 commitSha=26b1a55，与本地 HEAD 一致（原标 UNKNOWN 已补；仅证明构建版本，不证明浏览器PUT/转换成功）。真实GA快照窗口10/30—11/06，11/05诊断3事件，11/06未见PUT_FAILED但成功侧无 file_size 维度、>4MB端到端仍UNKNOWN；连续三日门禁未达，不关闭F19/R2。原创EPUB/PDF及4MiB±1/精确边界共5份样本已备，哈希/字节/结构5/5复核一致，未上传；浏览器PUT和四转换输出未测，按11/05增补并入11/12矩阵，保留11/11修复及11/12验收。独立通道复核见 independent-review.json（L3，PASS WITH RESIDUALS）。仅本地doing，Notion/线上NOT_SYNCED
```
### M13-19
```json
{
          "id": "M13-19",
          "action": "[11-19] 周四 · SEO流量承接补缺",
          "detail": "从已证实问题中只选1项处理并验收；详见 docs/11月逐日执行计划-红队修订版.md §三",
          "owner": "A→O",
          "deliverable": "docs/11月逐日执行计划-红队修订版.md",
          "accept": "从已证实问题中只选1项处理并验收",
          "due": "2026-11-19",
          "priority": "P1",
          "tier": "CORE",
          "status": "todo",
          "statusNote": "不向参考页追加实验链接",
          "statusAudit": "plan-redteam-2026-11-01"
        },
        {
          "id": "M13-20",
          "action": "[11-20] 周五 · 竞品⑥",
          "detail": "Bing与豆包差异应用；详见 docs/11月逐日执行计划-红队修订版.md §三",
          "owner": "A→O",
          "deliverable": "docs/11月逐日执行计划-红队修订版.md",
          "accept": "Bing与豆包差异应用",
          "due": "2026-11-20",
          "priority": "P1",
          "tier": "CORE",
          "status": "todo",
          "statusNote": "不假定两平台共用索引",
          "statusAudit": "plan-redteam-2026-11-01"
        },
        {
          "id": "M13-21",
          "action": "[11-21] 周六 · 证据完整性检查",
          "detail": "检查本周卡片/变更/上线与回答记录是否可定位；详见 docs/11月逐日执行计划-红队修订版.md §三",
          "owner": "A→O",
          "deliverable": "docs/11月逐日执行计划-红队修订版.md",
          "accept": "检查本周卡片/变更/上线与回答记录是否可定位",
          "due": "2026-11-21",
          "priority": "P2",
          "tier": "CORE",
          "status": "todo",
          "statusNote": "登录失效只标受阻",
          "statusAudit": "plan-redteam-2026-11-01"
        },
        {
          "id": "M13-22",
          "action": "[11-22] 周日 · 缓冲与实验冻结",
          "detail": "整理未完成项和故障残留；详见 docs/11月逐日执行计划-红队修订版.md §三",
          "owner": "A
```

## 相关证据文件搜索
### 搜索：2026-08-22
docs\gsc-index-audit-2026-11-01\evidence\input-图表.csv:19
docs\project-governance\BookConv-SEO-GEO首次执行报告-CP0-CP11-2026-11-02.md:29
docs\tasks\bookconv-90d-A1A5B4-20261116\evidence\BingAPI_RankAndTraffic_LIVE_partial_2026_11_16.csv:29
docs\tasks\bookconv-90d-A1A5B4-20261116\raw\www.bookconv.com_BingAPI_RankAndTraffic_2026_11_16.csv:29
docs\tasks\bookconv-growth-20261105\before-seo-geo-board.json:1694
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\before-seo-geo-board.json:1778
docs\training-materials\GSC日报-2026-09-07.md:8
### 搜索：站级可见度
docs\project-governance\BookConv-SEO-GEO首次执行报告-CP0-CP11-2026-11-02.md:29
docs\tasks\bookconv-growth-20261105\before-seo-geo-board.json:1693
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\before-seo-geo-board.json:1777
### 搜索：Bing点击到站
docs\tasks\bookconv-growth-20261105\schedule-manifest.json:6
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\before-seo-geo-board.json:1396
docs\tasks\bookconv-ops-20261119\README.md:23
### 搜索：M12-1
docs\11月逐日执行计划-红队修订版.md:289
docs\审计_Spam合规自查_174URL_2026-11-03.md:4
docs\CEO接管记录_2026-11-15.md:39
docs\CP9-周报模板-v1.md:218
docs\governance\BookConv-WorkBuddy双账号历史接管与日常经营纳管-2026-11-15.md:57
docs\project-governance\BookConv-SEO-GEO首次执行报告-CP0-CP11-2026-11-02.md:182
docs\tasks\bookconv-ceo-acceptance-20261117\01_G05_独立验收基线整改.md:35
docs\tasks\bookconv-ceo-acceptance-20261117\06_本轮经营成果与下周重点.md:54
docs\tasks\bookconv-ceo-acceptance-20261117\evidence\run-evidence.txt:36
docs\tasks\bookconv-growth-20261105\before-11月逐日执行计划-红队修订版.md:236
docs\tasks\bookconv-growth-20261105\before-seo-geo-board.json:1698
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\before-seo-geo-board.json:1782
docs\tasks\bookconv-growth-governance-2026-11-16\08_自动化运行验证.md:6
docs\tasks\bookconv-growth-governance-2026-11-16\09_第一周经营计划.md:20
docs\tasks\bookconv-ops-20261119\README.md:8
docs\工作日志\2026-11-15.md:15
### 搜索：M8-15
docs\11月逐日执行计划-红队修订版.md:5
docs\作战板到期逾期任务逐项处置_2026-11-08.md:19
docs\CEO接管记录_2026-11-15.md:36
docs\seo-geo-execution-plan-2026-09-17.md:5
docs\tasks\bookconv-growth-20261105\CEO接管与90天滚动执行计划-2026-11-09.md:9
docs\tasks\bookconv-growth-20261105\M8-15.md:1
docs\tasks\bookconv-growth-20261105\M8-17.md:39
docs\tasks\bookconv-growth-20261105\REDTEAM.md:11
docs\tasks\bookconv-growth-20261105\schedule-manifest.json:2
docs\tasks\bookconv-growth-20261105\SCHEDULE.md:3
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\before-seo-geo-board.json:1395
docs\tasks\bookconv-growth-20261105\evidence\2026-11-08\notion-sync.json:8
docs\tasks\bookconv-growth-20261105\evidence\M8-15\bwt-probe-01.json:2
docs\tasks\bookconv-growth-20261105\evidence\M8-15\bwt-probe-02.json:2
docs\tasks\bookconv-growth-20261105\evidence\M8-15\ga4-us.stdout.txt:34
docs\tasks\bookconv-growth-20261105\evidence\M8-15\redteam-receipt-check.txt:1
docs\tasks\bookconv-growth-20261105\evidence\M8-15\reverse-injected.stdout.txt:37
docs\tasks\bookconv-growth-20261105\evidence\M8-15\verification.json:10
docs\tasks\bookconv-ops-20261119\README.md:8
docs\工作日志\2026-11-06.md:1
### 搜索：竞品月度
docs\11月逐日执行计划-红队修订版.md:25
docs\今日整理与跨文档一致性核验-2026-11-01.md:33
docs\BookConv-AI运营体系-V2.0-2026-11-11.md:58
docs\tasks\bookconv-growth-20261105\before-11月逐日执行计划-红队修订版.md:57
docs\tasks\bookconv-growth-20261105\before-seo-geo-board.json:2004
docs\tasks\bookconv-growth-20261105\schedule-manifest.json:2
docs\tasks\bookconv-growth-20261105\SCHEDULE.md:23
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\before-seo-geo-board.json:2088
docs\tasks\bookconv-ops-20261119\README.md:24

## 对应任务目录文件清单
### docs\tasks\bookconv-growth-20261105
docs\tasks\bookconv-growth-20261105\竞品证据卡_EPUB阅读与打开任务_2026-11-13.md
docs\tasks\bookconv-growth-20261105\before-11月逐日执行计划-红队修订版.md
docs\tasks\bookconv-growth-20261105\before-seo-geo-board.json
docs\tasks\bookconv-growth-20261105\before-seo-geo-execution-plan-2026-09-17.md
docs\tasks\bookconv-growth-20261105\CEO接管与90天滚动执行计划-2026-11-09.md
docs\tasks\bookconv-growth-20261105\M8-15.md
docs\tasks\bookconv-growth-20261105\M8-17.md
docs\tasks\bookconv-growth-20261105\REDTEAM.md
docs\tasks\bookconv-growth-20261105\schedule-manifest.json
docs\tasks\bookconv-growth-20261105\SCHEDULE.md
docs\tasks\bookconv-growth-20261105\verify-schedule.py
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\.gitattributes
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\before-seo-geo-board.json
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\closure-gate.txt
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\diagnostic-summary.json
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\fixture-manifest.json
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\ga4-advanced-2026-11-06.json
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\independent-review.json
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\prepare-nov07.py
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\production-probe.json
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\fixtures\owned-4MiB-above.epub
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\fixtures\owned-4MiB-at.epub
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\fixtures\owned-4MiB-below.epub
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\fixtures\owned-small.epub
docs\tasks\bookconv-growth-20261105\evidence\2026-11-07\fixtures\owned-small.pdf
docs\tasks\bookconv-growth-20261105\evidence\2026-11-08\audit.json
docs\tasks\bookconv-growth-20261105\evidence\2026-11-08\ga4-events.json
docs\tasks\bookconv-growth-20261105\evidence\2026-11-08\notion-sync.json
docs\tasks\bookconv-growth-20261105\evidence\2026-11-08\source-hashes.csv
docs\tasks\bookconv-growth-20261105\evidence\2026-11-15\browser-retest.md
docs\tasks\bookconv-growth-20261105\evidence\2026-11-15\m8-17-retest-epub-4mib-above-direct.json
docs\tasks\bookconv-growth-20261105\evidence\2026-11-15\m8-17-retest-epub-4mib-at-multipart.json
docs\tasks\bookconv-growth-20261105\evidence\2026-11-15\m8-17-retest-epub-to-mobi-small.json
docs\tasks\bookconv-growth-20261105\evidence\2026-11-15\m8-17-retest-mobi-to-pdf.json
docs\tasks\bookconv-growth-20261105\evidence\2026-11-15\m8-17-retest-pdf-to-epub-small.json
docs\tasks\bookconv-growth-20261105\evidence\M8-15\bing-window.stdout.txt
docs\tasks\bookconv-growth-20261105\evidence\M8-15\board-gate.stdout.txt
docs\tasks\bookconv-growth-20261105\evidence\M8-15\bwt-country-1105.png
docs\tasks\bookconv-growth-20261105\evidence\M8-15\bwt-probe-01.json
docs\tasks\bookconv-growth-20261105\evidence\M8-15\bwt-probe-02.json
docs\tasks\bookconv-growth-20261105\evidence\M8-15\bwt-table-1105.png
docs\tasks\bookconv-growth-20261105\evidence\M8-15\GA4_USdetail_raw.json
docs\tasks\bookconv-growth-20261105\evidence\M8-15\ga4-us.stdout.txt
docs\tasks\bookconv-growth-20261105\evidence\M8-15\metric-check.json
docs\tasks\bookconv-growth-20261105\evidence\M8-15\metric-check.mjs
docs\tasks\bookconv-growth-20261105\evidence\M8-15\metric-check.stdout.txt
docs\tasks\bookconv-growth-20261105\evidence\M8-15\redteam-receipt-check.txt
docs\tasks\bookconv-growth-20261105\evidence\M8-15\reverse-injected.stdout.txt
docs\tasks\bookconv-growth-20261105\evidence\M8-15\verification-window.json
docs\tasks\bookconv-growth-20261105\evidence\M8-15\verification.json
docs\tasks\bookconv-growth-20261105\evidence\M8-15\verify.mjs
docs\tasks\bookconv-growth-20261105\evidence\M8-15\window-uniqueness.mjs
### docs\tasks\bookconv-growth-20261117
docs\tasks\bookconv-growth-20261117\00_README_交付总览.md
docs\tasks\bookconv-growth-20261117\01_A1_G07执行链核查.md
docs\tasks\bookconv-growth-20261117\02_A2_生产接线包.md
docs\tasks\bookconv-growth-20261117\03_A3_自动化依赖审计.md
docs\tasks\bookconv-growth-20261117\04_B_搜索增长机会研究.md
docs\tasks\bookconv-growth-20261117\04_opportunities.json
docs\tasks\bookconv-growth-20261117\05_C1_页面优化包.md
docs\tasks\bookconv-growth-20261117\06_C2_内容草稿.md
docs\tasks\bookconv-growth-20261117\07_D_产品转化诊断.md
docs\tasks\bookconv-growth-20261117\08_C3C4_外链与GEO.md
docs\tasks\bookconv-growth-20261117\09_台账索引.md
docs\tasks\bookconv-growth-20261117\10_红队与独立验收.md
docs\tasks\bookconv-growth-20261117\11_CEO经营日报.md
docs\tasks\bookconv-growth-20261117\C1-page-optimization-proposed.ts.txt
docs\tasks\bookconv-growth-20261117\C1-title-meta.diff
docs\tasks\bookconv-growth-20261117\A2-wiring\prompt-92ac81b1.diff
docs\tasks\bookconv-growth-20261117\A2-wiring\proposed-prompt-92ac81b1.txt
docs\tasks\bookconv-growth-20261117\A2-wiring\backup\92ac81b1-prompt.original.txt
docs\tasks\bookconv-growth-20261117\A2-wiring\backup\d5aba73b-prompt.original.txt
docs\tasks\bookconv-growth-20261117\A2-wiring\backup\f1ca7eb8-meta.original.json
docs\tasks\bookconv-growth-20261117\A2-wiring\backup\f1ca7eb8-prompt.original.txt
docs\tasks\bookconv-growth-20261117\evidence\A1-entry-dryrun.txt
docs\tasks\bookconv-growth-20261117\evidence\A2-isolation-test.txt
docs\tasks\bookconv-growth-20261117\evidence\A3-automation-inventory.txt
docs\tasks\bookconv-growth-20261117\evidence\A3-run-history-14d.txt
docs\tasks\bookconv-growth-20261117\evidence\C1-page-audit-live.json
docs\tasks\bookconv-growth-20261117\evidence\C3-tftd-confirm-page.html
docs\tasks\bookconv-growth-20261117\evidence\C3-tftd-real-post-headers.txt
docs\tasks\bookconv-growth-20261117\evidence\G-independent-recompute.txt
docs\tasks\bookconv-growth-20261117\seven-day\D1-2026-11-17.json
