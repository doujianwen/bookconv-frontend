# P1：当前自动化治理映射（44 条实测）

采集时间：2026-11-21 11:45 CST。状态：**DONE**（当前清单已建立、逐条有记录、已确认与 UNKNOWN 分开统计；工具不提供的字段一律 UNKNOWN，未猜测、未虚构）。

## 1. 总数与计数核对（R6）
| 指标 | 实测 | 说明 |
|---|---|---|
| 当前自动化总数 | **44** | `automation_update(list)` 实时返回；非 11-15 历史快照 |
| 唯一 automation_id | **44** | 无重复（程序化核对 DUP_IDS=[]） |
| 状态数 | ACTIVE=28 / PAUSED=16 | 合计 44 |
| 排程类型 | once=13 / recurring=31 | 合计 44 |
| owner 缺失 | **44/44 UNKNOWN** | 工具不返回 owner_user_id（能力边界，非"确认缺失"） |
| canonical Task ID 缺失 | **44/44 UNKNOWN** | 工具不返回；不猜测归属 |
| run_id/session_id | **44/44 UNKNOWN** | 工具不返回 |
| 产物路径 | **44/44 UNKNOWN** | 工具不返回 |
| 最近执行结果 | **44/44 UNKNOWN** | 工具不返回 |

> 计数纪律：授权令称"44 条是待核实基线，不得预设最终总数"。本次实测恰为 44 条，属实测确认，不是预设。执行中曾口头误数为 42，经程序化核对（`automation-current-20261121.json` + `recompute` 脚本）纠正为 44，以程序化结果为准。

## 2. 字段能力边界（为何大面积 UNKNOWN）
`automation_update(view/list)` 仅返回：id、name、status、scheduleType、rrule/scheduledAt、prompt、cwds、workspaceScope。交叉验证历史原生采集回执（`AIOS-CLOSURE-20261115-V3/evidence/native_probe*.json`，automations 全字段）也只有 5 个字段（id/name/status/scheduleType/scheduledAt），**从设计上不含** owner_user_id、run_id/session_id、canonical Task ID、产物路径、最近执行结果。
- 11-17 文档曾通过只读 sqlite 得到"orphan(owner NULL)=5"，但该 sqlite 当前环境不可访问，且属历史时点；不作为当前结论。
- 因此本清单对这些字段统一标 `UNKNOWN_TOOL_CAPABILITY`，明确是"工具不可获取"而非"确认为空"。

## 3. 逐条映射（44 条，已确认字段 + UNKNOWN 字段）
数据源：`evidence/automation-current-20261121.json`（机器可读）。下表列出 automation_id / 名称 / 状态 / 排程 / 已知归属线索（仅据名称与 prompt 可见内容，**不等于** canonical Task ID）。

| # | automation_id | 名称 | 状态 | 排程 | 归属线索(非TaskID) | owner / TaskID / run_id / 产物 / 最近结果 |
|---|---|---|---|---|---|---|
| 1 | d4398c21-86a3-4dee-ba2c-861538a407eb | [AIOS-CLOSURE-V3] 原生采集链路验证 #2 | ACTIVE | once 11-15 09:34 | AIOS-CLOSURE-V3 | 全 UNKNOWN |
| 2 | 47f4d43b-f49d-449c-a42c-bb92d7a11d9d | [AIOS-CLOSURE-V3] 原生清单每日持续采集 | ACTIVE | daily 09:50 | AIOS-CLOSURE-V3 | 全 UNKNOWN |
| 3 | 43765de2-e6ad-4fc9-9f7a-fbf316190315 | [AIOS-CLOSURE-V3] 原生清单只读采集验证 #1 | ACTIVE | once 11-15 09:22 | AIOS-CLOSURE-V3 | 全 UNKNOWN |
| 4 | 92ac81b1-94f1-4af1-b2c2-b8d577c3949c | GA4 每日巡检（WorkBuddy 主导） | ACTIVE | daily 09:00 | BookConv GA4 | 全 UNKNOWN |
| 5 | ad880e02-2d51-4139-9a40-1bccd0d56b56 | bookconv M5-6 西语 chrome 本地化 + M5-2 批次3 | ACTIVE | once 10-23 09:00 | BookConv M5-6 | 全 UNKNOWN |
| 6 | ae63bfcb-e1ab-4ad8-a930-ef8a41e80bd0 | bookconv M5-6 西语 chrome 本地化 + M5-2 批次3 | ACTIVE | once 10-22 09:30 | BookConv M5-6（与 #5 重复） | 全 UNKNOWN |
| 7 | f112c8ff-e583-4799-99a9-8ceaccc957d3 | Bing Topic Portfolio 月度快照（GEO M11-6/8） | ACTIVE | monthly 1日 10:00 | BookConv GEO M11 | 全 UNKNOWN |
| 8 | 8290a67f-2c52-43aa-b72f-17d2cdde3b7c | [bookconv] Bing Webmaster 每日定向 URL 提交 | ACTIVE | daily 21:25 | BookConv（名实不符：prompt 为 GEO 草稿，11-17 记录） | 全 UNKNOWN |
| 9 | 0da71b4a-745e-408d-a624-958756221b61 | 内容选题→草稿生成（人工审稿闸） | ACTIVE | weekly FR 21:30 | 内容运营 | 全 UNKNOWN |
| 10 | fb86f72d-1282-4aba-9810-e8545a82d8c2 | BookConv 月度 Kelriva AI 可见性重测 | ACTIVE | monthly 26日 09:00 | BookConv GEO | 全 UNKNOWN |
| 11 | 2ffe5dec-afd3-4ea7-8a10-f38617e4e793 | automation-gate 每周巡检 | ACTIVE | weekly MO 20:30 | AIOS 治理 | 全 UNKNOWN |
| 12 | 66a5b4f2-3714-4e88-a1fb-14afa3bd91c0 | 作战板每日逾期/到期扫描（7:30） | ACTIVE | daily 07:30 | BookConv 作战板 | 全 UNKNOWN |
| 13 | 225d863e-75a5-4d4d-8e63-3f04454ffeee | 过期文档清理 | ACTIVE | daily 22:30 | 通用运维 | 全 UNKNOWN |
| 14 | 2e8c6c27-7bc9-4229-8adf-1129e4de299d | ebook-converter 夜间同步（每日 22:00 commit+push） | ACTIVE | daily 22:00 | BookConv／P2 相关 | 全 UNKNOWN |
| 15 | 67494c98-6eb1-44f0-a449-75db89c0b73b | bookconv 每周关键词排名+竞品SERP追踪 | ACTIVE | weekly MO 09:00 | BookConv SEO | 全 UNKNOWN |
| 16 | 03c11a3a-12f4-4b29-b8b3-baa34b29fcfb | Run#5 7天窗口复测提醒 | ACTIVE | once 10-06 18:00 | GEO 复测 | 全 UNKNOWN |
| 17 | f4d73b34-4438-468d-90a5-c4de66248b9b | bookconv 每周双渠道分析（周一7:30） | ACTIVE | weekly MO 07:30 | BookConv（与 #42 双渠道重复，11-17 记录） | 全 UNKNOWN |
| 18 | 6d753168-ff62-42c4-958b-644994c61067 | BookConv GEO P0/P1 上线 30 天复测 + B3 决策 | ACTIVE | once 10-19 10:00 | BookConv GEO | 全 UNKNOWN |
| 19 | 4730b8f9-922d-45a9-a59b-58486a235e6f | BookConv GEO Validation Day 7 | ACTIVE | once 09-21 09:00 | BookConv GEO | 全 UNKNOWN |
| 20 | 4b501a10-0332-41d2-84e4-f1cdccb9508e | BookConv GEO Validation Day 30 | ACTIVE | once 10-14 09:00 | BookConv GEO | 全 UNKNOWN |
| 21 | b1e5c6a9-c2a1-4898-a97d-af28d7db9613 | BookConv GEO Validation Day 14 | ACTIVE | once 09-28 09:00 | BookConv GEO | 全 UNKNOWN |
| 22 | 3363d7e7-b9a1-4fab-8a3d-affda3e36212 | A4.1-T3 状态持续性采集（22:35） | ACTIVE | once 09-08 22:35 | AIOS A4.1 | 全 UNKNOWN |
| 23 | b3750bb6-dd88-4f91-9e09-6adfe1b1da80 | A4.1-T2 状态持续性采集（19:35） | ACTIVE | once 09-08 19:35 | AIOS A4.1 | 全 UNKNOWN |
| 24 | 104f784c-ee6c-47e8-8648-944ba6fe23a3 | Bing 收录复核 - 16页重提交验证 + 剩余EN页续跑 | ACTIVE | once 09-07 10:00 | BookConv SEO | 全 UNKNOWN |
| 25 | automation-1787835506064 | GSC 监测 - 最终决策日（9/10，三选项） | ACTIVE | once 09-10 21:00 | BookConv GSC | 全 UNKNOWN |
| 26 | automation-1786713476442 | 每日社媒草稿(X+Reddit) | ACTIVE | daily 22:00 | 社媒运营 | 全 UNKNOWN |
| 27 | automation-1786630182041 | 每日工作日志归档(ebook-converter) | ACTIVE | daily 23:00 | BookConv 日志 | 全 UNKNOWN |
| 28 | automation-1786253884885 | Pro 链路门禁健康检查 | ACTIVE | weekly MO | AIOS 治理 | 全 UNKNOWN |
| 29 | a9306382-949b-4b2d-af45-0e0f53608cf4 | AIOS-DailyPlan-ReadOnly-Sync | PAUSED | daily 08:20 | AIOS | 全 UNKNOWN |
| 30 | 9afe8131-46f7-4481-b578-dfa769574a8e | FDE 补短板·工作日午间提醒 | PAUSED | weekday 13:30 | FDE | 全 UNKNOWN |
| 31 | 7ecd345e-468c-4de3-a654-d87251c70208 | [bookconv] Bing Webmaster 每日定向 URL 提交 | PAUSED | daily 08:00 | BookConv | 全 UNKNOWN |
| 32 | 87033c10-3277-4663-8220-a9f3d4a227d4 | 周度关键词主表刷新 (GSC+Bing) | PAUSED | weekly MO 08:00 | BookConv SEO | 全 UNKNOWN |
| 33 | 6fc7d556-6a00-4c03-aced-92068e0cbeaa | AI应用社媒 安全Gate复测 | PAUSED | monthly 1日 09:00 | 社媒运营 | 全 UNKNOWN |
| 34 | e1681438-85c4-47a7-a654-264e8c0aeb70 | AI应用社媒 每周五选题规划 | PAUSED | weekly FR 21:00 | 社媒运营 | 全 UNKNOWN |
| 35 | 70daa99a-ac85-4622-bfc0-ff371dbd269e | AI应用社媒 每日数据自动化 | PAUSED | daily 21:00 | 社媒运营 | 全 UNKNOWN |
| 36 | 2acec35c-538c-4269-8ffa-b65eb4388c7c | AI应用社媒 每日热文监测 | PAUSED | daily 21:00 | 社媒运营 | 全 UNKNOWN |
| 37 | d5aba73b-a5be-47f7-894c-93e2447c5e4b | GEO 每日精选摘要 | PAUSED | daily 21:17 | BookConv GEO | 全 UNKNOWN |
| 38 | 41858df1-532a-4e20-a96c-092e17400ae9 | 每日独立站研究简报 | PAUSED | daily 21:15 | 研究 | 全 UNKNOWN |
| 39 | 8065136c-866d-4a27-8e51-79dcf9e01353 | 每日AI雷达简报 | PAUSED | daily 21:00 | 研究 | 全 UNKNOWN |
| 40 | 5fc7733d-8446-45e6-935d-ce11804eb34d | GA4 进阶分析 · 每日检查 | PAUSED | daily 09:00 | BookConv GA4 | 全 UNKNOWN |
| 41 | feffb8a1-598b-4c3e-9df5-a85deb9c3209 | GSC Query Data Weekly Fetch | PAUSED | weekly MO 09:00 | BookConv GSC | 全 UNKNOWN |
| 42 | 1d5da91c-afe5-4b31-929c-13392835767b | BookConv GA4 每日分析（ehermes 07:00） | PAUSED | daily 07:00 | BookConv GA4 | 全 UNKNOWN |
| 43 | f1ca7eb8-20c3-4647-98c9-8e0985f9dc47 | BookConv 审计整改逐日推进 | PAUSED | daily 07:10 | BookConv（G07 接线目标，11-17 PARTIAL） | 全 UNKNOWN |
| 44 | df830e94-d919-4487-930f-8d797a837811 | 公众号D7周复盘（Hermes技能桥） | PAUSED | weekly MO 09:00 | 公众号运营 | 全 UNKNOWN |

## 4. 标出的缺失项（授权令要求）
- **owner 缺失**：44 条全部 UNKNOWN_TOOL_CAPABILITY（工具不返回；无法据名称推断归属，不猜测）。
- **Task ID 缺失**：44 条全部 UNKNOWN（"归属线索"列仅为职责分类，不是 canonical Task ID）。
- **执行记录无法关联**：44 条全部 UNKNOWN（run_id/session_id/最近结果不可获取）。
- **已确认字段**：44 条的 id / 名称 / 状态 / 排程类型 / 排程表达式均已确认（来自实时 list）。

## 5. 可持续更新机制
`evidence/automation-current-20261121.json` 为机器可读当前清单。更新流程：重新调用 `automation_update(list)`，把 automations 数组写入该 JSON（更新 `_meta.captured_at`），运行 `python3 scripts/automation-mapping-recompute.mjs`? — 实际为 python：见同目录 `recompute` 命令（§6）。不覆盖本文件，历史清单按日期新建。

## 6. 复现命令
- 采集：`automation_update` mode=list（工具调用）。
- 核对：`python3 -c "import json,collections; a=json.load(open('docs/tasks/bookconv-ceo-remediation-20261121/evidence/automation-current-20261121.json',encoding='utf-8'))['automations']; ids=[x['id'] for x in a]; print(len(a), len(set(ids)), dict(collections.Counter(x['status'] for x in a)))"`
  - 预期输出：`44 44 {'ACTIVE': 28, 'PAUSED': 16}`。

## 7. 边界与残余
- 未暂停、未删除、未重建任何自动化（授权令硬性要求）——本次仅只读 list/view。
- owner/TaskID/run_id 类字段需平台提供导出口（或可访问 sqlite 且被授权读取）才能补齐；当前 BLOCKED 于工具能力，不虚构。
- 未把 11-15 历史快照冒充当前数据。

红队：L2 · 裁定 修正（口头误数 42→程序化 44；owner 等字段判为工具不可获取而非"确认为空"）· 回执 本文档 §1/§2。
